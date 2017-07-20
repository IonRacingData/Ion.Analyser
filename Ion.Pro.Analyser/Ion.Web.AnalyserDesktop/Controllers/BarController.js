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
        //private direction: Direction;
        _this.double = false;
        _this.silhouette = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 152 316.2"><g id="XMLID_3_">	<rect id="XMLID_1_" x="0" class="silhouette" width="152" height="206"></rect>	<rect id="XMLID_2_" x="0" y="219.4" class="silhouette" width="152" height="96.9"></rect></g></svg>';
        _this.direction = {
            longText: "Switches the bar chart's direction between horizontal and vertical",
            text: "Toggle direction",
            shortCut: "D",
            type: "direction",
            value: Direction.Vertical
        };
        _this.settings = {
            toggleDirection: _this.direction
        };
        _this.direction.value = direction;
        _this.width = width;
        _this.height = height;
        _this.wrapper = _this.mk.tag("div", "bar-controller-wrapper");
        _this.wrapper.setAttribute("tabindex", "0");
        _this.contentWrapper = _this.mk.tag("div", "bar-controller-content");
        _this.barContainer = _this.mk.tag("div", "bar-controller-barContainer");
        _this.silhouetteContainer = _this.mk.tag("div", "bar-controller-silhouette");
        _this.silhouetteContainer.innerHTML = _this.silhouette;
        _this.barWrapper1 = _this.mk.tag("div", "bar-controller-barWrapper1");
        _this.barContainer.appendChild(_this.barWrapper1);
        _this.bar1 = _this.mk.tag("div", "bar-controller-bar1");
        _this.barWrapper1.appendChild(_this.bar1);
        _this.barWrapper2 = _this.mk.tag("div", "bar-controller-barWrapper2");
        _this.barContainer.appendChild(_this.barWrapper2);
        _this.bar2 = _this.mk.tag("div", "bar-controller-bar2");
        _this.barWrapper2.appendChild(_this.bar2);
        _this.contentWrapper.style.width = _this.width + "px";
        _this.contentWrapper.style.height = _this.height - _this.legendHeight + "px";
        _this.setDirection(_this.direction.value);
        // listeners for testing direction switch
        _this.wrapper.addEventListener("mousedown", function (e) {
            _this.wrapper.focus();
        });
        _this.wrapper.addEventListener("keydown", function (e) {
            if (e.key === "d") {
                var dir = _this.direction.value === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
                _this.direction.value = dir;
                _this.setDirection(dir);
            }
        });
        _this.barContainer.style.display = "none";
        _this.barContainer.style.flexGrow = "1";
        _this.contentWrapper.appendChild(_this.silhouetteContainer);
        _this.contentWrapper.appendChild(_this.barContainer);
        _this.wrapper.appendChild(_this.contentWrapper);
        _this.wrapper.appendChild(_this.legendWrapper);
        return _this;
    }
    BarController.prototype.settingsChanged = function (key, value) {
        this.setDirection(this.direction.value);
    };
    BarController.prototype.setDirection = function (dir) {
        if (dir === Direction.Horizontal) {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar2.style.borderTop = "";
            this.bar2.style.borderLeft = "1px solid black";
            this.bar1.style.height = "100%";
            this.bar2.style.height = "100%";
            this.barContainer.style.flexDirection = "row";
            this.barWrapper2.style.display = "flex";
        }
        else {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar2.style.borderLeft = "";
            this.bar2.style.borderTop = "1px solid black";
            this.bar1.style.width = "100%";
            this.bar2.style.width = "100%";
            this.barContainer.style.flexDirection = "column";
        }
        this.onDataChange();
    };
    BarController.prototype.onSizeChange = function () {
        this.contentWrapper.style.width = this.width + "px";
        this.contentWrapper.style.height = this.height - this.legendHeight + "px";
    };
    BarController.prototype.onSensorChange = function () {
    };
    BarController.prototype.test_setValue = function (val) {
        if (val > 1) {
            val = 1;
        }
        else if (val < 0) {
            val = 0;
        }
        this.percent = val;
        this.onDataChange();
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
        if (this.direction.value === Direction.Horizontal) {
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
