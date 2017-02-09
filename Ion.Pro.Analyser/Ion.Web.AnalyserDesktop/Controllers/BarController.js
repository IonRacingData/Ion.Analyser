var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BarController = (function (_super) {
    __extends(BarController, _super);
    function BarController(width, height) {
        var _this = _super.call(this) || this;
        _this.wrapper = _this.mk.tag("div", "bar-controller-wrapper");
        _this.bar = _this.mk.tag("div", "bar-controller");
        _this.wrapper.appendChild(_this.bar);
        _this.setSize(width, height);
        return _this;
    }
    BarController.prototype.generate = function () {
        return this.wrapper;
    };
    BarController.prototype.setValue = function (percent) {
        percent = percent < 0 ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        this.value = percent;
        this.bar.style.height = this.value + "%";
    };
    BarController.prototype.setSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height + "px";
    };
    return BarController;
}(SingleValueController));
//# sourceMappingURL=BarController.js.map