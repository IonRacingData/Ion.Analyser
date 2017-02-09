using Ion.Pro.Analyser.Data;
using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class SensorEventArgs : EventArgs
    {
        public SensorPackage Package { get; set; }
    }

    public class SensorDataStore
    {
        //List<SensorPackage> allPackages = new List<SensorPackage>();
        Dictionary<int, List<RealSensorPackage>> indexedPackages = new Dictionary<int, List<RealSensorPackage>>();
        public event EventHandler<SensorEventArgs> DataReceived;

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
            foreach(SensorInformation si in infos)
            {
                sensorInformations.Add(si);
                sensorKeyMapping[si.Key] = si;
                sensorIdMapping[si.ID] = si;
            }
        }

        public void Add(SensorPackage data)
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
                temp.Value = info.ValueInfo.ConvertValue((int)temp.Value);
            }
            indexedPackages[data.ID].Add(temp);
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
            this.Add(pack);
            OnDataReceived(pack);
        }

        public void OnDataReceived(SensorPackage package)
        {
            DataReceived?.Invoke(this, new SensorEventArgs() { Package = package });
        }
    }

    public class SensorInformation
    {
        public int ID { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
        public SensorValueInformation ValueInfo { get; set; }
    }

    public class SensorValueInformation
    {
        public string Key { get; set; }
        public string Unit { get; set; }
        public int Resolution { get; set; }


        public bool? Signed { get; set; }

        public long? MinValue { get; set; }
        public long? MaxValue { get; set; }
        public long? MinDisplay { get; set; }
        public long? MaxDisplay { get; set; }

        public double ConvertToPercent(int rawValue)
        {
            if (Signed != null && Signed.Value)
            {
                int shift = 0;
                if (rawValue >> Resolution > 0)
                    shift = (-1 << Resolution);
                return ((double)(shift | rawValue)) / (double)(((long)1 << Resolution) - 1);
            }
            else
            {
                return ((double)rawValue) / (((long)1 << Resolution) - 1);
            }
        }

        public double ConvertValue(int rawValue)
        {
            if (Signed != null && MaxValue != null)
            {
                if (!Signed.Value)
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

                throw new Exception("Missing MaxValue and MinValue for calculation for key: " + this.Key);
            }
        }
    }
}
