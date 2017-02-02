var SensorManager = (function () {
    function SensorManager() {
        this.dataCache = [];
        this.plotCache = [];
        this.eventManager = new EventManager();
        this.plotter = [];
    }
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
        if (data.length < 1)
            return null;
        var id = data[0].ID;
        var p = [];
        for (var i = 0; i < data.length; i++) {
            p.push(new Point(data[i].TimeStamp, data[i].Value));
        }
        var plot = new PlotData(p);
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
            ret[i] = {
                ID: raw.charCodeAt(i * 28)
                    | raw.charCodeAt(i * 28 + 1) << 8
                    | raw.charCodeAt(i * 28 + 2) << 16
                    | raw.charCodeAt(i * 28 + 3) << 24,
                Value: raw.charCodeAt(i * 28 + 4)
                    | raw.charCodeAt(i * 28 + 5) << 8
                    | raw.charCodeAt(i * 28 + 6) << 16
                    | raw.charCodeAt(i * 28 + 7) << 24
                    | raw.charCodeAt(i * 28 + 8) << 32
                    | raw.charCodeAt(i * 28 + 9) << 40
                    | raw.charCodeAt(i * 28 + 10) << 48
                    | raw.charCodeAt(i * 28 + 11) << 56,
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
    SensorManager.prototype.setGlobal = function (id) {
        var _this = this;
        this.globalId = id;
        this.getData(id, function (data) {
            _this.globalPlot = data;
            _this.eventManager.raiseEvent(SensorManager.event_globalPlot, _this.globalPlot);
        });
    };
    SensorManager.prototype.addEventListener = function (type, listener) {
        if (type == SensorManager.event_globalPlot && this.globalPlot != null) {
            listener(this.globalPlot);
        }
        this.eventManager.addEventListener(type, listener);
    };
    SensorManager.prototype.removeEventListener = function (type, listener) {
        this.eventManager.removeEventListener(type, listener);
    };
    SensorManager.prototype.register = function (plotter) {
        this.plotter.push(plotter);
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
        if (this.count == this.returned) {
            this.callback.apply(null, this.responses);
        }
    };
    return Multicallback;
}());
var SensorInformation = (function () {
    function SensorInformation() {
    }
    return SensorInformation;
}());
//# sourceMappingURL=sensys.js.map