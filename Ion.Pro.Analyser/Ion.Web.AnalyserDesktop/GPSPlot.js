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
        this.padding = this.width / 100;
        this.relSize = null;
        this.draw();
        return this.wrapper;
    };
    GPSPlot.prototype.draw = function () {
        this.ctxMain.clear();
        if (this.relSize === null && this.posData.points.length > 0) {
            this.relSize = { min: null, max: null };
            this.relSize.min = new Point(this.posData.points[0].x, this.posData.points[0].y);
            this.relSize.max = new Point(this.posData.points[0].x, this.posData.points[0].y);
        }
        //this.ctxMain.beginPath();
        for (var i = 0; i < this.posData.points.length; i++) {
            var relPoint = new Point(this.posData.points[i].x, this.posData.points[i].y);
            var absPoint = this.getAbsolute(relPoint);
            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
            //console.log(this.relSize.min, this.relSize.max);
            this.rescale();
            /*
            let outsideCanvasX: boolean = absPoint.x < 0 || absPoint.x > this.width;
            let outsideCanvasY: boolean = absPoint.y < 0 || absPoint.y > this.height;
            if (outsideCanvasX || outsideCanvasY) {
                this.rescale(newWidth, newHeight);
                absPoint = this.getAbsolute(relPoint);
                this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2);
            }
            else {
                this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2);
            }*/
            absPoint = this.getAbsolute(relPoint);
            this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2);
        }
        console.log(this.movePoint);
    };
    GPSPlot.prototype.rescale = function () {
        var newWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        var newHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        //console.log(newWidth, newHeight);
        var xRatio = this.width / newWidth;
        var yRatio = this.height / newHeight;
        //console.log(xRatio, yRatio);
        var ratio = Math.min(xRatio, yRatio); // maybe max       
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