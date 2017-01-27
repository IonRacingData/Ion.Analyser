var TestDataViewer = (function () {
    function TestDataViewer() {
        this.plotType = "Test Data Viewer";
    }
    TestDataViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Test Data Viewer");
        kernel.senMan.register(this);
    };
    TestDataViewer.prototype.draw = function () {
        console.log("Here we should draw something, but you know, we are lazy");
    };
    TestDataViewer.prototype.dataUpdate = function () {
        this.draw();
    };
    return TestDataViewer;
}());
var DataAssigner = (function () {
    function DataAssigner() {
    }
    DataAssigner.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Data Assigner");
        var tableGen = new HtmlTableGen("table");
        var senMan = kernel.senMan;
        tableGen.addHeader("Plot name", "plot type");
        for (var i = 0; i < senMan.plotter.length; i++) {
            tableGen.addRow(senMan.plotter[i].plotType, Array.isArray(senMan.plotter[i].plotData) ? "Multi Plot" : "Single Plot");
        }
        this.window.content.appendChild(tableGen.generate());
    };
    return DataAssigner;
}());
//# sourceMappingURL=TestDataViewer.js.map