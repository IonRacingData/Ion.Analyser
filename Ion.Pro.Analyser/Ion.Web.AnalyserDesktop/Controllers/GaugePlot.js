var GaugePlot = (function () {
    function GaugePlot(width, height, min, max, step) {
        this.padding = 5;
        this.totalAngle = (3 * Math.PI) / 2;
        this.startAngle = -(3 * Math.PI) / 4;
        this.color = "black";
        this.needleColor = "black";
        this.percent = 0;
        this.size = Math.min(width, height);
        var labels = [];
        for (var i = min; i <= max; i += step) {
            labels.push(i.toString());
        }
        this.labels = labels;
        var ss;
        var all = document.styleSheets;
        for (var i = 0; i < all.length; i++) {
            if (all[i].title === "app-style") {
                ss = all[i];
                var rules = ss.cssRules;
                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
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
    GaugePlot.prototype.generate = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "plot-wrapper";
        this.canvas = new LayeredCanvas(this.wrapper);
        this.ctxMain = new ContextFixer(this.canvas.addCanvas());
        this.ctxNeedle = new ContextFixer(this.canvas.addCanvas());
        this.ctxCenter = new ContextFixer(this.canvas.addCanvas());
        this.setSize(this.size, this.size);
        return this.wrapper;
    };
    GaugePlot.prototype.draw = function () {
        this.ctxMain.fillStyle = this.color;
        this.ctxMain.strokeStyle = this.color;
        var radius = this.size / 2;
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
        for (var i = 0; i < this.labels.length; i++) {
            var increment = this.totalAngle / (this.labels.length - 1);
            var ang = (i * increment) + this.startAngle;
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, -radius * 0.8);
            this.ctxMain.rotate(-ang);
            this.ctxMain.fillText(this.labels[i], 0, 0);
            this.ctxMain.rotate(ang);
            this.ctxMain.translate(0, radius * 0.8);
            this.ctxMain.rotate(-ang);
        }
        this.drawNeedle();
    };
    GaugePlot.prototype.drawNeedle = function () {
        this.ctxNeedle.fillStyle = this.needleColor;
        this.ctxNeedle.clear();
        var radius = this.size / 2;
        this.ctxNeedle.translate(radius + this.offsetX, radius + this.offsetY);
        var ang = (this.percent / 100) * this.totalAngle;
        this.ctxNeedle.rotate(this.startAngle);
        this.ctxNeedle.rotate(ang);
        this.ctxNeedle.beginPath();
        this.ctxNeedle.fillRect(-1, 0, 2, -radius * 0.85);
        this.ctxNeedle.rotate(-this.startAngle);
        this.ctxNeedle.rotate(-ang);
        this.ctxNeedle.translate(-(radius + this.offsetX), -(radius + this.offsetY));
    };
    GaugePlot.prototype.setValue = function (percent) {
        percent = percent > 100 ? 100 : percent;
        percent = percent < 0 ? 0 : percent;
        this.percent = percent;
        this.drawNeedle();
    };
    GaugePlot.prototype.setSize = function (width, height) {
        this.size = Math.min(width, height);
        this.offsetX = (width - this.size) / 2;
        this.offsetY = (height - this.size) / 2 + (height * 0.05);
        this.canvas.setSize(width, height);
        this.draw();
    };
    return GaugePlot;
}());
//# sourceMappingURL=GaugePlot.js.map