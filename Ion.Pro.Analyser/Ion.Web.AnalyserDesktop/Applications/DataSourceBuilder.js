var DataSourceBuilder = (function () {
    function DataSourceBuilder() {
        this.mk = new HtmlHelper();
        this.dsbOpen = false;
        this.lastRow = null;
    }
    DataSourceBuilder.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.app, "Data Source Builder");
        this.wrapper = this.mk.tag("div");
        this.wrapper.style.display = "flex";
        this.wrapper.style.flexDirection = "column";
        this.wrapper.style.height = "100%";
        this.wrapper.style.justifyContent = "space-between";
        this.innerWrapper = this.mk.tag("div");
        this.innerWrapper.style.display = "flex";
        this.innerWrapper.style.flexDirection = "row";
        this.bottomDiv = this.mk.tag("div");
        this.wrapper.appendChild(this.innerWrapper);
        this.wrapper.appendChild(this.bottomDiv);
        this.window.content.appendChild(this.wrapper);
        this.app.events.on(kernel.senMan.onRegisterViewer, function () {
            if (!_this.dsbOpen) {
                _this.drawLeft();
            }
        });
        this.app.events.on(kernel.senMan.onUnRegisterViewer, function () {
            if (!_this.dsbOpen) {
                _this.drawLeft();
            }
        });
        this.drawInner();
    };
    DataSourceBuilder.prototype.drawInner = function () {
        this.innerWrapper.innerHTML = "";
        var mk = this.mk;
        this.divLeft = mk.tag("div");
        this.divRight = mk.tag("div");
        this.drawLeft();
        this.divRight.style.flexGrow = "1";
        this.divRight.style.flexBasis = "0";
        this.innerWrapper.appendChild(this.divLeft);
        this.innerWrapper.appendChild(this.divRight);
    };
    DataSourceBuilder.prototype.drawLeft = function () {
        this.divLeft.innerHTML = "";
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        tableGen.addHeader("Plot name");
        for (var i = 0; i < senMan.viewers.length; i++) {
            var curPlot = senMan.viewers[i];
            this.drawRow(curPlot, tableGen);
        }
        this.divLeft.appendChild(tableGen.generate());
        this.divLeft.style.flexGrow = "1";
        this.divLeft.style.flexBasis = "0";
    };
    DataSourceBuilder.prototype.drawRow = function (curPlot, tableGen) {
        var _this = this;
        tableGen.addRow([
            {
                event: "click", func: function (e) {
                    if (_this.lastRow !== null) {
                        _this.lastRow.classList.remove("selectedrow");
                    }
                    _this.lastRow = _this.findTableRow(e.target);
                    _this.lastRow.classList.add("selectedrow");
                    _this.displaySources(curPlot);
                }
            },
            {
                event: "mouseenter", func: function (e) {
                    curPlot.plotWindow.highlight(true);
                }
            },
            {
                event: "mouseleave", func: function (e) {
                    curPlot.plotWindow.highlight(false);
                }
            }
        ], curPlot.plotType);
    };
    DataSourceBuilder.prototype.findTableRow = function (element) {
        var curElement = element;
        while (curElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    };
    DataSourceBuilder.prototype.displaySources = function (curPlot) {
        var _this = this;
        this.divRight.innerHTML = "";
        var add = this.mk.tag("p", "", [
            {
                event: "click", func: function (e) {
                    _this.openDSB(curPlot);
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    };
    DataSourceBuilder.prototype.openDSB = function (curPlot) {
        var _this = this;
        this.dsbOpen = true;
        this.innerWrapper.innerHTML = "";
        this.dsb = new DSBController(curPlot);
        this.innerWrapper.appendChild(this.dsb.wrapper);
        var back = this.mk.tag("p", "", [
            {
                event: "click", func: function (e) {
                    _this.dsbOpen = false;
                    _this.drawInner();
                    _this.bottomDiv.innerHTML = "";
                    _this.displaySources(curPlot);
                }
            }
        ], "BACK");
        back.style.cursor = "pointer";
        this.bottomDiv.appendChild(back);
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