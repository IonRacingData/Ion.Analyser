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
var DataSourceBuildController = (function (_super) {
    __extends(DataSourceBuildController, _super);
    function DataSourceBuildController(plot) {
        var _this = _super.call(this) || this;
        _this.mk = new HtmlHelper();
        _this.subDivs = [];
        _this.chosenData = [];
        _this.chosenListClickCounter = 0;
        _this.plot = plot;
        _this.wrapper = _this.mk.tag("div", "dsbController-wrapper");
        for (var i = 0; i < 3; i++) {
            var div = _this.mk.tag("div", "dsbController-section");
            _this.subDivs.push(div);
            _this.wrapper.appendChild(div);
        }
        _this.subDivs[1].style.display = "flex";
        _this.subDivs[1].style.flexDirection = "column";
        _this.subDivs[1].style.justifyContent = "space-between";
        _this.btnMakeSource = new TextButton();
        _this.btnMakeSource.text = "GENERATE";
        _this.btnMakeSource.disabled = true;
        _this.btnMakeSource.onclick.addEventListener(function (e) {
            _this.generateSource();
            _this.chosenData = [];
            _this.updateChosenList();
            _this.btnMakeSource.disabled = true;
        });
        _this.determineGroup();
        _this.listSensors();
        _this.listDataSources();
        _this.initChosenList();
        var emptyDiv = document.createElement("div");
        emptyDiv.style.height = "90px";
        emptyDiv.style.textAlign = "center";
        _this.subDivs[1].appendChild(emptyDiv);
        emptyDiv.appendChild(_this.btnMakeSource.wrapper);
        return _this;
    }
    Object.defineProperty(DataSourceBuildController.prototype, "viewer", {
        get: function () {
            return this.plot;
        },
        enumerable: true,
        configurable: true
    });
    DataSourceBuildController.prototype.generateSource = function () {
        var sources = [];
        for (var _i = 0, _a = this.chosenData; _i < _a.length; _i++) {
            var s = _a[_i];
            sources.push({ name: s.SensorSet.Name, key: s.Key });
        }
        var template = {
            key: "",
            grouptype: this.sensorGroup,
            layers: [],
            sources: sources,
        };
        var ds = kernel.senMan.createDataSource(template);
        if (ds) {
            kernel.senMan.registerDataSource(ds);
        }
        else {
            throw new Error("Data Source not created exception");
        }
        this.sourcesList.update();
    };
    DataSourceBuildController.prototype.listSensors = function () {
        var _this = this;
        var expList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);
        var sensorsets = kernel.senMan.getLoadedDatasets();
        var infos = [];
        for (var _i = 0, sensorsets_1 = sensorsets; _i < sensorsets_1.length; _i++) {
            var set = sensorsets_1[_i];
            for (var _a = 0, _b = set.LoadedKeys; _a < _b.length; _a++) {
                var key = _b[_a];
                var info = set.SensorData[key].info;
                if (info) {
                    infos.push(info);
                }
                else {
                    console.log("Undefined SensorInfo: ", key);
                }
            }
        }
        var data = [];
        for (var _c = 0, infos_1 = infos; _c < infos_1.length; _c++) {
            var info = infos_1[_c];
            var found = false;
            for (var _d = 0, data_1 = data; _d < data_1.length; _d++) {
                var section = data_1[_d];
                if (!info.Name) {
                    console.log(info);
                }
                if (section.title === info.Name) {
                    found = true;
                    section.items.push({ text: info.SensorSet.Name, object: info });
                    break;
                }
            }
            if (!found) {
                data.push({ title: info.Name, items: [{ text: info.SensorSet.Name, object: info }] });
            }
        }
        expList.selector = function (item) {
            return {
                title: item.title,
                items: item.items,
            };
        };
        expList.data = data;
        expList.onItemClick.addEventListener(function (e) {
            _this.chosenListClickCounter++;
            if (_this.chosenData.length < _this.groupArgs) {
                _this.chosenData.push(e.data);
                _this.updateChosenList();
            }
            if (_this.chosenData.length === _this.groupArgs) {
                if (_this.chosenListClickCounter > _this.groupArgs) {
                    _this.chosenData.pop();
                    _this.chosenData.push(e.data);
                    _this.updateChosenList();
                }
                _this.btnMakeSource.disabled = false;
            }
        });
    };
    DataSourceBuildController.prototype.updateChosenList = function () {
        this.chosenList.data = this.chosenData;
        this.chosenList.update;
    };
    DataSourceBuildController.prototype.initChosenList = function () {
        var _this = this;
        this.chosenList = new ListBoxRearrangable();
        if (this.groupArgs > 1) {
            this.chosenList.rowInfoMarkers = ["X", "Y", "Z"];
        }
        this.chosenList.selector = function (item) {
            return { mainText: item.Name, infoText: item.SensorSet.Name };
        };
        this.subDivs[1].appendChild(this.chosenList.wrapper);
        this.chosenList.onItemRemove.addEventListener(function (e) {
            _this.chosenData = _this.chosenList.data;
            _this.btnMakeSource.disabled = true;
        });
        this.chosenList.onItemRearrange.addEventListener(function (e) {
            _this.chosenData = _this.chosenList.data;
        });
    };
    DataSourceBuildController.prototype.fillLayerSection = function () {
        // TODO: implement this
    };
    DataSourceBuildController.prototype.listDataSources = function () {
        this.sourcesList = new TempDataSourceList(this.plot);
        this.subDivs[2].appendChild(this.sourcesList.wrapper);
    };
    DataSourceBuildController.prototype.determineGroup = function () {
        var s = kernel.senMan.getGroupByType(this.plot.type);
        if (s) {
            this.sensorGroup = s.name;
            this.groupArgs = s.numGroups;
            return;
        }
        throw new Error("Group not found exception");
    };
    return DataSourceBuildController;
}(Component));
//# sourceMappingURL=DataSourceBuildController.js.map