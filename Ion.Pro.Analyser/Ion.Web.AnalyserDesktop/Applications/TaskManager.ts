class TaskManager implements IApplication {
    app: Application;
    mainWindow: AppWindow;
    infoWindows: AppWindow[] = [];
    mk: HtmlHelper;

    main() {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Task Manager");
        this.addEvents(this.app.events);
        this.draw();
    }

    addEvents(eh: EventHandler) {
        eh.on(kernel.winMan.onWindowOpen, () => this.draw());
        eh.on(kernel.winMan.onWindowClose, () => this.draw());

        eh.on(kernel.appMan.onAppLaunch, () => this.draw());
        eh.on(kernel.appMan.onAppClose, () => this.draw());
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


        //var pid = parseInt(tr.firstChild.textContent, 10);
        //for (var i = 0; i < kernel.appMan.appList.length; i++) {
            //var app = kernel.appMan.appList[i];
            //if (app.pid === pid) {
                
            //}
        //}
    }

    drawInfoWindow(app: Application, win: AppWindow) {
        let windowTab = new HtmlTableGen("table");
        windowTab.addHeader("Title");
        windowTab.addArray(app.windows, ["title"]);
        let windowEvents = new HtmlTableGen("table");
        windowEvents.addHeader("Event", "extra");
        windowEvents.addArray(app.events.localNewEvent, ["info"]);
        windowEvents.addArray(app.events.localEvents, ["type", "manager"]);

        win.content.innerHTML = "";
        win.content.appendChild(windowTab.generate());
        win.content.appendChild(windowEvents.generate());
    }
}