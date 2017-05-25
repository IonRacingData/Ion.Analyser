class ApplicationManager implements IEventManager {
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = {};
    allApps: { [name: string]: Launcher } = {};
    eventManager: EventManager = new EventManager();
    nextPID: number = 0;

    //static event_appLaunch = "appLaunch";
    //static event_appClose = "appClose";

    onAppLaunch = newEvent("ApplicationManager.onAppLaunch");
    onAppClose = newEvent("ApplicationManager.onAppClose");

    launchApplication(launcher: Launcher, ...args: any[]): Application {
        var temp: IApplication = new launcher.mainFunction();
        var appTemp = new Application(temp);
        appTemp.name = launcher.name;
        appTemp.pid = this.nextPID++;
        this.appList.push(appTemp);

        appTemp.start(...args);
        this.onAppLaunch(null);
        //this.eventManager.raiseEvent(ApplicationManager.event_appLaunch, null);

        return appTemp;
    }

    start(appName: string, ...args: any[]): Application {
        if (this.allApps[appName]) {
            return this.launchApplication(this.allApps[appName], ...args);
        }
    }

    registerApplication(category: string, launcher: Launcher): void {
        if (!this.launchers[category]) {
            this.launchers[category] = [];  
        }
        this.launchers[category].push(launcher);
        this.allApps[(<any>launcher.mainFunction).name] = launcher;
    }

    addEventListener(type: string, listener: any): void {
        this.eventManager.addEventListener(type, listener);
    }

    removeEventListener(type: string, listener: any): void {
        this.eventManager.removeEventListener(type, listener);
    }


    closeApplication(app: Application): void {
        this.appList.splice(this.appList.indexOf(app), 1);
        this.onAppClose(null);
        //this.eventManager.raiseEvent(ApplicationManager.event_appClose, null);
    }
}