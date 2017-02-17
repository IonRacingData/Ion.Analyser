using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.SenSys
{
    public class SensorEventArgs : EventArgs
    {
        public RealSensorPackage Package { get; set; }
    }

    public interface ISensorReader
    {
        SensorPackage[] ReadPackages();
    }

    public class SensorDataStore
    {
        //List<SensorPackage> allPackages = new List<SensorPackage>();
        Dictionary<int, List<RealSensorPackage>> indexedPackages = new Dictionary<int, List<RealSensorPackage>>();
        public event EventHandler<SensorEventArgs> DataReceived;
        public Dictionary<string, Type> ReaderLinker { get; } = new Dictionary<string, Type>();
        public List<string> SensorLocations { get; private set; } = new List<string>();

        public const string SensorFile = "Sensors/Sensor.json";
        public const string SensorInfoFile = "Sensors/SensorInfo.json";

        static Singelton<SensorDataStore> instance = new Singelton<SensorDataStore>();
        public static SensorDataStore GetDefault()
        {
            return instance.Value;
        }

        List<SensorInformation> sensorInformations = new List<SensorInformation>();

        Dictionary<int, SensorInformation> sensorIdMapping = new Dictionary<int, SensorInformation>();
        Dictionary<string, SensorInformation> sensorKeyMapping = new Dictionary<string, SensorInformation>();

        public void LoadNewData(string file)
        {
            FileInfo fi = new FileInfo(file);
            if (fi.Exists)
            {
                string ext = fi.Extension.Remove(0, 1);
                if (ReaderLinker.ContainsKey(ext))
                {
                    indexedPackages.Clear();
                    ISensorReader reader = GetSensorReader(fi.FullName);
                    this.AddRange(reader.ReadPackages());
                }
                else
                {
                    Console.WriteLine("dose not support: " + ext);
                }
                

            }
            else
            {
                Console.WriteLine("The file: " + fi.FullName + " does not exist");
            }
        }

        public string CreateCsv(bool norFormat, bool includeTitle)
        {
            char seperator = ',';
            IFormatProvider provider = NumberFormatInfo.InvariantInfo;
            if (norFormat)
            {
                seperator = ';';
                provider = new CultureInfo("no-NB");
            }
            int largestDataSet = 0;
            StringBuilder sb = new StringBuilder();
            List<List<RealSensorPackage>> allValues = new List<List<RealSensorPackage>>();
            foreach(KeyValuePair<int, List<RealSensorPackage>> pair in indexedPackages)
            {
                string name = "Unknown (" + pair.Key.ToString() + ")";
                if (sensorIdMapping.ContainsKey(pair.Key))
                {
                    SensorInformation si = sensorIdMapping[pair.Key];
                    name = si.Name;
                }
                if (includeTitle) sb.Append(name + seperator);
                largestDataSet = Math.Max(largestDataSet, pair.Value.Count);
                allValues.Add(pair.Value);
            }
            if (includeTitle) sb.AppendLine();
            for (int i = 0; i < largestDataSet; i++)
            {
                for (int j = 0; j < allValues.Count; j++)
                {
                    sb.Append((allValues[j].Count > i ? allValues[j][i].Value.ToString(provider) : "") + seperator);
                }
                sb.AppendLine();
            }
            return sb.ToString();
        }

        public ISensorReader GetSensorReader(string file, params object[] extraParam)
        {
            FileInfo fi = new FileInfo(file);
            if (!fi.Exists)
                return null;
            string ext = fi.Extension.Remove(0, 1);
            if (ReaderLinker.ContainsKey(ext))
            {
                List<object> constr = new List<object>();
                constr.Add(file);
                constr.AddRange(extraParam);
                ISensorReader reader = (ISensorReader)Activator.CreateInstance(GetDefault().ReaderLinker[ext], constr.ToArray());
                return reader;
            }
            else
            {
                throw new Exception("The file extension " + ext + " is not supported");
            }
        }

        public ISensorReader[] GetSensorReader(string[] files)
        {
            ISensorReader[] readers = new ISensorReader[files.Length];
            for (int i = 0; i < files.Length; i++)
            {
                readers[i] = GetSensorReader(files[i]);
            }
            return readers;
        }

        public SensorSetInformation[] AvailableDataSets()
        {
            List<SensorSetInformation> allFiles = new List<SensorSetInformation>();

            foreach (string s in SensorLocations)
            {
                DirectoryInfo di = new DirectoryInfo(s);
                if (!di.Exists)
                {
                    Console.WriteLine("Directory dose not exist: " + di.FullName);
                    continue;
                }
                FileInfo[] files = di.GetFiles();

                foreach (FileInfo fi in files)
                {
                    string fileReader = "Unsuported";
                    string ext = fi.Extension.Remove(0, 1);
                    if (ReaderLinker.ContainsKey(ext))
                    {
                        fileReader = ReaderLinker[ext].Name;
                    }
                    allFiles.Add(new SensorSetInformation()
                    {
                        FileName = fi.Name,
                        FullFileName = fi.FullName,
                        Size = fi.Length,
                        FileReader = fileReader
                    });
                }
            }
            return allFiles.ToArray();
        }

        public void LoadSensorInformation()
        {
            FileInfo sensorFile = new FileInfo(SensorFile);
            FileInfo sensorInfoFile = new FileInfo(SensorInfoFile);
            if (sensorFile.Exists)
            {
                this.SensorInfoAddRange(JSONObject.Parse(File.ReadAllText(sensorFile.FullName)).ToArray<SensorInformation[]>());
            }
            else
            {
                throw new FileNotFoundException("Sensor.json was not found");
            }
            if (sensorInfoFile.Exists)
            {
                SensorValueInformation[] senVal = JSONObject.Parse(File.ReadAllText(sensorInfoFile.FullName)).ToArray<SensorValueInformation[]>();
                foreach (SensorValueInformation sv in senVal)
                {
                    if (sensorKeyMapping.ContainsKey(sv.Key))
                    {
                        sensorKeyMapping[sv.Key].ValueInfo = sv;
                    }
                    else
                    {
                        Console.WriteLine("Could not find sensor with key: " + sv.Key);
                    }
                }
            }
            else
            {
                throw new FileNotFoundException("SensorInfo.json was not found");
            }
        }

        private void SensorInfoAddRange(IEnumerable<SensorInformation> infos)
        {
            foreach (SensorInformation si in infos)
            {
                sensorInformations.Add(si);
                sensorKeyMapping[si.Key] = si;
                sensorIdMapping[si.ID] = si;
            }
        }

        public RealSensorPackage Add(SensorPackage data)
        {
            if (!indexedPackages.ContainsKey(data.ID))
            {
                indexedPackages[data.ID] = new List<RealSensorPackage>();
            }
            RealSensorPackage temp = RealSensorPackage.Convert(data);
            if (sensorIdMapping.ContainsKey(data.ID))
            {
                SensorInformation info = sensorIdMapping[data.ID];
                if (info.ValueInfo == null)
                    throw new Exception("Missing ValueInfo for package: " + info.ID.ToString() + ", " + info.Key + ", " + info.Name);
                temp.Value = info.ValueInfo.ConvertValue((long)temp.Value);
            }
            indexedPackages[data.ID].Add(temp);
            return temp;
        }

        public void AddRange(IEnumerable<SensorPackage> sensorPackage)
        {
            foreach (SensorPackage package in sensorPackage)
            {
                Add(package);
            }
        }

        public SensorPackageViewModel[] GetViews(int id)
        {
            if (!indexedPackages.ContainsKey(id))
                return null;
            List<SensorPackageViewModel> allViews = new List<SensorPackageViewModel>();
            /*foreach (SensorPackage sp in indexedPackages[id])
            {
                allViews.Add(sp.GetObject());
            }*/
            return allViews.ToArray();
        }

        public byte[] GetBinaryData(int id)
        {
            if (!indexedPackages.ContainsKey(id))
                return null;
            List<byte> allViews = new List<byte>();
            foreach (RealSensorPackage sp in indexedPackages[id])
            {
                allViews.AddRange(sp.GetBinary());
            }
            return allViews.ToArray();
        }

        public RealSensorPackage[] GetPackages(int id)
        {
            return indexedPackages[id].ToArray();
        }

        public SensorInformation[] GetIds()
        {
            return sensorInformations.ToArray();
        }

        public int[] GetLoadedIds()
        {
            return indexedPackages.Keys.ToArray();
        }

        public void AddLive(SensorPackage pack)
        {
            RealSensorPackage rsp = this.Add(pack);
            OnDataReceived(rsp);
        }

        public void OnDataReceived(RealSensorPackage package)
        {
            DataReceived?.Invoke(this, new SensorEventArgs() { Package = package });
        }
    }
}
