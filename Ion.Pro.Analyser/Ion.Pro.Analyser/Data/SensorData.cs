using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

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

    public interface ISensorReader
    {
        SensorPackage[] ReadPackages();
    }

    /// <summary>
    /// Sensor data reader from Embla 2016 Ion Racing Car
    /// </summary>
    public class LegacySensorReader : ISensorReader
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

    public class GPSUtil
    {
        const double earthRadius = 6371008.8;
        public static Tuple<long, long> ToMilli(double lat, double lon)
        {
            double phi = (lat * Math.PI) / 180;
            double my = (lon * Math.PI) / 180;
            long milliLat = (long)(phi * earthRadius * 1000);
            long milliLong = (long)(my * Math.Cos(phi) * earthRadius * 1000);
            return new Tuple<long, long>(milliLat, milliLong);
        }

        public static SensorPackage[] GetPackages(double lat, double lon, long time)
        {
            Tuple<long, long> part = ToMilli(lat, lon);

            SensorPackage latPack = new SensorPackage();
            SensorPackage longPack = new SensorPackage();
            SensorPackage cross = new SensorPackage();
            latPack.ID = 250;
            latPack.Value = part.Item1;
            latPack.TimeStamp = time;

            longPack.ID = 251;
            longPack.Value = part.Item2;
            longPack.TimeStamp = time;

            cross.ID = 252;
            cross.Value = part.Item1;
            cross.TimeStamp = part.Item2;
            return new SensorPackage[] { latPack, longPack, cross };
        }
    }


    public class GPSDataReader : ISensorReader
    {
        string file;
        int skipStart = 0;
        int skipEnd = 0;
        
        public GPSDataReader(string file, int skipStart, int skipEnd)
        {
            this.file = file;
            this.skipStart = skipStart;
            this.skipEnd = skipEnd;
        }

        public SensorPackage[] ReadPackages()
        {
            List<SensorPackage> allPackages = new List<SensorPackage>();
            string[] allLines = File.ReadAllLines(file);
            DateTime startTime = new DateTime();
            bool first = true;
            for (int i = skipStart; i < allLines.Length - skipEnd; i++)
            {
                //58.9375923760235;5.69240081124008
                string[] parts = allLines[i].Split(';');
                if (parts.Length < 3)
                    continue;

                if (first)
                {
                    first = false;
                    startTime = DateTime.Parse(parts[0]);
                }
                long time = (long)((DateTime.Parse(parts[0]) - startTime).TotalMilliseconds);

                allPackages.AddRange(GPSUtil.GetPackages(double.Parse(parts[1], CultureInfo.InvariantCulture), double.Parse(parts[2], CultureInfo.InvariantCulture), time));
            }
            return allPackages.ToArray();
        }
    }

    public class GPXDataReader : ISensorReader
    {
        string path;
        public GPXDataReader(string path)
        {
            this.path = path;
        }

        public SensorPackage[] ReadPackages()
        {
            XmlDocument doc = new XmlDocument();
            doc.Load(path);

            List<SensorPackage> allPackages = new List<SensorPackage>();
            XmlNodeList list = doc.GetElementsByTagName("trkpt");
            bool first = true;
            DateTime startTime = new DateTime();
            foreach (XmlNode node in list)
            {
                string lat = node.Attributes["lat"].Value;
                string lon = node.Attributes["lon"].Value;
                string strTime = "";
                foreach (XmlNode n in node.ChildNodes)
                {
                    if (n.Name == "time")
                    {
                        strTime = n.InnerText;
                        break;
                    }
                }
                if (strTime.Length < 5)
                    break;
                
                if (first)
                {
                    first = false;
                    startTime = DateTime.Parse(strTime);
                }
                long time = (long)((DateTime.Parse(strTime) - startTime).TotalMilliseconds);

                allPackages.AddRange(GPSUtil.GetPackages(double.Parse(lat, CultureInfo.InvariantCulture), double.Parse(lon, CultureInfo.InvariantCulture), time));
            }

            return allPackages.ToArray();
        }
    }

    public class DataWrapper<T>
    {
        public T Value { get; set; }
    }
}
