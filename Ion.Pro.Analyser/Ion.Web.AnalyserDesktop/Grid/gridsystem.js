var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GridViewer = (function () {
    function GridViewer() {
        this.mk = new HtmlHelper();
        this.childWindows = [];
    }
    GridViewer.prototype.main = function (temp) {
        console.log(temp);
        this.window = kernel.winMan.createWindow(this.app, "New Grid");
        this.selectorWindow = kernel.winMan.createWindow(this.app, "Selector");
        this.selectorWindow.showTaskbar = false;
        this.selectorWindow.setSize(92, 92);
        this.selectorWindow.content.style.overflow = "hidden";
        this.selectorWindow.content.style.background = "none";
        this.selectorWindow.remoteShadow();
        this.selectorWindow.changeWindowMode(WindowMode.BORDERLESS);
        this.selectorWindow.topMost = true;
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        this.selectorWindow.hide();
        // (<HTMLElement>this.selectorWindow.handle.getElementsByClassName("window")[0]).style.backgroundColor = null;
        var mk = this.mk;
        this.registerEvents(this.app.events);
        var template = document.getElementById("temp-grid");
        var test = new GridHContainer(this);
        var clone = test.baseNode;
        if (temp) {
            this.applyTemplate(temp);
        }
        else {
            this.window.content.appendChild(clone);
        }
        this.generateSelector();
        this.selectedContainer = test;
    };
    GridViewer.prototype.handle_releaseUp = function () {
        this.handle_release("up");
    };
    GridViewer.prototype.handle_releaseDown = function () {
        this.handle_release("down");
    };
    GridViewer.prototype.handle_releaseRight = function () {
        this.handle_release("right");
    };
    GridViewer.prototype.handle_releaseLeft = function () {
        this.handle_release("left");
    };
    GridViewer.prototype.handle_release = function (dir) {
        var box = null;
        if (this.selectedContainer.gridBoxes.length === 1 && this.selectedContainer.gridBoxes[0].content.innerHTML.length === 0) {
            box = this.selectedContainer.gridBoxes[0];
        }
        else {
            if (dir === "left") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    var newGridbox = new GridHContainer(this);
                    var child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    var newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "right") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    var newGridbox = new GridHContainer(this);
                    var child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    var newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "up") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    var newGridbox = new GridVContainer(this);
                    var child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    var newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "down") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    var newGridbox = new GridVContainer(this);
                    var child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    var newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
        }
        var windowBody = kernel.winMan.activeWindow.handle;
        var window = kernel.winMan.activeWindow;
        window.showTaskbar = false;
        window.changeWindowMode(WindowMode.BORDERLESSFULL);
        this.childWindows.push(window);
        box.content.appendChild(windowBody);
        window.recalculateSize();
        window.onResize(null);
        this.handleResize();
    };
    GridViewer.prototype.applyTemplate = function (gridTemplate) {
        console.log(gridTemplate);
        this.window.title = gridTemplate.name;
        var dataSets = {};
        for (var _i = 0, _a = gridTemplate.sensorsets; _i < _a.length; _i++) {
            var a = _a[_i];
            dataSets[a.key] = kernel.senMan.createDataSource(a);
        }
        console.log(dataSets);
        this.handleHContainer(gridTemplate.grid, this.window.content, dataSets);
        this.handleResize();
    };
    GridViewer.prototype.handleHContainer = function (template, body, dataSets) {
        console.log("HCon");
        console.log(this);
        this.handleContainer(template, body, new GridHContainer(this), this.handleVContainer, dataSets);
    };
    GridViewer.prototype.handleVContainer = function (template, body, dataSets) {
        console.log("VCon");
        console.log(this);
        this.handleContainer(template, body, new GridVContainer(this), this.handleHContainer, dataSets);
    };
    GridViewer.prototype.handleContainer = function (template, body, container, next, dataSets) {
        console.log("Con");
        console.log(this);
        var lastBox = null; // = a.gridBoxes[0];
        var _loop_1 = function (temp) {
            if (lastBox == null) {
                lastBox = container.gridBoxes[0];
            }
            else {
                lastBox = container.insertChildAfter(lastBox);
            }
            if (GridViewer.isIGridLauncher(temp)) {
                var app = kernel.appMan.start(temp.name);
                if (temp.data) {
                    var viewer_1 = app.application;
                    console.log(viewer_1);
                    if (sensys.SensorManager.isViewer(viewer_1)) {
                        var singleViewer_1 = viewer_1;
                        viewer_1.dataSource = dataSets[temp.data[0]];
                        kernel.senMan.fillDataSource(dataSets[temp.data[0]], function () {
                            singleViewer_1.dataUpdate();
                        });
                    }
                    else if (sensys.SensorManager.isCollectionViewer(viewer_1)) {
                        var colViewer = viewer_1;
                        var back = new Multicallback(temp.data.length, function () {
                            viewer_1.dataUpdate();
                        });
                        for (var _i = 0, _a = temp.data; _i < _a.length; _i++) {
                            var name_1 = _a[_i];
                            viewer_1.dataCollectionSource.push(dataSets[name_1]);
                            kernel.senMan.fillDataSource(dataSets[name_1], back.createCallback());
                        }
                    }
                }
                var window_1 = app.windows[0];
                window_1.showTaskbar = false;
                this_1.childWindows.push(window_1);
                window_1.changeWindowMode(WindowMode.BORDERLESSFULL);
                lastBox.content.appendChild(window_1.handle);
                window_1.recalculateSize();
                window_1.onResize(null);
                this_1.handleResize();
            }
            else {
                next.call(this_1, temp, lastBox.content, dataSets);
                //next(temp, lastBox.content);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = template.data; _i < _a.length; _i++) {
            var temp = _a[_i];
            _loop_1(temp);
        }
        body.appendChild(container.baseNode);
    };
    GridViewer.isIGridLauncher = function (data) {
        if (data.name) {
            return true;
        }
        return false;
    };
    GridViewer.isIGridTemplate = function (data) {
        if (Array.isArray(data.data)) {
            return true;
        }
        return false;
    };
    GridViewer.prototype.generateSelector = function () {
        var _this = this;
        var mk = this.mk;
        var selector = mk.tag("div", "dock-selector");
        var up = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: function (e) { return _this.handle_releaseUp(); } }]);
        up.appendChild(mk.tag("div", "dock-up"));
        var left = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: function (e) { return _this.handle_releaseLeft(); } }]);
        left.appendChild(mk.tag("div", "dock-left"));
        var right = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: function (e) { return _this.handle_releaseRight(); } }]);
        right.appendChild(mk.tag("div", "dock-right"));
        var down = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: function (e) { return _this.handle_releaseDown(); } }]);
        down.appendChild(mk.tag("div", "dock-down"));
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(up);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(left);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(right);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(down);
        selector.appendChild(mk.tag("div", "dock-item"));
        this.selectorWindow.content.appendChild(selector);
    };
    GridViewer.prototype.registerEvents = function (eh) {
        var _this = this;
        eh.on(kernel.winMan.onGlobalDrag, function (data) { return _this.globalDrag(data); });
        eh.on(kernel.winMan.onGlobalUp, function (data) { return _this.globalUp(data); });
        eh.on(this.window.onClose, function () { return _this.handleClose(); });
        eh.on(this.window.onResize, function () { return _this.handleResize(); });
        eh.on(this.window.onMove, function () { return _this.handleMove(); });
    };
    GridViewer.prototype.handleClose = function () {
        for (var _i = 0, _a = this.childWindows; _i < _a.length; _i++) {
            var cur = _a[_i];
            cur.close();
            // this.childWindows[cur].close();
        }
        this.app.events.close();
        this.selectorWindow.close();
    };
    GridViewer.prototype.handleResize = function () {
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        for (var _i = 0, _a = this.childWindows; _i < _a.length; _i++) {
            var cur = _a[_i];
            cur.recalculateSize();
            cur.onResize(null);
            // this.childWindows[cur].recalculateSize();
            // this.childWindows[cur].onResize();
        }
    };
    GridViewer.prototype.handleMove = function () {
    };
    GridViewer.prototype.isMouseEvent = function (e) {
        if (e.clientX && e.clientY) {
            return true;
        }
        return false;
    };
    GridViewer.prototype.globalDrag = function (e) {
        if (this.isMouseEvent(e.mouse)) {
            var windowX = e.mouse.clientX - this.window.x - 9;
            var windowY = e.mouse.clientY - this.window.y - 39;
            if (windowX > 0
                && windowY > 0
                && windowX < this.window.width
                && windowY < this.window.height
                && e.window !== this.window) {
                var containers = this.window.handle.getElementsByClassName("grid-con");
                for (var i = containers.length - 1; i >= 0; i--) {
                    var cur = containers[i];
                    if (windowX > cur.offsetLeft
                        && windowY > cur.offsetTop
                        && windowX < cur.offsetLeft + cur.offsetWidth
                        && windowY < cur.offsetTop + cur.offsetHeight) {
                        console.log(cur);
                        this.selectedContainer = cur.gridContainer;
                        break;
                    }
                }
                var gridBoxes = this.window.handle.getElementsByClassName("grid-box");
                var foundGridWindow = null;
                for (var i = gridBoxes.length - 1; i >= 0; i--) {
                    var cur = gridBoxes[i];
                    if (windowX > cur.offsetLeft
                        && windowY > cur.offsetTop
                        && windowX < cur.offsetLeft + cur.offsetWidth
                        && windowY < cur.offsetTop + cur.offsetHeight) {
                        this.selectedBox = cur.gridBox;
                        this.selectorWindow.setPos(this.getAbsoluteLeft(this.selectedBox.box) + this.selectedBox.box.offsetWidth / 2 - 45, this.getAbsoluteTop(this.selectedBox.box) + this.selectedBox.box.offsetHeight / 2 - 45);
                        // this.selectedBox.box.offsetTop 
                        // + (<HTMLElement>(<HTMLElement>this.selectedBox.box.offsetParent).offsetParent).offsetTop +
                        break;
                    }
                }
                this.selectorWindow.show();
                // console.log("global drag grid window: X: " + windowX + " Y: " + windowY);
            }
            else {
                this.selectorWindow.hide();
            }
        }
        else {
            console.log("Got an unhandled touch event in grid system");
        }
    };
    GridViewer.prototype.getAbsoluteLeft = function (ele) {
        var left = ele.offsetLeft;
        while (ele.offsetParent !== null) {
            ele = ele.offsetParent;
            left += ele.offsetLeft;
        }
        return left;
    };
    GridViewer.prototype.getAbsoluteTop = function (ele) {
        var top = ele.offsetTop;
        while (ele.offsetParent !== null) {
            ele = ele.offsetParent;
            top += ele.offsetTop;
        }
        return top;
    };
    GridViewer.prototype.globalUp = function (e) {
        if (this.isMouseEvent(e.mouse)) {
            var windowX = e.mouse.clientX - this.window.x - 9;
            var windowY = e.mouse.clientY - this.window.y - 39;
            if (windowX > 0 && windowY > 0 && windowX < this.window.width && windowY < this.window.height && e.window !== this.window) {
                this.selectorWindow.hide();
            }
        }
        else {
            console.log("Got an unhandled touch event in gridsystem, (globalUp)");
        }
    };
    return GridViewer;
}());
var test = {
    name: "some Grid",
    sensorsets: null,
    grid: {
        data: [
            { name: "LineChartTester", data: null },
            {
                data: [
                    { name: "DataAssigner", data: null }
                ]
            }
        ]
    }
};
var GridContainer = (function () {
    // last: HTMLElement;
    function GridContainer(appWindow) {
        var _this = this;
        this.mk = new HtmlHelper();
        this.gridBoxes = [];
        this.set = "setWidth";
        this.dir = "clientWidth";
        this.offset = "offsetLeft";
        this.mouse = "clientX";
        this.dir2 = "width";
        this.pos = "x";
        this.correction = 0;
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
        var base = this.mk.tag("div", "grid-con grid-" + cls);
        base.gridContainer = this;
        base.appendChild(this.createChild());
        return base;
    };
    GridContainer.prototype.createSeperator = function () {
        return null;
    };
    GridContainer.prototype.insertChildBefore = function (box) {
        return this.insertChild(box, "before");
    };
    GridContainer.prototype.insertChildAfter = function (box) {
        return this.insertChild(box, "after");
    };
    GridContainer.prototype.insertChild = function (box, dir) {
        var _this = this;
        var seperator = this.createSeperator();
        var newTotal = this.gridBoxes.length + 1;
        for (var i = 0; i < this.gridBoxes.length; i++) {
            var cur = this.gridBoxes[i][this.dir2];
            var newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        var child = null;
        var insertString = "";
        if (dir === "before") {
            child = this.createChildBefore(box);
            insertString = "beforebegin";
        }
        else {
            child = this.createChildAfter(box);
            insertString = "afterend";
        }
        box.box.insertAdjacentElement(insertString, child);
        box.box.insertAdjacentElement(insertString, seperator);
        child.gridBox[this.set](1 / newTotal, 6);
        // this.baseNode.appendChild(seperator);
        // this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", function (e) {
            var container = new ResizeContainer(seperator, _this.dir, _this.offset, _this.set, _this.mouse, _this.appWindow.window[_this.pos], _this.correction);
            seperator.parentElement.onmousemove = function (e) {
                _this.appWindow.handleResize();
                container.adjustSize(e);
            };
            seperator.parentElement.onmouseup = function (e) {
                seperator.parentElement.onmousemove = null;
                seperator.parentElement.onmouseup = null;
            };
        });
        return child.gridBox;
    };
    GridContainer.prototype.addChild = function () {
        var _this = this;
        var seperator = this.createSeperator();
        var newTotal = this.gridBoxes.length + 1;
        for (var i = 0; i < this.gridBoxes.length; i++) {
            var cur = this.gridBoxes[i][this.dir2];
            var newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        var child = this.createChild();
        child.gridBox[this.set](1 / newTotal, 6);
        this.baseNode.appendChild(seperator);
        this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", function (e) {
            var container = new ResizeContainer(seperator, _this.dir, _this.offset, _this.set, _this.mouse, _this.appWindow.window[_this.pos], _this.correction);
            seperator.parentElement.onmousemove = function (e) {
                _this.appWindow.handleResize();
                container.adjustSize(e);
            };
            seperator.parentElement.onmouseup = function (e) {
                seperator.parentElement.onmousemove = null;
                seperator.parentElement.onmouseup = null;
            };
        });
        return child.gridBox;
    };
    GridContainer.prototype.resize = function (gridWindow, event, appWindow) {
    };
    GridContainer.prototype.resizeCommon = function (gridWindow, event) {
        gridWindow.style.flexGrow = "0";
        gridWindow.style.flexBasis = "unset";
    };
    GridContainer.prototype.createChildAfter = function (box) {
        return this.createRelativeChild(box, 1);
    };
    GridContainer.prototype.createChildBefore = function (box) {
        return this.createRelativeChild(box, 0);
    };
    GridContainer.prototype.createRelativeChild = function (box, rel) {
        var nBox = new GridBox();
        for (var i = 0; i < this.gridBoxes.length; i++) {
            if (this.gridBoxes[i] === box) {
                this.gridBoxes.splice(i + rel, 0, nBox);
                break;
            }
        }
        return nBox.box;
    };
    GridContainer.prototype.createChild = function () {
        var box = new GridBox();
        this.gridBoxes.push(box);
        return box.box;
    };
    return GridContainer;
}());
/* tslint:enable:interface-name */
var GridBox = (function () {
    function GridBox() {
        this.width = 1;
        this.height = 1;
        var mk = this.mk = new HtmlHelper();
        this.box = mk.tag("div", "grid-box");
        this.box.gridBox = this;
        this.content = mk.tag("div", "grid-window");
        this.box.appendChild(this.content);
    }
    GridBox.prototype.setContent = function (element) {
        this.box.innerHTML = "";
        this.content = element;
        this.box.appendChild(element);
    };
    GridBox.prototype.setWidth = function (percent, correction) {
        if (correction === void 0) { correction = 0; }
        this.width = percent;
        this.box.style.width = "calc(" + (percent * 100).toString() + "% - " + correction.toString() + "px)";
    };
    GridBox.prototype.setHeight = function (percent, correction) {
        if (correction === void 0) { correction = 0; }
        this.height = percent;
        this.box.style.height = "calc(" + (percent * 100).toString() + "% - " + correction.toString() + "px)";
    };
    return GridBox;
}());
var ResizeContainer = (function () {
    function ResizeContainer(seperator, dir, offset, style, mouse, windowPos, correction) {
        this.cur = seperator;
        this.offset = offset;
        this.style = style;
        this.dir = dir;
        this.mouse = mouse;
        this.windowPos = windowPos;
        this.curCor = correction;
        this.initialize();
    }
    ResizeContainer.prototype.initialize = function () {
        this.prev = this.cur.previousElementSibling;
        this.next = this.cur.nextElementSibling;
        this.total = this.cur.parentElement[this.dir];
        this.part = this.prev[this.dir] + this.next[this.dir] + 12;
        this.start = this.cur[this.offset] + this.windowPos;
        this.correction = this.prev[this.offset] + this.windowPos;
        this.startPercent = (this.start - this.correction) / this.total;
    };
    ResizeContainer.prototype.adjustSize = function (e) {
        var curMovement = e[this.mouse] - this.start - this.curCor;
        var curPercentMove = curMovement / this.total;
        var prevWidth = this.startPercent + curPercentMove;
        var nextWidth = (this.part / this.total) - prevWidth;
        this.prev.gridBox[this.style](prevWidth, 6);
        this.next.gridBox[this.style](nextWidth, 6);
    };
    return ResizeContainer;
}());
var GridHContainer = (function (_super) {
    __extends(GridHContainer, _super);
    function GridHContainer(appWindow) {
        var _this = _super.call(this, appWindow) || this;
        _this.set = "setWidth";
        _this.dir = "clientWidth";
        _this.offset = "offsetLeft";
        _this.mouse = "clientX";
        _this.dir2 = "width";
        _this.pos = "x";
        _this.correction = -4;
        return _this;
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
        var _this = _super.call(this, appWindow) || this;
        _this.set = "setHeight";
        _this.dir = "clientHeight";
        _this.offset = "offsetTop";
        _this.mouse = "clientY";
        _this.dir2 = "height";
        _this.pos = "y";
        _this.correction = 25;
        return _this;
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