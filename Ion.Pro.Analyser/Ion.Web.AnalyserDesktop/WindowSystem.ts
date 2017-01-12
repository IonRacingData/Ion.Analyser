class AppWindow {
    app: Application;
    title: string;
    handle: HTMLElement;
    moveHandle: HTMLElement;
    sizeHandle: HTMLElement;
    winMan: WindowManager;
    eventMan: EventManager = new EventManager();


    static event_move = "move";
    static event_resize = "resize";
    static event_minimize = "minimize";
    static event_maximize = "maximize";

    x: number;
    y: number;

    deltaX: number;
    deltaY: number;

    storeX: number;
    storeY: number;

    width: number;
    height: number;

    storeWidth: number;
    storeHeight: number;

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

        min.addEventListener("mousedown", (e: MouseEvent) => this.minimize_click(e));
        max.addEventListener("mousedown", (e: MouseEvent) => this.maximize_click(e));
        exit.addEventListener("mousedown", (e: MouseEvent) => this.close_click(e));

        this.handle.window = this;

        this.setPos(300, 50);
        this.setSize(500, 400);

        this.content = <HTMLElement>this.handle.getElementsByClassName("window-body")[0];
    }

    setTitle(title: string): void {
        this.title = title;
        this.handle.getElementsByClassName("window-title")[0].innerHTML = title;
    }


    /* Event handlers */
    main_mouseDown(e: MouseEvent): void {
        this.winMan.selectWindow(this);
    }

    header_mouseDown(e: MouseEvent): void {
        e.stopPropagation();
        console.log("headerDown");
        this.deltaX = this.handle.offsetLeft - e.pageX;
        this.deltaY = this.handle.offsetTop - e.pageY;

        this.winMan.dragging = true;
        this.winMan.selectWindow(this);
    }

    resize_mouseDown(e: MouseEvent): void {
        e.stopPropagation();
        console.log("resizeDown");
        this.deltaX = this.width - e.pageX;
        this.deltaY = this.height - e.pageY;
        // console.log(this.sizeHandle.offsetLeft.toString() + " " + this.sizeHandle.offsetTop.toString());

        this.winMan.resizing = true;
        this.winMan.selectWindow(this);
    }

    minimize_click(e: MouseEvent): void {
        e.stopPropagation();
        console.log("minimize");
        this.hide();
        this.changeStateTo(WindowState.MINIMIZED);
    }

    maximize_click(e: MouseEvent): void {
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

    close_click(e: MouseEvent): void {
        e.stopPropagation();
        this.app.onClose();
        this.winMan.closeWindow(this);
    }

    /*Events*/
    onResize(): void {
        this.eventMan.raiseEvent(AppWindow.event_resize, null);
    }

    onMove(): void {
        this.eventMan.raiseEvent(AppWindow.event_move, null);
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

    

    setPos(x: number, y: number, storePos: boolean = true): void {
        var outerBoxMargin: number = 8;
        this.moveHandle.style.left = (x - outerBoxMargin).toString() + "px";
        this.moveHandle.style.top = (y - outerBoxMargin).toString() + "px";
        this.x = x;
        this.y = y;
        if (storePos) {
            this.storeX = x;
            this.storeY = y;
        }
        this.onMove();
    }

    setRelativePos(x: number, y: number, storePos: boolean = true): void {
        if (this.state === WindowState.MAXIMIZED || this.state === WindowState.TILED) {
            this.restore();
            this.deltaX = -this.width / 2;
        }
        this.handle.style.left = (x + this.deltaX).toString() + "px";
        this.handle.style.top = (y + this.deltaY).toString() + "px";
        this.x = x + this.deltaX;
        this.y = y + this.deltaY;
        if (storePos) {
            this.storeX = x + this.deltaX;
            this.storeY = y + this.deltaY;
        }
        this.onMove();
    }


    setSize(width: number, height: number, storeSize: boolean = true): void {
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

    setRelativeSize(width: number, height: number, storeSize: boolean = true): void {
        this.sizeHandle.style.width = (width + this.deltaX).toString() + "px";
        this.sizeHandle.style.height = (height + this.deltaY).toString() + "px";
        this.width = width + this.deltaX;
        this.height = height + this.deltaY;
        if (storeSize) {
            this.storeWidth = width + this.deltaX;
            this.storeHeight = height + this.deltaY;
        }
        this.onResize();
    }


    changeStateTo(state: WindowState): void {
        this.prevState = this.state;
        this.state = state;
    }



    restoreSize(): void {
        this.setSize(this.width, this.height, false);
        this.sizeHandle.parentElement.parentElement.style.padding = "8px";

        this.sizeHandle.parentElement.style.width = null;
        this.sizeHandle.parentElement.style.height = null;
        this.sizeHandle.parentElement.parentElement.style.width = null;
        this.sizeHandle.parentElement.parentElement.style.height = null;
    }

    restorePos(): void {
        this.handle.style.left = this.x.toString() + "px";
        this.handle.style.top = this.y.toString() + "px";
    }

    removeSize(): void {
        this.sizeHandle.style.width = "100%";
        this.sizeHandle.style.height = "100%";
        this.sizeHandle.parentElement.style.width = "100%";
        this.sizeHandle.parentElement.style.height = "100%";
        this.sizeHandle.parentElement.parentElement.style.width = "100%";
        this.sizeHandle.parentElement.parentElement.style.height = "100%";
        this.sizeHandle.parentElement.parentElement.style.padding = "0";
        
    }

    removeHeader() {
        (<HTMLElement>this.handle.getElementsByClassName("window-header")[0]).style.display = "none";
    }

    restoreHeader() {
        (<HTMLElement>this.handle.getElementsByClassName("window-header")[0]).style.display = null;
    }

    removePos(): void {
        this.handle.style.left = null;
        this.handle.style.top = null;
    }

    changeWindowMode(mode: WindowMode): void {
        switch (mode) {
            case WindowMode.BORDERLESS:
                this.removeSize();
                this.removePos();
                this.removeHeader();
                break;
            case WindowMode.WINDOWED:
                this.restoreSize();
                this.restorePos();
                this.restoreHeader();
                break;
        }
    }
}

enum WindowMode {
    WINDOWED = 0,
    BORDERLESS = 1,
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