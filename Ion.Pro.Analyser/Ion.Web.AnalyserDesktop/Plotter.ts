interface Point {
    x: number;
    y: number;
}

class Plotter {
    data: ISensorPackage[];
    canvas: HTMLCanvasElement;

    generatePlot(data: ISensorPackage[]): HTMLCanvasElement {
        this.canvas = document.createElement("canvas");
        this.data = data;
        this.draw();
        return this.canvas;
    }

    draw() {                
        var ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        for (var i = 0; i < this.data.length; i++) {
            var point = this.transform(this.data[i]);                       
            //ctx.fillRect(point.x, point.y, 1, 1);
            ctx.moveTo(point.x, point.y);            
        }
        
    }

    transform(d: ISensorPackage): Point {
        var time = d.TimeStamp / 10;
        return { x: time, y: d.Value };
    }


}