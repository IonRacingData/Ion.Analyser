var GPSPlot = (function () {
    function GPSPlot(d) {
        this.movePoint = new Point(0, 0);
        this.scalePoint = new Point(1, 1);
        this.color = "white";
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
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.relSize = null;
        return this.wrapper;
    };
    GPSPlot.prototype.setSize = function (width, height) {
        this.canvas.setSize(width, height);
        this.width = width;
        this.height = height;
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.draw();
    };
    GPSPlot.prototype.draw = function () {
        var offsetX;
        var offsetY;
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
            //this.ctxMain.fillRect(absPoint.x - 1 + this.padding + offsetX, absPoint.y - 1 + this.padding - offsetY, 2, 2);             
            this.ctxMain.lineTo(absPoint.x + this.padding + offsetX, absPoint.y + this.padding - offsetY);
        }
        this.ctxMain.stroke();
    };
    GPSPlot.prototype.findMinMax = function () {
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
    GPSPlot.prototype.rescale = function () {
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