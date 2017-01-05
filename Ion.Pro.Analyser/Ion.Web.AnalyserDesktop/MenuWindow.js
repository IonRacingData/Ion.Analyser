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
        var _loop_1 = function(i) {
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
                curItem.subMenu = this_1.makeList(curItem.value, mk);
                curItem.subMenu.style.display = "none";
                li.appendChild(curItem.subMenu);
            }
            ul.appendChild(li);
        };
        var this_1 = this;
        for (var i = 0; i < list.length; i++) {
            _loop_1(i);
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
