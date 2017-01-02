using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class MimeTypes
    {
        public static Dictionary<string, string> StoredMimeTypes { get; private set; } = new Dictionary<string, string>()
        {
            [".png"]    = "image/png",
            [".jpg"]    = "image/jpeg",
            [".jpeg"]   = "image/jpeg",
            [".gif"]    = "image/gif",

            [".pdf"]    = "application/pdf",
            [".log"]    = "application/log",
            [".js"]     = "application/javascript",
            [".json"]   = "application/json",
            [".xml"]    = "application/xml",

            [".zip"]    = "application/zip",

            [".css"]    = "text/css",
            [".htm"]    = "text/html",
            [".html"]   = "text/html",
            [".csv"]    = "text/csv",

            [".doc"]    = "application/msword",
            [".ppt"]    = "application/vnd.ms-powerpoint",
            [".xls"]    = "application/vnd.ms-excel",

            [".docx"]   = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".pptx"]   = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            [".xlsx"]   = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",


            ["binary"]  = "application/octet-stream",
        };

        public static string GetMimeType(string extension)
        {
            if (StoredMimeTypes.ContainsKey(extension))
                return StoredMimeTypes[extension];
            return StoredMimeTypes["binary"];
        }

        public static string ReverseLookup(string mimeType)
        {
            foreach (KeyValuePair<string, string> pair in StoredMimeTypes)
            {
                if (mimeType == pair.Value)
                    return pair.Key;
            }
            return null;
        }
    }

    public enum HttpRequestType
    {
        UNKNOWN,
        GET,
        HEAD,
        POST,
        PUT,
        DELETE,
        TRACE,
        OPTIONS,
        CONNECT,
        PATCH
    }

    public enum HttpStatus : int
    {
        OK200 = 200,
        NotFound = 404,
    }

    public abstract class HttpHeader
    {
        public string HttpVersion { get; set; }
        public Dictionary<string, string> HttpHeaderFields { get; private set; } = new Dictionary<string, string>();

        public string GetField(string key)
        {
            if (HttpHeaderFields.ContainsKey(key))
            {
                return HttpHeaderFields[key];
            }
            return null;
        }
    }

    public class HttpHeaderResponse : HttpHeader
    {
        Encoding defaultEncoding;
        HttpStatus code;

        public string ContentType
        {
            get
            {
                return GetField("Content-Type");
            }
            set
            {
                HttpHeaderFields["Content-Type"] = value;
            }
        }

        public HttpHeaderResponse()
        {
            defaultEncoding = Encoding.ASCII;
        }


        public static HttpHeaderResponse CreateDefault(HttpStatus code)
        {
            HttpHeaderResponse header = new HttpHeaderResponse();
            header.HttpVersion = "HTTP/1.1";
            header.HttpHeaderFields["Server"] = "Ion Analytics Server";
            header.HttpHeaderFields["Date"] = DateTime.Now.ToString("R");
            header.HttpHeaderFields["Cache-Control"] = "no-cache, no-store, must-revalidate";
            header.HttpHeaderFields["Connection"] = "close";
            header.code = code;
            return header;
        }

        private byte[] GetBytesFromString(string s)
        {
            byte[] stringData = defaultEncoding.GetBytes(s);
            return stringData;
        }

        public string GetHeader()
        {
            return GetHeader(new string[0]);
        }

        public static string GetStatusWord(HttpStatus code)
        {
            switch (code)
            {
                case HttpStatus.OK200:
                    return "OK";
                default:
                    return "Unknown";
            }
        }

        public string GetHeader(string[] extraFields)
        {
            StringBuilder sb = new StringBuilder();
            //string s = "HTTP/1.1 " + ((int)this.code).ToString() + " OK";

            sb.AppendLine($"{HttpVersion} {(int)this.code} {GetStatusWord(this.code)}");
            foreach (KeyValuePair<string, string> pair in HttpHeaderFields)
            {
                sb.AppendLine($"{pair.Key}: {pair.Value}");
            }
            foreach (string s in extraFields)
            {
                sb.AppendLine(s);
            }
            sb.AppendLine();
            return sb.ToString();
        }

        public byte[] GetBytes(string data)
        {
            return GetBytes(GetBytesFromString(data));
        }

        public byte[] GetBytes(byte[] data)
        {
            byte[] header = GetBytesFromString(GetHeader(new[] { $"Content-Length: {data.Length}" }));
            byte[] returnFrame = new byte[header.Length + data.Length];

            Array.Copy(header, returnFrame, header.Length);
            Array.Copy(data, 0, returnFrame, header.Length, data.Length);

            return returnFrame;
        }


    }

    public class HttpHeaderRequest : HttpHeader
    {
        public HttpRequestType RequestType { get; private set; }
        public string RelativePath { get; private set; }
        public string FullRelativePath { get; private set; }
        public string GetParams { get; private set; }

        public string Host
        {
            get
            {
                return GetField(nameof(Host));
            }
        }

        

        public static HttpHeaderRequest Parse(string[] parts)
        {
            HttpHeaderRequest request = new HttpHeaderRequest();
            string[] requestParts = parts[0].Split(' ');
            request.RequestType = (HttpRequestType)Enum.Parse(typeof(HttpRequestType), requestParts[0]);
            request.ParseUrl(requestParts[1]);
            request.FullRelativePath = requestParts[1];
            request.HttpVersion = requestParts[2];

            for (int i = 1; i < parts.Length; i++)
            {
                string[] httpFieldParts = parts[i].Split(new[] { ':' }, 2);
                if (httpFieldParts.Length == 2)
                {
                    request.HttpHeaderFields.Add(httpFieldParts[0], httpFieldParts[1].Trim());
                }
                else
                {
                    Console.WriteLine("Missing value in http field");
                }
            }
            return request;
        }

        private void ParseUrl(string url)
        {
            this.FullRelativePath = url;
            string[] urlParts = url.Split(new[] { '?' }, 2);
            this.RelativePath = urlParts[0];
            if (urlParts.Length > 1)
                this.GetParams = urlParts[1];
        }
    }

    public class ProtocolReader
    {
        public Stream BaseStream { get; private set; }
        const int bufferSize = 4096;
        private byte[] buffer;
        private int available;
        private int position;
        private int left => available - position;
        //private bool locked = false;
        public bool BlockWhenEmpty { get; set; } = false;

        public ProtocolReader(Stream baseStream)
        {
            BaseStream = baseStream;
            buffer = new byte[bufferSize];
        }

        private void ReadBuffer()
        {
            available = BaseStream.Read(buffer, 0, bufferSize);
            position = 0;
        }

        private int FillBuffer(byte[] buffer, int offset, int length, bool allowIncomplete)
        {
            int curIndex = 0;
            bool breakLoop = false;
            while (curIndex < length)
            {
                if (left == 0)
                    ReadBuffer();
                int read = 0;
                if (left > length - curIndex)
                {
                    read = length - curIndex;
                }
                else if (allowIncomplete && available < bufferSize)
                {
                    read = left;
                    breakLoop = true;
                }
                else
                {
                    read = left;
                }
                Buffer.BlockCopy(this.buffer, position, buffer, offset + curIndex, read);
                curIndex += read;
                position += read;
                if (breakLoop)
                    break;
            }
            return curIndex;
        }

        public byte[] ReadBytes(int count)
        {
            byte[] tempBuffer = new byte[count];
            FillBuffer(tempBuffer, 0, count, false);
            return tempBuffer;
        }

        public byte Read()
        {
            if (left == 0)
                ReadBuffer();
            return buffer[position++];
        }

        public byte Peek()
        {
            if (left == 0)
                ReadBuffer();
            return buffer[position];
        }


        public char ReadChar()
        {
            return (char)Read();
        }

        public char PeekChar()
        {
            return (char)Peek();
        }

        public string ReadLine()
        {
            StringBuilder builder = new StringBuilder();
            char current = ' ';
            while (true)
            {
                current = ReadChar();
                if (current == '\r' || current == '\n')
                {
                    if (current == '\r' && PeekChar() == '\n')
                        Read();
                    break;
                }
                else
                    builder.Append(current);
            }
            return builder.ToString();
        }

        public void Close()
        {
            BaseStream.Close();
        }
    }
}
