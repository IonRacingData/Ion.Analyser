class BarController {
    wrapper: HTMLDivElement;
    private bar: HTMLDivElement;
    private width: number;
    private height: number;
    private percent: number;
    private mk: HtmlHelper = new HtmlHelper;

    constructor(width: number, height: number) {
        this.wrapper = <HTMLDivElement>this.mk.tag("div", "bar-controller-wrapper");
        this.bar = <HTMLDivElement>this.mk.tag("div", "bar-controller");
        this.wrapper.appendChild(this.bar);
        this.setSize(width, height);
    }

    generate(): HTMLDivElement {        
        return this.wrapper;
    }

    setValue(percent: number): void {
        percent = percent < 0 ? 0 : percent;
        percent = percent > 100 ? 100 : percent;
        this.percent = percent;
        this.bar.style.height = this.percent + "%";
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height + "px";
    }
}