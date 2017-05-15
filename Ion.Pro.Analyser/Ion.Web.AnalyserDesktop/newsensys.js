var Kernel;
(function (Kernel) {
    var SenSys;
    (function (SenSys) {
        var SensorManager = (function () {
            function SensorManager() {
                var _this = this;
                this.eventManager = new EventManager();
                this.sensorInformation = [];
                this.loadedDataSet = [];
                this.viewers = [];
                this.dataSources = [];
                this.groups = [];
                this.telemetryDataSet = null;
                this.callbackStack = [];
                kernel.netMan.registerService(10, function (data) { return _this.handleService(_this.convertToSensorPackage(data.Sensors)); });
                //this.loadSensorInformation();
            }
            SensorManager.prototype.handleService = function (data) {
                //console.log("recived data!");
                if (this.telemetryDataSet) {
                    for (var j = 0; j < data.length; j++) {
                        var realData = data[j];
                        //console.log(realData);
                        var sensId = realData.ID;
                        var realKey = this.telemetryDataSet.IdKeyMap[sensId];
                        if (!realKey) {
                            realKey = sensId.toString();
                        }
                        this.telemetryDataSet.SensorData[realKey].points.push(new SensorValue(realData.Value, realData.TimeStamp));
                    }
                    this.refreshViewers();
                }
                /**/
            };
            SensorManager.prototype.refreshViewers = function () {
                for (var _i = 0, _a = this.viewers; _i < _a.length; _i++) {
                    var v = _a[_i];
                    v.dataUpdate();
                }
            };
            SensorManager.prototype.addEventListener = function (type, handeler) {
                this.eventManager.addEventListener(type, handeler);
            };
            SensorManager.prototype.removeEventListener = function (type, handeler) {
                this.eventManager.removeEventListener(type, handeler);
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
                        var data2 = JSON.parse(JSON.stringify(data));
                        var dataSet = new SensorDataSet(data);
                        data2.Name = "telemetry";
                        _this.telemetryDataSet = new SensorDataSet(data2);
                        _this.loadedDataSet.push(dataSet);
                        _this.loadedDataSet.push(_this.telemetryDataSet);
                        for (var v in dataSet.SensorData) {
                            _this.dataSources.push(_this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: _this.telemetryDataSet.SensorData[v].ID, name: _this.telemetryDataSet.Name }] }));
                            _this.dataSources.push(_this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: dataSet.SensorData[v].ID, name: dataSet.Name }] }));
                        }
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
            SensorManager.prototype.registerGroup = function (group) {
                this.groups.push(group);
            };
            SensorManager.prototype.unregister = function (viewer) {
                var index = this.viewers.indexOf(viewer);
                this.viewers.splice(index, 1);
                this.eventManager.raiseEvent(SensorManager.event_unregisterViewer, null);
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
                    var key = this.loadedDataSet[0].IdKeyMap[data[0].ID];
                    if (!key) {
                        key = data[0].ID.toString();
                    }
                    var temp = this.loadedDataSet[0].SensorData[key];
                    temp.insertSensorPackage(data);
                    console.log(this.dataSources);
                    return temp;
                }
                return null;
            };
            SensorManager.prototype.loadData = function (info, callback) {
                var _this = this;
                console.log("loadData");
                console.log(info);
                for (var i = 0; i < this.callbackStack.length; i++) {
                    var item = this.callbackStack[i];
                    if (item.name === info.SensorSet.Name && item.key === info.Key) {
                        this.callbackStack[i].callbacks.push(callback);
                        return;
                    }
                }
                var all = { name: info.SensorSet.Name, key: info.Key, callbacks: [callback] };
                this.callbackStack.push(all);
                kernel.netMan.sendMessage("/sensor/getdata", { num: info.ID, dataset: info.SensorSet.Name }, function (data) {
                    var dataContainer = _this.pushToCache(_this.convertToSensorPackage(data.Sensors));
                    console.log(all);
                    for (var i = 0; i < all.callbacks.length; i++) {
                        all.callbacks[i](dataContainer);
                    }
                    _this.callbackStack.splice(_this.callbackStack.indexOf(all), 1);
                });
                /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
                    this.dataCache[id] = data;
                    callback(data);
                });*/
            };
            SensorManager.prototype.fillDataSource = function (source, callback) {
                if (source.length() > 0) {
                    callback();
                    return;
                }
                var multiback = new Multicallback(source.infos.Keys.length, function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    callback();
                });
                for (var i = 0; i < source.infos.Keys.length; i++) {
                    this.loadData(source.infos.SensorInfos[i], multiback.createCallback());
                }
            };
            SensorManager.prototype.getDataSet = function (name) {
                for (var _i = 0, _a = this.loadedDataSet; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (v.Name === name) {
                        return v;
                    }
                }
                console.log("Could not find dataset: " + name);
                return null;
            };
            SensorManager.prototype.getSensorDataContainer = function (info) {
                var set = this.getDataSet(info.name);
                if (set) {
                    var container = set.SensorData[info.key];
                    return container;
                }
                console.log("Could not find sensordatacontainer: " + info.name);
                return null;
            };
            SensorManager.prototype.getGroup = function (name) {
                for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (v.name === name) {
                        return v;
                    }
                }
                console.log("Could not find group: " + name);
                return null;
            };
            SensorManager.prototype.createDataSource = function (template) {
                var sources = [];
                for (var _i = 0, _a = template.sources; _i < _a.length; _i++) {
                    var v = _a[_i];
                    sources.push(this.getSensorDataContainer(v));
                }
                var group = this.getGroup(template.grouptype);
                return new group(sources);
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
        SensorManager.event_unregisterViewer = "unregisterViewer";
        SenSys.SensorManager = SensorManager;
        var SensorDataSet = (function () {
            function SensorDataSet(data) {
                this.AllInfos = [];
                this.KeyInfoMap = {};
                this.LoadedKeys = [];
                this.IdKeyMap = [];
                this.SensorData = {};
                this.Name = data.Name;
                this.LoadedKeys = data.LoadedKeys;
                this.AllInfos = data.AllInfos;
                for (var _i = 0, _a = this.AllInfos; _i < _a.length; _i++) {
                    var a = _a[_i];
                    this.IdKeyMap[a.ID] = a.Key;
                    this.KeyInfoMap[a.Key] = a;
                    a.SensorSet = this;
                }
                for (var _b = 0, _c = this.LoadedKeys; _b < _c.length; _b++) {
                    var a = _c[_b];
                    var temp = new SensorDataContainer(a);
                    var sensInfo = this.KeyInfoMap[a];
                    if (!sensInfo) {
                        sensInfo = {
                            ID: parseInt(a),
                            Key: a,
                            SensorSet: this,
                            Name: a,
                            MaxDisplay: null,
                            MaxValue: null,
                            MinDisplay: null,
                            MinValue: null,
                            Resolution: 0,
                            Signed: false,
                            Unit: null
                        };
                    }
                    temp.info = sensInfo;
                    this.SensorData[temp.ID] = temp;
                }
            }
            return SensorDataSet;
        }());
        SenSys.SensorDataSet = SensorDataSet;
    })(SenSys = Kernel.SenSys || (Kernel.SenSys = {}));
})(Kernel || (Kernel = {}));
//# sourceMappingURL=newsensys.js.map