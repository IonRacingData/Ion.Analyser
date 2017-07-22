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

    appTable: TableList = new TableList();

    initializeComponents() {
        const ta = this.appTable;
        ta.header = ["PID", "Application", "# Windows", "# Events"];
        ta.selector = (app: Application) => {
            return [app.pid.toString(), app.name, app.windows.length.toString(), app.events.localNewEvent.length.toString()];
        };
        ta.onItemClick.addEventListener((e: IDataEvent<Application>) => this.onAppClick(e.data));
        ta.data = kernel.appMan.appList;
        this.mainWindow.content.appendChild(ta.wrapper);
    }

    update() {
        this.appTable.update();
    }

    draw() {
        this.mainWindow.content.innerHTML = "";
        const tg = new HtmlTableGen("table", true);
        tg.addHeader("PID", "Application", "# of Windows");
        const apps = kernel.appMan.appList;
        for (let i = 0; i < apps.length; i++) {
            const tempApp = apps[i];
            tg.addRow(
                [
                    {
                        event: "click",
                        func: (e: MouseEvent) => this.onAppClick(tempApp),
                    },
                ],
                apps[i].pid,
                apps[i].name, apps[i].windows.length);
        }
        const table = tg.generate();
        this.mainWindow.content.appendChild(table);
    }

    onAppClick(app: Application) {
        const win = kernel.winMan.createWindow(this.app, "Task Manager - " + app.name);
        this.infoWindows.push(win);
        this.drawInfoWindow(app, win);
    }

    drawInfoWindow(app: Application, win: AppWindow) {
        const windowTab = new HtmlTableGen("table");
        windowTab.addHeader("Title");
        windowTab.addArray(app.windows, ["title"]);
        const windowEvents = new HtmlTableGen("table");
        windowEvents.addHeader("Event", "Extra");
        windowEvents.addArray(app.events.localNewEvent, ["info"]);
        windowEvents.addArray(app.events.localEvents, ["type", "manager"]);

        win.content.innerHTML = "";
        win.content.appendChild(windowTab.generate());
        win.content.appendChild(windowEvents.generate());
    }
}
