var Color = (function () {
    function Color(r, g, b, a) {
        this.a = null;
        this.r = r;
        this.g = g;
        this.b = b;
        if (a) {
            this.a = a;
        }
    }
    Color.prototype.toString = function () {
        if (this.a) {
            return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() + ")";
        }
        else {
            return "rgb(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ")";
        }
    };
    Color.randomColor = function (lowLimit, highLimit) {
        var r = 0;
        var g = 0;
        var b = 0;
        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        } while (r + g + b > lowLimit && r + g + b < highLimit);
        return new Color(r, g, b);
    };
    return Color;
}());
var PlotData = (function () {
    function PlotData(p) {
        this.points = p;
        this.color = Color.randomColor(0, 255 + 128);
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
var PlotDataHelper = (function () {
    function PlotDataHelper() {
    }
    PlotDataHelper.getClosest = function (plotData, p) {
        return plotData.getValue(PlotDataHelper.getIndexOf(plotData, p));
    };
    PlotDataHelper.getIndexOf = function (plotData, p) {
        var min = 0;
        var max = plotData.getLength() - 1;
        var half;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin = p.x - plotData.getValue(min).x;
                var diffMax = plotData.getValue(max).x - p.x;
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }
            }
            else if (p.x < plotData.getValue(half).x) {
                max = half;
            }
            else if (p.x > plotData.getValue(half).x) {
                min = half;
            }
            else {
                return half;
            }
        }
    };
    return PlotDataHelper;
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
var PlotDataViewer = (function () {
    function PlotDataViewer(realData) {
        this.realData = realData;
        this.ID = realData.ID;
        this.color = realData.color;
    }
    PlotDataViewer.prototype.getLength = function () {
        return this.realData.points.length;
    };
    PlotDataViewer.prototype.getValue = function (index) {
        return this.realData.points[index];
    };
    return PlotDataViewer;
}());
//# sourceMappingURL=PlotData.js.map