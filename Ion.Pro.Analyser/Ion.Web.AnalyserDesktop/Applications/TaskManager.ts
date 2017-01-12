class TaskManager implements IApplication {
    application: Application;
    mainWindow: AppWindow;
    infoWindows: AppWindow[] = [];
    mk: HtmlHelper;

    main() {
        this.mainWindow = kernel.winMan.createWindow(this.application, "Task Manager");
        kernel.winMan.addEventListener(WindowManager.event_windowOpen, () => this.draw());
        kernel.winMan.addEventListener(WindowManager.event_windowClose, () => this.draw());
        kernel.appMan.addEventListener(ApplicationManager.event_appLaunch, () => this.draw());
        kernel.appMan.addEventListener(ApplicationManager.event_appClose, () => this.draw());
        this.draw();
    }


    draw() {
        this.mainWindow.content.innerHTML = "";
        var tg = new HtmlTableGen("table", true);
        tg.addHeader("PID", "Application", "# of Windows");
        var apps = kernel.appMan.appList;
        for (var i = 0; i < apps.length; i++) {
            tg.addRow([{ event: "click", func: (e: MouseEvent) => this.onAppClick((<HTMLElement>e.target).parentElement) }], apps[i].pid, apps[i].name, apps[i].windows.length);
        }        
        var table = tg.generate()
        this.mainWindow.content.appendChild(table);       
    }

    onAppClick(tr: HTMLElement) {
        var pid = parseInt(tr.firstChild.textContent);        
        for (var i = 0; i < kernel.appMan.appList.length; i++) {            
            var app = kernel.appMan.appList[i];
            if (app.pid == pid) {
                var win = kernel.winMan.createWindow(this.application, "Task Manager - " + app.name);
                this.infoWindows.push(win);                
            }
        }                
    }

    drawInfoWindow() {

    }
}