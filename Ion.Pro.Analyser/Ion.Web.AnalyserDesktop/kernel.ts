var kernel: IKernel;

interface IKernel {
    winMan: WindowManager;
    appMan: ApplicationManager;
    netMan: NetworkManager;
    senMan: sensys.SensorManager;
}

class Component {
    public wrapper: HTMLElement;
}

class Button extends Component {

    private textNode: Text;

    get text(): string {
        if (this.textNode.nodeValue)
            return this.textNode.nodeValue;
        else
            throw "textNode.nodeValue is null";
    }
    set text(value: string) {
        this.textNode.nodeValue = value;
    }

    constructor() {
        super();
        this.wrapper = document.createElement("div");
        let span = document.createElement("span");
        this.wrapper.className = "comp-button";
        this.textNode = document.createTextNode("button");
        span.appendChild(this.textNode);
        this.wrapper.appendChild(span);
        this.wrapper.onclick = this.onclick;
    }

    onclick = newEvent("Button.onclick");   
}

class ListBox extends Component {

    private __data: any[];
    public selector: (<T>(obj: T) => string) | null = null;

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        /*let oldPush = data.push;
        let box = this;
        data.push = function push(...items: any[]): number {
            let num = oldPush.apply(data, items);
            box.generateList();
            return num;
        }*/
        this.generateList();
    }

    onItemClick = newEvent<IDataEvent<any>>("ListBox.onItemClick");

    constructor() {
        super();
        this.wrapper = document.createElement("ul");
        this.wrapper.className = "comp-listBox";
    }

    public update() {
        this.generateList();
    }

    private generateList() {
        this.wrapper.innerHTML = "";
        for (let v of this.__data) {
            let row = document.createElement("li");

            row.onclick = () => {
                this.onItemClick(v);
            }
            let txt: string | null = null;
            if (this.selector) {
                txt = this.selector(v);
            }
            else {
                txt = (<object>v).toString();
            }

            row.appendChild(document.createTextNode(txt));
            this.wrapper.appendChild(row);
        }
    }
}

interface IDataEvent<T> extends IEventData {
    data: T;
}

class TableList extends Component {
    private __data: any[];
    private __header: string[] = [];

    public selector: (<T>(obj: T) => string[]) | null = null;

    onItemClick = newEvent<IDataEvent<any>>("TabelList.onItemClick");

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        this.generateList();
    }

    get header(): string[] {
        return this.__header;
    }
    set header(headers: string[]) {
        this.__header = headers;
        this.generateHeader();
    }

    tableHeader: HTMLTableSectionElement;
    tableBody: HTMLTableSectionElement;

    constructor() {
        super();
        this.wrapper = document.createElement("table");
        this.wrapper.className = "table selectable";
        this.tableHeader = document.createElement("thead");
        this.tableBody = document.createElement("tbody");
        this.wrapper.appendChild(this.tableHeader);
        this.wrapper.appendChild(this.tableBody);
    }

    public update() {
        this.generateList();
    }

    private generateHeader() {
        this.tableHeader.innerHTML = "";
        let tr = document.createElement("tr");
        this.tableHeader.appendChild(tr);
        for (let v of this.__header) {
            let headerItem = document.createElement("th");
            headerItem.appendChild(document.createTextNode(v));
            tr.appendChild(headerItem);
        }
    }

    private generateList() {
        this.tableBody.innerHTML = "";
        for (let v of this.__data) {
            let row = document.createElement("tr");
            

            row.onclick = () => {
                this.onItemClick({ target: this, data: v });
            }
            let txt: string[] = [];
            if (this.selector) {
                txt = this.selector(v);
            }
            else {
                txt = [(<object>v).toString()];
            }
            for (let d of txt) {
                let cell = document.createElement("td");
                cell.appendChild(document.createTextNode(d));
                row.appendChild(cell);
            }
            this.tableBody.appendChild(row);
        }
    }
}

interface IExpandableListSection {
    title: string;
    items: IExpandableListItem[];
}

interface IExpandableListItem {
    text: string;
    object: any;
}

class ExpandableList extends Component {
    private __data: any[];
    private mk: HtmlHelper = new HtmlHelper();

    public selector: (<T>(obj: T) => IExpandableListSection) | null = null;

    onItemClick = newEvent<IDataEvent<any>>("ExpandableList.onItemClick");

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;        
        this.generateList();
    } 

    constructor() {
        super();
        this.wrapper = document.createElement("div");
        this.wrapper.className = "comp-expList";
    }

    public update() {
        this.generateList();
    }

    private generateList() {
        let mk = this.mk;
        this.wrapper.innerHTML = "";
        for (let d of this.__data) {
            let section: HTMLElement = mk.tag("div", "comp-expList-section");
            let clicker: HTMLElement = mk.tag("div", "comp-expList-clicker");
            let collapsible: HTMLElement = mk.tag("div", "comp-expList-collapsible");
            collapsible.style.maxHeight = "0px";
            let list: HTMLElement = document.createElement("ul");
            
            this.wrapper.appendChild(section);
            section.appendChild(clicker);
            section.appendChild(collapsible);
            collapsible.appendChild(list);

            let title: string;
            let items: IExpandableListItem[] = [];
            if (this.selector) {
                title = this.selector(d).title;
                items = this.selector(d).items;
            }
            else {
                title = (<object>d).toString();                
            }

            clicker.appendChild(document.createTextNode(title));
            for (let i of items) {
                let li: HTMLElement = document.createElement("li");
                li.appendChild(document.createTextNode(i.text));
                list.appendChild(li);

                li.onclick = () => {
                    this.onItemClick({ target: this, data: i.object });                    
                }
            }

            clicker.onclick = () => {
                let contentHeight: number = collapsible.scrollHeight;
                collapsible.style.maxHeight = collapsible.style.maxHeight === "0px" ? contentHeight + "px" : "0px";
            }
        }
    }
}

