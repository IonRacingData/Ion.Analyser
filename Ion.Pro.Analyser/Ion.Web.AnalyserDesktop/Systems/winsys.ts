class WindowManager implements IEventManager {
    private body: HTMLElement;
    private template: HTMLTemplateElement;

    public dragging: boolean;
    public resizing: boolean;

    public curTheme: string = "";

    public activeWindow: AppWindow;

    public windows: AppWindow[] = [];
    private order: AppWindow[] = [];

    private eventManager: EventManager;

    private events: any = {};

    private tileZone = 20;
    private topBar = 40;

    onGlobalDrag = newEvent<IWindowEvent>("WindowManager.onGlobalDrag");
    onGlobalUp = newEvent<IWindowEvent>("WindowManager.onGlobalUp");

    onWindowOpen = newEvent("WindowManager.onWindowOpen");
    onWindowSelect = newEvent("WindowManager.onWindowSelect");
    onWindowClose = newEvent("WindowManager.onWindowClose");
    onWindowUpdate = newEvent("WindowManager.onWindowUpdate");

    onThemeChange = newEvent("WindowManager.onThemeChange");

    private availableThemes: string[] = ["app-style", "app-style-dark"];

    constructor(container: HTMLElement) {
        this.body = container;

        this.template = document.getElementById("temp-window") as HTMLTemplateElement;

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
        window.addEventListener("touchmove", (e: TouchEvent) => this.touchMove(e));
        window.addEventListener("touchend", (e: TouchEvent) => this.touchEnd(e));
        this.eventManager = new EventManager();
        // this.addEventListener = this.eventManager.addEventListener;
        // this.addEventListener2 = this.eventManager.addEventListener;
        // addEventListener
        onPreloadDone(() => {
            this.modifyCurrentStylesheet();
        });
    }

    private current: CSSStyleSheet;
    private avaiableRules: { [name: string]: CSSStyleRule } = {};

    private modifyCurrentStylesheet() {
        /*for (let i = 0; i < document.styleSheets.length; i++) {
            let a = document.styleSheets[i];
            if (a.title == "app-style")
            {
                this.current = <CSSStyleSheet>a;
                break;
            }
        }*/
        //console.log(preloadStyle);
        //console.log(preloadStyle.sheet);
        this.current = preloadStyle.sheet as CSSStyleSheet;
        console.log(this.current);
        this.avaiableRules = {};
        for (let i = 0; i < this.current.cssRules.length; i++) {
            const a = this.current.cssRules[i] as CSSStyleRule;
            this.avaiableRules[a.selectorText] = a;
        }
    }

    public mouseMove(e: MouseEvent): void {
        this.handleMouseMoving(e.pageX, e.pageY, e);
    }

    public touchMove(e: TouchEvent): void {
        e.preventDefault();
        this.handleMouseMoving(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e);
    }

    public handleMouseMoving(x: number, y: number, e: MouseEvent | TouchEvent): void {
        if (this.dragging) {
            this.activeWindow.__setRelativePos(x, y);
            const tileZone: number = this.tileZone;
            const topBar: number = this.topBar;

            if (x < tileZone && y < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (x < tileZone && y > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (x > window.innerWidth - tileZone && y < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (x > window.innerWidth - tileZone && y > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (y < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (x < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (x > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }
            this.onGlobalDrag({ target: this, window: this.activeWindow, mouse: e });
            //this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
            const appWindow = this.getWindowAt(x, y, true);
            if (appWindow) {
                appWindow.handleGlobalDrag(x, y, this.activeWindow);
            }
        }
        else if (this.resizing) {
            this.activeWindow.__setRelativeSize(x, y);
        }
    }

    private getWindowAt(x: number, y: number, ignoreActive: boolean): AppWindow | null {
        for (let i = this.order.length - 1; i >= 0 ; i--) {
            const curWindow = this.windows[i];
            if (ignoreActive && curWindow === this.activeWindow) {
                continue;
            }
            if (this.intersects(x, y, curWindow)) {
                return curWindow;
            }
        }
        return null;
    }

    private intersects(x: number, y: number, window: AppWindow): boolean {
        return x > window.x
            && x < window.x + window.totalWidth
            && y > window.y
            && y < window.y + window.totalHeight;
    }

    private mouseUp(e: MouseEvent): void {
        // console.log(e);
        const x = e.layerX;
        const y = e.layerY;
        const appWindow = this.getWindowAt(x, y, true);
        if (appWindow) {
            appWindow.handleGlobalRelease(x, y, this.activeWindow);
        }
        this.dragging = false;
        this.resizing = false;
        this.onGlobalUp({ target: this, window: this.activeWindow, mouse: e });
        //this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    }

    private touchEnd(e: TouchEvent): void {
        const x = e.changedTouches[0].pageX;
        const y = e.changedTouches[0].pageY;
        const appWindow = this.getWindowAt(x, y, true);
        if (appWindow) {
            appWindow.handleGlobalRelease(x, y, this.activeWindow);
        }
        this.dragging = false;
        this.resizing = false;
        this.onGlobalUp({ target: this, window: this.activeWindow, mouse: e });
        //this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    }

    public createWindow(app: Application, title: string): AppWindow {
        const window: AppWindow = this.makeWindow(app);
        // window.setTitle(title);
        window.title = title;
        app.windows.push(window);
        this.registerWindow(window);

        return window;
    }

    private makeWindow(app: Application): AppWindow {
        const tempWindow: AppWindow = new AppWindow(app);
        const extra = this.windows.length % 10 * 50;
        tempWindow.setPos(tempWindow.x + extra, tempWindow.y + extra);
        tempWindow.onUpdate.addEventListener(() => {
            this.onWindowUpdate({ target: this });
            //this.eventManager.raiseEvent(WindowManager.event_windowUpdate, null);
        });
        return tempWindow;
    }

    private appWindow_update() {

    }

    private registerWindow(app: AppWindow): void {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.onWindowOpen({ target: this });
        //this.raiseEvent(WindowManager.event_windowOpen, null);
        this.selectWindow(app);
    }

    public getRule(name: string): CSSStyleRule {
        if (this.avaiableRules[name]) {
            return this.avaiableRules[name];
        }
        console.log("The css rule: " + name + " does not exist");
        throw new Error("CSS rule not found exception");
    }

    public changeTheme(theme: string): void {
        const name = "/Style/" + theme + ".css";
        this.curTheme = theme;
        console.log(name);
        if (preloaded[name]) {
            preloadStyle.innerHTML = preloaded[name];
            this.modifyCurrentStylesheet();
            this.onThemeChange({ target: this });
        }
        //let style = <HTMLLinkElement>document.getElementById("main-theme");
        /*if (navigator.userAgent.match(/firefox/i)) {
            style.onload = () => {
                console.log("hello");
                this.modifyCurrentStylesheet();
                this.onThemeChange({ target: this });
                //this.raiseEvent(WindowManager.event_themeChange, null);
            }
        }
        else {
            setTimeout(() => {
                console.log("hello");
                this.modifyCurrentStylesheet();
                this.onThemeChange({ target: this });
                //this.raiseEvent(WindowManager.event_themeChange, null);
            }, 200);
        }

        style.href = "/" + theme + ".css";*/
    }

    public makeWindowHandle(appWindow: AppWindow): HTMLElement {
        const div: HTMLElement = document.createElement("div");
        div.className = "window-wrapper";
        const clone: HTMLElement = document.importNode(this.template.content, true) as HTMLElement;
        div.appendChild(clone);
        return div;
    }

    public selectWindow(appWindow: AppWindow): void {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.onWindowSelect({ target: this });
        //this.raiseEvent(WindowManager.event_windowSelect, null);
    }

    public makeTopMost(appWindow: AppWindow): void {
        const index: number = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    }

    public closeWindow(appWindow: AppWindow): void {
        if (appWindow.handle.parentElement === null) {
            throw new Error("appWindow null exception");
        }
        appWindow.handle.parentElement.removeChild(appWindow.handle);
        this.windows.splice(this.windows.indexOf(appWindow), 1);
        this.order.splice(this.order.indexOf(appWindow), 1);
        appWindow.app.windows.splice(appWindow.app.windows.indexOf(appWindow), 1);
        this.onWindowClose({ target: this });
        //this.raiseEvent(WindowManager.event_windowClose, null);
    }

    public reorderWindows(): void {
        for (let i: number = 0; i < this.order.length; i++) {
            if (this.order[i].topMost) {
                this.order[i].handle.style.zIndex = ((i + 1) * 100000).toString();
            }
            else {
                this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
            }
        }
    }

    public addEventListener(type: string, listner: any): void {
        this.eventManager.addEventListener(type, listner);
    }

    public removeEventListener(type: string, listener: any): void {
        this.eventManager.removeEventListener(type, listener);
    }

    private raiseEvent(type: string, data: any): void {
        this.eventManager.raiseEvent(type, data);
    }
}
