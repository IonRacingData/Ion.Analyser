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