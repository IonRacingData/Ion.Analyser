var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.addEventListener("load", function () {
    var a;
    a = new PointSensorGroup();
    console.log(a.type == Point);
    console.log(new a.type(5, 6));
    var testArray = [];
    testArray.push(a);
    function getFrom(type) {
        for (var _i = 0, testArray_1 = testArray; _i < testArray_1.length; _i++) {
            var val = testArray_1[_i];
            if (val.type === type) {
                return val;
            }
        }
        return null;
    }
    var b = getFrom(Point);
    alert(b.type.name);
    var g = new TestClass();
    //startUp();
    function isViewer(test) {
        return test.dataSource !== undefined;
    }
    if (isViewer(g)) {
    }
});
var SensorGroup = (function () {
    function SensorGroup(type) {
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
    function PointSensorGroup() {
        return _super.call(this, Point) || this;
    }
    return PointSensorGroup;
}(SensorGroup));
var TestClass = (function () {
    function TestClass() {
        this.type = Point;
    }
    TestClass.prototype.dataUpdate = function () {
    };
    return TestClass;
}());
//# sourceMappingURL=app.js.map