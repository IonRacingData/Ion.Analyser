interface Kernel {
    winMan: WindowManager
    appMan: ApplicationManager
}

interface HTMLElement
{
    window: AppWindow
}

var kernel: Kernel;

window.onload = () => {
    var logViewer = new Launcher(TestViewer, "LogViewer");

    kernel = {
        winMan: new WindowManager(document.getElementsByTagName("body")[0]),
        appMan: new ApplicationManager()
    };


    kernel.appMan.registerApplication("Test", new Launcher(TestViewer, "Test Window"));

    let mk = new HtmlHelper();

    let content = mk.tag("div", "taskbar-applet");
    let menuContent = mk.tag("div", "taskbar-applet");

    let wl = new WindowList(content);
    let menu = new MainMenu(menuContent);

    let taskbar = document.getElementsByClassName("taskbar")[0];

    taskbar.appendChild(menu.content);
    taskbar.appendChild(wl.content);

    document.addEventListener("contextmenu", (e: PointerEvent) => {
        e.preventDefault();
    });
};

class WindowManager
{
    body: HTMLElement;
    template: HTMLTemplateElement;

    dragging: boolean;
    resizing: boolean;

    activeWindow: AppWindow;

    windows: AppWindow[] = [];
    order: AppWindow[] = [];

    events: any = {};

    tileZone = 20;
    topBar = 40;

    constructor(container: HTMLElement)
    {
        this.body = container;

        this.template = <HTMLTemplateElement>document.getElementById("temp-window");

        window.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e));
        window.addEventListener("mouseup", (e: MouseEvent) => this.mouseUp(e));
    }

    mouseMove(e: MouseEvent): void {
        if (this.dragging) {
            this.activeWindow.setRelativePos(e.pageX, e.pageY);
            var tileZone = this.tileZone;
            var topBar = this.topBar;

            if (e.pageX < tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPLEFT);
            }
            else if (e.pageX < tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMLEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY < topBar + tileZone) {
                this.activeWindow.tile(TileState.TOPRIGHT);
            }
            else if (e.pageX > window.innerWidth - tileZone && e.pageY > window.innerHeight - tileZone) {
                this.activeWindow.tile(TileState.BOTTOMRIGHT);
            }
            else if (e.pageY < topBar + tileZone) {
                this.activeWindow.maximize();
            }
            else if (e.pageX < tileZone) {
                this.activeWindow.tile(TileState.LEFT);
            }
            else if (e.pageX > window.innerWidth - tileZone) {
                this.activeWindow.tile(TileState.RIGHT);
            }
        }
        else if (this.resizing) {
            this.activeWindow.setRelativeSize(e.pageX, e.pageY);
        }
    }

    mouseUp(e: MouseEvent): void {
        console.log("Global MouseUp");
        console.log(e);
        this.dragging = false;
        this.resizing = false;
    }

    createWindow(app: Application, title: string): AppWindow
    {
        var window = this.makeWindow(app);
        window.setTitle(title);
        this.registerWindow(window);
        return window;
    }

    makeWindow(app: Application): AppWindow {
        var tempWindow = new AppWindow(app);
        return tempWindow;
    }

    registerWindow(app: AppWindow): void
    {
        app.winMan = this;
        this.body.appendChild(app.handle);
        this.windows.push(app);
        this.order.push(app);
        this.reorderWindows();
        this.raiseEvent("windowOpen");
        this.selectWindow(app);
    }

    makeWindowHandle(appWindow: AppWindow): HTMLElement {
        var div = document.createElement("div");
        div.className = "window-wrapper";
        var clone = <HTMLElement>document.importNode(this.template.content, true);
        div.appendChild(clone);
        return div;
    }

    selectWindow(appWindow: AppWindow) {
        this.activeWindow = appWindow;
        this.makeTopMost(appWindow);
        appWindow.show();
        this.raiseEvent("windowSelect");
    }

    makeTopMost(appWindow: AppWindow): void {
        let index = this.order.indexOf(appWindow);
        this.order.splice(index, 1);
        this.order.push(appWindow);
        this.reorderWindows();
    }

    closeWindow(app: AppWindow): void {
        this.body.removeChild(app.handle);
        this.windows.splice(this.windows.indexOf(app), 1);
        this.order.splice(this.order.indexOf(app), 1);
        this.raiseEvent("windowClose");
    }

    reorderWindows(): void {
        for (let i = 0; i < this.order.length; i++) {
            this.order[i].handle.style.zIndex = ((i + 1) * 100).toString();
        }
    }

    addEventListener(type: string, listner: any): void {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listner);
    }

    raiseEvent(type: string): void {
        if (this.events[type]) {
            for (let i = 0; i < this.events[type].length; i++) {
                this.events[type][i]();
            }
        }
        else {
            console.error("event of type: " + type + " does not exist!");
        }
    }

}

class ApplicationManager
{
    appList: Application[] = [];
    launchers: { [category: string]: Launcher[] } = { };

    laucneApplication(launcher: Launcher) {

        var temp = new launcher.mainFunction();
        this.appList.push(new Application(temp));
    }

    registerApplication(category: string, launcher: Launcher)
    {
        if (!this.launchers[category]) {
            this.launchers[category] = [];
        }
        this.launchers[category].push(launcher);
    }
}

class Application
{
    application: IApplication;
    name: string;

    constructor(app: IApplication) {
        this.application = app;
        app.application = this;
        app.main();
    }

    onClose()
    {

    }
}



class Launcher
{
    mainFunction: new () => IApplication
    name: string;

    constructor(mainFunction: new () => IApplication, name: string)
    {
        this.mainFunction = mainFunction;
        this.name = name;
    }

