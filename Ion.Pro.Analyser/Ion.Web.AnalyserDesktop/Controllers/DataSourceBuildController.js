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
        _this.plot = plot;
        _this.wrapper = _this.mk.tag("div", "dsbController-wrapper");
        for (var i = 0; i < 4; i++) {
            var div = _this.mk.tag("div", "dsbController-section");
            _this.subDivs.push(div);
            _this.wrapper.appendChild(div);
        }
        _this.listSensors();
        return _this;
    }
    DataSourceBuildController.prototype.listSensors = function () {
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
        expList.onItemClick.addEventListener(function (item) { console.log(item.data); });
    };
    return DataSourceBuildController;
}(Component));
//# sourceMappingURL=DataSourceBuildController.js.map