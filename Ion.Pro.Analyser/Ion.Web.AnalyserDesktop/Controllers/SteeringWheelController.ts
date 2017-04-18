class SteeringWheelController extends SingleValueController {
    private steeringWheel: HTMLImageElement;
    private totalAngle: number = Math.PI * 2;
    private startAngle: number = -Math.PI;

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
    }

    public generate(): HTMLElement {
        this.wrapper = this.mk.tag("div", "steeringWheel-wrapper");
        this.steeringWheel = <HTMLImageElement>this.mk.tag("img");
        this.steeringWheel.src = "steeringWheel.png";
        this.setSWSize();
        this.steeringWheel.style.height = "100%";
        this.wrapper.appendChild(this.steeringWheel);
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        return this.wrapper;
    }

    private setSWSize(): void {
        let size: number = Math.min(this.width, this.height);
        this.steeringWheel.style.height = size + "px";
    }

    protected onDataChange(): void {
        let p: number = this.percent;
        let angle: number = (p * this.totalAngle);
        angle += this.startAngle;
        this.steeringWheel.style.transform = "rotate(" + angle + "rad)";
    }

    protected onSizeChange(): void {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.setSWSize();
    }

    // temp
    public setPer(per: number) {
        this.percent = per < 0 ? 0 : per;
        this.percent = per > 1 ? 1 : per;
        this.onDataChange();
    }

}