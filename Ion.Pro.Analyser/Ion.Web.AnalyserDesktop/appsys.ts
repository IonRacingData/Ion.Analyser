class ApplicationManager implements IEventManager {
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = {};
    eventManager: EventManager = new EventManager();
    nextPID: number = 0;

    static event_appLaunch = "appLaunch";
    static event_appClose = "appClose";

    launchApplication(launcher: Launcher): void {
        var temp: IApplication = new launcher.mainFunction();
        var appTemp = new Application(temp);
        appTemp.name = launcher.name;
        appTemp.pid = this.nextPID++;
        this.appList.push(appTemp);

        appTemp.start();
        this.eventManager.raiseEvent(ApplicationManager.event_appLaunch, null);
    }

    registerApplication(category: string, launcher: Launcher): void {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    }

    addEventListener(type: string, listener: any): void {
        this.eventManager.addEventListener(type, listener);
    }

    removeEventListener(type: string, listener: any): void {
        this.eventManager.removeEventListener(type, listener);
    }
    

    closeApplication(app: Application): void {
        this.appList.splice(this.appList.indexOf(app), 1);
        this.eventManager.raiseEvent(ApplicationManager.event_appClose, null);
    }
}