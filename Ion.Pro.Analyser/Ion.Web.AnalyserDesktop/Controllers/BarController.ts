class BarController extends SingleValueController {    
    private bar1: HTMLElement;
    private bar2: HTMLElement;
    private barWrapper1: HTMLElement;
    private barWrapper2: HTMLElement;
    private horizontal: boolean = false;
    private double: boolean = false;

    constructor(width: number, height: number, double?: boolean, horizontal?: boolean) {
        super();
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");

        if (horizontal) {
            this.horizontal = horizontal;
        }
        if (double) {
            this.double = double;
        }
        
        this.setSize(width, height);
    }

    generate(): HTMLElement {

        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.wrapper.appendChild(this.barWrapper1);
        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.barWrapper1.appendChild(this.bar1);

        if (this.double) {
            this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
            this.wrapper.appendChild(this.barWrapper2);
            this.bar2 = this.mk.tag("div", "bar-controller-bar2");
            this.barWrapper2.appendChild(this.bar2);
        }

        if (this.horizontal) {
            this.wrapper.style.flexDirection = "row";
            this.bar1.style.height = "100%";
            if (this.double) {
                this.bar2.style.height = "100%";
                this.barWrapper1.style.justifyContent = "flex-end";
            }
        }
        else {
            this.wrapper.style.flexDirection = "column";
            this.bar1.style.width = 100 + "%";
            if (this.double) {
                this.bar2.style.width = 100 + "%";
            }
        }

        return this.wrapper;
    }    

    protected onSizeChange(): void {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    }

    protected onDataChange(): void {
        
        let val = this.value * 100;

        if (this.horizontal) {
            if (this.double) {
                this.bar2.style.width = val < 0 ? 0 + "%" : val + "%";
                this.bar1.style.width = val < 0 ? Math.abs(val) + "%" : 0 + "%";
            }
            else {
                this.bar1.style.width = val < 0 ? 0 + "%" : val + "%";
            }
        }
        else {
            if (this.double) {
                this.bar1.style.height = val < 0 ? 0 + "%" : val + "%";
                this.bar2.style.height = val < 0 ? Math.abs(val) + "%" : 0 + "%";
            }
            else {
                this.bar1.style.height = val < 0 ? "0%" : val + "%";
            }
        }
    }
}
