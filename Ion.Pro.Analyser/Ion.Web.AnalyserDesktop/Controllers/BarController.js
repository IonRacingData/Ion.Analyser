var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BarController = (function (_super) {
    __extends(BarController, _super);
    function BarController(width, height, double, horizontal) {
        var _this = _super.call(this) || this;
        _this.horizontal = false;
        _this.double = false;
        _this.wrapper = _this.mk.tag("div", "bar-controller-wrapper");
        if (horizontal) {
            _this.horizontal = horizontal;
        }
        if (double) {
            _this.double = double;
        }
        _this.setSize(width, height);
        return _this;
    }
    BarController.prototype.generate = function () {
        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.wrapper.appendChild(this.barWrapper1);
        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.barWrapper1.appendChild(this.bar1);
        if (this.double) {
            this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
            this.wrapper.appendChild(this.barWrapper2);
            this.bar2 = this.mk.tag("div", "bar-controller-bar2");
            this.barWrapper2.appendChild(this.bar2);
        }
        if (this.horizontal) {
            this.wrapper.style.flexDirection = "row";
            this.bar1.style.height = 100 + "%";
            if (this.double) {
                this.bar2.style.height = 100 + "%";
                this.barWrapper1.style.justifyContent = "flex-end";
            }
        }
        else {
            this.wrapper.style.flexDirection = "column";
            this.bar1.style.width = 100 + "%";
            if (this.double) {
                this.bar2.style.width = 100 + "%";
            }
        }
        return this.wrapper;
    };
    // temp
    BarController.prototype.setValue = function (percent) {
        percent = percent < -1 ? -1 : percent;
        percent = percent > 1 ? 1 : percent;
        this.value = percent;
        this.onDataChange();
    };
    BarController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    };
    BarController.prototype.onDataChange = function () {
        if (this.horizontal) {
            if (this.double) {
                var val = this.value * 100;
                this.bar2.style.width = val < 0 ? 0 + "%" : val + "%";
                this.bar1.style.width = val < 0 ? Math.abs(val) + "%" : 0 + "%";
            }
            else {
                this.bar1.style.width = this.value * 100 + "%";
            }
        }
        else {
            if (this.double) {
                var val = this.value * 100;
                this.bar1.style.height = val < 0 ? 0 + "%" : val + "%";
                this.bar2.style.height = val < 0 ? Math.abs(val) + "%" : 0 + "%";
            }
            else {
                this.bar1.style.height = this.value * 100 + "%";
            }
        }
    };
    return BarController;
}(SingleValueController));
//# sourceMappingURL=BarController.js.map