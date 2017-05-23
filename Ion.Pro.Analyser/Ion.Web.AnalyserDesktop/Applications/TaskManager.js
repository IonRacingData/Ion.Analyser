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
        for (var i = 0; i < apps.length; i++) {
            tg.addRow([
                {
                    event: "click",
                    func: function (e) { return _this.onAppClick(e.target.parentElement); }
                }
            ], apps[i].pid, apps[i].name, apps[i].windows.length);
        }
        var table = tg.generate();
        this.mainWindow.content.appendChild(table);
    };
    TaskManager.prototype.onAppClick = function (tr) {
        var pid = parseInt(tr.firstChild.textContent, 10);
        for (var i = 0; i < kernel.appMan.appList.length; i++) {
            var app = kernel.appMan.appList[i];
            if (app.pid === pid) {
                var win = kernel.winMan.createWindow(this.app, "Task Manager - " + app.name);
                this.infoWindows.push(win);
            }
        }
    };
    TaskManager.prototype.drawInfoWindow = function () {
    };
    return TaskManager;
}());
//# sourceMappingURL=TaskManager.js.map