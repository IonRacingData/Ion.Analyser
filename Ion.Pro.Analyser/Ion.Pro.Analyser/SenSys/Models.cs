using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.SenSys
{
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

    public class SensorSetInformation
    {
        public string FileName { get; set; }
        public string FullFileName { get; set; }
        public long Size { get; set; }
        public string FileReader { get; set; }
    }

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

        public byte[] GetBinary()
        {
            return new byte[]
            {
                (byte)ID,
                (byte)(ID >> 8),
                (byte)(ID >> 16),
                (byte)(ID >> 24),
                (byte)Value,
                (byte)(Value >> 8),
                (byte)(Value >> 16),
                (byte)(Value >> 24),
                (byte)(Value >> 32),
                (byte)(Value >> 40),
                (byte)(Value >> 48),
                (byte)(Value >> 56),
                (byte)TimeStamp,
                (byte)(TimeStamp >> 8),
                (byte)(TimeStamp >> 16),
                (byte)(TimeStamp >> 24),
                (byte)(TimeStamp >> 32),
                (byte)(TimeStamp >> 40),
                (byte)(TimeStamp >> 48),
                (byte)(TimeStamp >> 56),
                (byte)AbsoluteTimeStamp,
                (byte)(AbsoluteTimeStamp >> 8),
                (byte)(AbsoluteTimeStamp >> 16),
                (byte)(AbsoluteTimeStamp >> 24),
                (byte)(AbsoluteTimeStamp >> 32),
                (byte)(AbsoluteTimeStamp >> 40),
                (byte)(AbsoluteTimeStamp >> 48),
                (byte)(AbsoluteTimeStamp >> 56),
            };
        }
    }

    public struct RealSensorPackage
    {
        public int ID { get; set; }
        public double Value { get; set; }
        public long TimeStamp { get; set; }
        public long AbsoluteTimeStamp { get; set; }

        public static RealSensorPackage Convert(SensorPackage package)
        {
            return new RealSensorPackage()
            {
                ID = package.ID,
                Value = package.Value,
                TimeStamp = package.TimeStamp,
                AbsoluteTimeStamp = package.AbsoluteTimeStamp,
            };

        }

        public byte[] GetBinary()
        {
            byte[] valByes = BitConverter.GetBytes(Value);
            return new byte[]
            {

                (byte)ID,
                (byte)(ID >> 8),
                (byte)(ID >> 16),
                (byte)(ID >> 24),
                valByes[0],
                valByes[1],
                valByes[2],
                valByes[3],
                valByes[4],
                valByes[5],
                valByes[6],
                valByes[7],
                (byte)TimeStamp,
                (byte)(TimeStamp >> 8),
                (byte)(TimeStamp >> 16),
                (byte)(TimeStamp >> 24),
                (byte)(TimeStamp >> 32),
                (byte)(TimeStamp >> 40),
                (byte)(TimeStamp >> 48),
                (byte)(TimeStamp >> 56),
                (byte)AbsoluteTimeStamp,
                (byte)(AbsoluteTimeStamp >> 8),
                (byte)(AbsoluteTimeStamp >> 16),
                (byte)(AbsoluteTimeStamp >> 24),
                (byte)(AbsoluteTimeStamp >> 32),
                (byte)(AbsoluteTimeStamp >> 40),
                (byte)(AbsoluteTimeStamp >> 48),
                (byte)(AbsoluteTimeStamp >> 56),
            };
        }
    }

    public class SensorPackageViewModel
    {
        public int ID { get; set; }
        public long Value { get; set; }
        public long TimeStamp { get; set; }
        public long AbsoluteTimeStamp { get; set; }

        public byte[] GetBinary()
        {
            return new byte[]
            {
                (byte)ID,
                (byte)(ID >> 8),
                (byte)(ID >> 16),
                (byte)(ID >> 24),
                (byte)Value,
                (byte)(Value >> 8),
                (byte)(Value >> 16),
                (byte)(Value >> 24),
                (byte)(Value >> 32),
                (byte)(Value >> 40),
                (byte)(Value >> 48),
                (byte)(Value >> 56),
                (byte)TimeStamp,
                (byte)(TimeStamp >> 8),
                (byte)(TimeStamp >> 16),
                (byte)(TimeStamp >> 24),
                (byte)(TimeStamp >> 32),
                (byte)(TimeStamp >> 40),
                (byte)(TimeStamp >> 48),
                (byte)(TimeStamp >> 56),
                (byte)AbsoluteTimeStamp,
                (byte)(AbsoluteTimeStamp >> 8),
                (byte)(AbsoluteTimeStamp >> 16),
                (byte)(AbsoluteTimeStamp >> 24),
                (byte)(AbsoluteTimeStamp >> 32),
                (byte)(AbsoluteTimeStamp >> 40),
                (byte)(AbsoluteTimeStamp >> 48),
                (byte)(AbsoluteTimeStamp >> 56),
            };
        }
    }
}
