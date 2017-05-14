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

        public IActionResult Available()
        {
            return Json(new { });
        }

        public IActionResult LoadNewDataSet(string file)
        {
            return Json(((object)SensorDataSetInformation.FromSensorDataSet(SensorManager.GetDefault().Load(file))) ?? new { Data = "Not available" });
        }

        public IActionResult GetSensorInformation()
        {
            return Json(new { });
        }



        public IActionResult Csv(string encoding, string values, string title)
        {
            string result = SensorDataStore.GetDefault().CreateCsv(encoding == "nor", title == "checked");

            return File(Encoding.Default.GetBytes(result), "data_" + values + ".csv", true);
        }



        #region LegacySSHManager
        public IActionResult ConnectLegacy()
        {
            if (Program.rpiManager != null)
            {
                Program.rpiManager.Connect();
                return Json(new { Status = "OK" });
            }
            return Json(new { Status = "Not available" });
        }

        public IActionResult Status()
        {
            if (Program.rpiManager == null)
            {
                return Json(new { Status = "Not available" });
            }
            else if (Program.rpiManager.Connected)
            {
                return Json(new { Status = "Connected" });
            }
            else// if (!Program.rpiManager.connected)
            {
                return Json(new { Status = "Not Connected" });
            }
        }

        public IActionResult StartReceive()
        {
            if (Program.rpiManager != null)
            {
                Program.rpiManager.StartReceive();
                return Json(new { Status = "OK" });
            }
            return Json(new { Status = "Not available" });
        }

        public IActionResult StopReceive()
        {
            if (Program.rpiManager != null)
            {
                Program.rpiManager.Stop();
                return Json(new { Status = "OK" });
            }
            return Json(new { Status = "Not available" });
        }
        #endregion

    }

    public class SensorDataSetInformation
    {
        public string Name { get; set; }
        public List<NewSensorInformation> AllInfos { get; set; } = new List<NewSensorInformation>();
        public List<string> LoadedKeys { get; set; } = new List<string>();

        public static SensorDataSetInformation FromSensorDataSet(SensorDataSet set)
        {
            if (set == null)
                return null;
            return new SensorDataSetInformation()
            {
                Name = set.Name,
                AllInfos = set.AllInfos.Values.ToList(),
                LoadedKeys = set.AllData.Keys.ToList()
            };
            
        }
    }
}
