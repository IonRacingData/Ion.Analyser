using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Net = System.Net;
using System.Text;
using System.Threading.Tasks;
using Ion.Pro.Analyser.Data;
using Ion.Pro.Analyser.SenSys;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using Ion.Pro.Analyser.Web;
using Ion.Pro.Analyser.Controllers;
using NicroWare.Pro.RPiSPITest;

namespace Ion.Pro.Analyser
{
    enum RunMode
    {
        OffLine,
        LiveTest,
        LiveTestSin,
        LiveTestLegacy,
        SmallTest
    }

    

    class Program
    {
        static RunMode runMode = RunMode.OffLine;
        public static bool liveSim = false;

        public static SensorDataStore Store { get; private set; } = SensorDataStore.GetDefault();
        static byte[] GetLegacyFormat(SensorPackage pack)
        {
            return new byte[]
            {
                (byte)(pack.ID >> 0),
                (byte)(pack.ID >> 8),
                (byte)(pack.Value >> 0),
                (byte)(pack.Value >> 8),
                (byte)(pack.Value >> 16),
                (byte)(pack.Value >> 24),
                (byte)(pack.TimeStamp >> 0),
                (byte)(pack.TimeStamp >> 8),
                (byte)(pack.TimeStamp >> 16),
                (byte)(pack.TimeStamp >> 24),
            };
        }
        public static string plinkPath;
        public static LegacySSHManager rpiManager { get; private set; }

        static string[] files = new string[]
        {
            "../../Data/sinus.log16",
            "../../Data/Sets/126_usart_data.log16",
            "../../Data/freq.log16",
            "../../Data/stiangps.gpx",
            "../../Data/fredrikgps.gpx"
        };

        static void Main(string[] args)
        {
            //manager.Load("../../Data/Sets/126_usart_data.log16");
            try
            {
                plinkPath = LegacyPIService.TryFindPlink();
                if (plinkPath != null)
                {
                    rpiManager = new LegacySSHManager(plinkPath);
                    //rpiManager.Connect();
                    //Console.ReadLine();
                }
            }
            catch
            {
                Console.WriteLine("PLink not available");
            }
            Console.WriteLine("Ion Analyser Server");
            try
            {
                InitSenSys();
                InitSensorStore();
                //InsertSensorTestData();
                if (liveSim)
                {
                    Task.Run(() => DataInserter("../../Data/Sets/195_usart_data.log16"));
                }
                Task.Run(() => InsertTelemetryData());
                IonAnalyserWebPage.Run();
            }
            catch (Exception e)
            {
                Console.WriteLine("Ohh no, something horrible went wrong");
                Console.WriteLine(e);
            }
            bool avaiableRead = true;
            try
            {
                Console.Read();
            }
            catch
            {
                avaiableRead = false;
            }

            if (!avaiableRead)
            {
                Console.CancelKeyPress += Console_CancelKeyPress;
                do
                {
                    System.Threading.Thread.Sleep(1000);
                }
                while (!exit);
            }
        }

        static bool exit = false;

        private static void Console_CancelKeyPress(object sender, ConsoleCancelEventArgs e)
        {
            exit = true;
        }

        static void InitSenSys()
        {
            SensorManager manager = SensorManager.GetDefault();
            manager.RegisterFileProvider("log16", new LegacySensorProvider());
            manager.RegisterFileProvider("log", new LegacySensorProvider());
            manager.RegisterFileProvider("gpscsv", new GPSCSVSensorProvider());
            manager.RegisterFileProvider("log17", new Sensor2017Provider());
            ComBus.GetDefault().RegisterClient(new NewSensorComService(manager));
        }

        static void CreateSinData()
        {
            SensorPackage pack = new SensorPackage();
            BinaryWriter bw = new BinaryWriter(new FileStream("../../Data/sinus.log16", FileMode.Create));
            for (int i = 0; i < 100000; i++)
            {
                pack = new SensorPackage() { ID = 42, TimeStamp = i * 10, Value = (byte)((Math.Sin(i / 20.0) + 1) * 127) };
                bw.Write(GetLegacyFormat(pack));
                pack = new SensorPackage() { ID = 43, TimeStamp = i * 10, Value = (sbyte)(Math.Sin(i / 20.0) * 127) };
                bw.Write(GetLegacyFormat(pack));
                pack = new SensorPackage() { ID = 44, TimeStamp = i * 10, Value = (byte)((Math.Cos(i / 20.0) + 1) * 127) };
                bw.Write(GetLegacyFormat(pack));


                /*
                pack = new SensorPackage() { ID = 42, TimeStamp = i * 10, Value = (byte)((Math.Sin(i / 20.0) + 1) * 127) };
                bw.Write(GetLegacyFormat(pack));
                pack = new SensorPackage() { ID = 43, TimeStamp = i * 10, Value = (byte)((Math.Sin((i / 20.0) + (Math.PI * 2 / 3)) + 1) * 127) };
                bw.Write(GetLegacyFormat(pack));
                pack = new SensorPackage() { ID = 44, TimeStamp = i * 10, Value = (byte)((Math.Sin((i / 20.0) + (Math.PI * 4 / 3)) + 1) * 127) };
                bw.Write(GetLegacyFormat(pack));*/

            }
            bw.Close();
        }

