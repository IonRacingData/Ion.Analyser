var PlotData = (function () {
    function PlotData(p) {
        this.points = p;
    }
    PlotData.prototype.getClosest = function (p) {
        return this.points[this.getIndexOf(p)];
    };
    // returns index of closest point to 'p' on x-axis
    PlotData.prototype.getIndexOf = function (p) {
        var min = 0;
        var max = this.points.length - 1;
        var half;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin = p.x - this.points[min].x;
                var diffMax = this.points[max].x - p.x;
                if (diffMin < diffMax)
                    return min;
                else
                    return max;
            }
            else if (p.x < this.points[half].x) {
                max = half;
            }
            else if (p.x > this.points[half].x) {
                min = half;
            }
            else {
                return half;
            }
        }
    };
    return PlotData;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (p) {
        return new Point(this.x + p.x, this.y + p.y);
    };
    Point.prototype.sub = function (p) {
        return new Point(this.x - p.x, this.y - p.y);
    };
    Point.prototype.multiply = function (p) {
        return new Point(this.x * p.x, this.y * p.y);
    };
    Point.prototype.divide = function (p) {
        return new Point(this.x / p.x, this.y / p.y);
    };
    Point.prototype.toString = function () {
        return "x: " + this.x.toString() + "  y: " + this.y.toString();
    };
    return Point;
}());
//# sourceMappingURL=PlotData.js.map