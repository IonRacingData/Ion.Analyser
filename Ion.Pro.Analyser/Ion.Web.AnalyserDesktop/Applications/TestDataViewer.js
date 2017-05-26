var DataAssigner = (function () {
    function DataAssigner() {
        this.mk = new HtmlHelper();
    }
    DataAssigner.prototype.main = function (preSelect) {
        var _this = this;
        this.window = kernel.winMan.createWindow(this.app, "Data Assigner");
        this.window.content.style.display = "flex";
        this.window.content.style.flexWrap = "wrap";
        this.selected = preSelect;
        this.draw();
        this.app.events.on(kernel.senMan.onRegisterViewer, function () { return _this.draw(); });
        this.app.events.on(kernel.senMan.onUnRegisterViewer, function () { return _this.draw(); });
    };
    DataAssigner.prototype.draw = function () {
        this.window.content.innerHTML = "";
        var mk = this.mk;
        var divLeft = mk.tag("div");
        var divRight = this.sensorTable = mk.tag("div");
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        var last = { item: null };
        // let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        for (var i = 0; i < senMan.viewers.length; i++) {
            var curPlot = senMan.viewers[i];
            var isMulti = curPlot.dataCollectionSource !== undefined;
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
    };
    DataAssigner.prototype.drawRow = function (curPlot, isMulti, tableGen, last, preSelect) {
        var _this = this;
        var name = "Single Plot";
        if (isMulti) {
            name = "Multi Plot";
        }
        tableGen.addRow([
            {
                event: "click", func: function (e) {
                    if (last.item !== null) {
                        last.item.classList.remove("selectedrow");
                    }
                    last.item = _this.findTableRow(e.target);
                    last.item.classList.add("selectedrow");
                    var sources = kernel.senMan.getDataSources(curPlot.type);
                    if (isMulti) {
                        _this.drawMultiSensors(curPlot, sources);
                    }
                    else {
                        _this.drawSingleSensors(curPlot, sources);
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
        var sources = kernel.senMan.getDataSources(curPlot.type);
        if (isMulti) {
            this.drawMultiSensors(curPlot, sources);
        }
        else {
            this.drawSingleSensors(curPlot, sources);
        }
    };
    DataAssigner.prototype.findTableRow = function (element) {
        var curElement = element;
        while (curElement.parentElement !== null && curElement.tagName !== "TR") {
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
        if (plot.dataSource && plot.dataSource === sensor) {
            radio.checked = true;
        }
        radio.addEventListener("change", function (e) {
            radio.disabled = true;
            console.log("Single checkbox click");
            plot.dataSource = sensor;
            if (sensor.length() == 0) {
                kernel.senMan.fillDataSource(sensor, function () {
                    plot.dataUpdate();
                    radio.disabled = false;
                });
            }
            else {
                plot.dataUpdate();
                radio.disabled = false;
            }
        });
        return radio;
    };
    DataAssigner.prototype.createMultiSensor = function (plot, sensor) {
        var checkBox = this.mk.tag("input");
        checkBox.type = "checkbox";
        for (var i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i] === sensor) {
                checkBox.checked = true;
                break;
            }
        }
        checkBox.addEventListener("change", function (e) {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                plot.dataCollectionSource.push(sensor);
                if (sensor.length() == 0) {
                    kernel.senMan.fillDataSource(sensor, function () {
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
                for (var i = 0; i < plot.dataCollectionSource.length; i++) {
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
    };
    DataAssigner.prototype.drawSensors = function (plot, info, drawMethod) {
        this.sensorTable.innerHTML = "";
        for (var i = 0; i < info.length; i++) {
            var sensor = info[i];
            var ctrl = drawMethod.call(this, plot, sensor);
            var label = this.mk.tag("label", "listitem");
            var firstInfo = sensor.infos.SensorInfos[0];
            label.title = firstInfo.ID.toString() + " (0x" + firstInfo.ID.toString(16) + ") " + (firstInfo.Key.toString() === firstInfo.Key ? firstInfo.Key : " No key found");
            if (firstInfo.ID.toString() === firstInfo.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            var innerBox = this.mk.tag("div");
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
        this.window = kernel.winMan.createWindow(this.app, "Sensor Selector");
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
                        kernel.senMan.load(a.FullFileName);
                        //requestAction("LoadDataset?file=" + a.FullFileName, (data: any) => { });
                        //kernel.senMan.clearCache();
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