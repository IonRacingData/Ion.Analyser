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
        _this.page = 1;
        _this.lastRow = null;
        _this.mk = new HtmlHelper();
        var mk = _this.mk;
        _this.wrapper = mk.tag("div", "dsaController-wrapper");
        _this.contentWrapper = mk.tag("div", "dsaController-contentwrapper");
        _this.navWrapper = mk.tag("div", "dsaController-navwrapper");
        _this.wrapper.appendChild(_this.contentWrapper);
        _this.wrapper.appendChild(_this.navWrapper);
        _this.btnBack = new Button();
        _this.btnBack.text = "BACK";
        _this.btnBack.onclick.addEventListener(function () {
            _this.displayPage1();
        });
        _this.navWrapper.appendChild(_this.btnBack.wrapper);
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
    DataSourceAssignmentController.prototype.displayPage2 = function (plot) {
        this.contentWrapper.innerHTML = "";
        this.builder = new DataSourceBuildController(plot);
        this.contentWrapper.appendChild(this.builder.wrapper);
        this.navWrapper.style.display = "block";
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
    DataSourceAssignmentController.prototype.findTableRow = function (element) {
        var curElement = element;
        while (curElement.parentElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    };
    DataSourceAssignmentController.prototype.displaySources = function (curPlot) {
        var _this = this;
        // TODO: add list of pre-made sources
        this.divRight.innerHTML = "";
        var add = this.mk.tag("p", "", [
            {
                event: "click", func: function (e) {
                    _this.displayPage2(curPlot);
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    };
    DataSourceAssignmentController.prototype.updateViewers = function () {
        this.displayViewers();
    };
    return DataSourceAssignmentController;
}(Component));
