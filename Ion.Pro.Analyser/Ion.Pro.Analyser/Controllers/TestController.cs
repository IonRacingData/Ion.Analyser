﻿using System;
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
    }
}