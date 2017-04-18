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
    var mk = new HtmlHelper();
    var content = mk.tag("div", "taskbar-applet");
    var menuContent = mk.tag("div", "taskbar-applet");
    var wl = new WindowList(content);
    var menu = new MainMenu(menuContent);
    var taskbar = document.getElementsByClassName("taskbar")[0];
    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}
function registerLaunchers() {
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
    // kernel.appMan.registerApplication("Data", new Launcher(DataAssignerOld, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(DataAssigner, "Data Assigner"));
    kernel.appMan.registerApplication("Data", new Launcher(SensorSetSelector, "Sensor set Selector"));
    kernel.appMan.registerApplication("Data", new Launcher(CsvGenerator, "Csv Creator"));
    kernel.appMan.registerApplication("Data", new Launcher(DataSourceBuilder, "Data Source Builder"));
    kernel.appMan.registerApplication("Plot", new Launcher(LineChartTester, "Line Chart Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(GaugeTester, "Gauge Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(GPSPlotTester, "GPSPlot Tester"));
    kernel.appMan.registerApplication("Plot", new Launcher(LabelTester, "Label Test"));
    kernel.appMan.registerApplication("Plot", new Launcher(BarTester, "Bar Test"));
    kernel.appMan.registerApplication("Plot", new Launcher(SteeringWheelTester, "Steering Wheel Test"));
    //kernel.appMan.registerApplication("Plot", new Launcher(TestDataViewer, "Test Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));
    kernel.appMan.registerApplication("Test", new Launcher(TaskManager, "Task Manager"));
    kernel.appMan.registerApplication("Admin", new Launcher(LegacyRPIManager, "Legacy RPI Manager"));
}
/* tslint:enable:interface-name */
var Launcher = (function () {
    function Launcher(mainFunction, name) {
        this.mainFunction = mainFunction;
        this.name = name;
    }
    Launcher.prototype.createInstance = function () {
        kernel.appMan.launchApplication(this);
    };
    return Launcher;
}());
//# sourceMappingURL=kernel.js.map