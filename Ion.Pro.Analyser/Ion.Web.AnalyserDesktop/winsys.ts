class WindowManager implements IEventManager {
    body: HTMLElement;
    template: HTMLTemplateElement;

    dragging: boolean;
    resizing: boolean;

    activeWindow: AppWindow;

    windows: AppWindow[] = [];
    order: AppWindow[] = [];

    eventManager: EventManager;

    events: any = {};

    tileZone = 20;
    topBar = 40;

    addEventListener2: (type: string, listner: any) => void;

    static event_globalDrag = "globalDrag";
    static event_globalUp = "globalUp;"

    static event_windowOpen = "windowOpen";
    static event_windowSelect = "windowSelect";
    static event_windowClose = "windowClose";

    constructor(container: HTMLElement) {
        this.body = container;

        this.template = <HTMLTemplateElement>document.getElementById("temp-window");

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
        this.eventManager = new EventManager();
        //this.addEventListener = this.eventManager.addEventListener;
        //this.addEventListener2 = this.eventManager.addEventListener;
        //addEventListener
    }

    mouseMove(e: MouseEvent): void {
        if (this.dragging) {

            this.activeWindow.setRelativePos(e.pageX, e.pageY);
            var tileZone: number = this.tileZone;
            var topBar: number = this.topBar;

            if (e.pageX < tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (e.pageX < tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (e.pageY < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (e.pageX < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }

            this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    }

    mouseUp(e: MouseEvent): void {
        console.log(e);
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    }

    createWindow(app: Application, title: string): AppWindow {
        var window: AppWindow = this.makeWindow(app);
        window.setTitle(title);
        app.windows.push(window);
        this.registerWindow(window);

        return window;
    }

    makeWindow(app: Application): AppWindow {
        var tempWindow: AppWindow = new AppWindow(app);
        return tempWindow;
    }

    registerWindow(app: AppWindow): void {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.raiseEvent(WindowManager.event_windowOpen, null);
        this.selectWindow(app);
    }

    makeWindowHandle(appWindow: AppWindow): HTMLElement {
        var div: HTMLElement = document.createElement("div");
        div.className = "window-wrapper";
        var clone: HTMLElement = <HTMLElement>document.importNode(this.template.content, true);
        div.appendChild(clone);
        return div;
    }

    selectWindow(appWindow: AppWindow): void {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.raiseEvent(WindowManager.event_windowSelect, null);
    }

    makeTopMost(appWindow: AppWindow): void {
        let index: number = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    }

    closeWindow(appWindow: AppWindow): void {
        appWindow.handle.parentElement.removeChild(appWindow.handle);
        this.windows.splice(this.windows.indexOf(appWindow), 1);
        this.order.splice(this.order.indexOf(appWindow), 1);
        appWindow.app.windows.splice(appWindow.app.windows.indexOf(appWindow), 1);
        this.raiseEvent(WindowManager.event_windowClose, null);
    }

    reorderWindows(): void {
        for (let i: number = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    }

    addEventListener(type: string, listner: any): void {
        this.eventManager.addEventListener(type, listner);
    }

    removeEventListener(type: string, listener: any): void {
        this.eventManager.removeEventListener(type, listener);
    }

    raiseEvent(type: string, data: any): void {
        this.eventManager.raiseEvent(type, data);
    }
}