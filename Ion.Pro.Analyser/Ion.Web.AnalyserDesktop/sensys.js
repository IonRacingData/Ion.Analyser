var SensorManager = (function () {
    function SensorManager() {
        var _this = this;
        this.dataCache = [];
        this.eventManager = new EventManager();
        this.viewers = [];
        this.dataSources = [];
        kernel.netMan.registerService(10, function (data) { return _this.handleService(_this.convertToSensorPackage(data.Sensors)); });
        this.getLoadedIds(function (ids) { });
    }
    SensorManager.prototype.handleService = function (data) {
        for (var j = 0; j < data.length; j++) {
            var realData = data[j];
            var sensId = realData.ID;
            if (!this.dataCache[sensId]) {
                this.dataCache[sensId] = new SensorDataContainer(sensId);
            }
            this.dataCache[sensId].insertSensorPackage([realData]);
        }
        this.updateAllPlotters();
    };
    SensorManager.prototype.convertData = function (data) {
        if (data.length < 1) {
            return null;
        }
        var plot = new SensorDataContainer(data[0].ID);
        plot.insertSensorPackage(data);
        return plot;
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
    SensorManager.prototype.pushToCache = function (data) {
        if (data.length > 0) {
            var temp = this.dataCache[data[0].ID];
            temp.insertSensorPackage(data);
            console.log(this.dataSources);
            return temp;
        }
        return null;
    };
    SensorManager.prototype.loadData = function (id, callback) {
        var _this = this;
        kernel.netMan.sendMessage("/sensor/getdata", { num: id }, function (data) {
            var dataContainer = _this.pushToCache(_this.convertToSensorPackage(data.Sensors));
            callback(dataContainer);
        });
        /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
            this.dataCache[id] = data;
            callback(data);
        });*/
    };
    SensorManager.prototype.updateAllPlotters = function () {
        for (var i = 0; i < this.viewers.length; i++) {
            this.viewers[i].dataUpdate();
        }
    };
    SensorManager.prototype.getInfos = function (callback) {
        var _this = this;
        if (this.sensorInformations !== undefined && this.sensorInformations !== null && this.sensorInformations.length > 0) {
            callback(this.sensorInformations);
        }
        requestAction("GetIds", function (ids) {
            _this.sensorInformations = ids;
            callback(_this.sensorInformations);
        });
    };
    SensorManager.prototype.getLoadedIds = function (callback) {
        var _this = this;
        requestAction("GetLoadedIds", function (ids) {
            ids.forEach(function (value, index, array) {
                if (!_this.dataCache[value]) {
                    _this.dataCache[value] = new SensorDataContainer(value);
                    var a = new PointSensorGroup(_this.dataCache[value]);
                    _this.dataSources.push(a);
                }
            });
            callback(ids);
        });
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
    SensorManager.prototype.getSensorData = function (id, callback) {
        if (!this.dataCache[id]) {
            this.loadData(id, callback);
        }
        else {
            callback(this.dataCache[id]);
        }
    };
    SensorManager.prototype.clearCache = function () {
        this.dataCache = [];
        this.sensorInformations = null;
        for (var _i = 0, _a = this.viewers; _i < _a.length; _i++) {
            var a = _a[_i];
            if (SensorManager.isCollectionViewer(a)) {
                a.dataCollectionSource.splice(0);
            }
            else if (SensorManager.isViewer(a)) {
                a.dataSource = null;
            }
            else {
                console.log("[SensorManager.clearChache()] Here is something wrong ...");
            }
            a.dataUpdate();
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
    SensorManager.prototype.addEventListener = function (type, listener) {
        this.eventManager.addEventListener(type, listener);
    };
    SensorManager.prototype.removeEventListener = function (type, listener) {
        this.eventManager.removeEventListener(type, listener);
    };
    SensorManager.prototype.register = function (viewer) {
        this.viewers.push(viewer);
        this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
    };
    SensorManager.prototype.getDataSources = function (type) {
        var returnArray = [];
        for (var _i = 0, _a = this.dataSources; _i < _a.length; _i++) {
            var cur = _a[_i];
            if (SensorManager.isDatasource(cur, type)) {
                returnArray.push(cur);
            }
        }
        return returnArray;
    };
    SensorManager.prototype.fillDataSource = function (source, callback) {
        var multiback = new Multicallback(source.infos.IDs.length, function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            callback();
        });
        for (var i = 0; i < source.infos.IDs.length; i++) {
            this.loadData(source.infos.IDs[i], multiback.createCallback());
        }
    };
    SensorManager.isDatasource = function (source, type) {
        return source.type === type;
    };
    SensorManager.isViewer = function (value) {
        return value.dataSource !== undefined;
    };
    SensorManager.isCollectionViewer = function (value) {
        return value.dataCollectionSource !== undefined;
    };
    return SensorManager;
}());
SensorManager.event_registerIPlot = "registerIPlot";
SensorManager.event_registerViewer = "registerViewer";
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
//# sourceMappingURL=sensys.js.map