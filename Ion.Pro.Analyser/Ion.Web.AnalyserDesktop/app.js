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
window.onbeforeunload = function (e) {
    /*e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';*/
};
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
        _this.data = data[0];
        _this.infos.Keys[0] = data[0].ID;
        _this.infos.SensorInfos[0] = data[0].info;
        _this.color = data[0].color;
        return _this;
    }
    PointSensorGroup.prototype.getValue = function (index) {
        if (index < this.length() && index >= 0) {
            return this.data.points[index].getPoint();
        }
        return null;
    };
    PointSensorGroup.prototype.length = function () {
        return this.data.points.length;
    };
    return PointSensorGroup;
}(SensorGroup));
PointSensorGroup.numGroups = 1;
var DataSourceInfo = (function () {
    function DataSourceInfo() {
    }
    return DataSourceInfo;
}());
var DataSourceTemplate = (function () {
    function DataSourceTemplate() {
        this.sources = [];
        this.layers = [];
    }
    return DataSourceTemplate;
}());
//# sourceMappingURL=app.js.map