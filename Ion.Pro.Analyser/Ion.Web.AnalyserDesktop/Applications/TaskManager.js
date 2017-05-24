var TaskManager = (function () {
    function TaskManager() {
        this.infoWindows = [];
    }
    TaskManager.prototype.main = function () {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Task Manager");
        this.addEvents(this.app.events);
        this.draw();
    };
    TaskManager.prototype.addEvents = function (eh) {
        var _this = this;
        eh.on(kernel.winMan.onWindowOpen, function () { return _this.draw(); });
        eh.on(kernel.winMan.onWindowClose, function () { return _this.draw(); });
        eh.on(kernel.appMan.onAppLaunch, function () { return _this.draw(); });
        eh.on(kernel.appMan.onAppClose, function () { return _this.draw(); });
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
        //var pid = parseInt(tr.firstChild.textContent, 10);
        //for (var i = 0; i < kernel.appMan.appList.length; i++) {
        //var app = kernel.appMan.appList[i];
        //if (app.pid === pid) {
        //}
        //}
    };
    TaskManager.prototype.drawInfoWindow = function (app, win) {
        var windowTab = new HtmlTableGen("table");
        windowTab.addHeader("Title");
        windowTab.addArray(app.windows, ["title"]);
        var windowEvents = new HtmlTableGen("table");
        windowEvents.addHeader("Event", "extra");
        windowEvents.addArray(app.events.localNewEvent, ["info"]);
        windowEvents.addArray(app.events.localEvents, ["type", "manager"]);
        win.content.innerHTML = "";
        win.content.appendChild(windowTab.generate());
        win.content.appendChild(windowEvents.generate());
    };
    return TaskManager;
}());
//# sourceMappingURL=TaskManager.js.map