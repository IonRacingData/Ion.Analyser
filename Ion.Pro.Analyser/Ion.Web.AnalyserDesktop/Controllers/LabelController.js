var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LabelController = (function (_super) {
    __extends(LabelController, _super);
    function LabelController(width, height) {
        var _this = _super.call(this) || this;
        _this.fontSize = 10;
        _this.wrapper = _this.mk.tag("div", "label-controller");
        _this.textWrapper = _this.mk.tag("span");
        _this.wrapper.appendChild(_this.textWrapper);
        _this.textWrapper.style.fontSize = _this.fontSize + "px";
        _this.setSize(width, height);
        return _this;
    }
    LabelController.prototype.generate = function () {
        return this.wrapper;
    };
    LabelController.prototype.setValue = function (value) {
        this.textWrapper.innerHTML = value.toString();
        this.adjustFontSize();
    };
    LabelController.prototype.setSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height * 0.87 + "px";
        this.adjustFontSize();
    };
    LabelController.prototype.adjustFontSize = function () {
        if (this.textWrapper.offsetWidth > 0) {
            var height = this.height;
            var width = this.width;
            var textwidth = this.textWrapper.offsetWidth;
            var ratio = width / textwidth;
            this.fontSize *= ratio;
            this.fontSize = this.fontSize > height ? height : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";
        }
    };
    return LabelController;
}(SingleValueController));
//# sourceMappingURL=LabelController.js.map