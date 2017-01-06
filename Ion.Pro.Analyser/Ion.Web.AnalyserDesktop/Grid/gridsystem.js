var GridViewer = (function () {
    function GridViewer() {
    }
    GridViewer.prototype.main = function () {
        this.window = kernel.winMan.createWindow(this.application, "Grid Viewer");
        var template = document.getElementById("temp-grid");
        var clone = document.importNode(template.content, true);
        // console.log(clone);
        this.window.content.appendChild(clone);
        addEvents();
    };
    return GridViewer;
}());
function addEvents() {
    var bar1 = document.getElementById("bar1");
    var bar2 = document.getElementById("bar2");
    var window1 = document.getElementById("window1");
    var window2 = document.getElementById("window2");
    var container;
    var editFunction;
    var moving = false;
    window.addEventListener("mousemove", function (event) {
        if (moving) {
            editFunction(event);
        }
    });
    window.addEventListener("mouseup", function (event) {
        moving = false;
        document.body.style.cursor = null;
    });
    var innerGrid = window1.getElementsByClassName("grid-window")[0];
    var firstGrid = document.getElementById("dropbox");
    firstGrid.addEventListener("mouseup", function (event) {
        console.log("Release");
        innerGrid.innerHTML = "";
        var windowBody = kernel.winMan.activeWindow.handle.getElementsByClassName("window-body")[0];
        windowBody.style.width = "100%";
        windowBody.style.height = "100%";
        innerGrid.appendChild(windowBody);
    });
    bar1.addEventListener("mousedown", function (event) {
        container = findWindow(this);
        editFunction = function (event) {
            resizeHeight(window1, event, container);
        };
        document.body.style.cursor = "ns-resize";
        moving = true;
    });
    bar2.addEventListener("mousedown", function (event) {
        container = findWindow(this);
        editFunction = function handle(event) {
            console.log(container);
            console.log(event);
            resizeWidth(window2, event, container);
        };
        document.body.style.cursor = "ew-resize";
        moving = true;
    });
}
function findWindow(element) {
    var temp = element.window;
    while (temp == null && element != null) {
        element = element.parentElement;
        temp = element.window;
    }
    return temp;
}
function resizeWidth(gridWindow, event, appWindow) {
    gridWindow.style.width = (appWindow.width - (event.clientX - appWindow.x) - 4) + "px";
    resizeCommon(gridWindow, event);
}
function resizeHeight(gridWindow, event, appWindow) {
    gridWindow.style.height = (appWindow.height - (event.clientY - appWindow.y) - 4 + 30) + "px";
    resizeCommon(gridWindow, event);
}
function resizeCommon(gridWindow, event) {
    gridWindow.style.flexGrow = "0";
    gridWindow.style.flexBasis = "unset";
}
//# sourceMappingURL=gridsystem.js.map