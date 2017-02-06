var LabelController = (function () {
    function LabelController(width, height) {
        this.mk = new HtmlHelper();
        this.fontSize = 10;
        this.wrapper = this.mk.tag("div", "label-controller");
        this.textWrapper = this.mk.tag("span");
        this.wrapper.appendChild(this.textWrapper);
        this.textWrapper.style.fontSize = this.fontSize + "px";
        this.setSize(width, height);
        this.textWrapper.addEventListener("mouseover", function (e) {
            e.preventDefault();
        });
    }
    LabelController.prototype.generate = function () {
        return this.wrapper;
    };
    LabelController.prototype.setValue = function (value) {
        this.textWrapper.innerHTML = value.toString();
        this.adjustFontSize();
    };
    LabelController.prototype.setSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height * 0.87 + "px";
        this.adjustFontSize();
    };
    LabelController.prototype.adjustFontSize = function () {
        if (this.textWrapper.offsetWidth > 0) {
            var height = this.height;
            var width = this.width;
            var textwidth = this.textWrapper.offsetWidth;
            var ratio = width / textwidth;
            this.fontSize *= ratio;
            this.fontSize = this.fontSize > height ? height : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";
        }
    };
    return LabelController;
}());
//# sourceMappingURL=LabelController.js.map