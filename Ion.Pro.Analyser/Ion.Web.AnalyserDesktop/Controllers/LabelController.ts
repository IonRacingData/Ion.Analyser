class LabelController extends SingleValueController{
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

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.wrapper.style.width = width + "px";
        this.wrapper.style.height = height * 0.87 + "px";

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