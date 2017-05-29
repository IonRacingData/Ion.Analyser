class DataSourceAssignmentController extends Component {

    private builder: DataSourceBuildController;
    private page: number = 1;

    private contentWrapper: HTMLElement;
    private navWrapper: HTMLElement;
    private content: HTMLElement;
    private divLeft: HTMLElement;
    private divRight: HTMLElement;
    private btnBack: Button;

    private lastRow: HTMLElement | null = null;

    private mk: HtmlHelper = new HtmlHelper();

    constructor() {
        super();
        let mk = this.mk;
        this.wrapper = mk.tag("div", "dsaController-wrapper");
        this.contentWrapper = mk.tag("div", "dsaController-contentwrapper");
        this.navWrapper = mk.tag("div", "dsaController-navwrapper");

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);

        this.btnBack = new Button();
        this.btnBack.text = "BACK";
        this.btnBack.onclick.addEventListener(() => {
            this.displayPage1();
            this.btnBack.wrapper.style.display = "none";
        });
        this.btnBack.wrapper.style.display = "none";
        this.navWrapper.appendChild(this.btnBack.wrapper);

        this.displayPage1();
    }

    private displayPage1(): void {
        let mk = this.mk;
        this.contentWrapper.innerHTML = "";

        this.content = mk.tag("div", "dsaController-content");
        this.divLeft = mk.tag("div", "dsaController-left");
        this.divRight = mk.tag("div", "dsaController-right");
        
        this.content.appendChild(this.divLeft);
        this.content.appendChild(this.divRight);
        this.contentWrapper.appendChild(this.content);

        this.displayViewers();

        this.page = 1;
    }

    private displayPage2(plot: IViewerBase<any>): void {
        this.contentWrapper.innerHTML = "";

        this.builder = new DataSourceBuildController(plot);
        this.contentWrapper.appendChild(this.builder.wrapper);

        this.btnBack.wrapper.style.display = "inline-block";

        this.page = 2;
    }


    private displayViewers(): void {
        this.divLeft.innerHTML = "";
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: sensys.SensorManager = kernel.senMan;
        tableGen.addHeader("Plot name");
        for (let i = 0; i < senMan.viewers.length; i++) {
            let curPlot = senMan.viewers[i];
            this.drawRow(curPlot, tableGen);
        }
        this.divLeft.appendChild(tableGen.generate());        
    }

    private drawRow(curPlot: IViewerBase<any>, tableGen: HtmlTableGen): void {
        tableGen.addRow([
            {
                event: "click", func: (e: Event) => {
                    if (this.lastRow !== null) {
                        this.lastRow.classList.remove("selectedrow");
                    }
                    this.lastRow = this.findTableRow(<HTMLElement>e.target);
                    this.lastRow.classList.add("selectedrow");
                    this.displaySources(curPlot);
                }
            },
            {
                event: "mouseenter", func: (e: Event) => {
                    curPlot.plotWindow.highlight(true);
                }
            },
            {
                event: "mouseleave", func: (e: Event) => {
                    curPlot.plotWindow.highlight(false);
                }
            }
        ], curPlot.plotType);
    }

    private findTableRow(element: HTMLElement): HTMLElement {
        let curElement: HTMLElement = element;

        while (curElement.parentElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    }

    private displaySources(curPlot: IViewerBase<any>): void {
        // TODO: add list of pre-made sources
        this.divRight.innerHTML = "";
        let add: HTMLElement = this.mk.tag("p", "", [
            {
                event: "click", func: (e: Event) => {
                    this.displayPage2(curPlot);
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    }

    public updateViewers(): void {
        this.displayViewers();
    }

}