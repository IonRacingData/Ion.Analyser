class GridViewer implements IApplication {
    app: Application;
    window: AppWindow;
    mk: HtmlHelper = new HtmlHelper();
    childWindows: AppWindow[] = [];
    selectorWindow: AppWindow;

    main(temp): void {
        console.log(temp);
        this.window = kernel.winMan.createWindow(this.app, "New Grid");
        if (temp) {
            this.window.maximize();
        }
        this.selectorWindow = kernel.winMan.createWindow(this.app, "Selector");
        this.selectorWindow.showTaskbar = false;
        this.selectorWindow.setSize(92, 92);
        this.selectorWindow.content.style.overflow = "hidden";
        this.selectorWindow.content.style.background = "none";
        this.selectorWindow.remoteShadow();

        this.selectorWindow.changeWindowMode(WindowMode.BORDERLESS);
        this.selectorWindow.topMost = true;
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        this.selectorWindow.hide();

        // (<HTMLElement>this.selectorWindow.handle.getElementsByClassName("window")[0]).style.backgroundColor = null;

        const mk = this.mk;
        this.registerEvents(this.app.events);

        const template: HTMLTemplateElement = document.getElementById("temp-grid") as HTMLTemplateElement;
        const test = new GridHContainer(this);
        const clone = test.baseNode;

        if (temp) {
            this.applyTemplate(temp);
        }
        else {
            this.window.content.appendChild(clone);
        }

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
        let box: GridBox | null = null;
        if (this.selectedContainer.gridBoxes.length === 1 && this.selectedContainer.gridBoxes[0].content.innerHTML.length === 0) {
            box = this.selectedContainer.gridBoxes[0];
        }
        else {
            if (dir === "left") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    const newGridbox = new GridHContainer(this);
                    const child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    const newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "right") {
                if (this.selectedContainer instanceof GridHContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    const newGridbox = new GridHContainer(this);
                    const child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    const newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "up") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildBefore(this.selectedBox);
                }
                else {
                    const newGridbox = new GridVContainer(this);
                    const child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    const newChild = newGridbox.insertChildAfter(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
            else if (dir === "down") {
                if (this.selectedContainer instanceof GridVContainer) {
                    box = this.selectedContainer.insertChildAfter(this.selectedBox);
                }
                else {
                    const newGridbox = new GridVContainer(this);
                    const child = this.selectedBox.content;
                    box = newGridbox.gridBoxes[0];
                    const newChild = newGridbox.insertChildBefore(box);
                    newChild.setContent(child);
                    this.selectedBox.setContent(newGridbox.baseNode);
                }
            }
        }
        if (box === null) {
            throw new Error("Gridbox not set to an actual value");
        }
        const windowBody = kernel.winMan.activeWindow.handle as HTMLElement;
        const window = kernel.winMan.activeWindow;
        window.showTaskbar = false;
        window.changeWindowMode(WindowMode.BORDERLESSFULL);

        this.childWindows.push(window);

        box.content.appendChild(windowBody);

        window.recalculateSize();
        window.onResize({ target: window });
        this.handleResize();
    }

    applyTemplate(gridTemplate: IGridLanchTemplate) {
        console.log(gridTemplate);
        this.window.title = gridTemplate.name;
        const dataSets: { [key: string]: IDataSource<any> } = {};
        for (const a of gridTemplate.sensorsets) {
            const temp = kernel.senMan.createDataSource(a);
            if (temp) {
                dataSets[a.key] = temp;
            }
            else {
                console.log("Failed to create dataset with key: " + a);
            }
        }
        console.log(dataSets);
        this.handleHContainer(gridTemplate.grid, this.window.content, dataSets);
        this.handleResize();
    }

    handleHContainer(template: IGridTemplate, body: HTMLElement, dataSets: { [key: string]: IDataSource<any> }) {
        console.log("HCon");
        console.log(this);
        this.handleContainer(template, body, new GridHContainer(this), this.handleVContainer, dataSets);
    }

    handleVContainer(template: IGridTemplate, body: HTMLElement, dataSets: { [key: string]: IDataSource<any> }) {
        console.log("VCon");
        console.log(this);
        this.handleContainer(template, body, new GridVContainer(this), this.handleHContainer, dataSets);
    }

    handleContainer(
        template: IGridTemplate,
        body: HTMLElement,
        container: GridContainer,
        next: (template: IGridTemplate, body: HTMLElement, dataSets: { [key: string]: IDataSource<any> }) => void,
        dataSets: { [key: string]: IDataSource<any> },
    ) {
        console.log("Con");
        console.log(this);
        let lastBox: GridBox | null = null; // = a.gridBoxes[0];

        for (const temp of template.data) {
            if (lastBox == null) {
                lastBox = container.gridBoxes[0];
            }
            else {
                lastBox = container.insertChildAfter(lastBox);
            }
            if (GridViewer.isIGridLauncher(temp)) {
                const app = kernel.appMan.start(temp.name);
                if (temp.data) {
                    const viewer = app.application as any;
                    console.log(viewer);
                    if (sensys.SensorManager.isViewer(viewer)) {

                        const singleViewer = viewer;
                        if (dataSets[temp.data[0]]) {
                            viewer.dataSource = dataSets[temp.data[0]];
                            kernel.senMan.fillDataSource(dataSets[temp.data[0]], () => {
                                singleViewer.dataUpdate();
                            });
                        }
                    }
                    else if (sensys.SensorManager.isCollectionViewer(viewer)) {
                        const colViewer = viewer;
                        const back = new Multicallback(temp.data.length, () => {
                            viewer.dataUpdate();
                        });
                        for (const name of temp.data) {
                            if (dataSets[name]) {
                                viewer.dataCollectionSource.push(dataSets[name]);
                                kernel.senMan.fillDataSource(dataSets[name], back.createCallback());
                            }
                        }
                    }

                }
                const window = app.windows[0];
                window.showTaskbar = false;
                this.childWindows.push(window);
                window.changeWindowMode(WindowMode.BORDERLESSFULL);
                lastBox.content.appendChild(window.handle);

                window.recalculateSize();
                window.onResize({ target: window });
                this.handleResize();
            }
            else {
                lastBox.box.innerHTML = "";
                next.call(this, temp, lastBox.box, dataSets);
                //next(temp, lastBox.content);
            }
        }
        body.appendChild(container.baseNode);
    }

    static isIGridLauncher(data: any): data is IGridLaucher {
        if (data.name) {
            return true;
        }
        return false;
    }

    static isIGridTemplate(data: any): data is IGridTemplate {
        if (Array.isArray(data.data)) {
            return true;
        }
        return false;
    }

    generateSelector() {
        const mk = this.mk;
        const selector = mk.tag("div", "dock-selector");
        const up = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseUp() }]);
        up.appendChild(mk.tag("div", "dock-up"));
        const left = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseLeft() }]);
        left.appendChild(mk.tag("div", "dock-left"));
        const right = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseRight() }]);
        right.appendChild(mk.tag("div", "dock-right"));
        const down = mk.tag("div", "dock-item dock-active", [{ event: "mouseup", func: (e: MouseEvent) => this.handle_releaseDown() }]);
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
        eh.on(kernel.winMan.onGlobalDrag, (data: IWindowEvent) => this.globalDrag(data));
        eh.on(kernel.winMan.onGlobalUp, (data: IWindowEvent) => this.globalUp(data));
        eh.on(this.window.onClose, () => this.handleClose());

        eh.on(this.window.onResize, () => this.handleResize());
        eh.on(this.window.onMove, () => this.handleMove());
    }

    handleClose() {
        for (const cur of this.childWindows) {
            cur.close();
            // this.childWindows[cur].close();
        }
        this.app.events.close();
        this.selectorWindow.close();
    }

    handleResize() {
        this.selectorWindow.setPos(this.window.x + this.window.width / 2 - 45, this.window.y + this.window.height / 2 - 45);
        for (const cur of this.childWindows) {
            cur.recalculateSize();
            cur.onResize({ target: cur });
            // this.childWindows[cur].recalculateSize();
            // this.childWindows[cur].onResize();
        }
    }

    handleMove() {

    }

    private isMouseEvent(e: any): e is MouseEvent {
        if (e.clientX && e.clientY) {
            return true;
        }
        return false;
    }

    globalDrag(e: IWindowEvent) {
        if (this.isMouseEvent(e.mouse)) {
            const winPos = new Point(e.mouse.clientX - this.window.x - 9, e.mouse.clientY - this.window.y - 39);
            if (winPos.intersects(0, 0, this.window.width, this.window.height)
                && e.window !== this.window) {

                const containers = this.window.handle.getElementsByClassName("grid-con");
                for (let i = containers.length - 1; i >= 0; i--) {
                    const cur = containers[i] as HTMLElement;
                    if (winPos.intersects(
                        cur.offsetLeft,
                        cur.offsetTop,
                        cur.offsetWidth,
                        cur.offsetHeight)) {
                        //console.log(cur);
                        this.selectedContainer = cur.gridContainer;
                        break;
                    }
                }
                const gridBoxes = this.window.handle.getElementsByClassName("grid-box");
                const foundGridWindow: HTMLElement | null = null;
                for (let i = gridBoxes.length - 1; i >= 0; i--) {
                    const cur = gridBoxes[i] as HTMLElement;

                    if (winPos.intersects(cur.offsetLeft, cur.offsetTop, cur.offsetWidth, cur.offsetHeight)) {
                        this.selectedBox = cur.gridBox;
                        this.selectorWindow.setPos(
                            this.getAbsoluteLeft(this.selectedBox.box) + this.selectedBox.box.offsetWidth / 2 - 45
                            , this.getAbsoluteTop(this.selectedBox.box) + this.selectedBox.box.offsetHeight / 2 - 45);
                        // this.selectedBox.box.offsetTop
                        // + (<HTMLElement>(<HTMLElement>this.selectedBox.box.offsetParent).offsetParent).offsetTop +
                        break;
                    }
                }
                this.selectorWindow.show();
                // console.log("global drag grid window: X: " + windowX + " Y: " + windowY);
            }
            else {
                this.selectorWindow.hide();
            }
        }
        else {
            console.log("Got an unhandled touch event in grid system");
        }
    }

    getAbsoluteLeft(ele: HTMLElement): number {
        let left = ele.offsetLeft;
        while (ele.offsetParent !== null) {
            ele = ele.offsetParent as HTMLElement;
            left += ele.offsetLeft;
        }
        return left;
    }
    getAbsoluteTop(ele: HTMLElement): number {
        let top = ele.offsetTop;
        while (ele.offsetParent !== null) {
            ele = ele.offsetParent as HTMLElement;
            top += ele.offsetTop;
        }
        return top;
    }

    selectedContainer: GridContainer;
    selectedBox: GridBox;

    globalUp(e: IWindowEvent) {
        if (this.isMouseEvent(e.mouse)) {
            const winPos = new Point(e.mouse.clientX - this.window.x - 9, e.mouse.clientY - this.window.y - 39);
            if (winPos.intersects(0, 0, this.window.width, this.window.height) && e.window !== this.window) {
                this.selectorWindow.hide();
            }
        }
        else {
            console.log("Got an unhandled touch event in gridsystem, (globalUp)");
        }
    }
}

