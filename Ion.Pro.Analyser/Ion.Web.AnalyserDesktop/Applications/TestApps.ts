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

class DataViewer implements IApplication {
    application: Application;
    window: AppWindow;
    data: ISensorPackage[];

    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        //kernel.senMan.getLoadedInfos((ids: SensorInformation[]) => this.draw(ids));
    }

    draw(data: SensorInformation[]): void {
        var mk = new HtmlHelper();

        var table = new HtmlTableGen("table");
        table.addHeader("ID", "Name", "Unit");

        for (var i = 0; i < data.length; i++) {
            let curValue = data[i];
            table.addRow([
                {
                    event: "click", func: () => {
                    }
                },
                (!curValue.Key ? { field: "className", data: "error" } : {})
            ],
                curValue.ID, curValue.Name, curValue.Unit ? curValue.Unit : "");
        }
        this.window.content.appendChild(table.generate());


        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
        //kernel.senMan.addEventListener(SensorManager.event_globalPlot, (data: ISensorPackage[]) => this.drawInner(data));
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

class CsvGenerator implements IApplication {
    public application: Application;
    private window: AppWindow;
    private mk: HtmlHelper = new HtmlHelper();

    public main() {
        this.window = kernel.winMan.createWindow(this.application, "CSV Creator");
        this.draw();
    }

    private createInput(inputType: string,
                        name: string,
                        value: string,
                        checked: boolean = false,
                        disabled: boolean = false): HTMLInputElement {

        let input = <HTMLInputElement>this.mk.tag("input");
        input.type = inputType;
        input.checked = checked;
        input.name = name;
        input.value = value;
        input.disabled = disabled;
        return input;
    }

    private createContainer<T extends HTMLElement>(container: string, ...childs: (Node | Node[])[]): T {
        let element = <T>this.mk.tag(container);
        for (let a of childs) {
            if (Array.isArray(a)) {
                for (let b of a) {
                    element.appendChild(b);
                }
            }
            else {
                element.appendChild(a);
            }
        }
        return element;
    }

    private createFieldSet(legende: string, ...childs: Node[]): HTMLFieldSetElement {
        return this.createContainer<HTMLFieldSetElement>(
            "fieldset",
            this.mk.tag("legend", "", null, legende),
            childs
        );
    }

    private createLabelWithContent(...childs: Node[]): HTMLLabelElement {
        return this.createContainer<HTMLLabelElement>("label", childs);
    }

    public draw() {
        let form = <HTMLFormElement>this.mk.tag("form");
        form.action = "/test/csv";
        form.method = "GET";
        // let formatFields = <HTMLFieldSetElement>this.mk.tag("fieldset");
        // formatFields.appendChild(this.mk.tag("legende", "", null, "Format"));

        let formatFields = this.createFieldSet(
            "Format",
            this.createLabelWithContent(
                this.createInput("radio", "encoding", "nor", true),
                this.mk.tag("span", "", null, "Semicolon seperated")
            ),
            this.mk.tag("br"),
            this.createLabelWithContent(
                this.createInput("radio", "encoding", "int"),
                this.mk.tag("span", "", null, "Comma seperated")
            ),
        );
        let valueFields = this.createFieldSet(
            "Values",
            this.createLabelWithContent(
                this.createInput("radio", "values", "real", true),
                this.mk.tag("span", "", null, "Real Values")
            ),
            this.mk.tag("br"),
            this.createLabelWithContent(
                this.createInput("radio", "values", "raw", false, true),
                this.mk.tag("span", "disabled", null, "Raw Values")
            ),
        );
        let titleLabel = this.createLabelWithContent(
            this.createInput("checkbox", "title", "checked", true),
            this.mk.tag("span", "", null, "Raw Values")
        );
        let submit = this.createInput("submit", "", "Download csv");


        form.appendChild(formatFields);
        form.appendChild(valueFields);
        form.appendChild(titleLabel);
        form.appendChild(this.mk.tag("br"));
        form.appendChild(submit);

        this.window.content.appendChild(form);
    }
}

class StorageTester implements IApplication {
    public application: Application;

    public main(): void {
        
    }
}



class LineChartTester implements IApplication, ICollectionViewer<Point> {
    plotType: string = "Line Chart";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataCollectionSource: IDataSource<Point>[] = [];
    

    application: Application;
    window: AppWindow;
    lineChart: LineChartController;
    data: ISensorPackage[];
    eh: EventHandler = new EventHandler();
    testWindow = new MenuWindow(document.body);


    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Line Chart");
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            this.testWindow.x = e.x;
            this.testWindow.y = e.y;
            this.testWindow.show();
        };
        this.testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataAssigner", this);
            }
        });

        this.eh.on(this.plotWindow, AppWindow.event_close, () => this.window_close());

        this.window.content.style.overflow = "hidden";

        this.lineChart = new LineChartController();
        this.window.content.appendChild(this.lineChart.generate());
        this.lineChart.setSize(this.window.width, this.window.height);

        
        kernel.senMan.register(this);
        this.createEvents(this.eh);
    }

    private window_close() {
        console.log("closing");
        kernel.senMan.unregister(this);
        this.eh.close();
    }

    dataUpdate() {
        this.lineChart.setData(this.dataCollectionSource);
    }

    createEvents(eh: EventHandler) {
        eh.on(this.window, AppWindow.event_resize, () => {
            this.lineChart.setSize(this.window.width, this.window.height);
        });
        eh.on(this.window, AppWindow.event_close, () => {
            this.close();
        });
        eh.on(this.plotWindow, AppWindow.event_close, () => {
            this.window_close()
        });
        eh.on(kernel.winMan, WindowManager.event_themeChange, () => {
            this.darkTheme = !this.darkTheme;
            this.lineChart.updateTheme();
        });
                
    }

    darkTheme: boolean = true;

    close() {
        this.eh.close();
    }
}

