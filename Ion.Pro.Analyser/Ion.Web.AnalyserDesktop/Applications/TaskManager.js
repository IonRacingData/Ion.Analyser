var TaskManager = (function () {
    function TaskManager() {
    }
    TaskManager.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Task Manager");
        kernel.winMan.addEventListener("windowOpen", function () { return _this.update(); });
        kernel.winMan.addEventListener("windowClose", function () { return _this.update(); });
        kernel.appMan.addEventListener("launchApp", function () { return _this.update(); });
        this.update();
    };
    TaskManager.prototype.update = function () {
        this.window.content.innerHTML = "";
        var windows = kernel.winMan.windows;
        var tg = new HtmlTableGen("table", true);
        tg.addHeader("Title");
        tg.addArray(windows, ["title"]);
        this.window.content.appendChild(tg.generate());
        var tg2 = new HtmlTableGen("table", true);
        tg2.addHeader("PID", "Title");
        tg2.addArray(kernel.appMan.appList, ["pid", "name"]);
        this.window.content.appendChild(tg2.generate());
    };
    return TaskManager;
}());
//# sourceMappingURL=TaskManager.js.map