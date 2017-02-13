class LabelController extends SingleValueController {
    private textWrapper: HTMLElement;    
    private fontSize: number = 10;

    constructor(width: number, height: number) {
        super();
        this.wrapper = this.mk.tag("div", "label-controller");
        this.textWrapper = this.mk.tag("span");
        this.wrapper.appendChild(this.textWrapper);
        this.textWrapper.style.fontSize = this.fontSize + "px";
        this.setSize(width, height);
    }

    generate(): HTMLElement {
        return this.wrapper;
    }

    setValue(value: number) {
        this.textWrapper.innerHTML = value.toString();
        this.adjustFontSize();
    }

    protected onSizeChange(): void {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height * 0.87 + "px";

        this.adjustFontSize();
    }

    protected onDataChange(): void {
        let val = this.value * 100;
        this.textWrapper.innerHTML = val.toFixed(2);
        this.adjustFontSize();
    }

    private adjustFontSize() {
        if (this.textWrapper.offsetWidth > 0) {
            let height: number = this.height;
            let width: number = this.width;
            let textwidth: number = this.textWrapper.offsetWidth;
            let ratio = width / textwidth;
            this.fontSize *= ratio;

            this.fontSize = this.fontSize > height ? height : this.fontSize;
            this.textWrapper.style.fontSize = this.fontSize + "px";            
        }
    }
    
}