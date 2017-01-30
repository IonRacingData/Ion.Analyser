var SensorManager = (function () {
    function SensorManager() {
        this.dataCache = [];
        this.eventManager = new EventManager();
        this.plotter = [];
    }
    SensorManager.prototype.getIds = function (callback) {
        requestAction("GetIds", callback);
    };
    SensorManager.prototype.getLoadedIds = function (callback) {
        requestAction("GetLoadedIds", callback);
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
var SensorInformation = (function () {
    function SensorInformation() {
    }
    return SensorInformation;
}());
//# sourceMappingURL=sensys.js.map