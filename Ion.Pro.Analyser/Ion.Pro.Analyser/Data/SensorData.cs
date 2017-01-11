using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.Data
{
    public struct SensorPackage
    {
        public int ID { get; set; }
        public long Value { get; set; }
        public long TimeStamp { get; set; }
        public long AbsoluteTimeStamp { get; set; }

        public SensorPackageViewModel GetObject()
        {
            return new SensorPackageViewModel() { ID = ID, Value = Value, TimeStamp = TimeStamp };
        }
    }

    public class SensorPackageViewModel
    {
        public int ID { get; set; }
        public long Value { get; set; }
        public long TimeStamp { get; set; }
        public long AbsoluteTimeStamp { get; set; }
    }


    /// <summary>
    /// Sensor data reader from Embla 2016 Ion Racing Car
    /// </summary>
    public class LegacySensorReader
    {
        string sensorFile;

        public LegacySensorReader(string file)
        {
            this.sensorFile = file;
        }

        public SensorPackage[] ReadPackages()
        {
            BinaryReader reader = new BinaryReader(new FileStream(sensorFile, FileMode.Open));
            List<SensorPackage> packages = new List<SensorPackage>();
            while(reader.BaseStream.Position < reader.BaseStream.Length - 10)
            {
                SensorPackage package = new SensorPackage();
                package.ID = reader.ReadUInt16();
                package.Value = reader.ReadUInt32();
                package.TimeStamp = reader.ReadUInt32();
                packages.Add(package);
            }
            reader.Close();
            return packages.ToArray();
        }
    }

    public class DataWrapper<T>
    {
        public T Value { get; set; }
    }
}
