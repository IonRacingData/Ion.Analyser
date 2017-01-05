var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
