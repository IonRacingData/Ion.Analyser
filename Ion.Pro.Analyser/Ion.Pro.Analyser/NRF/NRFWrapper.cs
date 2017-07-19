using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace NicroWare.Pro.RPiSPITest
{
    /// <summary>
    /// This class can only be used on a raspberry pi with a modified BCM2835 library
    /// </summary>
    public class NRFRadio : IDisposable
    {
        IntPtr basePointer;
        protected bool Disposed { get; set; } = false;
        private bool Initialized = false;
        private bool IsReading = false;

        public NRFRadio()
            : this(RPiGPIOPin.RPI_V2_GPIO_P1_15, RPiGPIOPin.RPI_V2_GPIO_P1_24, SpiSpeed.Speed8MHz)
        {
        }

        public NRFRadio(RPiGPIOPin cePin, RPiGPIOPin csPin, SpiSpeed speed)
        {
            basePointer = RF24Radio.NativeMethods.CreateRadio((byte)cePin, (byte)csPin, (uint)speed);
            if (basePointer == IntPtr.Zero)
            {
                throw new NullReferenceException("The pointer was not correct created");
            }
            Initialized = true;

        }

        ~NRFRadio()
        {
            Dispose(false);
        }

        public bool Begin()
        {
            CheckDispose();
            lock (this)
            {
                return RF24Radio.NativeMethods.begin(basePointer);
            }
        }

        public void StartListening()
        {
            CheckDispose();
            lock (this)
            {
                RF24Radio.NativeMethods.startListening(basePointer);
                IsReading = true;
            }
        }

        public void StopListening()
        {
            CheckDispose();
            lock (this)
            {
                RF24Radio.NativeMethods.stopListening(basePointer);
                IsReading = false;
            }
        }

        public bool Write(byte[] bytes, byte length)
        {
            CheckDispose();
            lock (this)
            {
                return RF24Radio.NativeMethods.write(basePointer, bytes, length);
            }
        }

        public bool Available()
        {
            CheckDispose();
            if (!IsReading)
                return false;
            lock (this)
            {
                return RF24Radio.NativeMethods.available(basePointer, null);
            }
        }

        public void Read(byte[] buffer, byte length)
        {
            CheckDispose();
            lock (this)
            {
                RF24Radio.NativeMethods.read(basePointer, buffer, length);
            }
        }

        public void OpenReadingPipe(byte number, string address)
        {
            CheckDispose();
            lock (this)
            {
                RF24Radio.NativeMethods.openReadingPipe(basePointer, number, address);
            }
        }

        public void OpenWritingPipe(string address)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.openWritingPipe(basePointer, address);
        }

        public void SetRetries(byte delay, byte count)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.setRetries(basePointer, delay, count);
        }

        public void SetChannel(byte channel)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.setChannel(basePointer, channel);
        }

        public void SetPayloadSize(byte size)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.setPayloadSize(basePointer, size);
        }

        public void SetAutoAck(bool enable)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.setAutoAck(basePointer, enable);
        }

        public void SetPALevel(RF24PaDbm level)
        {
            CheckDispose();
            lock (this)
                RF24Radio.NativeMethods.setPALevel(basePointer, (byte)level);
        }

        public bool SetDataRate(RF24Datarate speed)
        {
            CheckDispose();
            lock (this)
                return RF24Radio.NativeMethods.setDataRate(basePointer, speed);
        }

        public bool IsAckPayloadAvailable()
        {
            CheckDispose();
            lock (this)
                return RF24Radio.NativeMethods.isAckPayloadAvailable(basePointer);
        }

        public bool WriteFast(byte[] bytes, byte length)
        {
            CheckDispose();
            lock (this)
            {
                return RF24Radio.NativeMethods.writeFast(basePointer, bytes, length);
            }
        }

        private void CheckDispose()
        {
            if (Disposed || basePointer == IntPtr.Zero) throw new ObjectDisposedException("The object is disposed");
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (Disposed)
                return;
            if (disposing)
            {
                //Dispose managed objects here
            }
            if (Initialized)
            {
                RF24Radio.NativeMethods.DeleteRadio(basePointer);
                basePointer = IntPtr.Zero;
                Initialized = false;
            }
            Disposed = true;
        }
    }

    internal static class RF24Radio
    {
        internal class NativeMethods
        {
            const string lib = "librf24-bcm.so.1.0";
            [DllImport(lib)]
            public static extern IntPtr CreateRadio(byte _cepin, byte _cspin, uint spispeed);

            [DllImport(lib)]
            public static extern void DeleteRadio(IntPtr radio);

            [DllImport(lib)]
            public static extern bool begin(IntPtr radio);

            [DllImport(lib)]
            public static extern void startListening(IntPtr radio);

            [DllImport(lib)]
            public static extern void stopListening(IntPtr radio);

            [DllImport(lib)]
            public static extern bool write(IntPtr radio, byte[] buf, byte length);

            [DllImport(lib)]
            public static extern bool available(IntPtr radio, byte[] pipe_num);

            [DllImport(lib)]
            public static extern void read(IntPtr radio, byte[] buf, byte len);

            [DllImport(lib)]
            public static extern void openReadingPipe(IntPtr radio, byte number, string address);

            [DllImport(lib)]
            public static extern void openWritingPipe(IntPtr radio, string address);

            [DllImport(lib)]
            public static extern void setRetries(IntPtr radio, byte delay, byte count);

            [DllImport(lib)]
            public static extern void setChannel(IntPtr radio, byte channel);

            [DllImport(lib)]
            public static extern void setPayloadSize(IntPtr radio, byte size);

            [DllImport(lib)]
            public static extern void setAutoAck(IntPtr radio, bool enable);

            [DllImport(lib)]
            public static extern void setPALevel(IntPtr radio, byte level);

            [DllImport(lib)]
            public static extern bool setDataRate(IntPtr radio, RF24Datarate speed);

            [DllImport(lib)]
            public static extern bool isAckPayloadAvailable(IntPtr radio);

            [DllImport(lib)]
            public static extern bool writeFast(IntPtr radio, byte[] buf, byte length);
        }
    }

    public enum RPiGPIOPin : byte
    {
        RPI_GPIO_P1_03 = 0,
        RPI_GPIO_P1_05 = 1,
        RPI_GPIO_P1_07 = 4,
        RPI_GPIO_P1_08 = 14,
        RPI_GPIO_P1_10 = 15,
        RPI_GPIO_P1_11 = 17,
        RPI_GPIO_P1_12 = 18,
        RPI_GPIO_P1_13 = 21,
        RPI_GPIO_P1_15 = 22,
        RPI_GPIO_P1_16 = 23,
        RPI_GPIO_P1_18 = 24,
        RPI_GPIO_P1_19 = 10,
        RPI_GPIO_P1_21 = 9,
        RPI_GPIO_P1_22 = 25,
        RPI_GPIO_P1_23 = 11,
        RPI_GPIO_P1_24 = 8,
        RPI_GPIO_P1_26 = 7,
        /* RPi Version 2 */
        RPI_V2_GPIO_P1_03 = 2,
        RPI_V2_GPIO_P1_05 = 3,
        RPI_V2_GPIO_P1_07 = 4,
        RPI_V2_GPIO_P1_08 = 14,
        RPI_V2_GPIO_P1_10 = 15,
        RPI_V2_GPIO_P1_11 = 17,
        RPI_V2_GPIO_P1_12 = 18,
        RPI_V2_GPIO_P1_13 = 27,
        RPI_V2_GPIO_P1_15 = 22,
        RPI_V2_GPIO_P1_16 = 23,
        RPI_V2_GPIO_P1_18 = 24,
        RPI_V2_GPIO_P1_19 = 10,
        RPI_V2_GPIO_P1_21 = 9,
        RPI_V2_GPIO_P1_22 = 25,
        RPI_V2_GPIO_P1_23 = 11,
        RPI_V2_GPIO_P1_24 = 8,
        RPI_V2_GPIO_P1_26 = 7,
        RPI_V2_GPIO_P1_29 = 5,
        RPI_V2_GPIO_P1_31 = 6,
        RPI_V2_GPIO_P1_32 = 12,
        RPI_V2_GPIO_P1_33 = 13,
        RPI_V2_GPIO_P1_35 = 19,
        RPI_V2_GPIO_P1_36 = 16,
        RPI_V2_GPIO_P1_37 = 26,
        RPI_V2_GPIO_P1_38 = 20,
        RPI_V2_GPIO_P1_40 = 21,
        /* RPi Version 2, new plug P5 */
        RPI_V2_GPIO_P5_03 = 28,
        RPI_V2_GPIO_P5_04 = 29,
        RPI_V2_GPIO_P5_05 = 30,
        RPI_V2_GPIO_P5_06 = 31,
        /* RPi B+ J8 header, also RPi 2 40 pin GPIO header */
        RPI_BPLUS_GPIO_J8_03 = 2,
        RPI_BPLUS_GPIO_J8_05 = 3,
        RPI_BPLUS_GPIO_J8_07 = 4,
        RPI_BPLUS_GPIO_J8_08 = 14,
        RPI_BPLUS_GPIO_J8_10 = 15,
        RPI_BPLUS_GPIO_J8_11 = 17,
        RPI_BPLUS_GPIO_J8_12 = 18,
        RPI_BPLUS_GPIO_J8_13 = 27,
        RPI_BPLUS_GPIO_J8_15 = 22,
        RPI_BPLUS_GPIO_J8_16 = 23,
        RPI_BPLUS_GPIO_J8_18 = 24,
        RPI_BPLUS_GPIO_J8_19 = 10,
        RPI_BPLUS_GPIO_J8_21 = 9,
        RPI_BPLUS_GPIO_J8_22 = 25,
        RPI_BPLUS_GPIO_J8_23 = 11,
        RPI_BPLUS_GPIO_J8_24 = 8,
        RPI_BPLUS_GPIO_J8_26 = 7,
        RPI_BPLUS_GPIO_J8_29 = 5,
        RPI_BPLUS_GPIO_J8_31 = 6,
        RPI_BPLUS_GPIO_J8_32 = 12,
        RPI_BPLUS_GPIO_J8_33 = 13,
        RPI_BPLUS_GPIO_J8_35 = 19,
        RPI_BPLUS_GPIO_J8_36 = 16,
        RPI_BPLUS_GPIO_J8_37 = 26,
        RPI_BPLUS_GPIO_J8_38 = 20,
        RPI_BPLUS_GPIO_J8_40 = 21
    }

    public enum Bcm2835SPIClockDivider : UInt32
    {
        BCM2835_SPI_CLOCK_DIVIDER_65536 = 0,       ///< 65536 = 262.144us = 3.814697260kHz
        BCM2835_SPI_CLOCK_DIVIDER_32768 = 32768,   ///< 32768 = 131.072us = 7.629394531kHz
        BCM2835_SPI_CLOCK_DIVIDER_16384 = 16384,   ///< 16384 = 65.536us = 15.25878906kHz
        BCM2835_SPI_CLOCK_DIVIDER_8192 = 8192,    ///< 8192 = 32.768us = 30/51757813kHz
        BCM2835_SPI_CLOCK_DIVIDER_4096 = 4096,    ///< 4096 = 16.384us = 61.03515625kHz
        BCM2835_SPI_CLOCK_DIVIDER_2048 = 2048,    ///< 2048 = 8.192us = 122.0703125kHz
        BCM2835_SPI_CLOCK_DIVIDER_1024 = 1024,    ///< 1024 = 4.096us = 244.140625kHz
        BCM2835_SPI_CLOCK_DIVIDER_512 = 512,     ///< 512 = 2.048us = 488.28125kHz
        BCM2835_SPI_CLOCK_DIVIDER_256 = 256,     ///< 256 = 1.024us = 976.5625MHz
        BCM2835_SPI_CLOCK_DIVIDER_128 = 128,     ///< 128 = 512ns = = 1.953125MHz
        BCM2835_SPI_CLOCK_DIVIDER_64 = 64,      ///< 64 = 256ns = 3.90625MHz
        BCM2835_SPI_CLOCK_DIVIDER_32 = 32,      ///< 32 = 128ns = 7.8125MHz
        BCM2835_SPI_CLOCK_DIVIDER_16 = 16,      ///< 16 = 64ns = 15.625MHz
        BCM2835_SPI_CLOCK_DIVIDER_8 = 8,       ///< 8 = 32ns = 31.25MHz
        BCM2835_SPI_CLOCK_DIVIDER_4 = 4,       ///< 4 = 16ns = 62.5MHz
        BCM2835_SPI_CLOCK_DIVIDER_2 = 2,       ///< 2 = 8ns = 125MHz, fastest you can get
        BCM2835_SPI_CLOCK_DIVIDER_1 = 1,       ///< 1 = 262.144us = 3.814697260kHz, same as 0/65536
    }

    public enum SpiSpeed : UInt32
    {
        Speed8MHz = Bcm2835SPIClockDivider.BCM2835_SPI_CLOCK_DIVIDER_32,
        Speed16MHz = Bcm2835SPIClockDivider.BCM2835_SPI_CLOCK_DIVIDER_16
    }

    public enum RF24Datarate
    {
        RF24_1MBPS = 0,
        RF24_2MBPS,
        RF24_250KBPS
    }

    public enum RF24PaDbm : byte
    {
        RF24_PA_MIN = 0,
        RF24_PA_LOW,
        RF24_PA_HIGH,
        RF24_PA_MAX,
        RF24_PA_ERROR
    }
}

/*
extern "C" IntPtr CreateRadio(uint8_t _cepin, uint8_t _cspin, uint32_t spispeed);

extern "C" void DeleteRadio(RF24* radio);

extern "C" bool begin(RF24* radio);

extern "C" void startListening(RF24* radio);

extern "C" void stopListening(RF24* radio);

extern "C" bool write(RF24* radio, const void* buf, uint8_t len);

extern "C" bool available(RF24* radio, uint8_t* pipe_num);

extern "C" void read(RF24* radio, const void* buf, uint8_t len);

extern "C" void openReadingPipe(RF24* radio, uint8_t number, const uint8_t *address);

extern "C" void openWritingPipe(RF24* radio, const uint8_t *address);

extern "C" void setRetries(RF24* radio, uint8_t delay, uint8_t count);

extern "C" void setChannel(RF24* radio, uint8_t channel);

extern "C" void setPayloadSize(RF24* radio, uint8_t size);

extern "C" void setAutoAck(RF24* radio, bool enable);

extern "C" void setPALevel(RF24* radio, uint8_t level);

extern "C" bool setDataRate(RF24* radio, rf24_datarate_e speed);

extern "C" bool isAckPayloadAvailable(RF24* radio);
*/
