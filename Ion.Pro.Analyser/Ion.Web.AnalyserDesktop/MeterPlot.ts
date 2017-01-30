class MeterPlot {
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;
    ctxNeedle: ContextFixer;
    size: number;
    offset: number = 5;
    labels: string[];
    totalAngle: number = (3 * Math.PI) / 2;
    startAngle: number = -(3 * Math.PI) / 4;
    needle: ImageData;

    constructor(size: number, labels: string[]) {
        this.size = size;
        this.labels = labels;
    }

    generate(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main", "needle"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);
        this.ctxNeedle = new ContextFixer(this.canvas.canvases["needle"]);

        this.setSize(this.size);
        return this.wrapper;
    }

    draw(): void {
        this.ctxMain.beginPath();        
        let radius = this.size / 2;
        this.ctxMain.translate(radius, radius);
        this.ctxMain.arc(0, 0, radius - this.offset, 0, 2 * Math.PI);
        this.ctxMain.stroke();
        this.ctxMain.textBaseline = "middle";
        this.ctxMain.textAlign = "center";
        
        for (let i = 0; i < this.labels.length; i++) {
            let increment = this.totalAngle / (this.labels.length - 1);
            let ang = (i * increment) + this.startAngle;
            
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, -radius * 0.85);
            this.ctxMain.rotate(-ang);
            this.ctxMain.fillText(this.labels[i], 0, 0);
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, radius * 0.85);
            this.ctxMain.rotate(-ang);
        }
        this.drawNeedle(0);
        
    }                  

    drawNeedle(percent: number): void {
        this.ctxNeedle.clear();        
        let radius = this.size / 2;
        this.ctxNeedle.translate(radius, radius);

        let ang = (percent / 100) * this.totalAngle;

        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        this.ctxNeedle.moveTo(0, 0);
        this.ctxNeedle.lineTo(0, -radius * 0.6  );
        this.ctxNeedle.stroke();
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-radius, -radius);

    }

    setSize(size: number): void {
        this.size = size;
        this.canvas.setSize(size, size);
        this.wrapper.style.height = size.toString() + "px";
        this.wrapper.style.width = size.toString() + "px";
        this.draw();
    }
}