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
var LabelController = (function (_super) {
    __extends(LabelController, _super);
    function LabelController(width, height) {
        var _this = _super.call(this) || this;
        _this.fontSize = 10;
        _this.contentHeight = 0;
        _this.initFontSizeCounter = 0;
        _this.wrapper = _this.mk.tag("div", "label-controller");
        _this.contentWrapper = _this.mk.tag("div", "label-controller-content");
        _this.textWrapper = _this.mk.tag("span");
        _this.textWrapper.style.fontSize = _this.fontSize + "px";
        _this.textWrapper.innerHTML = "0";
        _this.wrapper.appendChild(_this.contentWrapper);
        _this.wrapper.appendChild(_this.legendWrapper);
        _this.contentWrapper.appendChild(_this.textWrapper);
        _this.setSize(width, height);
        return _this;
    }
    LabelController.prototype.onSizeChange = function () {
        this.contentHeight = this.height - this.legendHeight;
        this.contentWrapper.style.width = this.width + "px";
        this.contentWrapper.style.height = this.contentHeight * 0.87 + "px";
        this.adjustFontSize();
    };
    LabelController.prototype.onDataChange = function () {
        var val = this.value;
        this.textWrapper.innerHTML = val.toFixed(2);
        this.adjustFontSize();
    };
    LabelController.prototype.onSensorChange = function () {
    };
    LabelController.prototype.adjustFontSize = function () {
        var _this = this;
        if (this.textWrapper.offsetWidth === 0) {
            if (this.initFontSizeCounter < 10) {
                setTimeout(function () {
                    _this.adjustFontSize();
                }, 10);
                this.initFontSizeCounter++;
            }
            else {
                throw new Error("Initialize font size exception");
            }
        }
        else if (this.textWrapper.offsetWidth > 0) {
            var textwidth = this.textWrapper.offsetWidth;
            var ratio = this.width / textwidth;
            this.fontSize *= ratio;
            this.fontSize = this.fontSize > this.contentHeight ? this.contentHeight : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";
        }
    };
    return LabelController;
}(SingleValueController));
