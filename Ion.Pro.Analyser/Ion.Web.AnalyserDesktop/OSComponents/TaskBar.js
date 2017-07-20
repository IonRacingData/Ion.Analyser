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
            if (keys[i] === "hidden")
                continue;
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
        _this.content.style.verticalAlign = "top";
        var mk = new HtmlHelper();
        var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.fill{fill:#F0F0F0;}	.fill2{fill:#2a2a2a;}</style><g id="XMLID_3_">	<circle id="XMLID_1_" class="fill" cx="8.2" cy="8.2" r="7.7"/>	<circle id="XMLID_2_" class="fill2" cx="15.8" cy="15.8" r="7.7"/></g></svg>';
        _this.content.appendChild(mk.tag("div", "btn-themechange", [{ event: "click", func: function (e) { return _this.click_theme(e); } }], svg));
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
        _this.mk = new HtmlHelper();
        _this.content = content;
        _this.content.style.cssFloat = "right";
        _this.content.style.padding = "10px";
        _this.content.style.height = "20px";
        // telemetry connection symbol
        _this.content.appendChild(_this.telemetryStatus());
        // server connection symbol
        var discon = _this.mk.tag("img");
        discon.src = "/Icons/disconnected.png";
        discon.style.width = "20px";
        discon.style.height = "20px";
        discon.style.paddingLeft = "10px";
        discon.title = "Not connected";
        var con = _this.mk.tag("img");
        con.src = "/Icons/connected.png";
        con.style.width = "20px";
        con.style.height = "20px";
        con.style.paddingLeft = "10px";
        con.style.display = "none";
        con.title = "Connected";
        _this.content.appendChild(discon);
        _this.content.appendChild(con);
        if (kernel.netMan.connectionOpen) {
            con.style.display = "inline-block";
            discon.style.display = "none";
        }
        kernel.netMan.onGotConnection.addEventListener(function () {
            con.style.display = "inline-block";
            discon.style.display = "none";
        });
        kernel.netMan.onLostConnection.addEventListener(function () {
            discon.style.display = "inherit";
            con.style.display = "none";
        });
        return _this;
    }
    StatusBar.prototype.telemetryStatus = function () {
        var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" style="enable-background:new 0 0 1000 1000;" xml:space="preserve"><style type="text/css">.lines{fill:none;stroke:#FFFFFF;stroke-width:50;stroke-miterlimit:10;}</style><g id="XMLID_53_"><g id="XMLID_17_"><g id="XMLID_34_"><path id="XMLID_37_" class="lines" d="M184.3,19.7C103.5,100.5,53.5,212.1,53.5,335.4c0,121.2,48.3,231.1,126.7,311.5"/><path id="XMLID_38_" class="lines" d="M819.8,646.9c78.4-80.5,126.7-190.3,126.7-311.5c0-123.3-50-234.9-130.8-315.7"/><path id="XMLID_82_" class="lines" d="M184.3,19.7"/><path id="XMLID_81_" class="lines" d="M815.7,19.7"/></g><g id="XMLID_6_"><path id="XMLID_83_" class="lines" d="M300.3,134.9c-51.1,51.1-82.7,121.7-82.7,199.7c0,76.7,30.6,146.2,80.1,197.1"/><path id="XMLID_40_" class="lines" d="M702.3,531.7c49.6-50.9,80.1-120.4,80.1-197.1c0-78-31.6-148.6-82.7-199.7"/><path id="XMLID_39_" class="lines" d="M300.3,134.9"/><path id="XMLID_35_" class="lines" d="M699.7,134.9"/></g></g><line id="XMLID_36_" class="lines" x1="500" y1="302.5" x2="500" y2="1000"/></g></svg>';
        var tag = this.mk.tag("div", "telemetry-symbol", null, svg);
        tag.style.width = "20px";
        tag.style.height = "20px";
        tag.style.display = "inline-block";
        //tag.style.padding = "10px";
        return tag;
    };
    return StatusBar;
}(Applet));
