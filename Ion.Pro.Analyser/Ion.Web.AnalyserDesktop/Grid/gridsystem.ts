class GridViewer implements IApplication {
    application: Application;
    window: AppWindow;
    eh: EventHandler = new EventHandler();
    mk: HtmlHelper = new HtmlHelper();
    childWindows: AppWindow[] = [];
    selectorWindow: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        this.selectorWindow = kernel.winMan.createWindow(this.application, "Selector");
        this.selectorWindow.setSize(92, 92);
        this.selectorWindow.content.style.overflow = "hidden";
        this.selectorWindow.changeWindowMode(WindowMode.BORDERLESS);
        this.selectorWindow.topMost = true;
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        this.selectorWindow.hide();
        //(<HTMLElement>this.selectorWindow.handle.getElementsByClassName("window")[0]).style.backgroundColor = null;

        var mk = this.mk;
        this.registerEvents(this.eh);

        var template: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("temp-grid");
        var test = new GridHContainer(this);
        var clone = test.baseNode;

        this.window.content.appendChild(clone);
        this.generateSelector();
        this.selectedContainer = test;
    }

    handle_releaseUp() {
        this.handle_release("up");
    }

    handle_releaseDown() {
        this.handle_release("down");
    }

    handle_releaseRight() {
        this.handle_release("right");
    }

    handle_releaseLeft() {
        this.handle_release("left");
    }

    handle_release(dir: string) {
        let box = null;
        if (this.selectedContainer.gridBoxes.length == 1 && this.selectedContainer.gridBoxes[0].content.innerHTML.length == 0) {
            box = this.selectedContainer.gridBoxes[0];
        }
        else {
            if (dir == "left") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    let newGridbox = new GridHContainer(this);
                    let child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    let newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir == "right") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    let newGridbox = new GridHContainer(this);
                    let child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    let newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir == "up") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    let newGridbox = new GridVContainer(this);
                    let child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    let newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir == "down") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    let newGridbox = new GridVContainer(this);
                    let child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    let newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
        }
        var windowBody = <HTMLElement>kernel.winMan.activeWindow.handle;
        var window = kernel.winMan.activeWindow;
        window.changeWindowMode(WindowMode.BORDERLESSFULL);

        this.childWindows.push(window);
        box.content.appendChild(windowBody);

        window.recalculateSize();
        window.onResize();
        this.handleResize();
    }

    generateSelector() {
        let mk = this.mk;
        let selector = mk.tag("div", "dock-selector");
        let up = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseUp() }]);
        up.appendChild(mk.tag("div", "dock-up")); 
        let left = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseLeft() }]);
        left.appendChild(mk.tag("div", "dock-left"));
        let right = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseRight() }]);
        right.appendChild(mk.tag("div", "dock-right"));
        let down = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseDown() }]);
        down.appendChild(mk.tag("div", "dock-down"));

        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(up);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(left);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(right);
        selector.appendChild(mk.tag("div", "dock-item"));
        selector.appendChild(down);
        selector.appendChild(mk.tag("div", "dock-item"));
        this.selectorWindow.content.appendChild(selector);
    }

    registerEvents(eh: EventHandler) {
        eh.on(kernel.winMan, WindowManager.event_globalDrag, (data: IWindowEvent) => this.globalDrag(data));
        eh.on(kernel.winMan, WindowManager.event_globalUp, (data: IWindowEvent) => this.globalUp(data));
        eh.on(this.window, AppWindow.event_close, () => this.handleClose());

        eh.on(this.window, AppWindow.event_resize, () => this.handleResize());
        eh.on(this.window, AppWindow.event_move, () => this.handleMove());
    }

    handleClose() {
        for (var i in this.childWindows) {
            this.childWindows[i].close();
        }
        this.eh.close();
        this.selectorWindow.close();
    }

    handleResize() {
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        for (var i in this.childWindows) {
            this.childWindows[i].recalculateSize();
            this.childWindows[i].onResize();
        }
    }

    handleMove() {
        
    }

    globalDrag(e: IWindowEvent) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0
            && windowY > 0
            && windowX < this.window.width
            && windowY < this.window.height
            && e.window != this.window) {

            var containers = this.window.handle.getElementsByClassName("grid-con");
            for (let i = containers.length - 1; i >= 0; i--) {
                let cur = <HTMLElement>containers[i];
                if (windowX > cur.offsetLeft
                    && windowY > cur.offsetTop
                    && windowX < cur.offsetLeft + cur.offsetWidth
                    && windowY < cur.offsetTop + cur.offsetHeight) {
                    console.log(cur);
                    this.selectedContainer = cur.gridContainer;
                    break;
                }
            }

            var gridBoxes = this.window.handle.getElementsByClassName("grid-box");
            var foundGridWindow: HTMLElement = null;
            for (let i = gridBoxes.length - 1; i >= 0; i--) {
                let cur = <HTMLElement>gridBoxes[i];

                if (windowX > cur.offsetLeft
                    && windowY > cur.offsetTop
                    && windowX < cur.offsetLeft + cur.offsetWidth
                    && windowY < cur.offsetTop + cur.offsetHeight) {
                    this.selectedBox = cur.gridBox;
                    this.selectorWindow.setPos(
                        this.getAbsoluteLeft(this.selectedBox.box) + this.selectedBox.box.offsetWidth / 2 - 45
                        , this.getAbsoluteTop(this.selectedBox.box) + this.selectedBox.box.offsetHeight / 2 - 45);
                    //this.selectedBox.box.offsetTop + (<HTMLElement>(<HTMLElement>this.selectedBox.box.offsetParent).offsetParent).offsetTop +
                    break;
                }
            }
            this.selectorWindow.show();

            //console.log("global drag grid window: X: " + windowX + " Y: " + windowY);
        }
        else {
            this.selectorWindow.hide();
        }
    }

    getAbsoluteLeft(ele: HTMLElement): number {
        let left = ele.offsetLeft;
        while (ele.offsetParent !== null) {
            ele = <HTMLElement>ele.offsetParent;
            left += ele.offsetLeft;
        }
        return left;
    }
    getAbsoluteTop(ele: HTMLElement): number {
        let top = ele.offsetTop;
        while (ele.offsetParent !== null) {
            ele = <HTMLElement>ele.offsetParent;
            top += ele.offsetTop;
        }
        return top;
    }

    selectedContainer: GridContainer;
    selectedBox: GridBox;

    globalUp(e: IWindowEvent) {
        var windowX = e.mouse.clientX - this.window.x - 9;
        var windowY = e.mouse.clientY - this.window.y - 39;
        if (windowX > 0 && windowY > 0 && windowX < this.window.width && windowY < this.window.height && e.window != this.window) {
            this.selectorWindow.hide();
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
        var base = this.mk.tag("div", "grid-con grid-" + cls);
        base.gridContainer = this;
        base.appendChild(this.createChild());
        return base;
    }

    createSeperator(): HTMLElement {
        return null;
    }

    insertChildBefore(box: GridBox): GridBox {
        return this.insertChild(box, "before");
    }

    insertChildAfter(box: GridBox): GridBox {
        return this.insertChild(box, "after");
    }

    insertChild(box: GridBox, dir: string): GridBox {
        let seperator = this.createSeperator();
        let newTotal = this.gridBoxes.length + 1;
        for (let i = 0; i < this.gridBoxes.length; i++) {
            let cur: number = this.gridBoxes[i][this.dir2];
            let newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        let child = null;
        let insertString = "";
        if (dir == "before") {
            child = this.createChildBefore(box);
            insertString = "beforebegin";
        }
        else {
            child = this.createChildAfter(box);
            insertString = "afterend";
        }

        box.box.insertAdjacentElement(insertString, child);
        box.box.insertAdjacentElement(insertString, seperator);

        child.gridBox[this.set](1 / newTotal, 6);

        //this.baseNode.appendChild(seperator);
        //this.baseNode.appendChild(child);
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
        });
        return child.gridBox;
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
        });
        return child.gridBox;
    }
    
    resize(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {

    }

    resizeCommon(gridWindow: HTMLElement, event: MouseEvent): void{
        gridWindow.style.flexGrow = "0";
        gridWindow.style.flexBasis = "unset";
    }

    createChildAfter(box: GridBox): HTMLElement {
        return this.createRelativeChild(box, 1);
    }

    createChildBefore(box: GridBox): HTMLElement {
        return this.createRelativeChild(box, 0);
    }

    createRelativeChild(box: GridBox, rel: number) {
        var nBox = new GridBox();
        for (let i = 0; i < this.gridBoxes.length; i++) {
            if (this.gridBoxes[i] == box) {
                this.gridBoxes.splice(i + rel, 0, nBox);
                break;
            }
        }
        return nBox.box;
    }

    createChild(): HTMLElement {
        var box = new GridBox();
        this.gridBoxes.push(box);
        return box.box;
    }
}

interface HTMLElement {
    gridBox: GridBox;
    gridContainer: GridContainer;
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
        this.content = mk.tag("div", "grid-window");
        this.box.appendChild(this.content);
    }

    setContent(element: HTMLElement) {
        this.box.innerHTML = "";
        this.content = element;
        this.box.appendChild(element);
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