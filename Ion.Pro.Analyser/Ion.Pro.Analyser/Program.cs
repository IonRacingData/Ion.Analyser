using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Net = System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Ion.Pro.Analyser.Data;
using Ion.Pro.Analyser.SenSys;

namespace Ion.Pro.Analyser
{
    enum RunMode
    {
        OffLine,
        LiveTest,
        SmallTest
    }

    class Program
    {
        static Dictionary<string, Type> controllers = new Dictionary<string, Type>();
        static RunMode runMode = RunMode.LiveTest;
        static string DefaultAction = "index";
        static string DefaultPath = "/home/index";
        //public static string ContentPath = "../../Content/";
        public static string ContentPath = "../../../Ion.Web.AnalyserDesktop/";
        //public static string ContentPath = "html/";
        public static SensorDataStore Store { get; private set; } = SensorDataStore.GetDefault();

        static string[] files = new string[]
        {
            "../../Data/Sets/126_usart_data.log16",
            "../../Data/freq.log16",
            "../../Data/stiangps.gpx",
            "../../Data/fredrikgps.gpx"
        };

        static void Main(string[] args)
        {
            
            Console.WriteLine("Ion Analyser Server");
            try
            {
                InitSensorStore();
                InsertSensorTestData();
                InitControllers();
                HttpServer server = new HttpServer();
                server.Bind(Net.IPAddress.Any, 4562, WebHandlerAsync);
            }
            catch (Exception e)
            {
                Console.WriteLine("Ohh no, something horrible went wrong");
                Console.WriteLine(e);
            }
            Console.Read();
        }

        static void InitSensorStore()
        {
            Store.SensorLocations.Add("../../Data/Sets");
            Store.SensorLocations.Add(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "DataLog"));

