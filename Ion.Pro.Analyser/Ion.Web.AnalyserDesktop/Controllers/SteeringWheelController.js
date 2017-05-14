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
var SteeringWheelController = (function (_super) {
    __extends(SteeringWheelController, _super);
    function SteeringWheelController(width, height) {
        var _this = _super.call(this) || this;
        _this.totalAngle = Math.PI * 2;
        _this.startAngle = -Math.PI;
        _this.width = width;
        _this.height = height;
        return _this;
    }
    SteeringWheelController.prototype.generate = function () {
        this.wrapper = this.mk.tag("div", "steeringWheel-wrapper");
        this.steeringWheel = this.mk.tag("img");
        this.steeringWheel.src = "steeringWheel.png";
        this.setSWSize();
        this.steeringWheel.style.height = "100%";
        this.wrapper.appendChild(this.steeringWheel);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        return this.wrapper;
    };
    SteeringWheelController.prototype.setSWSize = function () {
        var size = Math.min(this.width, this.height);
        this.steeringWheel.style.height = size + "px";
    };
    SteeringWheelController.prototype.onDataChange = function () {
        var p = this.percent;
        var angle = (p * this.totalAngle);
        angle += this.startAngle;
        this.steeringWheel.style.transform = "rotate(" + angle + "rad)";
    };
    SteeringWheelController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.setSWSize();
    };
    // temp
    SteeringWheelController.prototype.setPer = function (per) {
        this.percent = per < 0 ? 0 : per;
        this.percent = per > 1 ? 1 : per;
        this.onDataChange();
    };
    return SteeringWheelController;
}(SingleValueController));
//# sourceMappingURL=SteeringWheelController.js.map