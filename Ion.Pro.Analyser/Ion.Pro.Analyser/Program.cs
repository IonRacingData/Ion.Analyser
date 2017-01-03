using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public delegate byte[] HttpAction();
    class Program
    {
        static Dictionary<string, Type> controllers = new Dictionary<string, Type>();

        static void Main(string[] args)
        {
            InitControllers();
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
            byte[] responseData = new byte[0];
            string requestPath = request.RelativePath;

            HttpHeaderResponse httpResponse = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            FileInfo fi = new FileInfo(Path.Combine(contentPath, request.RelativePath.Remove(0, 1)));
            if (fi.Exists)
            {
                /*if (fi.Extension == ".pdf")
                {
                    httpResponse.ContentType = MimeTypes.GetMimeType("binary");
                }
                else*/
                httpResponse.ContentType = MimeTypes.GetMimeType(fi.Extension);
                responseData = File.ReadAllBytes(fi.FullName);
            }
            else
            {
                httpResponse.ContentType = "text/html";
                if (requestPath.Length == 1)
                {
                    requestPath = "/home/index";
                }
                string[] requestParts = requestPath.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                if (requestParts.Length > 0 && controllers.ContainsKey(requestParts[0].ToLower()))
                {
                    string requestAction = "index";
                    if (requestParts.Length > 1)
                    {
                        requestAction = requestParts[1].ToLower();
                    }

                    Controller temp = (Controller)Activator.CreateInstance(controllers[requestParts[0].ToLower()]);
                    temp.Request = request;
                    temp.Response = httpResponse;
                    HttpAction a = (HttpAction)temp.AllActions[requestAction].CreateDelegate(typeof(HttpAction), temp);
                    responseData = a();
                    
                }
                else
                {
                    switch (requestPath)
                    {
                        case "/":
                            HomeController controller = new HomeController();
                            responseData = controller.Index();
                            //responseData = File.ReadAllBytes(contentPath + "index.html");
                            break;
                        case "/home/index":
                            if (controllers.ContainsKey("home"))
                            {
                                Controller temp = (Controller)Activator.CreateInstance(controllers["home"]);
                                if (temp.AllActions.ContainsKey("index"))
                                {
                                    responseData = (byte[])temp.AllActions["index"].Invoke(temp, new object[] { request, httpResponse });
                                }
                            }
                            break;
                        default:
                            httpResponse.Code = HttpStatus.NotFound404;
                            responseData = Encoding.Default.GetBytes("<h1>404 Not found</h1>");
                            break;
                    }
                }
            }

            byte[] data = httpResponse.GetBytes(responseData);
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

        static void InitControllers()
        {
            Assembly[] allAssembly = AppDomain.CurrentDomain.GetAssemblies();
            foreach (Assembly a in allAssembly)
            {
                Type[] types = a.GetTypes();
                foreach (Type t in types)
                {
                    if (typeof(Controller).IsAssignableFrom(t) && t != typeof(Controller))
                    {
                        string name = t.Name.Replace("Controller", "").ToLower();
                        controllers.Add(name, t);
                    }
                }
            }
        }
    }

    public class Controller
    {
        public Dictionary<string, MethodInfo> AllActions { get; private set; } = new Dictionary<string, MethodInfo>();
        public HttpHeaderRequest Request { get; set; }
        public HttpHeaderResponse Response { get; set; }
        public Controller()
        {
            Type thisType = GetType();
            MethodInfo[] allInfos = thisType.GetMethods();

            foreach (MethodInfo mi in allInfos)
            {
                if (mi.ReturnType == typeof(byte[]))
                {
                    AllActions.Add(mi.Name.ToLower(), mi);
                }
            }
        }
    }

    public interface IActionResult
    {
        void Process()
        {

        }
    }

    public class ActionResultContext
    {

    }

    public class HomeController : Controller
    {
        string content = "../../Content/";

        public byte[] Index()
        {
            Response.ContentType = MimeTypes.GetMimeType(".html");
            return File.ReadAllBytes(content + "index.html");
        }

        public byte[] Help()
        {
            if (Request.RelativePath.Contains("HELP"))
            {
                return Encoding.Default.GetBytes("<h1>this is a help page</h1>".ToUpper());
            }
            return Encoding.Default.GetBytes("<h1>this is a help page</h1>");
        }
    }
}
