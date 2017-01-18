var kernel: Kernel;

interface Kernel {
    winMan: WindowManager;
    appMan: ApplicationManager;
    netMan: NetworkManager;
}

function startUp() {
    

    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager()
    };

    registerLaunchers();


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
}

function registerLaunchers() {
    var logViewer: Launcher = new Launcher(TestViewer, "Test Window");

    kernel.appMan.registerApplication("Test", logViewer);
    kernel.appMan.registerApplication("Test", new Launcher(WebSocketTest, "Web Socket Test"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    kernel.appMan.registerApplication("Car", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Car", new Launcher(PlotViewer, "Plot Viewer"));

    kernel.appMan.registerApplication("Administration", new Launcher(TaskManager, "Task Manager"));
}

interface HTMLElement {
    window: AppWindow;
}

class Launcher {
    mainFunction: new () => IApplication;
    name: string;

    constructor(mainFunction: new () => IApplication, name: string) {
        this.mainFunction = mainFunction;
        this.name = name;
    }

    createInstance(): void {
        kernel.appMan.launchApplication(this);
    }
}