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
var LineChartController = (function (_super) {
    __extends(LineChartController, _super);
    function LineChartController() {
        var _this = _super.call(this) || this;
        _this.isDragging = false;
        _this.zoomSpeed = 1.1;
        _this.selectedPoint = null;
        _this.isMarking = false;
        _this.scalePoint_start = new Point(0.005, 6);
        _this.movePoint_start = new Point(50, 50);
        _this.autoScroll_plotMoved = false;
        _this.mainColor = "white";
        _this.legend = new LineChartLegend(150, 50, true);
        _this.defaultCursor = "default";
        _this.showGrid = {
            text: "Show grid",
            longText: "Show or hide grid lines",
            shortCut: "G",
            type: "boolean",
            value: true,
        };
        _this.stickyAxes = {
            text: "Sticky axes",
            longText: "Assures axes are always visible. When off, axes can be scrolled out of view.",
            shortCut: "A",
            type: "boolean",
            value: true,
        };
        _this.autoScroll = {
            text: "Auto scroll",
            longText: "Automatically scrolls to the last inserted value in the linechart. Only applicable when receiving data live.",
            shortCut: "K",
            type: "boolean",
            value: false,
        };
        _this.toggleLegend = {
            text: "Legend",
            longText: "Show or hide legend",
            shortCut: "L",
            type: "boolean",
            value: true,
        };
        _this.settings = {
            showGrid: _this.showGrid,
            stickyAxes: _this.stickyAxes,
            autoScroll: _this.autoScroll,
            toggleLegend: _this.toggleLegend,
            reset: {
                text: "Reset",
                longText: "Resets the zoom and position of the plot",
                shortCut: "R",
                type: "action",
                value: function () { _this.reset(); },
            },
        };
        _this.darkTheme = true;
        _this.movePoint = _this.movePoint_start.copy();
        _this.scalePoint = _this.scalePoint_start.copy();
        return _this;
    }
    LineChartController.prototype.settingsChanged = function (key, value) {
        this.draw();
    };
    LineChartController.prototype.generate = function () {
        var _this = this;
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.wrapper.style.cursor = this.defaultCursor;
        this.canvas = new LayeredCanvas();
        this.canvasMarking = this.canvas.addCanvas();
        this.canvasMain = this.canvas.addCanvas();
        this.canvasLegend = this.canvas.addCanvas();
        this.wrapper.appendChild(this.canvas.wrapper);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvasMain.strokeStyle = this.mainColor;
        this.wrapper.addEventListener("mousedown", function (e) { return _this.wrapper_mouseDown(e); });
        this.wrapper.addEventListener("mousemove", function (e) { return _this.wrapper_mouseMove(e); });
        this.wrapper.addEventListener("mouseup", function (e) { return _this.wrapper_mouseUp(e); });
        this.wrapper.addEventListener("mouseleave", function (e) { return _this.wrapper_mouseLeave(e); });
        this.wrapper.addEventListener("touchstart", function (e) { return _this.wrapper_touchStart(e); });
        this.wrapper.addEventListener("touchmove", function (e) { return _this.wrapper_touchMove(e); });
        this.wrapper.addEventListener("touchend", function (e) { return _this.wrapper_touchEnd(e); });
        this.wrapper.addEventListener("wheel", function (e) { return _this.zoom(e); });
        this.wrapper.addEventListener("keydown", function (e) { return _this.wrapper_keyDown(e); });
        this.wrapper.addEventListener("keyup", function (e) { return _this.wrapper_keyUp(e); });
        this.updateColors();
        return this.wrapper;
    };
    LineChartController.prototype.setColors = function () {
        this.axisColor = kernel.winMan.getRule(".line-chart").style.borderColor;
        this.gridColor = kernel.winMan.getRule(".line-chart").style.color;
        this.markingColor = kernel.winMan.getRule(".line-chart").style.backgroundColor;
        this.legend.backgroundColor = kernel.winMan.getRule(".line-chart-legend").style.backgroundColor;
        this.legend.textColor = kernel.winMan.getRule(".line-chart-legend").style.color;
        this.legend.borderColor = kernel.winMan.getRule(".line-chart-legend").style.borderColor;
    };
    LineChartController.prototype.updateColors = function () {
        this.darkTheme = true;
        if (kernel.winMan.curTheme === "app-style") {
            this.darkTheme = false;
        }
        this.setColors();
        this.draw();
    };
    LineChartController.prototype.drawMarking = function () {
        this.canvasMarking.clear();
        this.canvasMarking.fillStyle = this.markingColor;
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.canvasMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
    };
    LineChartController.prototype.onSizeChange = function () {
        this.canvas.setSize(this.width, this.height);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.draw();
    };
    LineChartController.prototype.onDataChange = function () {
        if (this.autoScroll.value && !this.mouseDown) {
            this.moveToLastPoint();
            if (this.autoScroll_plotMoved) {
                this.autoScroll_plotMoved = false;
                this.autoScaleY();
            }
        }
        this.draw();
    };
    LineChartController.prototype.onSensorChange = function () {
        if (this.data.length > 0) {
            this.autoScaleY();
        }
    };
    LineChartController.prototype.moveToLastPoint = function () {
        if (this.data[0]) {
            var lastPointAbs = this.getAbsolute(this.data[0].getValue(this.data[0].length() - 1));
            if (lastPointAbs.x > this.width * 0.75 && !this.mouseDown) {
                this.movePoint.x -= lastPointAbs.x - (this.width * 0.75);
            }
        }
    };
    LineChartController.prototype.selectPoint = function (e) {
        if (this.data) {
            // var mp: Point = this.getMousePoint(e);
            var mp = e;
            var p = null;
            for (var i = 0; i < this.data.length; i++) {
                // var closest: Point = this.data[i].getClosest(this.getRelative(mp));
                var closest = PlotDataHelper.getClosest(this.data[i], this.getRelative(mp));
                if (Math.abs(this.getAbsolute(closest).y - mp.y) < 10) {
                    p = closest;
                }
            }
            if (p !== null) {
                this.selectedPoint = p;
            }
            else {
                this.selectedPoint = null;
            }
            this.draw();
        }
    };
    LineChartController.prototype.zoom = function (e) {
        e.preventDefault();
        var mousePoint = this.getMousePoint(e);
        var curRel = this.getRelative(mousePoint);
        if (e.deltaY < 0) {
            if (e.ctrlKey === true) {
                this.scalePoint.x *= this.zoomSpeed;
            }
            else if (e.shiftKey === true) {
                this.scalePoint.y *= this.zoomSpeed;
            }
            else {
                this.scalePoint.x *= this.zoomSpeed;
                this.scalePoint.y *= this.zoomSpeed;
            }
        }
        else {
            if (e.ctrlKey === true) {
                this.scalePoint.x /= this.zoomSpeed;
            }
            else if (e.shiftKey === true) {
                this.scalePoint.y /= this.zoomSpeed;
            }
            else {
                this.scalePoint.x /= this.zoomSpeed;
                this.scalePoint.y /= this.zoomSpeed;
            }
        }
        var newRel = this.getRelative(mousePoint);
        var move = new Point((newRel.x - curRel.x) * this.scalePoint.x, (newRel.y - curRel.y) * this.scalePoint.y);
        this.movePoint = this.movePoint.add(move);
        this.draw();
    };
    LineChartController.prototype.draw = function () {
        this.canvasMain.clear();
        this.drawXAxis();
        this.drawYAxis();
        this.drawLegend();
        if (this.data) {
            for (var d = 0; d < this.data.length; d++) {
                var firstVisibleIdx = PlotDataHelper.getIndexOf(this.data[d], this.getRelative(new Point(0, 0)));
                if (firstVisibleIdx > 0) {
                    firstVisibleIdx--;
                }
                if (firstVisibleIdx < 0) {
                    console.log("Empty dataset detected");
                    continue;
                }
                var lastPoint = this.getAbsolute(this.data[d].getValue(firstVisibleIdx));
                var totalLength = this.data[d].length();
                var checkPoint = lastPoint;
                this.canvasMain.beginPath();
                if (this.darkTheme) {
                    //console.log("Dark theme");
                    this.canvasMain.strokeStyle = this.data[d].color.toString();
                }
                else {
                    //console.log("Light theme");
                    this.canvasMain.strokeStyle = this.data[d].color.toString(true);
                }
                for (var i = firstVisibleIdx; i < totalLength; i++) {
                    var point = this.getAbsolute(this.data[d].getValue(i));
                    if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                        this.canvasMain.moveTo(point.x, point.y);
                        this.canvasMain.lineTo(checkPoint.x, checkPoint.y);
                        checkPoint = point;
                    }
                    if (point.x > this.width) {
                        break;
                    }
                    lastPoint = point;
                }
                this.canvasMain.closePath();
                this.canvasMain.stroke();
                this.canvasMain.fillStyle = this.mainColor;
            }
            if (this.selectedPoint !== null) {
                var abs = this.getAbsolute(this.selectedPoint);
                var pointString = this.selectedPoint.toString();
                this.canvasMain.strokeStyle = this.axisColor;
                this.canvasMain.fillStyle = this.axisColor;
                this.canvasMain.beginPath();
                this.canvasMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
                this.canvasMain.stroke();
                this.canvasMain.textBaseline = "middle";
                var modifiedPoint = this.selectedPoint.divide(new Point(1000, 1));
                if (this.toggleLegend.value) {
                    this.canvasMain.fillText(modifiedPoint.toString(), this.width - this.canvasMain.measureText(pointString) - 6, this.height - 10);
                }
                else {
                    this.canvasMain.fillText(modifiedPoint.toString(), this.width - this.canvasMain.measureText(pointString) - 6, 10);
                }
                this.canvasMain.fillStyle = this.mainColor;
                this.canvasMain.strokeStyle = this.mainColor;
                this.canvasMain.textBaseline = "alphabetic";
            }
        }
    };
    LineChartController.prototype.drawLegend = function () {
        this.canvasLegend.clear();
        this.legend.darkTheme = this.darkTheme;
        if (this.toggleLegend.value) {
            if (this.data) {
                if (this.data.length > 0) {
                    this.legend.dataSources = this.data;
                }
                else {
                    this.legend.dataSources = null;
                }
            }
            else {
                this.legend.dataSources = null;
            }
            var margin = 10;
            var imageData = this.legend.canvas.getImageData(0, 0, this.legend.width, this.legend.height);
            this.canvasLegend.putImageData(imageData, this.width - this.legend.width - margin, margin);
        }
    };
    LineChartController.prototype.drawXAxis = function () {
        this.canvasMain.strokeStyle = this.axisColor;
        this.canvasMain.fillStyle = this.axisColor;
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.y >= 0 && origo.y <= this.height ? true : false;
        var y = origo.y;
        if (!visible && this.stickyAxes.value) {
            if (origo.y < 0) {
                y = -1;
            }
            else {
                y = this.height;
            }
        }
        this.canvasMain.beginPath();
        this.canvasMain.moveTo(0, y);
        this.canvasMain.lineTo(this.width, y);
        this.canvasMain.stroke();
        var stepping = this.calculateSteps(this.scalePoint.x * 1000);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.width + steps; i += steps) {
            this.canvasMain.beginPath();
            var absX = i + this.movePoint.x % steps;
            var transformer = this.getRelative(new Point(absX, y));
            var num = void 0;
            var numWidth = void 0;
            var numOffset = void 0;
            var val = transformer.x / 1000;
            if (Math.abs(val).toFixed(decimalPlaces) === (0).toFixed(decimalPlaces)) {
                num = "     0";
            }
            else if (Math.abs(scale) > 5) {
                num = val.toExponential(2);
            }
            else {
                num = val.toFixed(decimalPlaces);
            }
            numWidth = this.canvasMain.measureText(num);
            numOffset = y === this.height ? y - 15 : y + 15;
            this.canvasMain.fillText(num, absX - (numWidth / 2), numOffset);
            this.canvasMain.stroke();
            this.canvasMain.beginPath();
            if (this.showGrid.value) {
                this.canvasMain.moveTo(absX, 0);
                this.canvasMain.lineTo(absX, this.height);
                this.canvasMain.strokeStyle = this.gridColor;
                this.canvasMain.stroke();
            }
        }
        this.canvasMain.strokeStyle = this.mainColor;
        this.canvasMain.fillStyle = this.mainColor;
    };
    LineChartController.prototype.drawYAxis = function () {
        this.canvasMain.strokeStyle = this.axisColor;
        this.canvasMain.fillStyle = this.axisColor;
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.x >= 0 && origo.x <= this.width ? true : false;
        var x = origo.x;
        if (!visible && this.stickyAxes.value) {
            if (origo.x < 0) {
                x = -1;
            }
            else {
                x = this.width;
            }
        }
        this.canvasMain.beginPath();
        this.canvasMain.moveTo(x, 0);
        this.canvasMain.lineTo(x, this.height);
        this.canvasMain.stroke();
        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.height + steps; i += steps) {
            this.canvasMain.beginPath();
            var absY = this.height - (i + this.movePoint.y % steps);
            var transformer = this.getRelative(new Point(x, absY));
            var number = void 0;
            var numWidth = void 0;
            var numOffset = void 0;
            if (Math.abs(transformer.y).toFixed(decimalPlaces) === (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }
            numWidth = this.canvasMain.measureText(number);
            numOffset = x === -1 ? x + 8 : x - (numWidth + 7);
            this.canvasMain.fillText(number, numOffset, absY + 3);
            this.canvasMain.stroke();
            this.canvasMain.beginPath();
            if (this.showGrid.value) {
                this.canvasMain.moveTo(0, absY);
                this.canvasMain.lineTo(this.width, absY);
                this.canvasMain.strokeStyle = this.gridColor;
                this.canvasMain.stroke();
            }
        }
        this.canvasMain.strokeStyle = this.mainColor;
        this.canvasMain.fillStyle = this.mainColor;
    };
    LineChartController.prototype.calculateSteps = function (scaling) {
        var log10 = function (val) { return Math.log(val) / Math.LN10; };
        var maxR = 100 / scaling;
        var scale = Math.floor(log10(maxR));
        var step = Math.floor(maxR / Math.pow(10, scale));
        if (step < 2) {
            step = 1;
        }
        else if (step < 5) {
            step = 2;
        }
        else {
            step = 5;
        }
        var newstep = step * Math.pow(10, scale) * scaling;
        var decimalPlaces = 0;
        if (scale < 0) {
            decimalPlaces = scale * -1;
        }
        return { steps: newstep, decimalPlaces: decimalPlaces, scale: scale };
    };
    LineChartController.prototype.zoomByMarking = function () {
        this.canvasMarking.clear();
        var width = this.marking.width;
        var height = this.marking.height;
        var xRatio = this.width / width;
        var yRatio = this.height / height;
        var downLeft = new Point(Math.min(this.marking.firstPoint.x, this.marking.secondPoint.x), Math.max(this.marking.firstPoint.y, this.marking.secondPoint.y));
        var first = this.getRelative(downLeft);
        this.scalePoint.x = Math.abs(this.scalePoint.x * xRatio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * yRatio);
        var sec = this.getAbsolute(first);
        sec.y = this.height - sec.y;
        this.movePoint = this.movePoint.sub(sec);
        this.draw();
    };
    LineChartController.prototype.autoScaleY = function () {
        var min = 0;
        var max = 0;
        for (var i = 0; i < this.data.length; i++) {
            var info = this.data[i].infos.SensorInfos[0];
            if (info) {
                var dmin = SensorInfoHelper.minValue(info);
                var dmax = SensorInfoHelper.maxValue(info);
                min = dmin < min ? dmin : min;
                max = dmax > max ? dmax : max;
            }
        }
        if (min !== max) {
            var padding = (max - min) * 0.2;
            min -= padding / 2;
            max += padding / 2;
            var minAbs = this.getAbsolute(new Point(0, min)).y;
            var maxAbs = this.getAbsolute(new Point(0, max)).y;
            var plotHeight = Math.abs(maxAbs - minAbs);
            var ratio = this.height / plotHeight;
            var first = min;
            this.scalePoint.y *= ratio;
            var sec = this.getAbsolute(new Point(0, first)).y;
            sec = this.height - sec;
            this.movePoint.y -= sec;
            this.scalePoint_start.y = this.scalePoint.y;
            this.movePoint_start.y = this.movePoint.y;
            this.draw();
        }
    };
    LineChartController.prototype.reset = function () {
        this.scalePoint = this.scalePoint_start.copy();
        this.movePoint = this.movePoint_start.copy();
    };
    LineChartController.prototype.wrapper_keyDown = function (e) {
        switch (e.key) {
            case "g":
                this.showGrid.value = !this.showGrid.value;
                break;
            case "r":
                this.reset();
                break;
            case "a":
                this.stickyAxes.value = !this.stickyAxes.value;
                break;
            case "k":
                this.autoScroll.value = !this.autoScroll.value;
                break;
            case "l":
                this.toggleLegend.value = !this.toggleLegend.value;
                break;
            case "Control":
                this.wrapper.style.cursor = "w-resize";
                break;
            case "Alt":
                this.wrapper.style.cursor = "crosshair";
                break;
            case "Shift":
                this.wrapper.style.cursor = "n-resize";
                break;
        }
        this.draw();
    };
    LineChartController.prototype.wrapper_keyUp = function (e) {
        this.wrapper.style.cursor = this.defaultCursor;
    };
    LineChartController.prototype.wrapper_mouseLeave = function (e) {
        this.mouseDown = false;
        this.isMarking = false;
        this.wrapper.style.cursor = "default";
        this.canvasMarking.clear();
    };
    LineChartController.prototype.wrapper_mouseDown = function (e) {
        e.preventDefault();
        this.mouseMod = new Point(this.movePoint.x - e.layerX, this.movePoint.y - (this.height - e.layerY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            var mousePoint = this.getMousePoint(e);
            this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
        }
    };
    LineChartController.prototype.wrapper_mouseMove = function (e) {
        if (this.mouseDown && (e.movementX !== 0 || e.movementY !== 0)) {
            if (this.isMarking) {
                this.marking.secondPoint = this.getMousePoint(e);
                this.drawMarking();
            }
            else {
                this.autoScroll_plotMoved = true;
                this.isDragging = true;
                this.movePoint = new Point(e.layerX + this.mouseMod.x, (this.height - e.layerY) + this.mouseMod.y);
                this.draw();
            }
        }
    };
    LineChartController.prototype.wrapper_mouseUp = function (e) {
        this.wrapper.focus();
        this.mouseDown = false;
        if (this.isDragging) {
            this.isDragging = false;
        }
        else if (this.isMarking) {
            this.isMarking = false;
            if (this.marking.width !== 0 && this.marking.height !== 0) {
                this.zoomByMarking();
            }
        }
        else {
            this.selectPoint(this.getMousePoint(e));
        }
        this.wrapper.style.cursor = this.defaultCursor;
    };
    LineChartController.prototype.wrapper_touchStart = function (e) {
        e.preventDefault();
        console.log(e);
        this.mouseMod = new Point(this.movePoint.x - e.touches[0].clientX, this.movePoint.y - (this.height - e.touches[0].clientY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            var mousePoint = this.getTouchPoint(e);
            this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
            console.log(this.marking.firstPoint);
        }
    };
    LineChartController.prototype.wrapper_touchMove = function (e) {
        if (this.mouseDown /*&& (e.movementX !== 0 || e.movementY !== 0)*/) {
            if (this.isMarking) {
                this.marking.secondPoint = this.getTouchPoint(e);
                this.drawMarking();
            }
            else {
                this.isDragging = true;
                this.movePoint = new Point(e.touches[0].clientX + this.mouseMod.x, (this.height - e.touches[0].clientY) + this.mouseMod.y);
                this.draw();
            }
        }
    };
    LineChartController.prototype.wrapper_touchEnd = function (e) {
        console.log(e);
        this.wrapper.focus();
        this.mouseDown = false;
        if (this.isDragging) {
            this.isDragging = false;
        }
        else if (this.isMarking) {
            this.isMarking = false;
            if (this.marking.width !== 0 && this.marking.height !== 0) {
                this.zoomByMarking();
            }
        }
        else {
            this.selectPoint(this.getTouchPoint(e));
        }
    };
    return LineChartController;
}(MultiValueCanvasController));
var LineChartLegend = (function () {
    function LineChartLegend(width, height, darkTheme) {
        this.__backgroundColor = "black";
        this.__textColor = "white";
        this.__borderColor = "green";
        this.defHeight = height;
        this.__height = height;
        this.__width = width;
        this.__darkTheme = darkTheme;
        this.canvas = new Canvas();
        this.canvas.width = this.__width;
        this.canvas.height = this.__height;
    }
    Object.defineProperty(LineChartLegend.prototype, "width", {
        get: function () { return this.__width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "height", {
        get: function () { return this.__height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "backgroundColor", {
        set: function (color) {
            if (color) {
                this.__backgroundColor = color;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "textColor", {
        set: function (color) {
            if (color) {
                this.__textColor = color;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "borderColor", {
        set: function (color) {
            if (color) {
                this.__borderColor = color;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "dataSources", {
        set: function (data) {
            this.__dataSources = data;
            this.resize(this.defHeight);
            this.draw();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineChartLegend.prototype, "darkTheme", {
        set: function (bool) {
            this.__darkTheme = bool;
        },
        enumerable: true,
        configurable: true
    });
    LineChartLegend.prototype.draw = function () {
        var data = this.__dataSources;
        this.canvas.clear();
        this.canvas.fillStyle = this.__backgroundColor;
        this.canvas.strokeStyle = this.__borderColor;
        this.canvas.rect(0, 0, this.__width, this.__height);
        this.canvas.fill();
        this.canvas.stroke();
        if (data) {
            var lineSpacing = 13;
            var topBottompadding = 13;
            var sidePadding = 10;
            var lineLength = 10;
            var lineWidth = 3;
            var positionY = topBottompadding;
            for (var i = 0; i < data.length; i++) {
                if (positionY > this.__height - topBottompadding) {
                    this.resize(positionY + topBottompadding);
                    this.draw();
                    return;
                }
                var positionX = sidePadding;
                var name_1 = data[i].infos.SensorInfos[0].Name;
                var unit = data[i].infos.SensorInfos[0].Unit;
                this.canvas.beginPath();
                if (this.__darkTheme) {
                    this.canvas.strokeStyle = data[i].color.toString();
                }
                else {
                    this.canvas.strokeStyle = data[i].color.toString(true);
                }
                this.canvas.lineCap = "round";
                this.canvas.moveTo(positionX, positionY);
                positionX += lineLength;
                this.canvas.lineTo(positionX, positionY);
                this.canvas.lineWidth = lineWidth;
                this.canvas.stroke();
                this.canvas.lineWidth = 1;
                positionX += 10;
                this.canvas.moveTo(positionX, positionY);
                this.canvas.fillStyle = this.__textColor;
                this.canvas.textAlign = "start";
                this.canvas.textBaseline = "middle";
                if (unit) {
                    unit = unit.replace("&deg;", "°");
                    this.canvas.fillText(name_1 + " (" + unit + ")", positionX, positionY, (this.__width - positionX - sidePadding));
                }
                else {
                    this.canvas.fillText(name_1, positionX, positionY, (this.__width - positionX - sidePadding));
                }
                this.canvas.closePath();
                positionY += lineSpacing;
            }
        }
        else {
            this.canvas.fillStyle = this.__textColor;
            this.canvas.textAlign = "center";
            this.canvas.textBaseline = "middle";
            this.canvas.fillText("No data", (this.__width / 2), (this.__height / 2));
        }
    };
    LineChartLegend.prototype.resize = function (height) {
        this.__height = height;
        this.canvas.height = height;
    };
    return LineChartLegend;
}());
//# sourceMappingURL=LineChartController.js.map