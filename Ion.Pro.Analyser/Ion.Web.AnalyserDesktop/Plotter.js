var Plotter = (function () {
    function Plotter() {
        this.movePoint = new Point(50, 50);
        this.scalePoint = new Point(1, 1);
        this.dragging = false;
        this.zoomSpeed = 1.1;
        this.highlightPoint = null;
    }
    Plotter.prototype.generatePlot = function (data) {
        var _this = this;
        this.canvas = document.createElement("canvas");
        this.canvas.addEventListener("mousedown", function (e) {
            _this.mouseMod = new Point(_this.movePoint.x - e.layerX, _this.movePoint.y - (_this.canvas.height - e.layerY));
            _this.mouseDown = true;
        });
        this.canvas.addEventListener("mousemove", function (e) {
            if (_this.mouseDown) {
                _this.dragging = true;
                _this.movePoint = new Point(e.layerX + _this.mouseMod.x, (_this.canvas.height - e.layerY) + _this.mouseMod.y);
                _this.draw();
            }
        });
        this.canvas.addEventListener("mouseup", function (e) {
            _this.mouseDown = false;
            if (_this.dragging)
                _this.dragging = false;
            else
                _this.markPoint(e);
        });
        this.canvas.addEventListener("mouseleave", function () { _this.mouseDown = false; });
        this.canvas.addEventListener("wheel", function (e) { return _this.zoom(e); });
        this.canvas.addEventListener("click", function (e) {
        });
        this.data = data;
        this.draw();
        return this.canvas;
    };
    Plotter.prototype.markPoint = function (e) {
        var mp = this.getMousePoint(e);
        var closest = this.data.getClosest(this.getRelative(mp));
        if (Math.abs(this.getAbsolute(closest).y - mp.y) < 10)
            this.highlightPoint = closest;
        else
            this.highlightPoint = null;
        this.draw();
    };
    Plotter.prototype.zoom = function (e) {
        e.preventDefault();
        //console.log(e);
        var mousePoint = this.getMousePoint(e);
        var curRel = this.getRelative(mousePoint);
        if (e.deltaY < 0) {
            if (e.ctrlKey == true)
                this.scalePoint.x *= this.zoomSpeed;
            else if (e.shiftKey == true)
                this.scalePoint.y *= this.zoomSpeed;
            else {
                this.scalePoint.x *= this.zoomSpeed;
                this.scalePoint.y *= this.zoomSpeed;
            }
        }
        else {
            if (e.ctrlKey == true)
                this.scalePoint.x /= this.zoomSpeed;
            else if (e.shiftKey == true)
                this.scalePoint.y /= this.zoomSpeed;
            else {
                this.scalePoint.x /= this.zoomSpeed;
                this.scalePoint.y /= this.zoomSpeed;
            }
        }
        var newRel = this.getRelative(mousePoint);
        var move = new Point((newRel.x - curRel.x) * this.scalePoint.x, (newRel.y - curRel.y) * this.scalePoint.y);
        this.movePoint = this.movePoint.add(move);
        this.draw();
    };
    Plotter.prototype.getMousePoint = function (e) {
        return new Point(e.layerX, e.layerY);
    };
    Plotter.prototype.draw = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();
        var lastPoint;
        var firstVisibleIdx = this.data.getIndexOf(this.getRelative(new Point(0, 0)));
        if (firstVisibleIdx > 0)
            firstVisibleIdx--;
        for (var i = firstVisibleIdx; i < this.data.points.length; i++) {
            var point = this.getAbsolute(this.data.points[i]);
            if (point.x > 0) {
                if (i > 0 && (point.x !== lastPoint.x || point.y !== lastPoint.y)) {
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                }
                if (point.x > this.canvas.width) {
                    break;
                }
            }
            lastPoint = point;
        }
        this.drawXAxis(ctx);
        this.drawYAxis(ctx);
        ctx.stroke();
        if (this.highlightPoint !== null) {
            var abs = this.getAbsolute(this.highlightPoint);
            ctx.beginPath();
            //ctx.moveTo(abs.x, abs.y);
            ctx.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            var pointString = this.highlightPoint.toString();
            ctx.fillText(this.highlightPoint.toString(), this.canvas.width - ctx.measureText(pointString).width - 3, 10);
            ctx.stroke();
        }
    };
    Plotter.prototype.drawXAxis = function (ctx) {
        var origo = this.getAbsolute(new Point(0, 0));
        ctx.moveTo(0, origo.y);
        ctx.lineTo(this.canvas.width, origo.y);
        var stepping = this.calculateSteps(this.scalePoint.x);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.canvas.width + steps; i += steps) {
            var transformer = this.getRelative(new Point(i + this.movePoint.x % steps, origo.y));
            var number;
            var numWidth;
            if (Math.abs(transformer.x).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "     0";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.x.toExponential(2);
            }
            else {
                number = transformer.x.toFixed(decimalPlaces);
            }
            numWidth = ctx.measureText(number).width;
            ctx.fillText(number, i + this.movePoint.x % steps - (numWidth / 2), origo.y + 15);
            ctx.moveTo(i + this.movePoint.x % steps, origo.y);
            ctx.lineTo(i + this.movePoint.x % steps, origo.y + 4);
        }
    };
    Plotter.prototype.drawYAxis = function (ctx) {
        var origo = this.getAbsolute(new Point(0, 0));
        ctx.moveTo(origo.x, 0);
        ctx.lineTo(origo.x, this.canvas.height);
        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.canvas.height + steps; i += steps) {
            var transformer = this.getRelative(new Point(origo.x, this.canvas.height - (i + this.movePoint.y % steps)));
            var number;
            var numWidth;
            if (Math.abs(transformer.y).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }
            numWidth = ctx.measureText(number).width;
            ctx.fillText(number, origo.x - (numWidth + 7), this.canvas.height - (i + this.movePoint.y % steps) + 3);
            ctx.moveTo(origo.x, this.canvas.height - (i + this.movePoint.y % steps));
            ctx.lineTo(origo.x - 4, this.canvas.height - (i + this.movePoint.y % steps));
        }
    };
    Plotter.prototype.calculateSteps = function (scaling) {
        var log10 = function log10(val) {
            return Math.log(val) / Math.LN10;
        };
        var maxR = 100 / scaling;
        var scale = Math.floor(log10(maxR));
        var step = Math.floor(maxR / Math.pow(10, scale));
        if (step < 2) {
            step = 1;
        }
        else if (step < 5) {
            step = 2;
        }
        else {
            step = 5;
        }
        var newstep = step * Math.pow(10, scale) * scaling;
        var decimalPlaces = 0;
        if (scale < 0)
            decimalPlaces = scale * -1;
        return { steps: newstep, decimalPlaces: decimalPlaces, scale: scale };
    };
    Plotter.prototype.getRelative = function (p) {
        var moved = new Point(p.x - this.movePoint.x, this.canvas.height - p.y - this.movePoint.y);
        var scaled = moved.divide(this.scalePoint);
        return scaled;
    };
    Plotter.prototype.getAbsolute = function (p) {
        var scaled = p.multiply(this.scalePoint);
        var moved = scaled.add(this.movePoint);
        return new Point(moved.x, this.canvas.height - moved.y);
    };
    return Plotter;
}());
//# sourceMappingURL=Plotter.js.map