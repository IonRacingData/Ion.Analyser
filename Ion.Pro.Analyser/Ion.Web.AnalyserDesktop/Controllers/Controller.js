var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Controller = (function () {
    function Controller() {
        this.mk = new HtmlHelper;
    }
    Controller.prototype.setSize = function (width, height) { };
    return Controller;
}());
var SingleValueController = (function (_super) {
    __extends(SingleValueController, _super);
    function SingleValueController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
var SingleValueCanvasController = (function (_super) {
    __extends(SingleValueCanvasController, _super);
    function SingleValueCanvasController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SingleValueCanvasController;
}(CanvasController));
//# sourceMappingURL=Controller.js.map