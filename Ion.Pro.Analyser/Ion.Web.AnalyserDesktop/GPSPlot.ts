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

        this.draw();
        return this.wrapper;
    }

    draw(): void {
        //this.ctxMain.beginPath();
        for (let i = 0; i < this.posData.points.length; i++) {
            let point: Point = this.getAbsolute(new Point(this.posData.points[i].x, this.posData.points[i].y));  
            //console.log(point); 
            this.ctxMain.fillRect(point.x - 1, point.y - 1, 2, 2); 

            let outsideCanvasX = point.x < 0 || point.x > this.width;
            let outsideCanvasY = point.y < 0 || point.y > this.height;
            if (outsideCanvasX || outsideCanvasY) {
                this.scale(point);
            }
        }
    }

    scale(p: Point): void {
        
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