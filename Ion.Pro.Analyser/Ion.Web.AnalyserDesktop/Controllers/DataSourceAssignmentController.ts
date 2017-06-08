class DataSourceAssignmentController extends Component {

    private builder: DataSourceBuildController;
    private selectedViewer: IViewerBase<any> | null = null;
    private page: number = 1;

    private contentWrapper: HTMLElement;
    private navWrapper: HTMLElement;
    private navElements: HTMLElement[] = [];
    private content: HTMLElement;
    private divLeft: HTMLElement;
    private divRight: HTMLElement;
    private btnBack: Button;

    private selectedRow: HTMLElement | null = null;

    private sourceList: TempDataSourceList;

    private mk: HtmlHelper = new HtmlHelper();

    constructor() {
        super();
        let mk = this.mk;
        this.wrapper = mk.tag("div", "dsaController-wrapper");
        this.contentWrapper = mk.tag("div", "dsaController-contentwrapper");
        this.navWrapper = mk.tag("div", "dsaController-navwrapper");

        for (let i = 0; i < 3; i++) {
            let e: HTMLElement = mk.tag("div", "dsaController-navelement")
            this.navElements.push(e);
            this.navWrapper.appendChild(e);
        }

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);

        this.btnBack = new Button();
        this.btnBack.text = "BACK";
        this.btnBack.onclick.addEventListener(() => {
            this.displayPage1();
        });
        this.navElements[0].appendChild(this.btnBack.wrapper);

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
        this.navWrapper.style.display = "none";

        this.page = 1;
    }

    private displayPage2(): void {
        this.contentWrapper.innerHTML = "";
        this.navElements[1].innerHTML = "";
        if (this.selectedViewer) {
            this.builder = new DataSourceBuildController(this.selectedViewer);
            this.contentWrapper.appendChild(this.builder.wrapper);
            let viewer: HTMLElement = this.mk.tag("div", "dsaController-viewerInfo", [
                {
                    event: "mouseenter", func: (e: MouseEvent) => {
                        if (this.selectedViewer) {
                            this.selectedViewer.plotWindow.highlight(true);
                        }
                    }
                },
                {
                    event: "mouseleave", func: (e: MouseEvent) => {
                        if (this.selectedViewer) {
                            this.selectedViewer.plotWindow.highlight(false);
                        }
                    }
                }], this.selectedViewer.plotType);
            this.navElements[1].appendChild(viewer);
        }
        else {
            throw new Error("Undefined viewer exception");
        }
        this.navWrapper.style.display = "flex";

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
                    if (this.selectedRow !== null) {
                        this.selectedRow.classList.remove("selectedrow");
                    }
                    this.selectedRow = this.findTableRow(<HTMLElement>e.target);
                    this.selectedRow.classList.add("selectedrow");
                    this.selectedViewer = curPlot;
                    this.displaySources();
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

    private displaySources(): void {        
        this.divRight.innerHTML = "";
        if (this.selectedViewer) {
            let add: HTMLElement = this.mk.tag("p", "", [
                {
                    event: "click", func: (e: Event) => {
                        this.displayPage2();
                    }
                }
            ], "ADD SOURCE");
            add.style.cursor = "pointer";
            this.divRight.appendChild(add);

            let list: TempDataSourceList = new TempDataSourceList(this.selectedViewer);
            this.divRight.appendChild(list.wrapper);
        }
    }

    public onViewersChange(): void {
        this.displayViewers();
        this.displaySources();
        let isRegistered: boolean = false;        
        for (let v of kernel.senMan.viewers) {
            if (v === this.selectedViewer) {
                isRegistered = true;
            }
        }
        if (!isRegistered) {         
            this.displayPage1();            
        }
    }

}