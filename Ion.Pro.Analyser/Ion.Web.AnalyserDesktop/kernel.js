var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var kernel;
var Component = (function () {
    function Component() {
    }
    return Component;
}());
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        var _this = _super.call(this) || this;
        _this.onclick = newEvent("Button.onclick");
        _this.wrapper = document.createElement("div");
        var span = document.createElement("span");
        _this.wrapper.className = "comp-button";
        _this.textNode = document.createTextNode("button");
        span.appendChild(_this.textNode);
        _this.wrapper.appendChild(span);
        _this.wrapper.onclick = _this.onclick;
        return _this;
    }
    Object.defineProperty(Button.prototype, "text", {
        get: function () {
            if (this.textNode.nodeValue)
                return this.textNode.nodeValue;
            else
                throw "textNode.nodeValue is null";
        },
        set: function (value) {
            this.textNode.nodeValue = value;
        },
        enumerable: true,
        configurable: true
    });
    return Button;
}(Component));
var ListBox = (function (_super) {
    __extends(ListBox, _super);
    function ListBox() {
        var _this = _super.call(this) || this;
        _this.selector = null;
        _this.onItemClick = newEvent("ListBox.onItemClick");
        _this.wrapper = document.createElement("ul");
        _this.wrapper.className = "comp-listBox";
        return _this;
    }
    Object.defineProperty(ListBox.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            /*let oldPush = data.push;
            let box = this;
            data.push = function push(...items: any[]): number {
                let num = oldPush.apply(data, items);
                box.generateList();
                return num;
            }*/
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ListBox.prototype.update = function () {
        this.generateList();
    };
    ListBox.prototype.generateList = function () {
        var _this = this;
        this.wrapper.innerHTML = "";
        var _loop_1 = function (v) {
            var row = document.createElement("li");
            row.onclick = function () {
                _this.onItemClick(v);
            };
            var txt = null;
            if (this_1.selector) {
                txt = this_1.selector(v);
            }
            else {
                txt = v.toString();
            }
            row.appendChild(document.createTextNode(txt));
            this_1.wrapper.appendChild(row);
        };
        var this_1 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var v = _a[_i];
            _loop_1(v);
        }
    };
    return ListBox;
}(Component));
var TableList = (function (_super) {
    __extends(TableList, _super);
    function TableList() {
        var _this = _super.call(this) || this;
        _this.__header = [];
        _this.selector = null;
        _this.onItemClick = newEvent("TabelList.onItemClick");
        _this.wrapper = document.createElement("table");
        _this.wrapper.className = "table selectable";
        _this.tableHeader = document.createElement("thead");
        _this.tableBody = document.createElement("tbody");
        _this.wrapper.appendChild(_this.tableHeader);
        _this.wrapper.appendChild(_this.tableBody);
        return _this;
    }
    Object.defineProperty(TableList.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableList.prototype, "header", {
        get: function () {
            return this.__header;
        },
        set: function (headers) {
            this.__header = headers;
            this.generateHeader();
        },
        enumerable: true,
        configurable: true
    });
    TableList.prototype.update = function () {
        this.generateList();
    };
    TableList.prototype.generateHeader = function () {
        this.tableHeader.innerHTML = "";
        var tr = document.createElement("tr");
        this.tableHeader.appendChild(tr);
        for (var _i = 0, _a = this.__header; _i < _a.length; _i++) {
            var v = _a[_i];
            var headerItem = document.createElement("th");
            headerItem.appendChild(document.createTextNode(v));
            tr.appendChild(headerItem);
        }
    };
    TableList.prototype.generateList = function () {
        var _this = this;
        this.tableBody.innerHTML = "";
        var _loop_2 = function (v) {
            var row = document.createElement("tr");
            row.onclick = function () {
                _this.onItemClick({ target: _this, data: v });
            };
            var txt = [];
            if (this_2.selector) {
                txt = this_2.selector(v);
            }
            else {
                txt = [v.toString()];
            }
            for (var _i = 0, txt_1 = txt; _i < txt_1.length; _i++) {
                var d = txt_1[_i];
                var cell = document.createElement("td");
                cell.appendChild(document.createTextNode(d));
                row.appendChild(cell);
            }
            this_2.tableBody.appendChild(row);
        };
        var this_2 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var v = _a[_i];
            _loop_2(v);
        }
    };
    return TableList;
}(Component));
var ExpandableList = (function (_super) {
    __extends(ExpandableList, _super);
    function ExpandableList() {
        var _this = _super.call(this) || this;
        _this.mk = new HtmlHelper();
        _this.selector = null;
        _this.onItemClick = newEvent("ExpandableList.onItemClick");
        _this.wrapper = document.createElement("div");
        _this.wrapper.className = "comp-expList";
        return _this;
    }
    Object.defineProperty(ExpandableList.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ExpandableList.prototype.update = function () {
        this.generateList();
    };
    ExpandableList.prototype.generateList = function () {
        var _this = this;
        var mk = this.mk;
        this.wrapper.innerHTML = "";
        var _loop_3 = function (d) {
            var section = mk.tag("div", "comp-expList-section");
            var clicker = mk.tag("div", "comp-expList-clicker");
            var collapsible = mk.tag("div", "comp-expList-collapsible");
            collapsible.style.maxHeight = "0px";
            var list = document.createElement("ul");
            this_3.wrapper.appendChild(section);
            section.appendChild(clicker);
            section.appendChild(collapsible);
            collapsible.appendChild(list);
            var title = void 0;
            var items = [];
            if (this_3.selector) {
                title = this_3.selector(d).title;
                items = this_3.selector(d).items;
            }
            else {
                title = d.toString();
            }
            clicker.appendChild(document.createTextNode(title));
            var _loop_4 = function (i) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(i.text));
                list.appendChild(li);
                li.onclick = function () {
                    _this.onItemClick({ target: _this, data: i.object });
                };
            };
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var i = items_1[_i];
                _loop_4(i);
            }
            clicker.onclick = function () {
                var contentHeight = collapsible.scrollHeight;
                collapsible.style.maxHeight = collapsible.style.maxHeight === "0px" ? contentHeight + "px" : "0px";
            };
        };
        var this_3 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var d = _a[_i];
            _loop_3(d);
        }
    };
    return ExpandableList;
}(Component));
var ListBoxRearrangable = (function (_super) {
    __extends(ListBoxRearrangable, _super);
    function ListBoxRearrangable() {
        var _this = _super.call(this) || this;
        _this.selector = null;
        _this.onItemClick = newEvent("ListBoxRearrangable.onItemClick");
        _this.onItemRemove = newEvent("ListBoxRearrangable.onItemRemove");
        _this.onItemRearrange = newEvent("ListBoxRearrangable.onItemRearrange");
        _this.mk = new HtmlHelper();
        _this.wrapper = document.createElement("ul");
        _this.wrapper.className = "comp-listBoxRearr";
        return _this;
    }
    Object.defineProperty(ListBoxRearrangable.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListBoxRearrangable.prototype, "rowInfoMarkers", {
        get: function () {
            return this.__rowInfoMarkers || null;
        },
        set: function (rims) {
            this.__rowInfoMarkers = rims;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ListBoxRearrangable.prototype.update = function () {
        this.generateList();
    };
    ListBoxRearrangable.prototype.generateList = function () {
        var _this = this;
        var mk = this.mk;
        this.wrapper.innerHTML = "";
        if (this.__data) {
            var _loop_5 = function (i) {
                var row = document.createElement("li");
                var marker = null;
                if (this_4.__rowInfoMarkers) {
                    marker = mk.tag("div", "comp-listBoxRearr-marker");
                }
                var textWrapper = mk.tag("div", "comp-listBoxRearr-textWrapper");
                var mainSpan = mk.tag("span");
                var infoSpan = mk.tag("span");
                var iconWrapper = mk.tag("div", "comp-listBoxRearr-icons");
                var arrUp = mk.tag("span", "comp-listBoxRearr-icon");
                var arrDown = mk.tag("span", "comp-listBoxRearr-icon");
                var remove = mk.tag("span", "comp-listBoxRearr-icon");
                arrUp.innerHTML = "&#8593;";
                arrDown.innerHTML = "&#8595;";
                remove.innerHTML = "&#10005;";
                textWrapper.appendChild(mainSpan);
                textWrapper.appendChild(infoSpan);
                iconWrapper.appendChild(arrUp);
                iconWrapper.appendChild(arrDown);
                iconWrapper.appendChild(remove);
                if (marker) {
                    row.appendChild(marker);
                }
                row.appendChild(textWrapper);
                row.appendChild(iconWrapper);
                if (this_4.__rowInfoMarkers) {
                    if (i < this_4.__rowInfoMarkers.length && marker) {
                        marker.appendChild(document.createTextNode(this_4.__rowInfoMarkers[i]));
                    }
                }
                var mainTxt = void 0;
                var infoTxt = null;
                if (this_4.selector) {
                    var item = this_4.selector(this_4.__data[i]);
                    mainTxt = item.mainText;
                    infoTxt = item.infoText || null;
                }
                else {
                    mainTxt = this_4.__data[i].toString();
                }
                mainSpan.appendChild(document.createTextNode(mainTxt));
                if (infoTxt)
                    infoSpan.appendChild(document.createTextNode(infoTxt));
                this_4.wrapper.appendChild(row);
                remove.onclick = function () {
                    var temp = _this.__data[i];
                    _this.__data.splice(i, 1);
                    _this.onItemRemove({ target: _this, data: temp });
                    _this.generateList();
                };
                arrUp.onclick = function () {
                    if (i > 0) {
                        var temp = _this.__data[i];
                        _this.__data[i] = _this.__data[i - 1];
                        _this.__data[i - 1] = temp;
                        _this.onItemRearrange({ target: _this, data: temp });
                        _this.generateList();
                    }
                };
                arrDown.onclick = function () {
                    if (i < _this.__data.length - 1) {
                        var temp = _this.__data[i];
                        _this.__data[i] = _this.__data[i + 1];
                        _this.__data[i + 1] = temp;
                        _this.onItemRearrange({ target: _this, data: temp });
                        _this.generateList();
                    }
                };
            };
            var this_4 = this;
            for (var i = 0; i < this.__data.length; i++) {
                _loop_5(i);
            }
        }
    };
    return ListBoxRearrangable;
}(Component));
var testing = false;
function tester() {
    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";
    var newT = newEvent("tester.test");
    var b = new Button();
    var b2 = new Button();
    var b3 = new Button();
    var lst = new ListBox();
    var table = new TableList();
    var ex = new ExpandableList();
    var listArr = new ListBoxRearrangable();
    document.body.appendChild(ex.wrapper);
    document.body.appendChild(b.wrapper);
    document.body.appendChild(b2.wrapper);
    document.body.appendChild(b3.wrapper);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(lst.wrapper);
    document.body.appendChild(table.wrapper);
    document.body.appendChild(listArr.wrapper);
    b.text = "Click Me!";
    b2.text = "Add Fourth";
    b3.text = "Add expList item";
    b.onclick.addEventListener(function () { alert("Yeay"); });
    var arr = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" }
    ];
    var exArr = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" }
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" }
        }
    ];
    ex.selector = function (item) {
        return {
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last }
            ]
        };
    };
    ex.data = exArr;
    ex.onItemClick.addEventListener(function (item) {
        console.log(item.data);
    });
    listArr.selector = function (item) {
        return { mainText: item.first, infoText: item.last };
    };
    listArr.data = arr;
    var markers = ["X", "Y", "Z"];
    listArr.rowInfoMarkers = markers;
    b2.onclick.addEventListener(function () {
        arr.push({ first: "Fourth", last: "Tester" });
        lst.update();
        table.update();
    });
    b3.onclick.addEventListener(function () {
        exArr.push({ name: "new", employee: { first: "hans", last: "bobsen" } });
        ex.update();
    });
    table.header = ["Firstname", "Lastname"];
    table.selector = function (item) {
        return [item.first, item.last];
    };
    table.onItemClick.addEventListener(function (item) {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });
    table.data = arr;
    lst.selector = function (item) {
        return item.first + " " + item.last;
    };
    lst.onItemClick.addEventListener(function (item) {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });
    lst.data = arr;
}
function startUp() {
    if (testing) {
        tester();
        return;
    }
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: new sensys.SensorManager()
    };
    kernel.senMan.lateInit(); // Late init because it needs netMan
    //kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    kernel.senMan.load("../../Data/Sets/195_usart_data.log16");
    // kernel.senMan.setGlobal(841);
    registerLaunchers();
    registerSensorGroups();
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var themeChange = mk.tag("div", "taskbar-applet");
    var statusbar = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var theme = new ChangeTheme(themeChange);
    var bar = new StatusBar(statusbar);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(theme.content);
    taskbar.appendChild(wl.content);
    taskbar.appendChild(bar.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}
