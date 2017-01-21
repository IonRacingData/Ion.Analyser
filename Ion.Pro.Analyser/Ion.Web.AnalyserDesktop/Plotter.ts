class Plotter {
    canvas: HTMLCanvasElement;
    context: ContextFixer;
    data: PlotData[];
    movePoint = new Point(50, 50);
    scalePoint = new Point(1, 1);
    mouseMod: Point;    
    mouseDown: boolean;    
    isDragging = false;
    zoomSpeed: number = 1.1;
    selectedPoint: Point = null;    
    isMarking = false;
    marking: IMarking;    
    displayGrid = true;

    constructor(data: PlotData[]) {
        this.data = data;
    }

    generatePlot(): HTMLCanvasElement {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("tabindex", "0");        
        this.context = new ContextFixer(this.canvas);
        
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
                this.draw();
            }

        });

        this.canvas.addEventListener("mouseup", (e: MouseEvent) => {
            this.canvas.focus();
            this.mouseDown = false;
            if (this.isDragging)
                this.isDragging = false;
            else if (this.isMarking) {
                this.isMarking = false;
                this.zoomByMarking();            
            }
            else
                this.selectPoint(e);
        });

        this.canvas.addEventListener("mouseleave", () => { this.mouseDown = false });
        this.canvas.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));

        this.canvas.addEventListener("keydown", (e: KeyboardEvent) => {              
            console.log("key pressed");        
            if (e.key === "g") {
                this.displayGrid = this.displayGrid === true ? false : true;
                this.draw();
            } else if (e.key === "r") {
                this.scalePoint = new Point(1, 1);
                this.movePoint = new Point(50, 50);
                this.draw();
            }
        });
                
        this.draw();
        return this.canvas;
    }

    selectPoint(e: MouseEvent) {
        var mp = this.getMousePoint(e);
        var p: Point = null;
        for (var i = 0; i < this.data.length; i++) {
            var closest = this.data[i].getClosest(this.getRelative(mp));
            if (Math.abs(this.getAbsolute(closest).y - mp.y) < 10)
                p = closest;            
        }               

        if (p !== null) 
            this.selectedPoint = p;                    
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
        this.context.clear();        
        this.context.beginPath();          

        for (var d = 0; d < this.data.length; d++) {
            var firstVisibleIdx = this.data[d].getIndexOf(this.getRelative(new Point(0, 0)));
            if (firstVisibleIdx > 0)
                firstVisibleIdx--

            var lastPoint = lastPoint = this.getAbsolute(this.data[d].points[firstVisibleIdx]);
            var totalLength = this.data[d].points.length;
            var points = this.data[d].points;
            var drawPoint = 0;
            var checkPoint = lastPoint;

            for (var i = firstVisibleIdx; i < totalLength; i++) {
                var point = this.getAbsolute(points[i]);
                if (!(Math.abs(point.x - checkPoint.x) < 0.5 && Math.abs(point.y - checkPoint.y) < 0.5)) {
                    this.context.moveTo(Math.floor(point.x), Math.floor(point.y));
                    this.context.lineTo(Math.floor(checkPoint.x), Math.floor(checkPoint.y));
                    drawPoint++;
                    checkPoint = point;
                }

                if (point.x > this.canvas.width) {
                    break;
                }
                lastPoint = point;
            }

            this.context.stroke();
        }
        
        this.drawXAxis();
        this.drawYAxis();                     

        if (this.selectedPoint !== null) {
            var abs = this.getAbsolute(this.selectedPoint);
            var pointString = this.selectedPoint.toString();
            this.context.beginPath();
            this.context.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            this.context.stroke();            
            this.context.fillText(this.selectedPoint.toString(), this.canvas.width - this.context.measureText(pointString) - 6, 13);            
        }            

        if (this.isMarking) {
            this.context.fillStyle = "rgba(0,184,220,0.2)";
            this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
            this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
            this.context.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);                                    
            this.context.fillStyle = "black";            
        }
    }

    drawXAxis() {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.y >= 0 && origo.y <= this.canvas.height ? true : false;

        var y = origo.y;
        if (!visible) {
            if (origo.y < 0)
                y = 0;
            else
                y = this.canvas.height;
        }
        
        this.context.beginPath();
        this.context.moveTo(0, y);
        this.context.lineTo(this.canvas.width, y);    
        this.context.stroke();

        var stepping = this.calculateSteps(this.scalePoint.x);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;

        for (var i = -steps; i < this.canvas.width + steps; i += steps) {
            this.context.beginPath();
            var absX = i + this.movePoint.x % steps;
            var transformer = this.getRelative(new Point(absX, y));            
            var number: string;
            var numWidth: number;
            var numOffset: number; 

            if (Math.abs(transformer.x).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "     0";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.x.toExponential(2);
            }
            else {
                number = transformer.x.toFixed(decimalPlaces);
            }
           
            numWidth = this.context.measureText(number);
            numOffset = y === this.canvas.height ? y - 15 : y + 15
            this.context.fillText(number, absX - (numWidth / 2), numOffset);            

            this.context.stroke();
            this.context.beginPath();

            if (this.displayGrid) {                
                this.context.moveTo(absX, 0);
                this.context.lineTo(absX, this.canvas.height);
                this.context.strokeStyle = "rgba(100,100,100,0.3)";
                this.context.stroke();                
                this.context.strokeStyle = "black";
            }/*
            else {
                this.context.moveTo(absX, y);
                this.context.lineTo(absX, y + 4);
                this.context.stroke();
            }*/
        }        
    }

    drawYAxis() {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.x >= 0 && origo.x <= this.canvas.width ? true : false;

        var x = origo.x;
        if (!visible) {
            if (origo.x < 0)
                x = 0;
            else
                x = this.canvas.width;
        }

        this.context.beginPath();
        this.context.moveTo(x, 0);
        this.context.lineTo(x, this.canvas.height);
        this.context.stroke();

        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        
        for (var i = -steps; i < this.canvas.height + steps; i += steps) {
            this.context.beginPath();
            var absY = this.canvas.height - (i + this.movePoint.y % steps);
            var transformer = this.getRelative(new Point(x, absY));
            var number: string;
            var numWidth: number;            
            var numOffset: number;

            if (Math.abs(transformer.y).toFixed(decimalPlaces) == (0).toFixed(decimalPlaces)) {
                number = "";
            }
            else if (Math.abs(scale) > 5) {
                number = transformer.y.toExponential(2);
            }
            else {
                number = transformer.y.toFixed(decimalPlaces);
            }

            numWidth = this.context.measureText(number);
            numOffset = x === 0 ? x + 8 : x - (numWidth + 7); 
            this.context.fillText(number, numOffset, absY + 3);           

            this.context.stroke();
            this.context.beginPath();

            if (this.displayGrid) {
                this.context.moveTo(0, absY);
                this.context.lineTo(this.canvas.width, absY);
                this.context.strokeStyle = "rgba(100,100,100,0.3)";
                this.context.stroke();
                this.context.strokeStyle = "black";
            }/*
            else {
                this.context.moveTo(origo.x, absY);
                this.context.lineTo(origo.x - 4, absY);
                this.context.stroke();
            }*/ 
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

class ContextFixer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    fillStyle: string;
    strokeStyle: string;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.fillStyle = "black";
        this.strokeStyle = "black";
    }
    moveTo(x: number, y: number) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    }
    lineTo(x: number, y: number) {
        var newX = Math.floor(x) + 0.5;
        var newY = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    }    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    beginPath() {
        this.ctx.beginPath();
    }
    stroke() {
        this.ctx.strokeStyle = this.strokeStyle;       
        this.ctx.stroke();
    }
    fillText(text: string, x: number, y: number) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillText(text, x, y);        
    }
    fillRect(x: number, y: number, width: number, height: number) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillRect(x, y, width, height);
    }
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }
    measureText(text: string) {
        return this.ctx.measureText(text).width;
    }
}

