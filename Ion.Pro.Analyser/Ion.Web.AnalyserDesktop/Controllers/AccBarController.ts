class AccBarController extends SingleValueController{
    leftBarWrapper: HTMLElement;
    rightBarWrapper: HTMLElement;
    leftBar: HTMLElement;
    rightBar: HTMLElement;


    constructor(width: number, height: number) {
        super();
        this.wrapper = this.mk.tag("div", "accBar-controller-wrapper");
        this.leftBarWrapper = this.mk.tag("div", "accBar-controller-left-wrapper");
        this.rightBarWrapper = this.mk.tag("div", "accBar-controller-right-wrapper");
        this.leftBar = this.mk.tag("div", "accBar-controller-left");
        this.rightBar = this.mk.tag("div", "accBar-controller-right");
        this.wrapper.appendChild(this.leftBarWrapper);
        this.wrapper.appendChild(this.rightBarWrapper);
        this.leftBarWrapper.appendChild(this.leftBar);
        this.rightBarWrapper.appendChild(this.rightBar);
    }

    generate(): HTMLElement {
        return this.wrapper;
    }

    setValue(value: number) {
        value = value < -100 ? -100 : value;
        value = value > 100 ? 100 : value;
        if (value <= 0) {
            this.rightBar.style.width = 0 + "%";
            this.leftBar.style.width = Math.abs(value) + "%";
        }
        else {
            this.leftBar.style.width = 0 + "%";
            this.rightBar.style.width = value + "%";
        }
    }

    setSize(widht: number, height: number) {
        this.wrapper.style.width = widht + "px";
        this.wrapper.style.height = height + "px";
    }
}