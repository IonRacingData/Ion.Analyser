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
var SensorDataContainer = (function () {
    function SensorDataContainer(id, p) {
        if (p === void 0) { p = []; }
        this.ID = id;
        this.points = p;
        this.color = Color.randomColor(0, 255 + 128);
    }
    SensorDataContainer.prototype.insertSensorPackage = function (p) {
        this.insertData(p.map(function (value, index, array) { return new SensorValue(value.Value, value.TimeStamp); }));
    };
    SensorDataContainer.prototype.pushArray = function (to, from) {
        for (var i = 0; i < from.length; i++) {
            to.push(from[i]);
        }
    };
    SensorDataContainer.prototype.insertData = function (p) {
        if (p.length > 0) {
            if (this.points.length === 0) {
                this.pushArray(this.points, p);
            }
            else {
                var first = p[0];
                var last = p[p.length - 1];
                if (first.timestamp > this.last().timestamp) {
                    this.pushArray(this.points, p);
                }
                else if (last.timestamp < this.points[0].timestamp) {
                    (_a = this.points).splice.apply(_a, [0, 0].concat(p));
                }
                else {
                    var index = this.getClosesIndexOf(first);
                    if (first.timestamp > this.points[index].timestamp) {
                        index--;
                    }
                    (_b = this.points).splice.apply(_b, [index, 0].concat(p));
                }
            }
        }
        var _a, _b;
    };
    SensorDataContainer.prototype.last = function () {
        return this.points[this.points.length - 1];
    };
    SensorDataContainer.prototype.getClosest = function (p) {
        return this.points[this.getClosesIndexOf(p)];
    };
    // returns index of closest point to 'p' on x-axis
    SensorDataContainer.prototype.getClosesIndexOf = function (p) {
        var min = 0;
        var max = this.points.length - 1;
        var half;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin = p.timestamp - this.points[min].timestamp;
                var diffMax = this.points[max].timestamp - p.timestamp;
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }
            }
            else if (p.timestamp < this.points[half].timestamp) {
                max = half;
            }
            else if (p.timestamp > this.points[half].timestamp) {
                min = half;
            }
            else {
                return half;
            }
        }
    };
    return SensorDataContainer;
}());
var SensorValue = (function () {
    function SensorValue(value, timestamp) {
        this.value = 0;
        this.timestamp = 0;
        this.value = value;
        this.timestamp = timestamp;
    }
    SensorValue.prototype.getPoint = function () {
        return new Point(this.timestamp, this.value);
    };
    return SensorValue;
}());
var PlotDataHelper = (function () {
    function PlotDataHelper() {
    }
    PlotDataHelper.getClosest = function (plotData, p) {
        return plotData.getValue(PlotDataHelper.getIndexOf(plotData, p));
    };
    PlotDataHelper.getIndexOf = function (plotData, p) {
        if (plotData.length() == 0) {
            return -1;
        }
        var min = 0;
        var max = plotData.length() - 1;
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
var Point4D = (function () {
    function Point4D(x, y, z, i) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.i = i;
    }
    Point4D.prototype.add = function (p) {
        return new Point4D(this.x + p.x, this.y + p.y, this.z + p.z, this.i + p.i);
    };
    Point4D.prototype.sub = function (p) {
        return new Point4D(this.x - p.x, this.y - p.y, this.z - p.z, this.i - p.i);
    };
    Point4D.prototype.multiply = function (p) {
        return new Point4D(this.x * p.x, this.y * p.y, this.z * p.z, this.i * p.i);
    };
    Point4D.prototype.divide = function (p) {
        return new Point4D(this.x / p.x, this.y / p.y, this.z / p.z, this.i / p.i);
    };
    return Point4D;
}());
//# sourceMappingURL=PlotData.js.map