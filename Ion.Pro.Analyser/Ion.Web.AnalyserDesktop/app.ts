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
    kernel.appMan.registerApplication("Test", new Launcher(WebSocketTest, "Web Socket Test"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    kernel.appMan.registerApplication("Car", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Car", new Launcher(PlotViewer, "Plot Viewer"));

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

    eventManager: EventManager;

    events: any = {};

    tileZone = 20;
    topBar = 40;

    addEventListener2: (type: string, listner: any) => void;

    static event_globalDrag = "globalDrag";
    static event_globalUp = "globalUp;"

    static event_windowOpen = "windowOpen";
    static event_windowSelect = "windowSelect";
    static event_windowClose = "windowClose";

    constructor(container: HTMLElement) {
        this.body = container;

        this.template = <HTMLTemplateElement>document.getElementById("temp-window");

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
        this.eventManager = new EventManager();
        //this.addEventListener = this.eventManager.addEventListener;
        //this.addEventListener2 = this.eventManager.addEventListener;
        //addEventListener
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

            this.raiseEvent(WindowManager.event_globalDrag, { window: this.activeWindow, mouse: e });
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    }

    mouseUp(e: MouseEvent): void {
        console.log(e);
        this.dragging = false;
        this.resizing = false;
        this.raiseEvent(WindowManager.event_globalUp, { window: this.activeWindow, mouse: e });
    }

    createWindow(app: Application, title: string): AppWindow {
        var window: AppWindow = this.makeWindow(app);
        window.setTitle(title);
        app.windows.push(window);
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
        this.raiseEvent(WindowManager.event_windowOpen, null);
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
        this.raiseEvent(WindowManager.event_windowSelect, null);
    }

    makeTopMost(appWindow: AppWindow): void {
        let index: number = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    }

    closeWindow(appWindow: AppWindow): void {
        this.body.removeChild(appWindow.handle);
        this.windows.splice(this.windows.indexOf(appWindow), 1);
        this.order.splice(this.order.indexOf(appWindow), 1);
        appWindow.app.windows.splice(appWindow.app.windows.indexOf(appWindow), 1);
        this.raiseEvent(WindowManager.event_windowClose, null);
    }

    reorderWindows(): void {
        for (let i: number = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    }

    addEventListener(type: string, listner: any): void {
        this.eventManager.addEventListener(type, listner);
    }

    raiseEvent(type: string, data: any): void {
        this.eventManager.raiseEvent(type, data);
    }

}

class EventData {
    
}

interface IWindowEvent {
    window: AppWindow;
    mouse: MouseEvent;
}

class EventManager {
    events: { [type: string]: ((e: any) => void)[] } = { };

    addEventListener(type: string, listener: any): void {
        console.log("secondStep");
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
    }

    raiseEvent(type: string, data: EventData): boolean {
        if (this.events[type]) {
            var temp = this.events[type];
            for (var i = 0; i < temp.length; i++){
                temp[i](data);
            }
            return true;
        }
        //console.error("event of type: " + type + " does not exist!");
        return false;
    }
}

class ApplicationManager {
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = {};
    eventManager: EventManager = new EventManager(); 
    nextPID: number = 0;

    static event_appLaunch = "appLaunch";
    static event_appClose = "appClose";

    launchApplication(launcher: Launcher): void {
        var temp: IApplication = new launcher.mainFunction();
        var appTemp = new Application(temp);
        appTemp.name = launcher.name;
        appTemp.pid = this.nextPID++;
        this.appList.push(appTemp);

        appTemp.start();
        this.eventManager.raiseEvent(ApplicationManager.event_appLaunch, null); 
    }

    registerApplication(category: string, launcher: Launcher): void {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    }

    addEventListener(type: string, listener: any): void {
        this.eventManager.addEventListener(type, listener);           
    }

    closeApplication(app: Application): void {
        this.appList.splice(this.appList.indexOf(app), 1);
        this.eventManager.raiseEvent(ApplicationManager.event_appClose, null);       
    }
}

class Application {
    application: IApplication;
    name: string;
    pid: number;
    windows: AppWindow[] = [];

    constructor(app: IApplication) {
        this.application = app;
        app.application = this;
    }

    start(): void {
        this.application.main();
    }

    onClose(): void {
        if (this.windows.length == 1) {
            kernel.appMan.closeApplication(this);
        }
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
        kernel.appMan.launchApplication(this);
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

interface ISensorPackage {
    ID: number;
    Value: number;
    TimeStamp: number;
}

interface Google {
    charts: Chart;
    visualization: Visualization;
}

interface Chart {
    load(plot: string, data: any);
    setOnLoadCallback(callback: () => void);
}

interface Visualization {
    arrayToDataTable(data: any): any;
    LineChart: new (node: Node) => LineChart;
}

interface LineChart {
    draw(data: any, options: any);
}

var google: Google;


class DataViewer implements IApplication {
    application: Application;
    window: AppWindow;
    data: ISensorPackage[];
    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        requestAction("GetIds", (data: number[]) => this.draw(data));
    }



    draw(data: number[]): void {
        var mk = new HtmlHelper();
        for (var i = 0; i < data.length; i++){
            let curValue = data[i];
            var a = <HTMLAnchorElement>mk.tag("span", "taskbar-button-text", null, curValue.toString());
            
            a.onclick = () => {
                requestAction("GetData?number=" + curValue.toString(), (data: ISensorPackage[]) => this.drawInner(data))
            };
            this.window.content.appendChild(a);
        }
        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
    }

    drawInner(data: ISensorPackage[]): void {
        this.innerTable.innerHTML = "";
        var gen = new HtmlTableGen("table");
        gen.addHeader("ID", "Value", "Timestamp");
        this.data = data;
        for (var i = 0; i < 10; i++) {
            gen.addRow(data[i].ID, data[i].Value, data[i].TimeStamp);
        }
        //gen.addArray(data, ["ID", "Value", "TimeStamp"]);
        
        this.innerTable.appendChild(gen.generate());
    }
}

class PlotViewer implements IApplication {
    application: Application;
    window: AppWindow;
    innerChart: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Plot window");
        this.innerChart = document.createElement("div");
        this.window.content.appendChild(this.innerChart);

        google.charts.load("current", { "packages": ["corechart"] });
        google.charts.setOnLoadCallback(() => this.loadData());

    }

    loadData() {
        requestAction("getdata?number=61457", (data: ISensorPackage[]) => this.drawChart(data));
    }

    drawChart(sensorData: ISensorPackage[]): void {

        var preData: any[][] = [["Time stamp", "Value"]];
        for (var i = 1; i < 30; i++) {
            preData[i] = [(sensorData[i].TimeStamp / 1000).toString() + "s", sensorData[i].Value];
        }
        var data = google.visualization.arrayToDataTable(preData);
        /*var data = google.visualization.arrayToDataTable([
            ["Year", "Sales", "Expenses"],
            ["2004", 1000, 400],
            ['2005', 1170, 460],
            ['2006', 660, 1120],
            ['2007', 1030, 540]
        ]);*/

        var options = {
            title: "Sensor package 61457",
            curveType: "function",
            legende: { position: "bottom" }
        };

        var chart = new google.visualization.LineChart(this.innerChart);
        chart.draw(data, options);
    }
}

class WebSocketTest implements IApplication{
    application: Application;
    window: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Web Socket test");

        let socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");

        socket.onmessage = (ev: MessageEvent) => {
            console.log(ev);
            console.log(ev.data);
        }

        socket.onopen = (ev: Event) => {
            socket.send("Hello World from a web socket :D");
        }
    }

}
