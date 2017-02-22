class TaskManager implements IApplication {
    application: Application;
    mainWindow: AppWindow;
    infoWindows: AppWindow[] = [];
    mk: HtmlHelper;
    eh: EventHandler = new EventHandler();

    main() {
        this.mainWindow = kernel.winMan.createWindow(this.application, "Task Manager");
        this.addEvents(this.eh);
        this.draw();
    }

    addEvents(eh: EventHandler) {

        eh.on(kernel.winMan, WindowManager.event_windowOpen, () => this.draw());
        eh.on(kernel.winMan, WindowManager.event_windowClose, () => this.draw());

        eh.on(kernel.appMan, ApplicationManager.event_appLaunch, () => this.draw());
        eh.on(kernel.appMan, ApplicationManager.event_appClose, () => this.draw());

        eh.on(this.mainWindow, AppWindow.event_close, () => this.close());
    }

    close() {
        this.eh.close();
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
                var win = kernel.winMan.createWindow(this.application, "Task Manager - " + app.name);
                this.infoWindows.push(win);
            }
        }
    }

    drawInfoWindow() {

    }
}