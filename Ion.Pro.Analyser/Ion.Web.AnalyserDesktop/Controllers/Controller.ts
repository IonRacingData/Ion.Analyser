abstract class Controller extends Component {
    protected height: number;
    protected width: number;
    protected mk: HtmlHelper = new HtmlHelper;

    public setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.onSizeChange();
    }
    protected abstract onSizeChange(): void;
    protected abstract onDataChange(): void;
}

abstract class SingleValueController extends Controller {
    protected percent: number = 0;
    protected value: number = 0;
    protected data: IDataSource<Point> | null;
    protected lastID: string = "";
    protected lastSensorInfo: sensys.ISensorInformation;

    protected legendWrapper: HTMLElement;
    protected legendHeight: number = 18;

    constructor() {
        super();
        this.legendWrapper = document.createElement("div");
        this.legendWrapper.className = "controller-legend";
        this.legendWrapper.style.height = this.legendHeight + "px";
        this.legendWrapper.appendChild(document.createTextNode("No data"));
    }

    public setData(d: IDataSource<Point> | null) {
        this.data = d;

        if (this.data) {
            const curID = this.data.infos.Keys[0];
            if (curID !== this.lastID) {
                const i = this.data.infos.SensorInfos[0];
                this.lastSensorInfo = i;
                this.lastID = i.Key;
                this.updateVals(this.data);
                this.onDataChange();
                this.sensorChange();
            }
            else {
                if (this.lastSensorInfo) {
                    this.updateVals(this.data);
                }
                this.onDataChange();
            }
        }
        else {
            this.onDataChange();
        }
    }

    private updateVals(data: IDataSource<Point>): void {
        const lastIndex = data.length() - 1;
        if (lastIndex < 0) {
            console.log("Empty dataset in SingleValueController");
        }
        else {
            const lastValue = data.getValue(lastIndex);
            this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, lastValue).y;
            this.value = lastValue.y;
        }
    }

    private sensorChange(): void {
        this.legendWrapper.innerHTML = "";
        if (this.data) {
            let unit = this.data.infos.SensorInfos[0].Unit;
            const name = this.data.infos.SensorInfos[0].Name;
            if (unit) {
                unit = unit.replace("&deg;", "°");
                this.legendWrapper.appendChild(document.createTextNode(name + " (" + unit + ")"));
            }
            else {
                this.legendWrapper.appendChild(document.createTextNode(name));
            }
        }
        else {
            this.legendWrapper.appendChild(document.createTextNode("No data"));
        }

        this.onSensorChange();
    }

    protected abstract onSensorChange(): void;
}

abstract class CanvasController extends Controller {
    protected canvas: LayeredCanvas;
    protected movePoint: Point;
    protected scalePoint: Point;

    protected getRelative(p: Point): Point {
        const moved: Point = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        const scaled: Point = moved.divide(this.scalePoint);
        return scaled;
    }

    protected getAbsolute(p: Point): Point {
        const scaled: Point = p.multiply(this.scalePoint);
        const moved: Point = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    }

    protected getMousePoint(e: MouseEvent): Point {
        return new Point(e.layerX, e.layerY);
    }

    protected getTouchPoint(e: TouchEvent): Point {
        if (e.touches.length > 0)
            return new Point(e.touches[0].clientX, e.touches[0].clientY);
        else
            return new Point(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }

    protected abstract draw(): void;
}

abstract class MultiValueCanvasController extends CanvasController {
    protected data: Array<IDataSource<Point>>;
    protected sensorInfos: { [id: string]: sensys.ISensorInformation } = {};
    private lastDataLength: number = 0;

    public setData(d: Array<IDataSource<Point>>): void {
        this.data = d;
        if (this.lastDataLength !== this.data.length) {
            this.lastDataLength = this.data.length;
            this.updateSensorInfos(kernel.senMan.getInfos());
        }
        this.onDataChange();
    }

    private updateSensorInfos(infos: sensys.ISensorInformation[]) {
        this.sensorInfos = {};

        for (const i of infos) {
            for (const d of this.data) {
                if (d.infos.Keys[0] === i.Key) {
                    this.sensorInfos[i.ID.toString()] = i;
                }
            }
        }
        this.onSensorChange();
    }

    protected onSensorChange(): void { }
}

abstract class SingleValueCanvasController extends CanvasController {
    protected percent: number = 0;
    protected value: number = 0;
    protected data: IDataSource<Point> | null;
    protected lastID: string = "";
    protected lastSensorInfo: sensys.ISensorInformation;

    protected legendWrapper: HTMLElement;
    protected legendHeight: number = 18;

    constructor() {
        super();
        this.legendWrapper = document.createElement("div");
        this.legendWrapper.className = "controller-legend";
        this.legendWrapper.style.height = this.legendHeight + "px";
        this.legendWrapper.appendChild(document.createTextNode("No data"));
    }

    public setData(d: IDataSource<Point> | null) {
        this.data = d;

        if (this.data) {
            const curID = this.data.infos.Keys[0];
            if (curID !== this.lastID) {
                const i = this.data.infos.SensorInfos[0];
                this.lastSensorInfo = i;
                this.lastID = this.data.infos.Keys[0];
                this.updateVals(this.data);
                this.onDataChange();
                this.sensorChange();
            }
            else {
                if (this.lastSensorInfo) {
                    this.updateVals(this.data);
                }
                this.onDataChange();
            }
        }
    }

