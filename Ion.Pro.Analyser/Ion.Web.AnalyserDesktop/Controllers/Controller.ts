abstract class Controller {
    protected wrapper: HTMLElement;
    public setSize(width: number, height: number) { }
}

abstract class CanvasController extends Controller {
    protected canvas: LayeredCanvas;
    protected contexts: ContextFixer[];
}