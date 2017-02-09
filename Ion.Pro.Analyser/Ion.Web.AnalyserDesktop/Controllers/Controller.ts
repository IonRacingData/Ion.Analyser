abstract class Controller {
    protected wrapper: HTMLElement;
    protected height: number;
    protected width: number;
    protected mk: HtmlHelper = new HtmlHelper;

    public setSize(width: number, height: number) { }
    public abstract generate(): HTMLElement;
}

abstract class SingleValueController extends Controller {
    protected value: number;
    public abstract setValue(value: number): void;
}

abstract class CanvasController extends Controller {
    protected canvas: LayeredCanvas;    
    protected movePoint: Point;
    protected scalePoint: Point;

    protected getRelative(p: Point): Point {
        let moved: Point = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        let scaled: Point = moved.divide(this.scalePoint);
        return scaled;
    }

    protected getAbsolute(p: Point): Point {
        let scaled: Point = p.multiply(this.scalePoint);
        let moved: Point = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    }

    protected getMousePoint(e: MouseEvent): Point {
        return new Point(e.layerX, e.layerY);
    }

    protected abstract draw(): void;
}

abstract class SingleValueCanvasController extends CanvasController {
    protected value: number;
    public abstract setValue(value: number): void;
}