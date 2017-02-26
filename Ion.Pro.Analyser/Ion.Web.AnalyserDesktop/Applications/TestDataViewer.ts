class DataAssigner implements IApplication {
    application: Application;
    window: AppWindow;
    mk = new HtmlHelper();
    sensorTable: HTMLElement;
    eh: EventHandler = new EventHandler();

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        this.window.content.style.display = "flex";
        this.window.content.style.flexWrap = "wrap";
        this.draw();
        this.eh.on(kernel.senMan, SensorManager.event_registerViewer, () => this.draw());
    }

    draw() {
        this.window.content.innerHTML = "";
        let mk = this.mk;
        let divLeft = mk.tag("div");
        let divRight = this.sensorTable = mk.tag("div");
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: SensorManager = kernel.senMan;
        let last: HTMLElement = null;
        // let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        for (let i = 0; i < senMan.viewers.length; i++) {
            let curPlot = senMan.viewers[i];
            let isMulti = (<ICollectionViewer<any>>curPlot).dataCollectionSource !== undefined;

            this.drawRow(curPlot, isMulti, tableGen, last);
        }


        divLeft.appendChild(tableGen.generate());
        divLeft.style.minWidth = "250px";
        divLeft.style.flexGrow = "1";
        divLeft.style.overflowY = "auto";

        divRight.style.minWidth = "250px";
        divRight.style.flexGrow = "2";
        divRight.style.overflowY = "auto";

        this.window.content.appendChild(divLeft);
        this.window.content.appendChild(divRight);
    }


    private drawRow(curPlot: IViewerBase<any>, isMulti: boolean, tableGen: HtmlTableGen, last: HTMLElement): void {
        let name = "Single Plot";
        if (isMulti) {
            name = "Multi Plot";
        }
        tableGen.addRow([
            {
                event: "click", func: (e: Event) => {
                    if (last !== null) {
                        last.classList.remove("selectedrow");
                    }
                    last = this.findTableRow(<HTMLElement>e.target);
                    last.classList.add("selectedrow");
                    let sources = kernel.senMan.getDataSources(curPlot.type);
                    if (isMulti) {
                        //this.drawMultiSensors(<ICollectionViewer<any>>curPlot, sources);
                        kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawMultiSensors(<ICollectionViewer<any>>curPlot, x));
                    }
                    else {
                        
                        kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawSingleSensors(<IViewer<any>>curPlot, x));
                    }
                }
            },
            {
                event: "mouseenter", func: (e: Event) => {
                    curPlot.plotWindow.highlight(true);
                }
            },
            {
                event: "mouseleave", func: (e: Event) => {
                    curPlot.plotWindow.highlight(false);
                }
            },
        ], curPlot.plotType, name);
    }

    findTableRow(element: HTMLElement): HTMLElement {
        let curElement: HTMLElement = element;

        while (curElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    }


    drawSingleSensors(plot: IViewer<any>, info: SensorInformation[]) {
        this.drawSensors<IViewer<any>>(plot, info, this.createSingleSensor);
    }

    drawMultiSensors(plot: ICollectionViewer<any>, info: SensorInformation[]) {
        this.drawSensors<ICollectionViewer<any>>(plot, info, this.createMultiSensor);
    }


    createSingleSensor(plot: IViewer<any>, sensor: SensorInformation): HTMLElement {
        let radio = <HTMLInputElement>this.mk.tag("input");
        radio.type = "radio";
        radio.name = "sensor";
        if (plot.dataSource && plot.dataSource.infos.IDs[0] === sensor.ID) {
            radio.checked = true;
        }
        radio.addEventListener("change", (e: Event) => {
            radio.disabled = true;
            console.log("Single checkbox click");
            //kernel.senMan.getDataSources(plot.type);
            kernel.senMan.getSensorData(sensor.ID, (data: SensorDataContainer) => {
                plot.dataSource = new PointSensorGroup(data);
                plot.dataUpdate();
                radio.disabled = false;
            });
        });
        return radio;
    }

    createMultiSensor(plot: ICollectionViewer<any>, sensor: SensorInformation): HTMLElement {
        let checkBox = <HTMLInputElement>this.mk.tag("input");
        checkBox.type = "checkbox";
        for (let i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i].infos.IDs[0] === sensor.ID) {
                checkBox.checked = true;
                break;
            }
        }

        checkBox.addEventListener("change", (e: Event) => {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                kernel.senMan.getSensorData(sensor.ID, (data: SensorDataContainer) => {
                    plot.dataCollectionSource.push(new PointSensorGroup(data));
                    plot.dataUpdate();
                    checkBox.disabled = false;
                });
            }
            else {
                for (let i = 0; i < plot.dataCollectionSource.length; i++) {
                    if (plot.dataCollectionSource[i].infos.IDs[0] === sensor.ID) {
                        plot.dataCollectionSource.splice(i, 1);
                        plot.dataUpdate();
                        checkBox.disabled = false;
                        break;
                    }
                }
            }
        });
        return checkBox;
    }

    drawSensors<T extends IViewerBase<any>>(plot: T, info: SensorInformation[], drawMethod: (plot: T, sensor: SensorInformation) => HTMLElement) {
        this.sensorTable.innerHTML = "";
        for (let i = 0; i < info.length; i++) {
            let sensor = info[i];
            let ctrl = drawMethod.call(this, plot, sensor);
            let label = this.mk.tag("label");
            label.title = sensor.ID.toString() + " (0x" + sensor.ID.toString(16) + ") " + (sensor.Key ? sensor.Key : " No key found");
            if (!sensor.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ") ") + sensor.Name));
            this.sensorTable.appendChild(label);
            this.sensorTable.appendChild(this.mk.tag("br"));
        }
    }
}

