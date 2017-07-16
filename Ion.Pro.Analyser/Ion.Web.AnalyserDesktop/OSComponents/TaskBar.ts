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
        winMan.onWindowOpen.addEventListener(() => this.programOpen());
        winMan.onWindowClose.addEventListener(() => this.programClose());
        winMan.onWindowSelect.addEventListener(() => this.programSelect());
        winMan.onWindowUpdate.addEventListener(() => this.windowUpdate());
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
            if (keys[i] === "hidden")
                continue;
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
        this.content.style.verticalAlign = "top";
        let mk: HtmlHelper = new HtmlHelper();

        let svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.st0{fill:#F0F0F0;}	.st1{fill:#2a2a2a;}</style><g id="XMLID_3_">	<circle id="XMLID_1_" class="st0" cx="8.2" cy="8.2" r="7.7"/>	<circle id="XMLID_2_" class="st1" cx="15.8" cy="15.8" r="7.7"/></g></svg>';

        this.content.appendChild(mk.tag(
            "div"
            , "btn-themechange"
            , [{ event: "click", func: (e: Event): void => this.click_theme(<MouseEvent>e) }]
            , svg
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
    private discon: HTMLImageElement;
    private con: HTMLImageElement;

    constructor(content: HTMLElement) {
        super();
        this.content = content;
        this.content.style.cssFloat = "right";
        this.content.style.padding = "10px";
        let mk: HtmlHelper = new HtmlHelper();

        this.discon = <HTMLImageElement>mk.tag("img");
        this.discon.src = "/icons/disconnected.png";
        this.discon.style.width = "20px";
        this.discon.style.height = "20px";
        this.content.title = "Not connected";

        this.con = <HTMLImageElement>mk.tag("img");
        this.con.src = "/icons/connected.png";
        this.con.style.width = "20px";
        this.con.style.height = "20px";
        this.con.style.display = "none";
        this.content.title = "Connected";

        this.content.appendChild(this.discon);
        this.content.appendChild(this.con);

        if (kernel.netMan.connectionOpen) {
            this.con.style.display = "inherit";
            this.discon.style.display = "none";
        }
        kernel.netMan.onGotConnection.addEventListener(() => {            
            this.con.style.display = "inherit";
            this.discon.style.display = "none";
        });
        kernel.netMan.onLostConnection.addEventListener(() => {
            this.discon.style.display = "inherit";
            this.con.style.display = "none";
        });
    }
}