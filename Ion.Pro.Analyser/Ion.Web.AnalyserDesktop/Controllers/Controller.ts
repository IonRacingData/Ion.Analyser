abstract class Controller {
    protected wrapper: HTMLElement;
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
    public abstract generate(): HTMLElement;
}

abstract class SingleValueController extends Controller {
    protected percent: number = 0;
    protected value: number = 0;
    protected data: IDataSource<Point>;
    protected lastID: number = -1;
    protected lastSensorInfo: SensorInformation;

    public setData(d: IDataSource<Point>) {
        this.data = d;

        if (this.data) {
            let curID = this.data.infos.IDs[0];
            if (curID != this.lastID) {
                kernel.senMan.getSensorInfoNew(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.infos.IDs[0];
                    this.onDataChange();
                });
            }
            else {
                if (this.lastSensorInfo) {
                    this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.length() - 1)).y;
                    this.value = this.data.getValue(this.data.length() - 1).y;
                }
                this.onDataChange();
            }
        }
    }

    public setValue(value: number): void { }    
}

abstract class CanvasController extends Controller {
    protected canvas: LayeredCanvas;
    protected movePoint: Point;
    protected scalePoint: Point;

    protected getRelative(p: Point): Point {
        let moved: Point = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        let scaled: Point = moved.divide(this.scalePoint);
        return scaled;
    }

    protected getAbsolute(p: Point): Point {
        let scaled: Point = p.multiply(this.scalePoint);
        let moved: Point = scaled.add(this.movePoint);
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
    protected data: IDataSource<Point>[];
    protected sensorInfos: { [id: string]: SensorInformation } = {};
    private lastDataLength: number = 0;

    public setData(d: IDataSource<Point>[]): void {
        this.data = d;
        if (this.lastDataLength !== this.data.length) {
            this.lastDataLength = this.data.length;
            kernel.senMan.getInfos((infos: SensorInformation[]) => {                
                this.updateSensorInfos(infos);
            });
        }
        this.onDataChange();
    }

    private updateSensorInfos(infos: SensorInformation[]) {
        this.sensorInfos = {};

        for (let i of infos) {
            for (let d of this.data) {
                if (d.infos.IDs[0] === i.ID) {
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
    protected data: IDataSource<Point>;
    protected lastID: number = -1;
    protected lastSensorInfo: SensorInformation;
    
    public setData(d: IDataSource<Point>) {
        this.data = d;

        if (this.data) {
            let curID = this.data.infos.IDs[0];
            if (curID != this.lastID) {
                kernel.senMan.getSensorInfoNew(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.infos.IDs[0];
                    this.onDataChange();
                });
            }
            else {
                if (this.lastSensorInfo) {
                    this.percent = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.length() - 1)).y;
                    this.value = this.data.getValue(this.data.length() - 1).y;
                }
                this.onDataChange();
            }
        }
    }
}

abstract class ScatterChartBase extends CanvasController {
    private data: IDataSource<Point3D>;
    private lastID: number = -1;
    private lastSensorInfo: SensorInformation;

    private ctxMain: ContextFixer;
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

        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
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
            let posDataLength: number = this.data.length();

            this.ctxMain.clear();
            this.ctxMain.beginPath();
            this.ctxMain.strokeStyle = this.color;

            this.rescale();

            offsetX = (this.width - this.plotWidth) / 2;
            offsetY = (this.height - this.plotHeight) / 2;

            if (posDataLength > 0) {
                let firstPoint: Point = this.getAbsolute(new Point(this.data.getValue(0).x, this.data.getValue(0).y));
                this.ctxMain.lineTo(firstPoint.x + offsetX, firstPoint.y - offsetY);
            }

            for (let i = 0; i < posDataLength; i++) {

                let relPoint: Point = new Point(this.data.getValue(i).x, this.data.getValue(i).y);
                let absPoint: Point = this.getAbsolute(relPoint);
                this.ctxMain.lineTo(absPoint.x + offsetX, absPoint.y - offsetY);

            }
            this.ctxMain.stroke();
        }
    }

    protected findMinMax(): void {
        let posDataLength: number = this.data.length();

        if (posDataLength > 0) {
            let firstPoint: Point = new Point(this.data.getValue(0).x, this.data.getValue(0).y);
            this.relSize = new Rectangle(firstPoint, firstPoint);
        }

        for (let i = 0; i < posDataLength; i++) {
            let relPoint: Point = new Point(this.data.getValue(i).x, this.data.getValue(i).y);

            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
        }
    }

    private rescale(): void {
        this.findMinMax();

        let oldWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        let oldHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;

        let xRatio: number = this.availablePlotWidth / oldWidth;
        let yRatio: number = this.availablePlotHeight / oldHeight;
        let ratio: number = Math.min(xRatio, yRatio);

        let first: Point = new Point(this.relSize.min.x, this.relSize.min.y);

        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);

        var sec: Point = this.getAbsolute(first);
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
            let curID = this.data.infos.IDs[0];
            if (curID != this.lastID) {
                kernel.senMan.getSensorInfoNew(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.infos.IDs[0];
                    this.onDataChange();
                });
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