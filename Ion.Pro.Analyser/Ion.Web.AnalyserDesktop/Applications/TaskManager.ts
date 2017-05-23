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
            tg.addRow(
                [
                    {
                        event: "click",
                        func: (e: MouseEvent) => this.onAppClick((<HTMLElement>e.target).parentElement)
                    }
                ],
                apps[i].pid,
                apps[i].name, apps[i].windows.length);
        }
        var table = tg.generate();
        this.mainWindow.content.appendChild(table);
    }

    onAppClick(tr: HTMLElement) {
        var pid = parseInt(tr.firstChild.textContent, 10);
        for (var i = 0; i < kernel.appMan.appList.length; i++) {
            var app = kernel.appMan.appList[i];
            if (app.pid === pid) {
                var win = kernel.winMan.createWindow(this.app, "Task Manager - " + app.name);
                this.infoWindows.push(win);
            }
        }
    }

    drawInfoWindow() {

    }
}