class Plotter {
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;       
    ctxMarking: ContextFixer;  
    ctxBackground: ContextFixer;  
    width: number;
    height: number;
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
    backgroundColor = "black";
    gridColor = "rgba(100,100,100,0.3)";
    axisColor = "grey"; //"black";
    mainColor = "white";


    constructor(data: PlotData[]) {
        this.data = data;
    }

    generatePlot(): HTMLDivElement {        
        this.wrapper = document.createElement("div");  
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";      

        this.canvas = new LayeredCanvas(this.wrapper, ["background", "main", "marking"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);       
        this.ctxMarking = new ContextFixer(this.canvas.canvases["marking"]);
        this.ctxBackground = new ContextFixer(this.canvas.canvases["background"]);
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();     
        this.ctxMain.strokeStyle = this.mainColor;
        
        this.wrapper.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.mouseMod = new Point(this.movePoint.x - e.layerX, this.movePoint.y - (this.height - e.layerY));            
            this.mouseDown = true;
            if (e.altKey) {
                this.isMarking = true;
                var mousePoint = this.getMousePoint(e);
                this.marking = { firstPoint: mousePoint, secondPoint: mousePoint, width: 0, height: 0 }             
                console.log(this.marking.firstPoint);
            }
        });
        this.wrapper.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.mouseDown && (e.movementX != 0 || e.movementY != 0)) {    
                if (this.isMarking) {
                    this.marking.secondPoint = this.getMousePoint(e);
                    this.drawMarking();                                                    
                }
                else {
                    this.isDragging = true;
                    this.movePoint = new Point(e.layerX + this.mouseMod.x, (this.height - e.layerY) + this.mouseMod.y);                    
                    this.draw();
                }                
                
            }

        });
        this.wrapper.addEventListener("mouseup", (e: MouseEvent) => {
            this.wrapper.focus();
            this.mouseDown = false;
            if (this.isDragging)
                this.isDragging = false;
            else if (this.isMarking) {
                this.isMarking = false;
                if (this.marking.width !== 0 && this.marking.height !== 0) 
                    this.zoomByMarking();            
            }
            else
                this.selectPoint(e);
        });
        this.wrapper.addEventListener("mouseleave", () => {
            this.mouseDown = false;
            this.isMarking = false;
            this.ctxMarking.clear();            
        });
        this.wrapper.addEventListener("wheel", (e: WheelEvent) => this.zoom(e));
        this.wrapper.addEventListener("keydown", (e: KeyboardEvent) => {              
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
        return this.wrapper;
    }   

    drawMarking() {
        this.ctxMarking.clear();        
        this.ctxMarking.fillStyle = "rgba(0,184,220,0.2)";
        this.marking.width = this.marking.secondPoint.x - this.marking.firstPoint.x;
        this.marking.height = this.marking.secondPoint.y - this.marking.firstPoint.y;
        this.ctxMarking.fillRect(this.marking.firstPoint.x, this.marking.firstPoint.y, this.marking.width, this.marking.height);                                           
    }    

    setSize(width: number, height: number) {        
        this.width = width;
        this.height = height;
        this.canvas.setSize(width, height);
        this.draw();
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
        this.ctxMain.clear();        
        this.ctxMain.beginPath();          

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
                    this.ctxMain.moveTo(Math.floor(point.x), Math.floor(point.y));
                    this.ctxMain.lineTo(Math.floor(checkPoint.x), Math.floor(checkPoint.y));
                    drawPoint++;
                    checkPoint = point;
                }

                if (point.x > this.width) {
                    break;
                }
                lastPoint = point;
            }

            this.ctxMain.stroke();
        }

        this.ctxMain.strokeStyle = this.axisColor;
        this.ctxMain.fillStyle = this.axisColor;
        this.drawXAxis();
        this.drawYAxis();
        this.ctxMain.strokeStyle = this.mainColor;
        this.ctxMain.fillStyle = this.mainColor;

        if (this.selectedPoint !== null) {
            var abs = this.getAbsolute(this.selectedPoint);
            var pointString = this.selectedPoint.toString();
            this.ctxMain.beginPath();
            this.ctxMain.arc(abs.x, abs.y, 5, 0, 2 * Math.PI);
            this.ctxMain.stroke();            
            this.ctxMain.fillText(this.selectedPoint.toString(), this.width - this.ctxMain.measureText(pointString) - 6, 13);            
        }    

        this.ctxBackground.fillStyle = this.backgroundColor;
        this.ctxBackground.fillRect(0, 0, this.width, this.height);
        
    }

    drawXAxis() {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.y >= 0 && origo.y <= this.height ? true : false;

        var y = origo.y;
        if (!visible) {
            if (origo.y < 0)
                y = 0;
            else
                y = this.height;
        }
        
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(0, y);
        this.ctxMain.lineTo(this.width, y);            
        this.ctxMain.stroke();

        var stepping = this.calculateSteps(this.scalePoint.x);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;

        for (var i = -steps; i < this.width + steps; i += steps) {
            this.ctxMain.beginPath();
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
           
            numWidth = this.ctxMain.measureText(number);
            numOffset = y === this.height ? y - 15 : y + 15
            this.ctxMain.fillText(number, absX - (numWidth / 2), numOffset);            

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.displayGrid) {                
                this.ctxMain.moveTo(absX, 0);
                this.ctxMain.lineTo(absX, this.height);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();                                
            }/*
            else {
                this.ctxMain.moveTo(absX, y);
                this.ctxMain.lineTo(absX, y + 4);
                this.ctxMain.stroke();
            }*/
        }
    }

    drawYAxis() {
        var origo = this.getAbsolute(new Point(0, 0));
        var visible = origo.x >= 0 && origo.x <= this.width ? true : false;

        var x = origo.x;
        if (!visible) {
            if (origo.x < 0)
                x = 0;
            else
                x = this.width;
        }

        this.ctxMain.beginPath();
        this.ctxMain.moveTo(x, 0);
        this.ctxMain.lineTo(x, this.height);
        this.ctxMain.stroke();

        var stepping = this.calculateSteps(this.scalePoint.y);
        var steps = stepping.steps;
        var decimalPlaces = stepping.decimalPlaces;
        var scale = stepping.scale;
        
        for (var i = -steps; i < this.height + steps; i += steps) {
            this.ctxMain.beginPath();
            var absY = this.height - (i + this.movePoint.y % steps);
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

            numWidth = this.ctxMain.measureText(number);
            numOffset = x === 0 ? x + 8 : x - (numWidth + 7); 
            this.ctxMain.fillText(number, numOffset, absY + 3);           

            this.ctxMain.stroke();
            this.ctxMain.beginPath();

            if (this.displayGrid) {
                this.ctxMain.moveTo(0, absY);
                this.ctxMain.lineTo(this.width, absY);
                this.ctxMain.strokeStyle = this.gridColor;
                this.ctxMain.stroke();
            }/*
            else {
                this.ctxMain.moveTo(origo.x, absY);
                this.ctxMain.lineTo(origo.x - 4, absY);
                this.ctxMain.stroke();
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
        var moved = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        var scaled = moved.divide(this.scalePoint);        
        return scaled;
    }

    getAbsolute(p: Point): Point {
        var scaled = p.multiply(this.scalePoint);
        var moved = scaled.add(this.movePoint);                
        return new Point( moved.x, this.height - moved.y );
    }

    zoomByMarking() {
        this.ctxMarking.clear();

        var width = this.marking.width;
        var height = this.marking.height;        
        var xRatio = this.width / width;
        var yRatio = this.height / height;

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
        sec.y = this.height - sec.y;

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

class LayeredCanvas {
    canvases: { [name: string]: HTMLCanvasElement } = {};

    constructor(wrapper: HTMLDivElement, names: string[]) {        
        var canvas = document.createElement("canvas");
        canvas.className = "plot-canvas";
        for (let name of names) {
            this.canvases[name] = <HTMLCanvasElement>canvas.cloneNode();
            wrapper.appendChild(this.canvases[name]);
        }
    }

    getContext(name: string): CanvasRenderingContext2D {
        var ctx = this.canvases[name].getContext("2d");
        return ctx;
    }

    getWidth() {
        return this.canvases["main"].width;
    }
    getHeight() {
        return this.canvases["main"].height;
    }
    setSize(width: number, height: number) {
        for (let name in this.canvases) {
            this.canvases[name].width = width;
            this.canvases[name].height = height;
        }
    }
}
