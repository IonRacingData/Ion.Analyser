var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Kernel;
(function (Kernel) {
    var SenSys;
    (function (SenSys) {
        var SensorManager = (function () {
            //static readonly event_registerViewer = "registerViewer";
            //static readonly event_unregisterViewer = "unregisterViewer";
            function SensorManager() {
                this.eventManager = new EventManager();
                this.sensorInformation = [];
                this.loadedDataSet = [];
                this.viewers = [];
                this.dataSources = [];
                this.groups = [];
                this.telemetryDataSet = null;
                this.onRegisterViewer = newEvent("SensorManager.onRegisterViewer");
                this.onUnRegisterViewer = newEvent("SensorManager.onUnRegisterViewer");
                this.callbackStack = [];
                //this.loadSensorInformation();
            }
            SensorManager.prototype.lateInit = function () {
                var _this = this;
                kernel.netMan.registerService(10, function (data) { return _this.handleService(_this.convertToSensorPackage(data.Sensors)); });
            };
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
                        /*if (!this.telemetryDataSet.dataCache[sensId]) {
                            this.dataCache[sensId] = new SensorDataContainer(sensId);
                        }
                        this.dataCache[sensId].insertSensorPackage([realData]);*/
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
                    /* tslint:enable:no-bitwise */
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
                        var tele = false;
                        if (!_this.telemetryDataSet) {
                            _this.telemetryDataSet = new SensorDataSet(data2);
                            _this.loadedDataSet.push(_this.telemetryDataSet);
                            tele = true;
                        }
                        _this.loadedDataSet.push(dataSet);
                        for (var v in dataSet.SensorData) {
                            var temp1 = void 0;
                            if (tele) {
                                temp1 = _this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: _this.telemetryDataSet.SensorData[v].ID, name: _this.telemetryDataSet.Name }] });
                            }
                            var temp2 = _this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: dataSet.SensorData[v].ID, name: dataSet.Name }] });
                            if (temp1) {
                                _this.dataSources.push(temp1);
                            }
                            if (temp2) {
                                _this.dataSources.push(temp2);
                            }
                            //this.dataSources.push(new PointSensorGroup([dataSet.SensorData[v]]));
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
                console.log("New register view");
                this.onRegisterViewer({ target: this });
                //this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
            };
            SensorManager.prototype.registerGroup = function (group) {
                this.groups.push(group);
            };
            SensorManager.prototype.unregister = function (viewer) {
                var index = this.viewers.indexOf(viewer);
                this.viewers.splice(index, 1);
                this.onUnRegisterViewer({ target: this });
                //this.eventManager.raiseEvent(SensorManager.event_unregisterViewer, null);
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
                throw "Empty dataset exception";
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
            SensorManager.prototype.getGroupByType = function (type) {
                for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (v.type === type) {
                        return v;
                    }
                }
                return null;
            };
            SensorManager.prototype.createDataSource = function (template) {
                var sources = [];
                for (var _i = 0, _a = template.sources; _i < _a.length; _i++) {
                    var v = _a[_i];
                    var temp = this.getSensorDataContainer(v);
                    if (temp) {
                        sources.push(temp);
                    }
                    else {
                        console.log(template);
                        console.log("Got empty dataset");
                    }
                }
                var group = this.getGroup(template.grouptype);
                if (group) {
                    return new group(sources);
                }
                else {
                    console.log("Failed to create dataset");
                    console.log(template);
                    return null;
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
                            Resolution: 0
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
var SensorGroup = (function () {
    function SensorGroup(type) {
        this.infos = new SensorPlotInfo();
        this.type = type;
    }
    SensorGroup.prototype.getValue = function (index, subplot) {
        if (subplot === void 0) { subplot = 0; }
        throw "Not implmeneted exception";
    };
    SensorGroup.prototype.length = function (subplot) {
        if (subplot === void 0) { subplot = 0; }
        return 0;
    };
    SensorGroup.prototype.subplots = function () {
        return 1;
    };
    return SensorGroup;
}());
var PointSensorGroup = (function (_super) {
    __extends(PointSensorGroup, _super);
    function PointSensorGroup(data) {
        var _this = _super.call(this, Point) || this;
        if (!data || data.length < 1) {
            console.log(data);
            throw new Error("Empty array argument detected");
        }
        _this.data = data[0];
        _this.infos.Keys[0] = data[0].ID;
        _this.infos.SensorInfos[0] = data[0].info;
        _this.color = data[0].color;
        return _this;
    }
    PointSensorGroup.prototype.getValue = function (index) {
        if (index < this.length() && index >= 0) {
            return this.data.points[index].getPoint();
        }
        throw "Index out of bounds exception";
    };
    PointSensorGroup.prototype.length = function () {
        return this.data.points.length;
    };
    return PointSensorGroup;
}(SensorGroup));
PointSensorGroup.numGroups = 1;
PointSensorGroup.type = Point;
var DataSourceInfo = (function () {
    function DataSourceInfo() {
    }
    return DataSourceInfo;
}());
var DataSourceTemplate = (function () {
    function DataSourceTemplate() {
        this.sources = [];
        this.layers = [];
    }
    return DataSourceTemplate;
}());
