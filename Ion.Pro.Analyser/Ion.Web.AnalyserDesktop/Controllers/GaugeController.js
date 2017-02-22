var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GaugeController = (function (_super) {
    __extends(GaugeController, _super);
    function GaugeController(width, height, min, max, step) {
        var _this = _super.call(this) || this;
        _this.padding = 5;
        _this.totalAngle = (3 * Math.PI) / 2;
        _this.startAngle = -(3 * Math.PI) / 4;
        _this.color = "black";
        _this.needleColor = "black";
        _this.size = Math.min(width, height);
        var labels = [];
        for (var i = min; i <= max; i += step) {
            labels.push(i.toString());
        }
        _this.labels = labels;
        // temp stylesheet thingy
        var ss;
        var all = document.styleSheets;
        for (var i = 0; i < all.length; i++) {
            if (all[i].title === "app-style") {
                ss = all[i];
                var rules = ss.cssRules;
                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    if (rule.selectorText === ".gauge-plot") {
                        _this.color = rule.style.color;
                        _this.needleColor = rule.style.borderColor;
                        break;
                    }
                }
                break;
            }
        }
        return _this;
    }
    GaugeController.prototype.generate = function () {
        this.wrapper = this.mk.tag("div", "plot-wrapper");
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.ctxNeedle = new ContextFixer(this.canvas.addCanvas());
        this.ctxCenter = new ContextFixer(this.canvas.addCanvas());
        this.setSize(this.size, this.size);
        return this.wrapper;
    };
    GaugeController.prototype.draw = function () {
        this.ctxMain.fillStyle = this.color;
        this.ctxMain.strokeStyle = this.color;
        var radius = this.size / 2;
        // center dot
        this.ctxCenter.fillStyle = this.color;
        this.ctxCenter.translate(radius + this.offsetX, radius + this.offsetY);
        //this.ctxCenter.beginPath();
        this.ctxCenter.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
        this.ctxCenter.fill();
        // ring
        this.ctxMain.beginPath();
        this.ctxMain.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxMain.arc(0, 0, radius - this.padding, 3 * Math.PI / 4, Math.PI / 4);
        this.ctxMain.stroke();
        this.ctxMain.ctx.closePath();
        // labels
        this.ctxMain.textBaseline = "middle";
        this.ctxMain.textAlign = "center";
        this.ctxMain.ctx.font = radius * 0.1 + "px sans-serif";
        for (var i = 0; i < this.labels.length; i++) {
            var increment = this.totalAngle / (this.labels.length - 1);
            var ang = (i * increment) + this.startAngle;
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, -radius * 0.8);
            this.ctxMain.rotate(-ang);
            this.ctxMain.fillText(this.labels[i], 0, 0);
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, radius * 0.8);
            this.ctxMain.rotate(-ang);
        }
        this.drawNeedle();
    };
    GaugeController.prototype.drawNeedle = function () {
        var val = this.percent * 100;
        this.ctxNeedle.fillStyle = this.needleColor;
        this.ctxNeedle.clear();
        var radius = this.size / 2;
        this.ctxNeedle.translate(radius + this.offsetX, radius + this.offsetY);
        var ang = (val / 100) * this.totalAngle;
        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        this.ctxNeedle.fillRect(-1, 0, 2, -radius * 0.85);
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-(radius + this.offsetX), -(radius + this.offsetY));
    };
    GaugeController.prototype.onSizeChange = function () {
        this.size = Math.min(this.width, this.height);
        this.offsetX = (this.width - this.size) / 2;
        this.offsetY = (this.height - this.size) / 2 + (this.height * 0.05);
        this.canvas.setSize(this.width, this.height);
        this.draw();
    };
    GaugeController.prototype.onDataChange = function () {
        this.drawNeedle();
    };
    return GaugeController;
}(SingleValueCanvasController));
//# sourceMappingURL=GaugeController.js.map