var Plotter = (function () {
    function Plotter() {
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
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.data[i]);
            //ctx.fillRect(point.x, point.y, 1, 1);
            ctx.moveTo(point.x, point.y);
        }
    };
    Plotter.prototype.transform = function (d) {
        var time = d.TimeStamp / 10;
        return { x: time, y: d.Value };
    };
    return Plotter;
}());
//# sourceMappingURL=Plotter.js.map