class GaugeController extends SingleValueCanvasController {
    private ctxMain: ContextFixer;
    private ctxNeedle: ContextFixer;
    private ctxCenter: ContextFixer;
    private size: number;
    private padding: number = 5;
    private totalAngle: number = (3 * Math.PI) / 2;
    private startAngle: number = -(3 * Math.PI) / 4;
    private offsetX: number;
    private offsetY: number;

    private labels: string[];

    private color: string;
    private needleColor: string;
    private centerColor: string;

    constructor(width: number, height: number, min: number, max: number, step: number) {
        super();
        this.size = Math.min(width, height);
        let labels: string[] = [];
        for (let i = min; i <= max; i += step) {
            labels.push(i.toString());
        }
        this.labels = labels;

        // temp stylesheet thingy

        let ss: CSSStyleSheet;
        let all: StyleSheetList = document.styleSheets;
        for (let i = 0; i < all.length; i++) {
            if (all[i].title === "app-style") {
                ss = <CSSStyleSheet>all[i];
                let rules = ss.cssRules;

                for (let j = 0; j < rules.length; j++) {
                    let rule: CSSStyleRule = <CSSStyleRule>rules[j];
                    if (rule.selectorText === ".gauge-plot") {
                        this.color = rule.style.color;
                        this.needleColor = rule.style.borderColor;
                        break;
                    }
                }
                break;
            }
        }
    }

    generate(): HTMLElement {
        this.wrapper = this.mk.tag("div", "plot-wrapper");
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.ctxNeedle = new ContextFixer(this.canvas.addCanvas());
        this.ctxCenter = new ContextFixer(this.canvas.addCanvas());

        this.setColor();
        this.setSize(this.size, this.size);

        return this.wrapper;
    }

    protected draw(): void {

        this.ctxMain.clear();
        this.ctxCenter.clear();

        this.ctxMain.fillStyle = this.color;
        this.ctxMain.strokeStyle = this.color;
        let radius = this.size / 2;

        // center dot
        this.ctxCenter.fillStyle = this.color;
        this.ctxCenter.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxCenter.beginPath();
        this.ctxCenter.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
        this.ctxCenter.fill();
        this.ctxCenter.closePath();

        // ring
        this.ctxMain.beginPath();
        this.ctxMain.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxMain.arc(0, 0, radius - this.padding, 3 * Math.PI / 4, Math.PI / 4);
        this.ctxMain.stroke();
        this.ctxMain.closePath();

        // labels
        this.ctxMain.textBaseline = "middle";
        this.ctxMain.textAlign = "center";
        this.ctxMain.ctx.font = radius * 0.1 + "px sans-serif";

        for (let i = 0; i < this.labels.length; i++) {
            let increment = this.totalAngle / (this.labels.length - 1);
            let ang = (i * increment) + this.startAngle;

            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, -radius * 0.8);
            this.ctxMain.rotate(-ang);
            this.ctxMain.fillText(this.labels[i], 0, 0);
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, radius * 0.8);
            this.ctxMain.rotate(-ang);
        }

        this.ctxMain.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctxCenter.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.drawNeedle();
    }

    private drawNeedle(): void {

        let val = this.percent * 100;

        this.ctxNeedle.fillStyle = this.needleColor;
        this.ctxNeedle.clear();
        let radius = this.size / 2;
        this.ctxNeedle.translate(radius + this.offsetX, radius + this.offsetY);
    
        let ang = (val / 100) * this.totalAngle;

        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        this.ctxNeedle.fillRect(-1, 0, 2, -radius * 0.85);
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-(radius + this.offsetX), -(radius + this.offsetY));

        this.ctxNeedle.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }    

    protected onSizeChange(): void {
        this.size = Math.min(this.width, this.height);
        this.offsetX = (this.width - this.size) / 2;
        this.offsetY = (this.height - this.size) / 2 + (this.height * 0.05);
        this.canvas.setSize(this.width, this.height);
        this.draw();
    }

    protected onDataChange(): void {        
        this.drawNeedle();
    }

    private setColor(): void {
        this.color = kernel.winMan.getRule(".gauge").style.color;
        this.needleColor = kernel.winMan.getRule(".gauge").style.borderBottomColor;
        this.color = kernel.winMan.getRule(".gauge").style.backgroundColor;
    }

    public updateColors(): void {
        this.setColor();
        this.draw();
    }
}
