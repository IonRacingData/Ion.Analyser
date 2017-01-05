interface Kernel {
    winMan: WindowManager
    appMan: ApplicationManager
}

interface HTMLElement
{
    window: AppWindow
}

var kernel: Kernel;

window.onload = () => {
    var logViewer = new Launcher(TestViewer, "LogViewer");

    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };


    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    let mk = new HtmlHelper();

    let content = mk.tag("div", "taskbar-applet");
    let menuContent = mk.tag("div", "taskbar-applet");

    let wl = new WindowList(content);
    let menu = new MainMenu(menuContent);

    let taskbar = document.getElementsByClassName("taskbar")[0];

    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);

    document.addEventListener("contextmenu", (e: PointerEvent) => {
        e.preventDefault();
    });
};

class WindowManager
{
    body: HTMLElement;
    template: HTMLTemplateElement;

    dragging: boolean;
    resizing: boolean;

    activeWindow: AppWindow;

    windows: AppWindow[] = [];
    order: AppWindow[] = [];

    events: any = {};

    tileZone = 20;
    topBar = 40;

    constructor(container: HTMLElement)
    {
        this.body = container;

        this.template = <HTMLTemplateElement>document.getElementById("temp-window");

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
    }

    mouseMove(e: MouseEvent): void {
        if (this.dragging) {
            this.activeWindow.setRelativePos(e.pageX, e.pageY);
            var tileZone = this.tileZone;
            var topBar = this.topBar;

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
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    }

    mouseUp(e: MouseEvent): void {
        console.log("Global MouseUp");
        console.log(e);
        this.dragging = false;
        this.resizing = false;
    }

    createWindow(app: Application, title: string): AppWindow
    {
        var window = this.makeWindow(app);
        window.setTitle(title);
        this.registerWindow(window);
        return window;
    }

    makeWindow(app: Application): AppWindow {
        var tempWindow = new AppWindow(app);
        return tempWindow;
    }

    registerWindow(app: AppWindow): void
    {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.raiseEvent("windowOpen");
        this.selectWindow(app);
    }

    makeWindowHandle(appWindow: AppWindow): HTMLElement {
        var div = document.createElement("div");
        div.className = "window-wrapper";
        var clone = <HTMLElement>document.importNode(this.template.content, true);
        div.appendChild(clone);
        return div;
    }

    selectWindow(appWindow: AppWindow) {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.raiseEvent("windowSelect");
    }

    makeTopMost(appWindow: AppWindow): void {
        let index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    }

    closeWindow(app: AppWindow): void {
        this.body.removeChild(app.handle);
        this.windows.splice(this.windows.indexOf(app), 1);
        this.order.splice(this.order.indexOf(app), 1);
        this.raiseEvent("windowClose");
    }

    reorderWindows(): void {
        for (let i = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    }

    addEventListener(type: string, listner: any): void {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listner);
    }

    raiseEvent(type: string): void {
        if (this.events[type]) {
            for (let i = 0; i < this.events[type].length; i++) {
                this.events[type][i]();
            }
        }
        else {
            console.error("event of type: " + type + " does not exist!");
        }
    }

}

class ApplicationManager
{
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = { };

    laucneApplication(launcher: Launcher) {

        var temp = new launcher.mainFunction();
        this.appList.push(new Application(temp));
    }

    registerApplication(category: string, launcher: Launcher)
    {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    }
}

class Application
{
    application: IApplication;
    name: string;

    constructor(app: IApplication) {
        this.application = app;
        app.application = this;
        app.main();
    }

    onClose()
    {

    }
}



class Launcher
{
    mainFunction: new () => IApplication
    name: string;

    constructor(mainFunction: new () => IApplication, name: string)
    {
        this.mainFunction = mainFunction;
        this.name = name;
    }

    createInstance()
    {
        kernel.appMan.laucneApplication(this);
    }
}

interface IApplication
{
    application: Application;
    main(): void;
}

class TestViewer implements IApplication
{
    application: Application;
    window: AppWindow;
    window2: AppWindow;
    main()
    {
        var mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");
        this.window.content.appendChild(mk.tag("h1", "", null, "Hello World"));
    }
}



class GridViewer implements IApplication
{
    application: Application;
    window: AppWindow;

    main()
    {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");

        var template = <HTMLTemplateElement>document.getElementById("temp-grid");
        var clone = document.importNode(template.content, true);
        //console.log(clone);
        this.window.content.appendChild(clone);
        addEvents();
    }
}
