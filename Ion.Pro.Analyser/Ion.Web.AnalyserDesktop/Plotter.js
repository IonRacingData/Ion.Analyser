var Plotter = (function () {
    function Plotter() {
        this.movePoint = { x: 50, y: 50 };
        this.scalePoint = { x: 1, y: 1 };
    }
    Plotter.prototype.generatePlot = function (data) {
        var _this = this;
        this.canvas = document.createElement("canvas");
        this.canvas.addEventListener("mousedown", function (e) {
            _this.mouseMod = { x: _this.movePoint.x - e.layerX, y: _this.movePoint.y - (_this.canvas.height - e.layerY) };
            console.log(_this.mouseMod);
            _this.dragging = true;
        });
        this.canvas.addEventListener("mousemove", function (e) {
            if (_this.dragging) {
                _this.movePoint = { x: e.layerX + _this.mouseMod.x, y: (_this.canvas.height - e.layerY) + _this.mouseMod.y };
                console.log(_this.movePoint);
                _this.draw();
            }
        });
        this.canvas.addEventListener("mouseup", function (e) {
            _this.dragging = false;
        });
        this.canvas.addEventListener("mouseleave", function () { _this.dragging = false; });
        this.canvas.addEventListener("wheel", function (e) { return _this.zoom(e); });
        this.data = data;
        this.draw();
        return this.canvas;
    };
    Plotter.prototype.zoom = function (e) {
        this.movePoint.x = e.layerX;
        //this.scalePoint.x -= e.deltaY/10;
        //this.scalePoint.y -= e.deltaY/10;
        this.draw();
    };
    Plotter.prototype.draw = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();
        var lastPoint;
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.createPoint(this.data[i]));
            ctx.moveTo(point.x, point.y);
            if (i > 0) {
                ctx.lineTo(lastPoint.x, lastPoint.y);
            }
            lastPoint = point;
        }
        // x-axis
        ctx.moveTo(0, this.canvas.height - this.movePoint.y);
        ctx.lineTo(this.canvas.width, this.canvas.height - this.movePoint.y);
        // y-axis
        ctx.moveTo(this.movePoint.x, 0);
        ctx.lineTo(this.movePoint.x, this.canvas.height);
        ctx.stroke();
    };
    Plotter.prototype.createPoint = function (data) {
        return { x: data.TimeStamp / 10, y: data.Value };
    };
    Plotter.prototype.transform = function (p) {
        var scaled = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var moved = { x: scaled.x + this.movePoint.x, y: scaled.y + this.movePoint.y };
        return { x: moved.x, y: this.canvas.height - moved.y };
    };
    return Plotter;
}());
//# sourceMappingURL=Plotter.js.map