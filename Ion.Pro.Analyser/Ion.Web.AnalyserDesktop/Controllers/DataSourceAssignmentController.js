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
var DataSourceAssignmentController = (function (_super) {
    __extends(DataSourceAssignmentController, _super);
    function DataSourceAssignmentController() {
        var _this = _super.call(this) || this;
        _this.selectedViewer = null;
        _this.page = 1;
        _this.navElements = [];
        _this.selectedRow = null;
        _this.mk = new HtmlHelper();
        var mk = _this.mk;
        _this.wrapper = mk.tag("div", "dsaController-wrapper");
        _this.contentWrapper = mk.tag("div", "dsaController-contentwrapper");
        _this.navWrapper = mk.tag("div", "dsaController-navwrapper");
        for (var i = 0; i < 3; i++) {
            var e = mk.tag("div", "dsaController-navelement");
            _this.navElements.push(e);
            _this.navWrapper.appendChild(e);
        }
        _this.wrapper.appendChild(_this.contentWrapper);
        _this.wrapper.appendChild(_this.navWrapper);
        _this.btnBack = new Button();
        _this.btnBack.text = "BACK";
        _this.btnBack.onclick.addEventListener(function () {
            _this.displayPage1();
        });
        _this.navElements[0].appendChild(_this.btnBack.wrapper);
        _this.displayPage1();
        return _this;
    }
    DataSourceAssignmentController.prototype.displayPage1 = function () {
        var mk = this.mk;
        this.contentWrapper.innerHTML = "";
        this.content = mk.tag("div", "dsaController-content");
        this.divLeft = mk.tag("div", "dsaController-left");
        this.divRight = mk.tag("div", "dsaController-right");
        this.content.appendChild(this.divLeft);
        this.content.appendChild(this.divRight);
        this.contentWrapper.appendChild(this.content);
        this.displayViewers();
        this.navWrapper.style.display = "none";
        this.page = 1;
    };
    DataSourceAssignmentController.prototype.displayPage2 = function () {
        var _this = this;
        this.contentWrapper.innerHTML = "";
        this.navElements[1].innerHTML = "";
        if (this.selectedViewer) {
            this.builder = new DataSourceBuildController(this.selectedViewer);
            this.contentWrapper.appendChild(this.builder.wrapper);
            var viewer = this.mk.tag("div", "dsaController-viewerInfo", [
                {
                    event: "mouseenter", func: function (e) {
                        if (_this.selectedViewer) {
                            _this.selectedViewer.plotWindow.highlight(true);
                        }
                    }
                },
                {
                    event: "mouseleave", func: function (e) {
                        if (_this.selectedViewer) {
                            _this.selectedViewer.plotWindow.highlight(false);
                        }
                    }
                }
            ], this.selectedViewer.plotType);
            this.navElements[1].appendChild(viewer);
        }
        else {
            throw new Error("Undefined viewer exception");
        }
        this.navWrapper.style.display = "flex";
        this.page = 2;
    };
    DataSourceAssignmentController.prototype.displayViewers = function () {
        this.divLeft.innerHTML = "";
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        tableGen.addHeader("Plot name");
        for (var i = 0; i < senMan.viewers.length; i++) {
            var curPlot = senMan.viewers[i];
            this.drawRow(curPlot, tableGen);
        }
        this.divLeft.appendChild(tableGen.generate());
    };
    DataSourceAssignmentController.prototype.drawRow = function (curPlot, tableGen) {
        var _this = this;
        tableGen.addRow([
            {
                event: "click", func: function (e) {
                    if (_this.selectedRow !== null) {
                        _this.selectedRow.classList.remove("selectedrow");
                    }
                    _this.selectedRow = _this.findTableRow(e.target);
                    _this.selectedRow.classList.add("selectedrow");
                    _this.selectedViewer = curPlot;
                    _this.displaySources();
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
    DataSourceAssignmentController.prototype.findTableRow = function (element) {
        var curElement = element;
        while (curElement.parentElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    };
    DataSourceAssignmentController.prototype.displaySources = function () {
        var _this = this;
        this.divRight.innerHTML = "";
        if (this.selectedViewer) {
            var add = this.mk.tag("p", "", [
                {
                    event: "click", func: function (e) {
                        _this.displayPage2();
                    }
                }
            ], "ADD SOURCE");
            add.style.cursor = "pointer";
            this.divRight.appendChild(add);
            var list = new TempDataSourceList(this.selectedViewer);
            this.divRight.appendChild(list.wrapper);
        }
    };
    DataSourceAssignmentController.prototype.onViewersChange = function () {
        this.displayViewers();
        this.displaySources();
        var isRegistered = false;
        for (var _i = 0, _a = kernel.senMan.viewers; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v === this.selectedViewer) {
                isRegistered = true;
            }
        }
        if (!isRegistered) {
            this.displayPage1();
        }
    };
    return DataSourceAssignmentController;
}(Component));
