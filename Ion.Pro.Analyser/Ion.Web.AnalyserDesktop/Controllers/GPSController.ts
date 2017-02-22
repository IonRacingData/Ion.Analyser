class GPSController extends CanvasController {
    private posData: GPSPlotData;
    private ctxMain: ContextFixer;
    private relSize: IRelativeSize;
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

        this.plotWidth = this.width - (this.padding * 2);
        this.plotHeight = this.height - (this.padding * 2);
    }

    public generate(): HTMLElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";

        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.canvas.setSize(this.width, this.height);
        this.relSize = null;
        return this.wrapper;
    }

    protected onSizeChange(): void {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.plotWidth = this.width - (this.padding * 2);
        this.plotHeight = this.height - (this.padding * 2);
    
        this.draw();
    }

    protected draw(): void {
        if (this.posData) {
            let offsetX: number;
            let offsetY: number;

            this.ctxMain.clear();
            this.ctxMain.beginPath();
            this.ctxMain.strokeStyle = this.color;
            this.findMinMax();

            this.rescale();

            offsetX = (this.width - this.plotWidth) / 2;
            offsetY = (this.height - this.plotHeight) / 2;

            if (this.posData.points.length > 0) {
                let firstPoint: Point = this.getAbsolute(new Point(this.posData.points[0].x, this.posData.points[0].y));
                this.ctxMain.lineTo(firstPoint.x + offsetX, firstPoint.y - offsetY);
            }

            for (let i = 0; i < this.posData.points.length; i++) {

                let relPoint: Point = new Point(this.posData.points[i].x, this.posData.points[i].y);                
                let absPoint: Point = this.getAbsolute(relPoint);
                this.ctxMain.lineTo(absPoint.x + offsetX, absPoint.y - offsetY);

            }
            this.ctxMain.stroke();
        }
    }

    private findMinMax(): void {
        if (this.relSize === null && this.posData.points.length > 0) {
            this.relSize = { min: null, max: null };
            this.relSize.min = new Point(this.posData.points[0].x, this.posData.points[0].y);
            this.relSize.max = new Point(this.posData.points[0].x, this.posData.points[0].y);
        }
        for (let i = 0; i < this.posData.points.length; i++) {
            let relPoint: Point = new Point(this.posData.points[i].x, this.posData.points[i].y);

            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
        }
    }

    private rescale(): void {
        
        let oldWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        let oldHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;

        let xRatio: number = this.plotWidth / oldWidth;
        let yRatio: number = this.plotHeight / oldHeight;
        let ratio: number = Math.min(xRatio, yRatio);

        let first: Point = new Point(this.relSize.min.x, this.relSize.min.y);

        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);

        var sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);

        this.plotWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        this.plotHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        console.log(this.plotWidth, this.plotHeight);
    }

    public setData(d: GPSPlotData): void {
        this.posData = d;
        this.onDataChange();
    }

    protected onDataChange(): void {
        this.draw();
    }
}

interface IRelativeSize {
    min: Point;
    max: Point;
}
