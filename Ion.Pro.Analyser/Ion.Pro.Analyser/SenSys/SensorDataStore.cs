using Ion.Pro.Analyser.Data;
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

    public class DataSetEventArgs : EventArgs
    {
        public SensorDataSet DataSet { get; set; }
    }

    public interface ISensorReader
    {
        SensorPackage[] ReadPackages();
    }

    public class SensorDataSet
    {
        public string Name { get; set; }
        public ISensorReaderProvider Provider { get; private set; }
        public Dictionary<string, NewSensorInformation> AllInfos { get; } = new Dictionary<string, NewSensorInformation>();
        public Dictionary<int, string> IdKeyMap { get; } = new Dictionary<int, string>();
        public Dictionary<string, List<RealSensorPackage>> AllData { get; } = new Dictionary<string, List<RealSensorPackage>>();

        public SensorDataSet(string filename, ISensorReaderProvider provider)
        {
            this.Name = filename;
            this.Provider = provider;
        }

        private void LoadInformation()
        {
            KeyIDSensorInformation[] map = JSONObject.Parse(File.ReadAllText(Provider.KeyIDMapPath)).ToArray<KeyIDSensorInformation[]>();
            CalibrationSensorInformation[] cals = JSONObject.Parse(File.ReadAllText(Provider.CalibrationFilePath)).ToArray<CalibrationSensorInformation[]>();
            foreach (KeyIDSensorInformation keyId in map)
            {
                AllInfos[keyId.Key] = new NewSensorInformation(keyId);
                IdKeyMap[keyId.ID] = keyId.Key;
            }
            foreach (CalibrationSensorInformation cal in cals)
            {
                if (AllInfos.ContainsKey(cal.Key))
                {
                    AllInfos[cal.Key].AddInformation(cal);
                }
            }
        }

        public void SetNames(SensorManager manager)
        {
            foreach(KeyValuePair<string, NewSensorInformation> pair in AllInfos)
            {
                if (manager.SensorDisplayInformation.ContainsKey(pair.Key))
                {
                    pair.Value.AddInformation(manager.SensorDisplayInformation[pair.Key]);
                }
            }
        }

        public RealSensorPackage Add(SensorPackage pack)
        {
            string key = pack.ID.ToString();
            RealSensorPackage realPack;
            if (!IdKeyMap.ContainsKey(pack.ID))
                IdKeyMap.Add(pack.ID, pack.ID.ToString());
            key = IdKeyMap[pack.ID];
            if (AllInfos.ContainsKey(key))
            {
                realPack = new RealSensorPackage()
                {
                    ID = pack.ID,
                    TimeStamp = pack.TimeStamp,
                    AbsoluteTimeStamp = pack.AbsoluteTimeStamp,
                    Value = AllInfos[key].ConvertValue(pack.Value)
                };
            }
            else
            {
                realPack = RealSensorPackage.Convert(pack);
            }

            if (!AllData.ContainsKey(key))
            {
                AllData[key] = new List<RealSensorPackage>();
            }
            AllData[key].Add(realPack);
            return realPack;
        }

        public void Load(bool isFile = true)
        {
            LoadInformation();
            if (isFile)
            {
                ISensorReader reader = Provider.GetSensorReader(Name);

                SensorPackage[] packages = reader.ReadPackages();
                foreach (SensorPackage pack in packages)
                {
                    this.Add(pack);
                }
            }
        }

        public byte[] GetBinaryData(int id)
        {
            if (IdKeyMap.ContainsKey(id))
            {
                return GetBinaryData(IdKeyMap[id]);
            }
            else if (AllData.ContainsKey(id.ToString()))
            {
                return GetBinaryData(id.ToString());
            }
            return new byte[0];
        }

        public byte[] GetBinaryData(string key)
        {
            List<byte> allBytes = new List<byte>();
            if (AllData.ContainsKey(key))
            {
                foreach (RealSensorPackage rsp in AllData[key])
                {
                    allBytes.AddRange(rsp.GetBinary());
                }
            }
            return allBytes.ToArray();
        }
    }

    public interface ISensorInfoProvider
    {
        string KeyIDMapPath { get; }
        string CalibrationFilePath { get; }
    }

    public interface ISensorProvider : ISensorReaderProvider
    {
        string[] AvailableDataSets();
    }

    public interface ISensorReaderProvider : ISensorInfoProvider
    {
        ISensorReader GetSensorReader(string name);
    }

    public class LegacySensorProvider : ISensorReaderProvider
    {
        public string KeyIDMapPath { get; } = "Sensors/Data2016/Sensor.json";
        public string CalibrationFilePath { get; } = "Sensors/Data2016/SensorInfo.json";

        public ISensorReader GetSensorReader(string name)
        {
            return new LegacySensorReader(name);
        }
    }

    public class GPSCSVSensorProvider : ISensorReaderProvider
    {
        public string KeyIDMapPath => "Sensors/Data2016/Sensor.json";
        public string CalibrationFilePath => "Sensors/Data2016/SensorInfo.json";

        public ISensorReader GetSensorReader(string name)
        {
            return new GPSDataReader(name, 2, 3);
        }
    }



    public class InFluxDBSensorProvider : ISensorProvider
    {
        public string KeyIDMapPath { get; } = "Sensors/Data2016/Sensor.json";
        public string CalibrationFilePath { get; } = "Sensors/Data2016/SensorInfo.json";

        public string[] AvailableDataSets()
        {
            throw new NotImplementedException();
        }

        public ISensorReader GetSensorReader(string name)
        {
            throw new NotImplementedException();
        }
    }

    public class SensorManager
    {
        public const string SensorNameFile = "Sensors/SensorInformation.json";
        public List<string> SensorLocations { get; private set; } = new List<string>();
        public Dictionary<string, DisplaySensorInformationInformation> SensorDisplayInformation { get; } = new Dictionary<string, DisplaySensorInformationInformation>();
        public Dictionary<string, ISensorReaderProvider> FileProviders { get; } = new Dictionary<string, ISensorReaderProvider>();

        public Dictionary<string, SensorDataSet> LoadedDataSets { get; } = new Dictionary<string, SensorDataSet>();

        public event EventHandler<SensorEventArgs> DataReceived;
        public event EventHandler<DataSetEventArgs> TelemetryStart;

        public bool TelemetryAvailable { get; private set; } = false;

        public SensorManager()
        {
            LoadSensorInformation();
        }

        private void LoadSensorInformation()
        {
            FileInfo fi = new FileInfo(SensorNameFile);
            if (!fi.Exists)
            {
                throw new FileNotFoundException(fi.FullName + " was not found");
            }

            TextReader tr = new StreamReader(fi.OpenRead());
            string data = tr.ReadToEnd();
            tr.Close();

            DisplaySensorInformationInformation[] displayInfo = JSONObject.Parse(data).ToArray<DisplaySensorInformationInformation[]>();
            foreach (DisplaySensorInformationInformation disp in displayInfo)
            {
                SensorDisplayInformation[disp.Key] = disp;
            }
        }

        static Singelton<SensorManager> instance = new Singelton<SensorManager>();
        public static SensorManager GetDefault()
        {
            return instance.Value;
        }

        public RealSensorPackage Add(string dataSet, SensorPackage data)
        {
            if (!this.LoadedDataSets.ContainsKey(dataSet))
            {
                this.LoadedDataSets[dataSet] = new SensorDataSet(dataSet, new LegacySensorProvider());
                this.LoadedDataSets[dataSet].Load(false);
                this.LoadedDataSets[dataSet].SetNames(this);
            }
            RealSensorPackage temp = this.LoadedDataSets[dataSet].Add(data);
            return temp;
        }

        public void AddLive(string dataSet, SensorPackage package)
        {
            if (!TelemetryAvailable)
            {
                if (dataSet == "telemetry")
                {
                    TelemetryAvailable = true;
                    RealSensorPackage rsp = this.Add(dataSet, package);
                    OnTelemetryBegin(this.LoadedDataSets["telemetry"]);
                }
            }
            else
            {
                OnDataReceived(this.Add(dataSet, package));
            }
        }

        public void RegisterFileProvider(string fileExtension, ISensorReaderProvider provider)
        {
            FileProviders.Add(fileExtension, provider);
        }

        public SensorDataSet Load(string dataSet)
        {
            if (LoadedDataSets.ContainsKey(dataSet))
            {
                return LoadedDataSets[dataSet];
            }
            FileInfo fi = new FileInfo(dataSet);
            if (!fi.Exists)
            {
                throw new FileNotFoundException(fi.FullName + " not found");
            }
            string extension = fi.Extension.Remove(0, 1).ToLower();
            if (FileProviders.ContainsKey(extension))
            {
                SensorDataSet set = new SensorDataSet(dataSet, FileProviders[extension]);
                set.Load();
                set.SetNames(this);
                LoadedDataSets[set.Name] =  set;
                return set;
            }
            else
            {
                Console.WriteLine("Could not find driver for: " + extension);
                return null;
            }
        }

        public void OnDataReceived(RealSensorPackage package)
        {
            DataReceived?.Invoke(this, new SensorEventArgs() { Package = package });
        }

        public void OnTelemetryBegin(SensorDataSet sensorDataSet)
        {
            TelemetryStart?.Invoke(this, new DataSetEventArgs() { DataSet = sensorDataSet });
        }

        public byte[] GetBinaryData(string dataset, int id)
        {
            if (LoadedDataSets.ContainsKey(dataset))
            {
                return LoadedDataSets[dataset].GetBinaryData(id);
            }
            return new byte[0];
        }

        /*public string CreateCsv(bool norFormat, bool includeTitle)
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
            foreach (KeyValuePair<int, List<RealSensorPackage>> pair in indexedPackages)
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
        }*/
    }

    public class SensorDataStore
    {                                                                                                                                                                                                                                  
        //List<SensorPackage> allPackages = new List<SensorPackage>();
        Dictionary<int, List<RealSensorPackage>> indexedPackages = new Dictionary<int, List<RealSensorPackage>>();
        public event EventHandler<SensorEventArgs> DataReceived;
        public Dictionary<string, Type> ReaderLinker { get; } = new Dictionary<string, Type>();
        public List<string> SensorLocations { get; private set; } = new List<string>();

        public const string SensorNameFile = "Sensors/SensorInformation.json";

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


    public class NewSensorInformation
    {
        public NewSensorInformation(KeyIDSensorInformation value)
        {
            this.Key = value.Key;
            AddInformation(value);
        }

        public string Key { get; set; }

        /*Key ID Mapping*/
        public int ID { get; set; }
        
        /*Display Information*/
        public string Name { get; set; }
        public string Unit { get; set; }

        /*Callibration Values*/
        public int Resolution { get; set; }
        public bool? Signed { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? MinDisplay { get; set; }
        public double? MaxDisplay { get; set; }

        public void AddInformation(KeyIDSensorInformation info)
        {
            this.ID = info.ID;
        }

        public void AddInformation(DisplaySensorInformationInformation info)
        {
            this.Name = info.Name;
            this.Unit = info.Unit;
        }

        public void AddInformation(CalibrationSensorInformation info)
        {
            this.Resolution = info.Resolution;
            this.Signed = info.Signed;
            this.MinValue = info.MinValue;
            this.MaxValue = info.MaxValue;
            this.MinDisplay = info.MinDisplay;
            this.MaxDisplay = info.MaxDisplay;
        }

        public double ConvertToPercent(long rawValue)
        {
            if (Signed != null && Signed.Value)
            {
                long shift = 0;
                int resCor = Resolution - 1;
                if (rawValue >> resCor > 0)
                    shift = (-1 << resCor);
                return ((double)(shift | rawValue)) / (double)(((long)1 << resCor) - 1);
            }
            else
            {
                return ((double)rawValue) / (((long)1 << Resolution) - 1);
            }
        }

        public double ConvertValue(long rawValue)
        {
            if (Signed != null && MaxValue != null)
            {
                if (!Signed.Value)
                    MinValue = 0;
                else
                    MinValue = -MaxValue.Value - 1;
            }
            if (MaxValue == null && MinValue == null)
            {
                return rawValue;
            }
            else if (Signed != null && Signed.Value)
            {
                if (MaxValue == null)
                    throw new Exception("Missing max value for calculation for key: " + this.Key);
                return ConvertToPercent(rawValue) * MaxValue.Value;
            }
            else if (MinValue != null && MaxValue != null)
            {
                return ConvertToPercent(rawValue) * (MaxValue.Value - MinValue.Value) + MinValue.Value;
            }
            else
            {
                throw new Exception("Missing MaxValue and/or MinValue for calculation for key: " + this.Key);
            }
        }
    }

    public class KeyIDSensorInformation
    {
        public string Key { get; set; }

        public int ID { get; set; }
    }

    public class DisplaySensorInformationInformation
    {
        public string Key { get; set; }

        public string Name { get; set; }
        public string Unit { get; set; }
    }

    public class CalibrationSensorInformation
    {
        public string Key { get; set; }

        public int Resolution { get; set; }
        public bool? Signed { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? MinDisplay { get; set; }
        public double? MaxDisplay { get; set; }
    }
}
