class AppWindow implements IEventManager {
    app: Application;
    private _title: string;
    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
        this.handle.getElementsByClassName("window-title")[0].innerHTML = value;
    }

    get totalWidth(): number {
        return this.windowElement.clientWidth;
    }
    get totalHeight(): number {
        return this.windowElement.clientHeight;
    }

    handle: HTMLElement;
    private windowElement: HTMLElement;
    moveHandle: HTMLElement;
    sizeHandle: HTMLElement;
    winMan: WindowManager;
    topMost: boolean = false;

    private eventMan: EventManager = new EventManager();

    static readonly event_move = "move";
    static readonly event_resize = "resize";
    static readonly event_minimize = "minimize";
    static readonly event_maximize = "maximize";
    static readonly event_mouseMove = "mouseMove";


    static readonly event_dragOver = "dragOver";
    static readonly event_dragRelease = "dragRelease";

    static readonly event_close = "close";

    x: number;
    y: number;

    private deltaX: number;
    private deltaY: number;

    private storeX: number;
    private storeY: number;

    width: number;
    height: number;

    private storeWidth: number;
    private storeHeight: number;

    private outerBoxMargin: number = 8;

    state: WindowState;
    prevState: WindowState;

    content: HTMLElement;

    constructor(app: Application) {
        this.app = app;

        var handle: HTMLElement = this.handle = kernel.winMan.makeWindowHandle(this);
        // kernel.winMan.registerWindow(this);

        handle.addEventListener("mousedown", (e: MouseEvent) => this.main_mouseDown(e));
        this.moveHandle = handle;
        this.sizeHandle = <HTMLElement>handle.getElementsByClassName("window-body")[0];

        var headerBar: Element = handle.getElementsByClassName("window-header")[0];
        var min: Element = handle.getElementsByClassName("window-control-min")[0];
        var max: Element = handle.getElementsByClassName("window-control-max")[0];
        var exit: Element = handle.getElementsByClassName("window-control-exit")[0];
        var resize: HTMLElement = <HTMLElement>handle.getElementsByClassName("window-bottom-right")[0];

        headerBar.addEventListener("mousedown", (e: MouseEvent) => this.header_mouseDown(e));
        resize.addEventListener("mousedown", (e: MouseEvent) => this.resize_mouseDown(e));

        (<HTMLDivElement>headerBar).addEventListener("touchstart", (e: TouchEvent) => this.header_touchStart(e));
        (<HTMLDivElement>resize).addEventListener("touchstart", (e: TouchEvent) => this.resize_touchStart(e));

        min.addEventListener("mousedown", (e: MouseEvent) => this.minimize_click(e));
        max.addEventListener("mousedown", (e: MouseEvent) => this.maximize_click(e));
        exit.addEventListener("mousedown", (e: MouseEvent) => this.close_click(e));



        this.handle.window = this;

        this.setPos(300, 50);
        this.setSize(500, 400);
        this.windowElement = <HTMLElement>handle.getElementsByClassName("window")[0];
        this.content = this.sizeHandle;// <HTMLElement>this.handle.getElementsByClassName("window-body")[0];

        this.content.addEventListener("mousemove", (e: MouseEvent) => this.content_mouseMove(e));
    }

    addEventListener(type: string, listener: any) {
        this.eventMan.addEventListener(type, listener);
    }

    removeEventListener(type: string, listener: any) {
        this.eventMan.removeEventListener(type, listener);
    }

    private content_mouseMove(e: MouseEvent): void {
        this.onMouseMove(e.layerX, e.layerY);
    }

    /* Event handlers */
    private main_mouseDown(e: MouseEvent): void {
        this.winMan.selectWindow(this);
    }

    private header_mouseDown(e: MouseEvent): void {
        e.stopPropagation();
        // console.log("headerDown");
        this.deltaX = this.handle.offsetLeft - e.pageX + this.outerBoxMargin;
        this.deltaY = this.handle.offsetTop - e.pageY + this.outerBoxMargin;

        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    }

    private header_touchStart(e: TouchEvent): void {
        e.stopPropagation();
        // e.preventDefault();
        console.log(e);
        this.deltaX = this.handle.offsetLeft - e.targetTouches[0].pageX + this.outerBoxMargin;
        this.deltaY = this.handle.offsetTop - e.targetTouches[0].pageY + this.outerBoxMargin;

        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    }

    private resize_mouseDown(e: MouseEvent): void {
        e.stopPropagation();
        console.log("resizeDown");
        this.deltaX = this.width - e.pageX;
        this.deltaY = this.height - e.pageY;
        // console.log(this.sizeHandle.offsetLeft.toString() + " " + this.sizeHandle.offsetTop.toString());

        this.winMan.resizing = true;
        this.winMan.selectWindow(this);
    }

    private resize_touchStart(e: TouchEvent): void {
        e.stopPropagation();
        e.preventDefault();
        console.log("resizeDown");
        this.deltaX = this.width - e.targetTouches[0].pageX;
        this.deltaY = this.height - e.targetTouches[0].pageY;
        // console.log(this.sizeHandle.offsetLeft.toString() + " " + this.sizeHandle.offsetTop.toString());

        this.winMan.resizing = true;
        this.winMan.selectWindow(this);
    }

    private minimize_click(e: MouseEvent): void {
        e.stopPropagation();
        console.log("minimize");
        this.hide();
        this.changeStateTo(WindowState.MINIMIZED);
    }

    private maximize_click(e: MouseEvent): void {
        e.stopPropagation();
        this.winMan.selectWindow(this);
        if (this.state === WindowState.MAXIMIZED) {
            this.restore();
        }
        else {
            this.maximize();
        }
        console.log("maximize");
    }

    private close_click(e: MouseEvent): void {
        e.stopPropagation();
        this.close();
    }

    public handleGlobalDrag(x: number, y: number, window: AppWindow): void {
        this.onDragOver(x - this.x, y - this.y - 30, window);
    }

    public handleGlobalRelease(x: number, y: number, window: AppWindow): void {
        this.onDragRelease(x - this.x, y - this.y - 30, window);
    }


    /* Private stuff */
    private restoreSize(): void {
        this.setSize(this.width, this.height, false);
        this.sizeHandle.parentElement.parentElement.style.padding = "8px";

        let curHandle = this.sizeHandle.parentElement;
        for (let i = 0; i < 3; i++) {
            curHandle.style.width = null;
            curHandle.style.height = null;
            curHandle = curHandle.parentElement;
        }
    }

    private restorePos(): void {
        this.handle.style.left = this.x.toString() + "px";
        this.handle.style.top = this.y.toString() + "px";
    }

    private removeSize(): void {
        let curHandle = this.sizeHandle;
        for (let i = 0; i < 4; i++) {
            curHandle.style.width = "100%";
            curHandle.style.height = "100%";
            if (i === 3) {
                break;
            }
            curHandle = curHandle.parentElement;
        }
        curHandle.style.padding = "0";
    }

    private removeHeader() {
        (<HTMLElement>this.handle.getElementsByClassName("window-header")[0]).style.display = "none";
    }

    private restoreHeader() {
        (<HTMLElement>this.handle.getElementsByClassName("window-header")[0]).style.display = null;
    }

    private removePos(): void {
        this.handle.style.left = null;
        this.handle.style.top = null;
    }

    private changeStateTo(state: WindowState): void {
        this.prevState = this.state;
        this.state = state;
    }

    /*Events*/
    onResize(): void {
        this.eventMan.raiseEvent(AppWindow.event_resize, null);
    }

    onMove(): void {
        this.eventMan.raiseEvent(AppWindow.event_move, null);
    }

    onClose(): void {
        this.eventMan.raiseEvent(AppWindow.event_close, null);
    }

    onMouseMove(x: number, y: number): void {
        this.eventMan.raiseEvent(AppWindow.event_mouseMove, new AppMouseEvent(x, y));
    }

    onDragOver(x: number, y: number, window: AppWindow): void {
        this.eventMan.raiseEvent(AppWindow.event_dragOver, new AppMouseDragEvent(x, y, window));
    }

    onDragRelease(x: number, y: number, window: AppWindow): void {
        console.log("Release");
        this.eventMan.raiseEvent(AppWindow.event_dragRelease, new AppMouseDragEvent(x, y, window));
    }

    close() {
        this.onClose();
        this.app.onClose();
        this.winMan.closeWindow(this);
    }

    show(): void {
        this.handle.style.display = "";
        if (this.state === WindowState.MINIMIZED) {
            this.changeStateTo(this.prevState);
        }
    }

    hide(): void {
        this.handle.style.display = "none";
    }

    restore(): void {
        this.setPos(this.storeX, this.storeY);
        this.setSize(this.storeWidth, this.storeHeight);
        this.changeStateTo(WindowState.RESTORED);
    }

    maximize(): void {
        this.setPos(0, 40, false);
        this.setSize(window.innerWidth - 1, window.innerHeight - 40 - 30, false);
        this.changeStateTo(WindowState.MAXIMIZED);
    }

    tile(state: TileState): void {
        var topBar: number = 40;
        var windowTitle: number = 30;

        var windowWidth: number = window.innerWidth;
        var windowHeight: number = window.innerHeight - topBar;

        var newX: number = 0;
        var newY: number = 40;
        var newWidth: number = windowWidth / 2 - 1;
        var newHeight: number = windowHeight / 2 - windowTitle;
        switch (state) {
            case TileState.LEFT:
                newHeight = windowHeight - windowTitle;
                break;
            case TileState.RIGHT:
                newX = windowWidth / 2;
                newHeight = windowHeight - windowTitle;
                break;
            case TileState.TOPLEFT:
                break;
            case TileState.BOTTOMLEFT:
                newY = windowHeight / 2 + topBar;
                break;
            case TileState.TOPRIGHT:
                newX = windowWidth / 2;
                break;
            case TileState.BOTTOMRIGHT:
                newX = windowWidth / 2;
                newY = windowHeight / 2 + topBar;
                break;
        }
        this.setPos(newX, newY, false);
        this.setSize(newWidth, newHeight, false);
        this.changeStateTo(WindowState.TILED);
    }

    recalculateSize() {
        this.width = this.content.clientWidth;
        this.height = this.content.clientHeight;
    }

    setPos(x: number, y: number, storePos: boolean = true): void {
        this.moveHandle.style.left = (x - this.outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y - this.outerBoxMargin).toString() + "px";
        this.x = x;
        this.y = y;
        if (storePos) {
            this.storeX = x;
            this.storeY = y;
        }
        this.onMove();
    }

    setSize(width: number, height: number, storeSize: boolean = true): void {
        /*if (width < 230)
            width = 230;
        if (height < 150)
            height = 150;*/
        this.sizeHandle.style.width = width.toString() + "px";
        this.sizeHandle.style.height = height.toString() + "px";
        this.width = width;
        this.height = height;
        if (storeSize) {
            this.storeWidth = width;
            this.storeHeight = height;
        }
        this.onResize();
    }

    changeWindowMode(mode: WindowMode): void {
        switch (mode) {
            case WindowMode.BORDERLESSFULL:
                this.removeSize();
                this.removePos();
                this.removeHeader();
                this.recalculateSize();
                this.onResize();
                break;
            case WindowMode.BORDERLESS:
                this.removeHeader();
                this.onResize();
                break;
            case WindowMode.WINDOWED:
                this.restoreSize();
                this.restorePos();
                this.restoreHeader();
                this.onResize();
                break;
        }
    }

    highlight(highlight: boolean) {
        if (highlight) {
            (<HTMLElement>this.handle.getElementsByClassName("window-overlay")[0]).style.display = "block";
        }
        else {
            (<HTMLElement>this.handle.getElementsByClassName("window-overlay")[0]).style.display = "none";
        }
    }



    __setRelativePos(x: number, y: number, storePos: boolean = true): void {

        if (this.state === WindowState.MAXIMIZED || this.state === WindowState.TILED) {
            this.restore();
            this.deltaX = -this.width / 2;
        }
        this.moveHandle.style.left = (x + this.deltaX - this.outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y + this.deltaY - this.outerBoxMargin).toString() + "px";
        this.x = x + this.deltaX;
        this.y = y + this.deltaY;
        if (storePos) {
            this.storeX = x + this.deltaX;
            this.storeY = y + this.deltaY;
        }
        this.onMove();
    }

    __setRelativeSize(width: number, height: number, storeSize: boolean = true): void {
        let newWidth = width + this.deltaX;
        let newHeight = height + this.deltaY;

        if (newWidth < 230) {
            newWidth = 230;
        }
        if (newHeight < 150) {
            newHeight = 150;
        }
        this.sizeHandle.style.width = (newWidth).toString() + "px";
        this.sizeHandle.style.height = (newHeight).toString() + "px";
        this.width = newWidth;
        this.height = newHeight;
        if (storeSize) {
            this.storeWidth = newWidth;
            this.storeHeight = newHeight;
        }
        this.onResize();
    }
}

class AppMouseEvent implements EventData {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class AppMouseDragEvent extends AppMouseEvent {
    public window: AppWindow;

    constructor(x: number, y: number, window: AppWindow) {
        super(x, y);
        this.window = window;
    }
}

enum WindowMode {
    WINDOWED = 0,
    BORDERLESSFULL = 1,
    BORDERLESS = 2,
}

enum TileState {
    LEFT = 0,
    RIGHT = 1,
    TOPLEFT = 2,
    TOPRIGHT = 3,
    BOTTOMLEFT = 4,
    BOTTOMRIGHT = 5
}

enum WindowState {
    RESTORED = 0,
    MINIMIZED = 1,
    MAXIMIZED = 2,
    TILED = 3
}