function storageTest() {
    var storageList = {
        bob: {
            longText: "This is a long text",
            text: "bob",
            type: "string",
            value: "Hello World"
        },
        test: {
            longText: "AnotherTest",
            text: "hello",
            type: "number",
            value: 3
        },
        anotherTest: {
            longText: "dsadsa",
            text: "test",
            type: "boolean",
            value: false
        }
    };
}
function registerSensorGroups() {
    kernel.senMan.registerGroup(PointSensorGroup);
}
function registerLaunchers() {
    // kernel.appMan.registerApplication("Data", new Launcher(DataAssignerOld, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(DataAssigner, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(CsvGenerator, "Csv Creator"));
    kernel.appMan.registerApplication("Data", new Launcher(DataSourceBuilder, "Data Source Builder"));
    kernel.appMan.registerApplication("Charts", new Launcher(LineChartTester, "Line Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(GaugeTester, "Gauge"));
    kernel.appMan.registerApplication("Charts", new Launcher(GPSPlotTester, "GPS Viewer"));
    kernel.appMan.registerApplication("Charts", new Launcher(LabelTester, "Label"));
    kernel.appMan.registerApplication("Charts", new Launcher(BarTester, "Bar Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(SteeringWheelTester, "Steering Wheel"));
    // kernel.appMan.registerApplication("Charts", new Launcher(TestDataViewer, "Test Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Test", new Launcher(SensorSetSelector, "Sensor set Selector"));
    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
    kernel.appMan.registerApplication("Admin", new Launcher(TaskManager, "Task Manager"));
    kernel.appMan.registerApplication("Tools", new Launcher(SVGEditor, "SVG Editor"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
    kernel.appMan.registerApplication("hidden", new Launcher(ConfigWindow, "Config Window"));
    registerGridPresets();
}
function registerGridPresets() {
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Speed and Current", {
        name: "Preset Speed and Current",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["speed", "current"] },
                {
                    data: [
                        { name: "LineChartTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["current"] }
                    ]
                }
            ]
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [{ key: "SPEED", name: "../../Data/Sets/126_usart_data.log16" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "../../Data/Sets/126_usart_data.log16" }]
            }
        ]
    }));
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Basic Receive", {
        name: "Basic Receive",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["speed", "current", "volt"] },
                {
                    data: [
                        {
                            data: [
                                { name: "BarTester", data: ["volt"] },
                                { name: "GaugeTester", data: ["current"] }
                            ]
                        },
                        { name: "LabelTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["temp"] }
                    ]
                }
            ]
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [{ key: "SPEED", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "volt",
                layers: [],
                sources: [{ key: "BMS_VOLT", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "temp",
                layers: [],
                sources: [{ key: "BMS_TEMP_BAT", name: "telemetry" }]
            }
        ]
    }));
}
/* tslint:enable:interface-name */
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.mainFunction = mainFunction;
        this.name = name;
        this.args = args;
    }
    Launcher.prototype.runner = function () {
        this.createInstance();
    };
    Launcher.prototype.createInstance = function () {
        (_a = kernel.appMan).launchApplication.apply(_a, [this].concat(this.args));
        var _a;
    };
    return Launcher;
}());
//# sourceMappingURL=kernel.js.map