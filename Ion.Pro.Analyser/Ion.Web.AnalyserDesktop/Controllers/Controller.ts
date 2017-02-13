﻿abstract class Controller {
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
    protected onDataChange(): void { }; // to be abstract
    public abstract generate(): HTMLElement;
}

abstract class SingleValueController extends Controller {
    protected value: number = 0;
    protected data: IPlotData;
    protected lastID: number = -1;
    protected lastSensorInfo: SensorInformation;

    public setData(d: IPlotData) {
        this.data = d;

        if (this.data) {
            let curID = this.data.ID;
            if (curID != this.lastID) {
                kernel.senMan.getSensorInfo(this.data, (i: SensorInformation) => {
                    this.lastSensorInfo = i;
                    this.lastID = this.data.ID;
                    this.onDataChange();
                });
            }
            else {
                if (this.lastSensorInfo) {
                    this.value = SensorInfoHelper.getPercent(this.lastSensorInfo, this.data.getValue(this.data.getLength() - 1)).y;
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

    protected abstract draw(): void;
}

abstract class MultiValueCanvasController extends CanvasController {
    protected data: IPlotData[];
    public setData(d: IPlotData[]): void {
        this.data = d;
        this.onDataChange();
    }
}

abstract class SingleValueCanvasController extends CanvasController {
    protected value: number;
    public abstract setValue(value: number): void;
}