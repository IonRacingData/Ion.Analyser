class LabelController {
    wrapper: HTMLElement;
    textWrapper: HTMLElement;
    private mk: HtmlHelper = new HtmlHelper();    

    constructor(width: number, height: number) {
        this.wrapper = this.mk.tag("div", "label-controller");
        this.textWrapper = this.mk.tag("span");
        this.wrapper.appendChild(this.textWrapper);
        this.setSize(width, height);
    }

    generate() {
        return this.wrapper;
    }

    setValue(value: number) {
        this.wrapper.innerHTML = value.toString();
    }

    setSize(width: number, height: number) {        
        this.wrapper.style.width = width.toString() + "px";
        this.wrapper.style.height = height.toString() + "px";
        console.log(this.textWrapper.style.width);
        
    }
    
}