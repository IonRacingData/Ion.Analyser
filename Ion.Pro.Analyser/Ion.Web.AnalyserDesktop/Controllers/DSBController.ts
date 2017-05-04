class DSBController {

    private plot: IViewerBase<any>;
    private template: DataSourceTemplate;

    private mk: HtmlHelper = new HtmlHelper();
    public wrapper: HTMLElement;
    private subDivs: HTMLElement[] = [];

    constructor(plot: IViewerBase<any>) {
        this.plot = plot;
        this.wrapper = this.mk.tag("div", "dsb-wrapper");
        for (let i = 0; i < 3; i++) {
            let div: HTMLElement = this.mk.tag("div", "dsb-subdiv")
            this.subDivs.push(div);
            this.wrapper.appendChild(div);
        }

    }

    private drawSensors(): void {
        
    }



}