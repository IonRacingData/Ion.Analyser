var AppWindow = (function () {
    function AppWindow(app) {
        var _this = this;
        this.app = app;
        var handle = this.handle = kernel.winMan.makeWindowHandle(this);
        // kernel.winMan.registerWindow(this);
        handle.addEventListener("mousedown", function (e) { return _this.mouseDown_main(e); });
        this.moveHandle = handle;
        this.sizeHandle = handle.getElementsByClassName("window-body")[0];
        var headerBar = handle.getElementsByClassName("window-header")[0];
        var min = handle.getElementsByClassName("window-control-min")[0];
        var max = handle.getElementsByClassName("window-control-max")[0];
        var exit = handle.getElementsByClassName("window-control-exit")[0];
        var resize = handle.getElementsByClassName("window-bottom-right")[0];
        headerBar.addEventListener("mousedown", function (e) { return _this.mouseDown_header(e); });
        resize.addEventListener("mousedown", function (e) { return _this.mouseDown_resize(e); });
        min.addEventListener("mousedown", function (e) { return _this.onMinimize(e); });
        max.addEventListener("mousedown", function (e) { return _this.onMaximize(e); });
        exit.addEventListener("mousedown", function (e) { return _this.onClose(e); });
        this.handle.window = this;
        this.setPos(300, 50);
        this.setSize(500, 400);
        this.content = this.handle.getElementsByClassName("window-body")[0];
    }
    AppWindow.prototype.setTitle = function (title) {
        this.title = title;
        this.handle.getElementsByClassName("window-title")[0].innerHTML = title;
    };
    AppWindow.prototype.mouseDown_main = function (e) {
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.mouseDown_header = function (e) {
        e.stopPropagation();
        console.log("headerDown");
        this.deltaX = this.handle.offsetLeft - e.pageX;
        this.deltaY = this.handle.offsetTop - e.pageY;
        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.mouseDown_resize = function (e) {
        e.stopPropagation();
        console.log("resizeDown");
        this.deltaX = this.width - e.pageX;
        this.deltaY = this.height - e.pageY;
        // console.log(this.sizeHandle.offsetLeft.toString() + " " + this.sizeHandle.offsetTop.toString());
        this.winMan.resizing = true;
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.onMinimize = function (e) {
        e.stopPropagation();
        console.log("minimize");
        this.hide();
        this.changeStateTo(WindowState.MINIMIZED);
    };
    AppWindow.prototype.hide = function () {
        this.handle.style.display = "none";
    };
    AppWindow.prototype.onMaximize = function (e) {
        e.stopPropagation();
        this.winMan.selectWindow(this);
        if (this.state === WindowState.MAXIMIZED) {
            this.restore();
        }
        else {
            this.maximize();
        }
        console.log("maximize");
    };
    AppWindow.prototype.show = function () {
        this.handle.style.display = "";
        if (this.state === WindowState.MINIMIZED) {
            this.changeStateTo(this.prevState);
        }
    };
    AppWindow.prototype.restore = function () {
        this.setPos(this.x, this.y);
        this.setSize(this.width, this.height);
        this.changeStateTo(WindowState.RESTORED);
    };
    AppWindow.prototype.maximize = function () {
        this.setPos(0, 40, false);
        this.setSize(window.innerWidth - 1, window.innerHeight - 40 - 30, false);
        this.changeStateTo(WindowState.MAXIMIZED);
    };
    AppWindow.prototype.tile = function (state) {
        var topBar = 40;
        var windowTitle = 30;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight - topBar;
        var newX = 0;
        var newY = 40;
        var newWidth = windowWidth / 2 - 1;
        var newHeight = windowHeight / 2 - windowTitle;
        switch (state) {
            case TileState.LEFT:
                newHeight = windowHeight - windowTitle;
                break;
            case TileState.RIGHT:
                newX = windowWidth / 2;
                newHeight = windowHeight - windowTitle;
                break;
            case TileState.TOPLEFT:
                break;
            case TileState.BOTTOMLEFT:
                newY = windowHeight / 2 + topBar;
                break;
            case TileState.TOPRIGHT:
                newX = windowWidth / 2;
                break;
            case TileState.BOTTOMRIGHT:
                newX = windowWidth / 2;
                newY = windowHeight / 2 + topBar;
                break;
        }
        this.setPos(newX, newY, false);
        this.setSize(newWidth, newHeight, false);
        this.changeStateTo(WindowState.TILED);
    };
    AppWindow.prototype.onClose = function (e) {
        e.stopPropagation();
        this.app.onClose();
        this.winMan.closeWindow(this);
    };
    AppWindow.prototype.setPos = function (x, y, storePos) {
        if (storePos === void 0) { storePos = true; }
        var outerBoxMargin = 8;
        this.moveHandle.style.left = (x - outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y - outerBoxMargin).toString() + "px";
        if (storePos) {
            this.x = x;
            this.y = y;
        }
    };
    AppWindow.prototype.setSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        this.sizeHandle.style.width = width.toString() + "px";
        this.sizeHandle.style.height = height.toString() + "px";
        if (storeSize) {
            this.width = width;
            this.height = height;
        }
    };
    AppWindow.prototype.setRelativePos = function (x, y, storePos) {
        if (storePos === void 0) { storePos = true; }
        if (this.state === WindowState.MAXIMIZED || this.state === WindowState.TILED) {
            this.restore();
            this.deltaX = -this.width / 2;
        }
        this.handle.style.left = (x + this.deltaX).toString() + "px";
        this.handle.style.top = (y + this.deltaY).toString() + "px";
        if (storePos) {
            this.x = x + this.deltaX;
            this.y = y + this.deltaY;
        }
    };
    AppWindow.prototype.setRelativeSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        this.sizeHandle.style.width = (width + this.deltaX).toString() + "px";
        this.sizeHandle.style.height = (height + this.deltaY).toString() + "px";
        if (storeSize) {
            this.width = width + this.deltaX;
            this.height = height + this.deltaY;
        }
    };
    AppWindow.prototype.changeStateTo = function (state) {
        this.prevState = this.state;
        this.state = state;
    };
    AppWindow.prototype.restoreSize = function () {
        this.setSize(this.width, this.height, false);
        this.sizeHandle.parentElement.parentElement.style.padding = "8px";
        this.sizeHandle.parentElement.style.width = null;
        this.sizeHandle.parentElement.style.height = null;
        this.sizeHandle.parentElement.parentElement.style.width = null;
        this.sizeHandle.parentElement.parentElement.style.height = null;
    };
    AppWindow.prototype.restorePos = function () {
        this.handle.style.left = this.x.toString() + "px";
        this.handle.style.top = this.y.toString() + "px";
    };
    AppWindow.prototype.removeSize = function () {
        this.sizeHandle.style.width = "100%";
        this.sizeHandle.style.height = "100%";
        this.sizeHandle.parentElement.style.width = "100%";
        this.sizeHandle.parentElement.style.height = "100%";
        this.sizeHandle.parentElement.parentElement.style.width = "100%";
        this.sizeHandle.parentElement.parentElement.style.height = "100%";
        this.sizeHandle.parentElement.parentElement.style.padding = "0";
    };
    AppWindow.prototype.removeHeader = function () {
        this.handle.getElementsByClassName("window-header")[0].style.display = "none";
    };
    AppWindow.prototype.restoreHeader = function () {
        this.handle.getElementsByClassName("window-header")[0].style.display = null;
    };
    AppWindow.prototype.removePos = function () {
        this.handle.style.left = null;
        this.handle.style.top = null;
    };
    AppWindow.prototype.changeWindowMode = function (mode) {
        switch (mode) {
            case WindowMode.BORDERLESS:
                this.removeSize();
                this.removePos();
                this.removeHeader();
                break;
            case WindowMode.WINDOWED:
                this.restoreSize();
                this.restorePos();
                this.restoreHeader();
                break;
        }
    };
    return AppWindow;
}());
var WindowMode;
(function (WindowMode) {
    WindowMode[WindowMode["WINDOWED"] = 0] = "WINDOWED";
    WindowMode[WindowMode["BORDERLESS"] = 1] = "BORDERLESS";
})(WindowMode || (WindowMode = {}));
var TileState;
(function (TileState) {
    TileState[TileState["LEFT"] = 0] = "LEFT";
    TileState[TileState["RIGHT"] = 1] = "RIGHT";
    TileState[TileState["TOPLEFT"] = 2] = "TOPLEFT";
    TileState[TileState["TOPRIGHT"] = 3] = "TOPRIGHT";
    TileState[TileState["BOTTOMLEFT"] = 4] = "BOTTOMLEFT";
    TileState[TileState["BOTTOMRIGHT"] = 5] = "BOTTOMRIGHT";
})(TileState || (TileState = {}));
var WindowState;
(function (WindowState) {
    WindowState[WindowState["RESTORED"] = 0] = "RESTORED";
    WindowState[WindowState["MINIMIZED"] = 1] = "MINIMIZED";
    WindowState[WindowState["MAXIMIZED"] = 2] = "MAXIMIZED";
    WindowState[WindowState["TILED"] = 3] = "TILED";
})(WindowState || (WindowState = {}));
//# sourceMappingURL=WindowSystem.js.map