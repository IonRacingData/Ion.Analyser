class Segment {

    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    width: number;
    height: number;
    padding: number;

    constructor() {

    }

    // temp
    update(): void {

    }

    generate(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.setAttribute("tabindex", "0");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main"]);

        return this.wrapper;
    }

    setSize(width: number, height: number): void {
        this.canvas.setSize(width, height);
        this.width = width;
        this.height = height;
        this.padding = this.width * 0.05;
        this.width -= this.padding * 2;
        this.height -= this.padding * 2;
        this.draw();
    }

    draw(): void {

    }

    findMinMax(): void {

    }

    rescale(): void {

    }
}