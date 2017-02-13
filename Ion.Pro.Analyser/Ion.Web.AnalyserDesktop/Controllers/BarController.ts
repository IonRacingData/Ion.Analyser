class BarController extends SingleValueController {    
    private bar1: HTMLElement;
    private bar2: HTMLElement;
    private barWrapper1: HTMLElement;
    private barWrapper2: HTMLElement;
    private horizontal: boolean = false;

    constructor(width: number, height: number, horisontal?: boolean) {
        super();
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");

        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
        this.wrapper.appendChild(this.barWrapper1);
        this.wrapper.appendChild(this.barWrapper2);

        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.bar2 = this.mk.tag("div", "bar-controller-bar2");
        this.barWrapper1.appendChild(this.bar1);
        this.barWrapper2.appendChild(this.bar2);
        
        this.setSize(width, height);
    }

    generate(): HTMLElement {
        return this.wrapper;
    }        

    setValue(percent: number): void {
        percent = percent < -1 ? -1 : percent;
        percent = percent > 1 ? 1 : percent;
        this.value = percent;

        if (this.value < 0) {
            this.doubleBar();
        }
        else {
            this.singleBar();
        }
    }

    private doubleBar(): void {
    
    }

    private singleBar(): void {

    }

    protected onSizeChange(): void {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    }
}
