class GPSController extends CanvasController {
    posData: GPSPlotData;    
    ctxMain: ContextFixer;        
    relSize: IRelativeSize;
    padding: number;
    absWidth: number;
    absHeight: number;
    color: string = "white";

    constructor(d: GPSPlotData) {
        super();
        this.movePoint = new Point(0, 0);
        this.scalePoint = new Point(1, 1);
        this.posData = d;
    }

    // temp
    update(d: GPSPlotData): void {
        this.posData = d;
        this.draw();
    }

    generate(): HTMLElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";

        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());        
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.relSize = null;                
        
        return this.wrapper;
    }    

    protected onSizeChange(): void {
        this.canvas.setSize(this.width, this.height);
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.draw();
    }

    draw(): void {
        let offsetX: number;
        let offsetY: number;

        this.ctxMain.clear();
        this.ctxMain.beginPath();
        this.ctxMain.strokeStyle = this.color;
        this.findMinMax();
        
        this.rescale();
        this.rescale();

        if (this.posData.points.length > 0) {
            let firstPoint: Point = this.getAbsolute(new Point(this.posData.points[0].x, this.posData.points[0].y));
            offsetX = (this.width - this.absWidth) / 2;
            offsetY = (this.height - this.absHeight) / 2;
            this.ctxMain.moveTo(firstPoint.x + this.padding + offsetX, firstPoint.y + this.padding - offsetY);            
        }   
                
        for (let i = 0; i < this.posData.points.length; i++) {
            
            let relPoint: Point = new Point(this.posData.points[i].x, this.posData.points[i].y);           
            
            offsetX = (this.width - this.absWidth) / 2;
            offsetY = (this.height - this.absHeight) / 2;
            let absPoint: Point = this.getAbsolute(relPoint);
            //this.ctxMain.fillRect(absPoint.x - 1 + this.padding + offsetX, absPoint.y - 1 + this.padding - offsetY, 2, 2);             
            this.ctxMain.lineTo(absPoint.x + this.padding + offsetX, absPoint.y + this.padding - offsetY);

        }
        this.ctxMain.stroke();
    }

    findMinMax(): void {
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

    rescale(): void {         

        let newWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;        
        let newHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;
        this.absWidth = newWidth;
        this.absHeight = newHeight;
        let xRatio: number = this.width / newWidth;
        let yRatio: number = this.height / newHeight;
        let ratio: number = Math.min(xRatio, yRatio);     

        let first: Point = new Point(this.relSize.min.x, this.relSize.min.y);

        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);

        var sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);        
    }
}

interface IRelativeSize {   
    min: Point;
    max: Point;
}
