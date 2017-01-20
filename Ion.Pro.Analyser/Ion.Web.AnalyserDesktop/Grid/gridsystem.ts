﻿class GridViewer implements IApplication {
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
        var test = new GridHContainer();
        var clone = test.baseNode;
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

            if (foundGridWindow) {
                foundGridWindow.innerHTML = "";
                var windowBody = <HTMLElement>kernel.winMan.activeWindow.handle;//.getElementsByClassName("window-body")[0];
                var window = kernel.winMan.activeWindow;
                window.changeWindowMode(WindowMode.BORDERLESS);
                this.childWindows.push(window);
                //windowBody.style.width = "100%";
                //windowBody.style.height = "100%";
                foundGridWindow.appendChild(windowBody);
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

    constructor() {
        this.create("");
    }

    create(cls: string): HTMLElement {

        this.baseNode = this.mk.tag("div", "grid-" + cls);
        var box = this.mk.tag("div", "grid-box");
        var win = this.mk.tag("div", "grid-window");
        box.appendChild(win);
        this.baseNode.appendChild(box);
        return this.baseNode;
    }
}

class GridHContainer extends GridContainer {

    create(): HTMLElement {
        return super.create("hcon");
    }
}

class GridVContainer extends GridContainer {
    create(): HTMLElement {
        return super.create("vcon");
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