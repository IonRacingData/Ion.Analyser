var SensorManager = (function () {
    function SensorManager() {
        var _this = this;
        this.dataCache = [];
        this.plotCache = [];
        this.plotter = [];
        this.eventManager = new EventManager();
        this.plotLinker = [];
        kernel.netMan.registerService(10, function (data) { return _this.handleService(_this.convertToSensorPackage(data.Sensors)); });
    }
    SensorManager.prototype.handleService = function (data) {
        for (var j = 0; j < data.length; j++) {
            var realData = data[j];
            var sensId = realData.ID;
            if (!this.dataCache[sensId]) {
                this.dataCache[sensId] = [];
            }
            this.dataCache[sensId].push(realData);
            if (!this.plotCache[sensId]) {
                this.plotCache[sensId] = new SensorDataContainer([]);
                this.plotCache[sensId].ID = sensId;
            }
            this.plotCache[sensId].points.push(new Point(realData.TimeStamp, realData.Value));
        }
        this.updateAllPlotters();
    };
    SensorManager.prototype.updateAllPlotters = function () {
        for (var i = 0; i < this.plotter.length; i++) {
            this.plotter[i].dataUpdate();
        }
    };
    SensorManager.prototype.getInfos = function (callback) {
        requestAction("GetIds", callback);
    };
    SensorManager.prototype.getLoadedIds = function (callback) {
        requestAction("GetLoadedIds", callback);
    };
    SensorManager.prototype.getLoadedInfos = function (callback) {
        var multiBack = new Multicallback(2, function (ids, loaded) {
            var newLoaded = [];
            var allIds = [];
            for (var i = 0; i < ids.length; i++) {
                allIds[ids[i].ID] = ids[i];
            }
            for (var i = 0; i < loaded.length; i++) {
                if (allIds[loaded[i]]) {
                    newLoaded.push(allIds[loaded[i]]);
                }
                else {
                    var temp = new SensorInformation();
                    temp.ID = loaded[i];
                    temp.Name = "Not Found";
                    temp.Key = null;
                    temp.Unit = null;
                    newLoaded.push(temp);
                }
            }
            callback(newLoaded);
        });
        this.getInfos(multiBack.createCallback());
        this.getLoadedIds(multiBack.createCallback());
    };
    SensorManager.prototype.getData = function (id, callback) {
        if (!this.dataCache[id]) {
            this.loadData(id, callback);
        }
        else {
            callback(this.dataCache[id]);
        }
    };
    SensorManager.prototype.getPlotData = function (id, callback) {
        if (!this.plotCache[id]) {
            this.loadPlotData(id, callback);
        }
        else {
            callback(this.plotCache[id]);
        }
    };
    SensorManager.prototype.loadPlotData = function (id, callback) {
        var _this = this;
        this.loadData(id, function (data) {
            var plot = _this.convertData(data);
            _this.plotCache[id] = plot;
            callback(plot);
        });
    };
    SensorManager.prototype.convertData = function (data) {
        if (data.length < 1) {
            return null;
        }
        var id = data[0].ID;
        var p = [];
        for (var i = 0; i < data.length; i++) {
            p.push(new Point(data[i].TimeStamp, data[i].Value));
        }
        var plot = new SensorDataContainer(p);
        plot.ID = id;
        return plot;
    };
    SensorManager.prototype.loadData = function (id, callback) {
        var _this = this;
        kernel.netMan.sendMessage("/sensor/getdata", { num: id }, function (data) {
            var realData = _this.convertToSensorPackage(data.Sensors);
            console.log(realData);
            _this.dataCache[id] = realData;
            callback(realData);
        });
        /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
            this.dataCache[id] = data;
            callback(data);
        });*/
    };
    SensorManager.prototype.convertToSensorPackage = function (str) {
        var raw = atob(str);
        var ret = [];
        for (var i = 0; i < raw.length / 28; i++) {
            /*console.log(raw.charCodeAt(i * 28));
            console.log(raw.charCodeAt(i * 28 + 1));
            console.log(raw.charCodeAt(i * 28 + 2));
            console.log(raw.charCodeAt(i * 28 + 3));*/
            var buf = new ArrayBuffer(8);
            var insert = new Uint8Array(buf);
            insert[0] = raw.charCodeAt(i * 28 + 4);
            insert[1] = raw.charCodeAt(i * 28 + 5);
            insert[2] = raw.charCodeAt(i * 28 + 6);
            insert[3] = raw.charCodeAt(i * 28 + 7);
            insert[4] = raw.charCodeAt(i * 28 + 8);
            insert[5] = raw.charCodeAt(i * 28 + 9);
            insert[6] = raw.charCodeAt(i * 28 + 10);
            insert[7] = raw.charCodeAt(i * 28 + 11);
            var output = new Float64Array(buf);
            /* tslint:disable:no-bitwise */
            ret[i] = {
                ID: raw.charCodeAt(i * 28)
                    | raw.charCodeAt(i * 28 + 1) << 8
                    | raw.charCodeAt(i * 28 + 2) << 16
                    | raw.charCodeAt(i * 28 + 3) << 24,
                Value: output[0],
                /*Value: raw.charCodeAt(i * 28 + 4)
                | raw.charCodeAt(i * 28 + 5) << 8
                | raw.charCodeAt(i * 28 + 6) << 16
                | raw.charCodeAt(i * 28 + 7) << 24
                | raw.charCodeAt(i * 28 + 8) << 32
                | raw.charCodeAt(i * 28 + 9) << 40
                | raw.charCodeAt(i * 28 + 10) << 48
                | raw.charCodeAt(i * 28 + 11) << 56,*/
                TimeStamp: raw.charCodeAt(i * 28 + 12)
                    | raw.charCodeAt(i * 28 + 13) << 8
                    | raw.charCodeAt(i * 28 + 14) << 16
                    | raw.charCodeAt(i * 28 + 15) << 24
                    | raw.charCodeAt(i * 28 + 16) << 32
                    | raw.charCodeAt(i * 28 + 17) << 40
                    | raw.charCodeAt(i * 28 + 18) << 48
                    | raw.charCodeAt(i * 28 + 19) << 56,
            };
        }
        return ret;
    };
    SensorManager.prototype.clearCache = function () {
        this.dataCache = [];
        this.plotCache = [];
        for (var _i = 0, _a = this.plotter; _i < _a.length; _i++) {
            var a = _a[_i];
            if (Array.isArray(a.plotData)) {
                a.plotData.splice(0);
                a.dataUpdate();
            }
            else {
                a.plotData = null;
                a.dataUpdate();
            }
        }
    };
    SensorManager.prototype.getSensorInfo = function (data, callback) {
        this.getLoadedInfos(function (all) {
            for (var i = 0; i < all.length; i++) {
                if (all[i].ID === data.infos.IDs[0]) {
                    callback(all[i]);
                    break;
                }
            }
        });
    };
    SensorManager.prototype.setGlobal = function (id) {
        var _this = this;
        this.globalId = id;
        this.getData(id, function (data) {
            _this.globalPlot = data;
            _this.eventManager.raiseEvent(SensorManager.event_globalPlot, _this.globalPlot);
        });
    };
    SensorManager.prototype.addEventListener = function (type, listener) {
        if (type === SensorManager.event_globalPlot && this.globalPlot != null) {
            listener(this.globalPlot);
        }
        this.eventManager.addEventListener(type, listener);
    };
    SensorManager.prototype.removeEventListener = function (type, listener) {
        this.eventManager.removeEventListener(type, listener);
    };
    SensorManager.prototype.register = function (plotter) {
        this.plotter.push(plotter);
        if (!this.plotLinker[plotter.plotDataType]) {
            this.plotLinker[plotter.plotDataType] = [];
        }
        this.plotLinker[plotter.plotDataType].push(plotter);
        this.eventManager.raiseEvent(SensorManager.event_registerIPlot, null);
    };
    return SensorManager;
}());
SensorManager.event_globalPlot = "globalPlot";
SensorManager.event_registerIPlot = "registerIPlot";
var Multicallback = (function () {
    function Multicallback(count, callback) {
        this.responses = [];
        this.curId = 0;
        this.returned = 0;
        this.callback = callback;
        this.count = count;
    }
    Multicallback.prototype.createCallback = function () {
        var _this = this;
        var current = this.curId;
        this.curId++;
        return function (param) {
            _this.responses[current] = param;
            _this.returned++;
            _this.checkReturn();
        };
    };
    Multicallback.prototype.checkReturn = function () {
        if (this.count === this.returned) {
            this.callback.apply(null, this.responses);
        }
    };
    return Multicallback;
}());
var SensorPlotInfo = (function () {
    function SensorPlotInfo() {
        this.IDs = [];
    }
    return SensorPlotInfo;
}());
var SensorInformation = (function () {
    function SensorInformation() {
    }
    return SensorInformation;
}());
var SensorValueInformation = (function () {
    function SensorValueInformation() {
    }
    return SensorValueInformation;
}());
var SensorInfoHelper = (function () {
    function SensorInfoHelper() {
    }
    SensorInfoHelper.maxValue = function (info) {
        var val = 0;
        var temp = info.ValueInfo;
        if (temp.MaxDisplay) {
            val = temp.MaxDisplay;
        }
        else if (temp.MaxValue) {
            val = temp.MaxValue;
        }
        else {
            /* tslint:disable:no-bitwise */
            val = (1 << temp.Resolution) - 1;
        }
        return val;
    };
    SensorInfoHelper.minValue = function (info) {
        var val = 0;
        var temp = info.ValueInfo;
        if (temp.MinDisplay) {
            val = temp.MinDisplay;
        }
        else if (temp.MinValue) {
            val = temp.MinValue;
        }
        else if (temp.Signed) {
            val = -SensorInfoHelper.maxValue(info) - 1;
        }
        return val;
    };
    SensorInfoHelper.getPercent = function (info, p) {
        var min = SensorInfoHelper.minValue(info);
        var max = SensorInfoHelper.maxValue(info);
        var newVal = (p.y - min) / (max - min);
        return new Point(p.x, newVal);
    };
    return SensorInfoHelper;
}());
var PlotType;
(function (PlotType) {
    PlotType[PlotType["I1D"] = 0] = "I1D";
    PlotType[PlotType["I2D"] = 1] = "I2D";
    PlotType[PlotType["I3D"] = 2] = "I3D";
})(PlotType || (PlotType = {}));
//# sourceMappingURL=sensys.js.map