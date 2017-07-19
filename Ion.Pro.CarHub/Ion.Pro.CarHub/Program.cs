using NicroWare.Pro.RPiSPITest;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.CarHub
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Starting carhub");
            SerialPort port = new SerialPort("/dev/serial0", 115200, Parity.None, 8, StopBits.One);
            port.Open();
            Console.WriteLine("Port open");
            DateTime startTime = DateTime.Now;
            NRFRadio baseRadio = new NRFRadio();
            Console.WriteLine(baseRadio.Begin());
            baseRadio.SetPALevel(RF24PaDbm.RF24_PA_HIGH);
            baseRadio.SetDataRate(RF24Datarate.RF24_250KBPS); 
            baseRadio.SetRetries(0, 0);
            baseRadio.SetAutoAck(false);
            Console.WriteLine("Initializing");
            //baseRadio.OpenReadingPipe(0, "\0\0\0\0");
            //baseRadio.OpenWritingPipe("\0\0\0\0\0");
            baseRadio.OpenReadingPipe(0, "00001");
            baseRadio.OpenWritingPipe("00001");
            baseRadio.StopListening();
            //baseRadio.StartListening();
            Console.WriteLine("Trail send");
            Console.WriteLine(baseRadio.Write(new byte[] { 1, 2, 3, 4 }, 4));
            Console.WriteLine("Started writing");
            BufferedStream stream = new BufferedStream(port.BaseStream, 4096);
            BinaryReader reader = new BinaryReader(stream);
            while (true)
            {
                FindStart(reader);
                byte[] package = new byte[10];
                Array.Copy(reader.ReadBytes(6), package, 6);
                Array.Copy(BitConverter.GetBytes((uint)(DateTime.Now - startTime).TotalMilliseconds), 0, package, 6, 4);
                baseRadio.Write(package, 10);
            }
        }

        static void FindStart(BinaryReader reader)
        {
            byte prevByte = 0;
            while (true)
            {
                byte curByte = reader.ReadByte();
                if (prevByte == 0xFF && curByte == 0xFF)
                {
                    return;
                }
                prevByte = curByte;
            }
        }
    }
}
