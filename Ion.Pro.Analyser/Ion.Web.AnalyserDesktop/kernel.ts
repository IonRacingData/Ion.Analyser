var kernel: IKernel;

interface IKernel {
    winMan: WindowManager;
    appMan: ApplicationManager;
    netMan: NetworkManager;
    senMan: sensys.SensorManager;
}

function startUp() {


    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: null
    };

    kernel.senMan = new sensys.SensorManager();  // Late init because it needs netMan
    kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    // kernel.senMan.setGlobal(841);

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


    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    // kernel.appMan.registerApplication("Data", new Launcher(DataAssignerOld, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(DataAssigner, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(SensorSetSelector, "Sensor set Selector"));
    kernel.appMan.registerApplication("Data", new Launcher(CsvGenerator, "Csv Creator"));

    kernel.appMan.registerApplication("Plot", new Launcher(LineChartTester, "Line Chart Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(GaugeTester, "Gauge Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(GPSPlotTester, "GPSPlot Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(LabelTester, "Label Test"));
    kernel.appMan.registerApplication("Plot", new Launcher(BarTester, "Bar Test"));
    //kernel.appMan.registerApplication("Plot", new Launcher(TestDataViewer, "Test Viewer"));


    kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Test", new Launcher(TaskManager, "Task Manager"));

    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
}

/* tslint:disable:interface-name */
interface EventTarget extends IEventManager {

}

interface HTMLElement {
    window: AppWindow;
}
/* tslint:enable:interface-name */

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
