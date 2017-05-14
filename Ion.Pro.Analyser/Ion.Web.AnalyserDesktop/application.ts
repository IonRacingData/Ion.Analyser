interface IApplication {
    application: Application;
    main(...params: any[]): void;
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

    start(...args: any[]): void {
        this.application.main(...args);
    }

    onClose(): void {
        if (this.windows.length === 1) {
            kernel.appMan.closeApplication(this);
        }
    }
}