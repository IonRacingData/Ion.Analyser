var kernel;
window.onload = function () {
    var logViewer = new Launcher(TestViewer, "LogViewer");
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
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
};
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
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    };
    WindowManager.prototype.mouseUp = function (e) {
        console.log("Global MouseUp");
        console.log(e);
        this.dragging = false;
        this.resizing = false;
    };
    WindowManager.prototype.createWindow = function (app, title) {
        var window = this.makeWindow(app);
        window.setTitle(title);
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
        this.raiseEvent("windowOpen");
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
        this.raiseEvent("windowSelect");
    };
    WindowManager.prototype.makeTopMost = function (appWindow) {
        var index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    };
    WindowManager.prototype.closeWindow = function (app) {
        this.body.removeChild(app.handle);
        this.windows.splice(this.windows.indexOf(app), 1);
        this.order.splice(this.order.indexOf(app), 1);
        this.raiseEvent("windowClose");
    };
    WindowManager.prototype.reorderWindows = function () {
        for (var i = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    };
    WindowManager.prototype.addEventListener = function (type, listner) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listner);
    };
    WindowManager.prototype.raiseEvent = function (type) {
        if (this.events[type]) {
            for (var i = 0; i < this.events[type].length; i++) {
                this.events[type][i]();
            }
        }
        else {
            console.error("event of type: " + type + " does not exist!");
        }
    };
    return WindowManager;
}());
var ApplicationManager = (function () {
    function ApplicationManager() {
        this.appList = [];
        this.launchers = {};
    }
    ApplicationManager.prototype.laucneApplication = function (launcher) {
        var temp = new launcher.mainFunction();
        this.appList.push(new Application(temp));
    };
    ApplicationManager.prototype.registerApplication = function (category, launcher) {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    };
    return ApplicationManager;
}());
var Application = (function () {
    function Application(app) {
        this.application = app;
        app.application = this;
        app.main();
    }
    Application.prototype.onClose = function () {
    };
    return Application;
}());
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        this.mainFunction = mainFunction;
        this.name = name;
    }
    Launcher.prototype.createInstance = function () {
        kernel.appMan.laucneApplication(this);
    };
    return Launcher;
}());
var TestViewer = (function () {
    function TestViewer() {
    }
    TestViewer.prototype.main = function () {
        var mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");
        this.window.content.appendChild(mk.tag("h1", "", null, "Hello World"));
    };
    return TestViewer;
}());
var GridViewer = (function () {
    function GridViewer() {
    }
    GridViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        var template = document.getElementById("temp-grid");
        var clone = document.importNode(template.content, true);
        //console.log(clone);
        this.window.content.appendChild(clone);
        //addEvents();
    };
    return GridViewer;
}());
//# sourceMappingURL=app.js.map