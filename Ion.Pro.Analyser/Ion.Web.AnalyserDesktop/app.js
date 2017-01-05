var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kernel;
window.onload = function () {
    var logViewer = new Launcher(TestViewer, "LogViewer");
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
};
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
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    };
    WindowManager.prototype.mouseUp = function (e) {
        console.log("Global MouseUp");
        console.log(e);
        this.dragging = false;
        this.resizing = false;
    };
    WindowManager.prototype.createWindow = function (app, title) {
        var window = this.makeWindow(app);
        window.setTitle(title);
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
        this.raiseEvent("windowOpen");
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
        this.raiseEvent("windowSelect");
    };
    WindowManager.prototype.makeTopMost = function (appWindow) {
        var index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    };
    WindowManager.prototype.closeWindow = function (app) {
        this.body.removeChild(app.handle);
        this.windows.splice(this.windows.indexOf(app), 1);
        this.order.splice(this.order.indexOf(app), 1);
        this.raiseEvent("windowClose");
    };
    WindowManager.prototype.reorderWindows = function () {
        for (var i = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    };
    WindowManager.prototype.addEventListener = function (type, listner) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listner);
    };
    WindowManager.prototype.raiseEvent = function (type) {
        if (this.events[type]) {
            for (var i = 0; i < this.events[type].length; i++) {
                this.events[type][i]();
            }
        }
        else {
            console.error("event of type: " + type + " does not exist!");
        }
    };
    return WindowManager;
}());
var ApplicationManager = (function () {
    function ApplicationManager() {
        this.appList = [];
        this.launchers = {};
    }
    ApplicationManager.prototype.laucneApplication = function (launcher) {
        var temp = new launcher.mainFunction();
        this.appList.push(new Application(temp));
    };
    ApplicationManager.prototype.registerApplication = function (category, launcher) {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    };
    return ApplicationManager;
}());
var Application = (function () {
    function Application(app) {
        this.application = app;
        app.application = this;
        app.main();
    }
    Application.prototype.onClose = function () {
    };
    return Application;
}());
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        this.mainFunction = mainFunction;
        this.name = name;
    }
    Launcher.prototype.createInstance = function () {
        kernel.appMan.laucneApplication(this);
    };
    return Launcher;
}());
var TestViewer = (function () {
    function TestViewer() {
    }
    TestViewer.prototype.main = function () {
        var mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");
        this.window.content.appendChild(mk.tag("h1", "", null, "Hello World"));
    };
    return TestViewer;
}());
var Taskbar = (function () {
    function Taskbar() {
    }
    return Taskbar;
}());
var Applet = (function () {
    function Applet() {
    }
    return Applet;
}());
var WindowList = (function (_super) {
    __extends(WindowList, _super);
    function WindowList(content) {
        var _this = this;
        _super.call(this);
        this.content = content;
        var wm = this.winMan = kernel.winMan;
        wm.addEventListener("windowOpen", function () { return _this.programOpen(); });
        wm.addEventListener("windowClose", function () { return _this.programClose(); });
        wm.addEventListener("windowSelect", function () { return _this.programSelect(); });
        this.addWindows();
    }
    WindowList.prototype.addWindows = function () {
        var _this = this;
        this.content.innerHTML = "";
        var _loop_1 = function(i) {
            var cur = this_1.winMan.windows[i];
            var ctrl = document.createElement("div");
            ctrl.innerHTML = cur.title;
            ctrl.classList.add("taskbar-button-text");
            if (cur === this_1.winMan.activeWindow) {
                ctrl.classList.add("taskbar-button-select");
            }
            ctrl.window = cur;
            ctrl.addEventListener("mousedown", function () { _this.winMan.selectWindow(cur); });
            this_1.content.appendChild(ctrl);
        };
        var this_1 = this;
        for (var i = 0; i < this.winMan.windows.length; i++) {
            _loop_1(i);
        }
    };
    WindowList.prototype.programOpen = function () {
        console.log("Program Open");
        this.addWindows();
    };
    WindowList.prototype.programClose = function () {
        console.log("Program Close");
        this.addWindows();
    };
    WindowList.prototype.programSelect = function () {
        this.addWindows();
    };
    return WindowList;
}(Applet));
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu(content) {
        var _this = this;
        _super.call(this);
        this.content = content;
        var mk = new HtmlHelper();
        this.content.appendChild(mk.tag("div", "taskbar-button-text", [{ event: "click", func: function (e) { return _this.click_menu(e); } }], "Menu"));
        this.menuHandle = new MenuWindow(document.body);
    }
    MainMenu.prototype.fillMenu = function () {
        this.menuHandle.clear();
        var all = kernel.appMan.launchers;
        var keys = Object.keys(all);
        for (var i = 0; i < keys.length; i++) {
            var cur = all[keys[i]];
            for (var j = 0; j < cur.length; j++) {
                this.menuHandle.add(cur[j], keys[i]);
            }
        }
    };
    MainMenu.prototype.click_menu = function (e) {
        this.menuHandle.hide();
        this.fillMenu();
        this.menuHandle.x = e.pageX;
        this.menuHandle.y = e.pageY;
        this.menuHandle.show();
    };
    return MainMenu;
}(Applet));
var MenuWindow = (function () {
    function MenuWindow(container, x, y) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.items = [];
        this.categories = [];
        this.container = container;
        this.x = x;
        this.y = y;
        document.addEventListener("mouseup", function (e) { return _this.globalClick(e); });
    }
    MenuWindow.prototype.globalClick = function (e) {
        var ele = e.target;
        while (ele.parentElement != null) {
            if (ele === this.content) {
                return;
            }
            else {
                ele = ele.parentElement;
            }
        }
        this.hide();
    };
    MenuWindow.prototype.add = function (item, category) {
        if (category === void 0) { category = ""; }
        var name = (item instanceof Launcher) ? item.name : item.toString();
        if (category == "") {
            this.items.push(new MenuItem(name, item));
        }
        else {
            if (!this.categories[category]) {
                var miAr = [];
                var mi = new MenuItem(category, miAr);
                this.items.push(mi);
                this.categories[category] = miAr;
            }
            this.categories[category].push(new MenuItem(name, item));
        }
    };
    MenuWindow.prototype.clear = function () {
        this.items = [];
        this.categories = [];
    };
    MenuWindow.prototype.show = function () {
        if (!this.visible) {
            var mk = new HtmlHelper();
            var div = this.content = mk.tag("div", "menu-window");
            div.style.left = this.x + "px";
            div.style.top = this.y + "px";
            div.appendChild(this.makeList(this.items, mk));
            this.container.appendChild(div);
        }
        this.visible = true;
    };
    MenuWindow.prototype.makeList = function (list, mk) {
        var _this = this;
        var ul = mk.tag("ul");
        var _loop_2 = function(i) {
            var curItem = list[i];
            var li = mk.tag("li");
            var a = mk.tag("a", "", [{
                    event: "click", func: function (e) {
                        e.preventDefault();
                        if (curItem.value instanceof Launcher) {
                            curItem.value.createInstance();
                            _this.hide();
                        }
                        else if (curItem.value instanceof Array) {
                            if (_this.selectedMenu) {
                                _this.selectedMenu.subMenu.style.display = "none";
                                _this.selectedMenu = null;
                            }
                            curItem.subMenu.style.display = "";
                            _this.selectedMenu = curItem;
                        }
                    }
                }], curItem.name);
            li.appendChild(a);
            a.href = "#";
            if (curItem.value instanceof Array) {
                curItem.subMenu = this_2.makeList(curItem.value, mk);
                curItem.subMenu.style.display = "none";
                li.appendChild(curItem.subMenu);
            }
            ul.appendChild(li);
        };
        var this_2 = this;
        for (var i = 0; i < list.length; i++) {
            _loop_2(i);
        }
        return ul;
    };
    MenuWindow.prototype.hide = function () {
        if (this.visible) {
            this.container.removeChild(this.content);
            this.content = null;
        }
        this.visible = false;
    };
    return MenuWindow;
}());
var MenuItem = (function () {
    function MenuItem(name, value) {
        this.name = name;
        this.value = value;
    }
    return MenuItem;
}());
