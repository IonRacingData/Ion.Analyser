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
    private btnBack: TextButton;

    private selectedRow: HTMLElement | null = null;

    private sourceList: TempDataSourceList;

    onPageSwitch = newEvent<IDataEvent<any>>("DsaController.onPageSwitch");

    private mk: HtmlHelper = new HtmlHelper();

    constructor(viewer?: IViewerBase<any>) {
        super();
        const mk = this.mk;
        this.wrapper = mk.tag("div", "dsaController-wrapper");
        this.contentWrapper = mk.tag("div", "dsaController-contentwrapper");
        this.navWrapper = mk.tag("div", "dsaController-navwrapper");

        if (viewer) {
            this.selectedViewer = viewer;
        }

        for (let i = 0; i < 3; i++) {
            const e: HTMLElement = mk.tag("div", "dsaController-navelement");
            this.navElements.push(e);
            this.navWrapper.appendChild(e);
        }

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);

        this.btnBack = new TextButton();
        this.btnBack.text = "BACK";
        this.btnBack.onclick.addEventListener(() => {
            this.displayPage1();
        });
        this.navElements[0].appendChild(this.btnBack.wrapper);

        this.displayPage1();
    }

    private displayEmptyPage(): void {
        this.contentWrapper.innerHTML = "";
        const text = document.createElement("p");
        text.className = "dsaController-emptyPage";
        text.innerText = "No open charts";

        this.contentWrapper.appendChild(text);

        this.page = 0;
    }

    private displayPage1(): void {
        const mk = this.mk;
        this.contentWrapper.innerHTML = "";
        this.navWrapper.style.display = "none";

        this.content = mk.tag("div", "dsaController-content");
        this.divLeft = mk.tag("div", "dsaController-left");
        this.divRight = mk.tag("div", "dsaController-right");

        this.content.appendChild(this.divLeft);
        this.content.appendChild(this.divRight);
        this.contentWrapper.appendChild(this.content);

        this.displayViewers();

        this.page = 1;
        this.onPageSwitch({ target: this, data: this.page });

        if (kernel.senMan.viewers.length === 0) {
            this.displayEmptyPage();
        }
    }

    private displayPage2(): void {
        this.contentWrapper.innerHTML = "";
        this.navElements[1].innerHTML = "";
        if (this.selectedViewer) {
            this.builder = new DataSourceBuildController(this.selectedViewer);
            this.contentWrapper.appendChild(this.builder.wrapper);
            const viewer: HTMLElement = this.mk.tag("div", "dsaController-viewerInfo", [
                {
                    event: "mouseenter", func: (e: MouseEvent) => {
                        if (this.selectedViewer) {
                            this.selectedViewer.plotWindow.highlight(true);
                        }
                    },
                },
                {
                    event: "mouseleave", func: (e: MouseEvent) => {
                        if (this.selectedViewer) {
                            this.selectedViewer.plotWindow.highlight(false);
                        }
                    },
                }], this.selectedViewer.plotType);
            this.navElements[1].appendChild(viewer);
        }
        else {
            throw new Error("Undefined viewer exception");
        }
        this.navWrapper.style.display = "flex";

        this.page = 2;
        this.onPageSwitch({ target: this, data: this.page });
    }

    private displayViewers(): void {
        this.divLeft.innerHTML = "";
        const tableGen = new HtmlTableGen("table selectable");
        const senMan: sensys.SensorManager = kernel.senMan;
        //tableGen.addHeader("Plot name");
        for (let i = 0; i < senMan.viewers.length; i++) {
            const curPlot = senMan.viewers[i];
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
                    this.selectedRow = this.findTableRow(e.target as HTMLElement);
                    this.selectedRow.classList.add("selectedrow");
                    this.selectedViewer = curPlot;
                    this.displaySources();
                },
            },
            {
                event: "mouseenter", func: (e: Event) => {
                    curPlot.plotWindow.highlight(true);
                },
            },
            {
                event: "mouseleave", func: (e: Event) => {
                    curPlot.plotWindow.highlight(false);
                },
            },
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
            const btnNewSource: TextButton = new TextButton();
            btnNewSource.text = "NEW SOURCE";
            btnNewSource.onclick.addEventListener(() => {
                this.displayPage2();
            });

            const list: TempDataSourceList = new TempDataSourceList(this.selectedViewer);
            list.wrapper.style.overflowY = "auto";
            this.divRight.appendChild(list.wrapper);
            this.divRight.appendChild(btnNewSource.wrapper);
        }
    }

    public onViewersChange(): void {
        switch (this.page) {
            case 0:
                this.displayPage1();
                break;
            case 1:
                if (kernel.senMan.viewers.length === 0) {
                    this.displayPage1();
                }
                else {
                    this.displayViewers();
                    this.displaySources();
                }
                break;
            case 2:
                let isRegistered: boolean = false;
                for (const v of kernel.senMan.viewers) {
                    if (v === this.selectedViewer) {
                        isRegistered = true;
                    }
                }
                if (!isRegistered) {
                    this.displayPage1();
                }
        }

    }

}