/*class TestDataViewer implements IApplication, ISinglePlot {
    application: Application;
    window: AppWindow;
    plotData: IPlotData1;
    plotType: string = "Test Data Viewer";
    plotWindow: AppWindow;
    plotDataType = PlotType.I1D;

    main(): void {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
        kernel.senMan.registerDeprecated(this);
    }

    draw(): void {
        let gen = new HtmlTableGen("table");
        gen.addHeader("Value", "Timestamp");

        for (let i = 0; i < this.plotData.getLength() && i < 10; i++) {
            gen.addRow(this.plotData.getValue(i).x, this.plotData.getValue(i).y);
        }

        this.window.content.appendChild(gen.generate());

        // console.log("Here we should draw something, but you know, we are lazy");
    }

    dataUpdate(): void {
        this.draw();
    }
}
*/
class SensorSetSelector implements IApplication {
    public application: Application;
    private window: AppWindow;
    private mk = new HtmlHelper();
    private wrapper: HTMLElement;

    public main(): void {
        this.wrapper = this.mk.tag("div");
        this.window = kernel.winMan.createWindow(this.application, "Sensor Selector");
        requestAction("GetAvaiableSets", (data: ISensorSetInformation[]) => this.drawData(data));
        this.window.content.appendChild(this.wrapper);
    }

    private drawData(data: ISensorSetInformation[]): void {
        this.wrapper.innerHTML = "";
        var table = new HtmlTableGen("table selectable");

        table.addHeader("File name", "File size", "Sensor reader");
        for (let a of data) {
            table.addRow(
                [
                    {
                        "event": "click",
                        "func": (event: Event) => {
                            // console.log("you clicked on: " + a.FileName);
                            requestAction("LoadDataset?file=" + a.FullFileName, (data: any) => { });
                            kernel.senMan.clearCache();
                        }
                    }
                ],
                a.FileName,
                a.Size,
                a.FileReader
            );
        }

        this.wrapper.appendChild(table.generate());
    }
}

interface ISensorSetInformation {
    FileName: string;
    FullFileName: string;
    Size: number;
    FileReader: string;
}