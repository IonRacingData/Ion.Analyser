class GridViewer implements IApplication {
    application: Application;
    window: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");

        var template: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("temp-grid");
        var clone: Node = document.importNode(template.content, true);
        // console.log(clone);
        this.window.content.appendChild(clone);
        // addEvents();
    }
}

