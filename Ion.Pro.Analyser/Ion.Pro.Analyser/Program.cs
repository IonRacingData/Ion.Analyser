using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Net = System.Net;
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
            server.Bind(Net.IPAddress.Any, 4562, WebHandlerAsync);
            Console.Read();
            
        }
        static HttpAction testAction = null;
        static SessionService service = new SessionService();

        public static async Task WebHandlerAsync(HttpWrapper wrapper)
        {
            wrapper.Watch.Mark("Entered handler");
            ProtocolReader reader = new ProtocolReader(wrapper.Client.GetStream());

            TimingService Watch = wrapper.Watch;

            //string[] httpLines = await Task.Run(() => ReadHttp(reader));
            //string[] httpLines = ReadHttp(reader);

            Watch.Mark("Read http");

            HttpHeaderRequest request = await Task.Run(() => HttpHeaderRequest.ReadFromProtocolReader(reader));
            HttpHeaderResponse response = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            Session s;
            if (request.Cookies.ContainsKey(SessionService.sessionKey))
            {
                s = service.GetOrCreate(request.Cookies[SessionService.sessionKey]);
            }
            else
            {
                s = service.CreateSession();
                response.SetCookie.Add(new HttpCookie() { Key = SessionService.sessionKey, Value = s.Key });
            }

            HttpContext context = new HttpContext() { Request = request, Response = response, Session = s };

            Watch.Mark("Parsed http");

            HandleContext(context, wrapper, Watch);
        }

        private static void HandleContext(HttpContext context, HttpWrapper wrapper, TimingService Watch)
        {
            Stream s = wrapper.Client.GetStream();
            Watch.Mark("Got stream");
            string contentPath = "../../Content/";
            string requestPath = context.Request.RelativePath;

            IActionResult result = null;
            

            FileInfo fi = new FileInfo(Path.Combine(contentPath, context.Request.RelativePath.Remove(0, 1)));
            Watch.Mark("Prepared variables");
            if (fi.Exists)
            {
                result = new FileResult(fi.FullName);
                Watch.Mark("Created File Result");
            }
            else
            {
                context.Response.ContentType = "text/html";
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

                    testAction = (HttpAction)temp.AllActions[requestAction].CreateDelegate(typeof(HttpAction), temp);
                    result = testAction();
                    Watch.Mark("Created Http Action Result");
                }
                else
                {
                    result = new ErrorResult(HttpStatus.NotFound404, "");
                    Watch.Mark("Created Error Result");
                }
            }
            Watch.Mark("Finished handling request");
            Task t = result.ExecuteResultAsync(new ActionContext() { HttpContext = context });
            t.Wait();
            Watch.Mark("Finished Result run");
            byte[] data = context.Response.GetBytes();
            s.Write(data, 0, data.Length);
            s.Flush();
            s.Close();
            wrapper.Client.Close();
            Watch.Stop();
            Console.WriteLine($"Request \"{context.Request.FullRelativePath}\" handled in: {Watch.Watch.ElapsedTicks / 10}µs");
            long total = 0;
            bool printTimes = false;
            if (printTimes)
            {
                foreach (Tuple<long, string> record in Watch.Records)
                {
                    Console.WriteLine($"\t{record.Item1 / 10.0}µs (+{(record.Item1 - total) / 10.0}µs) {record.Item2}");
                    total = record.Item1;
                }
            }
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

    public class SessionService
    {
        public const string sessionKey = "__sessionid";
        public Dictionary<string, Session> Sessions { get; private set; } = new Dictionary<string, Session>();

        public Session CreateSession()
        {
            return CreateSession(Guid.NewGuid().ToString());
        }

        private Session CreateSession(string key)
        {
            Session session = new Session() { Key = key };
            Sessions[key] = session;
            return session;
        }

        public Session GetOrCreate(string key)
        {
            if (!Sessions.ContainsKey(key))
            {
                return CreateSession(key);
            }
            return Sessions[key];
        }
    }

    public class Session
    {
        public string Key { get; set; }
        public Dictionary<string, object> SessionData { get; private set; } = new Dictionary<string, object>();

        public T GetValueOrDefault<T>(string key)
        {
            return GetValueOrDefault<T>(key, default(T));
        }

        public T GetValueOrDefault<T>(string key, T defaultValue)
        {
            if (SessionData.ContainsKey(key) && SessionData[key] is T)
            {
                return (T)SessionData[key];
            }
            return defaultValue;
        }
    }
}
