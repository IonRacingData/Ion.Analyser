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
    //kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    kernel.senMan.load("../../Data/Sets/195_usart_data.log16");
    // kernel.senMan.setGlobal(841);

    registerLaunchers();
    registerSensorGroups();


    let mk: HtmlHelper = new HtmlHelper();

    let content: HTMLElement = mk.tag("div", "taskbar-applet");
    let menuContent: HTMLElement = mk.tag("div", "taskbar-applet");
    let themeChange: HTMLElement = mk.tag("div", "taskbar-applet");

    let wl: WindowList = new WindowList(content);
    let menu: MainMenu = new MainMenu(menuContent);
    let theme: ChangeTheme = new ChangeTheme(themeChange);

    let taskbar: Element = document.getElementsByClassName("taskbar")[0];

    taskbar.appendChild(menu.content);
    taskbar.appendChild(theme.content);
    taskbar.appendChild(wl.content);

    document.addEventListener("contextmenu", (e: PointerEvent) => {
        e.preventDefault();
    });



}

interface IMenuItem {
    name: string;
    runner: () => void;
}

function registerSensorGroups() {
    kernel.senMan.registerGroup(PointSensorGroup);
}

function registerLaunchers() {


    

    // kernel.appMan.registerApplication("Data", new Launcher(DataAssignerOld, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(DataAssigner, "Data Assigner"));
    
    kernel.appMan.registerApplication("Data", new Launcher(CsvGenerator, "Csv Creator"));
    //kernel.appMan.registerApplication("Data", new Launcher(DataSourceBuilder, "Data Source Builder"));

    kernel.appMan.registerApplication("Charts", new Launcher(LineChartTester, "Line Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(GaugeTester, "Gauge"));
    kernel.appMan.registerApplication("Charts", new Launcher(GPSPlotTester, "GPS Viewer"));
    kernel.appMan.registerApplication("Charts", new Launcher(LabelTester, "Label"));
    kernel.appMan.registerApplication("Charts", new Launcher(BarTester, "Bar Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(SteeringWheelTester, "Steering Wheel"));
    // kernel.appMan.registerApplication("Charts", new Launcher(TestDataViewer, "Test Viewer"));


    // kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    // kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    // kernel.appMan.registerApplication("Test", new Launcher(SensorSetSelector, "Sensor set Selector"));

    // kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
    // kernel.appMan.registerApplication("Admin", new Launcher(TaskManager, "Task Manager"));

    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    registerGridPresets();
}

function registerGridPresets() {
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Speed and Current", <IGridLanchTemplate>{
        name: "Preset Speed and Current",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["speed", "current"] },
                {
                    data: [
                        { name: "LineChartTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["current"] }]
                }
            ]
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [ { key: "SPEED", name: "../../Data/Sets/126_usart_data.log16" } ]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [ { key: "CURRENT", name: "../../Data/Sets/126_usart_data.log16" } ]
            }
        ]
    }));
}

/* tslint:disable:interface-name */
interface EventTarget extends IEventManager {

}

interface HTMLElement {
    window: AppWindow;
}
/* tslint:enable:interface-name */

class Launcher implements IMenuItem {
    mainFunction: new () => IApplication;
    name: string;
    args: any[];

    constructor(mainFunction: new () => IApplication, name: string, ...args: any[]) {
        this.mainFunction = mainFunction;
        this.name = name;
        this.args = args;
    }

    runner(): void {
        this.createInstance();
    }

    createInstance(): void {
        kernel.appMan.launchApplication(this, ...this.args);
    }
}
