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
    public delegate IActionResult HttpAction();
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
            //byte[] responseData = new byte[0];
            string requestPath = request.RelativePath;

            HttpHeaderResponse httpResponse = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            IActionResult result = null;
            HttpContext context = new HttpContext() { Request = request, Response = httpResponse };

            
            FileInfo fi = new FileInfo(Path.Combine(contentPath, request.RelativePath.Remove(0, 1)));
            if (fi.Exists)
            {
                result = new FileResult(fi.FullName);
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
                    temp.HttpContext = context;

                    HttpAction a = (HttpAction)temp.AllActions[requestAction].CreateDelegate(typeof(HttpAction), temp);
                    result = a();

                }
                else
                {
                    result = new ErrorResult(HttpStatus.NotFound404, "");
                }
            }

            Task t = result.ExecuteResultAsync(new ActionContext() { HttpContext = context });
            t.Wait();
            byte[] data = httpResponse.GetBytes();
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
        public HttpContext HttpContext { get; set; }
        public string BasePath = "../../Content/";
        //public HttpHeaderRequest Request { get; set; }
        //public HttpHeaderResponse Response { get; set; }
        public Controller()
        {
            Type thisType = GetType();
            MethodInfo[] allInfos = thisType.GetMethods();

            foreach (MethodInfo mi in allInfos)
            {
                if (mi.ReturnType == typeof(IActionResult))
                {
                    AllActions[mi.Name.ToLower()] = mi;
                }
            }
        }


        public IActionResult View(string file)
        {
            return new ViewResult(BasePath, file);
        }

        public IActionResult String(string data)
        {
            return new StringResult(data);
        }

        public IActionResult String(string data, string contentType)
        {
            return new StringResult(data, contentType);
        }
    }

    public class ErrorResult : IActionResult
    {
        HttpStatus statusCode;
        string message;

        public ErrorResult(HttpStatus code, string message)
        {
            this.statusCode = code;
            this.message = message;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            StringResult result = new StringResult("<h1>404 file not found</h1><h3>" + message + "</h3>", MimeTypes.GetMimeType(".html"));
            await result.ExecuteResultAsync(context);
            context.HttpContext.Response.Code = statusCode;
        }
    }

    public class ViewResult : IActionResult
    {
        string fileName = "";
        public ViewResult(string path, string file)
        {
            fileName = Path.Combine(path, file + ".html");
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            FileInfo fi = new FileInfo(fileName);
            if (fi.Exists)
            {
                context.HttpContext.Response.ContentType = MimeTypes.GetMimeType(".html");
                context.HttpContext.Response.Data = await Task.Run(() => File.ReadAllBytes(fi.FullName));
            }
            else
            {
                ErrorResult result = new ErrorResult(HttpStatus.NotFound404, fi.FullName + " was not found");
                await result.ExecuteResultAsync(context);
            }
        }
    }

    public class StringResult : IActionResult
    {
        string data;
        string contentType = "text/plain";

        public StringResult(string data)
        {
            this.data = data;
        }

        public StringResult(string data, string contentType)
            :this(data)
        {
            this.contentType = contentType;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            context.HttpContext.Response.ContentType = contentType;
            context.HttpContext.Response.Data = await Task.Run(() => Encoding.Default.GetBytes(this.data));
        }

    }

    public class FileResult : IActionResult
    {
        string file;
        bool forceDownload;

        public FileResult(string file)
            :this(file, false)
        {

        }

        public FileResult(string file, bool forceDownload)
        {
            this.file = file;
            this.forceDownload = forceDownload;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            FileInfo fi = new FileInfo(file);
            if (fi.Exists)
            {
                context.HttpContext.Response.ContentType = MimeTypes.GetMimeType(fi.Extension);
                context.HttpContext.Response.Data = await Task.Run(() => File.ReadAllBytes(fi.FullName));
            }
            else
            {
                ErrorResult result = new ErrorResult(HttpStatus.NotFound404, fi.FullName + " was not found");
                await result.ExecuteResultAsync(context);
            }
        }
    }

    public interface IActionResult
    {
        Task ExecuteResultAsync(ActionContext context);
    }

    public class HttpContext
    {
        public HttpHeaderRequest Request { get; set; }
        public HttpHeaderResponse Response { get; set; }
    }

    public class ActionContext
    {
        public HttpContext HttpContext { get; set; }
    }

    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            return View("index");
        }

        public IActionResult Help()
        {
            if (HttpContext.Request.RelativePath.Contains("HELP"))
            {
                return String("<h1>this is a help page</h1>".ToUpper(), MimeTypes.GetMimeType(".html"));
            }
            return String("<h1>this is a help page</h1>", MimeTypes.GetMimeType(".html"));
        }
    }
}
