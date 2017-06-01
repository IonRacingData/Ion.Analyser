interface IApplication {
    app: Application;
    main(...params: any[]): void;
}

class Application {
    public application: IApplication;
    public name: string;
    public pid: number;
    public windows: AppWindow[] = [];
    public events: EventHandler = new EventHandler();

    constructor(app: IApplication) {
        this.application = app;
        app.app = this;
    }

    start(...args: any[]): void {
        this.application.main(...args);
    }

    private closeWindows() {
        for (let win of this.windows) {
            win.close();
        }
    }

    close(): void {
        this.events.close();
        //this.closeWindows();
        kernel.appMan.closeApplication(this);
    }

    onWindowClose(): void {
        if (this.windows.length === 1) {
            this.close();
        }
    }
}