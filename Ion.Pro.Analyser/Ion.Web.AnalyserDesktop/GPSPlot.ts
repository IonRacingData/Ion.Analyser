class GPSPlot {
    posData: GPSPlotData;
    otherData: PlotData;
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;
    movePoint: Point = new Point(0, 0);
    scalePoint: Point = new Point(1, 1);
    width: number;
    height: number;
    relSize: IRelativeSize;
    padding: number;

    constructor(d: GPSPlotData) {
        this.posData = d;
    }

    // temp
    update(d: GPSPlotData): void {
        this.posData = d;
        this.draw();
    }

    generate(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";

        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);        
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.padding = this.width / 100;
        this.relSize = null;
        
        this.draw();
        return this.wrapper;
    }

    draw(): void {
        this.ctxMain.clear();

        if (this.relSize === null && this.posData.points.length > 0) {
            this.relSize = { min: null, max: null };
            this.relSize.min = new Point(this.posData.points[0].x, this.posData.points[0].y);
            this.relSize.max = new Point(this.posData.points[0].x, this.posData.points[0].y);
        }

        //this.ctxMain.beginPath();
        for (let i = 0; i < this.posData.points.length; i++) {
            let relPoint: Point = new Point(this.posData.points[i].x, this.posData.points[i].y);
            let absPoint: Point = this.getAbsolute(relPoint);            

            this.relSize.min.x = Math.min(relPoint.x, this.relSize.min.x);
            this.relSize.min.y = Math.min(relPoint.y, this.relSize.min.y);
            this.relSize.max.x = Math.max(relPoint.x, this.relSize.max.x);
            this.relSize.max.y = Math.max(relPoint.y, this.relSize.max.y);
            //console.log(this.relSize.min, this.relSize.max);
            this.rescale();

            /*
            let outsideCanvasX: boolean = absPoint.x < 0 || absPoint.x > this.width;
            let outsideCanvasY: boolean = absPoint.y < 0 || absPoint.y > this.height;
            if (outsideCanvasX || outsideCanvasY) {
                this.rescale(newWidth, newHeight);
                absPoint = this.getAbsolute(relPoint);
                this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2); 
            }
            else {
                this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2); 
            }*/
            
            absPoint = this.getAbsolute(relPoint);

            this.ctxMain.fillRect(absPoint.x - 1, absPoint.y - 1, 2, 2); 
        }
        console.log(this.movePoint);
    }

    rescale(): void {         

        let newWidth = Math.abs(this.getAbsolute(this.relSize.max).x - this.getAbsolute(this.relSize.min).x) + 1;
        let newHeight = Math.abs(this.getAbsolute(this.relSize.max).y - this.getAbsolute(this.relSize.min).y) + 1;        

        //console.log(newWidth, newHeight);
        
        let xRatio: number = this.width / newWidth;
        let yRatio: number = this.height / newHeight;
        //console.log(xRatio, yRatio);
        let ratio: number = Math.min(xRatio, yRatio); // maybe max       

        let first: Point = new Point(this.relSize.min.x, this.relSize.min.y);

        this.scalePoint.x = Math.abs(this.scalePoint.x * ratio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * ratio);

        var sec: Point = this.getAbsolute(first);
        sec.y = this.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);
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

    getMousePoint(e: MouseEvent): Point {
        return new Point(e.layerX, e.layerY);
    }

}

interface IRelativeSize {   
    min: Point;
    max: Point;
}
