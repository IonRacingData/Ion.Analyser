﻿class GaugePlot {
    wrapper: HTMLDivElement;
    canvas: LayeredCanvas;
    ctxMain: ContextFixer;
    ctxNeedle: ContextFixer;
    ctxCenter: ContextFixer;
    size: number;
    padding: number = 5;
    labels: string[];
    totalAngle: number = (3 * Math.PI) / 2;
    startAngle: number = -(3 * Math.PI) / 4;
    needle: ImageData;
    offsetX: number;
    offsetY: number;   
    color: string = "black";
    needleColor: string = "black";    

    constructor(width: number, height: number, min: number, max: number, step: number) {
        this.size = Math.min(width, height);
        let labels: string[] = [];
        for (let i = min; i <= max; i += step) {
            labels.push(i.toString());
        }
        this.labels = labels;
        
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

    generate(): HTMLDivElement {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper, ["main", "needle", "center"]);
        this.ctxMain = new ContextFixer(this.canvas.canvases["main"]);
        this.ctxNeedle = new ContextFixer(this.canvas.canvases["needle"]);
        this.ctxCenter = new ContextFixer(this.canvas.canvases["center"]);

        this.setSize(this.size, this.size);
        return this.wrapper;
    }

    draw(): void {



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

        

        this.drawNeedle(0);     
        
    }                  

    drawNeedle(percent: number): void {

        percent = percent > 100 ? 100 : percent;
        percent = percent < 0 ? 0 : percent;

        this.ctxNeedle.fillStyle = this.needleColor;
        this.ctxNeedle.clear();
        let radius = this.size / 2;
        this.ctxNeedle.translate(radius + this.offsetX, radius + this.offsetY);
    
        let ang = (percent / 100) * this.totalAngle;

        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        //this.ctxNeedle.moveTo(0, 0);
        /*this.ctxNeedle.lineTo(0, -radius * 0.8);
        this.ctxNeedle.moveTo(1, -radius * 0.8);
        this.ctxNeedle.lineTo(1, 0);
        this.ctxNeedle.stroke();*/
        this.ctxNeedle.fillRect(-1, 0, 2, -radius * 0.85);
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-(radius + this.offsetX), -(radius + this.offsetY));

    }

    setSize(width: number, height: number): void {
        this.size = Math.min(width, height);
        this.offsetX = (width - this.size) / 2;
        this.offsetY = (height - this.size) / 2 + (height * 0.05);
        this.canvas.setSize(width, height);        
        this.draw();
    }
}