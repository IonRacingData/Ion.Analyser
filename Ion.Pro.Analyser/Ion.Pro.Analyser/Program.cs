using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    class Program
    {
        static void Main(string[] args)
        {
            HttpServer server = new HttpServer();

            server.Bind(IPAddress.Any, 4562, WebHandlerAsync);
            Console.Read();
        }

        public static async Task WebHandlerAsync(HttpWrapper wrapper)
        {
            Console.WriteLine("Received Client");
            ProtocolReader reader = new ProtocolReader(wrapper.Client.GetStream());
            Stream s = wrapper.Client.GetStream();
            string[] httpLines = await Task.Run(() => ReadHttp(reader));
            HttpHeaderRequest request = HttpHeaderRequest.Parse(httpLines);
            string contentPath = "../../Content/";
            string response = "";
            HttpHeaderResponse respons = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            FileInfo fi = new FileInfo(Path.Combine(contentPath, request.RelativePath.Remove(0, 1)));
            if (fi.Exists)
            {
                respons.ContentType = MimeTypes.GetMimeType(fi.Extension);
                response = File.ReadAllText(fi.FullName);
            }
            else
            {
                respons.ContentType = "text/html";
                switch (request.RelativePath)
                {
                    case "/":
                        response = File.ReadAllText(contentPath + "index.html");
                        break;
                    default:
                        response = "<h1>404 Not found</h1>";
                        break;
                }
            }



            


            /*string returnString = "";
            foreach (string httpLine in httpLines)
            {
                returnString += httpLine + "<br>\r\n";
            }*/
            byte[] data = respons.GetBytes(response);
            s.Write(data, 0, data.Length);
            s.Close();
            wrapper.Client.Close();
            Console.WriteLine("Request handled in: " + ((DateTime.Now - wrapper.Received).Ticks / 10).ToString() + "µs");
        }

        public static string[] ReadHttp(ProtocolReader reader)
        {
            string currentLine = "";
            List<string> allLines = new List<string>();
            while ((currentLine = reader.ReadLine()).Length > 0)
            {
                allLines.Add(currentLine);
            }
            return allLines.ToArray();
        }
    }
}
