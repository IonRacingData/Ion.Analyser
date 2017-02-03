var LabelController = (function () {
    function LabelController(width, height) {
        this.mk = new HtmlHelper();
        this.wrapper = this.mk.tag("div", "label-controller");
        this.textWrapper = this.mk.tag("span");
        this.wrapper.appendChild(this.textWrapper);
        this.setSize(width, height);
    }
    LabelController.prototype.generate = function () {
        return this.wrapper;
    };
    LabelController.prototype.setValue = function (value) {
        this.wrapper.innerHTML = value.toString();
    };
    LabelController.prototype.setSize = function (width, height) {
        this.wrapper.style.width = width.toString() + "px";
        this.wrapper.style.height = height.toString() + "px";
        console.log(this.textWrapper.style.width);
    };
    return LabelController;
}());
//# sourceMappingURL=LabelController.js.map