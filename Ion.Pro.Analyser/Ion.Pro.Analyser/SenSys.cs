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
    public class SensorDataStore
    {
        //List<SensorPackage> allPackages = new List<SensorPackage>();
        Dictionary<int, List<SensorPackage>> indexedPackages = new Dictionary<int, List<SensorPackage>>();

        static Singelton<SensorDataStore> instance = new Singelton<SensorDataStore>();
        public static SensorDataStore GetDefault()
        {
            return instance.Value;
        }

        List<SensorInformation> sensorInformations = new List<SensorInformation>();

        public void LoadSensorInformation()
        {
            FileInfo fi = new FileInfo("Data/sensor.json");
            if (fi.Exists)
            {
                sensorInformations.AddRange(JSONObject.Parse(File.ReadAllText(fi.FullName)).ToArray<SensorInformation[]>());
            }
            else
            {
                throw new FileNotFoundException("sensor.json was not found");
            }
        }

        public void Add(SensorPackage data)
        {
            if (!indexedPackages.ContainsKey(data.ID))
            {
                indexedPackages[data.ID] = new List<SensorPackage>();
            }
            indexedPackages[data.ID].Add(data);
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
            foreach (SensorPackage sp in indexedPackages[id])
            {
                allViews.Add(sp.GetObject());
            }
            return allViews.ToArray();
        }

        public SensorPackage[] GetPackages(int id)
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
    }

    public class SensorInformation
    {
        public int ID { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
    }
}
