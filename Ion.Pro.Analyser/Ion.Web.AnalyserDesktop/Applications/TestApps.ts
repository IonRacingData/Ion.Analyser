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

        this.innerTable.appendChild(gen.generate());
    }
}

class LineChartTester implements IApplication, IMultiPlot {
    application: Application;
    window: AppWindow;
    lineChart: LineChartController;
    data: ISensorPackage[];
    eh: EventHandler = new EventHandler();
    plotData: IPlotData[] = [];
    plotType: string = "Plot";
    plotWindow: AppWindow;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Line Chart Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);
        this.createEvents(this.eh);
        this.lineChart = new LineChartController();
        this.window.content.appendChild(this.lineChart.generate());
        this.lineChart.setSize(this.window.width, this.window.height);
    }

    dataUpdate() {
        this.lineChart.setData(this.plotData);
    }

    createEvents(eh: EventHandler) {
        eh.on(this.window, AppWindow.event_resize, () => {
            this.lineChart.setSize(this.window.width, this.window.height);
        });
        eh.on(this.window, AppWindow.event_close, () => {
            this.close();
        });
    }

    close() {
        this.eh.close();
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
    gauge: GaugeController;
    val: number = 0;
    plotType: string = "GaugePlot";
    plotWindow: AppWindow;
    plotData: IPlotData;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Gauge Tester");
        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);

        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);
        
        this.window.addEventListener(AppWindow.event_resize, () => {
            this.gauge.setSize(this.window.width, this.window.height);
        });

    }

    drawMeter() {
        //this.window.content.innerHTML = "";                        
        this.gauge = new GaugeController(this.window.width, this.window.height, 0, 200, 20);
        let gaugeWrapper = this.gauge.generate();
        this.window.content.appendChild(gaugeWrapper);

        gaugeWrapper.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY / 3;
            this.val = this.val > 100 ? 100 : this.val;
            this.val = this.val < 0 ? 0 : this.val;
            this.gauge.setValue(this.val);
        });
    }

    dataUpdate() {
        this.gauge.setValue((this.plotData.getValue[this.plotData.getLength() - 1].y / 200) * 100);
    }
}

class GPSPlotTester implements IApplication {
    application: Application;
    window: AppWindow;
    points: Point3D[] = [];
    plot: GPSController;
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
        this.window.addEventListener(AppWindow.event_resize, () => {
            this.plot.setSize(this.window.width, this.window.height);
        });
    }

    draw(p: Point3D[]): void {                
        this.testData = new GPSPlotData(p);
        this.plot = new GPSController(this.testData);
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

        this.window.addEventListener(AppWindow.event_resize, () => {
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

        this.window.addEventListener(AppWindow.event_resize, () => {
            this.bar.setSize(this.window.width, this.window.height);
        });
    }


}