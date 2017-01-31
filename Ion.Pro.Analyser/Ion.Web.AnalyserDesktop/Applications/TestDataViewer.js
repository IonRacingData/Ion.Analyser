var TestDataViewer = (function () {
    function TestDataViewer() {
        this.plotType = "Test Data Viewer";
    }
    TestDataViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
        kernel.senMan.register(this);
    };
    TestDataViewer.prototype.draw = function () {
        var gen = new HtmlTableGen("table");
        gen.addHeader("Value", "Timestamp");
        for (var i = 0; i < this.plotData.points.length && i < 10; i++) {
            gen.addRow(this.plotData.points[i].x, this.plotData.points[i].y);
        }
        this.window.content.appendChild(gen.generate());
        //console.log("Here we should draw something, but you know, we are lazy");
    };
    TestDataViewer.prototype.dataUpdate = function () {
        this.draw();
    };
    return TestDataViewer;
}());
var DataAssigner = (function () {
    function DataAssigner() {
        this.mk = new HtmlHelper();
    }
    DataAssigner.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        this.draw();
    };
    DataAssigner.prototype.draw = function () {
        var _this = this;
        var mk = this.mk;
        var divLeft = mk.tag("div");
        var divRight = this.sensorTable = mk.tag("div");
        var tableGen = new HtmlTableGen("table");
        var senMan = kernel.senMan;
        tableGen.addHeader("Plot name", "plot type");
        var _loop_1 = function (i) {
            var curPlot = senMan.plotter[i];
            var isMulti = Array.isArray(curPlot.plotData);
            if (isMulti) {
                tableGen.addRow([{
                        event: "click", func: function () {
                            kernel.senMan.getLoadedInfos(function (x) { return _this.drawMultiSensors(curPlot, x); });
                        }
                    }], curPlot.plotType, "Multi Plot");
            }
            else {
                tableGen.addRow([{
                        event: "click", func: function () {
                            kernel.senMan.getLoadedInfos(function (x) { return _this.drawSingleSensors(curPlot, x); });
                        }
                    }], curPlot.plotType, "Single Plot");
            }
        };
        for (var i = 0; i < senMan.plotter.length; i++) {
            _loop_1(i);
        }
        divLeft.appendChild(tableGen.generate());
        this.window.content.appendChild(divLeft);
        this.window.content.appendChild(divRight);
    };
    DataAssigner.prototype.convertData = function (si, data) {
        var p = [];
        for (var i = 0; i < data.length; i++) {
            p[i] = new Point(data[i].TimeStamp, data[i].Value);
        }
        var a = new PlotData(p);
        a.ID = si.ID;
        return a;
    };
    DataAssigner.prototype.drawSingleSensors = function (plot, info) {
        var _this = this;
        this.sensorTable.innerHTML = "";
        var _loop_2 = function (i) {
            var radio = this_1.mk.tag("input");
            var sensor = info[i];
            radio.type = "radio";
            radio.name = "sensor";
            radio.addEventListener("input", function (e) {
                kernel.senMan.getData(sensor.ID, function (data) {
                    plot.plotData = _this.convertData(sensor, data);
                    plot.dataUpdate();
                });
            });
            var label = this_1.mk.tag("label");
            label.title = sensor.ID.toString() + "(0x" + sensor.ID.toString(16) + ") " + (sensor.Key ? sensor.Key : " No key found");
            label.appendChild(radio);
            label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ")") + sensor.Name));
            this_1.sensorTable.appendChild(label);
            this_1.sensorTable.appendChild(this_1.mk.tag("br"));
        };
        var this_1 = this;
        for (var i = 0; i < info.length; i++) {
            _loop_2(i);
        }
    };
    DataAssigner.prototype.drawMultiSensors = function (plot, info) {
        var _this = this;
        this.sensorTable.innerHTML = "";
        var _loop_3 = function (i) {
            var checkBox = this_2.mk.tag("input");
            var sensor = info[i];
            checkBox.type = "checkbox";
            checkBox.addEventListener("input", function (e) {
                if (checkBox.checked) {
                    kernel.senMan.getData(sensor.ID, function (data) {
                        plot.plotData.push(_this.convertData(sensor, data));
                        plot.dataUpdate();
                    });
                }
                else {
                    for (var i_1 = 0; i_1 < plot.plotData.length; i_1++) {
                        if (plot.plotData[i_1].ID == sensor.ID) {
                            plot.plotData.splice(i_1, 1);
                            plot.dataUpdate();
                            break;
                        }
                    }
                }
            });
            var label = this_2.mk.tag("label");
            label.title = sensor.ID.toString() + "(0x" + sensor.ID.toString(16) + ") " + (sensor.Key ? sensor.Key : " No key found");
            label.appendChild(checkBox);
            label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ")") + sensor.Name));
            this_2.sensorTable.appendChild(label);
            this_2.sensorTable.appendChild(this_2.mk.tag("br"));
        };
        var this_2 = this;
        for (var i = 0; i < info.length; i++) {
            _loop_3(i);
        }
    };
    return DataAssigner;
}());
//# sourceMappingURL=TestDataViewer.js.map