class DataViewer implements IApplication {
    application: Application;
    window: AppWindow;
    data: ISensorPackage[];
    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        kernel.senMan.getIds((data: number[]) => this.draw(data));
    }

    draw(data: number[]): void {
        var mk = new HtmlHelper();
        for (var i = 0; i < data.length; i++) {
            let curValue = data[i];
            var a = <HTMLAnchorElement>mk.tag("span", "taskbar-button-text", null, curValue.toString());

            a.onclick = () => {
                kernel.senMan.setGlobal(curValue);
                //kernel.senMan.getData(curValue, (data: ISensorPackage[]) => this.drawInner(data));
                //requestAction("GetData?number=" + curValue.toString(), (data: ISensorPackage[]) => this.drawInner(data))
            };
            this.window.content.appendChild(a);
        }
        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
        kernel.senMan.addEventListener(SensorManager.event_globalPlot, (data: ISensorPackage[]) => this.drawInner(data));
    }

    drawInner(data: ISensorPackage[]): void {
        this.innerTable.innerHTML = "";
        var gen = new HtmlTableGen("table");
        gen.addHeader("ID", "Value", "Timestamp");
        this.data = data;
        for (var i = 0; i < 10; i++) {
            gen.addRow(data[i].ID, data[i].Value, data[i].TimeStamp);
        }
        //gen.addArray(data, ["ID", "Value", "TimeStamp"]);

        this.innerTable.appendChild(gen.generate());
    }
}

class PlotViewer implements IApplication {
    application: Application;
    window: AppWindow;
    innerChart: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Plot window");
        this.innerChart = document.createElement("div");
        this.window.content.appendChild(this.innerChart);

        google.charts.load("current", { "packages": ["corechart"] });
        google.charts.setOnLoadCallback(() => this.loadData());
    }

    loadData() {
        requestAction("getdata?number=61445", (data: ISensorPackage[]) => this.drawChart(data));
    }

    drawChart(sensorData: ISensorPackage[]): void {

        var preData: any[][] = [["Time stamp", "Value"]];
        for (var i = 1; i < 30; i++) {
            preData[i] = [(sensorData[i].TimeStamp / 1000).toString() + "s", sensorData[i].Value];
        }
        var data = google.visualization.arrayToDataTable(preData);
        /*var data = google.visualization.arrayToDataTable([
            ["Year", "Sales", "Expenses"],
            ["2004", 1000, 400],
            ['2005', 1170, 460],
            ['2006', 660, 1120],
            ['2007', 1030, 540]
        ]);*/

        var options = {
            title: "Sensor package 61457",
            curveType: "function",
            legende: { position: "bottom" }
        };

        var chart = new google.visualization.LineChart(this.innerChart);
        chart.draw(data, options);
    }
}

class PlotterTester implements IApplication {
    application: Application;
    window: AppWindow;
    plotter: Plotter;
    data: ISensorPackage[];
    eh: EventHandler = new EventHandler();

    main() {
        this.window = kernel.winMan.createWindow(this.application, "Plotter Tester");
        this.window.content.style.overflow = "hidden";
        this.createEvents(this.eh);

        /*var data: ISensorPackage[] = [
            { ID: 111, TimeStamp: 2000, Value: 54 },
            { ID: 111, TimeStamp: 2100, Value: 67 },
            { ID: 111, TimeStamp: 2200, Value: 21 },
            { ID: 111, TimeStamp: 2300, Value: 12 },
            { ID: 111, TimeStamp: 2400, Value: 15 },
            { ID: 111, TimeStamp: 2500, Value: 87 }
        ];*/

        this.loadData();
        //this.drawChart(data);
    }

    createEvents(eh: EventHandler) {
        eh.on(this.window, AppWindow.event_resize, () => {
            this.plotter.canvas.width = this.window.width;
            this.plotter.canvas.height = this.window.height;
            this.plotter.draw();
        });
        eh.on(this.window, AppWindow.event_close, () => {
            this.close();
        });
    }

    close() {
        this.eh.close();
    }

    loadData() {
        kernel.senMan.addEventListener(SensorManager.event_globalPlot, (data: ISensorPackage[]) => this.drawChart(data));
        //kernel.senMan.getData(841, (data: ISensorPackage[]) => this.drawChart(data));
        //requestAction("getdata?number=841", (data: ISensorPackage[]) => this.drawChart(data));
    }

    drawChart(data: ISensorPackage[]) {
        this.data = data;
        this.plotter = new Plotter();
        this.window.content.innerHTML = "";
        var plotData = new PlotData([]);
        for (var i = 0; i < data.length; i++) {
            plotData.points[i] = new Point(data[i].TimeStamp, data[i].Value);
        }
        this.window.content.appendChild(this.plotter.generatePlot(plotData));
        this.plotter.canvas.width = this.window.width;
        this.plotter.canvas.height = this.window.height;
        this.plotter.draw();
    }
}

class WebSocketTest implements IApplication {
    application: Application;
    window: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Web Socket test");


    }
}

class TestViewer implements IApplication {
    application: Application;
    window: AppWindow;
    window2: AppWindow;
    helloData: IHelloPackage;
    mk: HtmlHelper;

    main(): void {
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");

        requestAction("hello", (data: IHelloPackage) => {
            this.helloData = data;
            this.draw();
        });
    }

    draw(): void {
        this.window.content.innerHTML = "";
        this.window.content.appendChild(this.mk.tag("h1", "", null, "Hello World"));
    }
}