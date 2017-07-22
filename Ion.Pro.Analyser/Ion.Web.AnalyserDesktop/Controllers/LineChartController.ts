class LineChartController extends MultiValueCanvasController implements IConfigurable {
    private ctxMain: ContextFixer;
    private ctxMarking: ContextFixer;
    private ctxLegend: ContextFixer;
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

        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMarking = new ContextFixer(this.canvas.addCanvas());
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.ctxLegend = new ContextFixer(this.canvas.addCanvas());

        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.ctxMain.strokeStyle = this.mainColor;

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
        this.ctxMarking.clear();
        this.ctxMarking.fillStyle = this.markingColor;
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.ctxMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);
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
        this.ctxMain.clear();

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

                this.ctxMain.beginPath();
                if (this.darkTheme) {
                    //console.log("Dark theme");
                    this.ctxMain.strokeStyle = this.data[d].color.toString();
                }
                else {
                    //console.log("Light theme");
                    this.ctxMain.strokeStyle = this.data[d].color.toString(true);
                }

                for (let i: number = firstVisibleIdx; i < totalLength; i++) {
                    const point: Point = this.getAbsolute(this.data[d].getValue(i));
                    if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                        this.ctxMain.moveTo(point.x, point.y);
                        this.ctxMain.lineTo(checkPoint.x, checkPoint.y);
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
                const abs: Point = this.getAbsolute(this.selectedPoint);
                const pointString: string = this.selectedPoint.toString();

                this.ctxMain.strokeStyle = this.axisColor;
                this.ctxMain.fillStyle = this.axisColor;
                this.ctxMain.beginPath();
                this.ctxMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
                this.ctxMain.stroke();
                this.ctxMain.textBaseline = "middle";

                const modifiedPoint: Point = this.selectedPoint.divide(new Point(1000, 1));

                if (this.toggleLegend.value) {
                    this.ctxMain.fillText(modifiedPoint.toString(), this.width - this.ctxMain.measureText(pointString) - 6, this.height - 10);
                }
                else {
                    this.ctxMain.fillText(modifiedPoint.toString(), this.width - this.ctxMain.measureText(pointString) - 6, 10);
                }
                this.ctxMain.fillStyle = this.mainColor;
                this.ctxMain.strokeStyle = this.mainColor;
                this.ctxMain.textBaseline = "alphabetic";
            }
        }
    }

    private drawLegend(): void {
        this.ctxLegend.clear();
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

            const legCan: HTMLCanvasElement = this.legend.canvas;
            const margin: number = 10;

            this.ctxLegend.ctx.drawImage(legCan, this.width - legCan.width - margin, margin);
        }
    }

    private drawXAxis(): void {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;

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

        this.ctxMain.beginPath();
        this.ctxMain.moveTo(0, y);
        this.ctxMain.lineTo(this.width, y);
        this.ctxMain.stroke();

        const stepping: IStepInfo = this.calculateSteps(this.scalePoint.x * 1000);
        const steps: number = stepping.steps;
        const decimalPlaces: number = stepping.decimalPlaces;
        const scale: number = stepping.scale;

        for (let i: number = -steps; i < this.width + steps; i += steps) {
            this.ctxMain.beginPath();
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

            numWidth = this.ctxMain.measureText(num);
            numOffset = y === this.height ? y - 15 : y + 15;
            this.ctxMain.fillText(num, absX - (numWidth / 2), numOffset);

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.showGrid.value) {
                this.ctxMain.moveTo(absX, 0);
                this.ctxMain.lineTo(absX, this.height);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }
        }

        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
    }

    private drawYAxis(): void {
        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;

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

        this.ctxMain.beginPath();
        this.ctxMain.moveTo(x, 0);
        this.ctxMain.lineTo(x, this.height);
        this.ctxMain.stroke();

        const stepping: IStepInfo = this.calculateSteps(this.scalePoint.y);
        const steps: number = stepping.steps;
        const decimalPlaces: number = stepping.decimalPlaces;
        const scale: number = stepping.scale;

        for (let i: number = -steps; i < this.height + steps; i += steps) {
            this.ctxMain.beginPath();
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

            numWidth = this.ctxMain.measureText(number);
            numOffset = x === -1 ? x + 8 : x - (numWidth + 7);
            this.ctxMain.fillText(number, numOffset, absY + 3);

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.showGrid.value) {
                this.ctxMain.moveTo(0, absY);
                this.ctxMain.lineTo(this.width, absY);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }
        }

        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;
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
        this.ctxMarking.clear();

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
        this.ctxMarking.clear();
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

    private ctx: ContextFixer;
    get canvas(): HTMLCanvasElement {
        return this.ctx.canvas;
    }

    private defHeight: number;
    private height: number;
    private width: number;

    private __backgroundColor: string = "black";
    private __textColor = "white";
    private __borderColor = "green";
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
        this.height = height;
        this.width = width;

        this.__darkTheme = darkTheme;

        const canvas: HTMLCanvasElement = document.createElement("canvas");

        canvas.width = this.width;
        canvas.height = this.height;

        this.ctx = new ContextFixer(canvas);
    }

    private draw(): void {
        const ctx = this.ctx;
        const data = this.__dataSources;
        ctx.clear();

        ctx.fillStyle = this.__backgroundColor;
        ctx.strokeStyle = this.__borderColor;
        ctx.ctx.rect(0, 0, this.width, this.height);
        ctx.fill();
        ctx.stroke();

        if (data) {

            const lineSpacing: number = 13;
            const topBottompadding: number = 13;
            const sidePadding: number = 10;
            const lineLength: number = 10;
            const lineWidth: number = 3;

            let positionY: number = topBottompadding;
            for (let i = 0; i < data.length; i++) {
                if (positionY > this.height - topBottompadding) {
                    this.resize(positionY + topBottompadding);
                    this.draw();
                    return;
                }

                let positionX: number = sidePadding;
                const name: string = data[i].infos.SensorInfos[0].Name;
                let unit: string | undefined = data[i].infos.SensorInfos[0].Unit;
                ctx.beginPath();

                if (this.__darkTheme) {
                    ctx.strokeStyle = data[i].color.toString();
                }
                else {
                    ctx.strokeStyle = data[i].color.toString(true);
                }
                ctx.ctx.lineCap = "round";
                ctx.moveTo(positionX, positionY);
                positionX += lineLength;
                ctx.lineTo(positionX, positionY);
                ctx.lineWidth = lineWidth;
                ctx.stroke();
                ctx.lineWidth = 1;

                positionX += 10;
                ctx.moveTo(positionX, positionY);
                ctx.fillStyle = this.__textColor;
                ctx.textAlign = "start";
                ctx.textBaseline = "middle";
                if (unit) {
                    unit = unit.replace("&deg;", "°");
                    ctx.fillText(name + " (" + unit + ")", positionX, positionY, (this.width - positionX - sidePadding));
                }
                else {
                    ctx.fillText(name, positionX, positionY, (this.width - positionX - sidePadding));
                }

                ctx.closePath();

                positionY += lineSpacing;
            }
        }
        else {
            ctx.fillStyle = this.__textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No data", (this.width / 2), (this.height / 2));
        }
    }

    private resize(height: number): void {
        this.height = height;
        this.ctx.canvas.height = height;
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
    lineWidth: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const temp = this.canvas.getContext("2d");
        if (temp === null) {
            throw new Error("Context undefined exception, context 2D not supported");
        }
        this.ctx = temp;
        this.fillStyle = "black";
        this.strokeStyle = "black";
        this.lineWidth = 1;
    }
    fill() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
    }
    moveTo(x: number, y: number): void {
        const newX: number = Math.floor(x) + 0.5;
        const newY: number = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    }
    lineTo(x: number, y: number): void {
        this.ctx.lineWidth = this.lineWidth;
        const newX: number = Math.floor(x) + 0.5;
        const newY: number = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    }
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    beginPath(): void {
        this.ctx.beginPath();
    }
    closePath(): void {
        this.ctx.closePath();
    }
    stroke(): void {
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke();
    }
    fillText(text: string, x: number, y: number, maxWidth?: number): void {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        if (maxWidth) {
            this.ctx.fillText(text, Math.floor(x) + 0.5, Math.floor(y) + 0.5, maxWidth);
        }
        else {
            this.ctx.fillText(text, Math.floor(x) + 0.5, Math.floor(y) + 0.5);
        }
    }
    fillRect(x: number, y: number, width: number, height: number): void {
        this.ctx.fillStyle = this.fillStyle;
        const newX: number = Math.floor(x);
        const newY: number = Math.floor(y);
        const newWidth: number = Math.floor(width);
        const newHeight: number = Math.floor(height);
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
    private wrapper: HTMLElement;
    private canvases: HTMLCanvasElement[] = [];
    private mk: HtmlHelper = new HtmlHelper;

    constructor(wrapper: HTMLElement) {
        this.wrapper = wrapper;
    }

    addCanvas(): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = this.mk.tag("canvas", "plot-canvas") as HTMLCanvasElement;
        this.wrapper.appendChild(canvas);
        this.canvases.push(canvas);
        return canvas;
    }

    getWidth(): number {
        if (this.canvases.length > 0) {
            return this.canvases[0].width;
        }
        return -1;
    }
    getHeight(): number {
        if (this.canvases.length > 0) {
            return this.canvases[0].height;
        }
        return -1;
    }
    setSize(width: number, height: number): void {
        for (const c of this.canvases) {
            c.width = width;
            c.height = height;
        }
    }
}
