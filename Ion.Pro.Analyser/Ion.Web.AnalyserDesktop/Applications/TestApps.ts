class TestViewer implements IApplication {
    app: Application;
    window: AppWindow;
    window2: AppWindow;
    helloData: IHelloPackage;
    mk: HtmlHelper;

    main(): void {
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.app, "Test Window");

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

interface IConfigurable {
    settings: IStorageList;
    settingsChanged: (key: string, value: IStorageObject<keyof IStorageTypes>) => void;
}

class ConfigWindow implements IApplication {
    app: Application;
    mainWindow: AppWindow;
    main(client: IConfigurable): void {
        this.mainWindow = kernel.winMan.createWindow(this.app, "Configure window");
        this.mainWindow.setSize(330, 230);
        if (client.settings) {
            for (const i in client.settings) {
                const temp = client.settings[i];
                const row = document.createElement("div");
                row.style.margin = "10px";
                const text = document.createElement("span");
                if (temp.shortCut) {
                    text.appendChild(document.createTextNode(temp.text + " (" + temp.shortCut + ")"));
                }
                else {
                    text.appendChild(document.createTextNode(temp.text));
                }
                text.title = temp.longText;
                row.appendChild(text);
                switch (temp.type) {
                    case "boolean":
                        const sw = new Switch();
                        sw.checked = temp.value as boolean;
                        sw.onCheckedChange.addEventListener((e: ISwitchEvent) => {
                            temp.value = e.newValue;
                            client.settingsChanged(i, temp);
                        });
                        sw.wrapper.style.cssFloat = "right";
                        row.appendChild(sw.wrapper);
                        break;
                    case "action":
                        const but = new TextButton();
                        but.text = temp.text;
                        but.onclick.addEventListener(() => {
                            (temp.value as () => void)();
                            client.settingsChanged(i, temp);
                        });
                        but.wrapper.style.cssFloat = "right";
                        row.appendChild(but.wrapper);
                        break;
                    case "direction":
                        const btn = new TextButton();
                        btn.text = "Toggle";
                        btn.onclick.addEventListener(() => {
                            temp.value = temp.value === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
                            client.settingsChanged(i, temp);
                        });
                        btn.wrapper.style.cssFloat = "right";
                        row.appendChild(btn.wrapper);
                        break;
                }
                this.mainWindow.content.appendChild(row);
            }
        }
        else {
            console.log("That's not a configurable item");
        }
    }
}

class SVGEditor implements IApplication {
    app: Application;
    window: AppWindow;
    mk: HtmlHelper = new HtmlHelper();
    svgCanvas: SVGSVGElement;

    main(): void {

        this.window = kernel.winMan.createWindow(this.app, "SVG Editor");
        //this.window.content.addEventListener("click", (e) => this.mouseClick(e));
        this.window.content.addEventListener("mousedown", (e) => this.mouseDown(e));
        this.window.content.addEventListener("mousemove", (e) => this.mouseMove(e));
        this.window.content.addEventListener("mouseup", (e) => this.mouseUp(e));
        this.svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgCanvas.style.width = "100%";
        this.svgCanvas.style.height = "calc(100% - 5px)";
        this.window.content.appendChild(this.svgCanvas);

    }

    curLine: SVGLineElement | null = null;

    mouseDown(e: MouseEvent) {
        this.curLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const a = this.curLine;
        a.x1.baseVal.value = e.layerX;
        a.x2.baseVal.value = e.layerX;
        a.y1.baseVal.value = e.layerY;
        a.y2.baseVal.value = e.layerY;
        a.style.stroke = "white";
        a.style.strokeWidth = "1px";
        this.svgCanvas.appendChild(a);
    }

    mouseMove(e: MouseEvent) {
        const a = this.curLine;
        if (a) {
            a.x2.baseVal.value = e.layerX;
            a.y2.baseVal.value = e.layerY;
        }
    }

    mouseUp(e: MouseEvent) {
        this.curLine = null;
    }

    mouseClick(e: MouseEvent) {
        console.log(e);
        const a = document.createElementNS("http://www.w3.org/2000/svg", "line");
        a.x1.baseVal.value = 0;
        a.x2.baseVal.value = e.layerX;
        a.y1.baseVal.value = 0;
        a.y2.baseVal.value = e.layerY;
        a.style.stroke = "white";
        a.style.strokeWidth = "1px";
        this.svgCanvas.appendChild(a);
    }
}

/*class DataViewer implements IApplication {
    app: Application;
    window: AppWindow;
    data: ISensorPackage[];

    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.app, "Data Viewer");
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
}*/

class CsvGenerator implements IApplication {
    public app: Application;
    private window: AppWindow;
    private mk: HtmlHelper = new HtmlHelper();

    public main() {
        this.window = kernel.winMan.createWindow(this.app, "CSV Creator");
        this.draw();
    }

    private createInput(inputType: string,
                        name: string,
                        value: string,
                        checked: boolean = false,
                        disabled: boolean = false): HTMLInputElement {

        const input = this.mk.tag("input") as HTMLInputElement;
        input.type = inputType;
        input.checked = checked;
        input.name = name;
        input.value = value;
        input.disabled = disabled;
        return input;
    }

    private createContainer<T extends HTMLElement>(container: string, ...childs: Array<Node | Node[]>): T {
        const element = this.mk.tag(container) as T;
        for (const a of childs) {
            if (Array.isArray(a)) {
                for (const b of a) {
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
            childs,
        );
    }

    private createLabelWithContent(...childs: Node[]): HTMLLabelElement {
        return this.createContainer<HTMLLabelElement>("label", childs);
    }

    public draw() {
        const form = this.mk.tag("form") as HTMLFormElement;
        form.action = "/test/csv";
        form.method = "GET";
        // let formatFields = <HTMLFieldSetElement>this.mk.tag("fieldset");
        // formatFields.appendChild(this.mk.tag("legende", "", null, "Format"));

        const formatFields = this.createFieldSet(
            "Format",
            this.createLabelWithContent(
                this.createInput("radio", "encoding", "nor", true),
                this.mk.tag("span", "", null, "Semicolon seperated"),
            ),
            this.mk.tag("br"),
            this.createLabelWithContent(
                this.createInput("radio", "encoding", "int"),
                this.mk.tag("span", "", null, "Comma seperated"),
            ),
        );
        const valueFields = this.createFieldSet(
            "Values",
            this.createLabelWithContent(
                this.createInput("radio", "values", "real", true),
                this.mk.tag("span", "", null, "Real Values"),
            ),
            this.mk.tag("br"),
            this.createLabelWithContent(
                this.createInput("radio", "values", "raw", false, true),
                this.mk.tag("span", "disabled", null, "Raw Values"),
            ),
        );
        const titleLabel = this.createLabelWithContent(
            this.createInput("checkbox", "title", "checked", true),
            this.mk.tag("span", "", null, "Raw Values"),
        );
        const submit = this.createInput("submit", "", "Download csv");

        form.appendChild(formatFields);
        form.appendChild(valueFields);
        form.appendChild(titleLabel);
        form.appendChild(this.mk.tag("br"));
        form.appendChild(submit);

        this.window.content.appendChild(form);
    }
}

class StorageTester implements IApplication {
    public app: Application;

    public main(): void {

    }
}

class LineChartTester implements IApplication, ICollectionViewer<Point> {
    plotType: string = "Line Chart";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataCollectionSource: Array<IDataSource<Point>> = [];

    app: Application;
    window: AppWindow;
    lineChart: LineChartController;
    data: ISensorPackage[];
    testWindow = new MenuWindow(document.body);

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Line Chart");
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            this.testWindow.x = e.x;
            this.testWindow.y = e.y;
            this.testWindow.show();
        };
        this.testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataSourceBuilder", this);
            },
        });
        this.testWindow.add({
            name: "Configure", runner: () => {
                kernel.appMan.start("ConfigWindow", this.lineChart);
            },
        });

        this.window.content.style.overflow = "hidden";

        this.lineChart = new LineChartController();
        this.window.content.appendChild(this.lineChart.generate());
        this.lineChart.setSize(this.window.width, this.window.height);

        kernel.senMan.register(this);
        this.createEvents(this.app.events);
    }

    private window_close() {
        console.log("Unregister from sensys");
        kernel.senMan.unregister(this);
    }

    dataUpdate() {
        this.lineChart.setData(this.dataCollectionSource);
    }

    private createEvents(eh: EventHandler) {
        eh.on(this.window.onResize, () => {
            this.lineChart.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
        eh.on(kernel.winMan.onThemeChange, () => {
            this.darkTheme = !this.darkTheme;
            this.lineChart.updateColors();
        });

    }

    darkTheme: boolean = true;
}

class GaugeTester implements IApplication, IViewer<Point> {
    plotType: string = "Gauge";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> | null = null;

    app: Application;
    window: AppWindow;
    gauge: GaugeController;
    val: number = 0;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Gauge");

        const testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataSourceBuilder", this);
            },
        });

        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);

        this.drawMeter();
        this.gauge.setSize(this.window.width, this.window.height);

        this.createEvents(this.app.events);
    }

    private createEvents(eh: EventHandler) {
        this.window.onResize.addEventListener(() => {
            this.gauge.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
        this.app.events.on(kernel.winMan.onThemeChange, () => {
            this.gauge.updateColors();
        });
    }

    private window_close() {
        kernel.senMan.unregister(this);
    }

    drawMeter() {
        this.gauge = new GaugeController(this.window.width, this.window.height);
        const gaugeWrapper = this.gauge.wrapper;
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
    dataSource: IDataSource<Point3D> | null = null;

    app: Application;
    window: AppWindow;
    points: Point3D[] = [];
    plot: GPSController;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "GPS Viewer");

        const testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataSourceBuilder", this);
            },
        });

        this.window.content.style.overflow = "hidden";
        this.plot = new GPSController(this.window.width, this.window.height);
        this.window.content.appendChild(this.plot.generate());
        kernel.senMan.register(this);

        this.createEvents(this.app.events);
    }

    private createEvents(eh: EventHandler) {
        this.window.onResize.addEventListener(() => {
            this.plot.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
    }

    private window_close() {
        kernel.senMan.unregister(this);
    }

    dataUpdate() {
        this.plot.setData(this.dataSource);
    }
}

class LabelTester implements IApplication, IViewer<Point> {
    plotType: string = "Label";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> | null = null;

    app: Application;
    window: AppWindow;
    label: LabelController;
    val: number = 0;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Label");
        this.window.setSize(350, 180);
        const testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataSourceBuilder", this);
            },
        });

        this.window.content.style.overflow = "hidden";
        kernel.senMan.register(this);

        this.label = new LabelController(this.window.width, this.window.height);
        const div = this.label.wrapper;
        this.window.content.appendChild(div);

        this.createEvents(this.app.events);
    }

    private createEvents(eh: EventHandler) {
        this.window.onResize.addEventListener(() => {
            this.label.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
    }

    private window_close() {
        kernel.senMan.unregister(this);
    }

    dataUpdate() {
        this.label.setData(this.dataSource);
    }
}

class BarTester implements IApplication, IViewer<Point> {
    plotType: string = "Bar Chart";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> | null = null;

    app: Application;
    window: AppWindow;
    bar: BarController;
    val: number = 0;

    main() {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.app, "Bar Chart");
        this.window.setSize(300, this.window.height);

        const testWindow: MenuWindow = new MenuWindow(document.body);
        this.plotWindow.content.oncontextmenu = (e: MouseEvent) => {
            testWindow.x = e.x;
            testWindow.y = e.y;
            testWindow.show();
        };
        testWindow.add({
            name: "Change data", runner: () => {
                kernel.appMan.start("DataSourceBuilder", this);
            },
        });
        testWindow.add({
            name: "Configure", runner: () => {
                kernel.appMan.start("ConfigWindow", this.bar);
            },
        });

        this.window.content.style.overflow = "hidden";

        kernel.senMan.register(this);
        this.bar = new BarController(this.window.width, this.window.height, Direction.Vertical);
        const barWrapper = this.bar.wrapper;
        this.window.content.appendChild(barWrapper);

        this.createEvents(this.app.events);

        /*
        barWrapper.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.key) {
                case "j":
                    this.val += 0.1;
                    break;
                case "k":
                    this.val -= 0.1;
            }

            this.val = this.val < 0 ? 0 : this.val;
            this.val = this.val > 1 ? 1 : this.val;
            this.bar.test_setValue(this.val);
        });*/
    }

    private createEvents(eh: EventHandler) {
        this.window.onResize.addEventListener(() => {
            this.bar.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
    }

    private window_close() {
        kernel.senMan.unregister(this);
    }

    dataUpdate(): void {
        this.bar.setData(this.dataSource);
    }

}

class LegacyRPIManager implements IApplication {
    public app: Application;
    public window: AppWindow;
    private mk: HtmlHelper = new HtmlHelper();

    public main() {
        this.window = kernel.winMan.createWindow(this.app, "Legacy RPI Manager");
        const wrapper = this.mk.tag("div");

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("ConnectLegacy", null);
            },
        }], "Connect"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("Status", null);
            },
        }], "Status"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("StartReceive", null);
            },
        }], "StartReceive"));

        wrapper.appendChild(this.mk.tag("button", "", [{
            event: "click",
            func: (event: Event) => {
                requestAction("StopReceive", null);
            },
        }], "StopReceive"));
        this.window.content.appendChild(wrapper);
    }
}

