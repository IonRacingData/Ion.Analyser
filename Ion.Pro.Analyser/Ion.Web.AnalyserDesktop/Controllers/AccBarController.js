var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AccBarController = (function (_super) {
    __extends(AccBarController, _super);
    function AccBarController(width, height) {
        var _this = _super.call(this) || this;
        _this.wrapper = _this.mk.tag("div", "accBar-controller-wrapper");
        _this.leftBarWrapper = _this.mk.tag("div", "accBar-controller-left-wrapper");
        _this.rightBarWrapper = _this.mk.tag("div", "accBar-controller-right-wrapper");
        _this.leftBar = _this.mk.tag("div", "accBar-controller-left");
        _this.rightBar = _this.mk.tag("div", "accBar-controller-right");
        _this.wrapper.appendChild(_this.leftBarWrapper);
        _this.wrapper.appendChild(_this.rightBarWrapper);
        _this.leftBarWrapper.appendChild(_this.leftBar);
        _this.rightBarWrapper.appendChild(_this.rightBar);
        return _this;
    }
    AccBarController.prototype.generate = function () {
        return this.wrapper;
    };
    AccBarController.prototype.setValue = function (value) {
        value = value < -100 ? -100 : value;
        value = value > 100 ? 100 : value;
        if (value <= 0) {
            this.rightBar.style.width = 0 + "%";
            this.leftBar.style.width = Math.abs(value) + "%";
        }
        else {
            this.leftBar.style.width = 0 + "%";
            this.rightBar.style.width = value + "%";
        }
    };
    AccBarController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.width + "px";
    };
    return AccBarController;
}(SingleValueController));
//# sourceMappingURL=AccBarController.js.map