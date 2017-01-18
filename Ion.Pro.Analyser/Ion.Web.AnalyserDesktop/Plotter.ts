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
    zoomSpeed: number = 1.2;
    
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
                console.log(this.getRelative({ x: e.layerX, y: e.layerY }));
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

        var mousePoint = this.getMousePoint(e);
        var curRel = this.getRelative(mousePoint);

        if (e.deltaY < 0) {
            this.scalePoint.x *= this.zoomSpeed;
            this.scalePoint.y *= this.zoomSpeed;
        }
        else {
            this.scalePoint.x /= this.zoomSpeed;
            this.scalePoint.y /= this.zoomSpeed;
        }
        var newRel = this.getRelative(mousePoint);

        var move: Point = { x: (newRel.x - curRel.x) * this.scalePoint.x, y: (newRel.y - curRel.y) * this.scalePoint.y };
        this.movePoint = { x: this.movePoint.x + move.x, y: this.movePoint.y + move.y };
        this.draw();        
    }

    getMousePoint(e: MouseEvent): Point {
        return { x: e.layerX, y: e.layerY };
    } 

    draw() {                
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();        
        var lastPoint: Point;
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.createPoint(this.data[i]));
            if (point.x > 0) {
                ctx.moveTo(point.x, point.y);
                if (i > 0) {
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                }
                if (point.x > this.canvas.width) {
                    break;
                }
            }
            lastPoint = point;       
        }

        var origo = this.transform({ x: 0, y: 0 });
        // x-axis
        ctx.moveTo(0, origo.y);
        ctx.lineTo(this.canvas.width, origo.y);        

        // y-axis
        ctx.moveTo(origo.x, 0);
        ctx.lineTo(origo.x, this.canvas.height);

        //var relWidth = this.canvas.width / this.scalePoint.x;
        //var relHeight = this.canvas.height / this.scalePoint.y;

        for (var i = 0; i < this.canvas.width; i++) {
            var num = this.getRelative({ x: i, y: origo.y }).x;
            num = Math.round(num);            
            if (num % 10 == 0) {
                ctx.fillText(num.toString(), i, origo.y + 10);                
            }
        }
        
        var steps = 50;
        /*
        for (var i = -steps; i < this.canvas.width; i += steps) {
            var transformer = this.getRelative({ x: i + this.movePoint.x % steps, y: origo.y });
            ctx.fillText(transformer.x.toFixed(2), i + this.movePoint.x % steps, origo.y + 10);
        }
        */
        for (var i = 0; i < this.canvas.width; i += 100) {

        }
        
        ctx.stroke();      
        
    }

    createPoint(data: ISensorPackage): Point {
        return {x: data.TimeStamp, y: data.Value};
    }

    getRelative(p: Point): Point {
        var moved: Point = { x: p.x - this.movePoint.x, y: this.canvas.height - p.y - this.movePoint.y };
        var scaled: Point = { x: moved.x / this.scalePoint.x, y: moved.y / this.scalePoint.y };
        return scaled;
    }

    transform(p: Point): Point {
        var scaled: Point = { x: p.x * this.scalePoint.x, y: p.y * this.scalePoint.y };
        var moved: Point = { x: scaled.x + this.movePoint.x, y: scaled.y + this.movePoint.y };        
        return { x: moved.x, y: this.canvas.height - moved.y };
    }

}