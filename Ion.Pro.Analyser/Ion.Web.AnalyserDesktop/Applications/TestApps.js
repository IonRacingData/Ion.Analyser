var TestViewer = (function () {
    function TestViewer() {
    }
    TestViewer.prototype.main = function () {
        var _this = this;
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.app, "Test Window");
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
var ConfigWindow = (function () {
    function ConfigWindow() {
    }
    ConfigWindow.prototype.main = function (client) {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Configure window");
        this.mainWindow.setSize(330, 230);
        if (client.settings) {
            var _loop_1 = function (i) {
                var temp = client.settings[i];
                var row = document.createElement("div");
                row.style.margin = "10px";
                var text = document.createElement("span");
                if (temp.shortCut) {
                    text.appendChild(document.createTextNode(temp.text + " (" + temp.shortCut + ")"));
                }
                else {
                    text.appendChild(document.createTextNode(temp.text));
                }
                text.title = temp.longText;
                row.appendChild(text);
                switch (temp.type) {
                    case "boolean":
                        var sw = new Switch();
                        sw.checked = temp.value;
                        sw.onCheckedChange.addEventListener(function (e) {
                            temp.value = e.newValue;
                            client.settingsChanged(i, temp);
                        });
                        sw.wrapper.style.cssFloat = "right";
                        row.appendChild(sw.wrapper);
                        break;
                    case "action":
                        var but = new TextButton();
                        but.text = temp.text;
                        but.onclick.addEventListener(function () {
                            temp.value();
                            client.settingsChanged(i, temp);
                        });
                        but.wrapper.style.cssFloat = "right";
                        row.appendChild(but.wrapper);
                        break;
                    case "direction":
                        var btn = new TextButton();
                        btn.text = "Toggle";
                        btn.onclick.addEventListener(function () {
                            temp.value = temp.value === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
                            client.settingsChanged(i, temp);
                        });
                        btn.wrapper.style.cssFloat = "right";
                        row.appendChild(btn.wrapper);
                        break;
                }
                this_1.mainWindow.content.appendChild(row);
            };
            var this_1 = this;
            for (var i in client.settings) {
                _loop_1(i);
            }
        }
        else {
            console.log("That's not a configurable item");
        }
    };
    return ConfigWindow;
}());
var SVGEditor = (function () {
    function SVGEditor() {
        this.mk = new HtmlHelper();
        this.curLine = null;
    }
    SVGEditor.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.app, "SVG Editor");
        //this.window.content.addEventListener("click", (e) => this.mouseClick(e));
        this.window.content.addEventListener("mousedown", function (e) { return _this.mouseDown(e); });
        this.window.content.addEventListener("mousemove", function (e) { return _this.mouseMove(e); });
        this.window.content.addEventListener("mouseup", function (e) { return _this.mouseUp(e); });
        this.svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgCanvas.style.width = "100%";
        this.svgCanvas.style.height = "calc(100% - 5px)";
        this.window.content.appendChild(this.svgCanvas);
    };
    SVGEditor.prototype.mouseDown = function (e) {
        this.curLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        var a = this.curLine;
        a.x1.baseVal.value = e.layerX;
        a.x2.baseVal.value = e.layerX;
        a.y1.baseVal.value = e.layerY;
        a.y2.baseVal.value = e.layerY;
        a.style.stroke = "white";
        a.style.strokeWidth = "1px";
        this.svgCanvas.appendChild(a);
    };
    SVGEditor.prototype.mouseMove = function (e) {
        var a = this.curLine;
        if (a) {
            a.x2.baseVal.value = e.layerX;
            a.y2.baseVal.value = e.layerY;
        }
    };
    SVGEditor.prototype.mouseUp = function (e) {
        this.curLine = null;
    };
    SVGEditor.prototype.mouseClick = function (e) {
        console.log(e);
        var a = document.createElementNS("http://www.w3.org/2000/svg", "line");
        a.x1.baseVal.value = 0;
        a.x2.baseVal.value = e.layerX;
        a.y1.baseVal.value = 0;
        a.y2.baseVal.value = e.layerY;
        a.style.stroke = "white";
        a.style.strokeWidth = "1px";
        this.svgCanvas.appendChild(a);
    };
    return SVGEditor;
}());
/*class DataViewer implements IApplication {
    app: Application;
    window: AppWindow;
    data: ISensorPackage[];

    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.app, "Data Viewer");
        //kernel.senMan.getLoadedInfos((ids: SensorInformation[]) => this.draw(ids));
    }

    draw(data: SensorInformation[]): void {
        var mk = new HtmlHelper();

        var table = new HtmlTableGen("table");
        table.addHeader("ID", "Name", "Unit");

        for (var i = 0; i < data.length; i++) {
            let curValue = data[i];
            table.addRow([
                {
                    event: "click", func: () => {
                    }
                },
                (!curValue.Key ? { field: "className", data: "error" } : {})
            ],
                curValue.ID, curValue.Name, curValue.Unit ? curValue.Unit : "");
        }
        this.window.content.appendChild(table.generate());

        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
        //kernel.senMan.addEventListener(SensorManager.event_globalPlot, (data: ISensorPackage[]) => this.drawInner(data));
    }

    drawInner(data: ISensorPackage[]): void {
        this.innerTable.innerHTML = "";
        var gen = new HtmlTableGen("table");
        gen.addHeader("ID", "Value", "Timestamp");
        this.data = data;
        for (var i = 0; i < 10; i++) {
            gen.addRow(data[i].ID, data[i].Value, data[i].TimeStamp);
        }

        this.innerTable.appendChild(gen.generate());
    }
}*/
var CsvGenerator = (function () {
    function CsvGenerator() {
        this.mk = new HtmlHelper();
    }
    CsvGenerator.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.app, "CSV Creator");
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
var StorageTester = (function () {
    function StorageTester() {
    }
    StorageTester.prototype.main = function () {
    };
    return StorageTester;
}());
var LineChartTester = (function () {
    function LineChartTester() {
        this.plotType = "Line Chart";
        this.type = Point;
        this.dataCollectionSource = [];
        this.testWindow = new MenuWindow(document.body);
        this.darkTheme = true;
    }
    LineChartTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Line Chart");
        this.plotWindow.content.oncontextmenu = function (e) {
            _this.testWindow.x = e.x;
            _this.testWindow.y = e.y;
            _this.testWindow.show();
        };
        this.testWindow.add({
            name: "Change data", runner: function () {
                kernel.appMan.start("DataSourceBuilder", _this);
            },
        });
        this.testWindow.add({
            name: "Configure", runner: function () {
                kernel.appMan.start("ConfigWindow", _this.lineChart);
            },
        });
        this.window.content.style.overflow = "hidden";
        this.lineChart = new LineChartController();
        this.window.content.appendChild(this.lineChart.wrapper);
        this.lineChart.setSize(this.window.width, this.window.height);
        kernel.senMan.register(this);
        this.createEvents(this.app.events);
    };
    LineChartTester.prototype.window_close = function () {
        console.log("Unregister from sensys");
        kernel.senMan.unregister(this);
    };
    LineChartTester.prototype.dataUpdate = function () {
        this.lineChart.setData(this.dataCollectionSource);
    };
    LineChartTester.prototype.createEvents = function (eh) {
        var _this = this;
        eh.on(this.window.onResize, function () {
            _this.lineChart.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
        eh.on(kernel.winMan.onThemeChange, function () {
            _this.darkTheme = !_this.darkTheme;
            _this.lineChart.updateColors();
        });
    };
    return LineChartTester;
}());
var GaugeTester = (function () {
    function GaugeTester() {
        this.plotType = "Gauge";
        this.type = Point;
        this.dataSource = null;
        this.val = 0;
    }
    GaugeTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Gauge");
        var testWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = function (e) {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: function () {
                kernel.appMan.start("DataSourceBuilder", _this);
            },
        });
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);
        this.createEvents(this.app.events);
    };
    GaugeTester.prototype.createEvents = function (eh) {
        var _this = this;
        this.window.onResize.addEventListener(function () {
            _this.gauge.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
        this.app.events.on(kernel.winMan.onThemeChange, function () {
            _this.gauge.updateColors();
        });
    };
    GaugeTester.prototype.window_close = function () {
        kernel.senMan.unregister(this);
    };
    GaugeTester.prototype.drawMeter = function () {
        this.gauge = new GaugeController(this.window.width, this.window.height);
        var gaugeWrapper = this.gauge.wrapper;
        this.window.content.appendChild(gaugeWrapper);
    };
    GaugeTester.prototype.dataUpdate = function () {
        this.gauge.setData(this.dataSource);
    };
    return GaugeTester;
}());
var GPSPlotTester = (function () {
    function GPSPlotTester() {
        this.plotType = "GPS";
        this.type = Point3D;
        this.dataSource = null;
        this.points = [];
    }
    GPSPlotTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "GPS Viewer");
        var testWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = function (e) {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: function () {
                kernel.appMan.start("DataSourceBuilder", _this);
            },
        });
        this.window.content.style.overflow = "hidden";
        this.plot = new GPSController(this.window.width, this.window.height);
        this.window.content.appendChild(this.plot.wrapper);
        kernel.senMan.register(this);
        this.createEvents(this.app.events);
    };
    GPSPlotTester.prototype.createEvents = function (eh) {
        var _this = this;
        this.window.onResize.addEventListener(function () {
            _this.plot.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
    };
    GPSPlotTester.prototype.window_close = function () {
        kernel.senMan.unregister(this);
    };
    GPSPlotTester.prototype.dataUpdate = function () {
        this.plot.setData(this.dataSource);
    };
    return GPSPlotTester;
}());
var LabelTester = (function () {
    function LabelTester() {
        this.plotType = "Label";
        this.type = Point;
        this.dataSource = null;
        this.val = 0;
    }
    LabelTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Label");
        this.window.setSize(350, 180);
        var testWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = function (e) {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: function () {
                kernel.appMan.start("DataSourceBuilder", _this);
            },
        });
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.label = new LabelController(this.window.width, this.window.height);
        var div = this.label.wrapper;
        this.window.content.appendChild(div);
        this.createEvents(this.app.events);
    };
    LabelTester.prototype.createEvents = function (eh) {
        var _this = this;
        this.window.onResize.addEventListener(function () {
            _this.label.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
    };
    LabelTester.prototype.window_close = function () {
        kernel.senMan.unregister(this);
    };
    LabelTester.prototype.dataUpdate = function () {
        this.label.setData(this.dataSource);
    };
    return LabelTester;
}());
var BarTester = (function () {
    function BarTester() {
        this.plotType = "Bar Chart";
        this.type = Point;
        this.dataSource = null;
        this.val = 0;
    }
    BarTester.prototype.main = function () {
        var _this = this;
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Bar Chart");
        this.window.setSize(300, this.window.height);
        var testWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = function (e) {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: function () {
                kernel.appMan.start("DataSourceBuilder", _this);
            },
        });
        testWindow.add({
            name: "Configure", runner: function () {
                kernel.appMan.start("ConfigWindow", _this.bar);
            },
        });
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.bar = new BarController(this.window.width, this.window.height, Direction.Vertical);
        var barWrapper = this.bar.wrapper;
        this.window.content.appendChild(barWrapper);
        this.createEvents(this.app.events);
        /*
        barWrapper.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.key) {
                case "j":
                    this.val += 0.1;
                    break;
                case "k":
                    this.val -= 0.1;
            }

            this.val = this.val < 0 ? 0 : this.val;
            this.val = this.val > 1 ? 1 : this.val;
            this.bar.test_setValue(this.val);
        });*/
    };
    BarTester.prototype.createEvents = function (eh) {
        var _this = this;
        this.window.onResize.addEventListener(function () {
            _this.bar.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
    };
    BarTester.prototype.window_close = function () {
        kernel.senMan.unregister(this);
    };
    BarTester.prototype.dataUpdate = function () {
        this.bar.setData(this.dataSource);
    };
    return BarTester;
}());
var LegacyRPIManager = (function () {
    function LegacyRPIManager() {
        this.mk = new HtmlHelper();
    }
    LegacyRPIManager.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.app, "Legacy RPI Manager");
        var wrapper = this.mk.tag("div");
        wrapper.appendChild(this.mk.tag("button", "", [{
                event: "click",
                func: function (event) {
                    requestAction("ConnectLegacy", null);
                },
            }], "Connect"));
        wrapper.appendChild(this.mk.tag("button", "", [{
                event: "click",
                func: function (event) {
                    requestAction("Status", null);
                },
            }], "Status"));
        wrapper.appendChild(this.mk.tag("button", "", [{
                event: "click",
                func: function (event) {
                    requestAction("StartReceive", null);
                },
            }], "StartReceive"));
        wrapper.appendChild(this.mk.tag("button", "", [{
                event: "click",
                func: function (event) {
                    requestAction("StopReceive", null);
                },
            }], "StopReceive"));
        this.window.content.appendChild(wrapper);
    };
    return LegacyRPIManager;
}());
var SteeringWheelTester = (function () {
    function SteeringWheelTester() {
        this.plotType = "Steering Wheel";
        this.type = Point;
        this.dataSource = null;
        this.val = 0.5;
    }
    SteeringWheelTester.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.app, "Steering wheel");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.wheel = new SteeringWheelController(this.window.width, this.window.height);
        var wheelWrapper = this.wheel.wrapper;
        this.window.content.appendChild(wheelWrapper);
        this.wheel.setPer(this.val);
        //wheelWrapper.addEventListener("wheel", (e: WheelEvent) => {
        //    this.val -= e.deltaY / 100;
        //    this.val = this.val < 0 ? 0 : this.val;
        //    this.val = this.val > 1 ? 1 : this.val;
        //    this.wheel.setPer(this.val);
        //});
        this.createEvents(this.app.events);
    };
    SteeringWheelTester.prototype.createEvents = function (eh) {
        var _this = this;
        this.window.onResize.addEventListener(function () {
            _this.wheel.setSize(_this.window.width, _this.window.height);
        });
        eh.on(this.plotWindow.onClose, function () {
            _this.window_close();
        });
    };
    SteeringWheelTester.prototype.window_close = function () {
        kernel.senMan.unregister(this);
    };
    SteeringWheelTester.prototype.dataUpdate = function () {
        this.wheel.setData(this.dataSource);
    };
    return SteeringWheelTester;
}());
//# sourceMappingURL=TestApps.js.map