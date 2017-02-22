using Ion.Pro.Analyser.Data;
using Ion.Pro.Analyser.SenSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser.Controllers
{
    class TestController : Controller
    {
        public IActionResult Index()
        {
            return View("index");
        }

        public IActionResult Hello()
        {
            return Json(new { Text = "Hello World" });
        }

        public IActionResult GetIds()
        {
            return Json(SensorDataStore.GetDefault().GetIds().OrderBy(x => x.ID));
        }

        public IActionResult GetLoadedIds()
        {
            return Json(SensorDataStore.GetDefault().GetLoadedIds().OrderBy(x => x));
        }

        public IActionResult GetData(string number)
        {
            SensorPackageViewModel[] sensorData = new SensorPackageViewModel[0];
            int id;
            if (number.Length > 0 && int.TryParse(number, out id))
            {
                sensorData = SensorDataStore.GetDefault().GetViews(id);
            }
            return Json(sensorData);
        }

        public IActionResult GetAvaiableSets()
        {
            return Json(SensorDataStore.GetDefault().AvailableDataSets());
        }

        public IActionResult LoadDataset(string file)
        {
            SensorDataStore.GetDefault().LoadNewData(file);
            return String("OK");
        }

        public IActionResult Csv(string encoding, string values, string title)
        {
            string result = SensorDataStore.GetDefault().CreateCsv(encoding == "nor", title == "checked");

            return File(Encoding.Default.GetBytes(result), "data_" + values + ".csv", true);
        }
    }
}
