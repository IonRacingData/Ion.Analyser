interface Point {
    x: number;
    y: number;
}

class Plotter {
    canvas: HTMLCanvasElement;
    data: ISensorPackage[];
    movePoint: Point = {x: 0, y: 0};
    scalePoint: Point = { x: 0.005, y: 0.5 };
    mouseMod: Point;
    dragging: boolean;
    generatePlot(data: ISensorPackage[]): HTMLCanvasElement {
        this.canvas = document.createElement("canvas");
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.mouseMod = { x: this.movePoint.x - e.layerX, y: this.movePoint.y - (this.canvas.height - e.layerY) };
            this.dragging = true;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.dragging) {
                this.movePoint = { x: e.layerX + this.mouseMod.x, y: (this.canvas.height - e.layerY) + this.mouseMod.y };
                this.draw();
            }
        });
        this.canvas.addEventListener("mouseup", (e: MouseEvent) => {
            this.dragging = false;
        });
        
        this.data = data;
        this.draw();
        return this.canvas;
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
        ctx.stroke();      
        
    }

    createPoint(data: ISensorPackage): Point {
        return {x: data.TimeStamp, y: data.Value};
    }

    transform(p: Point): Point {
        var p2: Point = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var p3: Point = { x: p2.x + this.movePoint.x, y: p2.y + this.movePoint.y };
        //console.log(p3);
        return { x: p3.x, y: this.canvas.height - p3.y };
    }

}