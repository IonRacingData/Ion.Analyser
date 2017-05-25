var TaskManager = (function () {
    function TaskManager() {
        this.infoWindows = [];
        this.appTable = null;
    }
    TaskManager.prototype.main = function () {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Task Manager");
        this.addEvents(this.app.events);
        this.initializeComponents();
        //this.draw();
    };
    TaskManager.prototype.addEvents = function (eh) {
        var _this = this;
        eh.on(kernel.winMan.onWindowOpen, function () { return _this.update(); });
        eh.on(kernel.winMan.onWindowClose, function () { return _this.update(); });
        eh.on(kernel.appMan.onAppLaunch, function () { return _this.update(); });
        eh.on(kernel.appMan.onAppClose, function () { return _this.update(); });
    };
    TaskManager.prototype.initializeComponents = function () {
        var _this = this;
        var ta = this.appTable = new TableList();
        ta.header = ["PID", "Application", "# Windows", "# Events"];
        ta.selector = function (app) {
            return [app.pid.toString(), app.name, app.windows.length.toString(), app.events.localNewEvent.length.toString()];
        };
        ta.onItemClick.addEventListener(function (e) { return _this.onAppClick(e.data); });
        ta.data = kernel.appMan.appList;
        this.mainWindow.content.appendChild(ta.wrapper);
    };
    TaskManager.prototype.update = function () {
        this.appTable.update();
    };
    TaskManager.prototype.draw = function () {
        var _this = this;
        this.mainWindow.content.innerHTML = "";
        var tg = new HtmlTableGen("table", true);
        tg.addHeader("PID", "Application", "# of Windows");
        var apps = kernel.appMan.appList;
        var _loop_1 = function () {
            var tempApp = apps[i];
            tg.addRow([
                {
                    event: "click",
                    func: function (e) { return _this.onAppClick(tempApp); }
                }
            ], apps[i].pid, apps[i].name, apps[i].windows.length);
        };
        for (var i = 0; i < apps.length; i++) {
            _loop_1();
        }
        var table = tg.generate();
        this.mainWindow.content.appendChild(table);
    };
    TaskManager.prototype.onAppClick = function (app) {
        var win = kernel.winMan.createWindow(this.app, "Task Manager - " + app.name);
        this.infoWindows.push(win);
        this.drawInfoWindow(app, win);
    };
    TaskManager.prototype.drawInfoWindow = function (app, win) {
        var windowTab = new HtmlTableGen("table");
        windowTab.addHeader("Title");
        windowTab.addArray(app.windows, ["title"]);
        var windowEvents = new HtmlTableGen("table");
        windowEvents.addHeader("Event", "Extra");
        windowEvents.addArray(app.events.localNewEvent, ["info"]);
        windowEvents.addArray(app.events.localEvents, ["type", "manager"]);
        win.content.innerHTML = "";
        win.content.appendChild(windowTab.generate());
        win.content.appendChild(windowEvents.generate());
    };
    return TaskManager;
}());
//# sourceMappingURL=TaskManager.js.map