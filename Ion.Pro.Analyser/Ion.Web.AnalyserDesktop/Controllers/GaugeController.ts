class GaugeController extends SingleValueCanvasController {
    private canvasMain: Canvas;
    private canvasNeedle: Canvas;
    private canvasCenter: Canvas;
    private size: number;
    private padding: number = 5;
    private totalAngle: number = (3 * Math.PI) / 2;
    private startAngle: number = -(3 * Math.PI) / 4;
    private offsetX: number;
    private offsetY: number;

    private labels: string[];
    private defMin: number = 0;
    private defMax: number = 100;
    private defStep: number = 10;
    private customLabels: boolean = false;

    private color: string = "black";
    private needleColor: string = "black";
    private centerColor: string = "black";

    private contentWrapper: HTMLElement;
    private contentHeight: number;

    constructor(width: number, height: number, min?: number, max?: number, step?: number) {
        super();

        this.wrapper = this.mk.tag("div", "gauge-controller-wrapper");
        this.contentWrapper = this.mk.tag("div", "gauge-controller-content");

        this.canvas = new LayeredCanvas();
        this.canvasMain = this.canvas.addCanvas();
        this.canvasNeedle = this.canvas.addCanvas();
        this.canvasCenter = this.canvas.addCanvas();

        this.contentWrapper.appendChild(this.canvas.wrapper);
        this.wrapper.appendChild(this.contentWrapper);
        this.wrapper.appendChild(this.legendWrapper);

        // following 'if' doesn't work, need fixing
        if (min && max && step) {
            console.log("all defined");
            this.labels = this.generateLabels(min, max, step);
            this.customLabels = true;
        }
        else {
            this.labels = this.generateLabels(this.defMin, this.defMax, this.defStep);
        }

        this.setColor();
        this.setSize(this.size, this.size);
    }

    private generateLabels(min: number, max: number, step: number): string[] {
        const labels: string[] = [];
        for (let i = min; i <= max; i += step) {
            if (i % 1 == 0)
                labels.push(i.toString());
            else
                labels.push(i.toFixed(2));
        }
        
        return labels;
    }

    protected draw(): void {

        this.canvasMain.clear();
        this.canvasCenter.clear();

        this.canvasMain.fillStyle = this.color;
        this.canvasMain.strokeStyle = this.color;
        const radius = this.size / 2;

        // center dot
        this.canvasCenter.fillStyle = this.color;
        this.canvasCenter.translate(radius + this.offsetX, radius + this.offsetY);
        this.canvasCenter.beginPath();
        this.canvasCenter.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
        this.canvasCenter.fill();
        this.canvasCenter.closePath();

        // ring
        this.canvasMain.beginPath();
        this.canvasMain.translate(radius + this.offsetX, radius + this.offsetY);
        this.canvasMain.arc(0, 0, radius - this.padding, 3 * Math.PI / 4, Math.PI / 4);
        this.canvasMain.stroke();
        this.canvasMain.closePath();

        // labels
        this.canvasMain.textBaseline = "middle";
        this.canvasMain.textAlign = "center";
        this.canvasMain.font = radius * 0.1 + "px sans-serif";

        for (let i = 0; i < this.labels.length; i++) {
            const increment = this.totalAngle / (this.labels.length - 1);
            const ang = (i * increment) + this.startAngle;

            this.canvasMain.rotate(ang);
            this.canvasMain.translate(0, -radius * 0.8);
            this.canvasMain.rotate(-ang);
            this.canvasMain.fillText(this.labels[i], 0, 0);
            this.canvasMain.rotate(ang);
            this.canvasMain.translate(0, radius * 0.8);
            this.canvasMain.rotate(-ang);
        }

        this.canvasMain.setTransform(1, 0, 0, 1, 0, 0);
        this.canvasCenter.setTransform(1, 0, 0, 1, 0, 0);

        this.drawNeedle();
    }

    private drawNeedle(): void {
        if (this.percent > 1) {
            console.error("Percentage calculation malfunction");
            this.percent = 1;
        }
        else if (this.percent < 0) {
            console.error("Percentage calculation malfunction");
            this.percent = 0;
        }
        const val = this.percent * 100;

        this.canvasNeedle.fillStyle = this.needleColor;
        this.canvasNeedle.clear();
        const radius = this.size / 2;
        this.canvasNeedle.translate(radius + this.offsetX, radius + this.offsetY);

        const ang = (val / 100) * this.totalAngle;

        this.canvasNeedle.rotate(this.startAngle);
        this.canvasNeedle.rotate(ang);
        this.canvasNeedle.beginPath();
        this.canvasNeedle.fillRect(-1, 0, 2, -radius * 0.85);
        this.canvasNeedle.rotate(-this.startAngle);
        this.canvasNeedle.rotate(-ang);
        this.canvasNeedle.translate(-(radius + this.offsetX), -(radius + this.offsetY));

        this.canvasNeedle.setTransform(1, 0, 0, 1, 0, 0);
    }

    protected onSizeChange(): void {
        this.contentHeight = this.height - this.legendHeight;
        this.size = Math.min(this.width, this.contentHeight);
        this.offsetX = (this.width - this.size) / 2;
        this.offsetY = (this.contentHeight - this.size) / 2 + (this.contentHeight * 0.05);
        this.canvas.setSize(this.width, this.contentHeight);
        this.draw();
    }

    protected onSensorChange(): void {
        if (!this.customLabels) {
            const min: number = SensorInfoHelper.minValue(this.lastSensorInfo);
            const max: number = SensorInfoHelper.maxValue(this.lastSensorInfo);
            let step: number = ((max - min) / 10);
            if (step < 1) {
                step = 1;
            }

            console.log("New label values: ", min, max, step);

            this.labels = this.generateLabels(min, max, step);

            this.draw();
        }
    }

    protected onDataChange(): void {
        this.drawNeedle();
    }

    private setColor(): void {
        this.color = kernel.winMan.getRule(".gauge").style.color || this.color;
        this.needleColor = kernel.winMan.getRule(".gauge").style.borderBottomColor || this.needleColor;
        this.centerColor = kernel.winMan.getRule(".gauge").style.backgroundColor || this.centerColor;
    }

    public updateColors(): void {
        this.setColor();
        this.draw();
    }
}