        static void InitSensorStore()
        {
            Store.SensorLocations.Add("../../Data/Sets");
            Store.SensorLocations.Add(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "DataLog"));

            SensorDataStore.GetDefault().ReaderLinker.Add("log", typeof(LegacySensorReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("log16", typeof(LegacySensorReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("gpscsv", typeof(GPSDataReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("gpx", typeof(GPXDataReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("log17", typeof(Sensor2017Reader));

        }

        static void InsertTelemetryData()
        {
            Console.WriteLine("Startert listening");

            try
            {
                NRFRadio baseRadio = new NRFRadio();
                Console.WriteLine(baseRadio.Begin());
                baseRadio.SetPALevel(RF24PaDbm.RF24_PA_HIGH);
                baseRadio.SetDataRate(RF24Datarate.RF24_250KBPS);
                baseRadio.SetRetries(0, 0);
                baseRadio.SetAutoAck(false);
                baseRadio.OpenReadingPipe(0, "00001");
                baseRadio.OpenWritingPipe("00001");
                baseRadio.StartListening();
                int a = 0;
                while (true)
                {
                    if (!baseRadio.Available())
                    {
                        Thread.Yield();
                    }
                    while (true)
                    {
                        byte[] buffer = new byte[30];
                        baseRadio.Read(buffer, 30);
                        if (buffer[0] == 0 && buffer[1] == 0)
                        {
                            Thread.Yield();
                        }
                        else
                        {
                            SensorPackage pack = ParseBytes(buffer);
                            SensorManager.GetDefault().AddLive("telemetry", pack);
                            break;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Failed to open telemetry");
                Console.WriteLine(e);
            }
        }

        static SensorPackage ParseBytes(byte[] bytes)
        {
            SensorPackage pack = new SensorPackage();
            pack.ID = BitConverter.ToUInt16(bytes, 0);
            pack.Value = BitConverter.ToUInt32(bytes, 2);
            pack.TimeStamp = BitConverter.ToUInt32(bytes, 6);
            return pack;
        }

        static void InsertSensorTestData()
        {
            List<ISensorReader> readers = new List<ISensorReader>();
            readers.Add(Store.GetSensorReader("../../Data/GPS_DataFile.gpscsv", 2, 2));


            readers.AddRange(Store.GetSensorReader(files));
            ComBus.GetDefault().RegisterClient(new SensorComService());

            SensorDataStore store = SensorDataStore.GetDefault();
            store.LoadSensorInformation();
            switch (runMode)
            {
                case RunMode.OffLine:
                    foreach (ISensorReader reader in readers)
                    {
                        if (reader == null)
                            continue;
                        store.AddRange(reader.ReadPackages());
                    }
                    break;
                case RunMode.LiveTest:
                    Task.Run(() => DataInserter("../../Data/Sets/126_usart_data.log16"));
                    break;
                case RunMode.LiveTestSin:
                    Task.Run(() => DataInserter("../../Data/sinus.log16"));
                    break;
                case RunMode.SmallTest:
                    store.Add(new SensorPackage() { ID = 1, Value = 1, TimeStamp = 1 });
                    store.Add(new SensorPackage() { ID = 2, Value = 5, TimeStamp = 1 });
                    store.Add(new SensorPackage() { ID = 3, Value = 10, TimeStamp = 1 });
                    store.Add(new SensorPackage() { ID = 1, Value = 6, TimeStamp = 2 });
                    store.Add(new SensorPackage() { ID = 2, Value = 10, TimeStamp = 2 });
                    store.Add(new SensorPackage() { ID = 3, Value = 100, TimeStamp = 2 });
                    store.Add(new SensorPackage() { ID = 1, Value = 100, TimeStamp = 3 });
                    store.Add(new SensorPackage() { ID = 2, Value = 2, TimeStamp = 3 });
                    store.Add(new SensorPackage() { ID = 3, Value = 1000, TimeStamp = 3 });
                    break;
                case RunMode.LiveTestLegacy:
                    Task.Run(() => LegacyPIService.ReadLegacyTelemetry());
                    break;
            }
        }


        static void DataInserter(string file)
        {
            System.Threading.Thread.Sleep(2000);
            DateTime begin = DateTime.Now;
            ISensorReader reader = Store.GetSensorReader(file);
            //ISensorReader reader = new LegacySensorReader("../../Data/freq.iondata");
            SensorPackage[] all = reader.ReadPackages();
            int i = 0;
            try
            {
                while (i < all.Length - 1)
                {
                    //Console.WriteLine("Tick");
                    SensorPackage pack = all[i];
                    //pack.TimeStamp *= 1000;
                    SensorManager.GetDefault().AddLive("telemetry", pack);
                    //SensorDataStore.GetDefault().AddLive(pack);
                    //Console.WriteLine("At: " + pack.TimeStamp.ToString());
                    int time = (int)(all[i + 1].TimeStamp - all[i].TimeStamp);
                    if (time < 0)
                    {
                        Console.WriteLine("Less then null detected");
                        time = 0;
                    }
                    Thread.Sleep(time);
                    i++;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }

    class LegacySSHManager
    {
        public string plinkPath { get; private set; }
        public string IPAddress { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        List<string> readBuffer = new List<string>();
        StreamWriter stdIn;
        StreamReader stdOut;
        public bool Connected { get; private set; } = false;
        Task readTask;
        bool continueRead = true;

        public LegacySSHManager(string plinkPath)
        {
            this.plinkPath = plinkPath;
            IPAddress = "10.0.0.3";
            username = "pi";
            password = "raspberry";

        }

        public void Connect()
        {
            if (!Connected)
            {
                string connectString = $"{username}@{IPAddress}";
                ProcessStartInfo startInfo = new ProcessStartInfo(plinkPath, connectString);
                startInfo.RedirectStandardInput = true;
                startInfo.RedirectStandardOutput = true;
                startInfo.RedirectStandardError = true;
                startInfo.UseShellExecute = false;

                Process p = new Process();
                p.StartInfo = startInfo;
                bool success = p.Start();
                stdIn = p.StandardInput;
                stdOut = p.StandardOutput;
                Stopwatch watch = new Stopwatch();
                watch.Start();
                bool timeout = false;
                readCanceled = new CancellationTokenSource();
                readTask = ReadInput(stdOut);
                while (readBuffer.Count < 1)
                {
                    if (watch.ElapsedMilliseconds > 5000)
                    {
                        timeout = true;
                        break;
                    }
                    System.Threading.Thread.Yield();
                }
                watch.Stop();
                if (!timeout)
                {
                    Connected = true;
                    //readTask = ReadInput();
                    stdIn.WriteLine(password);
                }
                else
                {
                    readCanceled.Cancel(true);
                    Console.WriteLine("Connect to RPI Timed out, please check ip settings");
                    stdIn.WriteLine((char)3);
                }
            }
        }
        CancellationTokenSource readCanceled = new CancellationTokenSource();

        private async Task ReadInput(StreamReader stdOut)
        {
            while (continueRead)
            {
                byte[] readBuffer = new byte[1024];
                int read = 0;
                try
                {
                    read = await stdOut.BaseStream.ReadAsync(readBuffer, 0, 1024, readCanceled.Token);
                }
                catch (Exception e)
                {

                }
                if (readCanceled.IsCancellationRequested)
                    break;
                List<byte> removedOtherChars = new List<byte>();
                string s = Encoding.Default.GetString(readBuffer, 0, read);
                Console.Write(s);
                this.readBuffer.Add(s);
            }
        }

        public void StartReceive()
        {
            if (Connected)
            {
                stdIn.WriteLine("sudo ./start");
            }
        }

        public void Stop()
        {
            //System.Threading.Thread.Sleep(5000);
            stdIn.WriteLine((char)3);
        }

    }

    public class LegacyPIService
    {
        public static void ReadLegacyTelemetry()
        {
            UdpClient client = new UdpClient(16300);
            DateTime startTime = DateTime.Now;
            while (true)
            {
                Net.IPEndPoint endPoint = new Net.IPEndPoint(Net.IPAddress.Any, 0);
                byte[] bytes = client.Receive(ref endPoint);

                for (int i = 0; i < bytes.Length; i += 6)
                {
                    SensorPackage package = new SensorPackage();
                    package.ID = BitConverter.ToUInt16(bytes, i);
                    package.Value = BitConverter.ToInt32(bytes, i + 2);
                    package.TimeStamp = (long)(DateTime.Now - startTime).TotalMilliseconds;
                    SensorDataStore.GetDefault().AddLive(package);
                }
            }
        }

        public static string TryFindPlink()
        {
            string[] searchPaths = new[] {
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles)
        };

            foreach (string s in searchPaths)
            {
                DirectoryInfo di = new DirectoryInfo(s);
                DirectoryInfo[] dis = di.GetDirectories("putty");
                if (dis.Length > 0)
                {
                    FileInfo fi = dis[0].GetFiles("plink.exe").FirstOrDefault();
                    if (fi != null)
                    {
                        Console.WriteLine("Found plink: " + fi.FullName);
                        return fi.FullName;
                    }
                }
            }
            return null;
        }
    }

    public class NewSensorComService : ComBusClient
    {
        List<RealSensorPackage> SendCache = new List<RealSensorPackage>();
        DateTime lastSend = new DateTime();
        SensorManager manager;

        public NewSensorComService(SensorManager manager)
        {
            this.manager = manager;
            this.manager.DataReceived += SensorManager_DataReceived;
            this.manager.TelemetryStart += Manager_TelemetryStart;
        }

        private void Manager_TelemetryStart(object sender, DataSetEventArgs e)
        {
            ComBus.SendMessage(new ComMessage()
            {
                MessageId = 10,
                Status = (int)ComMessageStatus.Request110,
                Path = "/sensor/start",
                NodeId = this.Id,
                Data = JSONObject.Create(SensorDataSetInformation.FromSensorDataSet(e.DataSet)).ToJsonString()
            });
        }

        private void SensorManager_DataReceived(object sender, SensorEventArgs e)
        {
            DateTime current = DateTime.Now;
            SendCache.Add(e.Package);
            if ((current - lastSend).TotalMilliseconds > 100)
            {
                List<byte> allBytes = new List<byte>();
                foreach (RealSensorPackage sp in SendCache)
                {
                    allBytes.AddRange(sp.GetBinary());
                }
                SendCache.Clear();
                ComBus.SendMessage(new ComMessage()
                {
                    MessageId = 10,
                    Status = (int)ComMessageStatus.Request110,
                    Path = "/sensor/update",
                    NodeId = this.Id,
                    Data = JSONObject.Create(new { Sensors = Convert.ToBase64String(allBytes.ToArray()) }).ToJsonString()
                });

                lastSend = current;
            }
        }

        public override void ReceiveMessage(ComMessage message)
        {
            string[] parts = message.Path.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts[0] == "sensor")
            {
                if (parts[1] == "getdata")
                {
                    SensorNumPackage package = message.ReadData<SensorNumPackage>();
                    manager.Load(package.dataset);
                    ComBus.ReplayMessage(new { Sensors = Convert.ToBase64String(manager.GetBinaryData(package.dataset, package.num)) }, message, this);
                }
            }
        }
    }

    public class SensorNumPackage
    {
        public string dataset { get; set; }
        public int num { get; set; }
    }

    public class SensorComService : ComBusClient
    {
        public SensorComService()
        {
            SensorDataStore.GetDefault().DataReceived += SensorComService_DataReceived;
        }

        List<RealSensorPackage> SendCache = new List<RealSensorPackage>();

        DateTime lastSend = new DateTime();

        private void SensorComService_DataReceived(object sender, SensorEventArgs e)
        {
            DateTime current = DateTime.Now;
            SendCache.Add(e.Package);
            if ((current - lastSend).TotalMilliseconds > 100)
            {
                List<byte> allBytes = new List<byte>();
                foreach (RealSensorPackage sp in SendCache)
                {
                    allBytes.AddRange(sp.GetBinary());
                }
                SendCache.Clear();
                ComBus.SendMessage(new ComMessage()
                {
                    MessageId = 10,
                    Status = (int)ComMessageStatus.Request110,
                    Path = "/sensor/update",
                    NodeId = this.Id,
                    Data = JSONObject.Create(new { Sensors = Convert.ToBase64String(allBytes.ToArray()) }).ToJsonString()
                });
                
                lastSend = current;
            }
            
        }

        public override void ReceiveMessage(ComMessage message)
        {
            string[] parts = message.Path.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts[0] == "sensor")
            {
                if (parts[1] == "getdata")
                {
                    SensorNumPackage package = message.ReadData<SensorNumPackage>();
                    ComBus.ReplayMessage(new { Sensors = Convert.ToBase64String(SensorDataStore.GetDefault().GetBinaryData(package.num)) }, message, this);
                }
            }
        }
    }
}
