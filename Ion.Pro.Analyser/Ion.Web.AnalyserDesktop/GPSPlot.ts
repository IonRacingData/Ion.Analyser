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
    circle: ImageData;

    constructor(d: GPSPlotData) {
        this.posData = d;
    }

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

        this.circle = this.makePoint();


        this.draw();
        return this.wrapper;
    }

    draw(): void {
        //this.ctxMain.beginPath();
        for (let i = 0; i < this.posData.points.length; i++) {
            let point: Point = this.getAbsolute(new Point(this.posData.points[i].x, this.posData.points[i].y));  
            //console.log(point); 
            this.ctxMain.ctx.putImageData(this.circle, point.x, point.y);
            //this.ctxMain.fillRect(point.x - 1, point.y - 1, 2, 2);     
        }
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

    makePoint(): ImageData {        
        this.ctxMain.beginPath();
        this.ctxMain.arc(6, 6, 3, 0, 2 * Math.PI);
        this.ctxMain.stroke();
        let circle = this.ctxMain.ctx.getImageData(0, 0, 12, 12);        
        this.ctxMain.clear();


        return circle;
    }

}