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
        console.log(this.sensorInfos);
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