class GaugeTester implements IApplication, IViewer<Point> {
    plotType: string = "Gauge";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> = null;

    application: Application;
    window: AppWindow;
    gauge: GaugeController;
    val: number = 0;

    

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Gauge");

        let testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataAssigner", this);
            }
        });

        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);

        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);

        this.window.addEventListener(AppWindow.event_resize, () => {
            this.gauge.setSize(this.window.width, this.window.height);
        });
    }

    drawMeter() {
        this.gauge = new GaugeController(this.window.width, this.window.height, 0, 200, 20);
        let gaugeWrapper = this.gauge.generate();
        this.window.content.appendChild(gaugeWrapper);
    }

    dataUpdate() {
        this.gauge.setData(this.dataSource);
    }
}

class GPSPlotTester implements IApplication, IViewer<Point3D> {
    plotType: string = "GPS";
    plotWindow: AppWindow;
    type: IClassType<Point3D> = Point3D;
    dataSource: IDataSource<Point3D> = null;

    application: Application;
    window: AppWindow;
    points: Point3D[] = [];
    plot: GPSController;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "GPS Viewer");

        let testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataAssigner", this);
            }
        });

        this.window.content.style.overflow = "hidden";
        this.plot = new GPSController(this.window.width, this.window.height);
        this.window.content.appendChild(this.plot.generate());
        kernel.senMan.register(this);
        /*kernel.senMan.getData(252, (d: ISensorPackage[]) => {
            for (let i = 0; i < d.length; i++) {
                this.points.push(new Point3D(d[i].TimeStamp, d[i].Value, 1));
            }
            this.testData = new GPSPlotData(this.points);
            this.draw();
        });*/
        this.window.addEventListener(AppWindow.event_resize, () => {
            this.plot.setSize(this.window.width, this.window.height);
        });
    }

    dataUpdate() {
        this.plot.setData(this.dataSource);
    }
}

class LabelTester implements IApplication, IViewer<Point> {
    plotType: string = "Label";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> = null;

    application: Application;
    window: AppWindow;
    label: LabelController;
    val: number = 0;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Label");
        let testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataAssigner", this);
            }
        });

        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);

        this.label = new LabelController(this.window.width, this.window.height);
        let div = this.label.generate();
        this.window.content.appendChild(div);        

        /*
        div.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY;
            this.label.setValue(this.val);
        });*/

        this.window.addEventListener(AppWindow.event_resize, () => {
            this.label.setSize(this.window.width, this.window.height);
        });
    }

    dataUpdate() {
        this.label.setData(this.dataSource);
    }
}

class BarTester implements IApplication, IViewer<Point> {
    plotType: string = "Bar Chart";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> = null;

    application: Application;
    window: AppWindow;
    bar: BarController;
    val: number = 0;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Bar Chart");

        let testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataAssigner", this);
            }
        });

        this.window.content.style.overflow = "hidden";
        
        kernel.senMan.register(this);
        this.bar = new BarController(this.window.width, this.window.height, Direction.Horizontal);
        let barWrapper = this.bar.generate();
        this.window.content.appendChild(barWrapper);

        this.window.addEventListener(AppWindow.event_resize, () => {
            this.bar.setSize(this.window.width, this.window.height);
        });
    }

    dataUpdate(): void {
        this.bar.setData(this.dataSource);
    }

}


class LegacyRPIManager implements IApplication {
    public application: Application;
    public window: AppWindow;
    private mk: HtmlHelper = new HtmlHelper();

    public main() {
        this.window = kernel.winMan.createWindow(this.application, "Legacy RPI Manager");
        let wrapper = this.mk.tag("div");

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("ConnectLegacy", null);
            }
        }], "Connect"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("Status", null);
            }
        }], "Status"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("StartReceive", null);
            }
        }], "StartReceive"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("StopReceive", null);
            }
        }], "StopReceive"));
        this.window.content.appendChild(wrapper);
    }
}

class SteeringWheelTester implements IViewer<Point> {
    application: Application;
    window: AppWindow;
    wheel: SteeringWheelController;
    val: number = 0.5;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> = null;
    plotType: string = "Bar";
    plotWindow: AppWindow;

    main() {
        this.window = kernel.winMan.createWindow(this.application, "Steering wheel");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.wheel = new SteeringWheelController(this.window.width, this.window.height);
        let wheelWrapper = this.wheel.generate();
        this.window.content.appendChild(wheelWrapper);
        this.wheel.setPer(this.val);

        wheelWrapper.addEventListener("wheel", (e: WheelEvent) => {
            this.val -= e.deltaY / 100;
            this.val = this.val < 0 ? 0 : this.val;
            this.val = this.val > 1 ? 1 : this.val;
            this.wheel.setPer(this.val);
        });

        this.window.addEventListener(AppWindow.event_resize, () => {
            this.wheel.setSize(this.window.width, this.window.height);
        });
    }

    dataUpdate(): void {
        this.wheel.setData(this.dataSource);
    }

}
