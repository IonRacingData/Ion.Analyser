var WindowManager = (function () {
    function WindowManager(container) {
        var _this = this;
        this.windows = [];
        this.order = [];
        this.events = {};
        this.tileZone = 20;
        this.topBar = 40;
        this.body = container;
        this.template = document.getElementById("temp-window");
        window.addEventListener("mousemove", function (e) { return _this.mouseMove(e); });
        window.addEventListener("mouseup", function (e) { return _this.mouseUp(e); });
        window.addEventListener("touchmove", function (e) { return _this.touchMove(e); });
        window.addEventListener("touchend", function (e) { return _this.touchEnd(e); });
        this.eventManager = new EventManager();
        // this.addEventListener = this.eventManager.addEventListener;
        // this.addEventListener2 = this.eventManager.addEventListener;
        // addEventListener
    }
    WindowManager.prototype.mouseMove = function (e) {
        this.handleMouseMoving(e.pageX, e.pageY, e);
    };
    WindowManager.prototype.touchMove = function (e) {
        e.preventDefault();
        this.handleMouseMoving(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e);
    };
    WindowManager.prototype.handleMouseMoving = function (x, y, e) {
        if (this.dragging) {
            this.activeWindow.__setRelativePos(x, y);
            var tileZone = this.tileZone;
            var topBar = this.topBar;
            if (x < tileZone && y < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (x < tileZone && y > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (x > window.innerWidth - tileZone && y < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (x > window.innerWidth - tileZone && y > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (y < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (x < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (x > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }
            this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
            var appWindow = this.getWindowAt(x, y, true);
            if (appWindow) {
                appWindow.handleGlobalDrag(x, y, this.activeWindow);
            }
        }
        else if (this.resizing) {
            this.activeWindow.__setRelativeSize(x, y);
        }
    };
    WindowManager.prototype.getWindowAt = function (x, y, ignoreActive) {
        for (var i = this.order.length - 1; i >= 0; i--) {
            var curWindow = this.windows[i];
            if (ignoreActive && curWindow === this.activeWindow) {
                continue;
            }
            if (this.intersects(x, y, curWindow)) {
                return curWindow;
            }
        }
        return null;
    };
    WindowManager.prototype.intersects = function (x, y, window) {
        return x > window.x
            && x < window.x + window.totalWidth
            && y > window.y
            && y < window.y + window.totalHeight;
    };
    WindowManager.prototype.mouseUp = function (e) {
        // console.log(e);
        var x = e.layerX;
        var y = e.layerY;
        var appWindow = this.getWindowAt(x, y, true);
        if (appWindow) {
            appWindow.handleGlobalRelease(x, y, this.activeWindow);
        }
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    };
    WindowManager.prototype.touchEnd = function (e) {
        var x = e.touches[0].pageX;
        var y = e.touches[0].pageY;
        var appWindow = this.getWindowAt(x, y, true);
        if (appWindow) {
            appWindow.handleGlobalRelease(x, y, this.activeWindow);
        }
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    };
    WindowManager.prototype.createWindow = function (app, title) {
        var window = this.makeWindow(app);
        // window.setTitle(title);
        window.title = title;
        app.windows.push(window);
        this.registerWindow(window);
        return window;
    };
    WindowManager.prototype.makeWindow = function (app) {
        var tempWindow = new AppWindow(app);
        return tempWindow;
    };
    WindowManager.prototype.registerWindow = function (app) {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.raiseEvent(WindowManager.event_windowOpen, null);
        this.selectWindow(app);
    };
    WindowManager.prototype.makeWindowHandle = function (appWindow) {
        var div = document.createElement("div");
        div.className = "window-wrapper";
        var clone = document.importNode(this.template.content, true);
        div.appendChild(clone);
        return div;
    };
    WindowManager.prototype.selectWindow = function (appWindow) {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.raiseEvent(WindowManager.event_windowSelect, null);
    };
    WindowManager.prototype.makeTopMost = function (appWindow) {
        var index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    };
    WindowManager.prototype.closeWindow = function (appWindow) {
        appWindow.handle.parentElement.removeChild(appWindow.handle);
        this.windows.splice(this.windows.indexOf(appWindow), 1);
        this.order.splice(this.order.indexOf(appWindow), 1);
        appWindow.app.windows.splice(appWindow.app.windows.indexOf(appWindow), 1);
        this.raiseEvent(WindowManager.event_windowClose, null);
    };
    WindowManager.prototype.reorderWindows = function () {
        for (var i = 0; i < this.order.length; i++) {
            if (this.order[i].topMost) {
                this.order[i].handle.style.zIndex = ((i + 1) * 100000).toString();
            }
            else {
                this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
            }
        }
    };
    WindowManager.prototype.addEventListener = function (type, listner) {
        this.eventManager.addEventListener(type, listner);
    };
    WindowManager.prototype.removeEventListener = function (type, listener) {
        this.eventManager.removeEventListener(type, listener);
    };
    WindowManager.prototype.raiseEvent = function (type, data) {
        this.eventManager.raiseEvent(type, data);
    };
    return WindowManager;
}());
WindowManager.event_globalDrag = "globalDrag";
WindowManager.event_globalUp = "globalUp;";
WindowManager.event_windowOpen = "windowOpen";
WindowManager.event_windowSelect = "windowSelect";
WindowManager.event_windowClose = "windowClose";
//# sourceMappingURL=winsys.js.map