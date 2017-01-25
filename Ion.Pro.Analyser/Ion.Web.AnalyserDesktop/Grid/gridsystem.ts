class GridViewer implements IApplication {
    application: Application;
    window: AppWindow;
    eh: EventHandler = new EventHandler();
    mk: HtmlHelper = new HtmlHelper();
    childWindows: AppWindow[] = [];

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        var mk = this.mk;
        this.registerEvents(this.eh);

        var template: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("temp-grid");
        //var clone: Node = document.importNode(template.content, true);
        var test = new GridHContainer(this);
        //test.addChild();
        var clone = test.baseNode;
        this.window.content.appendChild(this.mk.tag("button", "", [{ func: (e: Event) => { test.addChild(); }, event: "click" }], "Hello world"));
        this.window.content.appendChild(this.mk.tag("button", "", [{
            func: (e: Event) => {
                var g = test.addChild();
                var tester2 = new GridVContainer(this);
                g.box.innerHTML = "";
                g.box.appendChild(tester2.baseNode);
                tester2.addChild();
            }, event: "click"
        }], "Hello world 2"));
        this.window.content.appendChild(clone); 
        //addEvents();
    }

    registerEvents(eh: EventHandler) {
        eh.on(kernel.winMan, WindowManager.event_globalDrag, (data: IWindowEvent) => this.globalDrag(data));
        eh.on(kernel.winMan, WindowManager.event_globalUp, (data: IWindowEvent) => this.globalUp(data));
        eh.on(this.window, AppWindow.event_close, () => this.handleClose());

        eh.on(this.window, AppWindow.event_resize, () => this.handleResize());
    }

    handleClose() {
        for (var i in this.childWindows) {
            this.childWindows[i].close();
        }
        this.eh.close();
    }

    handleResize() {
        for (var i in this.childWindows) {
            this.childWindows[i].recalculateSize();
            this.childWindows[i].onResize();
        }
    }

    globalDrag(e: IWindowEvent) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0
            && windowY > 0
            && windowX < this.window.width
            && windowY < this.window.height
            && e.window != this.window) {
            console.log("global drag grid window: X: " + windowX + " Y: " + windowY);
        }
    }

    globalUp(e: IWindowEvent) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0 && windowY > 0 && windowX < this.window.width && windowY < this.window.height && e.window != this.window) {
            console.log("grid-window Droped over");
            var gridWindows = this.window.handle.getElementsByClassName("grid-window");
            var foundGridWindow: HTMLElement = null;
            for (var i = 0; i < gridWindows.length; i++) {
                var cur = <HTMLElement>gridWindows[i];
                
                if (windowX > cur.offsetLeft
                    && windowY > cur.offsetTop
                    && windowX < cur.offsetLeft + cur.offsetWidth
                    && windowY < cur.offsetTop + cur.offsetHeight) {
                    foundGridWindow = cur;
                    console.log("grid-window Found grid window X: " + cur.offsetLeft + " Y: " + cur.offsetTop + " Width: " + cur.offsetWidth + " Height: " + cur.offsetHeight);
                    break;
                    //console.log("Found :D X: " + cur.offsetLeft + " Y: " + cur.offsetTop + " Width: " + cur.offsetWidth + " Height: " + cur.offsetHeight);
                }
                else {
                    console.log("grid-window X: " + cur.offsetLeft + " Y: " + cur.offsetTop + " Width: " + cur.offsetWidth + " Height: " + cur.offsetHeight);
                }
                
            }
            console.log("grid-window dropped at: X: " + windowX + " Y: " + windowY);

            if (foundGridWindow && foundGridWindow.innerHTML.length == 0) {

                foundGridWindow.innerHTML = "";
                var windowBody = <HTMLElement>kernel.winMan.activeWindow.handle;//.getElementsByClassName("window-body")[0];
                var window = kernel.winMan.activeWindow;
                window.changeWindowMode(WindowMode.BORDERLESS);
                
                this.childWindows.push(window);
                //windowBody.style.width = "100%";
                //windowBody.style.height = "100%";
                foundGridWindow.appendChild(windowBody);

                window.recalculateSize();
                window.onResize();
            }
            else {
                console.log("grid-window could not find any window, this is a problem");
            }
        }
    }
}

