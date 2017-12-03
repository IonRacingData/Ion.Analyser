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
        _this.svgWheel = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 456.566 456.566" style="enable-background:new 0 0 456.566 456.566;" xml:space="preserve"><g><g><g><path style="fill:#010002;" d="M228.291,243.089c-13.607,0-24.686,11.063-24.686,24.662c0,13.599,11.079,24.67,24.686,24.67c13.599,0,24.678-11.071,24.678-24.67C252.969,254.152,241.89,243.089,228.291,243.089z"/></g><g><path style="fill:#010002;" d="M288.207,278.961c28.523-33.148,71.775-50.226,128.407-51.015c-0.374-18.899-3.528-37.115-9.096-54.258c-61.037,40.838-121.091,54.657-174.236,54.657c-93.844,0-166.107-42.805-184.25-54.616c-5.34,16.477-8.372,33.986-8.95,52.096c58.664,0.008,103.209,17.233,132.406,51.161c46.081,53.567,38.521,129.992,36.961,142.242c6.202,0.61,12.477,0.943,18.842,0.943c7.665,0,15.241-0.52,22.687-1.414C249.051,401.092,244.483,329.756,288.207,278.961z M395.35,198.992l3.121,7.259l-59.647,25.646l-3.129-7.243L395.35,198.992z M121.88,231.896L62.232,206.25l3.113-7.259l59.639,25.662L121.88,231.896z M195.72,267.751c0-17.956,14.599-32.563,32.571-32.563c17.956,0,32.571,14.607,32.571,32.563c0,17.964-14.615,32.571-32.571,32.571C210.319,300.322,195.72,285.715,195.72,267.751z"/></g><g><path style="fill:#010002;" d="M228.283,0.004C102.412,0.004,0,102.408,0,228.279c0,125.879,102.412,228.283,228.283,228.283S456.566,354.15,456.566,228.279S354.154,0.004,228.283,0.004z M228.283,428.055c-108.248,0-196.329-88.057-196.329-196.313S120.035,35.412,228.283,35.412c108.24,0,196.313,88.065,196.313,196.321S336.523,428.055,228.283,428.055z"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';
        _this.width = width;
        _this.height = height;
        _this.wrapper = _this.mk.tag("div", "steeringWheel-wrapper");
        _this.wheelWrapper = _this.mk.tag("div", "", null, _this.svgWheel);
        _this.wheelWrapper.style.width = "90%";
        _this.wheelWrapper.style.height = "90%";
        _this.wrapper.appendChild(_this.wheelWrapper);
        _this.wrapper.style.width = _this.width + "px";
        _this.wrapper.style.height = _this.height + "px";
        return _this;
    }
    SteeringWheelController.prototype.onDataChange = function () {
        var p = this.percent;
        var angle = (p * this.totalAngle);
        angle += this.startAngle;
        this.wheelWrapper.style.transform = "rotate(" + angle + "rad)";
    };
    SteeringWheelController.prototype.onSensorChange = function () {
    };
    SteeringWheelController.prototype.onSizeChange = function () {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
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