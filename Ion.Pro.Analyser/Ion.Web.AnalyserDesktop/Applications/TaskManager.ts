class TaskManager implements IApplication {
    application: Application;
    window: AppWindow;
    mk: HtmlHelper;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "Task Manager");
        kernel.winMan.addEventListener("windowOpen", () => this.update());
        kernel.winMan.addEventListener("windowClose", () => this.update());
        kernel.appMan.addEventListener("launchApp", () => this.update());
        this.update();
    }

    update() {
        this.window.content.innerHTML = "";
        var windows = kernel.winMan.windows;

        var tg = new HtmlTableGen("table", true);
        tg.addHeader("Title");
        tg.addArray(windows, ["title"]);
        this.window.content.appendChild(tg.generate());

        var tg2 = new HtmlTableGen("table", true);
        tg2.addHeader("PID", "Title");
        tg2.addArray(kernel.appMan.appList, ["pid", "name"] );
        this.window.content.appendChild(tg2.generate());
    }
}