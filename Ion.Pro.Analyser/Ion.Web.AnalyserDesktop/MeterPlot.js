var MeterPlot = (function () {
    function MeterPlot(size) {
        this.offset = 5;
        this.size = size;
    }
    MeterPlot.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);
        this.setSize(this.size);
        return this.wrapper;
    };
    MeterPlot.prototype.draw = function () {
        this.ctxMain.beginPath();
        var center = this.size / 2;
        this.ctxMain.arc(center, center, (this.size / 2) - this.offset, 0, 2 * Math.PI);
        this.ctxMain.stroke();
    };
    MeterPlot.prototype.setSize = function (size) {
        this.size = size;
        this.canvas.setSize(size, size);
        this.draw();
    };
    return MeterPlot;
}());
//# sourceMappingURL=MeterPlot.js.map