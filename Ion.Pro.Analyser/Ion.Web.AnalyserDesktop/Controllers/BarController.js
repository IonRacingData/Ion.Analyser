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
var BarController = (function (_super) {
    __extends(BarController, _super);
    function BarController(width, height, direction) {
        var _this = _super.call(this) || this;
        _this.horizontal = false;
        _this.double = false;
        _this.silhouette = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 152 316.2"><g id="XMLID_3_">	<rect id="XMLID_1_" x="0" class="silhouette" width="152" height="206"></rect>	<rect id="XMLID_2_" x="0" y="219.4" class="silhouette" width="152" height="96.9"></rect></g></svg>';
        _this.direction = direction;
        _this.width = width;
        _this.height = height;
        return _this;
    }
    BarController.prototype.generate = function () {
        var _this = this;
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");
        this.wrapper.setAttribute("tabindex", "0");
        this.barContainer = this.mk.tag("div");
        this.silhouetteContainer = this.mk.tag("div", "bar-controller-silhouette");
        this.silhouetteContainer.innerHTML = this.silhouette;
        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.barContainer.appendChild(this.barWrapper1);
        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.barWrapper1.appendChild(this.bar1);
        this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
        this.barContainer.appendChild(this.barWrapper2);
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
        this.barContainer.style.display = "none";
        this.wrapper.appendChild(this.silhouetteContainer);
        this.wrapper.appendChild(this.barContainer);
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
        if (this.data) {
            this.silhouetteContainer.style.display = "none";
            this.barContainer.style.display = "flex";
        }
        else {
            this.barContainer.style.display = "none";
            this.silhouetteContainer.style.display = "flex";
            return;
        }
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
