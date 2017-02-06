var BarController = (function () {
    function BarController(width, height) {
        this.mk = new HtmlHelper;
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");
        this.bar = this.mk.tag("div", "bar-controller");
        this.wrapper.appendChild(this.bar);
        this.setSize(width, height);
    }
    BarController.prototype.generate = function () {
        return this.wrapper;
    };
    BarController.prototype.setValue = function (percent) {
        percent = percent < 0 ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        this.percent = percent;
        this.bar.style.height = this.percent + "%";
    };
    BarController.prototype.setSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height + "px";
    };
    return BarController;
}());
//# sourceMappingURL=BarController.js.map