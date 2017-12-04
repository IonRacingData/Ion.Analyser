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
var SlidingMenu = (function (_super) {
    __extends(SlidingMenu, _super);
    function SlidingMenu(content) {
        var _this = _super.call(this) || this;
        _this.mk = new HtmlHelper();
        _this.touchX = 0;
        _this.width = 220;
        _this.menuOpen = false;
        _this.content = content;
        _this.content.style.verticalAlign = "top";
        var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke:#FFFFFF;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}</style><g id="XMLID_226_">	<line id="XMLID_229_" class="st0" x1="2.9" y1="4.2" x2="21.1" y2="4.2"/>	<line id="XMLID_228_" class="st0" x1="2.9" y1="12" x2="21.1" y2="12"/>	<line id="XMLID_227_" class="st0" x1="2.9" y1="19.8" x2="21.1" y2="19.8"/></g></svg>';
        _this.content.appendChild(_this.mk.tag("div", "btn-taskbar", [{ event: "click", func: function () { return _this.btn_click(); } }], svg));
        _this.menuWrapper = _this.mk.tag("div", "slidingMenu-wrapper");
        _this.menuWrapper.style.left = -_this.width + "px";
        _this.menuWrapper.style.transition = "left 0.3s";
        var touchArea = _this.mk.tag("div", "slidingMenu-touchArea");
        touchArea.addEventListener("touchstart", function (e) { _this.touchStart(e); });
        touchArea.addEventListener("touchmove", function (e) { _this.touchMove(e); });
        touchArea.addEventListener("touchend", function (e) { _this.touchEnd(e); });
        _this.menuWrapper.addEventListener("touchstart", function (e) { _this.touchStart(e); });
        _this.menuWrapper.addEventListener("touchmove", function (e) { _this.touchMove(e); });
        _this.menuWrapper.addEventListener("touchend", function (e) { _this.touchEnd(e); });
        document.body.appendChild(_this.menuWrapper);
        document.body.appendChild(touchArea);
        return _this;
    }
    SlidingMenu.prototype.btn_click = function () {
        if (this.menuOpen)
            this.close();
        else
            this.open();
    };
    SlidingMenu.prototype.open = function () {
        this.menuWrapper.style.left = "0";
        this.menuOpen = true;
    };
    SlidingMenu.prototype.close = function () {
        this.menuWrapper.style.left = -this.width + "px";
        this.menuOpen = false;
    };
    SlidingMenu.prototype.touchStart = function (e) {
        this.touchX = e.touches[0].clientX;
        this.menuWrapper.style.transition = "";
    };
    SlidingMenu.prototype.touchMove = function (e) {
        var clientX = e.touches[0].clientX;
        var dx = clientX - this.touchX;
        var newPos = e.target === this.menuWrapper ? dx : -this.width + dx;
        if (newPos > 0)
            newPos = 0;
        if (newPos < -this.width)
            newPos = -this.width;
        this.menuWrapper.style.left = newPos + "px";
    };
    SlidingMenu.prototype.touchEnd = function (e) {
        this.menuWrapper.style.transition = "left 0.3s";
        var limit = this.width / 3;
        if (this.menuOpen) {
            if (this.menuWrapper.offsetLeft < 0 - limit)
                this.close();
            else
                this.open();
        }
        else {
            if (this.menuWrapper.offsetLeft < -this.width + limit)
                this.close();
            else
                this.open();
        }
    };
    return SlidingMenu;
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
        _this.content.appendChild(mk.tag("div", "btn-taskbar", [{ event: "click", func: function (e) { return _this.click_theme(e); } }], svg));
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
        var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 20" style="enable-background:new 0 0 20 20;" xml:space="preserve"><style type="text/css">.lines{fill:none;stroke:#FFFFFF;stroke-miterlimit:10;}</style><g id="XMLID_63_"><g id="XMLID_65_"><g id="XMLID_71_"><path id="XMLID_75_" class="lines" d="M3.6,0.2C2,1.9,1,4.1,1,6.6c0,2.4,1,4.7,2.6,6.3"/><path id="XMLID_74_" class="lines" d="M16.4,12.9C18,11.3,19,9,19,6.6c0-2.5-1-4.7-2.6-6.4"/><path id="XMLID_73_" class="lines" d="M3.6,0.2"/><path id="XMLID_72_" class="lines" d="M16.4,0.2"/></g><g id="XMLID_66_"><path id="XMLID_70_" class="lines" d="M6,2.6c-1,1-1.7,2.5-1.7,4c0,1.5,0.6,2.9,1.6,4"/><path id="XMLID_69_" class="lines" d="M14.1,10.6c1-1,1.6-2.4,1.6-4c0-1.6-0.6-3-1.7-4"/><path id="XMLID_68_" class="lines" d="M6,2.6"/><path id="XMLID_67_" class="lines" d="M14,2.6"/></g></g><line id="XMLID_64_" class="lines" x1="10" y1="5.9" x2="10" y2="20"/></g></svg>';
        var tag = this.mk.tag("div", "telemetry-symbol", null, svg);
        tag.style.width = "19px";
        tag.style.height = "20px";
        tag.style.display = "none";
        if (kernel.senMan.telemetryReceiving) {
            tag.style.display = "inline-block";
        }
        kernel.senMan.ontelemetry.addEventListener(function () {
            if (kernel.senMan.telemetryReceiving) {
                tag.style.display = "inline-block";
            }
            else {
                tag.style.display = "none";
            }
        });
        //tag.style.padding = "10px";
        return tag;
    };
    return StatusBar;
}(Applet));
//# sourceMappingURL=TaskBar.js.map