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
        let gen = new HtmlTableGen("table");
        gen.addHeader("Value", "Timestamp");

        for (let i = 0; i < this.plotData.points.length && i < 10; i++) {
            gen.addRow(this.plotData.points[i].x, this.plotData.points[i].y);
        }

        this.window.content.appendChild(gen.generate());

        //console.log("Here we should draw something, but you know, we are lazy");
    }

    dataUpdate(): void {
        this.draw();
    }
}

class DataAssigner implements IApplication {
    application: Application;
    window: AppWindow;
    mk = new HtmlHelper();
    sensorTable: HTMLElement;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        this.window.content.style.display = "flex";
        this.draw();
    }

    draw() {
        let mk = this.mk;
        let divLeft = mk.tag("div");
        let divRight = this.sensorTable = mk.tag("div");
        let tableGen = new HtmlTableGen("table");
        let senMan: SensorManager = kernel.senMan;
        tableGen.addHeader("Plot name", "plot type");
        for (let i = 0; i < senMan.plotter.length; i++) {
            let curPlot = senMan.plotter[i];
            let isMulti = Array.isArray((<any>curPlot).plotData);

            if (isMulti) {
                tableGen.addRow([{
                    event: "click", func: () => {
                        kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawMultiSensors(<IMultiPlot>curPlot, x));
                    }
                }], curPlot.plotType, "Multi Plot");
            }
            else {
                tableGen.addRow([{
                    event: "click", func: () => {
                        kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawSingleSensors(<ISinglePlot>curPlot, x));
                    }
                }], curPlot.plotType, "Single Plot");
            }
        }
        divLeft.appendChild(tableGen.generate());
        divLeft.style.width = "50%";
        divRight.style.width = "50%";
        divLeft.style.overflowY = "auto";
        divRight.style.overflowY = "auto";
        this.window.content.appendChild(divLeft);
        this.window.content.appendChild(divRight);
        
    }

    convertData(si: SensorInformation, data: ISensorPackage[]): PlotData {
        let p: Point[] = [];
        for (let i = 0; i < data.length; i++) {
            p[i] = new Point(data[i].TimeStamp, data[i].Value);
        }
        let a = new PlotData(p);
        a.ID = si.ID;
        return a;
    }


    drawSingleSensors(plot: ISinglePlot, info: SensorInformation[]) {
        this.drawSensors<ISinglePlot>(plot, info, this.createSingleSensor);
    }

    drawMultiSensors(plot: IMultiPlot, info: SensorInformation[]) {
        this.drawSensors<IMultiPlot>(plot, info, this.createMultiSensor);
    }


    createSingleSensor(plot: ISinglePlot, sensor: SensorInformation): HTMLElement {
        let radio = <HTMLInputElement>this.mk.tag("input");
        radio.type = "radio";
        radio.name = "sensor";
        radio.addEventListener("input", (e: Event) => {
            kernel.senMan.getData(sensor.ID, (data: ISensorPackage[]) => {
                plot.plotData = this.convertData(sensor, data);
                plot.dataUpdate();
            });
        });
        return radio;
    }

    createMultiSensor(plot: IMultiPlot, sensor: SensorInformation): HTMLElement {
        let checkBox = <HTMLInputElement>this.mk.tag("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("input", (e: Event) => {
            if (checkBox.checked) {
                kernel.senMan.getData(sensor.ID, (data: ISensorPackage[]) => {
                    plot.plotData.push(this.convertData(sensor, data));
                    plot.dataUpdate();
                });
            }
            else {
                for (let i = 0; i < plot.plotData.length; i++) {
                    if (plot.plotData[i].ID == sensor.ID) {
                        plot.plotData.splice(i, 1);
                        plot.dataUpdate();
                        break;
                    }
                }
            }
        });
        return checkBox
    }

    drawSensors<T extends IPlot>(plot: T, info: SensorInformation[], drawMethod: (plot: T, sensor: SensorInformation) => HTMLElement) {
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