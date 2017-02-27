class GPSController extends CanvasController {
    private data: IDataSource<Point3D>;
    private lastID: number = -1;
    private lastSensorInfo: SensorInformation;   

    private ctxMain: ContextFixer;
    private relSize: IRelativeSize;
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

    private findMinMax(): void {
        let posDataLength: number = this.data.length();

        if (posDataLength > 0) {
            let firstPoint: Point = new Point(this.data.getValue(0).x, this.data.getValue(0).y);
            this.relSize = { min: firstPoint.copy(), max: firstPoint.copy() };
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

interface IRelativeSize {
    min: Point;
    max: Point;
}