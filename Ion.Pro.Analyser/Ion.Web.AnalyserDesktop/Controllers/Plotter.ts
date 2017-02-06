﻿class Plotter {
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;
    ctxMarking: ContextFixer;
    ctxBackground: ContextFixer;
    width: number;
    height: number;
    data: PlotData[];
    movePoint = new Point(50, 50);
    scalePoint = new Point(0.01, 1);
    mouseMod: Point;
    mouseDown: boolean;
    isDragging = false;
    zoomSpeed: number = 1.1;
    selectedPoint: Point = null;
    isMarking = false;
    marking: IMarking;
    displayGrid = true;
    stickyAxes = true;
    backgroundColor = "rgb(45, 45, 45)";
    gridColor = "rgba(100,100,100,0.3)";
    axisColor = "white";//"black"; // "black";
    mainColor = "white";

    constructor(data: PlotData[]) {
        this.data = data;
    }

    generatePlot(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";

        this.canvas = new LayeredCanvas(this.wrapper, ["background", "main", "marking"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);        
        this.ctxMarking = new ContextFixer(this.canvas.canvases["marking"]);
        this.ctxBackground = new ContextFixer(this.canvas.canvases["background"]);
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.ctxMain.strokeStyle = this.mainColor;

        this.wrapper.addEventListener("mousedown", (e: MouseEvent) => this.wrapper_mouseDown(e));
        this.wrapper.addEventListener("mousemove", (e: MouseEvent) => this.wrapper_mouseMove(e));
        this.wrapper.addEventListener("mouseup", (e: MouseEvent) => this.wrapper_mouseUp(e));

        this.wrapper.addEventListener("touchstart", (e: TouchEvent) => this.wrapper_touchStart(e));
        this.wrapper.addEventListener("touchmove", (e: TouchEvent) => this.wrapper_touchMove(e));
        this.wrapper.addEventListener("touchend", (e: TouchEvent) => this.wrapper_touchEnd(e));

        this.wrapper.addEventListener("mouseleave", () => {
            this.mouseDown = false;
            this.isMarking = false;
            this.ctxMarking.clear();
        });
        this.wrapper.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));
        this.wrapper.addEventListener("keydown", (e: KeyboardEvent) => {
            console.log("key pressed");
            if (e.key === "g") {
                this.displayGrid = this.displayGrid === true ? false : true;
                this.draw();
            } else if (e.key === "r") {
                this.scalePoint = new Point(1, 1);
                this.movePoint = new Point(50, 50);
                this.draw();
            } else if (e.key === "a") {
                this.stickyAxes = this.stickyAxes === true ? false : true;
                this.draw();
            }
        });

        this.draw();
        return this.wrapper;
    }

    private wrapper_mouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.mouseMod = new Point(this.movePoint.x - e.layerX, this.movePoint.y - (this.height - e.layerY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            var mousePoint: Point = this.getMousePoint(e);
            this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
            console.log(this.marking.firstPoint);
        }
    }

    private wrapper_mouseMove(e: MouseEvent): void {
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
    }

    private wrapper_mouseUp(e: MouseEvent): void {
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
    }

    private wrapper_touchStart(e: TouchEvent): void {
        e.preventDefault();
        console.log(e);
        this.mouseMod = new Point(this.movePoint.x - e.touches[0].clientX, this.movePoint.y - (this.height - e.touches[0].clientY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            var mousePoint: Point = this.getTouchPoint(e);
            this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
            console.log(this.marking.firstPoint);
        }
    }

    private wrapper_touchMove(e: TouchEvent): void {
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
    }

    private wrapper_touchEnd(e: TouchEvent): void {
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
    }

    drawMarking(): void {
        this.ctxMarking.clear();
        this.ctxMarking.fillStyle = "rgba(0,184,220,0.2)";
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.ctxMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.canvas.setSize(width, height);
        this.draw();
    }

    selectPoint(e: Point): void {
        //var mp: Point = this.getMousePoint(e);
        var mp = e;
        var p: Point = null;
        for (let i: number = 0; i < this.data.length; i++) {
            var closest: Point = this.data[i].getClosest(this.getRelative(mp));
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

    zoom(e: WheelEvent): void {
        e.preventDefault();
        var mousePoint: Point = this.getMousePoint(e);
        var curRel: Point = this.getRelative(mousePoint);

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
        var newRel: Point = this.getRelative(mousePoint);

        var move: Point = new Point((newRel.x - curRel.x) * this.scalePoint.x, (newRel.y - curRel.y) * this.scalePoint.y);
        this.movePoint = this.movePoint.add(move);
        this.draw();
    }

    getMousePoint(e: MouseEvent): Point {
        return new Point(e.layerX, e.layerY);
    }

    getTouchPoint(e: TouchEvent): Point {
        if (e.touches.length > 0)
            return new Point(e.touches[0].clientX, e.touches[0].clientY);
        else
            return new Point(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }

    draw(): void {
        this.ctxMain.clear();        

        this.drawXAxis();
        this.drawYAxis();

        for (var d: number = 0; d < this.data.length; d++) {
            var firstVisibleIdx: number = this.data[d].getIndexOf(this.getRelative(new Point(0, 0)));
            if (firstVisibleIdx > 0) {
                firstVisibleIdx--;
            }

            var lastPoint: Point = lastPoint = this.getAbsolute(this.data[d].points[firstVisibleIdx]);
            var totalLength: number = this.data[d].points.length;
            var points: Point[] = this.data[d].points;
            var drawPoint: number = 0;
            var checkPoint: Point = lastPoint;

            this.ctxMain.beginPath();
            this.ctxMain.strokeStyle = this.data[d].color;

            for (var i: number = firstVisibleIdx; i < totalLength; i++) {
                var point: Point = this.getAbsolute(points[i]);
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
            var abs: Point = this.getAbsolute(this.selectedPoint);
            var pointString: string = this.selectedPoint.toString();
            this.ctxMain.beginPath();
            this.ctxMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            this.ctxMain.stroke();
            this.ctxMain.fillText(this.selectedPoint.toString(), this.width - this.ctxMain.measureText(pointString) - 6, 13);
        }

        this.ctxBackground.fillStyle = this.backgroundColor;
        this.ctxBackground.fillRect(0, 0, this.width, this.height);

    }

    drawXAxis(): void {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;

        var origo: Point = this.getAbsolute(new Point(0, 0));
        var visible: boolean = origo.y >= 0 && origo.y <= this.height ? true : false;

        var y: number = origo.y;
        if (!visible && this.stickyAxes) {
            if (origo.y < 0) {
                y = 0;
            }
            else {
                y = this.height;
            }
        }

        this.ctxMain.beginPath();
        this.ctxMain.moveTo(0, y);
        this.ctxMain.lineTo(this.width, y);
        this.ctxMain.stroke();

        var stepping: IStepInfo = this.calculateSteps(this.scalePoint.x);
        var steps: number = stepping.steps;
        var decimalPlaces: number = stepping.decimalPlaces;
        var scale: number = stepping.scale;

        for (var i: number = -steps; i < this.width + steps; i += steps) {
            this.ctxMain.beginPath();
            var absX: number = i + this.movePoint.x % steps;
            var transformer: Point = this.getRelative(new Point(absX, y));
            var number: string;
            var numWidth: number;
            var numOffset: number;

            if (Math.abs(transformer.x).toFixed(decimalPlaces) === (0).toFixed(decimalPlaces)) {
                number = "     0";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.x.toExponential(2);
            }
            else {
                number = transformer.x.toFixed(decimalPlaces);
            }

            numWidth = this.ctxMain.measureText(number);
            numOffset = y === this.height ? y - 15 : y + 15;
            this.ctxMain.fillText(number, absX - (numWidth / 2), numOffset);

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.displayGrid) {
                this.ctxMain.moveTo(absX, 0);
                this.ctxMain.lineTo(absX, this.height);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }/*
            else {
                this.ctxMain.moveTo(absX, y);
                this.ctxMain.lineTo(absX, y + 4);
                this.ctxMain.stroke();
            }*/
        }

        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
    }

    drawYAxis(): void {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;

        var origo: Point = this.getAbsolute(new Point(0, 0));
        var visible: boolean = origo.x >= 0 && origo.x <= this.width ? true : false;

        var x: number = origo.x;
        if (!visible && this.stickyAxes) {
            if (origo.x < 0) {
                x = 0;
            }
            else {
                x = this.width;
            }
        }

        this.ctxMain.beginPath();
        this.ctxMain.moveTo(x, 0);
        this.ctxMain.lineTo(x, this.height);
        this.ctxMain.stroke();

        var stepping: IStepInfo = this.calculateSteps(this.scalePoint.y);
        var steps: number = stepping.steps;
        var decimalPlaces: number = stepping.decimalPlaces;
        var scale: number = stepping.scale;

        for (var i: number = -steps; i < this.height + steps; i += steps) {
            this.ctxMain.beginPath();
            var absY: number = this.height - (i + this.movePoint.y % steps);
            var transformer: Point = this.getRelative(new Point(x, absY));
            var number: string;
            var numWidth: number;
            var numOffset: number;

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
            numOffset = x === 0 ? x + 8 : x - (numWidth + 7);
            this.ctxMain.fillText(number, numOffset, absY + 3);

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.displayGrid) {
                this.ctxMain.moveTo(0, absY);
                this.ctxMain.lineTo(this.width, absY);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }/*
            else {
                this.ctxMain.moveTo(origo.x, absY);
                this.ctxMain.lineTo(origo.x - 4, absY);
                this.ctxMain.stroke();
            }*/
        }

        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
    }

    calculateSteps(scaling: number): IStepInfo {
        var log10: (val: number) => number = (val: number): number => Math.log(val) / Math.LN10;

        var maxR: number = 100 / scaling;
        var scale: number = Math.floor(log10(maxR));
        var step: number = Math.floor(maxR / Math.pow(10, scale));
        if (step < 2) {
            step = 1;
        }
        else if (step < 5) {
            step = 2;
        }
        else {
            step = 5;
        }
        var newstep: number = step * Math.pow(10, scale) * scaling;
        var decimalPlaces: number = 0;
        if (scale < 0) {
            decimalPlaces = scale * -1;
        }

        return { steps: newstep, decimalPlaces: decimalPlaces, scale: scale };
    }

    getRelative(p: Point): Point {
        var moved: Point = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        var scaled: Point = moved.divide(this.scalePoint);
        return scaled;
    }

    getAbsolute(p: Point): Point {
        var scaled: Point = p.multiply(this.scalePoint);
        var moved: Point = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    }

    zoomByMarking(): void {
        this.ctxMarking.clear();

        var width: number = this.marking.width;
        var height: number = this.marking.height;
        var xRatio: number = this.width / width;
        var yRatio: number = this.height / height;

        var downLeft: Point = new Point(
            Math.min(
                this.marking.firstPoint.x,
                this.marking.secondPoint.x),
            Math.max(
                this.marking.firstPoint.y,
                this.marking.secondPoint.y)
        );

        var first: Point = this.getRelative(downLeft);

        this.scalePoint.x = Math.abs(this.scalePoint.x * xRatio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * yRatio);

        var sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);

        this.draw();
    }
}

interface IStepInfo {
    steps: number;
    decimalPlaces: number;
    scale: number;
}

interface IMarking {
    firstPoint: Point;
    secondPoint: Point;
    width: number;
    height: number;
}

class ContextFixer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    fillStyle: string;
    strokeStyle: string;
    textAlign: string;
    textBaseline: string;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.fillStyle = "black";
        this.strokeStyle = "black";
    }
    fill() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
    }
    moveTo(x: number, y: number): void {
        var newX: number = Math.floor(x) + 0.5;
        var newY: number = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    }
    lineTo(x: number, y: number): void {
        var newX: number = Math.floor(x) + 0.5;
        var newY: number = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    }
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    beginPath(): void {
        this.ctx.beginPath();
    }
    stroke(): void {
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke();
    }
    fillText(text: string, x: number, y: number): void {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.fillText(text, x, y);
    }
    fillRect(x: number, y: number, width: number, height: number): void {
        this.ctx.fillStyle = this.fillStyle;
        let newX: number = Math.floor(x);
        let newY: number = Math.floor(y);
        let newWidth: number = Math.floor(width);
        let newHeight: number = Math.floor(height);
        this.ctx.fillRect(newX, newY, newWidth, newHeight);
    }
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {        
        radius = radius < 0 ? 0 : radius;
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }
    measureText(text: string): number {
        return this.ctx.measureText(text).width;
    }
    translate(x: number, y: number): void {
        this.ctx.translate(x, y);
    }
    rotate(angle: number): void {
        this.ctx.rotate(angle);
    }
}

class LayeredCanvas {
    canvases: { [name: string]: HTMLCanvasElement } = {};

    constructor(wrapper: HTMLDivElement, names: string[]) {
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.className = "plot-canvas";
        for (let name of names) {
            this.canvases[name] = <HTMLCanvasElement>canvas.cloneNode();
            wrapper.appendChild(this.canvases[name]);
        }
    }

    getContext(name: string): CanvasRenderingContext2D {
        var ctx: CanvasRenderingContext2D = this.canvases[name].getContext("2d");
        return ctx;
    }

    getWidth(): number {
        return this.canvases["main"].width;
    }
    getHeight(): number {
        return this.canvases["main"].height;
    }
    setSize(width: number, height: number): void {
        for (let name in this.canvases) {
            this.canvases[name].width = width;
            this.canvases[name].height = height;
        }
    }
}
