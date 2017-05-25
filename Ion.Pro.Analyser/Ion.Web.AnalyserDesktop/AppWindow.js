var AppWindow = (function () {
    function AppWindow(app) {
        var _this = this;
        this._showTaskbar = true;
        this.topMost = false;
        this.eventMan = new EventManager();
        this.outerBoxMargin = 8;
        /*Events*/
        this.onResize = newEvent("AppWindow.onResize");
        this.onMove = newEvent("AppWindow.onMove");
        this.onClose = newEvent("AppWindow.onClose");
        this.onMouseMove = newEvent("AppWindow.onMouseMove");
        this.onDragOver = newEvent("AppWindow.onDragOver");
        this.onDragRelease = newEvent("AppWindow.onDragRelease");
        this.onUpdate = newEvent("AppWindow.onUpdate");
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
        headerBar.addEventListener("touchstart", function (e) { return _this.header_touchStart(e); });
        resize.addEventListener("touchstart", function (e) { return _this.resize_touchStart(e); });
        min.addEventListener("mousedown", function (e) { return _this.minimize_click(e); });
        max.addEventListener("mousedown", function (e) { return _this.maximize_click(e); });
        exit.addEventListener("mousedown", function (e) { return _this.close_click(e); });
        this.handle.window = this;
        this.setPos(300, 50);
        this.setSize(500, 400);
        this.windowElement = handle.getElementsByClassName("window")[0];
        this.content = this.sizeHandle; // <HTMLElement>this.handle.getElementsByClassName("window-body")[0];
        this.content.addEventListener("mousemove", function (e) { return _this.content_mouseMove(e); });
    }
    Object.defineProperty(AppWindow.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            this._title = value;
            this.handle.getElementsByClassName("window-title")[0].innerHTML = value;
            this.onUpdate(null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppWindow.prototype, "totalWidth", {
        get: function () {
            return this.windowElement.clientWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppWindow.prototype, "totalHeight", {
        get: function () {
            return this.windowElement.clientHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppWindow.prototype, "showTaskbar", {
        get: function () {
            return this._showTaskbar;
        },
        set: function (value) {
            this._showTaskbar = value;
            this.onUpdate(null);
        },
        enumerable: true,
        configurable: true
    });
    AppWindow.prototype.addEventListener = function (type, listener) {
        this.eventMan.addEventListener(type, listener);
    };
    AppWindow.prototype.removeEventListener = function (type, listener) {
        this.eventMan.removeEventListener(type, listener);
    };
    AppWindow.prototype.content_mouseMove = function (e) {
        this.onMouseMove({ target: this, x: e.layerX, y: e.layerY });
    };
    /* Event handlers */
    AppWindow.prototype.main_mouseDown = function (e) {
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.header_mouseDown = function (e) {
        e.stopPropagation();
        // console.log("headerDown");
        this.deltaX = this.handle.offsetLeft - e.pageX + this.outerBoxMargin;
        this.deltaY = this.handle.offsetTop - e.pageY + this.outerBoxMargin;
        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    };
    AppWindow.prototype.header_touchStart = function (e) {
        e.stopPropagation();
        // e.preventDefault();
        console.log(e);
        this.deltaX = this.handle.offsetLeft - e.targetTouches[0].pageX + this.outerBoxMargin;
        this.deltaY = this.handle.offsetTop - e.targetTouches[0].pageY + this.outerBoxMargin;
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
    AppWindow.prototype.resize_touchStart = function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("resizeDown");
        this.deltaX = this.width - e.targetTouches[0].pageX;
        this.deltaY = this.height - e.targetTouches[0].pageY;
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
    AppWindow.prototype.handleGlobalDrag = function (x, y, window) {
        this.onDragOver({ target: this, x: x, y: y, window: window });
    };
    AppWindow.prototype.handleGlobalRelease = function (x, y, window) {
        this.onDragRelease({ target: this, x: x, y: y, window: window });
    };
    /* Private stuff */
    AppWindow.prototype.restoreSize = function () {
        this.setSize(this.width, this.height, false);
        this.sizeHandle.parentElement.parentElement.style.padding = "8px";
        var curHandle = this.sizeHandle.parentElement;
        for (var i = 0; i < 3; i++) {
            curHandle.style.width = null;
            curHandle.style.height = null;
            curHandle = curHandle.parentElement;
        }
    };
    AppWindow.prototype.restorePos = function () {
        this.handle.style.left = this.x.toString() + "px";
        this.handle.style.top = this.y.toString() + "px";
    };
    AppWindow.prototype.removeSize = function () {
        var curHandle = this.sizeHandle;
        for (var i = 0; i < 4; i++) {
            curHandle.style.width = "100%";
            curHandle.style.height = "100%";
            if (i === 3) {
                break;
            }
            curHandle = curHandle.parentElement;
        }
        curHandle.style.padding = "0";
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
    AppWindow.prototype.changeStateTo = function (state) {
        this.prevState = this.state;
        this.state = state;
    };
    AppWindow.prototype.remoteShadow = function () {
        this.windowElement.style.boxShadow = "none";
    };
    AppWindow.prototype.restoreShadow = function () {
        this.windowElement.style.boxShadow = null;
    };
    AppWindow.prototype.__onMouseMove = function (x, y) {
        this.onMouseMove({ target: this, x: x, y: y });
    };
    AppWindow.prototype.__onDragOver = function (x, y, window) {
        this.onDragOver({ target: this, x: x, y: y, window: window });
    };
    AppWindow.prototype.__onDragRelease = function (x, y, window) {
        console.log("Release");
        this.onDragRelease({ target: this, x: x, y: y, window: window });
    };
    AppWindow.prototype.close = function () {
        this.onClose(null);
        this.app.onWindowClose();
        this.winMan.closeWindow(this);
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
        this.moveHandle.style.left = (x - this.outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y - this.outerBoxMargin).toString() + "px";
        this.x = x;
        this.y = y;
        if (storePos) {
            this.storeX = x;
            this.storeY = y;
        }
        this.onMove(null);
    };
    AppWindow.prototype.setSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        /*if (width < 230)
            width = 230;
        if (height < 150)
            height = 150;*/
        this.sizeHandle.style.width = width.toString() + "px";
        this.sizeHandle.style.height = height.toString() + "px";
        this.width = width;
        this.height = height;
        if (storeSize) {
            this.storeWidth = width;
            this.storeHeight = height;
        }
        this.onResize(null);
    };
    AppWindow.prototype.changeWindowMode = function (mode) {
        switch (mode) {
            case WindowMode.BORDERLESSFULL:
                this.removeSize();
                this.removePos();
                this.removeHeader();
                this.recalculateSize();
                this.onResize(null);
                break;
            case WindowMode.BORDERLESS:
                this.removeHeader();
                this.onResize(null);
                break;
            case WindowMode.WINDOWED:
                this.restoreSize();
                this.restorePos();
                this.restoreHeader();
                this.onResize(null);
                break;
        }
    };
    AppWindow.prototype.highlight = function (highlight) {
        if (highlight) {
            this.handle.getElementsByClassName("window-overlay")[0].style.display = "block";
        }
        else {
            this.handle.getElementsByClassName("window-overlay")[0].style.display = "none";
        }
    };
    AppWindow.prototype.__setRelativePos = function (x, y, storePos) {
        if (storePos === void 0) { storePos = true; }
        if (this.state === WindowState.MAXIMIZED || this.state === WindowState.TILED) {
            this.restore();
            this.deltaX = -this.width / 2;
        }
        this.moveHandle.style.left = (x + this.deltaX - this.outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y + this.deltaY - this.outerBoxMargin).toString() + "px";
        this.x = x + this.deltaX;
        this.y = y + this.deltaY;
        if (storePos) {
            this.storeX = x + this.deltaX;
            this.storeY = y + this.deltaY;
        }
        this.onMove(null);
    };
    AppWindow.prototype.__setRelativeSize = function (width, height, storeSize) {
        if (storeSize === void 0) { storeSize = true; }
        var newWidth = width + this.deltaX;
        var newHeight = height + this.deltaY;
        if (newWidth < 230) {
            newWidth = 230;
        }
        if (newHeight < 150) {
            newHeight = 150;
        }
        this.sizeHandle.style.width = (newWidth).toString() + "px";
        this.sizeHandle.style.height = (newHeight).toString() + "px";
        this.width = newWidth;
        this.height = newHeight;
        if (storeSize) {
            this.storeWidth = newWidth;
            this.storeHeight = newHeight;
        }
        this.onResize(null);
    };
    return AppWindow;
}());
/*class AppMouseEvent implements EventData {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}*/
/*class AppMouseDragEvent extends AppMouseEvent {
    public window: AppWindow;

    constructor(x: number, y: number, window: AppWindow) {
        super(x, y);
        this.window = window;
    }
}*/
var WindowMode;
(function (WindowMode) {
    WindowMode[WindowMode["WINDOWED"] = 0] = "WINDOWED";
    WindowMode[WindowMode["BORDERLESSFULL"] = 1] = "BORDERLESSFULL";
    WindowMode[WindowMode["BORDERLESS"] = 2] = "BORDERLESS";
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