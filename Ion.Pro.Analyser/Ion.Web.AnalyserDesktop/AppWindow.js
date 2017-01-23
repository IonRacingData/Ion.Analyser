var AppWindow = (function () {
    function AppWindow(app) {
        var _this = this;
        this.eventMan = new EventManager();
        this.app = app;
        var handle = this.handle = kernel.winMan.makeWindowHandle(this);
        // kernel.winMan.registerWindow(this);
        handle.addEventListener("mousedown", function (e) { return _this.main_mouseDown(e); });
        this.moveHandle = handle;
        this.sizeHandle = handle.getElementsByClassName("window-body")[0];
        var headerBar = handle.getElementsByClassName("window-header")[0];
        var min = handle.getElementsByClassName("window-control-min")[0];
        var max = handle.getElementsByClassName("window-control-max")[0];
        var exit = handle.getElementsByClassName("window-control-exit")[0];
        var resize = handle.getElementsByClassName("window-bottom-right")[0];
        headerBar.addEventListener("mousedown", function (e) { return _this.header_mouseDown(e); });
        resize.addEventListener("mousedown", function (e) { return _this.resize_mouseDown(e); });
        min.addEventListener("mousedown", function (e) { return _this.minimize_click(e); });
        max.addEventListener("mousedown", function (e) { return _this.maximize_click(e); });
        exit.addEventListener("mousedown", function (e) { return _this.close_click(e); });
        this.handle.window = this;
        this.setPos(300, 50);
        this.setSize(500, 400);
        this.content = this.handle.getElementsByClassName("window-body")[0];
    }
    AppWindow.prototype.setTitle = function (title) {
        this.title = title;
        this.handle.getElementsByClassName("window-title")[0].innerHTML = title;
    };
    AppWindow.prototype.addEventListener = function (type, listener) {
        this.eventMan.addEventListener(type, listener);
    };
    AppWindow.prototype.removeEventListener = function (type, listener) {
        this.eventMan.removeEventListener(type, listener);
    };
    /* Event handlers */
    AppWindow.prototype.main_mouseDown = function (e) {
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.header_mouseDown = function (e) {
        e.stopPropagation();
        console.log("headerDown");
        this.deltaX = this.handle.offsetLeft - e.pageX;
        this.deltaY = this.handle.offsetTop - e.pageY;
        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.resize_mouseDown = function (e) {
        e.stopPropagation();
        console.log("resizeDown");
        this.deltaX = this.width - e.pageX;
        this.deltaY = this.height - e.pageY;
        // console.log(this.sizeHandle.offsetLeft.toString() + " " + this.sizeHandle.offsetTop.toString());
        this.winMan.resizing = true;
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.minimize_click = function (e) {
        e.stopPropagation();
        console.log("minimize");
        this.hide();
        this.changeStateTo(WindowState.MINIMIZED);
    };
    AppWindow.prototype.maximize_click = function (e) {
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
    AppWindow.prototype.close_click = function (e) {
        e.stopPropagation();
        this.close();
    };
    AppWindow.prototype.close = function () {
        this.onClose();
        this.app.onClose();
        this.winMan.closeWindow(this);
    };
    /*Events*/
    AppWindow.prototype.onResize = function () {
        this.eventMan.raiseEvent(AppWindow.event_resize, null);
    };
    AppWindow.prototype.onMove = function () {
        this.eventMan.raiseEvent(AppWindow.event_move, null);
    };
    AppWindow.prototype.onClose = function () {
        this.eventMan.raiseEvent(AppWindow.event_close, null);
    };
    AppWindow.prototype.show = function () {
        this.handle.style.display = "";
        if (this.state === WindowState.MINIMIZED) {
            this.changeStateTo(this.prevState);
        }
    };
    AppWindow.prototype.hide = function () {
        this.handle.style.display = "none";
    };
    AppWindow.prototype.restore = function () {
        this.setPos(this.storeX, this.storeY);
        this.setSize(this.storeWidth, this.storeHeight);
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
    AppWindow.prototype.recalculateSize = function () {
        this.width = this.content.clientWidth;
        this.height = this.content.clientHeight;
    };
    AppWindow.prototype.setPos = function (x, y, storePos) {
        if (storePos === void 0) { storePos = true; }
        var outerBoxMargin = 8;
        this.moveHandle.style.left = (x - outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y - outerBoxMargin).toString() + "px";
        this.x = x;
        this.y = y;
        if (storePos) {
            this.storeX = x;
            this.storeY = y;
        }
        this.onMove();
    };
    AppWindow.prototype.setRelativePos = function (x, y, storePos) {
        if (storePos === void 0) { storePos = true; }
        if (this.state === WindowState.MAXIMIZED || this.state === WindowState.TILED) {
            this.restore();
            this.deltaX = -this.width / 2;
        }
        this.handle.style.left = (x + this.deltaX).toString() + "px";
        this.handle.style.top = (y + this.deltaY).toString() + "px";
        this.x = x + this.deltaX;
        this.y = y + this.deltaY;
        if (storePos) {
            this.storeX = x + this.deltaX;
            this.storeY = y + this.deltaY;
        }
        this.onMove();
    };
    AppWindow.prototype.setSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        this.sizeHandle.style.width = width.toString() + "px";
        this.sizeHandle.style.height = height.toString() + "px";
        this.width = width;
        this.height = height;
        if (storeSize) {
            this.storeWidth = width;
            this.storeHeight = height;
        }
        this.onResize();
    };
    AppWindow.prototype.setRelativeSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        this.sizeHandle.style.width = (width + this.deltaX).toString() + "px";
        this.sizeHandle.style.height = (height + this.deltaY).toString() + "px";
        this.width = width + this.deltaX;
        this.height = height + this.deltaY;
        if (storeSize) {
            this.storeWidth = width + this.deltaX;
            this.storeHeight = height + this.deltaY;
        }
        this.onResize();
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
                this.recalculateSize();
                this.onResize();
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
AppWindow.event_move = "move";
AppWindow.event_resize = "resize";
AppWindow.event_minimize = "minimize";
AppWindow.event_maximize = "maximize";
AppWindow.event_close = "close";
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
//# sourceMappingURL=AppWindow.js.map