var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BarController = (function (_super) {
    __extends(BarController, _super);
    function BarController(width, height, horisontal) {
        var _this = _super.call(this) || this;
        _this.horizontal = false;
        _this.wrapper = _this.mk.tag("div", "bar-controller-wrapper");
        _this.barWrapper1 = _this.mk.tag("div", "bar-controller-barWrapper1");
        _this.barWrapper2 = _this.mk.tag("div", "bar-controller-barWrapper2");
        _this.wrapper.appendChild(_this.barWrapper1);
        _this.wrapper.appendChild(_this.barWrapper2);
        _this.bar1 = _this.mk.tag("div", "bar-controller-bar1");
        _this.bar2 = _this.mk.tag("div", "bar-controller-bar2");
        _this.barWrapper1.appendChild(_this.bar1);
        _this.barWrapper2.appendChild(_this.bar2);
        _this.setSize(width, height);
        return _this;
    }
    BarController.prototype.generate = function () {
        return this.wrapper;
    };
    BarController.prototype.setValue = function (percent) {
        percent = percent < -1 ? -1 : percent;
        percent = percent > 1 ? 1 : percent;
        this.value = percent;
        if (this.value < 0) {
            this.doubleBar();
        }
        else {
            this.singleBar();
        }
    };
    BarController.prototype.doubleBar = function () {
    };
    BarController.prototype.singleBar = function () {
    };
    BarController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    };
    return BarController;
}(SingleValueController));
//# sourceMappingURL=BarController.js.map