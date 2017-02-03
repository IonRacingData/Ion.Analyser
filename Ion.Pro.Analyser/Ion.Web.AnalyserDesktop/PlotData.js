var PlotData = (function () {
    function PlotData(p) {
        this.points = p;
        var r = 0;
        var g = 0;
        var b = 0;
        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        } while (r + g + b < 255 + 128);
        this.color = "rgb(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ")";
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
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }
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
var GPSPlotData = (function () {
    function GPSPlotData(p) {
        this.points = p;
    }
    return GPSPlotData;
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
var Point3D = (function () {
    function Point3D(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Point3D.prototype.add = function (p) {
        return new Point3D(this.x + p.x, this.y + p.y, this.z + p.z);
    };
    Point3D.prototype.sub = function (p) {
        return new Point3D(this.x - p.x, this.y - p.y, this.z - p.z);
    };
    Point3D.prototype.multiply = function (p) {
        return new Point3D(this.x * p.x, this.y * p.y, this.z * p.z);
    };
    Point3D.prototype.divide = function (p) {
        return new Point3D(this.x / p.x, this.y / p.y, this.z / p.z);
    };
    Point3D.prototype.toString = function () {
        return "x: " + this.x.toString() + "  y: " + this.y.toString() + "  z: " + this.z.toString();
    };
    return Point3D;
}());
//# sourceMappingURL=PlotData.js.map