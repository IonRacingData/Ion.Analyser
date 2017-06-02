var Application = (function () {
    function Application(app) {
        this.windows = [];
        this.events = new EventHandler();
        this.application = app;
        app.app = this;
    }
    Application.prototype.start = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = this.application).main.apply(_a, args);
        var _a;
    };
    Application.prototype.closeWindows = function () {
        for (var _i = 0, _a = this.windows; _i < _a.length; _i++) {
            var win = _a[_i];
            win.close();
        }
    };
    Application.prototype.close = function () {
        this.events.close();
        //this.closeWindows();
        kernel.appMan.closeApplication(this);
    };
    Application.prototype.onWindowClose = function () {
        if (this.windows.length === 1) {
            this.close();
        }
    };
    return Application;
}());
