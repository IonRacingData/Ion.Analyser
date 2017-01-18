var kernel;
function startUp() {
    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager(),
        netMan: new NetworkManager(),
        senMan: new SensorManager()
    };
    kernel.senMan.setGlobal(841);
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
    var logViewer = new Launcher(TestViewer, "Test Window");
    kernel.appMan.registerApplication("Test", logViewer);
    kernel.appMan.registerApplication("Test", new Launcher(WebSocketTest, "Web Socket Test"));
    kernel.appMan.registerApplication("Grid", new Launcher(GridViewer, "Grid Window"));
    kernel.appMan.registerApplication("Car", new Launcher(DataViewer, "Data Viewer"));
    kernel.appMan.registerApplication("Car", new Launcher(PlotViewer, "Plot Viewer"));
    kernel.appMan.registerApplication("Administration", new Launcher(TaskManager, "Task Manager"));
}
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