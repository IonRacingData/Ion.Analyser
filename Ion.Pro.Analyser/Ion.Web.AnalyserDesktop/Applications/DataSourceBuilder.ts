class DataSourceBuilder implements IApplication {
    app: Application;
    window: AppWindow;
    mk: HtmlHelper = new HtmlHelper();

    private dsbOpen: boolean = false;
    private dsb: DSBController;

    private lastRow: HTMLElement = null;

    private innerWrapper: HTMLElement;
    private wrapper: HTMLElement;
    private divLeft: HTMLElement;
    private divRight: HTMLElement;
    private bottomDiv: HTMLElement;

    public main(): void {
        this.window = kernel.winMan.createWindow(this.app, "Data Source Builder");
        this.wrapper = this.mk.tag("div");
        this.wrapper.style.display = "flex";
        this.wrapper.style.flexDirection = "column";
        this.wrapper.style.height = "100%";
        this.wrapper.style.justifyContent = "space-between";
        this.innerWrapper = this.mk.tag("div");
        this.innerWrapper.style.display = "flex";
        this.innerWrapper.style.flexDirection = "row";
        this.bottomDiv = this.mk.tag("div");

        this.wrapper.appendChild(this.innerWrapper);
        this.wrapper.appendChild(this.bottomDiv);
        this.window.content.appendChild(this.wrapper);

        this.app.events.on(kernel.senMan.onRegisterViewer, () => {
            if (!this.dsbOpen) {
                this.drawLeft()
            }
        });
        this.app.events.on(kernel.senMan.onUnRegisterViewer, () => {
            if (!this.dsbOpen) {
                this.drawLeft()
            }
        });

        this.drawInner();
    }

    private drawInner(): void {
        this.innerWrapper.innerHTML = "";

        let mk = this.mk;
        this.divLeft = mk.tag("div");
        this.divRight = mk.tag("div");

        this.drawLeft();
                       
        this.divRight.style.flexGrow = "1";
        this.divRight.style.flexBasis = "0";

        this.innerWrapper.appendChild(this.divLeft);
        this.innerWrapper.appendChild(this.divRight);
    }

    private drawLeft(): void {
        this.divLeft.innerHTML = "";
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: sensys.SensorManager = kernel.senMan;        
        tableGen.addHeader("Plot name");
        for (let i = 0; i < senMan.viewers.length; i++) {
            let curPlot = senMan.viewers[i];
            this.drawRow(curPlot, tableGen);
        }
        this.divLeft.appendChild(tableGen.generate());
        this.divLeft.style.flexGrow = "1";
        this.divLeft.style.flexBasis = "0";
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

        while (curElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    }

    private displaySources(curPlot: IViewerBase<any>): void {
        this.divRight.innerHTML = "";
        let add: HTMLElement = this.mk.tag("p", "", [
            {
                event: "click", func: (e: Event) => {
                    this.openDSB(curPlot);
                }
            }
        ], "ADD SOURCE");
        add.style.cursor = "pointer";
        this.divRight.appendChild(add);
    }

    private openDSB(curPlot: IViewerBase<any>): void {
        this.dsbOpen = true;        
        this.innerWrapper.innerHTML = "";
        this.dsb = new DSBController(curPlot);
        this.innerWrapper.appendChild(this.dsb.wrapper);
        let back: HTMLElement = this.mk.tag("p", "", [
            {
                event: "click", func: (e: Event) => {
                    this.dsbOpen = false;
                    this.drawInner();
                    this.bottomDiv.innerHTML = "";
                    this.displaySources(curPlot);
                }
            }
        ], "BACK");
        back.style.cursor = "pointer";
        this.bottomDiv.appendChild(back);
    }

}

class Carousel {
    wrapper: HTMLElement;
    navWrapper: HTMLElement;
    description: HTMLElement;
    contentWrapper: HTMLElement;
    slides: ISlide[] = [];
    visibleSlide: number = 0;
    mk: HtmlHelper = new HtmlHelper();

    btn_back: HTMLElement;
    btn_next: HTMLElement;

    constructor() {
        this.wrapper = this.mk.tag("div", "carousel");
        this.navWrapper = this.mk.tag("div", "carousel_navWrapper");
        this.description = this.mk.tag("div");

        this.btn_back = this.mk.tag("img");
        this.btn_back.setAttribute("src", "arrow.png");
        this.btn_back.style.transform = "rotate(180deg)";
        this.navWrapper.appendChild(this.btn_back);

        this.navWrapper.appendChild(this.description);

        this.btn_next= this.mk.tag("img");        
        this.btn_next.setAttribute("src", "arrow.png");

        this.navWrapper.appendChild(this.btn_next);
        this.btn_next.style.cssFloat = "right";
        this.navWrapper.style.msUserSelect = "none";        

        this.contentWrapper = this.mk.tag("div", "carousel_contentWrapper");

        this.btn_back.addEventListener("click", () => {
            if (this.visibleSlide > 0) {
                this.contentWrapper.innerHTML = "";
                this.contentWrapper.appendChild(this.slides[--this.visibleSlide].slide);
                this.description.innerHTML = this.slides[this.visibleSlide].description;
            }
        });

        this.btn_next.addEventListener("click", () => {
            if (this.visibleSlide < this.slides.length - 1) {
                this.contentWrapper.innerHTML = "";
                this.contentWrapper.appendChild(this.slides[++this.visibleSlide].slide);
                this.description.innerHTML = this.slides[this.visibleSlide].description;
            }
        });

        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.navWrapper);
    }

    public addSlide(content: HTMLElement, description?: string) {        
        let des = description || "";
        let slide: ISlide = { slide: content, description: des };

        if (this.slides.length === 0) {
            this.contentWrapper.appendChild(content);
            this.description.innerHTML = des;
        }
        
        this.slides.push(slide);
    }
}

interface ISlide {
    slide: HTMLElement;
    description: string;
}