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
        _this.plot = plot;
        _this.wrapper = _this.mk.tag("div", "dsbController-wrapper");
        for (var i = 0; i < 4; i++) {
            var div = _this.mk.tag("div", "dsbController-section");
            _this.subDivs.push(div);
            _this.wrapper.appendChild(div);
        }
        _this.btnMakeSource = new Button();
        _this.btnMakeSource.text = "Generate";
        _this.btnMakeSource.onclick.addEventListener(function (e) {
            _this.generateSource();
            console.log("hey");
        });
        _this.toggleGenBtn();
        _this.subDivs[2].appendChild(_this.btnMakeSource.wrapper);
        console.log(_this.plot);
        _this.determineGroup();
        _this.listSensors();
        _this.initChosenList();
        return _this;
    }
    DataSourceBuildController.prototype.generateSource = function () {
        var sources = [];
        for (var _i = 0, _a = this.chosenData; _i < _a.length; _i++) {
            var s = _a[_i];
            sources.push({ name: s.Name, key: s.Key });
        }
        var template = {
            key: "",
            grouptype: this.sensorGroup.name,
            layers: [],
            sources: sources
        };
        console.log(kernel.senMan.createDataSource(template));
    };
    DataSourceBuildController.prototype.listSensors = function () {
        var _this = this;
        var expList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);
        var infos = kernel.senMan.getInfos();
        expList.selector = function (item) {
            return {
                title: item.Name,
                items: [{ text: item.SensorSet.Name, object: item }]
            };
        };
        expList.data = infos;
        expList.onItemClick.addEventListener(function (e) {
            var numGroups = _this.sensorGroup.numGroups;
            if (_this.chosenData.length < numGroups) {
                _this.chosenData.push(e.data);
                _this.updateChosenList();
            }
            if (_this.chosenData.length === numGroups) {
                _this.toggleGenBtn();
            }
        });
    };
    DataSourceBuildController.prototype.toggleGenBtn = function () {
        if (this.btnMakeSource.wrapper.style.display === "none") {
            this.btnMakeSource.wrapper.style.display = "inline-block";
        }
        else {
            this.btnMakeSource.wrapper.style.display = "none";
        }
    };
    DataSourceBuildController.prototype.updateChosenList = function () {
        this.chosenList.data = this.chosenData;
        this.chosenList.update;
    };
    DataSourceBuildController.prototype.initChosenList = function () {
        var _this = this;
        this.chosenList = new ListBoxRearrangable();
        this.chosenList.rowInfoMarkers = ["X", "Y", "Z"];
        this.chosenList.selector = function (item) {
            return { mainText: item.Name, infoText: item.SensorSet.Name };
        };
        this.subDivs[1].appendChild(this.chosenList.wrapper);
        this.chosenList.onItemRemove.addEventListener(function (e) {
            _this.chosenData = _this.chosenList.data;
            if (_this.chosenData.length < _this.sensorGroup.numGroups) {
                _this.toggleGenBtn();
            }
        });
        this.chosenList.onItemRearrange.addEventListener(function (e) {
            _this.chosenData = _this.chosenList.data;
        });
    };
    DataSourceBuildController.prototype.fillLayerSection = function () {
        // TODO: implement this
    };
    DataSourceBuildController.prototype.listDataSources = function () {
    };
    DataSourceBuildController.prototype.determineGroup = function () {
        var p = this.plot.type.length - 1;
        for (var _i = 0, _a = kernel.senMan.groups; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v.numGroups === p) {
                this.sensorGroup = v;
                return;
            }
        }
        throw "Group not found exception";
    };
    return DataSourceBuildController;
}(Component));
