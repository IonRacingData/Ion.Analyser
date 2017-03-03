var Kernel;
(function (Kernel) {
    var SenSys;
    (function (SenSys) {
        var SensorManager = (function () {
            function SensorManager() {
                this.eventManager = new EventManager();
                this.sensorInformation = [];
                this.loadedDataSet = [];
                this.viewers = [];
                this.dataSources = [];
                //this.loadSensorInformation();
            }
            SensorManager.prototype.addEventListener = function (type, handeler) {
            };
            SensorManager.prototype.removeEventListener = function (type, handeler) {
            };
            SensorManager.prototype.loadSensorInformation = function () {
                requestAction("GetSensorInformation", function (ids) {
                });
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
            SensorManager.prototype.getAvailable = function (callback) {
                requestAction("Available", callback);
            };
            SensorManager.prototype.load = function (file, callback) {
                var _this = this;
                requestAction("LoadNewDataSet?file=" + file, function (data) {
                    if (!data.data) {
                        _this.loadedDataSet.push(new SensorDataSet(data));
                    }
                    console.log(data);
                    if (callback) {
                        callback(data);
                    }
                });
            };
            SensorManager.prototype.register = function (viewer) {
                this.viewers.push(viewer);
                this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
            };
            SensorManager.prototype.getInfos = function () {
                return this.loadedDataSet[0].AllInfos;
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
            SensorManager.prototype.pushToCache = function (data) {
                if (data.length > 0) {
                    var temp = this.loadedDataSet[0].SensorData[data[0].ID];
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
            SensorManager.prototype.fillDataSource = function (source, callback) {
                var multiback = new Multicallback(source.infos.IDs.length, function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    callback();
                });
                for (var i = 0; i < source.infos.IDs.length; i++) {
                    this.loadData(source.infos.SensorInfos[i].ID, multiback.createCallback());
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
        SensorManager.event_registerViewer = "registerViewer";
        SenSys.SensorManager = SensorManager;
        var SensorDataSet = (function () {
            function SensorDataSet(data) {
                this.AllInfos = [];
                this.LoadedKeys = [];
                this.SensorData = [];
                this.Name = data.Name;
                this.LoadedKeys = data.LoadedKeys;
                this.AllInfos = data.AllInfos;
                for (var _i = 0, _a = this.AllInfos; _i < _a.length; _i++) {
                    var a = _a[_i];
                    var temp = new SensorDataContainer(a.Key);
                    temp.info = a;
                    this.SensorData[temp.ID] = temp;
                }
            }
            return SensorDataSet;
        }());
        SenSys.SensorDataSet = SensorDataSet;
    })(SenSys = Kernel.SenSys || (Kernel.SenSys = {}));
})(Kernel || (Kernel = {}));
//# sourceMappingURL=newsensys.js.map