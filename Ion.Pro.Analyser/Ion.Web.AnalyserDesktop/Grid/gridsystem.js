var GridViewer = (function () {
    function GridViewer() {
    }
    GridViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        var template = document.getElementById("temp-grid");
        var clone = document.importNode(template.content, true);
        // console.log(clone);
        this.window.content.appendChild(clone);
        // addEvents();
    };
    return GridViewer;
}());
//# sourceMappingURL=gridsystem.js.map