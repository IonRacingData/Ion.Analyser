class TaskManager implements IApplication {
    application: Application;
    window: AppWindow;
    mk: HtmlHelper;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "Task Manager");
        kernel.winMan.addEventListener("windowOpen", () => this.update());
        kernel.winMan.addEventListener("windowClose", () => this.update());
    }

    update() {
        var windows = kernel.winMan.windows;
        var tg = new HtmlTableGen();
        tg.addHeader("Title");
        tg.addArray(windows, ["title"]);
        this.window.content.innerHTML = "";
        this.window.content.appendChild(tg.generate());        
    }
}