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

        public IActionResult Help()
        {
            if (HttpContext.Request.RelativePath.Contains("HELP"))
            {
                return String("<h1>this is a help page</h1>".ToUpper(), MimeTypes.GetMimeType(".html"));
            }
            return String("<h1>this is a help page</h1>", MimeTypes.GetMimeType(".html"));
        }

        public IActionResult JsonTest()
        {
            return Json(new { hello = "Hello World" });
        }
    }
}
