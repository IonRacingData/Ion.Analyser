interface IApplication {
    application: Application;
    main(): void;
}

class Application {
    application: IApplication;
    name: string;
    pid: number;
    windows: AppWindow[] = [];

    constructor(app: IApplication) {
        this.application = app;
        app.application = this;
    }

    start(): void {
        this.application.main();
    }

    onClose(): void {
        if (this.windows.length == 1) {
            kernel.appMan.closeApplication(this);
        }
    }
}