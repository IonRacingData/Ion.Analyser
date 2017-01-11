using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Net = System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Ion.Pro.Analyser.Data;

namespace Ion.Pro.Analyser
{
    class Program
    {        
        static Dictionary<string, Type> controllers = new Dictionary<string, Type>();

        static string DefaultAction = "index";
        static string DefaultPath = "/home/index";
        //static string ContentPath = "../../Content/";
        static string ContentPath = "../../../Ion.Web.AnalyserDesktop/";

        static void Main(string[] args)
        {
            InsertSensorTestData();
            InitControllers();
            HttpServer server = new HttpServer();
            server.Bind(Net.IPAddress.Any, 4562, WebHandlerAsync);
            Console.Read();
        }

        static void InsertSensorTestData()
        {
            LegacySensorReader reader = new LegacySensorReader("../../Data/126_usart_data.iondata");

            SensorDataStore store = SensorDataStore.GetDefault();
            if (true)
            {
                store.AddRange(reader.ReadPackages());
            }
            else
            {
                store.Add(new SensorPackage() { ID = 1, Value = 1, TimeStamp = 1 });
                store.Add(new SensorPackage() { ID = 2, Value = 5, TimeStamp = 1 });
                store.Add(new SensorPackage() { ID = 3, Value = 10, TimeStamp = 1 });
                store.Add(new SensorPackage() { ID = 1, Value = 6, TimeStamp = 2 });
                store.Add(new SensorPackage() { ID = 2, Value = 10, TimeStamp = 2 });
                store.Add(new SensorPackage() { ID = 3, Value = 100, TimeStamp = 2 });
                store.Add(new SensorPackage() { ID = 1, Value = 100, TimeStamp = 3 });
                store.Add(new SensorPackage() { ID = 2, Value = 2, TimeStamp = 3 });
                store.Add(new SensorPackage() { ID = 3, Value = 1000, TimeStamp = 3 });
            }
        }

        static HttpAction testAction = null;
        static SessionService service = new SessionService();

        public static async Task WebHandlerAsync(HttpWrapper wrapper)
        {
            wrapper.Watch.Mark("Entered handler");
            ProtocolReader reader = new ProtocolReader(wrapper.Client.GetStream());

            TimingService Watch = wrapper.Watch;

            HttpHeaderRequest request = await Task.Run(() => HttpHeaderRequest.ReadFromProtocolReader(reader));
            Watch.Mark("Read and parsed http");
            HttpHeaderResponse response = HttpHeaderResponse.CreateDefault(HttpStatus.OK200);
            HttpContext context = new HttpContext() { Request = request, Response = response, Wrapper = wrapper };

            HandleSession(context);

            Watch.Mark("Handle Session");

            HandleContext(context, Watch);
        }

        private static void HandleSession(HttpContext context)
        {
            Session s;
            if (context.Request.Cookies.ContainsKey(SessionService.sessionKey))
            {
                s = service.GetOrCreate(context.Request.Cookies[SessionService.sessionKey]);
            }
            else
            {
                s = service.CreateSession();
                context.Response.SetCookie.Add(new HttpCookie() { Key = SessionService.sessionKey, Value = s.Key });
            }
            context.Session = s;
        }

        private static void HandleContext(HttpContext context, TimingService Watch)
        {
            Stream s = context.Wrapper.Client.GetStream();
            Watch.Mark("Got stream");

            IActionResult result = HandleResult(context, Watch);
            Watch.Mark("Finished handling request");

            Task t = result.ExecuteResultAsync(new ActionContext() { HttpContext = context });
            t.Wait();
            Watch.Mark("Finished Result run");

            byte[] data = context.Response.GetBytes();
            s.Write(data, 0, data.Length);

            s.Flush();
            s.Close();
            context.Wrapper.Client.Close();

            Watch.Stop();

            Console.WriteLine($"Request \"{context.Request.FullRelativePath}\" handled in: {Watch.Watch.ElapsedTicks / 10}µs");

            bool printTimes = true;
            if (printTimes)
            {
                PrintTimes(Watch);
            }
        }

        private static IActionResult HandleResult(HttpContext context, TimingService Watch)
        {
            string requestPath = context.Request.RelativePath;
            FileInfo fi = new FileInfo(Path.Combine(ContentPath, context.Request.RelativePath.Remove(0, 1)));
            IActionResult result;
            Watch.Mark("Prepared variables");
            if (fi.Exists)
            {
                result = new FileResult(fi.FullName);
                Watch.Mark("Created File Result");
            }
            else
            {
                context.Response.ContentType = MimeTypes.GetMimeType(".html");

                //{Controller}/{Action}
                string[] requestParts = (requestPath.Length == 1 ? DefaultPath : requestPath ).Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);

                if (requestParts.Length > 0 && controllers.ContainsKey(requestParts[0].ToLower()))
                {
                    string requestAction = (requestParts.Length > 1) ? requestParts[1].ToLower() : DefaultAction;

                    Controller temp = (Controller)Activator.CreateInstance(controllers[requestParts[0].ToLower()]);
                    temp.HttpContext = context;

                    result = InvokeAction(temp, temp.AllActions[requestAction], context);
                    
                    //result = ((HttpAction)temp.AllActions[requestAction].CreateDelegate(typeof(HttpAction), temp))();
                    Watch.Mark("Created Http Action Result");
                }
                else
                {
                    result = new ErrorResult(HttpStatus.NotFound404, "");
                    Watch.Mark("Created Error Result");
                }
            }
            return result;
        }

        private static IActionResult InvokeAction(Controller controller, MethodInfo info, HttpContext context)
        {
            List<object> allData = new List<object>();
            ParameterInfo[] param = info.GetParameters();
            foreach (ParameterInfo paramInfo in param)
            {
                string name = paramInfo.Name;
                if (context.Request.GETParameters.ContainsKey(name))
                {
                    allData.Add(context.Request.GETParameters[name]);
                }
                else
                {
                    allData.Add(null);
                }
            }
            return (IActionResult)info.Invoke(controller, allData.ToArray());
        }

        private static void PrintTimes(TimingService Watch)
        {
            long lastTime = 0;
            StringBuilder builder = new StringBuilder();
            foreach (Tuple<long, string> record in Watch.Records)
            {
                builder.AppendLine($"\t{record.Item1 / 10.0}µs (+{(record.Item1 - lastTime) / 10.0}µs) {record.Item2}");
                lastTime = record.Item1;
            }
            Console.WriteLine(builder.ToString());
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

    public class SensorDataStore
    {
        List<SensorPackage> allPackages = new List<SensorPackage>();

        static Singelton<SensorDataStore> instance = new Singelton<SensorDataStore>();
        public static SensorDataStore GetDefault()
        {
            return instance.Value;
        }

        public void Add(SensorPackage data)
        {
            allPackages.Add(data);
        }

        public SensorPackageViewModel[] GetViews()
        {
            List<SensorPackageViewModel> allViews = new List<SensorPackageViewModel>();
            foreach(SensorPackage sp in allPackages)
            {
                allViews.Add(sp.GetObject());
            }
            return allViews.ToArray();
        }

        public void AddRange(IEnumerable<SensorPackage> sensorPackage)
        {
            allPackages.AddRange(sensorPackage);
        }
    }
}
