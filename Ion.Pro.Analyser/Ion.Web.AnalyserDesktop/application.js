var Application = (function () {
    function Application(app) {
        this.windows = [];
        this.application = app;
        app.application = this;
    }
    Application.prototype.start = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = this.application).main.apply(_a, args);
        var _a;
    };
    Application.prototype.onClose = function () {
        if (this.windows.length === 1) {
            kernel.appMan.closeApplication(this);
        }
    };
    return Application;
}());
//# sourceMappingURL=application.js.map