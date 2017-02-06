class DataViewer implements IApplication {
    application: Application;
    window: AppWindow;
    data: ISensorPackage[]; 

    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        kernel.senMan.getLoadedInfos((ids: SensorInformation[]) => this.draw(ids));
    }

    draw(data: SensorInformation[]): void {
        var mk = new HtmlHelper();

        var table = new HtmlTableGen("table");
        table.addHeader("ID", "Name", "Unit");

        for (var i = 0; i < data.length; i++) {
            let curValue = data[i];
            table.addRow([
                {
                    event: "click", func: () =>
                    {
                        kernel.senMan.setGlobal(curValue.ID);
                    }
                },
                (!curValue.Key ? { field: "className", data: "error" } : {})
            ],
                curValue.ID, curValue.Name, curValue.Unit ? curValue.Unit : "");
        }
        this.window.content.appendChild(table.generate());


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

class PlotterTester implements IApplication, IMultiPlot {
    application: Application;
    window: AppWindow;
    plotter: Plotter;
    data: ISensorPackage[];
    eh: EventHandler = new EventHandler();
    plotData: PlotData[] = [];
    plotType: string = "Plot";
    plotWindow: AppWindow;
    update


    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Plotter Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.createEvents(this.eh);
        this.plotter = new Plotter(this.plotData);
        this.window.content.appendChild(this.plotter.generate());
        this.plotter.setSize(this.window.width, this.window.height);
        /*var data: ISensorPackage[] = [
            { ID: 111, TimeStamp: 2000, Value: 54 },
            { ID: 111, TimeStamp: 2100, Value: 67 },
            { ID: 111, TimeStamp: 2200, Value: 21 },
            { ID: 111, TimeStamp: 2300, Value: 12 },
            { ID: 111, TimeStamp: 2400, Value: 15 },
            { ID: 111, TimeStamp: 2500, Value: 87 }
        ];*/

        //this.loadData();
        //this.drawChart(data);
    }

    dataUpdate() {
        this.plotter.draw();
        /*this.window.content.innerHTML = "";
        this.plotter = new Plotter(this.plotData);
        this.window.content.appendChild(this.plotter.generatePlot());
        this.plotter.setSize(this.window.width, this.window.height);*/
    }

    createEvents(eh: EventHandler) {
        eh.on(this.window, AppWindow.event_resize, () => {
            this.plotter.setSize(this.window.width, this.window.height);
            //this.plotter.canvas.width = this.window.width;
            //this.plotter.canvas.height = this.window.height;
            //this.plotter.draw();
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
        this.window.content.innerHTML = "";
        var plotData = new PlotData([]);
        for (var i = 0; i < data.length; i++) {
            plotData.points[i] = new Point(data[i].TimeStamp, data[i].Value);
        }
        this.plotter = new Plotter([plotData]);
        this.window.content.appendChild(this.plotter.generate());
        this.plotter.setSize(this.window.width, this.window.height);        
        //this.plotter.draw();
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
        this.window.content.appendChild(this.mk.tag("h1", "", null, this.helloData.Text));
    }
}

class GaugeTester implements IApplication, ISinglePlot {
    application: Application;
    window: AppWindow;
    gauge: GaugePlot;
    val: number = 0;
    plotType: string = "GaugePlot";
    plotWindow: AppWindow;
    plotData: PlotData;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Meter Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        /*
        let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", () => {
            let val = slider.value;
            this.gauge.drawNeedle(parseInt(val));
        });*/                

        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);
                
        this.gauge.wrapper.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY / 3;
            this.val = this.val > 100 ? 100 : this.val;
            this.val = this.val < 0 ? 0 : this.val;
            this.gauge.setValue(this.val);
        });

        
        this.window.eventMan.addEventListener(AppWindow.event_resize, () => {
            this.gauge.setSize(this.window.width, this.window.height);
            //this.plotter.draw();
        });

    }

    drawMeter() {
        //this.window.content.innerHTML = "";                        
        this.gauge = new GaugePlot(this.window.width, this.window.height, 0, 200, 20);
        this.window.content.appendChild(this.gauge.generate());
    }

    dataUpdate() {
        this.gauge.setValue((this.plotData.points[this.plotData.points.length - 1].y / 200) * 100);
    }
}

class GPSPlotTester implements IApplication {
    application: Application;
    window: AppWindow;
    points: Point3D[] = [];
    plot: GPSPlot;
    testData: GPSPlotData;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "GPSPlot Tester");
        this.window.content.style.overflow = "hidden";

        /*let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        //slider.style.marginTop = "200px";
        slider.setAttribute("value", "0");
        this.window.content.appendChild(slider);
        slider.addEventListener("input", () => {
            let val = parseInt(slider.value);
            let p: Point3D[] = [];
            p = this.points.slice(0, (this.points.length * val) / 100);
            this.update(p);
        });*/
        kernel.senMan.getData(252, (d: ISensorPackage[]) => {
            for (let i = 0; i < d.length; i++) {
                this.points.push(new Point3D(d[i].TimeStamp, d[i].Value, 1));
            }
            this.draw(this.points);
        });
        this.window.eventMan.addEventListener(AppWindow.event_resize, () => {
            this.plot.setSize(this.window.width, this.window.height);
        });
    }

    draw(p: Point3D[]): void {                
        this.testData = new GPSPlotData(p);
        this.plot = new GPSPlot(this.testData);
        //console.log(this.testData);
        this.window.content.appendChild(this.plot.generate());
        this.plot.setSize(this.window.width, this.window.height);
        //this.plot.draw();
    }

    update(p: Point3D[]): void {
        this.testData = new GPSPlotData(p);
        this.plot.update(this.testData);
    }   
    
}

class LabelTester {
    application: Application;
    window: AppWindow;
    label: LabelController;
    val: number = 0;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "LabelTester");
        this.window.content.style.overflow = "hidden";
        this.label = new LabelController(this.window.width, this.window.height);
        let div = this.label.generate();
        this.window.content.appendChild(div);
        this.label.setValue(this.val);

        div.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY;
            this.label.setValue(this.val);
        });

        this.window.eventMan.addEventListener(AppWindow.event_resize, () => {
            this.label.setSize(this.window.width, this.window.height);
        });
    }
}

class BarTester {
    application: Application;
    window: AppWindow;
    bar: BarController;
    val: number = 0;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "BarTester");
        this.window.content.style.overflow = "hidden";
        this.bar = new BarController(this.window.width, this.window.height);
        let barWrapper = this.bar.generate();
        this.window.content.appendChild(barWrapper);
        this.bar.setValue(this.val);

        barWrapper.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY / 10;
            this.val = this.val > 100 ? 100 : this.val;
            this.val = this.val < 0 ? 0 : this.val;
            this.bar.setValue(this.val);
        });

        this.window.eventMan.addEventListener(AppWindow.event_resize, () => {
            this.bar.setSize(this.window.width, this.window.height);
        });
    }


}