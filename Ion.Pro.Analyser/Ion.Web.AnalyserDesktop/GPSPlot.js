var GPSPlot = (function () {
    function GPSPlot(d) {
        this.movePoint = new Point(0, 0);
        this.scalePoint = new Point(1, 1);
        this.posData = d;
    }
    // temp
    GPSPlot.prototype.update = function (d) {
        this.posData = d;
        this.draw();
    };
    GPSPlot.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.draw();
        return this.wrapper;
    };
    GPSPlot.prototype.draw = function () {
        //this.ctxMain.beginPath();
        for (var i = 0; i < this.posData.points.length; i++) {
            var point = this.getAbsolute(new Point(this.posData.points[i].x, this.posData.points[i].y));
            //console.log(point); 
            this.ctxMain.fillRect(point.x - 1, point.y - 1, 2, 2);
            var outsideCanvasX = point.x < 0 || point.x > this.width;
            var outsideCanvasY = point.y < 0 || point.y > this.height;
            if (outsideCanvasX || outsideCanvasY) {
                this.scale(point);
            }
        }
    };
    GPSPlot.prototype.scale = function (p) {
    };
    GPSPlot.prototype.getRelative = function (p) {
        var moved = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        var scaled = moved.divide(this.scalePoint);
        return scaled;
    };
    GPSPlot.prototype.getAbsolute = function (p) {
        var scaled = p.multiply(this.scalePoint);
        var moved = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    };
    GPSPlot.prototype.getMousePoint = function (e) {
        return new Point(e.layerX, e.layerY);
    };
    return GPSPlot;
}());
//# sourceMappingURL=GPSPlot.js.map