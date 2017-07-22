class LabelController extends SingleValueController {
    private textWrapper: HTMLElement;
    private contentWrapper: HTMLElement;
    private fontSize: number = 10;
    private contentHeight: number = 0;
    private initFontSizeCounter: number = 0;

    constructor(width: number, height: number) {
        super();
        this.wrapper = this.mk.tag("div", "label-controller");
        this.contentWrapper = this.mk.tag("div", "label-controller-content");
        this.textWrapper = this.mk.tag("span");
        this.textWrapper.style.fontSize = this.fontSize + "px";
        this.textWrapper.innerHTML = "0";

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.legendWrapper);
        this.contentWrapper.appendChild(this.textWrapper);

        this.setSize(width, height);
    }

    protected onSizeChange(): void {
        this.contentHeight = this.height - this.legendHeight;
        this.contentWrapper.style.width = this.width + "px";
        this.contentWrapper.style.height = this.contentHeight * 0.87 + "px";

        this.adjustFontSize();
    }

    protected onDataChange(): void {
        const val = this.value;
        this.textWrapper.innerHTML = val.toFixed(2);
        this.adjustFontSize();
    }

    protected onSensorChange(): void {

    }

    private adjustFontSize() {
        if (this.textWrapper.offsetWidth === 0) {
            if (this.initFontSizeCounter < 10) {
                setTimeout(() => {
                    this.adjustFontSize();
                }, 10);
                this.initFontSizeCounter++;
            }
            else {
                throw new Error("Initialize font size exception");
            }

        }
        else if (this.textWrapper.offsetWidth > 0) {
            const textwidth: number = this.textWrapper.offsetWidth;
            const ratio = this.width / textwidth;
            this.fontSize *= ratio;

            this.fontSize = this.fontSize > this.contentHeight ? this.contentHeight : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";
        }
    }
}
