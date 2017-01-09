interface Kernel {
    winMan: WindowManager;
    appMan: ApplicationManager;
}

interface HTMLElement {
    window: AppWindow;
}

var kernel: Kernel;

function requestAction(action: string, callback: (data: any) => void): void {
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = () => {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.response);
        }
    }
    request.open("GET", "/test/" + action, true);
    request.send();
}



window.addEventListener("load", () => {
    var logViewer: Launcher = new Launcher(TestViewer, "Test Window");

    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };


    kernel.appMan.registerApplication("Test", logViewer);
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
    kernel.appMan.registerApplication("Administration", new Launcher(TaskManager, "Task Manager"));

    let mk: HtmlHelper = new HtmlHelper();

    let content: HTMLElement = mk.tag("div", "taskbar-applet");
    let menuContent: HTMLElement = mk.tag("div", "taskbar-applet");

    let wl: WindowList = new WindowList(content);
    let menu: MainMenu = new MainMenu(menuContent);

    let taskbar: Element = document.getElementsByClassName("taskbar")[0];

    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);

    document.addEventListener("contextmenu", (e: PointerEvent) => {
        e.preventDefault();
    });
});

class WindowManager {
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

    constructor(container: HTMLElement) {
        this.body = container;

        this.template = <HTMLTemplateElement>document.getElementById("temp-window");

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
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

    createWindow(app: Application, title: string): AppWindow {
        var window: AppWindow = this.makeWindow(app);
        window.setTitle(title);
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
        this.raiseEvent("windowOpen");
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
        this.raiseEvent("windowSelect");
    }

    makeTopMost(appWindow: AppWindow): void {
        let index: number = this.order.indexOf(appWindow);
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
        for (let i: number = 0; i < this.order.length; i++) {
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
            for (let i: number = 0; i < this.events[type].length; i++) {
                this.events[type][i]();
            }
        }
        else {
            console.error("event of type: " + type + " does not exist!");
        }
    }

}

class ApplicationManager {
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = {};    

    launceApplication(launcher: Launcher): void {
        var temp: IApplication = new launcher.mainFunction();
        this.appList.push(new Application(temp));
    }

    registerApplication(category: string, launcher: Launcher): void {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    }
}

class Application {
    application: IApplication;
    name: string;

    constructor(app: IApplication) {
        this.application = app;
        app.application = this;
        app.main();
    }

    onClose(): void {
        console.log("Empty close function");
    }
}



class Launcher {
    mainFunction: new () => IApplication;
    name: string;

    constructor(mainFunction: new () => IApplication, name: string) {
        this.mainFunction = mainFunction;
        this.name = name;
    }

    createInstance(): void {
        kernel.appMan.launceApplication(this);
    }
}

interface IApplication {
    application: Application;
    main(): void;
}

interface IHelloPackage {
    Text: string;
}

class TestViewer implements IApplication {
    application: Application;
    window: AppWindow;
    window2: AppWindow;
    helloData: IHelloPackage;
    mk: HtmlHelper;

    main(): void {
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");

        requestAction("hello", (data: IHelloPackage) => {
            this.helloData = data;
            this.draw();
        });
    }

    draw(): void {
        this.window.content.innerHTML = "";
        this.window.content.appendChild(this.mk.tag("h1", "", null, "Hello World"));
    }
}



