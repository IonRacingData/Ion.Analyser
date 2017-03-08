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
    return Controller;
}());
var SingleValueController = (function (_super) {
    __extends(SingleValueController, _super);
    function SingleValueController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.percent = 0;
        _this.value = 0;
        _this.lastID = "";
        return _this;
    }
    SingleValueController.prototype.setData = function (d) {
        this.data = d;
        if (this.data) {
            var curID = this.data.infos.Keys[0];
            if (curID !== this.lastID) {
                var i = this.data.infos.SensorInfos[0];
                this.lastSensorInfo = i;
                this.lastID = i.Key;
                this.onDataChange();
            }
            else {
                if (this.lastSensorInfo) {
                    this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.length() - 1)).y;
                    this.value = this.data.getValue(this.data.length() - 1).y;
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
    CanvasController.prototype.getTouchPoint = function (e) {
        if (e.touches.length > 0)
            return new Point(e.touches[0].clientX, e.touches[0].clientY);
        else
            return new Point(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };
    return CanvasController;
}(Controller));
var MultiValueCanvasController = (function (_super) {
    __extends(MultiValueCanvasController, _super);
    function MultiValueCanvasController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sensorInfos = {};
        _this.lastDataLength = 0;
        return _this;
    }
    MultiValueCanvasController.prototype.setData = function (d) {
        this.data = d;
        if (this.lastDataLength !== this.data.length) {
            this.lastDataLength = this.data.length;
            this.updateSensorInfos(kernel.senMan.getInfos());
        }
        this.onDataChange();
    };
    MultiValueCanvasController.prototype.updateSensorInfos = function (infos) {
        this.sensorInfos = {};
        for (var _i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
            var i = infos_1[_i];
            for (var _a = 0, _b = this.data; _a < _b.length; _a++) {
                var d = _b[_a];
                if (d.infos.Keys[0] === i.Key) {
                    this.sensorInfos[i.ID.toString()] = i;
                }
            }
        }
        console.log(this.sensorInfos);
        this.onSensorChange();
    };
    MultiValueCanvasController.prototype.onSensorChange = function () { };
    return MultiValueCanvasController;
}(CanvasController));
var SingleValueCanvasController = (function (_super) {
    __extends(SingleValueCanvasController, _super);
    function SingleValueCanvasController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.percent = 0;
        _this.value = 0;
        _this.lastID = "";
        return _this;
    }
    SingleValueCanvasController.prototype.setData = function (d) {
        this.data = d;
        if (this.data) {
            var curID = this.data.infos.Keys[0];
            if (curID !== this.lastID) {
                var i = this.data.infos.SensorInfos[0];
                this.lastSensorInfo = i;
                this.lastID = this.data.infos.Keys[0];
                this.onDataChange();
            }
            else {
                if (this.lastSensorInfo) {
                    this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.length() - 1)).y;
                    this.value = this.data.getValue(this.data.length() - 1).y;
                }
                this.onDataChange();
            }
        }
    };
    return SingleValueCanvasController;
}(CanvasController));
//# sourceMappingURL=Controller.js.map