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
        this.eventManager = new EventManager();
        //this.addEventListener = this.eventManager.addEventListener;
        //this.addEventListener2 = this.eventManager.addEventListener;
        //addEventListener
    }
    WindowManager.prototype.mouseMove = function (e) {
        if (this.dragging) {
            this.activeWindow.setRelativePos(e.pageX, e.pageY);
            var tileZone = this.tileZone;
            var topBar = this.topBar;
            if (e.pageX < tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (e.pageX < tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (e.pageY < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (e.pageX < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }
            this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    };
    WindowManager.prototype.mouseUp = function (e) {
        console.log(e);
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    };
    WindowManager.prototype.createWindow = function (app, title) {
        var window = this.makeWindow(app);
        window.setTitle(title);
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
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
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
    WindowManager.event_globalDrag = "globalDrag";
    WindowManager.event_globalUp = "globalUp;";
    WindowManager.event_windowOpen = "windowOpen";
    WindowManager.event_windowSelect = "windowSelect";
    WindowManager.event_windowClose = "windowClose";
    return WindowManager;
}());
//# sourceMappingURL=winsys.js.map