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
        _this.listSensors();
        _this.initChosenList();
        return _this;
    }
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
            _this.chosenData.push(e.data);
            _this.updateChosenList();
        });
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
            console.log(_this.chosenData);
        });
        this.chosenList.onItemRearrange.addEventListener(function (e) {
            _this.chosenData = _this.chosenList.data;
        });
    };
    return DataSourceBuildController;
}(Component));
//# sourceMappingURL=DataSourceBuildController.js.map