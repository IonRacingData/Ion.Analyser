var kernel;
function startUp() {
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: null
    };
    kernel.senMan = new sensys.SensorManager(); // Late init because it needs netMan
    kernel.senMan.load("../../Data/Sets/126_usart_data.log16");
    //kernel.senMan.load("../../Data/Sets/167_usart_data.log16");
    // kernel.senMan.setGlobal(841);
    registerLaunchers();
    registerSensorGroups();
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var themeChange = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var theme = new ChangeTheme(themeChange);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(theme.content);
    taskbar.appendChild(wl.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}
function registerSensorGroups() {
    kernel.senMan.registerGroup(PointSensorGroup);
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
    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
    kernel.appMan.registerApplication("Admin", new Launcher(TaskManager, "Task Manager"));
    registerGridPresets();
}
function registerGridPresets() {
    kernel.appMan.registerApplication("Grid Preset", new Launcher(GridViewer, "Preset 1", {
        grid: {
            data: [
                { name: "DataAssigner", data: null },
                { name: "LineChartTester", data: ["speed", "current"] },
                {
                    data: [
                        { name: "LineChartTester", data: ["speed"] },
                        { name: "LineChartTester", data: ["current"] }
                    ]
                }
            ]
        },
        sensorsets: [
            {
                grouptype: "PointSensorGroup",
                key: "speed",
                layers: [],
                sources: [
                    { key: "SPEED", name: "../../Data/Sets/126_usart_data.log16" }
                ]
            },
            {
                grouptype: "PointSensorGroup",
                key: "current",
                layers: [],
                sources: [
                    { key: "CURRENT", name: "../../Data/Sets/126_usart_data.log16" }
                ]
            }
        ]
    }));
}
/* tslint:enable:interface-name */
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.mainFunction = mainFunction;
        this.name = name;
        this.args = args;
    }
    Launcher.prototype.createInstance = function () {
        (_a = kernel.appMan).launchApplication.apply(_a, [this].concat(this.args));
        var _a;
    };
    return Launcher;
}());
//# sourceMappingURL=kernel.js.map