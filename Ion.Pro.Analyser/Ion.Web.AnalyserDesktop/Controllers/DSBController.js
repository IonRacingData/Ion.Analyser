var DSBController = (function () {
    function DSBController(plot) {
        this.mk = new HtmlHelper();
        this.subDivs = [];
        this.plot = plot;
        this.wrapper = this.mk.tag("div", "dsb-wrapper");
        for (var i = 0; i < 4; i++) {
            var div = this.mk.tag("div", "dsb-subdiv");
            this.subDivs.push(div);
            this.wrapper.appendChild(div);
        }
    }
    DSBController.prototype.drawSensors = function () {
    };
    return DSBController;
}());
//# sourceMappingURL=DSBController.js.map