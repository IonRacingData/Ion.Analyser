var TaskManager = (function () {
    function TaskManager() {
    }
    TaskManager.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Task Manager");
        kernel.winMan.addEventListener("windowOpen", function () { return _this.update(); });
        kernel.winMan.addEventListener("windowClose", function () { return _this.update(); });
    };
    TaskManager.prototype.update = function () {
        var windows = kernel.winMan.windows;
        var tg = new HtmlTableGen();
        tg.addHeader("Title");
        tg.addArray(windows, ["title"]);
        this.window.content.innerHTML = "";
        this.window.content.appendChild(tg.generate());
    };
    return TaskManager;
}());
//# sourceMappingURL=TaskManager.js.map