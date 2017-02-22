var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.addEventListener("load", function () {
    startUp();
});
var SensorGroup = (function () {
    function SensorGroup(type) {
        this.infos = new SensorPlotInfo();
        this.type = type;
    }
    SensorGroup.prototype.getValue = function (index) {
        return null;
    };
    SensorGroup.prototype.length = function () {
        return 0;
    };
    return SensorGroup;
}());
var PointSensorGroup = (function (_super) {
    __extends(PointSensorGroup, _super);
    function PointSensorGroup(data) {
        var _this = _super.call(this, Point) || this;
        _this.data = data;
        _this.infos.IDs[0] = data.ID;
        _this.color = data.color;
        return _this;
    }
    PointSensorGroup.prototype.getValue = function (index) {
        return this.data.points[index];
    };
    PointSensorGroup.prototype.length = function () {
        return this.data.points.length;
    };
    return PointSensorGroup;
}(SensorGroup));
var DataSourceInfo = (function () {
    function DataSourceInfo() {
    }
    return DataSourceInfo;
}());
//# sourceMappingURL=app.js.map