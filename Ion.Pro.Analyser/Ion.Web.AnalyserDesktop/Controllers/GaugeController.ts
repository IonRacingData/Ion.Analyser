class GaugeController extends SingleValueCanvasController {
    private ctxMain: ContextFixer;
    private ctxNeedle: ContextFixer;
    private ctxCenter: ContextFixer;
    private size: number;
    private padding: number = 5;
    private labels: string[];
    private totalAngle: number = (3 * Math.PI) / 2;
    private startAngle: number = -(3 * Math.PI) / 4;
    private needle: ImageData;
    private offsetX: number;
    private offsetY: number;   
    private color: string = "black";
    private needleColor: string = "black";    

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

        this.setSize(this.size, this.size);
        return this.wrapper;
    }
        
    protected draw(): void {

        this.ctxMain.fillStyle = this.color;
        this.ctxMain.strokeStyle = this.color;
        let radius = this.size / 2;

        // center dot
        this.ctxCenter.fillStyle = this.color;        
        this.ctxCenter.translate(radius + this.offsetX, radius + this.offsetY);
        //this.ctxCenter.beginPath();
        this.ctxCenter.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
        this.ctxCenter.fill();        

        // ring
        this.ctxMain.beginPath();
        this.ctxMain.translate(radius + this.offsetX, radius + this.offsetY);
        this.ctxMain.arc(0, 0, radius - this.padding, 3 * Math.PI / 4, Math.PI / 4);
        this.ctxMain.stroke();
        this.ctxMain.ctx.closePath();

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
}