            SensorDataStore.GetDefault().ReaderLinker.Add("log", typeof(LegacySensorReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("log16", typeof(LegacySensorReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("gpscsv", typeof(GPSDataReader));
            SensorDataStore.GetDefault().ReaderLinker.Add("gpx", typeof(GPXDataReader));

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
                    Task.Run(() => DataInserter());
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
            }
        }



        static void DataInserter()
        {
            DateTime begin = DateTime.Now;
            ISensorReader reader = Store.GetSensorReader("../../Data/Sets/126_usart_data.log16");
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
                    SensorDataStore.GetDefault().AddLive(pack);
                    //Console.WriteLine("At: " + pack.TimeStamp.ToString());
                    System.Threading.Thread.Sleep((int)(all[i + 1].TimeStamp - all[i].TimeStamp));
                    i++;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        static HttpAction testAction = null;
        static SessionService service = new SessionService();

        public static async Task WebHandlerAsync(HttpWrapper wrapper)
        {
            wrapper.Watch.Mark("Entered handler");
            ProtocolReader reader = new ProtocolReader(wrapper.Client.GetStream());

            TimingService Watch = wrapper.Watch;

            HttpHeaderRequest request = await Task.Run(() => HttpHeaderRequest.ReadFromProtocolReader(reader));
            Watch.Mark("Read and parsed http");
            HttpHeaderResponse response = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            HttpContext context = new HttpContext() { Request = request, Response = response, Wrapper = wrapper };

            HandleSession(context);

            Watch.Mark("Handle Session");

            HandleContext(context, Watch);
        }

        private static void HandleSession(HttpContext context)
        {
            Session s;
            if (context.Request.Cookies.ContainsKey(SessionService.sessionKey))
            {
                s = service.GetOrCreate(context.Request.Cookies[SessionService.sessionKey]);
            }
            else
            {
                s = service.CreateSession();
                context.Response.SetCookie.Add(new HttpCookie() { Key = SessionService.sessionKey, Value = s.Key });
            }
            context.Session = s;
        }

        private static void HandleContext(HttpContext context, TimingService Watch)
        {
            Stream s = context.Wrapper.Client.GetStream();
            Watch.Mark("Got stream");

            IActionResult result = HandleResult(context, Watch);
            Watch.Mark("Finished handling request");

            Task t = result.ExecuteResultAsync(new ActionContext() { HttpContext = context });
            t.Wait();
            Watch.Mark("Finished Result run");

            byte[] data = context.Response.GetBytes();
            s.Write(data, 0, data.Length);
            
            s.Flush();
            Watch.Stop();
            if (context.Wrapper.PreventClose)
            {
                context.SocketHandler?.Invoke(context);
            }
            else
            {
                s.Close();
                context.Wrapper.Client.Close();

                Console.WriteLine($"Request \"{context.Request.FullRelativePath}\" handled in: {Watch.Watch.ElapsedTicks / 10}µs");

                bool printTimes = false;
                if (printTimes)
                {
                    PrintTimes(Watch);
                }
            }

        }

        private static IActionResult HandleResult(HttpContext context, TimingService Watch)
        {
            string requestPath = context.Request.RelativePath;
            FileInfo fi = null;
            try
            {
                fi = new FileInfo(Path.Combine(ContentPath, context.Request.RelativePath.Remove(0, 1)));
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            IActionResult result;
            Watch.Mark("Prepared variables");
            if (fi.Exists)
            {
                result = new FileResult(fi.FullName);
                Watch.Mark("Created File Result");
            }
            else
            {
                context.Response.ContentType = MimeTypes.GetMimeType(".html");

                //{Controller}/{Action}
                string[] requestParts = (requestPath.Length == 1 ? DefaultPath : requestPath ).Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);

                if (requestParts.Length > 0 && controllers.ContainsKey(requestParts[0].ToLower()))
                {
                    string requestAction = (requestParts.Length > 1) ? requestParts[1].ToLower() : DefaultAction;

                    Controller temp = (Controller)Activator.CreateInstance(controllers[requestParts[0].ToLower()]);
                    temp.HttpContext = context;

                    result = InvokeAction(temp, temp.AllActions[requestAction], context);
                    
                    //result = ((HttpAction)temp.AllActions[requestAction].CreateDelegate(typeof(HttpAction), temp))();
                    Watch.Mark("Created Http Action Result");
                }
                else
                {
                    result = new ErrorResult(HttpStatus.NotFound404, "");
                    Watch.Mark("Created Error Result");
                }
            }
            return result;
        }

        private static IActionResult InvokeAction(Controller controller, MethodInfo info, HttpContext context)
        {
            List<object> allData = new List<object>();
            ParameterInfo[] param = info.GetParameters();
            foreach (ParameterInfo paramInfo in param)
            {
                string name = paramInfo.Name;
                if (context.Request.GETParameters.ContainsKey(name))
                {
                    allData.Add(context.Request.GETParameters[name]);
                }
                else
                {
                    allData.Add(null);
                }
            }
            return (IActionResult)info.Invoke(controller, allData.ToArray());
        }

        private static void PrintTimes(TimingService Watch)
        {
            long lastTime = 0;
            StringBuilder builder = new StringBuilder();
            foreach (Tuple<long, string> record in Watch.Records)
            {
                builder.AppendLine($"\t{record.Item1 / 10.0}µs (+{(record.Item1 - lastTime) / 10.0}µs) {record.Item2}");
                lastTime = record.Item1;
            }
            Console.WriteLine(builder.ToString());
        }

        public static string[] ReadHttp(ProtocolReader reader)
        {
            string currentLine = "";
            List<string> allLines = new List<string>();
            while ((currentLine = reader.ReadLine()).Length > 0)
            {
                allLines.Add(currentLine);
            }
            return allLines.ToArray();
        }

        static void InitControllers()
        {
            Assembly[] allAssembly = AppDomain.CurrentDomain.GetAssemblies();
            foreach (Assembly a in allAssembly)
            {
                Type[] types = a.GetTypes();
                foreach (Type t in types)
                {
                    if (typeof(Controller).IsAssignableFrom(t) && t != typeof(Controller))
                    {
                        string name = t.Name.Replace("Controller", "").ToLower();
                        controllers.Add(name, t);
                    }
                }
            }
        }
    }

    public class SensorNumPackage
    {
        public int num { get; set; }
    }

    public class SensorComService : ComBusClient
    {
        public SensorComService()
        {
            SensorDataStore.GetDefault().DataReceived += SensorComService_DataReceived;
        }

        List<SensorPackage> SendCache = new List<SensorPackage>();

        DateTime lastSend = new DateTime();

        private void SensorComService_DataReceived(object sender, SensorEventArgs e)
        {
            DateTime current = DateTime.Now;
            SendCache.Add(e.Package);
            if ((current - lastSend).TotalMilliseconds > 100)
            {
                List<byte> allBytes = new List<byte>();
                foreach (SensorPackage sp in SendCache)
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
