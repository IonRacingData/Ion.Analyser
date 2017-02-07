class BarController extends SingleValueController {    
    private bar: HTMLElement;    

    constructor(width: number, height: number) {
        super();
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");
        this.bar = this.mk.tag("div", "bar-controller");
        this.wrapper.appendChild(this.bar);
        this.setSize(width, height);
    }

    generate(): HTMLElement {
        return this.wrapper;
    }

    setValue(percent: number): void {
        percent = percent < 0 ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        this.value = percent;
        this.bar.style.height = this.value + "%";
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height + "px";
    }
}