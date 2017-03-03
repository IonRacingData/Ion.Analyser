var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var sensys = Kernel.SenSys;
window.addEventListener("load", function () {
    startUp();
});
var SensorGroup = (function () {
    function SensorGroup(type) {
        this.infos = new SensorPlotInfo();
        this.type = type;
    }
    SensorGroup.prototype.getValue = function (index, subplot) {
        if (subplot === void 0) { subplot = 0; }
        return null;
    };
    SensorGroup.prototype.length = function (subplot) {
        if (subplot === void 0) { subplot = 0; }
        return 0;
    };
    SensorGroup.prototype.subplots = function () {
        return 1;
    };
    return SensorGroup;
}());
var PointSensorGroup = (function (_super) {
    __extends(PointSensorGroup, _super);
    function PointSensorGroup(data) {
        var _this = _super.call(this, Point) || this;
        _this.data = data;
        _this.infos.IDs[0] = data.ID;
        _this.infos.SensorInfos[0] = data.info;
        _this.color = data.color;
        return _this;
    }
    PointSensorGroup.prototype.getValue = function (index) {
        return this.data.points[index].getPoint();
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