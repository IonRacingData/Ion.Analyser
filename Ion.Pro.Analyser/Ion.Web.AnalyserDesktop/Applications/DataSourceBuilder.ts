class DataSourceBuilder implements IApplication {
    application: Application;
    window: AppWindow;
    mk: HtmlHelper = new HtmlHelper();
    eh: EventHandler = new EventHandler();

    public main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Source Builder");

        this.eh.on(kernel.senMan, sensys.SensorManager.event_registerViewer, () => this.draw());
        this.eh.on(kernel.senMan, sensys.SensorManager.event_unregisterViewer, () => this.draw());
        this.eh.on(this.window, AppWindow.event_close, () => this.window_close());

        this.draw();
    }

    private window_close() {
        this.eh.close();
    }

    private draw(): void {
        this.window.content.innerHTML = "";

        let mk = this.mk;
        let divLeft = mk.tag("div");
        let divRight = mk.tag("div");
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: sensys.SensorManager = kernel.senMan;
        let last: HTMLElement = null;
        tableGen.addHeader("Plot name");
        for (let i = 0; i < senMan.viewers.length; i++) {
            let curPlot = senMan.viewers[i];
            tableGen.addRow(curPlot.plotType);
        }

        divLeft.appendChild(tableGen.generate());
        divLeft.style.minWidth = "250px";
        divLeft.style.flexGrow = "1";
        divLeft.style.overflowY = "auto";

        divRight.style.minWidth = "250px";
        divRight.style.flexGrow = "2";
        divRight.style.overflowY = "auto";

        this.window.content.appendChild(divLeft);
        this.window.content.appendChild(divRight);
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