class GridContainer {
    baseNode: HTMLElement;
    mk: HtmlHelper = new HtmlHelper();
    moving: boolean;
    editFunction: (e: MouseEvent) => void;
    appWindow: GridViewer;
    gridBoxes: GridBox[] = [];

    set: string = "setWidth";
    dir: string = "clientWidth";
    
    offset: string = "offsetLeft";
    mouse: string = "clientX";
    dir2: string = "width";
    pos: string = "x";
    //last: HTMLElement;

    constructor(appWindow: GridViewer) {
        this.baseNode = this.create("");
        this.appWindow = appWindow;
        this.baseNode.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.moving) {
                this.editFunction(e);
            }
        });
        this.baseNode.addEventListener("mouseup", (e: MouseEvent) => {
            this.moving = false;
        });
    }

    create(cls: string): HTMLElement {

        var base = this.mk.tag("div", "grid-" + cls);
        
        base.appendChild(this.createChild());
        return base;
    }

    createSeperator(): HTMLElement {
        return null;
    }

    addChild(): GridBox {

        let seperator = this.createSeperator();
        let newTotal = this.gridBoxes.length + 1;
        for (let i = 0; i < this.gridBoxes.length; i++) {
            let cur: number = this.gridBoxes[i][this.dir2];
            let newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        let child = this.createChild();
        child.gridBox[this.set](1 / newTotal, 6);
        this.baseNode.appendChild(seperator);
        this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", (e: MouseEvent) => {
            let container = new ResizeContainer(seperator, this.dir, this.offset, this.set, this.mouse, this.appWindow.window[this.pos]);

            seperator.parentElement.onmousemove = (e: MouseEvent) => {
                this.appWindow.handleResize();
                container.adjustSize(e);
            };
            seperator.parentElement.onmouseup = (e: MouseEvent) => {
                seperator.parentElement.onmousemove = null;
                seperator.parentElement.onmouseup = null
            }

            //this.editFunction = (e: MouseEvent) => {
            //    this.resize(child, e, this.appWindow);
            //};
            //this.moving = true;
        });
        return child.gridBox;
    }
    
    resize(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {

    }

    resizeCommon(gridWindow: HTMLElement, event: MouseEvent): void{
        gridWindow.style.flexGrow = "0";
        gridWindow.style.flexBasis = "unset";
    }

    createChild(): HTMLElement {
        var box = new GridBox();
        this.gridBoxes.push(box);
        return box.box;
    }
}

interface HTMLElement {
    gridBox: GridBox;
}

class GridBox {
    box: HTMLElement;
    content: HTMLElement;
    mk: HtmlHelper;
    width: number = 1;
    height: number = 1;
    constructor() {
        let mk = this.mk = new HtmlHelper();
        this.box = mk.tag("div", "grid-box");
        this.box.gridBox = this;
        this.box.appendChild(mk.tag("div", "grid-window"));
    }

    setWidth(percent: number, correction: number = 0) {
        this.width = percent;
        this.box.style.width = "calc(" + (percent * 100).toString() + "% - " + correction.toString() + "px)";
    }

    setHeight(percent: number, correction: number = 0) {
        this.height = percent;
        this.box.style.height = "calc(" + (percent * 100).toString() + "% - " + correction.toString() + "px)";
    }
}

class ResizeContainer {
    cur: HTMLElement;
    prev: HTMLElement;
    next: HTMLElement;
    total: number;
    part: number;
    start: number;
    correction: number;
    startPercent: number;

    dir: string;
    offset: string;
    style: string;
    mouse: string;
    windowPos: number;

    constructor(seperator: HTMLElement, dir: string, offset: string, style: string, mouse: string, windowPos: number) {
        this.cur = seperator;
        this.offset = offset;
        this.style = style;
        this.dir = dir;
        this.mouse = mouse;
        this.windowPos = windowPos;
        this.initialize();
    }

    initialize() {
        this.prev = <HTMLElement>this.cur.previousElementSibling;
        this.next = <HTMLElement>this.cur.nextElementSibling;

        this.total = this.cur.parentElement[this.dir];
        this.part = this.prev[this.dir] + this.next[this.dir] + 12;
        this.start = this.cur[this.offset] + this.windowPos;
        this.correction = this.prev[this.offset] + this.windowPos;
        this.startPercent = (this.start - this.correction) / this.total;
    }

