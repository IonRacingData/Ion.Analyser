var Plotter = (function () {
    function Plotter() {
        this.movePoint = { x: 50, y: 50 };
        this.scalePoint = { x: 1, y: 1 };
        this.zoomSpeed = 1.2;
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
                console.log(_this.getRelative({ x: e.layerX, y: e.layerY }));
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
        var mousePoint = this.getMousePoint(e);
        var curRel = this.getRelative(mousePoint);
        if (e.deltaY < 0) {
            this.scalePoint.x *= this.zoomSpeed;
            this.scalePoint.y *= this.zoomSpeed;
        }
        else {
            this.scalePoint.x /= this.zoomSpeed;
            this.scalePoint.y /= this.zoomSpeed;
        }
        var newRel = this.getRelative(mousePoint);
        var move = { x: (newRel.x - curRel.x) * this.scalePoint.x, y: (newRel.y - curRel.y) * this.scalePoint.y };
        this.movePoint = { x: this.movePoint.x + move.x, y: this.movePoint.y + move.y };
        this.draw();
    };
    Plotter.prototype.getMousePoint = function (e) {
        return { x: e.layerX, y: e.layerY };
    };
    Plotter.prototype.draw = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();
        var lastPoint;
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.createPoint(this.data[i]));
            if (point.x > 0) {
                ctx.moveTo(point.x, point.y);
                if (i > 0) {
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                }
                if (point.x > this.canvas.width) {
                    break;
                }
            }
            lastPoint = point;
        }
        var origo = this.transform({ x: 0, y: 0 });
        // x-axis
        ctx.moveTo(0, origo.y);
        ctx.lineTo(this.canvas.width, origo.y);
        // y-axis
        ctx.moveTo(origo.x, 0);
        ctx.lineTo(origo.x, this.canvas.height);
        //var relWidth = this.canvas.width / this.scalePoint.x;
        //var relHeight = this.canvas.height / this.scalePoint.y;
        for (var i = 0; i < this.canvas.width; i++) {
            var num = this.getRelative({ x: i, y: origo.y }).x;
            num = Math.round(num);
            if (num % 10 == 0) {
                ctx.fillText(num.toString(), i, origo.y + 10);
            }
        }
        var steps = 50;
        /*
        for (var i = -steps; i < this.canvas.width; i += steps) {
            var transformer = this.getRelative({ x: i + this.movePoint.x % steps, y: origo.y });
            ctx.fillText(transformer.x.toFixed(2), i + this.movePoint.x % steps, origo.y + 10);
        }
        */
        for (var i = 0; i < this.canvas.width; i += 100) {
        }
        ctx.stroke();
    };
    Plotter.prototype.createPoint = function (data) {
        return { x: data.TimeStamp, y: data.Value };
    };
    Plotter.prototype.getRelative = function (p) {
        var moved = { x: p.x - this.movePoint.x, y: this.canvas.height - p.y - this.movePoint.y };
        var scaled = { x: moved.x / this.scalePoint.x, y: moved.y / this.scalePoint.y };
        return scaled;
    };
    Plotter.prototype.transform = function (p) {
        var scaled = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var moved = { x: scaled.x + this.movePoint.x, y: scaled.y + this.movePoint.y };
        return { x: moved.x, y: this.canvas.height - moved.y };
    };
    return Plotter;
}());
//# sourceMappingURL=Plotter.js.map