let test: IGridLanchTemplate = {
    name: "some Grid",
    sensorsets: [ ],
    grid: {
        data: [
            { name: "LineChartTester", data: null },
            {
                data: [
                    { name: "DataAssigner", data: null },
                ],
            },
        ],
    },
};

interface IGridTemplate
{
    data: Array<IGridLaucher | IGridTemplate>;
}

interface IGridLaucher {
    name: string;
    data: string[] | null;
}

interface IGridLanchTemplate {
    name: string;
    grid: IGridTemplate;
    sensorsets: DataSourceTemplate[];
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
    correction: number = 0;
    // last: HTMLElement;

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
        const base = this.mk.tag("div", "grid-con grid-" + cls);
        base.gridContainer = this;
        base.appendChild(this.createChild());
        return base;
    }

    createSeperator(): HTMLElement {
        throw new Error("Not implmeneted exception");
    }

    insertChildBefore(box: GridBox): GridBox {
        return this.insertChild(box, "before");
    }

    insertChildAfter(box: GridBox): GridBox {
        return this.insertChild(box, "after");
    }

    insertChild(box: GridBox, dir: string): GridBox {
        const seperator = this.createSeperator();
        const newTotal = this.gridBoxes.length + 1;
        for (let i = 0; i < this.gridBoxes.length; i++) {
            const cur: number = this.gridBoxes[i][this.dir2];
            const newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        let child: HTMLElement | null = null;
        let insertString = "";
        if (dir === "before") {
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

        // this.baseNode.appendChild(seperator);
        // this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", (e: MouseEvent) => {
            const container = new ResizeContainer(
                seperator,
                this.dir,
                this.offset,
                this.set,
                this.mouse,
                this.appWindow.window[this.pos],
                this.correction,
            );
            if (seperator.parentElement === null) {
                throw new Error("ParrentElement null exception");
            }
            seperator.parentElement.onmousemove = (e: MouseEvent) => {
                this.appWindow.handleResize();
                container.adjustSize(e);
            };
            seperator.parentElement.onmouseup = (e: MouseEvent) => {
                if (seperator.parentElement === null) {
                    throw new Error("ParrentElement null exception");
                }
                seperator.parentElement.onmousemove = () => { };
                seperator.parentElement.onmouseup = () => { };
            };
        });
        return child.gridBox;
    }

    addChild(): GridBox {
        const seperator = this.createSeperator();
        const newTotal = this.gridBoxes.length + 1;
        for (let i = 0; i < this.gridBoxes.length; i++) {
            const cur: number = this.gridBoxes[i][this.dir2];
            const newVal = cur * (newTotal - 1) / newTotal;
            this.gridBoxes[i][this.set](newVal, 6);
        }
        const child = this.createChild();
        child.gridBox[this.set](1 / newTotal, 6);
        this.baseNode.appendChild(seperator);
        this.baseNode.appendChild(child);
        seperator.addEventListener("mousedown", (e: MouseEvent) => {
            const container = new ResizeContainer(
                seperator,
                this.dir,
                this.offset,
                this.set,
                this.mouse,
                this.appWindow.window[this.pos],
                this.correction,
            );
            if (seperator.parentElement === null) {
                throw new Error("ParrentElement null exception");
            }
            seperator.parentElement.onmousemove = (e: MouseEvent) => {
                this.appWindow.handleResize();
                container.adjustSize(e);
            };
            seperator.parentElement.onmouseup = (e: MouseEvent) => {
                if (seperator.parentElement === null) {
                    throw new Error("ParrentElement null exception");
                }
                seperator.parentElement.onmousemove = () => { };
                seperator.parentElement.onmouseup = () => { };
            };
        });
        return child.gridBox;
    }

    resize(gridWindow: HTMLElement, event: MouseEvent, appWindow: AppWindow): void {

    }

    resizeCommon(gridWindow: HTMLElement, event: MouseEvent): void {
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
        const nBox = new GridBox();
        for (let i = 0; i < this.gridBoxes.length; i++) {
            if (this.gridBoxes[i] === box) {
                this.gridBoxes.splice(i + rel, 0, nBox);
                break;
            }
        }
        return nBox.box;
    }

    createChild(): HTMLElement {
        const box = new GridBox();
        this.gridBoxes.push(box);
        return box.box;
    }
}

