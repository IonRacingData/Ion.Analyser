using Ion.Pro.Analyser.SenSys;
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
            SensorPackage lastPackage = new SensorPackage();
            int ignoredPackages = 0;
            while(reader.BaseStream.Position < reader.BaseStream.Length - 10)
            {
                SensorPackage package = new SensorPackage();
                package.ID = reader.ReadUInt16();
                package.Value = reader.ReadUInt32();
                package.TimeStamp = reader.ReadUInt32();
                if (!(package.ID == 0 && package.Value == 0 && package.TimeStamp == 0))
                {
                    if (package.ID >= 0xF000)
                    {
                        ignoredPackages++;
                        continue;
                    }
                    packages.Add(package);
                }

                if (package.ID == 0x180)
                {
                    packages.AddRange(SensorExtracter.ExtractMotorContoller(package));
                    //System.Diagnostics.Debugger.Break();
                }
                if (lastPackage.ID >= 0x622 && lastPackage.ID <= 0x628 && package.ID == lastPackage.ID) {
                    packages.AddRange(SensorExtracter.ExtractBMS(lastPackage, package));
                }


                lastPackage = package;
            }
            reader.Close();
            return packages.ToArray();
        }


    }

    public static class SensorExtracter
    {
        static Dictionary<int, int> mcIdMap = new Dictionary<int, int>()
        {
            [0x27] = 0xF040,
            [0x28] = 0xF041,
            [0x29] = 0xF042,
            [0x2a] = 0xF043,
            [0xf6] = 0xF044,
            [0x30] = 0xF045,
            [0xa8] = 0xF046,
            [0x49] = 0xF047,
            [0x4A] = 0xF048,
            [0x4B] = 0xF049,
        };

        public static SensorPackage[] ExtractBMS(SensorPackage a, SensorPackage b)
        {
            byte[] bytesA = BitConverter.GetBytes((int)a.Value);
            byte[] bytesB = BitConverter.GetBytes((int)b.Value);
            List<SensorPackage> returnPackages = new List<SensorPackage>();
            switch (a.ID)
            {
                case 0x622:
                    returnPackages.Add(GenerateFrom(a, 0xF020, bytesA[0]));
                    returnPackages.Add(GenerateFrom(a, 0xF021, ToBigUInt16(bytesA, 1)));
                    returnPackages.Add(GenerateFrom(a, 0xF022, bytesA[3]));
                    returnPackages.Add(GenerateFrom(a, 0xF023, bytesB[0]));
                    returnPackages.Add(GenerateFrom(a, 0xF024, bytesB[1]));
                    returnPackages.Add(GenerateFrom(a, 0xF025, bytesB[2]));
                    break;
                case 0x623:
                    returnPackages.Add(GenerateFrom(a, 0xF001, ToBigUInt16(bytesA, 0))); //Pack voltage
                    returnPackages.Add(GenerateFrom(a, 0xF002, bytesA[2])); // Min Vtg
                    returnPackages.Add(GenerateFrom(a, 0xF003, bytesA[3])); // min Vtg#
                    returnPackages.Add(GenerateFrom(a, 0xF004, bytesB[0])); // Max vtg
                    returnPackages.Add(GenerateFrom(a, 0xF005, bytesB[1])); // Max vtg #
                    break;
                case 0x624:
                    returnPackages.Add(GenerateFrom(a, 0xF006, ToBigUInt16(bytesA, 0))); // Current
                    returnPackages.Add(GenerateFrom(a, 0xF007, ToBigUInt16(bytesA, 2))); //Charge Limit
                    returnPackages.Add(GenerateFrom(a, 0xF008, ToBigUInt16(bytesB, 0))); //Discharge limit
                    break;
                case 0x625:
                    returnPackages.Add(GenerateFrom(a, 0xF009, ToBigUInt32(bytesA, 0))); // Batt. energy in
                    returnPackages.Add(GenerateFrom(a, 0xF00A, ToBigUInt32(bytesB, 0))); // Batt. energy out
                    break;
                case 0x626:
                    if (bytesB[1] != 0)
                        System.Diagnostics.Debugger.Break();
                    returnPackages.Add(GenerateFrom(a, 0xF00B, bytesA[0])); //SOC
                    returnPackages.Add(GenerateFrom(a, 0xF00C, ToBigUInt16(bytesA, 1))); //DOD
                    returnPackages.Add(GenerateFrom(a, 0xF00D, (uint)(bytesA[3] << 8 | bytesB[0]))); //Capacity
                    returnPackages.Add(GenerateFrom(a, 0xF00E, bytesB[1])); //00h
                    returnPackages.Add(GenerateFrom(a, 0xF00F, bytesB[2])); //SOH
                    break;
                case 0x627:
                    returnPackages.Add(GenerateFrom(a, 0xF010, bytesA[0])); // Temperature
                    returnPackages.Add(GenerateFrom(a, 0xF011, bytesA[2])); //Min Temp
                    returnPackages.Add(GenerateFrom(a, 0xF012, bytesA[3])); //Min Temp #
                    returnPackages.Add(GenerateFrom(a, 0xF013, bytesB[0])); //Max temp
                    returnPackages.Add(GenerateFrom(a, 0xF014, bytesB[1])); //Max temp #
                    break;
                case 0x628:
                    returnPackages.Add(GenerateFrom(a, 0xF015, ToBigUInt16(bytesA, 0))); //Pack resistance
                    returnPackages.Add(GenerateFrom(a, 0xF016, bytesA[2])); //Min Res
                    returnPackages.Add(GenerateFrom(a, 0xF017, bytesA[3])); //Min Res#
                    returnPackages.Add(GenerateFrom(a, 0xF018, bytesB[0])); //Max Res
                    returnPackages.Add(GenerateFrom(a, 0xF019, bytesB[1])); //Max Res#
                    break;
            }
            return returnPackages.ToArray();
        }

        public static SensorPackage[] ExtractMotorContoller(SensorPackage a)
        {
            byte[] bytesA = BitConverter.GetBytes((int)a.Value);

            List<SensorPackage> packages = new List<SensorPackage>();
            int value = bytesA[1] | bytesA[2] << 8;

            if (mcIdMap.ContainsKey(bytesA[0]))
            {
                packages.Add(GenerateFrom(a, mcIdMap[bytesA[0]], value));
            }

            return packages.ToArray();
        }

        private static SensorPackage GenerateFrom(SensorPackage pack, int newId, long value)
        {
            return new SensorPackage()
            {
                ID = newId,
                AbsoluteTimeStamp = pack.AbsoluteTimeStamp,
                TimeStamp = pack.TimeStamp,
                Value = value
            };
        }

        public static ushort ToBigUInt16(byte[] buffer, int startIndex)
        {
            return (ushort)(buffer[startIndex] << 8 | buffer[startIndex + 1]);
        }

        public static UInt32 ToBigUInt32(byte[] buffer, int startIndex)
        {
            return (ushort)(buffer[startIndex] << 24 | buffer[startIndex + 1] << 16 | buffer[startIndex + 2] << 8 | buffer[startIndex + 3]);
        }
    }

    public static class SensorConverter
    {
        public static byte[] ConvertBytes(byte[] buffer, byte[] tempBuffer, bool copySub = true)
        {
            byte[] buf1 = copySub ? buffer.SubArray(2, 6) : buffer;
            byte[] buf2 = copySub ? tempBuffer.SubArray(2, 6) : tempBuffer;
            List<byte> allBytes = new List<byte>();
            allBytes.AddRange(buf1);
            allBytes.AddRange(buf2);
            int id = buf1[0] | buf1[1] << 8;
            switch (id)
            {
                case 0x622:
                    allBytes.AddRange(GeneratePackage(0xF020, buf1[2]));
                    allBytes.AddRange(GeneratePackage(0xF021, ToBigUInt16(buf1, 3)));
                    allBytes.AddRange(GeneratePackage(0xF022, buf1[5]));
                    allBytes.AddRange(GeneratePackage(0xF023, buf2[2]));
                    allBytes.AddRange(GeneratePackage(0xF024, buf2[3]));
                    allBytes.AddRange(GeneratePackage(0xF025, buf2[4]));
                    break;
                case 0x623:
                    allBytes.AddRange(GeneratePackage(0xF001, ToBigUInt16(buf1, 2))); //Pack voltage
                    allBytes.AddRange(GeneratePackage(0xF002, buf1[4])); // Min Vtg
                    allBytes.AddRange(GeneratePackage(0xF003, buf1[5])); // min Vtg#
                    allBytes.AddRange(GeneratePackage(0xF004, buf2[2])); // Max vtg
                    allBytes.AddRange(GeneratePackage(0xF005, buf2[3])); // Max vtg #
                    break;
                case 0x624:
                    allBytes.AddRange(GeneratePackage(0xF006, ToBigUInt16(buf1, 2))); // Current
                    allBytes.AddRange(GeneratePackage(0xF007, ToBigUInt16(buf1, 4))); //Charge Limit
                    allBytes.AddRange(GeneratePackage(0xF008, ToBigUInt16(buf2, 2))); //Discharge limit
                    break;
                case 0x625:
                    allBytes.AddRange(GeneratePackage(0xF009, ToBigUInt32(buf1, 2))); // Batt. energy in
                    allBytes.AddRange(GeneratePackage(0xF00A, ToBigUInt32(buf2, 2))); // Batt. energy out
                    break;
                case 0x626:
                    if (buf2[3] != 0)
                        System.Diagnostics.Debugger.Break();
                    allBytes.AddRange(GeneratePackage(0xF00B, buf1[2])); //SOC
                    allBytes.AddRange(GeneratePackage(0xF00C, ToBigUInt16(buf1, 3))); //DOD
                    allBytes.AddRange(GeneratePackage(0xF00D, (uint)(buf1[5] << 8 | buf2[2]))); //Capacity
                    allBytes.AddRange(GeneratePackage(0xF00E, buf2[3])); //00h
                    allBytes.AddRange(GeneratePackage(0xF00F, buf2[4])); //SOH
                    break;
                case 0x627:
                    allBytes.AddRange(GeneratePackage(0xF010, buf1[2])); // Temperature
                    allBytes.AddRange(GeneratePackage(0xF011, buf1[4])); //Min Temp
                    allBytes.AddRange(GeneratePackage(0xF012, buf1[5])); //Min Temp #
                    allBytes.AddRange(GeneratePackage(0xF013, buf2[2])); //Max temp
                    allBytes.AddRange(GeneratePackage(0xF014, buf2[3])); //Max temp #
                    break;
                case 0x628:
                    allBytes.AddRange(GeneratePackage(0xF015, ToBigUInt16(buf1, 2))); //Pack resistance
                    allBytes.AddRange(GeneratePackage(0xF016, buf1[4])); //Min Res
                    allBytes.AddRange(GeneratePackage(0xF017, buf1[5])); //Min Res#
                    allBytes.AddRange(GeneratePackage(0xF018, buf2[2])); //Max Res
                    allBytes.AddRange(GeneratePackage(0xF019, buf2[3])); //Max Res#
                    break;
            }
            return allBytes.ToArray();
        }

        public static ushort ToBigUInt16(byte[] buffer, int startIndex)
        {
            return (ushort)(buffer[startIndex] << 8 | buffer[startIndex + 1]);
        }

        public static UInt32 ToBigUInt32(byte[] buffer, int startIndex)
        {
            return (ushort)(buffer[startIndex] << 24 | buffer[startIndex + 1] << 16 | buffer[startIndex + 2] << 8 | buffer[startIndex + 3]);
        }

        public static byte[] GeneratePackage(int id, uint data)
        {
            byte[] bytes = BitConverter.GetBytes((ushort)id);
            byte[] dataBytes = BitConverter.GetBytes(data);
            return new byte[] { bytes[0], bytes[1], dataBytes[0], dataBytes[1], dataBytes[2], dataBytes[3] };
        }

        public static byte[] SubArray(this byte[] source, int start, int length)
        {
            byte[] temp = new byte[6];
            Array.Copy(source, start, temp, 0, length);
            return temp;
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
