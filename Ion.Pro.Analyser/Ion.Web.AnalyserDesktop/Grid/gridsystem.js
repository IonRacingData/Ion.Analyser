var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GridViewer = (function () {
    function GridViewer() {
        this.eh = new EventHandler();
        this.mk = new HtmlHelper();
        this.childWindows = [];
    }
    GridViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        var mk = this.mk;
        this.registerEvents(this.eh);
        var template = document.getElementById("temp-grid");
        //var clone: Node = document.importNode(template.content, true);
        var test = new GridHContainer(this.window);
        //test.addChild();
        var clone = test.baseNode;
        this.window.content.appendChild(this.mk.tag("button", "", [{ func: function (e) { test.addChild(); }, event: "click" }], "Hello world"));
        this.window.content.appendChild(clone);
        //addEvents();
    };
    GridViewer.prototype.registerEvents = function (eh) {
        var _this = this;
        eh.on(kernel.winMan, WindowManager.event_globalDrag, function (data) { return _this.globalDrag(data); });
        eh.on(kernel.winMan, WindowManager.event_globalUp, function (data) { return _this.globalUp(data); });
        eh.on(this.window, AppWindow.event_close, function () { return _this.handleClose(); });
        eh.on(this.window, AppWindow.event_resize, function () { return _this.handleResize(); });
    };
    GridViewer.prototype.handleClose = function () {
        for (var i in this.childWindows) {
            this.childWindows[i].close();
        }
        this.eh.close();
    };
    GridViewer.prototype.handleResize = function () {
        for (var i in this.childWindows) {
            this.childWindows[i].recalculateSize();
            this.childWindows[i].onResize();
        }
    };
    GridViewer.prototype.globalDrag = function (e) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0
            && windowY > 0
            && windowX < this.window.width
            && windowY < this.window.height
            && e.window != this.window) {
            console.log("global drag grid window: X: " + windowX + " Y: " + windowY);
        }
    };
    GridViewer.prototype.globalUp = function (e) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0 && windowY > 0 && windowX < this.window.width && windowY < this.window.height && e.window != this.window) {
            console.log("grid-window Droped over");
            var gridWindows = this.window.handle.getElementsByClassName("grid-window");
            var foundGridWindow = null;
            for (var i = 0; i < gridWindows.length; i++) {
                var cur = gridWindows[i];
                if (windowX > cur.offsetLeft
                    && windowY > cur.offsetTop
                    && windowX < cur.offsetLeft + cur.offsetWidth
                    && windowY < cur.offsetTop + cur.offsetHeight) {
                    foundGridWindow = cur;
                    console.log("grid-window Found grid window X: " + cur.offsetLeft + " Y: " + cur.offsetTop + " Width: " + cur.offsetWidth + " Height: " + cur.offsetHeight);
                    break;
                }
                else {
                    console.log("grid-window X: " + cur.offsetLeft + " Y: " + cur.offsetTop + " Width: " + cur.offsetWidth + " Height: " + cur.offsetHeight);
                }
            }
            console.log("grid-window dropped at: X: " + windowX + " Y: " + windowY);
            if (foundGridWindow && foundGridWindow.innerHTML.length == 0) {
                foundGridWindow.innerHTML = "";
                var windowBody = kernel.winMan.activeWindow.handle; //.getElementsByClassName("window-body")[0];
                var window = kernel.winMan.activeWindow;
                window.changeWindowMode(WindowMode.BORDERLESS);
                this.childWindows.push(window);
                //windowBody.style.width = "100%";
                //windowBody.style.height = "100%";
                foundGridWindow.appendChild(windowBody);
                window.recalculateSize();
                window.onResize();
            }
            else {
                console.log("grid-window could not find any window, this is a problem");
            }
        }
    };
    return GridViewer;
}());
var GridContainer = (function () {
    //last: HTMLElement;
    function GridContainer(appWindow) {
        var _this = this;
        this.mk = new HtmlHelper();
        this.baseNode = this.create("");
        this.appWindow = appWindow;
        this.baseNode.addEventListener("mousemove", function (e) {
            if (_this.moving) {
                _this.editFunction(e);
            }
        });
        this.baseNode.addEventListener("mouseup", function (e) {
            _this.moving = false;
        });
    }
    GridContainer.prototype.create = function (cls) {
        var base = this.mk.tag("div", "grid-" + cls);
        base.appendChild(this.createChild());
        return base;
    };
    GridContainer.prototype.createSeperator = function () {
        return null;
    };
    GridContainer.prototype.addChild = function () {
        var _this = this;
        var seperator = this.createSeperator();
        var child = this.createChild();
        this.baseNode.appendChild(seperator);
        this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", function (e) {
            _this.editFunction = function (e) {
                _this.resize(child, e, _this.appWindow);
            };
            _this.moving = true;
        });
    };
    GridContainer.prototype.resize = function (gridWindow, event, appWindow) {
    };
    GridContainer.prototype.resizeCommon = function (gridWindow, event) {
        gridWindow.style.flexGrow = "0";
        gridWindow.style.flexBasis = "unset";
    };
    GridContainer.prototype.createChild = function () {
        var box = this.mk.tag("div", "grid-box");
        var win = this.mk.tag("div", "grid-window");
        box.appendChild(win);
        return box;
    };
    return GridContainer;
}());
var GridHContainer = (function (_super) {
    __extends(GridHContainer, _super);
    function GridHContainer(appWindow) {
        return _super.call(this, appWindow) || this;
    }
    GridHContainer.prototype.create = function () {
        return _super.prototype.create.call(this, "hcon");
    };
    GridHContainer.prototype.createSeperator = function () {
        return this.mk.tag("div", "grid-hdiv", null, "&nbsp;");
    };
    GridHContainer.prototype.resize = function (gridWindow, event, appWindow) {
        console.log(event);
        gridWindow.style.width = (appWindow.width - (event.clientX - appWindow.x) - 4) + "px";
        _super.prototype.resizeCommon.call(this, gridWindow, event);
    };
    return GridHContainer;
}(GridContainer));
var GridVContainer = (function (_super) {
    __extends(GridVContainer, _super);
    function GridVContainer(appWindow) {
        return _super.call(this, appWindow) || this;
    }
    GridVContainer.prototype.create = function () {
        return _super.prototype.create.call(this, "vcon");
    };
    GridVContainer.prototype.createSeperator = function () {
        return this.mk.tag("div", "grid-vdiv", null, "&nbsp;");
    };
    GridVContainer.prototype.resize = function (gridWindow, event, appWindow) {
        gridWindow.style.height = (appWindow.height - (event.clientY - appWindow.y) - 4 + 30) + "px";
        _super.prototype.resizeCommon.call(this, gridWindow, event);
    };
    return GridVContainer;
}(GridContainer));
function addEvents() {
    var bar1 = document.getElementById("bar1");
    var bar2 = document.getElementById("bar2");
    var window1 = document.getElementById("window1");
    var window2 = document.getElementById("window2");
    var container;
    var editFunction;
    var moving = false;
    window.addEventListener("mousemove", function (event) {
        if (moving) {
            editFunction(event);
        }
    });
    window.addEventListener("mouseup", function (event) {
        moving = false;
        document.body.style.cursor = null;
    });
    var innerGrid = window1.getElementsByClassName("grid-window")[0];
    /*var firstGrid = document.getElementById("dropbox");
    firstGrid.addEventListener("mouseup", function (event: MouseEvent) {
        console.log("Release");
        innerGrid.innerHTML = "";
        var windowBody = <HTMLElement>kernel.winMan.activeWindow.handle;//.getElementsByClassName("window-body")[0];
        kernel.winMan.activeWindow.changeWindowMode(WindowMode.BORDERLESS);
        //windowBody.style.width = "100%";
        //windowBody.style.height = "100%";
        innerGrid.appendChild(windowBody);
    });*/
    bar1.addEventListener("mousedown", function (event) {
        container = findWindow(this);
        editFunction = function (event) {
            resizeHeight(window1, event, container);
        };
        document.body.style.cursor = "ns-resize";
        moving = true;
    });
    bar2.addEventListener("mousedown", function (event) {
        container = findWindow(this);
        editFunction = function handle(event) {
            console.log(container);
            console.log(event);
            resizeWidth(window2, event, container);
        };
        document.body.style.cursor = "ew-resize";
        moving = true;
    });
}
function findWindow(element) {
    var temp = element.window;
    while (temp == null && element != null) {
        element = element.parentElement;
        temp = element.window;
    }
    return temp;
}
function resizeWidth(gridWindow, event, appWindow) {
    gridWindow.style.width = (appWindow.width - (event.clientX - appWindow.x) - 4) + "px";
    resizeCommon(gridWindow, event);
}
function resizeHeight(gridWindow, event, appWindow) {
    gridWindow.style.height = (appWindow.height - (event.clientY - appWindow.y) - 4 + 30) + "px";
    resizeCommon(gridWindow, event);
}
function resizeCommon(gridWindow, event) {
    gridWindow.style.flexGrow = "0";
    gridWindow.style.flexBasis = "unset";
}
//# sourceMappingURL=gridsystem.js.map