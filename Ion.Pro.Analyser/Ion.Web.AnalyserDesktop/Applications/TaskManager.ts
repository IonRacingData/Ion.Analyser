class TaskManager implements IApplication {
    app: Application;
    mainWindow: AppWindow;
    infoWindows: AppWindow[] = [];
    mk: HtmlHelper;

    main() {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Task Manager");
        this.addEvents(this.app.events);
        this.initializeComponents();
        //this.draw();
    }

    addEvents(eh: EventHandler) {
        eh.on(kernel.winMan.onWindowOpen, () => this.update());
        eh.on(kernel.winMan.onWindowClose, () => this.update());

        eh.on(kernel.appMan.onAppLaunch, () => this.update());
        eh.on(kernel.appMan.onAppClose, () => this.update());
    }


    appTable: TableList = null;

    initializeComponents() {
        let ta = this.appTable = new TableList();
        ta.header = ["PID", "Application", "# Windows", "# Events"];
        ta.selector = (app: Application) => {
            return [app.pid.toString(), app.name, app.windows.length.toString(), app.events.localNewEvent.length.toString()];
        };
        ta.onItemClick.addEventListener((app: Application) => this.onAppClick(app));
        ta.data = kernel.appMan.appList;
        this.mainWindow.content.appendChild(ta.wrapper);
    }

    update() {
        this.appTable.update();
    }

    draw() {
        this.mainWindow.content.innerHTML = "";
        var tg = new HtmlTableGen("table", true);
        tg.addHeader("PID", "Application", "# of Windows");
        var apps = kernel.appMan.appList;
        for (var i = 0; i < apps.length; i++) {
            let tempApp = apps[i];
            tg.addRow(
                [
                    {
                        event: "click",
                        func: (e: MouseEvent) => this.onAppClick(tempApp)
                    }
                ],
                apps[i].pid,
                apps[i].name, apps[i].windows.length);
        }
        var table = tg.generate();
        this.mainWindow.content.appendChild(table);
    }

    onAppClick(app: Application) {
        var win = kernel.winMan.createWindow(this.app, "Task Manager - " + app.name);
        this.infoWindows.push(win);
        this.drawInfoWindow(app, win);
    }

    drawInfoWindow(app: Application, win: AppWindow) {
        let windowTab = new HtmlTableGen("table");
        windowTab.addHeader("Title");
        windowTab.addArray(app.windows, ["title"]);
        let windowEvents = new HtmlTableGen("table");
        windowEvents.addHeader("Event", "Extra");
        windowEvents.addArray(app.events.localNewEvent, ["info"]);
        windowEvents.addArray(app.events.localEvents, ["type", "manager"]);

        win.content.innerHTML = "";
        win.content.appendChild(windowTab.generate());
        win.content.appendChild(windowEvents.generate());
    }
}