class SteeringWheelTester implements IApplication, IViewer<Point> {
    plotType: string = "Steering Wheel";
    plotWindow: AppWindow;
    type: IClassType<Point> = Point;
    dataSource: IDataSource<Point> | null = null;

    app: Application;
    window: AppWindow;
    wheel: SteeringWheelController;
    val: number = 0.5;

    main() {
        this.window = kernel.winMan.createWindow(this.app, "Steering wheel");
        this.window.content.style.overflow = "hidden";
        this.plotWindow = this.window;
        kernel.senMan.register(this);
        this.wheel = new SteeringWheelController(this.window.width, this.window.height);
        const wheelWrapper = this.wheel.generate();
        this.window.content.appendChild(wheelWrapper);
        this.wheel.setPer(this.val);

        //wheelWrapper.addEventListener("wheel", (e: WheelEvent) => {
        //    this.val -= e.deltaY / 100;
        //    this.val = this.val < 0 ? 0 : this.val;
        //    this.val = this.val > 1 ? 1 : this.val;
        //    this.wheel.setPer(this.val);
        //});

        this.createEvents(this.app.events);
    }

    private createEvents(eh: EventHandler) {
        this.window.onResize.addEventListener(() => {
            this.wheel.setSize(this.window.width, this.window.height);
        });
        eh.on(this.plotWindow.onClose, () => {
            this.window_close();
        });
    }

    private window_close() {
        kernel.senMan.unregister(this);
    }

    dataUpdate(): void {
        this.wheel.setData(this.dataSource);
    }

}
