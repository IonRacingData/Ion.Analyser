using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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

                return new WebSocket(s, HandleSocket);
            }
            return Error("Problem creating WebSocket", HttpStatus.BadRequest400);
        }

        public void HandleSocket(HttpContext context)
        {
            BinaryReader reader = new BinaryReader(context.Wrapper.Client.GetStream());
            while (true)
            {
                byte[] bytes = reader.ReadBytes(2);
                if (bytes.Length == 0)
                    return;
                bool fin = bytes[0] >> 0x7F > 0 ? true : false;
                int opcode = bytes[0] & 0xF;
                bool mask = bytes[1] >> 7 > 0 ? true : false;
                int payloadLen = bytes[1] & 0x7F;
                byte[] maskingKey = null;
                if (mask)
                {
                    maskingKey = reader.ReadBytes(4);
                }
                byte[] maskedPayload = reader.ReadBytes(payloadLen);
                byte[] unmaskedPayload;
                if (mask)
                {
                    unmaskedPayload = new byte[payloadLen];
                    for (int i = 0; i < maskedPayload.Length; i++)
                    {
                        unmaskedPayload[i] = (byte)(maskedPayload[i] ^ maskingKey[i % 4]);
                    }
                }
                else
                {
                    unmaskedPayload = maskedPayload;
                }

                Console.WriteLine(Encoding.Default.GetString(unmaskedPayload));

                WebSocketFrame frame = WebSocketFrame.CreateFrame("Cool :D");
                BinaryWriter writer = new BinaryWriter(context.Wrapper.Client.GetStream());
                writer.Write(frame.GetBytes(false));
            }
        }
    }

    public class WebSocketFrame
    {
        public bool Fin { get; set; }
        public int OpCode { get; set; }
        public bool Masked { get; set; }
        public int PayloadLength { get; set; }
        public byte[] MaskingKey { get; set; }

        public byte[] MaksedPayload { get; set; }
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

    public class WebSocket : IActionResult
    {
        string secWebSocketAccept;
        Action<HttpContext> handler;
        public WebSocket(string secWebSocketAccept, Action<HttpContext> handler)
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
