var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BarController = (function (_super) {
    __extends(BarController, _super);
    function BarController(width, height, direction) {
        var _this = _super.call(this) || this;
        _this.horizontal = false;
        _this.double = false;
        _this.direction = direction;
        _this.width = width;
        _this.height = height;
        return _this;
    }
    BarController.prototype.generate = function () {
        var _this = this;
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");
        this.wrapper.setAttribute("tabindex", "0");
        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.wrapper.appendChild(this.barWrapper1);
        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.barWrapper1.appendChild(this.bar1);
        this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
        this.wrapper.appendChild(this.barWrapper2);
        this.bar2 = this.mk.tag("div", "bar-controller-bar2");
        this.barWrapper2.appendChild(this.bar2);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.setDirection(this.direction);
        // listeners for testing direction switch
        this.wrapper.addEventListener("mousedown", function (e) {
            _this.wrapper.focus();
        });
        this.wrapper.addEventListener("keydown", function (e) {
            if (e.key === "t") {
                var dir = _this.direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
                _this.direction = dir;
                _this.setDirection(dir);
            }
        });
        return this.wrapper;
    };
    BarController.prototype.setDirection = function (dir) {
        if (dir === Direction.Horizontal) {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar1.style.height = "100%";
            this.bar2.style.height = "100%";
            this.wrapper.style.flexDirection = "row";
            this.barWrapper2.style.display = "flex";
        }
        else {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar1.style.width = "100%";
            this.bar2.style.width = "100%";
            this.wrapper.style.flexDirection = "column";
        }
    };
    BarController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    };
    BarController.prototype.onDataChange = function () {
        var min = SensorInfoHelper.minValue(this.lastSensorInfo);
        var val = this.percent * 100;
        if (this.direction === Direction.Horizontal) {
            if (min < 0) {
                val = (val - 50) * 2;
                this.bar2.style.width = val < 0 ? "0%" : val + "%";
                this.bar1.style.width = val < 0 ? Math.abs(val) + "%" : "0%";
                this.barWrapper1.style.justifyContent = "flex-end";
                this.barWrapper2.style.display = "flex";
            }
            else {
                this.bar1.style.width = val < 0 ? "0%" : val + "%";
                this.barWrapper1.style.justifyContent = "initial";
                this.barWrapper2.style.display = "none";
            }
        }
        else {
            if (min < 0) {
                val = (val - 50) * 2;
                this.bar1.style.height = val < 0 ? "0%" : val + "%";
                this.bar2.style.height = val < 0 ? Math.abs(val) + "%" : "0%";
                this.barWrapper2.style.display = "flex";
            }
            else {
                this.bar1.style.height = val < 0 ? "0%" : val + "%";
                this.barWrapper2.style.display = "none";
            }
        }
    };
    return BarController;
}(SingleValueController));
var Direction;
(function (Direction) {
    Direction[Direction["Horizontal"] = 1] = "Horizontal";
    Direction[Direction["Vertical"] = 2] = "Vertical";
})(Direction || (Direction = {}));
//# sourceMappingURL=BarController.js.map