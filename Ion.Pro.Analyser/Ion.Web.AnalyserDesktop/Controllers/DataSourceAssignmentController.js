var DataSourceAssignmentController = (function () {
    function DataSourceAssignmentController() {
        this.plot = null;
        this.page = 1;
        this.lastRow = null;
        /* page 2 */
        this.mk = new HtmlHelper();
        this.subDivs = [];
    }
    DataSourceAssignmentController.prototype.generate = function () {
        this.initContent();
        this.displayPage1();
        this.updateViewers();
        return this.wrapper;
    };
    DataSourceAssignmentController.prototype.displayPage1 = function () {
        //this.displayViewers();
        this.wrapper_p1.style.display = "flex";
        this.wrapper_p2.style.display = "none";
        this.page = 1;
    };
    DataSourceAssignmentController.prototype.displayPage2 = function () {
        this.wrapper_p1.style.display = "none";
        this.wrapper_p2.style.display = "flex";
        this.listsensors();
        this.drawBackButton();
        this.page = 2;
    };
    DataSourceAssignmentController.prototype.initContent = function () {
        var mk = this.mk;
        /* dsb wrapper */
        this.wrapper = mk.tag("div", "dsb-wrapper");
        this.contentWrapper = mk.tag("div", "dsb-contentwrapper");
        this.navWrapper = mk.tag("div", "dsb-navwrapper");
        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);
        /* page 1 */
        this.wrapper_p1 = mk.tag("div", "dsb-p1-wrapper");
        this.wrapper_p1.style.display = "flex";
        this.wrapper_p1.style.flexDirection = "row";
        this.wrapper_p1.style.justifyContent = "space-between";
        this.divLeft = mk.tag("div");
        this.divLeft.style.flexGrow = "1";
        this.divLeft.style.flexBasis = "0";
        this.divRight = mk.tag("div");
        this.divRight.style.flexGrow = "1";
        this.divRight.style.flexBasis = "0";
        this.wrapper_p1.appendChild(this.divLeft);
        this.wrapper_p1.appendChild(this.divRight);
        this.contentWrapper.appendChild(this.wrapper_p1);
        /* page 2 */
        this.wrapper_p2 = mk.tag("div", "dsb-p2-wrapper");
        for (var i = 0; i < 4; i++) {
            var div = mk.tag("div", "dsb-p2-section");
            this.subDivs.push(div);
            this.wrapper_p2.appendChild(div);
        }
        this.contentWrapper.appendChild(this.wrapper_p2);
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
                    _this.plot = curPlot;
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
                    _this.displayPage2();
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    };
    DataSourceAssignmentController.prototype.drawBackButton = function () {
        var _this = this;
        var back = this.mk.tag("p", "", [
            {
                event: "click", func: function (e) {
                    _this.navWrapper.innerHTML = "";
                    _this.displayPage1();
                }
            }
        ], "BACK");
        back.style.cursor = "pointer";
        this.navWrapper.appendChild(back);
    };
    DataSourceAssignmentController.prototype.listsensors = function () {
        if (this.plot) {
            //console.log(kernel.senMan.getInfos());
            var infos = kernel.senMan.getInfos();
            for (var _i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
                var i = infos_1[_i];
                console.log(i.Name);
            }
        }
    };
    DataSourceAssignmentController.prototype.updateViewers = function () {
        this.displayViewers();
    };
    return DataSourceAssignmentController;
}());
//# sourceMappingURL=DataSourceAssignmentController.js.map