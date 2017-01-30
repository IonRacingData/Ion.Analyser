var DataViewer = (function () {
    function DataViewer() {
    }
    DataViewer.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        kernel.senMan.getIds(function (data) { return _this.draw(data); });
    };
    DataViewer.prototype.draw = function (data) {
        var _this = this;
        var mk = new HtmlHelper();
        var _loop_1 = function () {
            var curValue = data[i];
            a = mk.tag("span", "taskbar-button-text", null, curValue.toString());
            a.onclick = function () {
                kernel.senMan.setGlobal(curValue);
                //kernel.senMan.getData(curValue, (data: ISensorPackage[]) => this.drawInner(data));
                //requestAction("GetData?number=" + curValue.toString(), (data: ISensorPackage[]) => this.drawInner(data))
            };
            this_1.window.content.appendChild(a);
        };
        var this_1 = this, a;
        for (var i = 0; i < data.length; i++) {
            _loop_1();
        }
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
    }
    PlotterTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Plotter Tester");
        this.window.content.style.overflow = "hidden";
        this.window.eventMan.addEventListener(AppWindow.event_resize, function () {
            _this.plotter.setSize(_this.window.width, _this.window.height);
            //this.plotter.draw();
        });
        /*var data: ISensorPackage[] = [
            { ID: 111, TimeStamp: 2000, Value: 54 },
            { ID: 111, TimeStamp: 2100, Value: 67 },
            { ID: 111, TimeStamp: 2200, Value: 21 },
            { ID: 111, TimeStamp: 2300, Value: 12 },
            { ID: 111, TimeStamp: 2400, Value: 15 },
            { ID: 111, TimeStamp: 2500, Value: 87 }
        ];*/
        this.loadData();
        //this.drawChart(data);
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
        var socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");
        socket.onmessage = function (ev) {
            console.log(ev);
            console.log(ev.data);
        };
        socket.onopen = function (ev) {
            socket.send("Hello World from a web socket :D, and this is a realy realy long message, so we can provoke it to send it as a longer message, to check that everything works");
        };
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
        this.window.content.appendChild(this.mk.tag("h1", "", null, "He llo World"));
    };
    return TestViewer;
}());
var MeterTester = (function () {
    function MeterTester() {
    }
    MeterTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Meter Tester");
        this.window.content.style.overflow = "hidden";
        this.drawMeter();
        var slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", function () {
            var val = slider.value;
            _this.meterPlot.drawNeedle(parseInt(val));
        });
        this.window.eventMan.addEventListener(AppWindow.event_resize, function () {
            _this.meterPlot.setSize(_this.window.width);
            //this.plotter.draw();
        });
    };
    MeterTester.prototype.drawMeter = function () {
        this.window.content.innerHTML = "";
        var labels = [];
        for (var i = 0; i <= 280; i += 20) {
            labels.push(i.toString());
        }
        this.meterPlot = new MeterPlot(250, labels);
        this.window.content.appendChild(this.meterPlot.generate());
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
        var slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", function () {
            var val = parseInt(slider.value) * 5;
            _this.points.push(new Point3D(val, 5 + (val * 0.03) * (val * 0.03), 1));
            _this.testData = new GPSPlotData(_this.points);
            _this.update();
        });
        this.draw();
    };
    GPSPlotTester.prototype.draw = function () {
        //this.window.content.innerHTML = "";
        /*this.points: Point3D[] = [
            new Point3D(10, 30, 1),
            new Point3D(12, 30, 1),
            new Point3D(15, 32, 1),
            new Point3D(18, 31, 1),
            new Point3D(30, 50, 1),
            new Point3D(60, 47, 1),
            new Point3D(72, 44, 1),
            new Point3D(100, 33, 1),
        ];*/
        this.testData = new GPSPlotData(this.points);
        this.plot = new GPSPlot(this.testData);
        this.window.content.appendChild(this.plot.generate());
    };
    GPSPlotTester.prototype.update = function () {
        this.plot.update(this.testData);
    };
    return GPSPlotTester;
}());
//# sourceMappingURL=TestApps.js.map