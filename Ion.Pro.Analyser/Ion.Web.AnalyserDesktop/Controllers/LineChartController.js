var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LineChartController = (function (_super) {
    __extends(LineChartController, _super);
    function LineChartController() {
        var _this = _super.call(this) || this;
        _this.isDragging = false;
        _this.zoomSpeed = 1.1;
        _this.selectedPoint = null;
        _this.isMarking = false;
        _this.displayGrid = true;
        _this.stickyAxes = true;
        _this.autoScroll = false;
        _this.gridColor = "rgba(100,100,100,0.3)";
        _this.axisColor = "white"; //"black"; // "black";
        _this.mainColor = "white";
        _this.sensorInfos = [];
        _this.sensorIDs = [];
        _this.requestingSensorInfos = false;
        _this.movePoint = new Point(50, 50);
        _this.scalePoint = new Point(0.05, 6);
        return _this;
    }
    LineChartController.prototype.generate = function () {
        var _this = this;
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMarking = new ContextFixer(this.canvas.addCanvas());
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.ctxMain.strokeStyle = this.mainColor;
        this.wrapper.addEventListener("mousedown", function (e) { return _this.wrapper_mouseDown(e); });
        this.wrapper.addEventListener("mousemove", function (e) { return _this.wrapper_mouseMove(e); });
        this.wrapper.addEventListener("mouseup", function (e) { return _this.wrapper_mouseUp(e); });
        this.wrapper.addEventListener("mouseleave", function (e) { return _this.wrapper_mouseLeave(e); });
        this.wrapper.addEventListener("touchstart", function (e) { return _this.wrapper_touchStart(e); });
        this.wrapper.addEventListener("touchmove", function (e) { return _this.wrapper_touchMove(e); });
        this.wrapper.addEventListener("touchend", function (e) { return _this.wrapper_touchEnd(e); });
        this.wrapper.addEventListener("wheel", function (e) { return _this.zoom(e); });
        this.wrapper.addEventListener("keydown", function (e) { return _this.wrapper_keyDown(e); });
        this.draw();
        return this.wrapper;
    };
    LineChartController.prototype.drawMarking = function () {
        this.ctxMarking.clear();
        this.ctxMarking.fillStyle = "rgba(0,184,220,0.2)";
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.ctxMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
    };
    LineChartController.prototype.onSizeChange = function () {
        this.canvas.setSize(this.width, this.height);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.draw();
    };
    LineChartController.prototype.onDataChange = function () {
        var _this = this;
        if (this.autoScroll) {
            this.moveToLastPoint();
        }
        if (this.data.length === 0 && !this.requestingSensorInfos) {
            if (this.sensorIDs.length > 0) {
                this.sensorInfos = [];
                this.sensorIDs = [];
                console.log(this.sensorInfos);
                console.log(this.sensorIDs);
            }
        }
        else {
            var ids = [];
            for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
                var d = _a[_i];
                ids.push(d.ID);
            }
            for (var i = 0; i < ids.length; i++) {
                if (ids[i] !== this.sensorIDs[i]) {
                    this.requestingSensorInfos = true;
                    kernel.senMan.getInfos(function (infos) {
                        _this.updateSensorInfos(infos);
                    });
                    break;
                }
            }
        }
        this.draw();
    };
    LineChartController.prototype.updateSensorInfos = function (infos) {
        this.sensorInfos = [];
        this.sensorIDs = [];
        for (var _i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
            var i = infos_1[_i];
            for (var _a = 0, _b = this.data; _a < _b.length; _a++) {
                var d = _b[_a];
                if (d.ID === i.ID) {
                    this.sensorInfos.push(i);
                }
            }
        }
        for (var i = 0; i < this.data.length; i++) {
            this.sensorIDs.push(this.data[i].ID);
        }
        this.requestingSensorInfos = false;
        console.log(this.sensorInfos);
        console.log(this.sensorIDs);
    };
    LineChartController.prototype.moveToLastPoint = function () {
        if (this.data[0]) {
            var lastPointAbs = this.getAbsolute(this.data[0].getValue(this.data[0].getLength() - 1));
            if (lastPointAbs.x > this.width * 0.75 && !this.mouseDown) {
                this.movePoint.x -= lastPointAbs.x - (this.width * 0.75);
            }
        }
    };
    LineChartController.prototype.selectPoint = function (e) {
        if (this.data) {
            //var mp: Point = this.getMousePoint(e);
            var mp = e;
            var p = null;
            for (var i = 0; i < this.data.length; i++) {
                //var closest: Point = this.data[i].getClosest(this.getRelative(mp));
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
        this.ctxMain.clear();
        this.drawXAxis();
        this.drawYAxis();
        if (this.data) {
            for (var d = 0; d < this.data.length; d++) {
                //var firstVisibleIdx: number = this.data[d].getIndexOf(this.getRelative(new Point(0, 0)));
                var firstVisibleIdx = PlotDataHelper.getIndexOf(this.data[d], this.getRelative(new Point(0, 0)));
                if (firstVisibleIdx > 0) {
                    firstVisibleIdx--;
                }
                var lastPoint = lastPoint = this.getAbsolute(this.data[d].getValue(firstVisibleIdx));
                var totalLength = this.data[d].getLength();
                var drawPoint = 0;
                var checkPoint = lastPoint;
                this.ctxMain.beginPath();
                this.ctxMain.strokeStyle = this.data[d].color.toString();
                for (var i = firstVisibleIdx; i < totalLength; i++) {
                    var point = this.getAbsolute(this.data[d].getValue(i));
                    if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                        this.ctxMain.moveTo(Math.floor(point.x), Math.floor(point.y));
                        this.ctxMain.lineTo(Math.floor(checkPoint.x), Math.floor(checkPoint.y));
                        drawPoint++;
                        checkPoint = point;
                    }
                    if (point.x > this.width) {
                        break;
                    }
                    lastPoint = point;
                }
                this.ctxMain.ctx.closePath();
                this.ctxMain.stroke();
                this.ctxMain.fillStyle = this.mainColor;
            }
            if (this.selectedPoint !== null) {
                var abs = this.getAbsolute(this.selectedPoint);
                var pointString = this.selectedPoint.toString();
                this.ctxMain.beginPath();
                this.ctxMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
                this.ctxMain.stroke();
                this.ctxMain.fillText(this.selectedPoint.toString(), this.width - this.ctxMain.measureText(pointString) - 6, 13);
            }
        }
    };
    LineChartController.prototype.drawXAxis = function () {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.y >= 0 && origo.y <= this.height ? true : false;
        var y = origo.y;
        if (!visible && this.stickyAxes) {
            if (origo.y < 0) {
                y = -1;
            }
            else {
                y = this.height;
            }
        }
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(0, y);
        this.ctxMain.lineTo(this.width, y);
        this.ctxMain.stroke();
        var stepping = this.calculateSteps(this.scalePoint.x * 1000);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.width + steps; i += steps) {
            this.ctxMain.beginPath();
            var absX = i + this.movePoint.x % steps;
            var transformer = this.getRelative(new Point(absX, y));
            var num;
            var numWidth;
            var numOffset;
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
            numWidth = this.ctxMain.measureText(num);
            numOffset = y === this.height ? y - 15 : y + 15;
            this.ctxMain.fillText(num, absX - (numWidth / 2), numOffset);
            this.ctxMain.stroke();
            this.ctxMain.beginPath();
            if (this.displayGrid) {
                this.ctxMain.moveTo(absX, 0);
                this.ctxMain.lineTo(absX, this.height);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }
        }
        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
    };
    LineChartController.prototype.drawYAxis = function () {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.x >= 0 && origo.x <= this.width ? true : false;
        var x = origo.x;
        if (!visible && this.stickyAxes) {
            if (origo.x < 0) {
                x = -1;
            }
            else {
                x = this.width;
            }
        }
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(x, 0);
        this.ctxMain.lineTo(x, this.height);
        this.ctxMain.stroke();
        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        for (var i = -steps; i < this.height + steps; i += steps) {
            this.ctxMain.beginPath();
            var absY = this.height - (i + this.movePoint.y % steps);
            var transformer = this.getRelative(new Point(x, absY));
            var number;
            var numWidth;
            var numOffset;
            if (Math.abs(transformer.y).toFixed(decimalPlaces) === (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }
            numWidth = this.ctxMain.measureText(number);
            numOffset = x === -1 ? x + 8 : x - (numWidth + 7);
            this.ctxMain.fillText(number, numOffset, absY + 3);
            this.ctxMain.stroke();
            this.ctxMain.beginPath();
            if (this.displayGrid) {
                this.ctxMain.moveTo(0, absY);
                this.ctxMain.lineTo(this.width, absY);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }
        }
        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
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
        this.ctxMarking.clear();
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
        var maxPlotHeight;
        var min;
        var max;
        for (var i = 0; i < this.data.length; i++) {
        }
        //let ratio: number = this.height / 
    };
    LineChartController.prototype.wrapper_keyDown = function (e) {
        switch (e.key) {
            case "g":
                this.displayGrid = this.displayGrid === true ? false : true;
                break;
            case "r":
                this.scalePoint = new Point(1, 1);
                this.movePoint = new Point(50, 50);
                break;
            case "a":
                this.stickyAxes = this.stickyAxes === true ? false : true;
                break;
            case "k":
                this.autoScroll = this.autoScroll === true ? false : true;
                break;
        }
        this.draw();
    };
    LineChartController.prototype.wrapper_mouseLeave = function (e) {
        this.mouseDown = false;
        this.isMarking = false;
        this.ctxMarking.clear();
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
var ContextFixer = (function () {
    function ContextFixer(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.fillStyle = "black";
        this.strokeStyle = "black";
    }
    ContextFixer.prototype.fill = function () {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
    };
    ContextFixer.prototype.moveTo = function (x, y) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    };
    ContextFixer.prototype.lineTo = function (x, y) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    };
    ContextFixer.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    ContextFixer.prototype.beginPath = function () {
        this.ctx.beginPath();
    };
    ContextFixer.prototype.stroke = function () {
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke();
    };
    ContextFixer.prototype.fillText = function (text, x, y) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.fillText(text, x, y);
    };
    ContextFixer.prototype.fillRect = function (x, y, width, height) {
        this.ctx.fillStyle = this.fillStyle;
        var newX = Math.floor(x);
        var newY = Math.floor(y);
        var newWidth = Math.floor(width);
        var newHeight = Math.floor(height);
        this.ctx.fillRect(newX, newY, newWidth, newHeight);
    };
    ContextFixer.prototype.arc = function (x, y, radius, startAngle, endAngle) {
        radius = radius < 0 ? 0 : radius;
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    };
    ContextFixer.prototype.measureText = function (text) {
        return this.ctx.measureText(text).width;
    };
    ContextFixer.prototype.translate = function (x, y) {
        this.ctx.translate(x, y);
    };
    ContextFixer.prototype.rotate = function (angle) {
        this.ctx.rotate(angle);
    };
    return ContextFixer;
}());
var LayeredCanvas = (function () {
    function LayeredCanvas(wrapper) {
        this.canvases = [];
        this.mk = new HtmlHelper;
        this.wrapper = wrapper;
    }
    LayeredCanvas.prototype.addCanvas = function () {
        var canvas = this.mk.tag("canvas", "plot-canvas");
        this.wrapper.appendChild(canvas);
        this.canvases.push(canvas);
        return canvas;
    };
    LayeredCanvas.prototype.getWidth = function () {
        if (this.canvases.length > 0) {
            return this.canvases[0].width;
        }
        return -1;
    };
    LayeredCanvas.prototype.getHeight = function () {
        if (this.canvases.length > 0) {
            return this.canvases[0].height;
        }
        return -1;
    };
    LayeredCanvas.prototype.setSize = function (width, height) {
        for (var _i = 0, _a = this.canvases; _i < _a.length; _i++) {
            var c = _a[_i];
            c.width = width;
            c.height = height;
        }
    };
    return LayeredCanvas;
}());
//# sourceMappingURL=LineChartController.js.map