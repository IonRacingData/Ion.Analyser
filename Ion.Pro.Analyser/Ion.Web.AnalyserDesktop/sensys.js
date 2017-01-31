var SensorManager = (function () {
    function SensorManager() {
        this.dataCache = [];
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
    SensorManager.prototype.loadData = function (id, callback) {
        var _this = this;
        requestAction("getdata?number=" + id.toString(), function (data) {
            _this.dataCache[id] = data;
            callback(data);
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
        if (type == SensorManager.event_globalPlot && this.globalPlot != null) {
            listener(this.globalPlot);
        }
        this.eventManager.addEventListener(type, listener);
    };
    SensorManager.prototype.register = function (plotter) {
        this.plotter.push(plotter);
    };
    return SensorManager;
}());
SensorManager.event_globalPlot = "globalPlot";
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