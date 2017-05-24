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
        var _this = _super.call(this) || this;
        _this.content = content;
        var winMan = _this.winMan = kernel.winMan;
        winMan.onWindowOpen.addEventListener(function () { return _this.programOpen(); });
        winMan.onWindowClose.addEventListener(function () { return _this.programClose(); });
        winMan.onWindowSelect.addEventListener(function () { return _this.programSelect(); });
        winMan.onWindowUpdate.addEventListener(function () { return _this.windowUpdate(); });
        _this.addWindows();
        return _this;
    }
    WindowList.prototype.addWindows = function () {
        var _this = this;
        this.content.innerHTML = "";
        var _loop_1 = function (i) {
            var cur = this_1.winMan.windows[i];
            if (cur.showTaskbar) {
                var ctrl = document.createElement("div");
                ctrl.innerHTML = cur.title;
                ctrl.classList.add("taskbar-button-text");
                if (cur === this_1.winMan.activeWindow) {
                    ctrl.classList.add("taskbar-button-select");
                }
                ctrl.window = cur;
                ctrl.addEventListener("mousedown", function () { _this.winMan.selectWindow(cur); });
                this_1.content.appendChild(ctrl);
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.winMan.windows.length; i++) {
            _loop_1(i);
        }
    };
    WindowList.prototype.windowUpdate = function () {
        console.log("Window update");
        this.addWindows();
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
        var _this = _super.call(this) || this;
        _this.content = content;
        var mk = new HtmlHelper();
        _this.content.appendChild(mk.tag("div", "taskbar-button-text", [{ event: "click", func: function (e) { return _this.click_menu(e); } }], "Menu"));
        _this.menuHandle = new MenuWindow(document.body);
        return _this;
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
        // this.menuHandle.x = e.pageX;
        // this.menuHandle.y = e.pageY;
        this.menuHandle.x = 0;
        this.menuHandle.y = 40;
        this.menuHandle.show();
    };
    return MainMenu;
}(Applet));
var ChangeTheme = (function (_super) {
    __extends(ChangeTheme, _super);
    function ChangeTheme(content) {
        var _this = _super.call(this) || this;
        _this.isDark = true;
        _this.content = content;
        var mk = new HtmlHelper();
        _this.content.appendChild(mk.tag("div", "taskbar-button-text", [{ event: "click", func: function (e) { return _this.click_theme(e); } }], "Theme"));
        return _this;
    }
    ChangeTheme.prototype.click_theme = function (e) {
        if (this.isDark) {
            kernel.winMan.changeTheme("app-style");
            this.isDark = false;
        }
        else {
            kernel.winMan.changeTheme("app-style-dark");
            this.isDark = true;
        }
    };
    return ChangeTheme;
}(Applet));
var StatusBar = (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar(content) {
        var _this = _super.call(this) || this;
        _this.content = content;
        _this.content.style.cssFloat = "right";
        _this.content.style.padding = "8px";
        var mk = new HtmlHelper();
        _this.discon = mk.tag("img");
        _this.discon.src = "/icons/disconnected.png";
        _this.discon.style.width = "24px";
        _this.discon.style.height = "24px";
        _this.discon.title = "Not connected";
        _this.con = mk.tag("img");
        _this.con.src = "/icons/connected.png";
        _this.con.style.width = "24px";
        _this.con.style.height = "24px";
        _this.con.style.display = "none";
        _this.con.title = "Connected";
        _this.content.appendChild(_this.discon);
        _this.content.appendChild(_this.con);
        if (kernel.netMan.connectionOpen) {
            _this.con.style.display = "inherit";
            _this.discon.style.display = "none";
        }
        kernel.netMan.onGotConnection.addEventListener(function () {
            _this.con.style.display = "inherit";
            _this.discon.style.display = "none";
        });
        kernel.netMan.onLostConnection.addEventListener(function () {
            _this.discon.style.display = "inherit";
            _this.con.style.display = "none";
        });
        return _this;
    }
    return StatusBar;
}(Applet));
//# sourceMappingURL=TaskBar.js.map