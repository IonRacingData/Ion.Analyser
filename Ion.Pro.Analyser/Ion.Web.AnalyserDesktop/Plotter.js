var Plotter = (function () {
    function Plotter(data) {
        this.movePoint = new Point(50, 50);
        this.scalePoint = new Point(1, 1);
        this.isDragging = false;
        this.zoomSpeed = 1.1;
        this.selectedPoint = null;
        this.isMarking = false;
        this.displayGrid = true;
        this.data = data;
    }
    Plotter.prototype.generatePlot = function () {
        var _this = this;
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.canvas = document.createElement("canvas");
        this.canvas.className = "plotCanvas";
        this.markingCanvas = this.canvas.cloneNode();
        this.wrapper.appendChild(this.canvas);
        this.wrapper.appendChild(this.markingCanvas);
        this.context = new ContextFixer(this.canvas);
        this.markingContext = new ContextFixer(this.markingCanvas);
        this.wrapper.addEventListener("mousedown", function (e) {
            e.preventDefault();
            _this.mouseMod = new Point(_this.movePoint.x - e.layerX, _this.movePoint.y - (_this.canvas.height - e.layerY));
            _this.mouseDown = true;
            if (e.altKey) {
                _this.isMarking = true;
                var mousePoint = _this.getMousePoint(e);
                _this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
            }
        });
        this.wrapper.addEventListener("mousemove", function (e) {
            if (_this.mouseDown && (e.movementX != 0 || e.movementY != 0)) {
                if (_this.isMarking) {
                    _this.marking.secondPoint = _this.getMousePoint(e);
                    _this.drawMarking();
                }
                else {
                    _this.isDragging = true;
                    _this.movePoint = new Point(e.layerX + _this.mouseMod.x, (_this.canvas.height - e.layerY) + _this.mouseMod.y);
                    _this.draw();
                }
            }
        });
        this.wrapper.addEventListener("mouseup", function (e) {
            _this.wrapper.focus();
            _this.mouseDown = false;
            if (_this.isDragging)
                _this.isDragging = false;
            else if (_this.isMarking) {
                _this.isMarking = false;
                _this.zoomByMarking();
            }
            else
                _this.selectPoint(e);
        });
        this.wrapper.addEventListener("mouseleave", function () { _this.mouseDown = false; });
        this.wrapper.addEventListener("wheel", function (e) { return _this.zoom(e); });
        this.wrapper.addEventListener("keydown", function (e) {
            console.log("key pressed");
            if (e.key === "g") {
                _this.displayGrid = _this.displayGrid === true ? false : true;
                _this.draw();
            }
            else if (e.key === "r") {
                _this.scalePoint = new Point(1, 1);
                _this.movePoint = new Point(50, 50);
                _this.draw();
            }
        });
        this.draw();
        return this.wrapper;
    };
    Plotter.prototype.drawMarking = function () {
        this.markingContext.clear();
        this.markingContext.fillStyle = "rgba(0,184,220,0.2)";
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.markingContext.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
    };
    Plotter.prototype.resize = function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.markingCanvas.width = width;
        this.markingCanvas.height = height;
        this.draw();
    };
    Plotter.prototype.selectPoint = function (e) {
        var mp = this.getMousePoint(e);
        var p = null;
        for (var i = 0; i < this.data.length; i++) {
            var closest = this.data[i].getClosest(this.getRelative(mp));
            if (Math.abs(this.getAbsolute(closest).y - mp.y) < 10)
                p = closest;
        }
        if (p !== null)
            this.selectedPoint = p;
        else
            this.selectedPoint = null;
        this.draw();
    };
    Plotter.prototype.zoom = function (e) {
        e.preventDefault();
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
        this.context.clear();
        this.context.beginPath();
        for (var d = 0; d < this.data.length; d++) {
            var firstVisibleIdx = this.data[d].getIndexOf(this.getRelative(new Point(0, 0)));
            if (firstVisibleIdx > 0)
                firstVisibleIdx--;
            var lastPoint = lastPoint = this.getAbsolute(this.data[d].points[firstVisibleIdx]);
            var totalLength = this.data[d].points.length;
            var points = this.data[d].points;
            var drawPoint = 0;
            var checkPoint = lastPoint;
            for (var i = firstVisibleIdx; i < totalLength; i++) {
                var point = this.getAbsolute(points[i]);
                if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                    this.context.moveTo(Math.floor(point.x), Math.floor(point.y));
                    this.context.lineTo(Math.floor(checkPoint.x), Math.floor(checkPoint.y));
                    drawPoint++;
                    checkPoint = point;
                }
                if (point.x > this.canvas.width) {
                    break;
                }
                lastPoint = point;
            }
            this.context.stroke();
        }
        this.drawXAxis();
        this.drawYAxis();
        if (this.selectedPoint !== null) {
            var abs = this.getAbsolute(this.selectedPoint);
            var pointString = this.selectedPoint.toString();
            this.context.beginPath();
            this.context.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            this.context.stroke();
            this.context.fillText(this.selectedPoint.toString(), this.canvas.width - this.context.measureText(pointString) - 6, 13);
        }
    };
    Plotter.prototype.drawXAxis = function () {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.y >= 0 && origo.y <= this.canvas.height ? true : false;
        var y = origo.y;
        if (!visible) {
            if (origo.y < 0)
                y = 0;
            else
                y = this.canvas.height;
        }
        this.context.beginPath();
        this.context.moveTo(0, y);
        this.context.lineTo(this.canvas.width, y);
        this.context.stroke();
        var stepping = this.calculateSteps(this.scalePoint.x);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.canvas.width + steps; i += steps) {
            this.context.beginPath();
            var absX = i + this.movePoint.x % steps;
            var transformer = this.getRelative(new Point(absX, y));
            var number;
            var numWidth;
            var numOffset;
            if (Math.abs(transformer.x).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "     0";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.x.toExponential(2);
            }
            else {
                number = transformer.x.toFixed(decimalPlaces);
            }
            numWidth = this.context.measureText(number);
            numOffset = y === this.canvas.height ? y - 15 : y + 15;
            this.context.fillText(number, absX - (numWidth / 2), numOffset);
            this.context.stroke();
            this.context.beginPath();
            if (this.displayGrid) {
                this.context.moveTo(absX, 0);
                this.context.lineTo(absX, this.canvas.height);
                this.context.strokeStyle = "rgba(100,100,100,0.3)";
                this.context.stroke();
                this.context.strokeStyle = "black";
            } /*
            else {
                this.context.moveTo(absX, y);
                this.context.lineTo(absX, y + 4);
                this.context.stroke();
            }*/
        }
    };
    Plotter.prototype.drawYAxis = function () {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.x >= 0 && origo.x <= this.canvas.width ? true : false;
        var x = origo.x;
        if (!visible) {
            if (origo.x < 0)
                x = 0;
            else
                x = this.canvas.width;
        }
        this.context.beginPath();
        this.context.moveTo(x, 0);
        this.context.lineTo(x, this.canvas.height);
        this.context.stroke();
        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.canvas.height + steps; i += steps) {
            this.context.beginPath();
            var absY = this.canvas.height - (i + this.movePoint.y % steps);
            var transformer = this.getRelative(new Point(x, absY));
            var number;
            var numWidth;
            var numOffset;
            if (Math.abs(transformer.y).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }
            numWidth = this.context.measureText(number);
            numOffset = x === 0 ? x + 8 : x - (numWidth + 7);
            this.context.fillText(number, numOffset, absY + 3);
            this.context.stroke();
            this.context.beginPath();
            if (this.displayGrid) {
                this.context.moveTo(0, absY);
                this.context.lineTo(this.canvas.width, absY);
                this.context.strokeStyle = "rgba(100,100,100,0.3)";
                this.context.stroke();
                this.context.strokeStyle = "black";
            } /*
            else {
                this.context.moveTo(origo.x, absY);
                this.context.lineTo(origo.x - 4, absY);
                this.context.stroke();
            }*/
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
    Plotter.prototype.zoomByMarking = function () {
        this.markingContext.clear();
        var width = this.marking.width;
        var height = this.marking.height;
        var xRatio = this.canvas.width / width;
        var yRatio = this.canvas.height / height;
        var downLeft = new Point(Math.min(this.marking.firstPoint.x, this.marking.secondPoint.x), Math.max(this.marking.firstPoint.y, this.marking.secondPoint.y));
        var first = this.getRelative(downLeft);
        this.scalePoint.x = Math.abs(this.scalePoint.x * xRatio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * yRatio);
        var sec = this.getAbsolute(first);
        sec.y = this.canvas.height - sec.y;
        this.movePoint = this.movePoint.sub(sec);
        this.draw();
    };
    return Plotter;
}());
var ContextFixer = (function () {
    function ContextFixer(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.fillStyle = "black";
        this.strokeStyle = "black";
    }
    ContextFixer.prototype.moveTo = function (x, y) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    };
    ContextFixer.prototype.lineTo = function (x, y) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    };
    ContextFixer.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    ContextFixer.prototype.beginPath = function () {
        this.ctx.beginPath();
    };
    ContextFixer.prototype.stroke = function () {
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke();
    };
    ContextFixer.prototype.fillText = function (text, x, y) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillText(text, x, y);
    };
    ContextFixer.prototype.fillRect = function (x, y, width, height) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillRect(x, y, width, height);
    };
    ContextFixer.prototype.arc = function (x, y, radius, startAngle, endAngle) {
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    };
    ContextFixer.prototype.measureText = function (text) {
        return this.ctx.measureText(text).width;
    };
    return ContextFixer;
}());
//# sourceMappingURL=Plotter.js.map