var DataViewer = (function () {
    function DataViewer() {
    }
    DataViewer.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        kernel.senMan.getLoadedInfos(function (ids) { return _this.draw(ids); });
    };
    DataViewer.prototype.draw = function (data) {
        var _this = this;
        var mk = new HtmlHelper();
        var table = new HtmlTableGen("table");
        table.addHeader("ID", "Name", "Unit");
        var _loop_1 = function () {
            var curValue = data[i];
            table.addRow([
                {
                    event: "click", func: function () {
                        kernel.senMan.setGlobal(curValue.ID);
                    }
                },
                (!curValue.Key ? { field: "className", data: "error" } : {})
            ], curValue.ID, curValue.Name, curValue.Unit ? curValue.Unit : "");
        };
        for (var i = 0; i < data.length; i++) {
            _loop_1();
        }
        this.window.content.appendChild(table.generate());
        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
        kernel.senMan.addEventListener(SensorManager.event_globalPlot, function (data) { return _this.drawInner(data); });
    };
    DataViewer.prototype.drawInner = function (data) {
        this.innerTable.innerHTML = "";
        var gen = new HtmlTableGen("table");
        gen.addHeader("ID", "Value", "Timestamp");
        this.data = data;
        for (var i = 0; i < 10; i++) {
            gen.addRow(data[i].ID, data[i].Value, data[i].TimeStamp);
        }
        this.innerTable.appendChild(gen.generate());
    };
    return DataViewer;
}());
var LineChartTester = (function () {
    function LineChartTester() {
        this.eh = new EventHandler();
        this.plotData = [];
        this.plotType = "Plot";
    }
    LineChartTester.prototype.main = function () {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Line Chart Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.createEvents(this.eh);
        this.lineChart = new LineChartController();
        this.window.content.appendChild(this.lineChart.generate());
        this.lineChart.setSize(this.window.width, this.window.height);
    };
    LineChartTester.prototype.dataUpdate = function () {
        this.lineChart.setData(this.plotData);
    };
    LineChartTester.prototype.createEvents = function (eh) {
        var _this = this;
        eh.on(this.window, AppWindow.event_resize, function () {
            _this.lineChart.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.window, AppWindow.event_close, function () {
            _this.close();
        });
    };
    LineChartTester.prototype.close = function () {
        this.eh.close();
    };
    return LineChartTester;
}());
var TestViewer = (function () {
    function TestViewer() {
    }
    TestViewer.prototype.main = function () {
        var _this = this;
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");
        requestAction("hello", function (data) {
            _this.helloData = data;
            _this.draw();
        });
    };
    TestViewer.prototype.draw = function () {
        this.window.content.innerHTML = "";
        this.window.content.appendChild(this.mk.tag("h1", "", null, this.helloData.Text));
    };
    return TestViewer;
}());
var GaugeTester = (function () {
    function GaugeTester() {
        this.val = 0;
        this.plotType = "Gauge";
    }
    GaugeTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Gauge Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.gauge.setSize(_this.window.width, _this.window.height);
        });
    };
    GaugeTester.prototype.drawMeter = function () {
        this.gauge = new GaugeController(this.window.width, this.window.height, 0, 200, 20);
        var gaugeWrapper = this.gauge.generate();
        this.window.content.appendChild(gaugeWrapper);
    };
    GaugeTester.prototype.dataUpdate = function () {
        this.gauge.setData(this.plotData);
    };
    return GaugeTester;
}());
var GPSPlotTester = (function () {
    function GPSPlotTester() {
        this.points = [];
    }
    GPSPlotTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "GPSPlot Tester");
        this.window.content.style.overflow = "hidden";
        this.plot = new GPSController(this.window.width, this.window.height);
        this.window.content.appendChild(this.plot.generate());
        kernel.senMan.getData(252, function (d) {
            for (var i = 0; i < d.length; i++) {
                _this.points.push(new Point3D(d[i].TimeStamp, d[i].Value, 1));
            }
            _this.testData = new GPSPlotData(_this.points);
            _this.draw();
        });
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.plot.setSize(_this.window.width, _this.window.height);
        });
    };
    GPSPlotTester.prototype.draw = function () {
        this.plot.setData(this.testData);
        //this.plot.setSize(this.window.width, this.window.height);
    };
    return GPSPlotTester;
}());
var LabelTester = (function () {
    function LabelTester() {
        this.val = 0;
        this.plotType = "Label";
    }
    LabelTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "LabelTester");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.label = new LabelController(this.window.width, this.window.height);
        var div = this.label.generate();
        this.window.content.appendChild(div);
        /*
        div.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY;
            this.label.setValue(this.val);
        });*/
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.label.setSize(_this.window.width, _this.window.height);
        });
    };
    LabelTester.prototype.dataUpdate = function () {
        this.label.setData(this.plotData);
    };
    return LabelTester;
}());
var BarTester = (function () {
    function BarTester() {
        this.val = 0;
        this.plotType = "Bar";
    }
    BarTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "BarTester");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.bar = new BarController(this.window.width, this.window.height, Direction.Horizontal);
        var barWrapper = this.bar.generate();
        this.window.content.appendChild(barWrapper);
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.bar.setSize(_this.window.width, _this.window.height);
        });
    };
    BarTester.prototype.dataUpdate = function () {
        this.bar.setData(this.plotData);
    };
    return BarTester;
}());
var SteeringWheelTester = (function () {
    function SteeringWheelTester() {
        this.val = 0.5;
        this.plotType = "Bar";
    }
    SteeringWheelTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "BarTester");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.wheel = new SteeringWheelController(this.window.width, this.window.height);
        var wheelWrapper = this.wheel.generate();
        this.window.content.appendChild(wheelWrapper);
        this.wheel.setPer(this.val);
        wheelWrapper.addEventListener("wheel", function (e) {
            _this.val -= e.deltaY / 100;
            _this.val = _this.val < 0 ? 0 : _this.val;
            _this.val = _this.val > 1 ? 1 : _this.val;
            _this.wheel.setPer(_this.val);
        });
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.wheel.setSize(_this.window.width, _this.window.height);
        });
    };
    SteeringWheelTester.prototype.dataUpdate = function () {
        this.wheel.setData(this.plotData);
    };
    return SteeringWheelTester;
}());
//# sourceMappingURL=TestApps.js.map