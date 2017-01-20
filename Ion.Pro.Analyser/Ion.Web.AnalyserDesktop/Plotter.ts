class Plotter {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    data: PlotData;
    movePoint = new Point(50, 50);
    scalePoint = new Point(1, 1);
    mouseMod: Point;    
    mouseDown: boolean;    
    isDragging = false;
    zoomSpeed: number = 1.1;
    selectedPoint: Point = null;    
    isMarking = false;
    marking: IMarking;    

    generatePlot(data: PlotData): HTMLCanvasElement {
        this.canvas = document.createElement("canvas");        
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.mouseMod = new Point(this.movePoint.x - e.layerX, this.movePoint.y - (this.canvas.height - e.layerY));            
            this.mouseDown = true;
            if (e.altKey) {
                this.isMarking = true;
                var mousePoint = this.getMousePoint(e);
                this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 }             
            }
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.mouseDown && (e.movementX != 0 || e.movementY != 0)) {    
                if (this.isMarking) {
                    this.marking.secondPoint = this.getMousePoint(e);                                                        
                }
                else {
                    this.isDragging = true;
                    this.movePoint = new Point(e.layerX + this.mouseMod.x, (this.canvas.height - e.layerY) + this.mouseMod.y);                    
                }
                console.log(this.movePoint);
                this.draw();
            }

        });

        this.canvas.addEventListener("mouseup", (e: MouseEvent) => {
            this.mouseDown = false;
            if (this.isDragging)
                this.isDragging = false;
            else if (this.isMarking) {
                this.isMarking = false;
                this.zoomByMarking();            
            }

            this.selectPoint(e);
        });

        this.canvas.addEventListener("mouseleave", () => { this.mouseDown = false });
        this.canvas.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));
        this.canvas.addEventListener("click", (e: MouseEvent) => {
            
        });
        
        this.data = data;
        this.draw();
        return this.canvas;
    }

    selectPoint(e: MouseEvent) {
        var mp = this.getMousePoint(e);
        var closest = this.data.getClosest(this.getRelative(mp));
        if (Math.abs(this.getAbsolute(closest).y - mp.y) < 10)
            this.selectedPoint = closest;            
        else
            this.selectedPoint = null;

        this.draw();
    }

    zoom(e: WheelEvent) {
        e.preventDefault();
        var mousePoint = this.getMousePoint(e);
        var curRel = this.getRelative(mousePoint);

        if (e.deltaY < 0) {
            if (e.ctrlKey == true)
                this.scalePoint.x *= this.zoomSpeed;            
            else if (e.shiftKey == true)
                this.scalePoint.y *= this.zoomSpeed;            
            else {
                this.scalePoint.x *= this.zoomSpeed;
                this.scalePoint.y *= this.zoomSpeed;
            }
        }
        else {
            if (e.ctrlKey == true)
                this.scalePoint.x /= this.zoomSpeed;
            else if (e.shiftKey == true)
                this.scalePoint.y /= this.zoomSpeed;
            else {
                this.scalePoint.x /= this.zoomSpeed;
                this.scalePoint.y /= this.zoomSpeed;
            }
        }
        var newRel = this.getRelative(mousePoint);

        var move = new Point((newRel.x - curRel.x) * this.scalePoint.x, (newRel.y - curRel.y) * this.scalePoint.y);
        this.movePoint = this.movePoint.add(move);        
        this.draw();        
    }

    getMousePoint(e: MouseEvent): Point {
        return new Point( e.layerX, e.layerY );
    }

    draw() {                        
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 1;
        ctx.beginPath();              
        
        var firstVisibleIdx = this.data.getIndexOf(this.getRelative(new Point(0, 0)));
        if (firstVisibleIdx > 0)
            firstVisibleIdx--

        var lastPoint = lastPoint = this.getAbsolute(this.data.points[firstVisibleIdx]);
        var totalLength = this.data.points.length;
        var points = this.data.points;
        var samePoint = 0;
        var drawPoint = 0;
        var checkPoint = lastPoint;

        for (var i = firstVisibleIdx; i < totalLength; i++) {
            var point = this.getAbsolute(points[i]);
            if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                ctx.moveTo(Math.floor(point.x), Math.floor(point.y));
                ctx.lineTo(Math.floor(checkPoint.x), Math.floor(checkPoint.y));
            //ctx.moveTo(point.x, point.y);
            //ctx.lineTo(lastPoint.x, lastPoint.y);
                drawPoint++;
                checkPoint = point;
            } 
            //else {
            //    samePoint++;
            //} 

            if (point.x > this.canvas.width) {
                break;
            }
            lastPoint = point;
        }
        
        this.drawXAxis(ctx);
        this.drawYAxis(ctx);       

        ctx.stroke();      

        if (this.selectedPoint !== null) {
            var abs = this.getAbsolute(this.selectedPoint);
            ctx.beginPath();
            //ctx.moveTo(abs.x, abs.y);
            ctx.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            ctx.stroke();
            var pointString = this.selectedPoint.toString();
            ctx.fillText(this.selectedPoint.toString(), this.canvas.width - ctx.measureText(pointString).width - 3, 10);            
        }            

        if (this.isMarking) {
            ctx.fillStyle = "rgba(0,184,200,0.2)";
            this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
            this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
            ctx.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);                                    
            ctx.fillStyle = "black";            
        }
    }

    drawXAxis(ctx: CanvasRenderingContext2D) {
        var origo = this.getAbsolute(new Point(0, 0));        

        ctx.moveTo(0, origo.y);
        ctx.lineTo(this.canvas.width, origo.y);    

        var stepping = this.calculateSteps(this.scalePoint.x);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;

        for (var i = -steps; i < this.canvas.width + steps; i += steps) {
            var transformer = this.getRelative(new Point(i + this.movePoint.x % steps, origo.y));
            var number: string;
            var numWidth: number;
            if (Math.abs(transformer.x).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "     0";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.x.toExponential(2);
            }
            else {
                number = transformer.x.toFixed(decimalPlaces);
            }
            numWidth = ctx.measureText(number).width;
            ctx.fillText(number, i + this.movePoint.x % steps - (numWidth / 2), origo.y + 15);
            ctx.moveTo(i + this.movePoint.x % steps, origo.y);
            ctx.lineTo(i + this.movePoint.x % steps, origo.y + 4);
        }
    }

    drawYAxis(ctx: CanvasRenderingContext2D) {
        var origo = this.getAbsolute(new Point(0, 0));
        
        ctx.moveTo(origo.x, 0);
        ctx.lineTo(origo.x, this.canvas.height);

        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        
        for (var i = -steps; i < this.canvas.height + steps; i += steps) {
            var transformer = this.getRelative(new Point(origo.x, this.canvas.height - (i + this.movePoint.y % steps)));
            var number: string;
            var numWidth: number;
            if (Math.abs(transformer.y).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }
            numWidth = ctx.measureText(number).width;            
            ctx.fillText(number, origo.x - (numWidth + 7), this.canvas.height - (i + this.movePoint.y % steps) + 3);
            ctx.moveTo(origo.x, this.canvas.height - (i + this.movePoint.y % steps));
            ctx.lineTo(origo.x - 4, this.canvas.height - (i + this.movePoint.y % steps));
        }
    }

    calculateSteps(scaling: number): IStepInfo {
        var log10 = function log10(val: number): number {
            return Math.log(val) / Math.LN10;
        };

        var maxR: number = 100 / scaling;
        var scale = Math.floor(log10(maxR));
        var step = Math.floor(maxR / Math.pow(10, scale));
        if (step < 2) {
            step = 1;
        }
        else if (step < 5) {
            step = 2;
        }
        else {
            step = 5;
        }
        var newstep = step * Math.pow(10, scale) * scaling;
        var decimalPlaces = 0;
        if (scale < 0)
            decimalPlaces = scale * -1;

        return {steps: newstep, decimalPlaces: decimalPlaces, scale: scale}
    }    

    getRelative(p: Point): Point {
        var moved = new Point(p.x - this.movePoint.x, this.canvas.height - p.y - this.movePoint.y);
        var scaled = moved.divide(this.scalePoint);        
        return scaled;
    }

    getAbsolute(p: Point): Point {
        var scaled = p.multiply(this.scalePoint);
        var moved = scaled.add(this.movePoint);                
        return new Point( moved.x, this.canvas.height - moved.y );
    }

    zoomByMarking() {
        var width = this.marking.width;
        var height = this.marking.height;        
        var xRatio = this.canvas.width / width;
        var yRatio = this.canvas.height / height;


        var downLeft = new Point(
            Math.min(
                this.marking.firstPoint.x,
                this.marking.secondPoint.x),
            Math.max(
                this.marking.firstPoint.y,
                this.marking.secondPoint.y)
        );

        var first = this.getRelative(downLeft);

        this.scalePoint.x = Math.abs(this.scalePoint.x * xRatio);
        this.scalePoint.y = Math.abs(this.scalePoint.y * yRatio);        

        var sec = this.getAbsolute(first);
        sec.y = this.canvas.height - sec.y;

        this.movePoint = this.movePoint.sub(sec);

        this.draw();
    }

}

interface IStepInfo {
    steps: number;
    decimalPlaces: number;
    scale: number;
}

interface IMarking {
    firstPoint: Point;
    secondPoint: Point;
    width: number;
    height: number;
}
