var kernel: IKernel;
let testing = false;


interface IKernel {
    winMan: WindowManager;
    appMan: ApplicationManager;
    netMan: NetworkManager;
    senMan: sensys.SensorManager;
}

interface HTMLElement {
    window: AppWindow;
}

interface IPerson {
    first: string;
    last: string;
}

interface IWork {
    name: string;
    employee: IPerson;
}

function tester() {

    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";

    let newT = newEvent<IEventData>("tester.test");
    
    let b = new Button();
    let b2 = new Button();
    let b3 = new Button();
    let lst = new ListBox();
    let table = new TableList();
    let ex: ExpandableList = new ExpandableList();
    let listArr: ListBoxRearrangable = new ListBoxRearrangable();

    document.body.appendChild(ex.wrapper);
    document.body.appendChild(b.wrapper);
    document.body.appendChild(b2.wrapper);
    document.body.appendChild(b3.wrapper);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(lst.wrapper);
    document.body.appendChild(table.wrapper);
    document.body.appendChild(listArr.wrapper);

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

    listArr.selector = (item: IPerson) => {
        return <IListBoxRearrangableItem>{ mainText: item.first, infoText: item.last }
    }

    listArr.data = arr;

    let markers: string[] = ["X", "Y", "Z"];

    listArr.rowInfoMarkers = markers;

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

    kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
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

function storageTest() {
    let storageList: IStorageList = {
        bob: {
            longText: "This is a long text",
            text: "bob",
            type: "string",
            value: "Hello World"
        },
        test: {
            longText: "AnotherTest",
            text: "hello",
            type: "number",
            value: 3
        },
        anotherTest: {
            longText: "dsadsa",
            text: "test",
            type: "boolean",
            value: false
        }
    }

    
}

interface IStorageList {
    [key: string]: IStorageObject<keyof IStorageTypes>;
}

interface IStorageTypes {
    "number": number;
    "string": string;
    "boolean": boolean;
    "action": (() => void);
}

interface IStorageObject<K extends keyof IStorageTypes> {
    text: string;
    longText: string;
    type: K;
    value: IStorageTypes[K];
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


    //kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Test", new Launcher(SensorSetSelector, "Sensor set Selector"));

    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
    kernel.appMan.registerApplication("Admin", new Launcher(TaskManager, "Task Manager"));
    kernel.appMan.registerApplication("Tools", new Launcher(SVGEditor, "SVG Editor"));

    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));

    kernel.appMan.registerApplication("hidden", new Launcher(ConfigWindow, "Config Window"));

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
                sources: [{ key: "SPEED", name: "../../Data/Sets/126_usart_data.log16" }]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "../../Data/Sets/126_usart_data.log16" }]
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


