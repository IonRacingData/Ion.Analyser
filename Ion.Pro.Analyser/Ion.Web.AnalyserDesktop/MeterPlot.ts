class MeterPlot {
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;
    size: number;
    offset: number = 5;

    constructor(size: number) {
        this.size = size;
    }

    generate(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);

        this.setSize(this.size);
        return this.wrapper;
    }

    draw() {
        this.ctxMain.beginPath();
        let center = this.size / 2;
        this.ctxMain.arc(center, center, (this.size / 2) - this.offset, 0, 2 * Math.PI);
        this.ctxMain.stroke();
    }

    setSize(size: number) {
        this.size = size;
        this.canvas.setSize(size, size);
        this.draw();
    }
}