    createInstance()
    {
        kernel.appMan.laucneApplication(this);
    }
}

interface IApplication
{
    application: Application;
    main(): void;
}

class TestViewer implements IApplication
{
    application: Application;
    window: AppWindow;
    window2: AppWindow;
    main()
    {
        var mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");
        this.window.content.appendChild(mk.tag("h1", "", null, "Hello World"));

    }
}

class Taskbar {
}

class Applet {
    content: HTMLElement;
}

class WindowList extends Applet {
    winMan: WindowManager;
    constructor(content: HTMLElement) {
        super();
        this.content = content;
        let wm = this.winMan = kernel.winMan;
        wm.addEventListener("windowOpen", () => this.programOpen());
        wm.addEventListener("windowClose", () => this.programClose());
        wm.addEventListener("windowSelect", () => this.programSelect());
        this.addWindows();
    }

    addWindows(): void {
        this.content.innerHTML = "";

        for (let i = 0; i < this.winMan.windows.length; i++) {
            let cur = this.winMan.windows[i];
            let ctrl = document.createElement("div");
            ctrl.innerHTML = cur.title;
            ctrl.classList.add("taskbar-button-text");
            if (cur === this.winMan.activeWindow) {
                ctrl.classList.add("taskbar-button-select");
            }
            ctrl.window = cur;
            ctrl.addEventListener("mousedown", () => { this.winMan.selectWindow(cur); });
            this.content.appendChild(ctrl);
        }
    }

    programOpen(): void {
        console.log("Program Open");
        this.addWindows();
    }

    programClose(): void {
        console.log("Program Close");
        this.addWindows();
    }

    programSelect(): void {
        this.addWindows();
    }

}

class MainMenu extends Applet {
    menuHandle: MenuWindow;
    constructor(content: HTMLElement) {
        super();
        this.content = content;
        let mk = new HtmlHelper();
        this.content.appendChild(mk.tag(
            "div"
            , "taskbar-button-text"
            , [{ event: "click", func: (e: Event) => this.click_menu(<MouseEvent>e) }]
            , "Menu"
        ));
        this.menuHandle = new MenuWindow(document.body);
    }

    fillMenu(): void {
        this.menuHandle.clear();
        let all = kernel.appMan.launchers;
        let keys = Object.keys(all);
        for (let i = 0; i < keys.length; i++) {
            let cur = all[keys[i]];
            for (let j = 0; j < cur.length; j++) {
                this.menuHandle.add(cur[j], keys[i]);
            }
        }
    }

    click_menu(e: MouseEvent): void {
        this.menuHandle.hide();
        this.fillMenu();
        this.menuHandle.x = e.pageX;
        this.menuHandle.y = e.pageY;
        this.menuHandle.show();
    }
}

class MenuWindow {
    container: HTMLElement;
    x: number;
    y: number;
    items: MenuItem[] = [];
    categories: (MenuItem[])[] = [];
    content: HTMLElement;
    visible: boolean;
    selectedMenu: MenuItem;

    constructor(container: HTMLElement, x: number = 0, y: number = 0) {
        this.container = container;
        this.x = x;
        this.y = y;
        document.addEventListener("mouseup", (e: MouseEvent) => this.globalClick(e));
    }

    globalClick(e: MouseEvent): void {
        let ele = <HTMLElement>e.target;
        while (ele.parentElement != null) {
            if (ele === this.content) {
                return;
            }
            else {
                ele = ele.parentElement;
            }
        }
        this.hide();
        // console.log(e);
    }

    add(item: any, category: string = ""): void {
        let name = (item instanceof Launcher) ? (<Launcher>item).name : item.toString();
        if (category == "") {
            this.items.push(new MenuItem(name, item));
        }
        else {
            if (!this.categories[category]) {
                let miAr = []
                let mi = new MenuItem(category, miAr);
                this.items.push(mi);
                this.categories[category] = miAr;
            }
            this.categories[category].push(new MenuItem(name, item));
        }
    }

    clear(): void {
        this.items = [];
        this.categories = [];
    }

    show(): void {
        if (!this.visible) {
            let mk = new HtmlHelper();
            let div = this.content = mk.tag("div", "menu-window");
            div.style.left = this.x + "px";
            div.style.top = this.y + "px";

            div.appendChild(this.makeList(this.items, mk));
            this.container.appendChild(div);
        }
        this.visible = true;
    }

    makeList(list: MenuItem[], mk: HtmlHelper): HTMLElement {
        let ul = mk.tag("ul");
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
            let li = mk.tag("li");

            let a = <HTMLAnchorElement>mk.tag("a", "", [{
                event: "click", func: (e: Event) => {
                    e.preventDefault();
                    if (curItem.value instanceof Launcher) {
                        (<Launcher>curItem.value).createInstance();
                        this.hide();
                    }
                    else if (curItem.value instanceof Array) {
                        if (this.selectedMenu) {
                            this.selectedMenu.subMenu.style.display = "none";
                            this.selectedMenu = null;
                        }
                        curItem.subMenu.style.display = "";
                        this.selectedMenu = curItem;
                    }
                }
            }], curItem.name);
            li.appendChild(a);
            a.href = "#";
            if (curItem.value instanceof Array) {
                curItem.subMenu = this.makeList(<MenuItem[]>curItem.value, mk);
                curItem.subMenu.style.display = "none";
                li.appendChild(curItem.subMenu);
            }
            ul.appendChild(li);
        }
        return ul;
    }

    hide(): void {
        if (this.visible) {
            this.container.removeChild(this.content);
            this.content = null;
        }
        this.visible = false;
    }
}

class MenuItem {
    name: string;
    value: any;
    subMenu: HTMLElement;

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
}
