var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Controller = (function () {
    function Controller() {
        this.mk = new HtmlHelper;
    }
    Controller.prototype.setSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.onSizeChange();
    };
    Controller.prototype.onDataChange = function () { };
    ; // to be abstract
    return Controller;
}());
var SingleValueController = (function (_super) {
    __extends(SingleValueController, _super);
    function SingleValueController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.value = 0;
        _this.lastID = -1;
        return _this;
    }
    SingleValueController.prototype.setData = function (d) {
        var _this = this;
        this.data = d;
        if (this.data) {
            var curID = this.data.ID;
            if (curID != this.lastID) {
                kernel.senMan.getSensorInfo(this.data, function (i) {
                    _this.lastSensorInfo = i;
                    _this.lastID = _this.data.ID;
                    _this.onDataChange();
                });
            }
            else {
                if (this.lastSensorInfo) {
                    this.value = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.getLength() - 1)).y;
                }
                this.onDataChange();
            }
        }
    };
    SingleValueController.prototype.setValue = function (value) { };
    return SingleValueController;
}(Controller));
var CanvasController = (function (_super) {
    __extends(CanvasController, _super);
    function CanvasController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CanvasController.prototype.getRelative = function (p) {
        var moved = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        var scaled = moved.divide(this.scalePoint);
        return scaled;
    };
    CanvasController.prototype.getAbsolute = function (p) {
        var scaled = p.multiply(this.scalePoint);
        var moved = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    };
    CanvasController.prototype.getMousePoint = function (e) {
        return new Point(e.layerX, e.layerY);
    };
    return CanvasController;
}(Controller));
var MultiValueCanvasController = (function (_super) {
    __extends(MultiValueCanvasController, _super);
    function MultiValueCanvasController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MultiValueCanvasController.prototype.setData = function (d) {
        this.data = d;
        this.onDataChange();
    };
    return MultiValueCanvasController;
}(CanvasController));
var SingleValueCanvasController = (function (_super) {
    __extends(SingleValueCanvasController, _super);
    function SingleValueCanvasController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SingleValueCanvasController;
}(CanvasController));
//# sourceMappingURL=Controller.js.map