var DataSourceBuilder = (function () {
    function DataSourceBuilder() {
        this.mk = new HtmlHelper();
    }
    DataSourceBuilder.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Data Source Builder");
        var first = this.mk.tag("a", "", null, "first");
        var second = this.mk.tag("a", "", null, "second");
        var third = this.mk.tag("a", "", null, "third");
        var car = new Carousel();
        car.addSlide(first, "first");
        car.addSlide(second, "the second");
        car.addSlide(third, "a third");
        this.window.content.appendChild(car.wrapper);
    };
    return DataSourceBuilder;
}());
var Carousel = (function () {
    function Carousel() {
        var _this = this;
        this.slides = [];
        this.visibleSlide = 0;
        this.mk = new HtmlHelper();
        this.wrapper = this.mk.tag("div", "carousel");
        this.navWrapper = this.mk.tag("div", "carousel_navWrapper");
        this.description = this.mk.tag("div");
        this.btn_back = this.mk.tag("img");
        this.btn_back.setAttribute("src", "arrow.png");
        this.btn_back.style.transform = "rotate(180deg)";
        this.navWrapper.appendChild(this.btn_back);
        this.navWrapper.appendChild(this.description);
        this.btn_next = this.mk.tag("img");
        this.btn_next.setAttribute("src", "arrow.png");
        this.navWrapper.appendChild(this.btn_next);
        this.btn_next.style.cssFloat = "right";
        this.navWrapper.style.msUserSelect = "none";
        this.contentWrapper = this.mk.tag("div", "carousel_contentWrapper");
        this.btn_back.addEventListener("click", function () {
            if (_this.visibleSlide > 0) {
                _this.contentWrapper.innerHTML = "";
                _this.contentWrapper.appendChild(_this.slides[--_this.visibleSlide].slide);
                _this.description.innerHTML = _this.slides[_this.visibleSlide].description;
            }
        });
        this.btn_next.addEventListener("click", function () {
            if (_this.visibleSlide < _this.slides.length - 1) {
                _this.contentWrapper.innerHTML = "";
                _this.contentWrapper.appendChild(_this.slides[++_this.visibleSlide].slide);
                _this.description.innerHTML = _this.slides[_this.visibleSlide].description;
            }
        });
        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);
    }
    Carousel.prototype.addSlide = function (content, description) {
        var des = description ? description : "";
        var slide = { slide: content, description: des };
        if (this.slides.length === 0) {
            this.contentWrapper.appendChild(content);
            this.description.innerHTML = des;
        }
        this.slides.push(slide);
    };
    return Carousel;
}());
//# sourceMappingURL=DataSourceBuilder.js.map