class DataSourceBuilder implements IApplication {
    app: Application;
    window: AppWindow;
    mk: HtmlHelper = new HtmlHelper();

    private dsb: DataSourceAssignmentController;

    public main(): void {
        this.window = kernel.winMan.createWindow(this.app, "Data Source Builder");
        this.window.setSize(700, this.window.height);
        this.dsb = new DataSourceAssignmentController();
        this.window.content.appendChild(this.dsb.generate());
        
        this.app.events.on(kernel.senMan.onRegisterViewer, () => {
            this.dsb.updateViewers();
        });
        this.app.events.on(kernel.senMan.onUnRegisterViewer, () => {
            this.dsb.updateViewers();
        });
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