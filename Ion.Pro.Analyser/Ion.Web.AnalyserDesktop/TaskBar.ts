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
        let winMan: WindowManager = this.winMan = kernel.winMan;
        winMan.addEventListener(WindowManager.event_windowOpen, () => this.programOpen());
        winMan.addEventListener(WindowManager.event_windowClose, () => this.programClose());
        winMan.addEventListener(WindowManager.event_windowSelect, () => this.programSelect());
        winMan.addEventListener(WindowManager.event_windowUpdate, () => this.windowUpdate());
        this.addWindows();
    }

    addWindows(): void {
        this.content.innerHTML = "";

        for (let i: number = 0; i < this.winMan.windows.length; i++) {
            let cur: AppWindow = this.winMan.windows[i];

            if (cur.showTaskbar) {
                let ctrl: HTMLDivElement = document.createElement("div");
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
    }

    windowUpdate(): void {
        console.log("Window update");
        this.addWindows();
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
        let mk: HtmlHelper = new HtmlHelper();
        this.content.appendChild(mk.tag(
            "div"
            , "taskbar-button-text"
            , [{ event: "click", func: (e: Event): void => this.click_menu(<MouseEvent>e) }]
            , "Menu"
        ));
        this.menuHandle = new MenuWindow(document.body);
    }

    fillMenu(): void {
        this.menuHandle.clear();
        let all: { [category: string]: Launcher[] } = kernel.appMan.launchers;
        let keys: string[] = Object.keys(all);
        for (let i: number = 0; i < keys.length; i++) {
            let cur: Launcher[] = all[keys[i]];
            for (let j: number = 0; j < cur.length; j++) {
                this.menuHandle.add(cur[j], keys[i]);
            }
        }
    }

    click_menu(e: MouseEvent): void {
        this.menuHandle.hide();
        this.fillMenu();
        // this.menuHandle.x = e.pageX;
        // this.menuHandle.y = e.pageY;
        this.menuHandle.x = 0;
        this.menuHandle.y = 40;
        this.menuHandle.show();
    }
}

class ChangeTheme extends Applet {
    constructor(content: HTMLElement) {
        super();
        this.content = content;
        let mk: HtmlHelper = new HtmlHelper();
        this.content.appendChild(mk.tag(
            "div"
            , "taskbar-button-text"
            , [{ event: "click", func: (e: Event): void => this.click_theme(<MouseEvent>e) }]
            , "Theme"
        )); 
    }
    private isDark: boolean = true;

    public click_theme(e: MouseEvent): void {
        if (this.isDark) {
            kernel.winMan.changeTheme("app-style");
            this.isDark = false;
        }
        else {
            kernel.winMan.changeTheme("app-style-dark");
            this.isDark = true;
        }
    }
}

class StatusBar extends Applet {
    private element: HTMLElement;
    constructor(content: HTMLElement) {
        super();
        this.content = content;
        this.content.style.cssFloat = "right";
        let mk: HtmlHelper = new HtmlHelper();
        this.content.appendChild(this.element = mk.tag(
            "div"
            , "taskbar-item"
            , []
            , "Not connected"
        ));
        if (kernel.netMan.connectionOpen) {
            this.element.innerHTML = "Connected";
        }
        kernel.netMan.manager.addEventListener(NetworkManager.event_gotConnection, () => {
            this.element.innerHTML = "Connected";
        });
        kernel.netMan.manager.addEventListener(NetworkManager.event_lostConnection, () => {
            this.element.innerHTML = "Not connected";
        });
    }
}