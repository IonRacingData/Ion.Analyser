using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.Controllers
{
    public class Socket : Controller
    {
        public IActionResult Connect()
        {
            HttpHeaderRequest request = HttpContext.Request;
            if (request.HttpHeaderFields.ContainsKey("Upgrade") && request.HttpHeaderFields["Upgrade"] == "websocket")
            {
                string clientSecWebSocketKey = request.HttpHeaderFields["Sec-WebSocket-Key"];
                string magicWebSocketString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                byte[] hashData = Encoding.Default.GetBytes(clientSecWebSocketKey + magicWebSocketString);
                SHA1 sha1 = SHA1.Create();
                byte[] data = sha1.ComputeHash(hashData);
                string s = Convert.ToBase64String(data);

                return new WebSocketResult(s, HandleSocket);
            }
            return Error("Problem creating WebSocket", HttpStatus.BadRequest400);
        }

        public void HandleSocket(HttpContext context)
        {
            WebSocketClient client = new WebSocketClient(context.Wrapper.Client.GetStream());

            while (true)
            {
                Console.WriteLine(client.ReadString());

                client.WriteString("Cool :D");
            }
        }

        
    }

    public class WebSocketClient
    {
        public Stream BaseStream { get; private set; }
        BinaryReader reader;
        BinaryWriter writer;

        public WebSocketClient(Stream s)
        {
            this.BaseStream = s;
            this.reader = new BinaryReader(s);
            this.writer = new BinaryWriter(s);
        }

        public string ReadString()
        {
            WebSocketFrame frame = new WebSocketFrame();
            byte[] bytes = reader.ReadBytes(2);
            if (bytes.Length == 0)
                return null;

            frame.ParseFirstPart(bytes);

            
            if (frame.PayloadLength == 126)
            {
                byte[] data = reader.ReadBytes(2);
                frame.PayloadLength = data[0] << 8 | data[1];
            }
            if (frame.PayloadLength == 127)
            {
                byte[] data = reader.ReadBytes(8); // We cant make an array bigger then this anyway, if we have data more then 2GB we got problems.
                frame.PayloadLength = data[4] << 24 | data[5] << 16 | data[6] << 8 | data[7];
            }

            if (frame.Masked)
            {
                frame.MaskingKey = reader.ReadBytes(4);
            }

            frame.ParsePayload(reader.ReadBytes(frame.PayloadLength));

            return Encoding.Default.GetString(frame.Data);
        }

        public void WriteString(string v)
        {
            WebSocketFrame frame = WebSocketFrame.CreateFrame("Cool :D");
            writer.Write(frame.GetBytes(false));
        }
    }

    public class WebSocketFrame
    {
        public bool Fin { get; set; }
        public int OpCode { get; set; }
        public bool Masked { get; set; }
        public int PayloadLength { get; set; }
        public byte[] MaskingKey { get; set; }

        public byte[] MaskedPayload { get; set; }
        public byte[] Data { get; set; }

        public static WebSocketFrame CreateFrame(string data)
        {
            WebSocketFrame frame = new WebSocketFrame();
            frame.Fin = true;
            frame.OpCode = 1;
            frame.Masked = false;
            frame.Data = Encoding.Default.GetBytes(data);
            frame.PayloadLength = frame.Data.Length;
            return frame;
        }

       
        /// <summary>
        /// Parses the two first bytes of the header, to be able to know if it should read in more length or not
        /// </summary>
        /// <param name="data">The two first bytes of the web socket frame pack</param>
        public void ParseFirstPart(byte[] data)
        {
            Fin = data[0] >> 0x7F > 0 ? true : false;
            OpCode = data[0] & 0xF;
            Masked = data[1] >> 7 > 0 ? true : false;
            PayloadLength = data[1] & 0x7F;
        }

        public void ParsePayload(byte[] data)
        {
            if (Masked)
            {
                this.MaskedPayload = data;
                Data = new byte[PayloadLength];
                for (int i = 0; i < MaskedPayload.Length; i++)
                {
                    Data[i] = (byte)(MaskedPayload[i] ^ MaskingKey[i % 4]);
                }
            }
            else
            {
                this.Data = data;
            }
        }

        public byte[] GetBytes(bool mask)
        {
            List<byte> returnData = new List<byte>();
            returnData.Add((byte)((Fin ? 1 : 0) << 0x7 | OpCode));
            returnData.Add((byte)((Masked ? 1 : 0) << 0x7 | PayloadLength));

            if (Masked)
            {
                returnData.AddRange(MaskingKey);
            }

            returnData.AddRange(Data);

            return returnData.ToArray();
        }
    }

    public class WebSocketResult : IActionResult
    {
        string secWebSocketAccept;
        Action<HttpContext> handler;
        public WebSocketResult(string secWebSocketAccept, Action<HttpContext> handler)
        {
            this.secWebSocketAccept = secWebSocketAccept;
            this.handler = handler;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            context.HttpContext.Response.Code = HttpStatus.SwitchingProtocols101;
            context.HttpContext.Response.HttpHeaderFields["Upgrade"] = "websocket";
            context.HttpContext.Response.HttpHeaderFields["Connection"] = "Upgrade";
            context.HttpContext.Response.HttpHeaderFields["Sec-WebSocket-Accept"] = await Task.FromResult(this.secWebSocketAccept);
            context.HttpContext.SocketHandler = this.handler;
            context.HttpContext.Wrapper.PreventClose = true;
            
        }
    }
}
