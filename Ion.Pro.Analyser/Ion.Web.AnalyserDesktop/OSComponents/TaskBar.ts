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
        const winMan: WindowManager = this.winMan = kernel.winMan;
        winMan.onWindowOpen.addEventListener(() => this.programOpen());
        winMan.onWindowClose.addEventListener(() => this.programClose());
        winMan.onWindowSelect.addEventListener(() => this.programSelect());
        winMan.onWindowUpdate.addEventListener(() => this.windowUpdate());
        this.addWindows();
    }

    addWindows(): void {
        this.content.innerHTML = "";

        for (let i: number = 0; i < this.winMan.windows.length; i++) {
            const cur: AppWindow = this.winMan.windows[i];

            if (cur.showTaskbar) {
                const ctrl: HTMLDivElement = document.createElement("div");
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
        const mk: HtmlHelper = new HtmlHelper();
        this.content.appendChild(mk.tag(
            "div"
            , "taskbar-button-text"
            , [{ event: "click", func: (e: Event): void => this.click_menu(e as MouseEvent) }]
            , "Menu",
        ));
        this.menuHandle = new MenuWindow(document.body);
    }

    fillMenu(): void {
        this.menuHandle.clear();
        const all: { [category: string]: Launcher[] } = kernel.appMan.launchers;
        const keys: string[] = Object.keys(all);
        for (let i: number = 0; i < keys.length; i++) {
            if (keys[i] === "hidden")
                continue;
            const cur: Launcher[] = all[keys[i]];
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

class SlidingMenu extends Applet {
    private menuWrapper: HTMLElement;
    private touchArea: HTMLElement;
    private mk: HtmlHelper = new HtmlHelper();
    private touchX: number = 0;
    private width: number = 220;
    private touchWidth: number = 10;
    private transition: string = "left 0.2s";
    private menuOpen: boolean = false;

    constructor(content: HTMLElement) {
        super();
        this.content = content;
        this.content.style.verticalAlign = "top";
        const svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke:#dbdbdb;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;}</style><g id="XMLID_226_">	<line id="XMLID_229_" class="st0" x1="2.9" y1="5" x2="21.1" y2="5"/>	<line id="XMLID_228_" class="st0" x1="2.9" y1="12" x2="21.1" y2="12"/>	<line id="XMLID_227_" class="st0" x1="2.9" y1="19" x2="21.1" y2="19"/></g></svg>';
        this.content.appendChild(this.mk.tag(
            "div"
            , "btn-taskbar"
            , [{ event: "click", func: (): void => this.btn_click() }]
            , svg
        ));

        this.menuWrapper = this.mk.tag("div", "slidingMenu-wrapper");
        this.menuWrapper.style.left = -this.width + "px";
        this.menuWrapper.style.width = this.width + "px";
        this.menuWrapper.style.transition = this.transition;

        this.touchArea = this.mk.tag("div", "slidingMenu-touchArea");

        this.touchArea.addEventListener("touchstart", (e) => { this.touchStart(e) });
        this.touchArea.addEventListener("touchmove", (e) => { this.touchMove(e) });
        this.touchArea.addEventListener("touchend", (e) => { this.touchEnd(e) });
        this.menuWrapper.addEventListener("touchstart", (e) => { this.touchStart(e) });
        this.menuWrapper.addEventListener("touchmove", (e) => { this.touchMove(e) });
        this.menuWrapper.addEventListener("touchend", (e) => { this.touchEnd(e) });

        this.touchArea.addEventListener("click", () => {
            if (this.menuOpen) {
                this.close();
            }
        });

        document.body.appendChild(this.menuWrapper);
        document.body.appendChild(this.touchArea);
        this.fillMenu();
    }

    private fillMenu(): void {
        const menuList: MenuList = new MenuList();
        this.menuWrapper.appendChild(menuList.wrapper);

        const all: { [category: string]: Launcher[] } = kernel.appMan.launchers;
        if (all['hidden']) delete all['hidden'];
        
        let data: [string, Launcher[]][] = [];
        for (const key in all) {
            data.push([key, all[key]]);
        }

        menuList.selector = (category: [string, Launcher[]]) => {
            const launchers = category[1];
            const items: IListGroupItems[] = [];

            for (const l of launchers) {
                items.push({ text: l.name, object: l });
            }

            return {
                title: category[0],
                items: items
            } as IListGroup;
        }

        menuList.data = data;
        menuList.onItemClick.addEventListener((e) => {
            e.data.createInstance();
            this.close();
        });
        
    }

    private btn_click(): void {
        if (this.menuOpen) this.close();
        else this.open();
    }

    private open(): void {
        this.menuWrapper.style.left = "0";
        this.touchArea.style.width = "100%";
        this.menuOpen = true;
    }
    private close(): void {
        this.menuWrapper.style.left = -this.width + "px";
        this.touchArea.style.width = this.touchWidth + "px";
        this.menuOpen = false;
    }

    private touchStart(e: TouchEvent): void {
        this.touchX = e.touches[0].clientX;
        this.menuWrapper.style.transition = "";
        this.touchArea.style.width = "100%";
    }
    private touchMove(e: TouchEvent): void {
        const clientX = e.touches[0].clientX;
        const dx = clientX - this.touchX;
        
        let newPos: number = this.menuOpen ? dx : -this.width + dx;
        if (newPos > 0) newPos = 0;
        if (newPos < -this.width) newPos = -this.width;
        this.menuWrapper.style.left = newPos + "px";
    }
    private touchEnd(e: TouchEvent): void {
        this.menuWrapper.style.transition = this.transition;
        const limit: number = this.width / 3;
        if (this.menuOpen) {
            if (this.menuWrapper.offsetLeft < 0 - limit) this.close();
            else this.open();
        }
        else {
            if (this.menuWrapper.offsetLeft < -this.width + limit) this.close();
            else this.open();
        }
        if (!this.menuOpen) this.touchArea.style.width = this.touchWidth + "px";
    }
}

class ChangeTheme extends Applet {
    constructor(content: HTMLElement) {
        super();
        this.content = content;
        this.content.style.verticalAlign = "top";
        const mk: HtmlHelper = new HtmlHelper();

        const svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.fill{fill:#F0F0F0;}	.fill2{fill:#2a2a2a;}</style><g id="XMLID_3_">	<circle id="XMLID_1_" class="fill" cx="8.2" cy="8.2" r="7.7"/>	<circle id="XMLID_2_" class="fill2" cx="15.8" cy="15.8" r="7.7"/></g></svg>';

        this.content.appendChild(mk.tag(
            "div"
            , "btn-taskbar"
            , [{ event: "click", func: (e: Event): void => this.click_theme(e as MouseEvent) }]
            , svg,
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
    private con: HTMLImageElement;
    private mk: HtmlHelper = new HtmlHelper();

    constructor(content: HTMLElement) {
        super();
        this.content = content;
        this.content.style.cssFloat = "right";
        this.content.style.padding = "10px";
        this.content.style.height = "20px";

        // telemetry connection symbol
        this.content.appendChild(this.telemetryStatus());

        // server connection symbol
        const discon = this.mk.tag("img") as HTMLImageElement;

        discon.src = "/Icons/disconnected.png";
        discon.style.width = "20px";
        discon.style.height = "20px";
        discon.style.paddingLeft = "10px";
        discon.title = "Not connected";

        const con = this.mk.tag("img") as HTMLImageElement;
        con.src = "/Icons/connected.png";
        con.style.width = "20px";
        con.style.height = "20px";
        con.style.paddingLeft = "10px";

        con.style.display = "none";
        con.title = "Connected";

        this.content.appendChild(discon);
        this.content.appendChild(con);

        if (kernel.netMan.connectionOpen) {
            con.style.display = "inline-block";
            discon.style.display = "none";
        }
        kernel.netMan.onGotConnection.addEventListener(() => {
            con.style.display = "inline-block";
            discon.style.display = "none";
        });
        kernel.netMan.onLostConnection.addEventListener(() => {
            discon.style.display = "inherit";
            con.style.display = "none";
        });
    }

    telemetryStatus(): HTMLElement {
        const svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 20" style="enable-background:new 0 0 20 20;" xml:space="preserve"><style type="text/css">.lines{fill:none;stroke:#FFFFFF;stroke-miterlimit:10;}</style><g id="XMLID_63_"><g id="XMLID_65_"><g id="XMLID_71_"><path id="XMLID_75_" class="lines" d="M3.6,0.2C2,1.9,1,4.1,1,6.6c0,2.4,1,4.7,2.6,6.3"/><path id="XMLID_74_" class="lines" d="M16.4,12.9C18,11.3,19,9,19,6.6c0-2.5-1-4.7-2.6-6.4"/><path id="XMLID_73_" class="lines" d="M3.6,0.2"/><path id="XMLID_72_" class="lines" d="M16.4,0.2"/></g><g id="XMLID_66_"><path id="XMLID_70_" class="lines" d="M6,2.6c-1,1-1.7,2.5-1.7,4c0,1.5,0.6,2.9,1.6,4"/><path id="XMLID_69_" class="lines" d="M14.1,10.6c1-1,1.6-2.4,1.6-4c0-1.6-0.6-3-1.7-4"/><path id="XMLID_68_" class="lines" d="M6,2.6"/><path id="XMLID_67_" class="lines" d="M14,2.6"/></g></g><line id="XMLID_64_" class="lines" x1="10" y1="5.9" x2="10" y2="20"/></g></svg>';
        const tag = this.mk.tag(
            "div"
            , "telemetry-symbol"
            , null
            , svg,
        );
        tag.style.width = "19px";
        tag.style.height = "20px";
        tag.style.display = "none";
        if (kernel.senMan.telemetryReceiving) {
            tag.style.display = "inline-block";
        }

        kernel.senMan.ontelemetry.addEventListener(() => {
            if (kernel.senMan.telemetryReceiving) {
                tag.style.display = "inline-block";
            } else {
                tag.style.display = "none";
            }
        });
        //tag.style.padding = "10px";

        return tag;
    }
}
