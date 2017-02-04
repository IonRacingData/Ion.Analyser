var Segment = (function () {
    function Segment() {
    }
    // temp
    Segment.prototype.update = function () {
    };
    Segment.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);
        return this.wrapper;
    };
    Segment.prototype.setSize = function (width, height) {
        this.canvas.setSize(width, height);
        this.width = width;
        this.height = height;
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.draw();
    };
    Segment.prototype.draw = function () {
    };
    Segment.prototype.findMinMax = function () {
    };
    Segment.prototype.rescale = function () {
    };
    return Segment;
}());
//# sourceMappingURL=Segment.js.map