var kernel;
function requestAction(action, callback) {
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.response);
        }
    };
    request.open("GET", "/test/" + action, true);
    request.send();
}
window.addEventListener("load", function () {
    var logViewer = new Launcher(TestViewer, "Test Window");
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };
    kernel.appMan.registerApplication("Test", logViewer);
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
    kernel.appMan.registerApplication("Car", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Car", new Launcher(PlotViewer, "Plot Viewer"));
    kernel.appMan.registerApplication("Plotting", new Launcher(PlotterTester, "Plotter Tester"));
    kernel.appMan.registerApplication("Administration", new Launcher(TaskManager, "Task Manager"));
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
});
var WindowManager = (function () {
    function WindowManager(container) {
        var _this = this;
        this.windows = [];
        this.order = [];
        this.events = {};
        this.tileZone = 20;
        this.topBar = 40;
        this.body = container;
        this.template = document.getElementById("temp-window");
        window.addEventListener("mousemove", function (e) { return _this.mouseMove(e); });
        window.addEventListener("mouseup", function (e) { return _this.mouseUp(e); });
        this.eventManager = new EventManager();
        //this.addEventListener = this.eventManager.addEventListener;
        //this.addEventListener2 = this.eventManager.addEventListener;
        //addEventListener
    }
    WindowManager.prototype.mouseMove = function (e) {
        if (this.dragging) {
            this.activeWindow.setRelativePos(e.pageX, e.pageY);
            var tileZone = this.tileZone;
            var topBar = this.topBar;
            if (e.pageX < tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (e.pageX < tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (e.pageY < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (e.pageX < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }
            this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    };
    WindowManager.prototype.mouseUp = function (e) {
        console.log(e);
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    };
    WindowManager.prototype.createWindow = function (app, title) {
        var window = this.makeWindow(app);
        window.setTitle(title);
        app.windows.push(window);
        this.registerWindow(window);
        return window;
    };
    WindowManager.prototype.makeWindow = function (app) {
        var tempWindow = new AppWindow(app);
        return tempWindow;
    };
    WindowManager.prototype.registerWindow = function (app) {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.raiseEvent(WindowManager.event_windowOpen, null);
        this.selectWindow(app);
    };
    WindowManager.prototype.makeWindowHandle = function (appWindow) {
        var div = document.createElement("div");
        div.className = "window-wrapper";
        var clone = document.importNode(this.template.content, true);
        div.appendChild(clone);
        return div;
    };
    WindowManager.prototype.selectWindow = function (appWindow) {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.raiseEvent(WindowManager.event_windowSelect, null);
    };
    WindowManager.prototype.makeTopMost = function (appWindow) {
        var index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    };
    WindowManager.prototype.closeWindow = function (appWindow) {
        this.body.removeChild(appWindow.handle);
        this.windows.splice(this.windows.indexOf(appWindow), 1);
        this.order.splice(this.order.indexOf(appWindow), 1);
        appWindow.app.windows.splice(appWindow.app.windows.indexOf(appWindow), 1);
        this.raiseEvent(WindowManager.event_windowClose, null);
    };
    WindowManager.prototype.reorderWindows = function () {
        for (var i = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    };
    WindowManager.prototype.addEventListener = function (type, listner) {
        this.eventManager.addEventListener(type, listner);
    };
    WindowManager.prototype.raiseEvent = function (type, data) {
        this.eventManager.raiseEvent(type, data);
    };
    WindowManager.event_globalDrag = "globalDrag";
    WindowManager.event_globalUp = "globalUp;";
    WindowManager.event_windowOpen = "windowOpen";
    WindowManager.event_windowSelect = "windowSelect";
    WindowManager.event_windowClose = "windowClose";
    return WindowManager;
}());
var EventData = (function () {
    function EventData() {
    }
    return EventData;
}());
var EventManager = (function () {
    function EventManager() {
        this.events = {};
    }
    EventManager.prototype.addEventListener = function (type, listener) {
        console.log("secondStep");
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
    };
    EventManager.prototype.raiseEvent = function (type, data) {
        if (this.events[type]) {
            var temp = this.events[type];
            for (var i = 0; i < temp.length; i++) {
                temp[i](data);
            }
            return true;
        }
        //console.error("event of type: " + type + " does not exist!");
        return false;
    };
    return EventManager;
}());
var ApplicationManager = (function () {
    function ApplicationManager() {
        this.appList = [];
        this.launchers = {};
        this.eventManager = new EventManager();
        this.nextPID = 0;
    }
    ApplicationManager.prototype.launchApplication = function (launcher) {
        var temp = new launcher.mainFunction();
        var appTemp = new Application(temp);
        appTemp.name = launcher.name;
        appTemp.pid = this.nextPID++;
        this.appList.push(appTemp);
        appTemp.start();
        this.eventManager.raiseEvent(ApplicationManager.event_appLaunch, null);
    };
    ApplicationManager.prototype.registerApplication = function (category, launcher) {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    };
    ApplicationManager.prototype.addEventListener = function (type, listener) {
        this.eventManager.addEventListener(type, listener);
    };
    ApplicationManager.prototype.closeApplication = function (app) {
        this.appList.splice(this.appList.indexOf(app), 1);
        this.eventManager.raiseEvent(ApplicationManager.event_appClose, null);
    };
    ApplicationManager.event_appLaunch = "appLaunch";
    ApplicationManager.event_appClose = "appClose";
    return ApplicationManager;
}());
var Application = (function () {
    function Application(app) {
        this.windows = [];
        this.application = app;
        app.application = this;
    }
    Application.prototype.start = function () {
        this.application.main();
    };
    Application.prototype.onClose = function () {
        if (this.windows.length == 1) {
            kernel.appMan.closeApplication(this);
        }
    };
    return Application;
}());
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        this.mainFunction = mainFunction;
        this.name = name;
    }
    Launcher.prototype.createInstance = function () {
        kernel.appMan.launchApplication(this);
    };
    return Launcher;
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
        this.window.content.appendChild(this.mk.tag("h1", "", null, "Hello World"));
    };
    return TestViewer;
}());
var google;
var DataViewer = (function () {
    function DataViewer() {
    }
    DataViewer.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        requestAction("GetIds", function (data) { return _this.draw(data); });
    };
    DataViewer.prototype.draw = function (data) {
        var _this = this;
        var mk = new HtmlHelper();
        var _loop_1 = function() {
            var curValue = data[i];
            a = mk.tag("span", "taskbar-button-text", null, curValue.toString());
            a.onclick = function () {
                requestAction("GetData?number=" + curValue.toString(), function (data) { return _this.drawInner(data); });
            };
            this_1.window.content.appendChild(a);
        };
        var this_1 = this;
        var a;
        for (var i = 0; i < data.length; i++) {
            _loop_1();
        }
        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
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
        requestAction("getdata?number=61457", function (data) { return _this.drawChart(data); });
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
            _this.plotter.canvas.width = _this.window.width;
            _this.plotter.canvas.height = _this.window.height;
            _this.plotter.draw();
        });
        var data = [
            { ID: 111, TimeStamp: 2000, Value: 54 },
            { ID: 111, TimeStamp: 2100, Value: 67 },
            { ID: 111, TimeStamp: 2200, Value: 21 },
            { ID: 111, TimeStamp: 2300, Value: 12 },
            { ID: 111, TimeStamp: 2400, Value: 15 },
            { ID: 111, TimeStamp: 2500, Value: 87 }
        ];
        this.plotter = new Plotter();
        this.window.content.appendChild(this.plotter.generatePlot(data));
        this.plotter.canvas.width = this.window.width;
        this.plotter.canvas.height = this.window.height;
        this.plotter.draw();
    };
    return PlotterTester;
}());
//# sourceMappingURL=app.js.map