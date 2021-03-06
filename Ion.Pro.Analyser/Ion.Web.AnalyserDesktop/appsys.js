var ApplicationManager = (function () {
    function ApplicationManager() {
        this.appList = [];
        this.launchers = {};
        this.allApps = {};
        this.eventManager = new EventManager();
        this.nextPID = 0;
    }
    ApplicationManager.prototype.launchApplication = function (launcher) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var temp = new launcher.mainFunction();
        var appTemp = new Application(temp);
        appTemp.name = launcher.name;
        appTemp.pid = this.nextPID++;
        this.appList.push(appTemp);
        appTemp.start.apply(appTemp, args);
        this.eventManager.raiseEvent(ApplicationManager.event_appLaunch, null);
        return appTemp;
    };
    ApplicationManager.prototype.start = function (appName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.allApps[appName]) {
            return this.launchApplication.apply(this, [this.allApps[appName]].concat(args));
        }
    };
    ApplicationManager.prototype.registerApplication = function (category, launcher) {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
        this.allApps[launcher.mainFunction.name] = launcher;
    };
    ApplicationManager.prototype.addEventListener = function (type, listener) {
        this.eventManager.addEventListener(type, listener);
    };
    ApplicationManager.prototype.removeEventListener = function (type, listener) {
        this.eventManager.removeEventListener(type, listener);
    };
    ApplicationManager.prototype.closeApplication = function (app) {
        this.appList.splice(this.appList.indexOf(app), 1);
        this.eventManager.raiseEvent(ApplicationManager.event_appClose, null);
    };
    return ApplicationManager;
}());
ApplicationManager.event_appLaunch = "appLaunch";
ApplicationManager.event_appClose = "appClose";
//# sourceMappingURL=appsys.js.map