interface Point {
    x: number;
    y: number;
}

class Plotter {
    canvas: HTMLCanvasElement;
    data: ISensorPackage[];
    movePoint: Point = {x: 50, y: 50};
    scalePoint: Point = { x: 1, y: 1 };
    mouseMod: Point;    
    dragging: boolean;
    
    generatePlot(data: ISensorPackage[]): HTMLCanvasElement {
        this.canvas = document.createElement("canvas");
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.mouseMod = { x: this.movePoint.x - e.layerX, y: this.movePoint.y - (this.canvas.height - e.layerY) };
            console.log(this.mouseMod);
            this.dragging = true;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {            
            if (this.dragging) {
                this.movePoint = { x: e.layerX + this.mouseMod.x, y: (this.canvas.height - e.layerY) + this.mouseMod.y };
                console.log(this.movePoint);
                this.draw();
            }
        });

        this.canvas.addEventListener("mouseup", (e: MouseEvent) => {
            this.dragging = false;
        });

        this.canvas.addEventListener("mouseleave", () => { this.dragging = false });

        this.canvas.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));
        
        this.data = data;
        this.draw();
        return this.canvas;
    }

    zoom(e: WheelEvent) {
        this.movePoint.x = e.layerX;        
        //this.scalePoint.x -= e.deltaY/10;
        //this.scalePoint.y -= e.deltaY/10;
        this.draw();        
    }

    draw() {                
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();        
        var lastPoint: Point;
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.createPoint(this.data[i]));            
            ctx.moveTo(point.x, point.y);
            if (i > 0) {
                ctx.lineTo(lastPoint.x, lastPoint.y);
            }                        
            lastPoint = point;       
        }
        // x-axis
        ctx.moveTo(0, this.canvas.height - this.movePoint.y);
        ctx.lineTo(this.canvas.width, this.canvas.height - this.movePoint.y);        

        // y-axis
        ctx.moveTo(this.movePoint.x, 0);
        ctx.lineTo(this.movePoint.x, this.canvas.height);

        ctx.stroke();      
        
    }

    createPoint(data: ISensorPackage): Point {
        return {x: data.TimeStamp/10, y: data.Value};
    }

    transform(p: Point): Point {
        var scaled: Point = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var moved: Point = { x: scaled.x + this.movePoint.x, y: scaled.y + this.movePoint.y };        
        return { x: moved.x, y: this.canvas.height - moved.y };
    }

}