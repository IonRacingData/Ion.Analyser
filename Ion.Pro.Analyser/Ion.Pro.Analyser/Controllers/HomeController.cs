using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {

            return View("index");
        }

        public IActionResult Help(string arg, string firstname)
        {
            int counter = HttpContext.Session.GetValueOrDefault<int>("counter");
            counter++;
            HttpContext.Session.SessionData["counter"] = counter;

            if (HttpContext.Request.RelativePath.Contains("HELP"))
            {
                return String("<h1>this is a help page</h1>".ToUpper(), MimeTypes.GetMimeType(".html"));
            }
            return String("<h1>this is a help page</h1><div>Number of requests: " + counter.ToString() + "</div><div>Arg argument: " + arg + " " + firstname + "</div>", MimeTypes.GetMimeType(".html"));
        }

        public IActionResult JsonTest()
        {
            return Json(new { hello = "Hello World" });
        }
    }
}
