class TestDataViewer implements IApplication, ISinglePlot {
    application: Application;
    window: AppWindow;
    plotData: PlotData;
    plotType: string = "Test Data Viewer";

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
        kernel.senMan.register(this);
    }

    draw(): void {
        console.log("Here we should draw something, but you know, we are lazy");
    }

    dataUpdate(): void {
        this.draw();
    }
}

class DataAssigner implements IApplication {
    application: Application;
    window: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");

        let tableGen = new HtmlTableGen("table");
        let senMan: SensorManager = kernel.senMan;
        tableGen.addHeader("Plot name", "plot type");
        for (let i = 0; i < senMan.plotter.length; i++) {
            tableGen.addRow(senMan.plotter[i].plotType, Array.isArray((<any>senMan.plotter[i]).plotData) ? "Multi Plot" : "Single Plot");
        }
        this.window.content.appendChild(tableGen.generate());

    }
}