class TestDataViewer implements IApplication, ISinglePlot {
    application: Application;
    window: AppWindow;
    plotData: PlotData;
    plotType: string = "Test Data Viewer";
    plotWindow: AppWindow;

    main(): void {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
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
    eh: EventHandler = new EventHandler();

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        this.window.content.style.display = "flex";
        this.window.content.style.flexWrap = "wrap";
        this.draw();
        this.eh.on(kernel.senMan, SensorManager.event_registerIPlot, () => this.draw());
    }

    draw() {
        this.window.content.innerHTML = "";
        let mk = this.mk;
        let divLeft = mk.tag("div");
        let divRight = this.sensorTable = mk.tag("div");
        let tableGen = new HtmlTableGen("table selectable");
        let senMan: SensorManager = kernel.senMan;
        let last: HTMLElement = null;
        //let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        for (let i = 0; i < senMan.plotter.length; i++) {
            let curPlot = senMan.plotter[i];
            let isMulti = Array.isArray((<any>curPlot).plotData);

            if (isMulti) {
                tableGen.addRow([
                    {
                        event: "click", func: (e: Event) =>
                        {
                            if (last !== null) {
                                last.classList.remove("selectedrow");
                            }
                            last = this.findTableRow(<HTMLElement>e.target);
                            last.classList.add("selectedrow");
                        
                            kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawMultiSensors(<IMultiPlot>curPlot, x));
                        }
                    },
                    {
                        event: "mouseenter", func: (e: Event) =>
                        {
                            curPlot.plotWindow.highlight(true);
                        }
                    },
                    {
                        event: "mouseleave", func: (e: Event) =>
                        {
                            curPlot.plotWindow.highlight(false);
                        }
                    },
                    ], curPlot.plotType, "Multi Plot");
            }
            else {
                tableGen.addRow([
                    {
                        event: "click", func: (e: Event) =>
                        {
                            if (last !== null) {
                                last.classList.remove("selectedrow");
                            }
                            last = this.findTableRow(<HTMLElement>e.target);
                            last.classList.add("selectedrow");

                            kernel.senMan.getLoadedInfos((x: SensorInformation[]) => this.drawSingleSensors(<ISinglePlot>curPlot, x));
                        },
                    },
                    {
                        event: "mouseenter", func: (e: Event) =>
                        {
                            curPlot.plotWindow.highlight(true);
                        }
                    },
                    {
                        event: "mouseleave", func: (e: Event) =>
                        {
                            curPlot.plotWindow.highlight(false);
                        }
                    }
                ], curPlot.plotType, "Single Plot");
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

    findTableRow(element: HTMLElement): HTMLElement {
        let curElement: HTMLElement = element;

        while (curElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
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
        radio.addEventListener("change", (e: Event) => {
            console.log("Single checkbox click");
            kernel.senMan.getPlotData(sensor.ID, (data: PlotData) => {
                plot.plotData = data;
                plot.dataUpdate();
            });
        });
        return radio;
    }

    createMultiSensor(plot: IMultiPlot, sensor: SensorInformation): HTMLElement {
        let checkBox = <HTMLInputElement>this.mk.tag("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("change", (e: Event) => {
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                kernel.senMan.getPlotData(sensor.ID, (data: PlotData) => {
                    plot.plotData.push(data);
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