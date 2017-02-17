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
var CsvGenerator = (function () {
    function CsvGenerator() {
        this.mk = new HtmlHelper();
    }
    CsvGenerator.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "CSV Creator");
        this.draw();
    };
    CsvGenerator.prototype.createInput = function (inputType, name, value, checked, disabled) {
        if (checked === void 0) { checked = false; }
        if (disabled === void 0) { disabled = false; }
        var input = this.mk.tag("input");
        input.type = inputType;
        input.checked = checked;
        input.name = name;
        input.value = value;
        input.disabled = disabled;
        return input;
    };
    CsvGenerator.prototype.createContainer = function (container) {
        var childs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            childs[_i - 1] = arguments[_i];
        }
        var element = this.mk.tag(container);
        for (var _a = 0, childs_1 = childs; _a < childs_1.length; _a++) {
            var a = childs_1[_a];
            if (Array.isArray(a)) {
                for (var _b = 0, a_1 = a; _b < a_1.length; _b++) {
                    var b = a_1[_b];
                    element.appendChild(b);
                }
            }
            else {
                element.appendChild(a);
            }
        }
        return element;
    };
    CsvGenerator.prototype.createFieldSet = function (legende) {
        var childs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            childs[_i - 1] = arguments[_i];
        }
        return this.createContainer("fieldset", this.mk.tag("legend", "", null, legende), childs);
    };
    CsvGenerator.prototype.createLabelWithContent = function () {
        var childs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            childs[_i] = arguments[_i];
        }
        return this.createContainer("label", childs);
    };
    CsvGenerator.prototype.draw = function () {
        var form = this.mk.tag("form");
        form.action = "/test/csv";
        form.method = "GET";
        // let formatFields = <HTMLFieldSetElement>this.mk.tag("fieldset");
        // formatFields.appendChild(this.mk.tag("legende", "", null, "Format"));
        var formatFields = this.createFieldSet("Format", this.createLabelWithContent(this.createInput("radio", "encoding", "nor", true), this.mk.tag("span", "", null, "Semicolon seperated")), this.mk.tag("br"), this.createLabelWithContent(this.createInput("radio", "encoding", "int"), this.mk.tag("span", "", null, "Comma seperated")));
        var valueFields = this.createFieldSet("Values", this.createLabelWithContent(this.createInput("radio", "values", "real", true), this.mk.tag("span", "", null, "Real Values")), this.mk.tag("br"), this.createLabelWithContent(this.createInput("radio", "values", "raw", false, true), this.mk.tag("span", "disabled", null, "Raw Values")));
        var titleLabel = this.createLabelWithContent(this.createInput("checkbox", "title", "checked", true), this.mk.tag("span", "", null, "Raw Values"));
        var submit = this.createInput("submit", "", "Download csv");
        form.appendChild(formatFields);
        form.appendChild(valueFields);
        form.appendChild(titleLabel);
        form.appendChild(this.mk.tag("br"));
        form.appendChild(submit);
        this.window.content.appendChild(form);
    };
    return CsvGenerator;
}());
var LineChartTester = (function () {
    function LineChartTester() {
        this.eh = new EventHandler();
        this.plotData = [];
        this.plotType = "Plot";
        this.plotDataType = PlotType.I1D;
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
        this.plotType = "GaugePlot";
        this.plotDataType = PlotType.I1D;
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
        var _this = this;
        // this.window.content.innerHTML = "";                        
        this.gauge = new GaugeController(this.window.width, this.window.height, 0, 200, 20);
        var gaugeWrapper = this.gauge.generate();
        this.window.content.appendChild(gaugeWrapper);
        gaugeWrapper.addEventListener("wheel", function (e) {
            _this.val -= e.deltaY / 3;
            _this.val = _this.val > 100 ? 100 : _this.val;
            _this.val = _this.val < 0 ? 0 : _this.val;
            _this.gauge.setValue(_this.val);
        });
    };
    GaugeTester.prototype.dataUpdate = function () {
        this.gauge.setValue((this.plotData.getValue(this.plotData.getLength() - 1).y / 200) * 100);
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
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.plot.setSize(_this.window.width, _this.window.height);
        });
    };
    GPSPlotTester.prototype.draw = function (p) {
        this.testData = new GPSPlotData(p);
        this.plot = new GPSController(this.testData);
        // console.log(this.testData);
        this.window.content.appendChild(this.plot.generate());
        this.plot.setSize(this.window.width, this.window.height);
        // this.plot.draw();
    };
    GPSPlotTester.prototype.update = function (p) {
        this.testData = new GPSPlotData(p);
        this.plot.update(this.testData);
    };
    return GPSPlotTester;
}());
var LabelTester = (function () {
    function LabelTester() {
        this.val = 0;
    }
    LabelTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "LabelTester");
        this.window.content.style.overflow = "hidden";
        this.label = new LabelController(this.window.width, this.window.height);
        var div = this.label.generate();
        this.window.content.appendChild(div);
        this.label.setValue(this.val);
        div.addEventListener("wheel", function (e) {
            _this.val -= e.deltaY;
            _this.label.setValue(_this.val);
        });
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.label.setSize(_this.window.width, _this.window.height);
        });
    };
    return LabelTester;
}());
var BarTester = (function () {
    function BarTester() {
        this.val = 0;
    }
    BarTester.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "BarTester");
        this.window.content.style.overflow = "hidden";
        this.bar = new BarController(this.window.width, this.window.height, true, true);
        var barWrapper = this.bar.generate();
        this.window.content.appendChild(barWrapper);
        this.bar.setValue(this.val);
        // for testing    
        barWrapper.addEventListener("wheel", function (e) {
            _this.val -= e.deltaY / 100;
            _this.val = _this.val > 1 ? 1 : _this.val;
            _this.val = _this.val < -1 ? -1 : _this.val;
            _this.bar.setValue(_this.val);
        });
        this.window.addEventListener(AppWindow.event_resize, function () {
            _this.bar.setSize(_this.window.width, _this.window.height);
        });
    };
    return BarTester;
}());
//# sourceMappingURL=TestApps.js.map