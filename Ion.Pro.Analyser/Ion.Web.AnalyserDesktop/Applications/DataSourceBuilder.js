var DataSourceBuilder = (function () {
    function DataSourceBuilder() {
        this.mk = new HtmlHelper();
        this.eh = new EventHandler();
    }
    DataSourceBuilder.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Data Source Builder");
        this.eh.on(kernel.senMan, sensys.SensorManager.event_registerViewer, function () { return _this.draw(); });
        this.eh.on(kernel.senMan, sensys.SensorManager.event_unregisterViewer, function () { return _this.draw(); });
        this.eh.on(this.window, AppWindow.event_close, function () { return _this.window_close(); });
        this.draw();
    };
    DataSourceBuilder.prototype.window_close = function () {
        this.eh.close();
    };
    DataSourceBuilder.prototype.draw = function () {
        this.window.content.innerHTML = "";
        var mk = this.mk;
        var divLeft = mk.tag("div");
        var divRight = mk.tag("div");
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        var last = null;
        tableGen.addHeader("Plot name");
        for (var i = 0; i < senMan.viewers.length; i++) {
            var curPlot = senMan.viewers[i];
            tableGen.addRow(curPlot.plotType);
        }
        divLeft.appendChild(tableGen.generate());
        divLeft.style.minWidth = "250px";
        divLeft.style.flexGrow = "1";
        divLeft.style.overflowY = "auto";
        divRight.style.minWidth = "250px";
        divRight.style.flexGrow = "2";
        divRight.style.overflowY = "auto";
        this.window.content.appendChild(divLeft);
        this.window.content.appendChild(divRight);
    };
    return DataSourceBuilder;
}());
var Carousel = (function () {
    function Carousel() {
        var _this = this;
        this.slides = [];
        this.visibleSlide = 0;
        this.mk = new HtmlHelper();
        this.wrapper = this.mk.tag("div", "carousel");
        this.navWrapper = this.mk.tag("div", "carousel_navWrapper");
        this.description = this.mk.tag("div");
        this.btn_back = this.mk.tag("img");
        this.btn_back.setAttribute("src", "arrow.png");
        this.btn_back.style.transform = "rotate(180deg)";
        this.navWrapper.appendChild(this.btn_back);
        this.navWrapper.appendChild(this.description);
        this.btn_next = this.mk.tag("img");
        this.btn_next.setAttribute("src", "arrow.png");
        this.navWrapper.appendChild(this.btn_next);
        this.btn_next.style.cssFloat = "right";
        this.navWrapper.style.msUserSelect = "none";
        this.contentWrapper = this.mk.tag("div", "carousel_contentWrapper");
        this.btn_back.addEventListener("click", function () {
            if (_this.visibleSlide > 0) {
                _this.contentWrapper.innerHTML = "";
                _this.contentWrapper.appendChild(_this.slides[--_this.visibleSlide].slide);
                _this.description.innerHTML = _this.slides[_this.visibleSlide].description;
            }
        });
        this.btn_next.addEventListener("click", function () {
            if (_this.visibleSlide < _this.slides.length - 1) {
                _this.contentWrapper.innerHTML = "";
                _this.contentWrapper.appendChild(_this.slides[++_this.visibleSlide].slide);
                _this.description.innerHTML = _this.slides[_this.visibleSlide].description;
            }
        });
        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);
    }
    Carousel.prototype.addSlide = function (content, description) {
        var des = description || "";
        var slide = { slide: content, description: des };
        if (this.slides.length === 0) {
            this.contentWrapper.appendChild(content);
            this.description.innerHTML = des;
        }
        this.slides.push(slide);
    };
    return Carousel;
}());
//# sourceMappingURL=DataSourceBuilder.js.map