/* tslint:disable:interface-name */
interface HTMLElement {
    gridBox: GridBox;
    gridContainer: GridContainer;
}
/* tslint:enable:interface-name */

class GridBox {
    box: HTMLElement;
    content: HTMLElement;
    mk: HtmlHelper;
    width: number = 1;
    height: number = 1;
    constructor() {
        const mk = this.mk = new HtmlHelper();
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
    curCor: number;

    constructor(seperator: HTMLElement, dir: string, offset: string, style: string, mouse: string, windowPos: number, correction: number) {
        this.cur = seperator;
        this.offset = offset;
        this.style = style;
        this.dir = dir;
        this.mouse = mouse;
        this.windowPos = windowPos;
        this.curCor = correction;
        this.initialize();
    }

    initialize() {
        this.prev = this.cur.previousElementSibling as HTMLElement;
        this.next = this.cur.nextElementSibling as HTMLElement;

        if (this.cur.parentElement === null) {
            throw new Error("ParrentElement null exception");
        }
        this.total = this.cur.parentElement[this.dir];
        this.part = this.prev[this.dir] + this.next[this.dir] + 12;
        this.start = this.cur[this.offset] + this.windowPos;
        this.correction = this.prev[this.offset] + this.windowPos;
        this.startPercent = (this.start - this.correction) / this.total;
    }

    adjustSize(e: MouseEvent) {
        const curMovement = e[this.mouse] - this.start - this.curCor;

        const curPercentMove = curMovement / this.total;

        const prevWidth = this.startPercent + curPercentMove;
        const nextWidth = (this.part / this.total) - prevWidth;

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
    correction: number = -4;

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
    correction: number = 25;

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
