var DataAssigner = (function () {
    function DataAssigner() {
        this.mk = new HtmlHelper();
        this.eh = new EventHandler();
    }
    DataAssigner.prototype.main = function () {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        this.window.content.style.display = "flex";
        this.window.content.style.flexWrap = "wrap";
        this.draw();
        this.eh.on(kernel.senMan, SensorManager.event_registerViewer, function () { return _this.draw(); });
    };
    DataAssigner.prototype.draw = function () {
        this.window.content.innerHTML = "";
        var mk = this.mk;
        var divLeft = mk.tag("div");
        var divRight = this.sensorTable = mk.tag("div");
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        var last = null;
        // let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        for (var i = 0; i < senMan.viewers.length; i++) {
            var curPlot = senMan.viewers[i];
            var isMulti = curPlot.dataCollectionSource !== undefined;
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
    };
    DataAssigner.prototype.drawRow = function (curPlot, isMulti, tableGen, last) {
        var _this = this;
        var name = "Single Plot";
        if (isMulti) {
            name = "Multi Plot";
        }
        tableGen.addRow([
            {
                event: "click", func: function (e) {
                    if (last !== null) {
                        last.classList.remove("selectedrow");
                    }
                    last = _this.findTableRow(e.target);
                    last.classList.add("selectedrow");
                    var sources = kernel.senMan.getDataSources(curPlot.type);
                    if (isMulti) {
                        //this.drawMultiSensors(<ICollectionViewer<any>>curPlot, sources);
                        kernel.senMan.getLoadedInfos(function (x) { return _this.drawMultiSensors(curPlot, x); });
                    }
                    else {
                        kernel.senMan.getLoadedInfos(function (x) { return _this.drawSingleSensors(curPlot, x); });
                    }
                }
            },
            {
                event: "mouseenter", func: function (e) {
                    curPlot.plotWindow.highlight(true);
                }
            },
            {
                event: "mouseleave", func: function (e) {
                    curPlot.plotWindow.highlight(false);
                }
            },
        ], curPlot.plotType, name);
    };
    DataAssigner.prototype.findTableRow = function (element) {
        var curElement = element;
        while (curElement !== null && curElement.tagName !== "TR") {
            curElement = curElement.parentElement;
        }
        return curElement;
    };
    DataAssigner.prototype.drawSingleSensors = function (plot, info) {
        this.drawSensors(plot, info, this.createSingleSensor);
    };
    DataAssigner.prototype.drawMultiSensors = function (plot, info) {
        this.drawSensors(plot, info, this.createMultiSensor);
    };
    DataAssigner.prototype.createSingleSensor = function (plot, sensor) {
        var radio = this.mk.tag("input");
        radio.type = "radio";
        radio.name = "sensor";
        if (plot.dataSource && plot.dataSource.infos.IDs[0] === sensor.ID) {
            radio.checked = true;
        }
        radio.addEventListener("change", function (e) {
            radio.disabled = true;
            console.log("Single checkbox click");
            //kernel.senMan.getDataSources(plot.type);
            kernel.senMan.getSensorData(sensor.ID, function (data) {
                plot.dataSource = new PointSensorGroup(data);
                plot.dataUpdate();
                radio.disabled = false;
            });
        });
        return radio;
    };
    DataAssigner.prototype.createMultiSensor = function (plot, sensor) {
        var checkBox = this.mk.tag("input");
        checkBox.type = "checkbox";
        for (var i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i].infos.IDs[0] === sensor.ID) {
                checkBox.checked = true;
                break;
            }
        }
        checkBox.addEventListener("change", function (e) {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                kernel.senMan.getSensorData(sensor.ID, function (data) {
                    plot.dataCollectionSource.push(new PointSensorGroup(data));
                    plot.dataUpdate();
                    checkBox.disabled = false;
                });
            }
            else {
                for (var i = 0; i < plot.dataCollectionSource.length; i++) {
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
    };
    DataAssigner.prototype.drawSensors = function (plot, info, drawMethod) {
        this.sensorTable.innerHTML = "";
        for (var i = 0; i < info.length; i++) {
            var sensor = info[i];
            var ctrl = drawMethod.call(this, plot, sensor);
            var label = this.mk.tag("label");
            label.title = sensor.ID.toString() + " (0x" + sensor.ID.toString(16) + ") " + (sensor.Key ? sensor.Key : " No key found");
            if (!sensor.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ") ") + sensor.Name));
            this.sensorTable.appendChild(label);
            this.sensorTable.appendChild(this.mk.tag("br"));
        }
    };
    return DataAssigner;
}());
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
var SensorSetSelector = (function () {
    function SensorSetSelector() {
        this.mk = new HtmlHelper();
    }
    SensorSetSelector.prototype.main = function () {
        var _this = this;
        this.wrapper = this.mk.tag("div");
        this.window = kernel.winMan.createWindow(this.application, "Sensor Selector");
        requestAction("GetAvaiableSets", function (data) { return _this.drawData(data); });
        this.window.content.appendChild(this.wrapper);
    };
    SensorSetSelector.prototype.drawData = function (data) {
        this.wrapper.innerHTML = "";
        var table = new HtmlTableGen("table selectable");
        table.addHeader("File name", "File size", "Sensor reader");
        var _loop_1 = function (a) {
            table.addRow([
                {
                    "event": "click",
                    "func": function (event) {
                        // console.log("you clicked on: " + a.FileName);
                        requestAction("LoadDataset?file=" + a.FullFileName, function (data) { });
                        kernel.senMan.clearCache();
                    }
                }
            ], a.FileName, a.Size, a.FileReader);
        };
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var a = data_1[_i];
            _loop_1(a);
        }
        this.wrapper.appendChild(table.generate());
    };
    return SensorSetSelector;
}());
//# sourceMappingURL=TestDataViewer.js.map