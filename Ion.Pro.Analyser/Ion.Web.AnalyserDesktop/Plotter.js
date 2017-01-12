var Plotter = (function () {
    function Plotter() {
        this.movePoint = { x: 0, y: 0 };
        this.scalePoint = { x: 0.1, y: 1 };
    }
    Plotter.prototype.generatePlot = function (data) {
        this.canvas = document.createElement("canvas");
        this.data = data;
        this.draw();
        return this.canvas;
    };
    Plotter.prototype.draw = function () {
        var ctx = this.canvas.getContext("2d");
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
        ctx.stroke();
    };
    Plotter.prototype.createPoint = function (data) {
        return { x: data.TimeStamp, y: data.Value };
    };
    Plotter.prototype.transform = function (p) {
        var p2 = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var p3 = { x: p2.x + this.movePoint.x, y: p2.y + this.movePoint.y };
        console.log(p3);
        return { x: p3.x, y: this.canvas.height - p3.y };
    };
    return Plotter;
}());
//# sourceMappingURL=Plotter.js.map