let testing = false;

interface IPerson {
    first: string;
    last: string;
}

interface IWork {
    name: string;
    employee: IPerson;
}

function tester() {
    window.document.body.innerHTML = "";

    let newT = newEvent<IEventData>("tester.test");
    
    let b = new Button();
    let b2 = new Button();
    let b3 = new Button();
    let lst = new ListBox();
    let table = new TableList();
    let ex: ExpandableList = new ExpandableList();

    document.body.appendChild(ex.wrapper);
    document.body.appendChild(b.wrapper);
    document.body.appendChild(b2.wrapper);
    document.body.appendChild(b3.wrapper);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(lst.wrapper);
    document.body.appendChild(table.wrapper);

    b.text = "Click Me!";
    b2.text = "Add Fourth";
    b3.text = "Add expList item";

    b.onclick.addEventListener(() => { alert("Yeay") });


    let arr: IPerson[] = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" }
    ];    

    let exArr: IWork[] = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" }
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" }
        }
    ];

    ex.selector = (item: IWork) => {
        return <IExpandableListSection>{
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last }
            ]
        }
    }
    ex.data = exArr;

    ex.onItemClick.addEventListener((item: IDataEvent<IWork>) => {
        console.log(item.data);
    });

    b2.onclick.addEventListener(() => {
        arr.push({ first: "Fourth", last: "Tester" })
        lst.update();
        table.update();
    });

    b3.onclick.addEventListener(() => {
        exArr.push({ name: "new", employee: { first: "hans", last: "bobsen" } });
        ex.update();
    })

    table.header = ["Firstname", "Lastname"];

    table.selector = (item: IPerson) => {
        return [item.first, item.last];
    }

    table.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    })



    table.data = arr;

    lst.selector = (item: IPerson) => {
        return item.first + " " + item.last;
    };

    lst.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    })

    lst.data = arr;
    

}


function startUp() {
    if (testing) {
        tester();   
        return;
    }

    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: new sensys.SensorManager()
    };

    kernel.senMan.lateInit(); // Late init because it needs netMan

    //kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    kernel.senMan.load("../../Data/Sets/195_usart_data.log16");
    // kernel.senMan.setGlobal(841);

    registerLaunchers();
    registerSensorGroups();


    let mk: HtmlHelper = new HtmlHelper();

    let content: HTMLElement = mk.tag("div", "taskbar-applet");
    let menuContent: HTMLElement = mk.tag("div", "taskbar-applet");
    let themeChange: HTMLElement = mk.tag("div", "taskbar-applet");
    let statusbar: HTMLElement = mk.tag("div", "taskbar-applet");

    let wl: WindowList = new WindowList(content);
    let menu: MainMenu = new MainMenu(menuContent);
    let theme: ChangeTheme = new ChangeTheme(themeChange);
    let bar: StatusBar = new StatusBar(statusbar);

    let taskbar: Element = document.getElementsByClassName("taskbar")[0];

    taskbar.appendChild(menu.content);
    taskbar.appendChild(theme.content);
    taskbar.appendChild(wl.content);
    taskbar.appendChild(bar.content);

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
    kernel.appMan.registerApplication("Data", new Launcher(DataSourceBuilder, "Data Source Builder"));

    kernel.appMan.registerApplication("Charts", new Launcher(LineChartTester, "Line Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(GaugeTester, "Gauge"));
    kernel.appMan.registerApplication("Charts", new Launcher(GPSPlotTester, "GPS Viewer"));
    kernel.appMan.registerApplication("Charts", new Launcher(LabelTester, "Label"));
    kernel.appMan.registerApplication("Charts", new Launcher(BarTester, "Bar Chart"));
    kernel.appMan.registerApplication("Charts", new Launcher(SteeringWheelTester, "Steering Wheel"));
    // kernel.appMan.registerApplication("Charts", new Launcher(TestDataViewer, "Test Viewer"));


    kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Test", new Launcher(SensorSetSelector, "Sensor set Selector"));

    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
    kernel.appMan.registerApplication("Admin", new Launcher(TaskManager, "Task Manager"));
    kernel.appMan.registerApplication("Tools", new Launcher(SVGEditor, "SVG Editor"));

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

    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Basic Receive", <IGridLanchTemplate>{
        name: "Basic Receive",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["speed", "current", "volt"] },
                {
                    data: [
                        {
                            data: [
                                { name: "BarTester", data: ["volt"] },
                                { name: "GaugeTester", data: ["current"] }
                            ]
                        },
                        { name: "LabelTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["temp"] }
                    ]
                }
            ]
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [{ key: "SPEED", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "volt",
                layers: [],
                sources: [{ key: "BMS_VOLT", name: "telemetry" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "temp",
                layers: [],
                sources: [{ key: "BMS_TEMP_BAT", name: "telemetry" }]
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
