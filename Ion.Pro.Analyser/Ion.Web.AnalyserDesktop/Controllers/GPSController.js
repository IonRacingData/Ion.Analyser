var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GPSController = (function (_super) {
    __extends(GPSController, _super);
    function GPSController(width, height) {
        var _this = _super.call(this) || this;
        _this.color = "white";
        _this.movePoint = new Point(0, 0);
        _this.scalePoint = new Point(1, 1);
        _this.width = width;
        _this.height = height;
        _this.padding = _this.width * 0.05;
        _this.plotWidth = _this.width - (_this.padding * 2);
        _this.plotHeight = _this.height - (_this.padding * 2);
        return _this;
    }
    GPSController.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.canvas.setSize(this.width, this.height);
        this.relSize = null;
        return this.wrapper;
    };
    GPSController.prototype.onSizeChange = function () {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.plotWidth = this.width - (this.padding * 2);
        this.plotHeight = this.height - (this.padding * 2);
        this.draw();
    };
    GPSController.prototype.draw = function () {
        if (this.posData) {
            var offsetX = void 0;
            var offsetY = void 0;
            this.ctxMain.clear();
            this.ctxMain.beginPath();
            this.ctxMain.strokeStyle = this.color;
            this.findMinMax();
            this.rescale();
            offsetX = (this.width - this.plotWidth) / 2;
            offsetY = (this.height - this.plotHeight) / 2;
            if (this.posData.points.length > 0) {
                var firstPoint = this.getAbsolute(new Point(this.posData.points[0].x, this.posData.points[0].y));
                this.ctxMain.lineTo(firstPoint.x + offsetX, firstPoint.y - offsetY);
            }
            for (var i = 0; i < this.posData.points.length; i++) {
                var relPoint = new Point(this.posData.points[i].x, this.posData.points[i].y);
                var absPoint = this.getAbsolute(relPoint);
                this.ctxMain.lineTo(absPoint.x + offsetX, absPoint.y - offsetY);
            }
            this.ctxMain.stroke();
        }
    };
    GPSController.prototype.findMinMax = function () {
        if (this.relSize === null && this.posData.points.length > 0) {
            this.relSize = { min: null, max: null };
            this.relSize.min = new Point(this.posData.points[0].x, this.posData.points[0].y);
            this.relSize.max = new Point(this.posData.points[0].x, this.posData.points[0].y);
        }
        for (var i = 0; i < this.posData.points.length; i++) {
            var relPoint = new Point(this.posData.points[i].x, this.posData.points[i].y);
            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
        }
    };
    GPSController.prototype.rescale = function () {
        var oldWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        var oldHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        var xRatio = this.plotWidth / oldWidth;
        var yRatio = this.plotHeight / oldHeight;
        var ratio = Math.min(xRatio, yRatio);
        var first = new Point(this.relSize.min.x, this.relSize.min.y);
        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);
        var sec = this.getAbsolute(first);
        sec.y = this.height - sec.y;
        this.movePoint = this.movePoint.sub(sec);
        this.plotWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        this.plotHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        console.log(this.plotWidth, this.plotHeight);
    };
    GPSController.prototype.setData = function (d) {
        this.posData = d;
        this.onDataChange();
    };
    GPSController.prototype.onDataChange = function () {
        this.draw();
    };
    return GPSController;
}(CanvasController));
//# sourceMappingURL=GPSController.js.map