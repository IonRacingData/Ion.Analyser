using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.Data
{
    public struct SensorPackage
    {
        public short ID { get; set; }
        public int Value { get; set; }
        public int TimeStamp { get; set; }

        public SensorPackageViewModel GetObject()
        {
            return new SensorPackageViewModel() { ID = ID, Value = Value, TimeStamp = TimeStamp };
        }
    }

    public class SensorPackageViewModel
    {
        public short ID { get; set; }
        public int Value { get; set; }
        public int TimeStamp { get; set; }
    }


    /// <summary>
    /// Sensor data reader from Embla 2016 Ion Racing Car
    /// </summary>
    public class LegacySensorReader
    {
        public LegacySensorReader(string file)
        {

        }

        public SensorPackage[] ReadPackages()
        {
            return null;
        }
    }

    public class DataWrapper<T>
    {
        public T Value { get; set; }
    }
}
