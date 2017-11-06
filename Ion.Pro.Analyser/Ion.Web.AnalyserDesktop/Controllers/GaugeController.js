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
var GaugeController = (function (_super) {
    __extends(GaugeController, _super);
    function GaugeController(width, height, min, max, step) {
        var _this = _super.call(this) || this;
        _this.padding = 5;
        _this.totalAngle = (3 * Math.PI) / 2;
        _this.startAngle = -(3 * Math.PI) / 4;
        _this.defMin = 0;
        _this.defMax = 100;
        _this.defStep = 10;
        _this.customLabels = false;
        _this.color = "black";
        _this.needleColor = "black";
        _this.centerColor = "black";
        _this.wrapper = _this.mk.tag("div", "gauge-controller-wrapper");
        _this.contentWrapper = _this.mk.tag("div", "gauge-controller-content");
        _this.canvas = new LayeredCanvas(_this.contentWrapper);
        _this.ctxMain = new ContextFixer(_this.canvas.addCanvas());
        _this.ctxNeedle = new ContextFixer(_this.canvas.addCanvas());
        _this.ctxCenter = new ContextFixer(_this.canvas.addCanvas());
        _this.wrapper.appendChild(_this.contentWrapper);
        _this.wrapper.appendChild(_this.legendWrapper);
        // following 'if' doesn't work, need fixing
        if (min && max && step) {
            console.log("all defined");
            _this.labels = _this.generateLabels(min, max, step);
            _this.customLabels = true;
        }
        else {
            _this.labels = _this.generateLabels(_this.defMin, _this.defMax, _this.defStep);
        }
        _this.setColor();
        _this.setSize(_this.size, _this.size);
        return _this;
    }
    GaugeController.prototype.generateLabels = function (min, max, step) {
        var labels = [];
        for (var i = min; i <= max; i += step) {
            if (i % 1 == 0)
                labels.push(i.toString());
            else
                labels.push(i.toFixed(2));
        }
        return labels;
    };
    GaugeController.prototype.draw = function () {
        this.ctxMain.clear();
        this.ctxCenter.clear();
        this.ctxMain.fillStyle = this.color;
        this.ctxMain.strokeStyle = this.color;
        var radius = this.size / 2;
        // center dot
        this.ctxCenter.fillStyle = this.color;
        this.ctxCenter.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxCenter.beginPath();
        this.ctxCenter.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
        this.ctxCenter.fill();
        this.ctxCenter.closePath();
        // ring
        this.ctxMain.beginPath();
        this.ctxMain.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxMain.arc(0, 0, radius - this.padding, 3 * Math.PI / 4, Math.PI / 4);
        this.ctxMain.stroke();
        this.ctxMain.closePath();
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
        this.ctxMain.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctxCenter.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.drawNeedle();
    };
    GaugeController.prototype.drawNeedle = function () {
        if (this.percent > 1) {
            console.error("Percentage calculation malfunction");
            this.percent = 1;
        }
        else if (this.percent < 0) {
            console.error("Percentage calculation malfunction");
            this.percent = 0;
        }
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
        this.ctxNeedle.ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    GaugeController.prototype.onSizeChange = function () {
        this.contentHeight = this.height - this.legendHeight;
        this.size = Math.min(this.width, this.contentHeight);
        this.offsetX = (this.width - this.size) / 2;
        this.offsetY = (this.contentHeight - this.size) / 2 + (this.contentHeight * 0.05);
        this.canvas.setSize(this.width, this.contentHeight);
        this.draw();
    };
    GaugeController.prototype.onSensorChange = function () {
        if (!this.customLabels) {
            var min = SensorInfoHelper.minValue(this.lastSensorInfo);
            var max = SensorInfoHelper.maxValue(this.lastSensorInfo);
            var step = ((max - min) / 10);
            if (step < 1) {
                step = 1;
            }
            console.log("New label values: ", min, max, step);
            this.labels = this.generateLabels(min, max, step);
            this.draw();
        }
    };
    GaugeController.prototype.onDataChange = function () {
        this.drawNeedle();
    };
    GaugeController.prototype.setColor = function () {
        this.color = kernel.winMan.getRule(".gauge").style.color || this.color;
        this.needleColor = kernel.winMan.getRule(".gauge").style.borderBottomColor || this.needleColor;
        this.centerColor = kernel.winMan.getRule(".gauge").style.backgroundColor || this.centerColor;
    };
    GaugeController.prototype.updateColors = function () {
        this.setColor();
        this.draw();
    };
    return GaugeController;
}(SingleValueCanvasController));
