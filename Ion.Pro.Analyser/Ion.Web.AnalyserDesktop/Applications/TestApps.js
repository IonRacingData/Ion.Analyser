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
            ], curValue.ID, curValue.Name, curValue.Unit ? "" : curValue.Unit);
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
        //gen.addArray(data, ["ID", "Value", "TimeStamp"]);
        this.innerTable.appendChild(gen.generate());
    };
    return DataViewer;
}());
var PlotViewer = (function () {
    function PlotViewer() {
    }
    PlotViewer.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Plot window");
        this.innerChart = document.createElement("div");
        this.window.content.appendChild(this.innerChart);
        google.charts.load("current", { "packages": ["corechart"] });
        google.charts.setOnLoadCallback(function () { return _this.loadData(); });
    };
    PlotViewer.prototype.loadData = function () {
        var _this = this;
        requestAction("getdata?number=61445", function (data) { return _this.drawChart(data); });
    };
    PlotViewer.prototype.drawChart = function (sensorData) {
        var preData = [["Time stamp", "Value"]];
        for (var i = 1; i < 30; i++) {
            preData[i] = [(sensorData[i].TimeStamp / 1000).toString() + "s", sensorData[i].Value];
        }
        var data = google.visualization.arrayToDataTable(preData);
        /*var data = google.visualization.arrayToDataTable([
            ["Year", "Sales", "Expenses"],
            ["2004", 1000, 400],
            ['2005', 1170, 460],
            ['2006', 660, 1120],
            ['2007', 1030, 540]
        ]);*/
        var options = {
            title: "Sensor package 61457",
            curveType: "function",
            legende: { position: "bottom" }
        };
        var chart = new google.visualization.LineChart(this.innerChart);
        chart.draw(data, options);
    };
    return PlotViewer;
}());
var PlotterTester = (function () {
    function PlotterTester() {
        this.eh = new EventHandler();
        this.plotData = [];
        this.plotType = "Plot";
    }
    PlotterTester.prototype.main = function () {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Plotter Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.createEvents(this.eh);
        this.plotter = new Plotter(this.plotData);
        this.window.content.appendChild(this.plotter.generatePlot());
        this.plotter.setSize(this.window.width, this.window.height);
        /*var data: ISensorPackage[] = [
            { ID: 111, TimeStamp: 2000, Value: 54 },
            { ID: 111, TimeStamp: 2100, Value: 67 },
            { ID: 111, TimeStamp: 2200, Value: 21 },
            { ID: 111, TimeStamp: 2300, Value: 12 },
            { ID: 111, TimeStamp: 2400, Value: 15 },
            { ID: 111, TimeStamp: 2500, Value: 87 }
        ];*/
        //this.loadData();
        //this.drawChart(data);
    };
    PlotterTester.prototype.dataUpdate = function () {
        this.plotter.draw();
        /*this.window.content.innerHTML = "";
        this.plotter = new Plotter(this.plotData);
        this.window.content.appendChild(this.plotter.generatePlot());
        this.plotter.setSize(this.window.width, this.window.height);*/
    };
    PlotterTester.prototype.createEvents = function (eh) {
        var _this = this;
        eh.on(this.window, AppWindow.event_resize, function () {
            _this.plotter.setSize(_this.window.width, _this.window.height);
            //this.plotter.canvas.width = this.window.width;
            //this.plotter.canvas.height = this.window.height;
            //this.plotter.draw();
        });
        eh.on(this.window, AppWindow.event_close, function () {
            _this.close();
        });
    };
    PlotterTester.prototype.close = function () {
        this.eh.close();
    };
    PlotterTester.prototype.loadData = function () {
        var _this = this;
        kernel.senMan.addEventListener(SensorManager.event_globalPlot, function (data) { return _this.drawChart(data); });
        //kernel.senMan.getData(841, (data: ISensorPackage[]) => this.drawChart(data));
        //requestAction("getdata?number=841", (data: ISensorPackage[]) => this.drawChart(data));
    };
    PlotterTester.prototype.drawChart = function (data) {
        this.data = data;
        this.window.content.innerHTML = "";
        var plotData = new PlotData([]);
        for (var i = 0; i < data.length; i++) {
            plotData.points[i] = new Point(data[i].TimeStamp, data[i].Value);
        }
        this.plotter = new Plotter([plotData]);
        this.window.content.appendChild(this.plotter.generatePlot());
        this.plotter.setSize(this.window.width, this.window.height);
        //this.plotter.draw();
    };
    return PlotterTester;
}());
var WebSocketTest = (function () {
    function WebSocketTest() {
    }
    WebSocketTest.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Web Socket test");
    };
    return WebSocketTest;
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
var MeterTester = (function () {
    function MeterTester() {
        this.val = 0;
    }
    MeterTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Meter Tester");
        this.window.content.style.overflow = "hidden";
        /*
        let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", () => {
            let val = slider.value;
            this.gauge.drawNeedle(parseInt(val));
        });*/
        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);
        this.gauge.wrapper.addEventListener("wheel", function (e) {
            _this.val -= e.deltaY / 3;
            _this.val = _this.val > 100 ? 100 : _this.val;
            _this.val = _this.val < 0 ? 0 : _this.val;
            _this.gauge.drawNeedle(_this.val);
        });
        this.window.eventMan.addEventListener(AppWindow.event_resize, function () {
            _this.gauge.setSize(_this.window.width, _this.window.height);
            //this.plotter.draw();
        });
    };
    MeterTester.prototype.drawMeter = function () {
        //this.window.content.innerHTML = "";                        
        this.gauge = new GaugePlot(this.window.width, this.window.height, 0, 200, 20);
        this.window.content.appendChild(this.gauge.generate());
    };
    return MeterTester;
}());
var GPSPlotTester = (function () {
    function GPSPlotTester() {
        this.points = [];
    }
    GPSPlotTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "GPSPlot Tester");
        this.window.content.style.overflow = "hidden";
        /*let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", () => {
            let val = parseInt(slider.value);
            let p: Point3D[] = [];
            p = this.points.slice(0, (this.points.length * val) / 100);
            this.update(p);
        });*/
        kernel.senMan.getData(252, function (d) {
            for (var i = 0; i < d.length; i++) {
                _this.points.push(new Point3D(d[i].TimeStamp, d[i].Value, 1));
            }
            _this.draw(_this.points);
        });
        this.window.eventMan.addEventListener(AppWindow.event_resize, function () {
            _this.plot.setSize(_this.window.width, _this.window.height);
        });
    };
    GPSPlotTester.prototype.draw = function (p) {
        this.testData = new GPSPlotData(p);
        this.plot = new GPSPlot(this.testData);
        //console.log(this.testData);
        this.window.content.appendChild(this.plot.generate());
        this.plot.setSize(this.window.width, this.window.height);
        //this.plot.draw();
    };
    GPSPlotTester.prototype.update = function (p) {
        this.testData = new GPSPlotData(p);
        this.plot.update(this.testData);
    };
    return GPSPlotTester;
}());
//# sourceMappingURL=TestApps.js.map