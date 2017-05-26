class DataAssigner implements IApplication {
    app: Application;
    window: AppWindow;
    mk = new HtmlHelper();
    sensorTable: HTMLElement;
    selected: IViewerBase<any>;

    main(preSelect: any): void {
        this.window = kernel.winMan.createWindow(this.app, "Data Assigner");
        this.window.content.style.display = "flex";
        this.window.content.style.flexWrap = "wrap";
        this.selected = preSelect;
        this.draw();

        this.app.events.on(kernel.senMan.onRegisterViewer, () => this.draw());
        this.app.events.on(kernel.senMan.onUnRegisterViewer, () => this.draw());
    }

    draw() {
        this.window.content.innerHTML = "";
        let mk = this.mk;
        let divLeft = mk.tag("div");
        let divRight = this.sensorTable = mk.tag("div");
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: sensys.SensorManager = kernel.senMan;
        let last: { item: HTMLElement | null } = { item: null };
        // let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        for (let i = 0; i < senMan.viewers.length; i++) {
            let curPlot = senMan.viewers[i];
            let isMulti = (<ICollectionViewer<any>>curPlot).dataCollectionSource !== undefined;
            if (this.selected) {
                this.drawRow(curPlot, isMulti, tableGen, last, true);
            }
            else {
                this.drawRow(curPlot, isMulti, tableGen, last, false);
            }
            
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


    private drawRow(curPlot: IViewerBase<any>, isMulti: boolean, tableGen: HtmlTableGen, last: { item: HTMLElement | null }, preSelect: boolean): void {
        let name = "Single Plot";
        if (isMulti) {
            name = "Multi Plot";
        }
        tableGen.addRow([   
            {
                event: "click", func: (e: Event) => {
                    if (last.item !== null) {
                        last.item.classList.remove("selectedrow");
                    }
                    last.item = this.findTableRow(<HTMLElement>e.target);
                    last.item.classList.add("selectedrow");
                    let sources = kernel.senMan.getDataSources(curPlot.type);
                    if (isMulti) {
                        this.drawMultiSensors(<ICollectionViewer<any>>curPlot, sources);
                    }
                    else {
                        this.drawSingleSensors(<IViewer<any>>curPlot, sources);
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

        let sources = kernel.senMan.getDataSources(curPlot.type);
        if (isMulti) {
            this.drawMultiSensors(<ICollectionViewer<any>>curPlot, sources);
        }
        else {
            this.drawSingleSensors(<IViewer<any>>curPlot, sources);
        }
    }

    findTableRow(element: HTMLElement): HTMLElement {
        let curElement: HTMLElement = element;

        while (curElement.parentElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    }


    drawSingleSensors(plot: IViewer<any>, info: IDataSource<any>[]) {
        this.drawSensors<IViewer<any>>(plot, info, this.createSingleSensor);
    }

    drawMultiSensors(plot: ICollectionViewer<any>, info: IDataSource<any>[]) {
        this.drawSensors<ICollectionViewer<any>>(plot, info, this.createMultiSensor);
    }


    createSingleSensor(plot: IViewer<any>, sensor: IDataSource<any>): HTMLElement {
        let radio = <HTMLInputElement>this.mk.tag("input");
        radio.type = "radio";
        radio.name = "sensor";
        if (plot.dataSource && plot.dataSource === sensor) {
            radio.checked = true;
        }
        radio.addEventListener("change", (e: Event) => {
            radio.disabled = true;
            console.log("Single checkbox click");
            plot.dataSource = sensor;
            if (sensor.length() == 0) {
                kernel.senMan.fillDataSource(sensor, () => {
                    plot.dataUpdate();
                    radio.disabled = false;
                });
            }
            else
            {
                plot.dataUpdate();
                radio.disabled = false;
            }
            
        });
        return radio;
    }

    createMultiSensor(plot: ICollectionViewer<any>, sensor: IDataSource<any>): HTMLElement {
        let checkBox = <HTMLInputElement>this.mk.tag("input");
        checkBox.type = "checkbox";
        for (let i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i] === sensor) {
                checkBox.checked = true;
                break;
            }
        }

        checkBox.addEventListener("change", (e: Event) => {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                plot.dataCollectionSource.push(sensor);
                if (sensor.length() == 0) {
                    kernel.senMan.fillDataSource(sensor, () => {
                        plot.dataUpdate();
                        checkBox.disabled = false;
                    });
                }
                else {
                    plot.dataUpdate();
                    checkBox.disabled = false;
                }
            }
            else {
                for (let i = 0; i < plot.dataCollectionSource.length; i++) {
                    if (plot.dataCollectionSource[i] === sensor) {
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

    drawSensors<T extends IViewerBase<any>>(plot: T, info: IDataSource<any>[], drawMethod: (plot: T, sensor: IDataSource<any>) => HTMLElement) {
        this.sensorTable.innerHTML = "";
        for (let i = 0; i < info.length; i++) {
            let sensor = info[i];
            let ctrl = drawMethod.call(this, plot, sensor);
            let label = this.mk.tag("label", "listitem");
            let firstInfo = sensor.infos.SensorInfos[0];
            label.title = firstInfo.ID.toString() + " (0x" + firstInfo.ID.toString(16) + ") " + (firstInfo.Key.toString() === firstInfo.Key ? firstInfo.Key : " No key found");
            if (firstInfo.ID.toString() === firstInfo.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            let innerBox = this.mk.tag("div");
            innerBox.style.display = "inline-block";
            innerBox.style.verticalAlign = "middle";
            innerBox.appendChild(this.mk.tag("div", "", null, firstInfo.Name));
            innerBox.appendChild(this.mk.tag("div", "small", null, firstInfo.SensorSet.Name));
            label.appendChild(innerBox);
            //label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ") ") + sensor.Name));
            //label.appendChild(document.createTextNode(firstInfo.Name));
            this.sensorTable.appendChild(label);
            //this.sensorTable.appendChild(this.mk.tag("br"));
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
    public app: Application;
    private window: AppWindow;
    private mk = new HtmlHelper();
    private wrapper: HTMLElement;

    public main(): void {
        this.wrapper = this.mk.tag("div");
        this.window = kernel.winMan.createWindow(this.app, "Sensor Selector");
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
                            kernel.senMan.load(a.FullFileName);
                            //requestAction("LoadDataset?file=" + a.FullFileName, (data: any) => { });
                            //kernel.senMan.clearCache();
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