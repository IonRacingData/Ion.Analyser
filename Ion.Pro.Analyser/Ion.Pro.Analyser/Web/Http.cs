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

            [".ts"]     = "text/x-typescript",

            [".doc"]    = "application/msword",
            [".ppt"]    = "application/vnd.ms-powerpoint",
            [".xls"]    = "application/vnd.ms-excel",

            [".docx"]   = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".pptx"]   = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            [".xlsx"]   = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            [".mp4"]    = "video/mp4",


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
        /*Informational 1xx*/
        Continue100 = 100,
        SwitchingProtocols101 = 101,

        /*Success 2xx*/
        OK200 = 200,
        Created201 = 201,
        Accepted202 = 202,
        NoContent204 = 204,


        /*Client Error 4xx*/
        BadRequest400 = 400,
        Unauthorized401 = 401,
        PaymentRequired402 = 402,
        Forbidden403 = 403,
        NotFound404 = 404,
        MethodNotAllowed405 = 405,
        NotAcceptable406 = 406


        /*Server Error 5xx*/
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
        public HttpStatus Code { get; set; }
        public byte[] Data { get; set; } = new byte[0];
        public List<HttpCookie> SetCookie { get; set; } = new List<HttpCookie>();

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
            header.Code = code;
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

            sb.AppendLine($"{HttpVersion} {(int)this.Code} {GetStatusWord(this.Code)}");
            foreach (KeyValuePair<string, string> pair in HttpHeaderFields)
            {
                sb.AppendLine($"{pair.Key}: {pair.Value}");
            }
            foreach (string s in extraFields)
            {
                sb.AppendLine(s);
            }
            foreach (HttpCookie cookie in SetCookie)
            {
                sb.AppendLine($"Set-Cookie: {cookie.ToString()}");
            }
            sb.AppendLine();
            return sb.ToString();
        }

        public byte[] GetBytes()
        {
            return GetBytes(Data);
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

    public class HttpCookie
    {
        public string Key { get; set; }
        public string Value { get; set; }
        public DateTime? Expires { get; set; }
        public int? MaxAge { get; set; }
        public string Domain { get; set; }
        public bool? Secure { get; set; }

        public override string ToString()
        {
            return $"{Key}={Value} {(Expires == null ? "": "; Expires=" + Expires.Value.ToString("R"))}";
        }
    }

    public class HttpHeaderRequest : HttpHeader
    {
        public HttpRequestType RequestType { get; private set; }
        public string RelativePath { get; private set; }
        public string FullRelativePath { get; private set; }
        public string GETString { get; private set; }
        public string POSTString { get; private set; }
        public string CookieString { get; private set; }
        public Dictionary<string, string> GETParameters { get; private set; } = new Dictionary<string, string>();
        public Dictionary<string, string> POSTParameters { get; private set; } = new Dictionary<string, string>();
        public Dictionary<string, string> Cookies { get; private set; } = new Dictionary<string, string>();
        public List<HttpPart> allParts = new List<HttpPart>();


        public string Host
        {
            get
            {
                return GetField(nameof(Host));
            }
        }

        public static HttpHeaderRequest ReadFromProtocolReader(ProtocolReader reader)
        {
            HttpHeaderRequest request = new HttpHeaderRequest();
            string requestField = reader.ReadLine();
            if (requestField.Length < 3)
            {
                Console.WriteLine("Error parsing header");
                return request;
            }
            request.ParseRequestField(requestField);
            string curLine = "";
            while ((curLine = reader.ReadLine()).Length > 0)
            {
                string[] httpFieldParts = curLine.Split(new[] { ':' }, 2);
                if (httpFieldParts.Length == 2)
                {
                    request.HttpHeaderFields.Add(httpFieldParts[0], httpFieldParts[1].Trim());
                    if (httpFieldParts[0] == "Cookie")
                    {
                        request.ParseCookie(httpFieldParts[1]);
                    }
                }
                else
                {
                    Console.WriteLine("Missing value in http field");
                }
            }
            if (request.RequestType == HttpRequestType.POST)
            {
                int contentLength = int.Parse(request.HttpHeaderFields["Content-Length"]);
                string[] contentTypeParts = request.HttpHeaderFields["Content-Type"].Split(';');

                switch (contentTypeParts[0].Trim())
                {
                    case "application/x-www-form-urlencoded":
                        string data = Encoding.Default.GetString(reader.ReadBytes(contentLength));
                        request.ParsePost(data);
                        break;
                    case "multipart/form-data":
                        request.ParseMultipartCode(contentTypeParts[1].Trim(), reader.ReadBytes(contentLength));
                        break;
                }
            }

            return request;
        }

        public static async Task<HttpHeaderRequest> ReadFromProtocolReaderAsync(ProtocolReader reader)
        {
            HttpHeaderRequest request = new HttpHeaderRequest();
            string requestField = await reader.ReadLineAsync();
            request.ParseRequestField(requestField);
            string curLine = "";
            while ((curLine = await reader.ReadLineAsync()).Length > 0)
            {
                string[] httpFieldParts = curLine.Split(new[] { ':' }, 2);
                if (httpFieldParts.Length == 2)
                {
                    request.HttpHeaderFields.Add(httpFieldParts[0], httpFieldParts[1].Trim());
                    if (httpFieldParts[0] == "Cookie")
                    {
                        request.ParseCookie(httpFieldParts[1]);
                    }
                }
                else
                {
                    Console.WriteLine("Missing value in http field");
                }
            }
            if (request.RequestType == HttpRequestType.POST)
            {
                int contentLength = int.Parse(request.HttpHeaderFields["Content-Length"]);
                string[] contentTypeParts = request.HttpHeaderFields["Content-Type"].Split(';');

                switch (contentTypeParts[0].Trim())
                {
                    case "application/x-www-form-urlencoded":
                        string data = Encoding.Default.GetString(await reader.ReadBytesAsync(contentLength));
                        request.ParsePost(data);
                        break;
                    case "multipart/form-data":
                        request.ParseMultipartCode(contentTypeParts[1].Trim(), await reader.ReadBytesAsync(contentLength));
                        break;
                }
            }

            return request;
        }

        public static HttpHeaderRequest ParseHeader(string[] parts)
        {
            HttpHeaderRequest request = new HttpHeaderRequest();
            request.ParseRequestField(parts[0]);

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

        private void ParseRequestField(string requestField)
        {
            string[] requestParts = requestField.Split(' ');
            RequestType = (HttpRequestType)Enum.Parse(typeof(HttpRequestType), requestParts[0]);
            ParseUrl(requestParts[1]);
            HttpVersion = requestParts[2];
        }

        private void ParseUrl(string url)
        {
            this.FullRelativePath = url;
            string[] urlParts = url.Split(new[] { '?' }, 2);
            this.RelativePath = urlParts[0];
            if (urlParts.Length > 1)
                ParseGet(urlParts[1]);
                
        }

        private void ParseGet(string getData)
        {
            this.GETString = getData;
            string[] getParts = getData.Split('&');
            foreach (string s in getParts)
            {
                string[] getParamParts = s.Split('=');
                string data = "";
                if (getParamParts.Length > 1)
                    data = getParamParts[1];
                GETParameters[getParamParts[0]] = data;
            }
        }

        private void ParsePost(string postData)
        {
            this.POSTString = postData;
            string[] postParts = postData.Split('&');
            foreach (string s in postParts)
            {
                string[] postParamParts = s.Split('=');
                string data = "";
                if (postParamParts.Length > 1)
                    data = postParamParts[1];
                POSTParameters[postParamParts[0]] = data;
            }
        }

        private void ParseCookie(string cookieData)
        {
            cookieData = cookieData.Trim();
            this.CookieString = cookieData;
            string[] cookieParts = cookieData.Split(';');
            foreach (string s in cookieParts)
            {
                string[] cookieParamParts = s.Split('=');
                string data = "";
                if (cookieParamParts.Length > 1)
                    data = cookieParamParts[1];
                Cookies[cookieParamParts[0].Trim()] = data.Trim();
            }
        }

        private void ParseMultipartCode(string boundary, byte[] data)
        {
            string boundaryValue = boundary.Split('=')[1].Trim();
            ByteArrayReader reader = new ByteArrayReader(data);
            List<byte> currentBytes = new List<byte>();
            bool stringReading = false;
            HttpPart currentPart = null;
            
            while (!reader.EndOfData)
            {
                if (stringReading)
                {
                    string curLine = "";
                    List<string> lines = new List<string>();
                    while ((curLine = reader.ReadLine()).Length > 0)
                    {
                        lines.Add(curLine);
                    }
                    currentPart = new HttpPart(lines.ToArray());
                    allParts.Add(currentPart);
                    stringReading = false;
                }
                else
                {
                    byte[] line = reader.ReadLineAsBytes();
                    if (Math.Abs(line.Length - boundaryValue.Length) < 8 && Encoding.Default.GetString(line).Contains(boundaryValue))
                    {
                        if (currentPart != null)
                        {
                            currentPart.Data = currentBytes.ToArray();
                            currentBytes.Clear();
                        }
                        stringReading = true;
                    }
                    else
                    {
                        currentBytes.AddRange(line);
                    }
                }
            }
        }

        private class ByteArrayReader
        {
            byte[] data;
            int curIndex = 0;

            public bool EndOfData => curIndex >= data.Length;

            public ByteArrayReader(byte[] data)
            {
                this.data = data;
            }

            public byte[] ReadLineAsBytes()
            {
                List<byte> currentBytes = new List<byte>();
                for (; curIndex < data.Length; curIndex++)
                {
                    if (data[curIndex] == 13 || data[curIndex] == 10)
                    {
                        currentBytes.Add(data[curIndex]);
                        if (curIndex + 1 < data.Length && data[curIndex] == 13 && data[curIndex + 1] == 10)
                        {
                            curIndex++;
                            currentBytes.Add(data[curIndex]);
                        }
                        curIndex++;
                        break;
                    }
                    else
                        currentBytes.Add(data[curIndex]);
                }
                return currentBytes.ToArray();
            }

            public string ReadLine()
            {
                return Encoding.Default.GetString(ReadLineAsBytes()).Trim();
            }
        }

        public class HttpPart
        {
            public Dictionary<string, string> MultipartValues { get; private set; } = new Dictionary<string, string>();
            public byte[] Data { get; set; }

            public HttpPart(string[] data)
            {
                Parse(data);
            }

            private void Parse(string[] data)
            {
                foreach (string s in data)
                {
                    string[] parts = s.Split(new[] { ':' }, 2);
                    MultipartValues[parts[0]] = parts[1];
                }
            }
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
        private bool moreLeft => left > 0;
        //private bool locked = false;
        public bool BlockWhenEmpty { get; set; } = false;
        public bool EndOfFile { get; private set; } = false;
        

        public ProtocolReader(Stream baseStream)
        {
            BaseStream = baseStream;
            buffer = new byte[bufferSize];
        }

        private void ReadBuffer()
        {
            available = BaseStream.Read(buffer, 0, bufferSize);
            position = 0;
            if (available == 0)
            {
                EndOfFile = true;
            }
        }

        private int FillBuffer(byte[] buffer, int offset, int length, bool allowIncomplete)
        {
            int curIndex = 0;
            bool breakLoop = false;
            while (curIndex < length)
            {
                if (!moreLeft)
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
            if (!moreLeft)
                ReadBuffer();
            return buffer[position++];
        }

        public byte Peek()
        {
            if (!moreLeft)
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
            while (!EndOfFile)
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





        private async Task ReadBufferAsync()
        {
            available = await BaseStream.ReadAsync(buffer, 0, bufferSize);
            position = 0;
        }

        private async Task<int> FillBufferAsync(byte[] buffer, int offset, int length, bool allowIncomplete)
        {
            int curIndex = 0;
            bool breakLoop = false;
            while (curIndex < length)
            {
                if (left == 0)
                    await ReadBufferAsync();
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

        public async Task<byte[]> ReadBytesAsync(int count)
        {
            byte[] tempBuffer = new byte[count];
            await FillBufferAsync(tempBuffer, 0, count, false);
            return tempBuffer;
        }

        public async Task<byte> ReadAsync()
        {
            if (left == 0)
                await ReadBufferAsync();
            return buffer[position++];
        }

        public async Task<byte> PeekAsync()
        {
            if (left == 0)
                await ReadBufferAsync();
            return buffer[position];
        }


        public async Task<char> ReadCharAsync()
        {
            return (char)(await ReadAsync());
        }

        public async Task<char> PeekCharAsync()
        {
            return (char)(await PeekAsync());
        }

        public async Task<string> ReadLineAsync()
        {
            StringBuilder builder = new StringBuilder();
            char current = ' ';
            while (true)
            {
                current = await ReadCharAsync();
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
