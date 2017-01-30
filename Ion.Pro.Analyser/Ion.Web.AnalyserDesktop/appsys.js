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
    return ApplicationManager;
}());
ApplicationManager.event_appLaunch = "appLaunch";
ApplicationManager.event_appClose = "appClose";
//# sourceMappingURL=appsys.js.map