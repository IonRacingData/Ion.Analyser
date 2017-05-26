class DSBController {

    private wrapper: HTMLElement;
    private contentWrapper: HTMLElement;
    private navWrapper: HTMLElement;

    private plot: IViewerBase<any>;
    private template: DataSourceTemplate;

    private page: number = 1;

    /* page 1 */
    private wrapper_p1: HTMLElement;
    private divLeft: HTMLElement;
    private divRight: HTMLElement;

    private lastRow: HTMLElement = null;


    /* page 2 */
    private mk: HtmlHelper = new HtmlHelper();
    private wrapper_p2: HTMLElement;
    private subDivs: HTMLElement[] = [];


    constructor() {}

    public generate(): HTMLElement {
        this.initContent();
        this.displayPage1();
        this.updateViewers();
        return this.wrapper;
    }

    private displayPage1(): void {
        //this.displayViewers();
        this.wrapper_p1.style.display = "flex";
        this.wrapper_p2.style.display = "none";
        this.page = 1;
    }

    private displayPage2(): void {
        this.wrapper_p1.style.display = "none";
        this.wrapper_p2.style.display = "flex";
        this.drawBackButton();
        this.page = 2;
    }

    private initContent(): void {
        let mk = this.mk;

        /* dsb wrapper */
        this.wrapper = mk.tag("div", "dsb-wrapper");

        this.contentWrapper = mk.tag("div", "dsb-contentwrapper");

        this.navWrapper = mk.tag("div", "dsb-navwrapper");        

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);

        /* page 1 */
        this.wrapper_p1 = mk.tag("div", "dsb-p1-wrapper");
        this.wrapper_p1.style.display = "flex";
        this.wrapper_p1.style.flexDirection = "row";
        this.wrapper_p1.style.justifyContent = "space-between";

        this.divLeft = mk.tag("div");
        this.divLeft.style.flexGrow = "1";
        this.divLeft.style.flexBasis = "0";

        this.divRight = mk.tag("div");
        this.divRight.style.flexGrow = "1";
        this.divRight.style.flexBasis = "0";

        this.wrapper_p1.appendChild(this.divLeft);
        this.wrapper_p1.appendChild(this.divRight);

        this.contentWrapper.appendChild(this.wrapper_p1);


        /* page 2 */
        this.wrapper_p2 = mk.tag("div", "dsb-p2-wrapper");
        for (let i = 0; i < 3; i++) {
            let div: HTMLElement = mk.tag("div", "dsb-p2-section")
            this.subDivs.push(div);
            this.wrapper_p2.appendChild(div);
        }

        this.contentWrapper.appendChild(this.wrapper_p2);

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
                    this.plot = curPlot;
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

        while (curElement !== null && curElement.tagName !== "TR") {
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
                    this.displayPage2();
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    }



    private drawBackButton(): void {
        let back: HTMLElement = this.mk.tag("p", "", [
            {
                event: "click", func: (e: Event) => {
                    this.navWrapper.innerHTML = "";
                    this.displayPage1();
                }
            }
        ], "BACK");
        back.style.cursor = "pointer";
        this.navWrapper.appendChild(back);        
    }  


    public updateViewers(): void {
        this.displayViewers();
    }

}