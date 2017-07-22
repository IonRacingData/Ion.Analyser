var kernel;
var testing = false;
function startUp() {
    if (testing) {
        return;
    }
    kernel = {
        winMan: new WindowManager(document.body),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: new sensys.SensorManager(),
    };
    kernel.senMan.lateInit(); // Late init because it needs netMan
    //kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/195_usart_data.log16");
    //kernel.senMan.load("../../Data/GPS_DataFile.gpscsv");
    // kernel.senMan.setGlobal(841);
    //kernel.senMan.load("../../Data/Sets/0006_logfile.log17");
    kernel.senMan.load("../../Data/Sets/data/0017_logfile.log17");
    kernel.senMan.load("../../Data/Sets/data/0015_logfile.log17");
    registerLaunchers();
    registerSensorGroups();
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var themeChange = mk.tag("div", "taskbar-applet");
    var statusbar = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var theme = new ChangeTheme(themeChange);
    var bar = new StatusBar(statusbar);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(theme.content);
    taskbar.appendChild(wl.content);
    taskbar.appendChild(bar.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}
function registerSensorGroups() {
    kernel.senMan.registerGroup(PointSensorGroup);
    kernel.senMan.registerGroup(Point3DSensorGroup);
}
function registerLaunchers() {
    // kernel.appMan.registerApplication("Data", new Launcher(DataAssignerOld, "Data Assigner"));
    //kernel.appMan.registerApplication("Data", new Launcher(DataAssigner, "Data Assigner"));
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
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Speed and Current", {
        name: "Preset Speed and Current",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["speed", "current"] },
                {
                    data: [
                        { name: "LineChartTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["current"] }
                    ],
                },
            ],
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [{ key: "SPEED", name: "../../Data/Sets/126_usart_data.log16" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "../../Data/Sets/126_usart_data.log16" }],
            },
        ],
    }));
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Basic Receive", {
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
                                { name: "GaugeTester", data: ["current"] },
                            ],
                        },
                        { name: "LabelTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["temp"] },
                    ],
                },
            ],
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [{ key: "SPEED", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "volt",
                layers: [],
                sources: [{ key: "BMS_VOLT", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "temp",
                layers: [],
                sources: [{ key: "BMS_TEMP_BAT", name: "telemetry" }],
            },
        ],
    }));
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Battery Receive", {
        name: "Battery Receive",
        grid: {
            data: [
                /*{ name: "DataAssigner", data: null },*/
                { name: "LineChartTester", data: ["volt"] },
                {
                    data: [
                        {
                            data: [
                                { name: "BarTester", data: ["batTemp"] },
                                { name: "BarTester", data: ["batTemp"] },
                                { name: "BarTester", data: ["volt"] },
                                { name: "BarTester", data: ["soc"] },
                            ],
                        },
                        { name: "GaugeTester", data: ["current"] },
                        { name: "LineChartTester", data: ["current"] },
                    ],
                },
            ],
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "batTemp",
                layers: [],
                sources: [{ key: "BMS_TEMP_BAT", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [{ key: "CURRENT", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "volt",
                layers: [],
                sources: [{ key: "BMS_VOLT", name: "telemetry" }],
            },
            {
                grouptype: "PointSensorGroup",
                key: "soc",
                layers: [],
                sources: [{ key: "BMS_SOC", name: "telemetry" }],
            },
        ],
    }));
}
