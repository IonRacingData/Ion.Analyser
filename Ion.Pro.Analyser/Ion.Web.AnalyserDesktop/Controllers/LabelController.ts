class LabelController extends SingleValueController {
    private textWrapper: HTMLElement;
    private contentWrapper: HTMLElement;
    private legendWrapper: HTMLElement;
    private fontSize: number = 10;
    private contentHeight: number = 0;
    private legendHeight: number = 18;
    private initFontSizeCounter: number = 0;

    constructor(width: number, height: number) {
        super();
        this.wrapper = this.mk.tag("div", "label-controller");
        this.contentWrapper = this.mk.tag("div", "label-controller-content");
        this.legendWrapper = this.mk.tag("div", "controller-legend");
        this.legendWrapper.style.height = this.legendHeight + "px";
        this.legendWrapper.appendChild(document.createTextNode("No data"));
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
        let val = this.percent * 100;
        this.textWrapper.innerHTML = val.toFixed(2);
        this.adjustFontSize();
    }

    protected onSensorChange(): void {        
        this.legendWrapper.innerHTML = "";
        if (this.data) {
            this.legendWrapper.appendChild(document.createTextNode(this.data.infos.SensorInfos[0].Name));
        }
        else {
            this.legendWrapper.appendChild(document.createTextNode("No data"));
        }
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
            let textwidth: number = this.textWrapper.offsetWidth;
            let ratio = this.width / textwidth;
            this.fontSize *= ratio;

            this.fontSize = this.fontSize > this.contentHeight ? this.contentHeight : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";
        }
    }
}