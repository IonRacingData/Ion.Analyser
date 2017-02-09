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
        this.eh.on(kernel.senMan, SensorManager.event_registerIPlot, function () { return _this.draw(); });
    };
    DataAssigner.prototype.draw = function () {
        var _this = this;
        this.window.content.innerHTML = "";
        var mk = this.mk;
        var divLeft = mk.tag("div");
        var divRight = this.sensorTable = mk.tag("div");
        var tableGen = new HtmlTableGen("table selectable");
        var senMan = kernel.senMan;
        var last = null;
        //let selectedPlot: IPlot = null;
        tableGen.addHeader("Plot name", "plot type");
        var _loop_1 = function (i) {
            var curPlot = senMan.plotter[i];
            var isMulti = Array.isArray(curPlot.plotData);
            if (isMulti) {
                tableGen.addRow([
                    {
                        event: "click", func: function (e) {
                            if (last !== null) {
                                last.classList.remove("selectedrow");
                            }
                            last = _this.findTableRow(e.target);
                            last.classList.add("selectedrow");
                            kernel.senMan.getLoadedInfos(function (x) { return _this.drawMultiSensors(curPlot, x); });
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
                ], curPlot.plotType, "Multi Plot");
            }
            else {
                tableGen.addRow([
                    {
                        event: "click", func: function (e) {
                            if (last !== null) {
                                last.classList.remove("selectedrow");
                            }
                            last = _this.findTableRow(e.target);
                            last.classList.add("selectedrow");
                            kernel.senMan.getLoadedInfos(function (x) { return _this.drawSingleSensors(curPlot, x); });
                        },
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
                    }
                ], curPlot.plotType, "Single Plot");
            }
        };
        for (var i = 0; i < senMan.plotter.length; i++) {
            _loop_1(i);
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
        if (plot.plotData.ID == sensor.ID) {
            radio.checked = true;
        }
        radio.addEventListener("change", function (e) {
            console.log("Single checkbox click");
            kernel.senMan.getPlotData(sensor.ID, function (data) {
                plot.plotData = new PlotDataViewer(data);
                plot.dataUpdate();
            });
        });
        return radio;
    };
    DataAssigner.prototype.createMultiSensor = function (plot, sensor) {
        var checkBox = this.mk.tag("input");
        checkBox.type = "checkbox";
        for (var i = 0; i < plot.plotData.length; i++) {
            if (plot.plotData[i].ID == sensor.ID) {
                checkBox.checked = true;
                break;
            }
        }
        checkBox.addEventListener("change", function (e) {
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                kernel.senMan.getPlotData(sensor.ID, function (data) {
                    plot.plotData.push(new PlotDataViewer(data));
                    plot.dataUpdate();
                });
            }
            else {
                for (var i = 0; i < plot.plotData.length; i++) {
                    if (plot.plotData[i].ID == sensor.ID) {
                        plot.plotData.splice(i, 1);
                        plot.dataUpdate();
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
var TestDataViewer = (function () {
    function TestDataViewer() {
        this.plotType = "Test Data Viewer";
    }
    TestDataViewer.prototype.main = function () {
        this.plotWindow = this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
        kernel.senMan.register(this);
    };
    TestDataViewer.prototype.draw = function () {
        var gen = new HtmlTableGen("table");
        gen.addHeader("Value", "Timestamp");
        for (var i = 0; i < this.plotData.getLength() && i < 10; i++) {
            gen.addRow(this.plotData.getValue(i).x, this.plotData.getValue(i).y);
        }
        this.window.content.appendChild(gen.generate());
        //console.log("Here we should draw something, but you know, we are lazy");
    };
    TestDataViewer.prototype.dataUpdate = function () {
        this.draw();
    };
    return TestDataViewer;
}());
//# sourceMappingURL=TestDataViewer.js.map