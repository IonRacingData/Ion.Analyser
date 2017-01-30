var MeterPlot = (function () {
    function MeterPlot(size, labels) {
        this.offset = 5;
        this.totalAngle = (3 * Math.PI) / 2;
        this.startAngle = -(3 * Math.PI) / 4;
        this.size = size;
        this.labels = labels;
    }
    MeterPlot.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main", "needle"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);
        this.ctxNeedle = new ContextFixer(this.canvas.canvases["needle"]);
        this.setSize(this.size);
        return this.wrapper;
    };
    MeterPlot.prototype.draw = function () {
        this.ctxMain.beginPath();
        var radius = this.size / 2;
        this.ctxMain.translate(radius, radius);
        this.ctxMain.arc(0, 0, radius - this.offset, 0, 2 * Math.PI);
        this.ctxMain.stroke();
        this.ctxMain.textBaseline = "middle";
        this.ctxMain.textAlign = "center";
        for (var i = 0; i < this.labels.length; i++) {
            var increment = this.totalAngle / (this.labels.length - 1);
            var ang = (i * increment) + this.startAngle;
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, -radius * 0.85);
            this.ctxMain.rotate(-ang);
            this.ctxMain.fillText(this.labels[i], 0, 0);
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, radius * 0.85);
            this.ctxMain.rotate(-ang);
        }
        this.drawNeedle(0);
    };
    MeterPlot.prototype.drawNeedle = function (percent) {
        this.ctxNeedle.clear();
        var radius = this.size / 2;
        this.ctxNeedle.translate(radius, radius);
        var ang = (percent / 100) * this.totalAngle;
        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        this.ctxNeedle.moveTo(0, 0);
        this.ctxNeedle.lineTo(0, -radius * 0.6);
        this.ctxNeedle.stroke();
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-radius, -radius);
    };
    MeterPlot.prototype.setSize = function (size) {
        this.size = size;
        this.canvas.setSize(size, size);
        this.wrapper.style.height = size.toString() + "px";
        this.wrapper.style.width = size.toString() + "px";
        this.draw();
    };
    return MeterPlot;
}());
//# sourceMappingURL=MeterPlot.js.map