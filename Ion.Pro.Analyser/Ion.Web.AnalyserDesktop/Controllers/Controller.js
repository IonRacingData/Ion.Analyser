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
                    var lastIndex = this.data.length() - 1;
                    if (lastIndex < 0) {
                        console.log("Empty dataset in SingleValueController");
                    }
                    else {
                        var lastValue = this.data.getValue(lastIndex);
                        this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, lastValue).y;
                        this.value = lastValue.y;
                    }
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
            /*kernel.senMan.getInfos((infos: SensorInformation[]) => {
                this.updateSensorInfos(infos);
            });*/
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
                    var lastIndex = this.data.length() - 1;
                    if (lastIndex < 0) {
                        console.log("Empty dataset in SingleValueCanvasController");
                    }
                    else {
                        var lastValue = this.data.getValue(lastIndex);
                        this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, lastValue).y;
                        this.value = lastValue.y;
                    }
                }
                this.onDataChange();
            }
        }
    };
    return SingleValueCanvasController;
}(CanvasController));
var ScatterChartBase = (function (_super) {
    __extends(ScatterChartBase, _super);
    function ScatterChartBase(width, height) {
        var _this = _super.call(this) || this;
        _this.lastID = "";
        _this.color = "white";
        _this.movePoint = new Point(0, 0);
        _this.scalePoint = new Point(1, 1);
        _this.width = width;
        _this.height = height;
        _this.padding = _this.width * 0.05;
        _this.availablePlotWidth = _this.width - (_this.padding * 2);
        _this.availablePlotHeight = _this.height - (_this.padding * 2);
        return _this;
    }
    ScatterChartBase.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.canvas.setSize(this.width, this.height);
        return this.wrapper;
    };
    ScatterChartBase.prototype.onSizeChange = function () {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.availablePlotWidth = this.width - (this.padding * 2);
        this.availablePlotHeight = this.height - (this.padding * 2);
        this.draw();
    };
    ScatterChartBase.prototype.draw = function () {
        if (this.data.length() > 0) {
            var offsetX = void 0;
            var offsetY = void 0;
            var posDataLength = this.data.length();
            this.ctxMain.clear();
            this.ctxMain.beginPath();
            this.ctxMain.strokeStyle = this.color;
            this.rescale();
            offsetX = (this.width - this.plotWidth) / 2;
            offsetY = (this.height - this.plotHeight) / 2;
            if (posDataLength > 0) {
                var firstPoint = this.getAbsolute(new Point(this.data.getValue(0).x, this.data.getValue(0).y));
                this.ctxMain.lineTo(firstPoint.x + offsetX, firstPoint.y - offsetY);
            }
            for (var i = 0; i < posDataLength; i++) {
                var relPoint = new Point(this.data.getValue(i).x, this.data.getValue(i).y);
                var absPoint = this.getAbsolute(relPoint);
                this.ctxMain.lineTo(absPoint.x + offsetX, absPoint.y - offsetY);
            }
            this.ctxMain.stroke();
        }
    };
    ScatterChartBase.prototype.findMinMax = function () {
        var posDataLength = this.data.length();
        if (posDataLength > 0) {
            var firstPoint = new Point(this.data.getValue(0).x, this.data.getValue(0).y);
            this.relSize = new Rectangle(firstPoint, firstPoint);
        }
        for (var i = 0; i < posDataLength; i++) {
            var relPoint = new Point(this.data.getValue(i).x, this.data.getValue(i).y);
            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
        }
    };
    ScatterChartBase.prototype.rescale = function () {
        this.findMinMax();
        var oldWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        var oldHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        var xRatio = this.availablePlotWidth / oldWidth;
        var yRatio = this.availablePlotHeight / oldHeight;
        var ratio = Math.min(xRatio, yRatio);
        var first = new Point(this.relSize.min.x, this.relSize.min.y);
        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);
        var sec = this.getAbsolute(first);
        sec.y = this.height - sec.y;
        this.movePoint = this.movePoint.sub(sec);
        this.plotWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        this.plotHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
    };
    ScatterChartBase.prototype.onDataChange = function () {
        this.draw();
    };
    ScatterChartBase.prototype.setData = function (d) {
        this.data = d;
        if (this.data) {
            var curID = this.data.infos.Keys[0];
            if (curID != this.lastID) {
                this.lastSensorInfo = this.data.infos.SensorInfos[0];
                this.lastID = curID;
                this.onDataChange();
                /*kernel.senMan.getSensorInfoNew(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.infos.Keys[0];
                    this.onDataChange();
                });*/
            }
            else {
                this.onDataChange();
            }
        }
    };
    return ScatterChartBase;
}(CanvasController));
var Rectangle = (function () {
    function Rectangle(min, max) {
        this.min = min;
        this.max = max;
    }
    Rectangle.prototype.getHeight = function () {
        return this.max.y - this.min.y;
    };
    Rectangle.prototype.getWidth = function () {
        return this.max.x - this.min.x;
    };
    return Rectangle;
}());
