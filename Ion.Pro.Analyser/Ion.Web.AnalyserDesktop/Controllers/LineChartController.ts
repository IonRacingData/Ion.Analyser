class LineChartController extends MultiValueCanvasController implements IConfigurable {
    private canvasMain: Canvas;
    private canvasMarking: Canvas;
    private canvasLegend: Canvas;
    private mouseMod: Point;
    private mouseDown: boolean;
    private isDragging = false;
    private zoomSpeed: number = 1.1;
    private selectedPoint: Point | null = null;
    private isMarking = false;
    private marking: IMarking;
    private scalePoint_start: Point = new Point(0.005, 6);
    private movePoint_start: Point = new Point(50, 50);
    private autoScroll_plotMoved: boolean = false;

    private gridColor;
    private axisColor;
    private mainColor = "white";
    private markingColor;

    private legend: LineChartLegend = new LineChartLegend(150, 50, true);

    private defaultCursor: string = "default";

    private showGrid: IStorageObject<"boolean"> = {
        text: "Show grid",
        longText: "Show or hide grid lines",
        shortCut: "G",
        type: "boolean",
        value: true,
    };
    private stickyAxes: IStorageObject<"boolean"> = {
        text: "Sticky axes",
        longText: "Assures axes are always visible. When off, axes can be scrolled out of view.",
        shortCut: "A",
        type: "boolean",
        value: true,
    };
    private autoScroll: IStorageObject<"boolean"> = {
        text: "Auto scroll",
        longText: "Automatically scrolls to the last inserted value in the linechart. Only applicable when receiving data live.",
        shortCut: "K",
        type: "boolean",
        value: false,
    };

    private toggleLegend: IStorageObject<"boolean"> = {
        text: "Legend",
        longText: "Show or hide legend",
        shortCut: "L",
        type: "boolean",
        value: true,
    };

    public settings: IStorageList = {
        showGrid: this.showGrid,
        stickyAxes: this.stickyAxes,
        autoScroll: this.autoScroll,
        toggleLegend: this.toggleLegend,
        reset: {
            text: "Reset",
            longText: "Resets the zoom and position of the plot",
            shortCut: "R",
            type: "action",
            value: () => { this.reset(); },
        },
    };
    public settingsChanged(key: string, value: IStorageObject<keyof IStorageTypes>) {
        this.draw();
    }

    constructor() {
        super();
        this.movePoint = this.movePoint_start.copy();
        this.scalePoint = this.scalePoint_start.copy();
    }

    generate(): HTMLElement {
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

        this.wrapper.addEventListener("mousedown", (e: MouseEvent) => this.wrapper_mouseDown(e));
        this.wrapper.addEventListener("mousemove", (e: MouseEvent) => this.wrapper_mouseMove(e));
        this.wrapper.addEventListener("mouseup", (e: MouseEvent) => this.wrapper_mouseUp(e));
        this.wrapper.addEventListener("mouseleave", (e: MouseEvent) => this.wrapper_mouseLeave(e));

        this.wrapper.addEventListener("touchstart", (e: TouchEvent) => this.wrapper_touchStart(e));
        this.wrapper.addEventListener("touchmove", (e: TouchEvent) => this.wrapper_touchMove(e));
        this.wrapper.addEventListener("touchend", (e: TouchEvent) => this.wrapper_touchEnd(e));

        this.wrapper.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));
        this.wrapper.addEventListener("keydown", (e: KeyboardEvent) => this.wrapper_keyDown(e));
        this.wrapper.addEventListener("keyup", (e: KeyboardEvent) => this.wrapper_keyUp(e));
        this.updateColors();

        return this.wrapper;
    }
    darkTheme: boolean = true;
    private setColors(): void {

        this.axisColor = kernel.winMan.getRule(".line-chart").style.borderColor;
        this.gridColor = kernel.winMan.getRule(".line-chart").style.color;
        this.markingColor = kernel.winMan.getRule(".line-chart").style.backgroundColor;
        this.legend.backgroundColor = kernel.winMan.getRule(".line-chart-legend").style.backgroundColor;
        this.legend.textColor = kernel.winMan.getRule(".line-chart-legend").style.color;
        this.legend.borderColor = kernel.winMan.getRule(".line-chart-legend").style.borderColor;

    }

    public updateColors(): void {
        this.darkTheme = true;
        if (kernel.winMan.curTheme === "app-style") {
            this.darkTheme = false;
        }
        this.setColors();
        this.draw();
    }

    private drawMarking(): void {
        this.canvasMarking.clear();
        this.canvasMarking.fillStyle = this.markingColor;
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.canvasMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
    }

    protected onSizeChange(): void {
        this.canvas.setSize(this.width, this.height);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.draw();
    }

    protected onDataChange(): void {
        if (this.autoScroll.value && !this.mouseDown) {
            this.moveToLastPoint();
            if (this.autoScroll_plotMoved) {
                this.autoScroll_plotMoved = false;
                this.autoScaleY();
            }
        }

        this.draw();
    }

    protected onSensorChange(): void {
        if (this.data.length > 0) {
            this.autoScaleY();
        }
    }

    private moveToLastPoint(): void {
        if (this.data[0]) {
            const lastPointAbs: Point = this.getAbsolute(this.data[0].getValue(this.data[0].length() - 1));
            if (lastPointAbs.x > this.width * 0.75 && !this.mouseDown) {
                this.movePoint.x -= lastPointAbs.x - (this.width * 0.75);
            }
        }
    }

    private selectPoint(e: Point): void {
        if (this.data) {
            // var mp: Point = this.getMousePoint(e);
            const mp = e;
            let p: Point | null = null;
            for (let i: number = 0; i < this.data.length; i++) {
                // var closest: Point = this.data[i].getClosest(this.getRelative(mp));
                const closest: Point = PlotDataHelper.getClosest(this.data[i], this.getRelative(mp));
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
    }

    private zoom(e: WheelEvent): void {
        e.preventDefault();
        const mousePoint: Point = this.getMousePoint(e);
        const curRel: Point = this.getRelative(mousePoint);

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
        const newRel: Point = this.getRelative(mousePoint);

        const move: Point = new Point((newRel.x - curRel.x) * this.scalePoint.x, (newRel.y - curRel.y) * this.scalePoint.y);
        this.movePoint = this.movePoint.add(move);
        this.draw();
    }

    protected draw(): void {
        this.canvasMain.clear();

        this.drawXAxis();
        this.drawYAxis();
        this.drawLegend();

        if (this.data) {
            for (let d: number = 0; d < this.data.length; d++) {
                let firstVisibleIdx: number = PlotDataHelper.getIndexOf(this.data[d], this.getRelative(new Point(0, 0)));
                if (firstVisibleIdx > 0) {
                    firstVisibleIdx--;
                }

                if (firstVisibleIdx < 0) {
                    console.log("Empty dataset detected");
                    continue;
                }

                let lastPoint: Point = this.getAbsolute(this.data[d].getValue(firstVisibleIdx));
                const totalLength: number = this.data[d].length();
                let checkPoint: Point = lastPoint;

                this.canvasMain.beginPath();
                if (this.darkTheme) {
                    //console.log("Dark theme");
                    this.canvasMain.strokeStyle = this.data[d].color.toString();
                }
                else {
                    //console.log("Light theme");
                    this.canvasMain.strokeStyle = this.data[d].color.toString(true);
                }

                for (let i: number = firstVisibleIdx; i < totalLength; i++) {
                    const point: Point = this.getAbsolute(this.data[d].getValue(i));
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
                const abs: Point = this.getAbsolute(this.selectedPoint);
                const pointString: string = this.selectedPoint.toString();

                this.canvasMain.strokeStyle = this.axisColor;
                this.canvasMain.fillStyle = this.axisColor;
                this.canvasMain.beginPath();
                this.canvasMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
                this.canvasMain.stroke();
                this.canvasMain.textBaseline = "middle";

                const modifiedPoint: Point = this.selectedPoint.divide(new Point(1000, 1));

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
    }

    private drawLegend(): void {
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

            const margin: number = 10;
            const imageData = this.legend.canvas.getImageData(0, 0, this.legend.width, this.legend.height);
            this.canvasLegend.putImageData(imageData, this.width - this.legend.width - margin, margin);
        }
    }

    private drawXAxis(): void {
        this.canvasMain.strokeStyle = this.axisColor;
        this.canvasMain.fillStyle = this.axisColor;

        const origo: Point = this.getAbsolute(new Point(0, 0));
        const visible: boolean = origo.y >= 0 && origo.y <= this.height ? true : false;

        let y: number = origo.y;
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

        const stepping: IStepInfo = this.calculateSteps(this.scalePoint.x * 1000);
        const steps: number = stepping.steps;
        const decimalPlaces: number = stepping.decimalPlaces;
        const scale: number = stepping.scale;

        for (let i: number = -steps; i < this.width + steps; i += steps) {
            this.canvasMain.beginPath();
            const absX: number = i + this.movePoint.x % steps;
            const transformer: Point = this.getRelative(new Point(absX, y));
            let num: string;
            let numWidth: number;
            let numOffset: number;

            const val = transformer.x / 1000;

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
    }

    private drawYAxis(): void {
        this.canvasMain.strokeStyle = this.axisColor;
        this.canvasMain.fillStyle = this.axisColor;

        const origo: Point = this.getAbsolute(new Point(0, 0));
        const visible: boolean = origo.x >= 0 && origo.x <= this.width ? true : false;

        let x: number = origo.x;
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

        const stepping: IStepInfo = this.calculateSteps(this.scalePoint.y);
        const steps: number = stepping.steps;
        const decimalPlaces: number = stepping.decimalPlaces;
        const scale: number = stepping.scale;

        for (let i: number = -steps; i < this.height + steps; i += steps) {
            this.canvasMain.beginPath();
            const absY: number = this.height - (i + this.movePoint.y % steps);
            const transformer: Point = this.getRelative(new Point(x, absY));
            let number: string;
            let numWidth: number;
            let numOffset: number;

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
    }

    private calculateSteps(scaling: number): IStepInfo {
        const log10: (val: number) => number = (val: number): number => Math.log(val) / Math.LN10;

        const maxR: number = 100 / scaling;
        const scale: number = Math.floor(log10(maxR));
        let step: number = Math.floor(maxR / Math.pow(10, scale));
        if (step < 2) {
            step = 1;
        }
        else if (step < 5) {
            step = 2;
        }
        else {
            step = 5;
        }
        const newstep: number = step * Math.pow(10, scale) * scaling;
        let decimalPlaces: number = 0;
        if (scale < 0) {
            decimalPlaces = scale * -1;
        }

        return { steps: newstep, decimalPlaces, scale };
    }

    private zoomByMarking(): void {
        this.canvasMarking.clear();

        const width: number = this.marking.width;
        const height: number = this.marking.height;
        const xRatio: number = this.width / width;
        const yRatio: number = this.height / height;

        const downLeft: Point = new Point(
            Math.min(
                this.marking.firstPoint.x,
                this.marking.secondPoint.x),
            Math.max(
                this.marking.firstPoint.y,
                this.marking.secondPoint.y),
        );

        const first: Point = this.getRelative(downLeft);

        this.scalePoint.x = Math.abs(this.scalePoint.x * xRatio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * yRatio);

        const sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);

        this.draw();
    }

    private autoScaleY(): void {
        let min: number = 0;
        let max: number = 0;

        for (let i = 0; i < this.data.length; i++) {

            const info = this.data[i].infos.SensorInfos[0];
            if (info) {
                const dmin: number = SensorInfoHelper.minValue(info);
                const dmax: number = SensorInfoHelper.maxValue(info);
                min = dmin < min ? dmin : min;
                max = dmax > max ? dmax : max;
            }
        }

        if (min !== max) {
            const padding: number = (max - min) * 0.2;
            min -= padding / 2;
            max += padding / 2;
            const minAbs: number = this.getAbsolute(new Point(0, min)).y;
            const maxAbs: number = this.getAbsolute(new Point(0, max)).y;
            const plotHeight = Math.abs(maxAbs - minAbs);

            const ratio: number = this.height / plotHeight;
            const first = min;
            this.scalePoint.y *= ratio;
            let sec = this.getAbsolute(new Point(0, first)).y;
            sec = this.height - sec;
            this.movePoint.y -= sec;

            this.scalePoint_start.y = this.scalePoint.y;
            this.movePoint_start.y = this.movePoint.y;
            this.draw();
        }

    }

    private reset(): void {
        this.scalePoint = this.scalePoint_start.copy();
        this.movePoint = this.movePoint_start.copy();
    }

    private wrapper_keyDown(e: KeyboardEvent): void {
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
    }

    private wrapper_keyUp(e: KeyboardEvent): void {
        this.wrapper.style.cursor = this.defaultCursor;
    }

    private wrapper_mouseLeave(e: MouseEvent) {
        this.mouseDown = false;
        this.isMarking = false;
        this.wrapper.style.cursor = "default";
        this.canvasMarking.clear();
    }

    private wrapper_mouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.mouseMod = new Point(this.movePoint.x - e.layerX, this.movePoint.y - (this.height - e.layerY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            const mousePoint: Point = this.getMousePoint(e);
            this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 };
        }
    }

    private wrapper_mouseMove(e: MouseEvent): void {
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
        this.wrapper.style.cursor = this.defaultCursor;
    }

    private wrapper_touchStart(e: TouchEvent): void {
        e.preventDefault();
        console.log(e);
        this.mouseMod = new Point(this.movePoint.x - e.touches[0].clientX, this.movePoint.y - (this.height - e.touches[0].clientY));
        this.mouseDown = true;
        if (e.altKey) {
            this.isMarking = true;
            const mousePoint: Point = this.getTouchPoint(e);
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
}

class LineChartLegend {
    public canvas: Canvas;

    private defHeight: number;
    private __height: number;
    private __width: number;

    private __backgroundColor: string = "black";
    private __textColor = "white";
    private __borderColor = "green";

    get width(): number { return this.__width; }
    get height(): number { return this.__height; }

    set backgroundColor(color: string | null) {
        if (color) {
            this.__backgroundColor = color;
        }
    }
    set textColor(color: string | null) {
        if (color) {
            this.__textColor = color;
        }
    }
    set borderColor(color: string | null) {
        if (color) {
            this.__borderColor = color;
        }
    }

    private __dataSources: Array<IDataSource<Point>> | null;
    set dataSources(data: Array<IDataSource<Point>> | null) {
        this.__dataSources = data;
        this.resize(this.defHeight);
        this.draw();

    }

    private __darkTheme: boolean;
    set darkTheme(bool: boolean) {
        this.__darkTheme = bool;
    }

    constructor(width: number, height: number, darkTheme: boolean) {
        this.defHeight = height;
        this.__height = height;
        this.__width = width;

        this.__darkTheme = darkTheme;

        this.canvas = new Canvas();
        this.canvas.width = this.__width;
        this.canvas.height = this.__height;
    }

    private draw(): void {
        const data = this.__dataSources;
        this.canvas.clear();

        this.canvas.fillStyle = this.__backgroundColor;
        this.canvas.strokeStyle = this.__borderColor;
        this.canvas.rect(0, 0, this.__width, this.__height);
        this.canvas.fill();
        this.canvas.stroke();

        if (data) {

            const lineSpacing: number = 13;
            const topBottompadding: number = 13;
            const sidePadding: number = 10;
            const lineLength: number = 10;
            const lineWidth: number = 3;

            let positionY: number = topBottompadding;
            for (let i = 0; i < data.length; i++) {
                if (positionY > this.__height - topBottompadding) {
                    this.resize(positionY + topBottompadding);
                    this.draw();
                    return;
                }

                let positionX: number = sidePadding;
                const name: string = data[i].infos.SensorInfos[0].Name;
                let unit: string | undefined = data[i].infos.SensorInfos[0].Unit;
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
                    this.canvas.fillText(name + " (" + unit + ")", positionX, positionY, (this.__width - positionX - sidePadding));
                }
                else {
                    this.canvas.fillText(name, positionX, positionY, (this.__width - positionX - sidePadding));
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
    }

    private resize(height: number): void {
        this.__height = height;
        this.canvas.height = height;
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