    private updateVals(data: IDataSource<Point>): void {
        const lastIndex = data.length() - 1;
        if (lastIndex < 0) {
            console.log("Empty dataset in SingleValueController");
        }
        else {
            const lastValue = data.getValue(lastIndex);
            this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, lastValue).y;
            this.value = lastValue.y;
        }
    }

    private sensorChange(): void {
        this.legendWrapper.innerHTML = "";
        if (this.data) {
            let unit = this.data.infos.SensorInfos[0].Unit;
            const name = this.data.infos.SensorInfos[0].Name;
            if (unit) {
                unit = unit.replace("&deg;", "°");
                this.legendWrapper.appendChild(document.createTextNode(name + " (" + unit + ")"));
            }
            else {
                this.legendWrapper.appendChild(document.createTextNode(name));
            }
        }
        else {
            this.legendWrapper.appendChild(document.createTextNode("No data"));
        }

        this.onSensorChange();
    }

    protected abstract onSensorChange(): void;
}

abstract class ScatterChartBase extends CanvasController {
    private data: IDataSource<Point3D>;
    private lastID: string = "";
    private lastSensorInfo: sensys.ISensorInformation;

    private cavasMain: Canvas;
    private relSize: Rectangle;
    private availablePlotWidth: number;
    private availablePlotHeight: number;
    private plotWidth: number;
    private plotHeight: number;
    private padding: number;

    color: string = "white";

    constructor(width: number, height: number) {
        super();
        this.movePoint = new Point(0, 0);
        this.scalePoint = new Point(1, 1);
        this.width = width;
        this.height = height;
        this.padding = this.width * 0.05;

        this.availablePlotWidth = this.width - (this.padding * 2);
        this.availablePlotHeight = this.height - (this.padding * 2);
    }

    public generate(): HTMLElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";

        //this.canvas = new LayeredCanvasOld(this.wrapper);
        //this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.canvas.setSize(this.width, this.height);
        return this.wrapper;
    }

    protected onSizeChange(): void {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.availablePlotWidth = this.width - (this.padding * 2);
        this.availablePlotHeight = this.height - (this.padding * 2);

        this.draw();
    }

    protected draw(): void {
        if (this.data.length() > 0) {
            let offsetX: number;
            let offsetY: number;
            const posDataLength: number = this.data.length();

            this.cavasMain.clear();
            this.cavasMain.beginPath();
            this.cavasMain.strokeStyle = this.color;

            this.rescale();

            offsetX = (this.width - this.plotWidth) / 2;
            offsetY = (this.height - this.plotHeight) / 2;

            if (posDataLength > 0) {
                const firstPoint: Point = this.getAbsolute(new Point(this.data.getValue(0).x, this.data.getValue(0).y));
                this.cavasMain.lineTo(firstPoint.x + offsetX, firstPoint.y - offsetY);
            }

            for (let i = 0; i < posDataLength; i++) {

                const relPoint: Point = new Point(this.data.getValue(i).x, this.data.getValue(i).y);
                const absPoint: Point = this.getAbsolute(relPoint);
                this.cavasMain.lineTo(absPoint.x + offsetX, absPoint.y - offsetY);

            }
            this.cavasMain.stroke();
        }
    }

    protected findMinMax(): void {
        const posDataLength: number = this.data.length();

        if (posDataLength > 0) {
            const firstPoint: Point = new Point(this.data.getValue(0).x, this.data.getValue(0).y);
            this.relSize = new Rectangle(firstPoint, firstPoint);
        }

        for (let i = 0; i < posDataLength; i++) {
            const relPoint: Point = new Point(this.data.getValue(i).x, this.data.getValue(i).y);

            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
        }
    }

    private rescale(): void {
        this.findMinMax();

        const oldWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        const oldHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;

        const xRatio: number = this.availablePlotWidth / oldWidth;
        const yRatio: number = this.availablePlotHeight / oldHeight;
        const ratio: number = Math.min(xRatio, yRatio);

        const first: Point = new Point(this.relSize.min.x, this.relSize.min.y);

        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);

        const sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);

        this.plotWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        this.plotHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
    }

    protected onDataChange(): void {
        this.draw();
    }

    public setData(d: IDataSource<Point3D>) {
        this.data = d;

        if (this.data) {
            const curID = this.data.infos.Keys[0];
            if (curID != this.lastID) {
                this.lastSensorInfo = this.data.infos.SensorInfos[0];
                this.lastID = curID;
                this.onDataChange();
                /*kernel.senMan.getSensorInfoNew(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.infos.Keys[0];
                    this.onDataChange();
                });*/
            }
            else {
                this.onDataChange();
            }
        }
    }
}

class Rectangle {
    public min: Point;
    public max: Point;

    constructor(min: Point, max: Point) {
        this.min = min;
        this.max = max;
    }

    public getHeight(): number {
        return this.max.y - this.min.y;
    }

    public getWidth(): number {
        return this.max.x - this.min.x;
    }
}
