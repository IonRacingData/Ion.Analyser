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
        if (this.windows.length === 1) {
            kernel.appMan.closeApplication(this);
        }
    };
    return Application;
}());
//# sourceMappingURL=application.js.map