    adjustSize(e: MouseEvent) {
        let curMovement = e[this.mouse] - this.start;

        let curPercentMove = curMovement / this.total;

        let prevWidth = this.startPercent + curPercentMove;
        let nextWidth = (this.part / this.total) - prevWidth;
        

        this.prev.gridBox[this.style](prevWidth, 6);
        this.next.gridBox[this.style](nextWidth, 6);
    }
}

class GridHContainer extends GridContainer {

    set: string = "setWidth";
    dir: string = "clientWidth";

    offset: string = "offsetLeft";
    mouse: string = "clientX";
    dir2: string = "width";
    pos: string = "x";

    constructor(appWindow: GridViewer) {
        super(appWindow);
    }

    create(): HTMLElement {
        return super.create("hcon");
    }

    createSeperator(): HTMLElement {
        return this.mk.tag("div", "grid-hdiv", null, "&nbsp;");
    }

    resize(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {
        console.log(event);
        gridWindow.style.width = (appWindow.width - (event.clientX - appWindow.x) - 4) + "px";
        super.resizeCommon(gridWindow, event);
    }
}

class GridVContainer extends GridContainer {
    set: string = "setHeight";
    dir: string = "clientHeight";

    offset: string = "offsetTop";
    mouse: string = "clientY";
    dir2: string = "height";
    pos: string = "y";

    constructor(appWindow: GridViewer) {
        super(appWindow);
    }

    create(): HTMLElement {
        return super.create("vcon");
    }

    createSeperator(): HTMLElement {
        return this.mk.tag("div", "grid-vdiv", null, "&nbsp;");
    }

    resize(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {
        gridWindow.style.height = (appWindow.height - (event.clientY - appWindow.y) - 4 + 30) + "px";
        super.resizeCommon(gridWindow, event);
    }
}

function addEvents() {
    var bar1 = document.getElementById("bar1");
    var bar2 = document.getElementById("bar2");
    var window1 = document.getElementById("window1");
    var window2 = document.getElementById("window2");
    var container: AppWindow;

    var editFunction: (event: MouseEvent) => void;

    var moving = false;

    window.addEventListener("mousemove", function (event: MouseEvent) {
        if (moving) {
            editFunction(event);
        }
    });

    window.addEventListener("mouseup", function (event: MouseEvent) {
        moving = false;
        document.body.style.cursor = null;
    });

    var innerGrid = window1.getElementsByClassName("grid-window")[0];

    /*var firstGrid = document.getElementById("dropbox");
    firstGrid.addEventListener("mouseup", function (event: MouseEvent) {
        console.log("Release");
        innerGrid.innerHTML = "";
        var windowBody = <HTMLElement>kernel.winMan.activeWindow.handle;//.getElementsByClassName("window-body")[0];
        kernel.winMan.activeWindow.changeWindowMode(WindowMode.BORDERLESS);
        //windowBody.style.width = "100%";
        //windowBody.style.height = "100%";
        innerGrid.appendChild(windowBody);
    });*/


    bar1.addEventListener("mousedown", function (event: MouseEvent) {
        container = findWindow(<HTMLElement>this);
        editFunction = function (event) {

            resizeHeight(window1, event, container);
        }
        document.body.style.cursor = "ns-resize";
        moving = true;
    });
    bar2.addEventListener("mousedown", function (event: MouseEvent) {
        container = findWindow(<HTMLElement>this);
        
        editFunction = function handle(event) {
            
            console.log(container);
            console.log(event);
            resizeWidth(window2, event, container);

        }
        document.body.style.cursor = "ew-resize";
        moving = true;
    });
}

function findWindow(element: HTMLElement): AppWindow {
    var temp = element.window;
    while (temp == null && element != null) {
        element = element.parentElement;
        temp = element.window;
    }
    return temp;
}

function resizeWidth(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void{
    gridWindow.style.width = (appWindow.width - (event.clientX - appWindow.x) - 4) + "px";
    resizeCommon(gridWindow, event);
}

function resizeHeight(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {
    gridWindow.style.height = (appWindow.height - (event.clientY - appWindow.y) - 4 + 30) + "px";
    resizeCommon(gridWindow, event);
}

function resizeCommon(gridWindow: HTMLElement, event: MouseEvent): void {
    gridWindow.style.flexGrow = "0";
    gridWindow.style.flexBasis = "unset";
}