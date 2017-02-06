abstract class Controller {
    protected wrapper: HTMLElement;
    public setSize(width: number, height: number) { }
    public abstract generate(): HTMLElement;
}

abstract class CanvasController extends Controller {
    protected canvas: LayeredCanvas;    
    protected movePoint: Point;
    protected scalePoint: Point;
    protected height: number;
    protected width: number;

    protected getRelative(p: Point): Point {
        var moved: Point = new Point(p.x - this.movePoint.x, this.height - p.y - this.movePoint.y);
        var scaled: Point = moved.divide(this.scalePoint);
        return scaled;
    }

    protected getAbsolute(p: Point): Point {
        var scaled: Point = p.multiply(this.scalePoint);
        var moved: Point = scaled.add(this.movePoint);
        return new Point(moved.x, this.height - moved.y);
    }

    protected getMousePoint(e: MouseEvent): Point {
        return new Point(e.layerX, e.layerY);
    }

    protected abstract draw(): void;
}