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
var GPSController = (function (_super) {
    __extends(GPSController, _super);
    function GPSController(width, height) {
        var _this = _super.call(this) || this;
        _this.color = "white";
        _this.movePoint = new Point(0, 0);
        _this.scalePoint = new Point(1, 1);
        _this.width = width;
        _this.height = height;
        return _this;
    }
    GPSController.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.relSize = null;
        return this.wrapper;
    };
    GPSController.prototype.onSizeChange = function () {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
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
            this.rescale();
            if (this.posData.points.length > 0) {
                var firstPoint = this.getAbsolute(new Point(this.posData.points[0].x, this.posData.points[0].y));
                offsetX = (this.width - this.absWidth) / 2;
                offsetY = (this.height - this.absHeight) / 2;
                this.ctxMain.moveTo(firstPoint.x + this.padding + offsetX, firstPoint.y + this.padding - offsetY);
            }
            for (var i = 0; i < this.posData.points.length; i++) {
                var relPoint = new Point(this.posData.points[i].x, this.posData.points[i].y);
                offsetX = (this.width - this.absWidth) / 2;
                offsetY = (this.height - this.absHeight) / 2;
                var absPoint = this.getAbsolute(relPoint);
                this.ctxMain.lineTo(absPoint.x + this.padding + offsetX, absPoint.y + this.padding - offsetY);
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
        var newWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        var newHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        this.absWidth = newWidth;
        this.absHeight = newHeight;
        var xRatio = this.width / newWidth;
        var yRatio = this.height / newHeight;
        var ratio = Math.min(xRatio, yRatio);
        var first = new Point(this.relSize.min.x, this.relSize.min.y);
        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);
        var sec = this.getAbsolute(first);
        sec.y = this.height - sec.y;
        this.movePoint = this.movePoint.sub(sec);
    };
    GPSController.prototype.setData = function (d) {
        this.posData = d;
        console.log(d);
        this.onDataChange();
    };
    GPSController.prototype.onDataChange = function () {
        this.draw();
    };
    return GPSController;
}(CanvasController));
//# sourceMappingURL=GPSController.js.map