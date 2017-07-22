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

        let svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" display="block" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">	.fill{fill:#F0F0F0;}	.fill2{fill:#2a2a2a;}</style><g id="XMLID_3_">	<circle id="XMLID_1_" class="fill" cx="8.2" cy="8.2" r="7.7"/>	<circle id="XMLID_2_" class="fill2" cx="15.8" cy="15.8" r="7.7"/></g></svg>';

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
        let discon = <HTMLImageElement>this.mk.tag("img");

        discon.src = "/Icons/disconnected.png";
        discon.style.width = "20px";
        discon.style.height = "20px";
        discon.style.paddingLeft = "10px";
        discon.title = "Not connected";

        let con = <HTMLImageElement>this.mk.tag("img");
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

    telemetryStatus(): HTMLElement{

        let svg: string = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" style="enable-background:new 0 0 1000 1000;" xml:space="preserve"><style type="text/css">.lines{fill:none;stroke:#FFFFFF;stroke-width:50;stroke-miterlimit:10;}</style><g id="XMLID_53_"><g id="XMLID_17_"><g id="XMLID_34_"><path id="XMLID_37_" class="lines" d="M184.3,19.7C103.5,100.5,53.5,212.1,53.5,335.4c0,121.2,48.3,231.1,126.7,311.5"/><path id="XMLID_38_" class="lines" d="M819.8,646.9c78.4-80.5,126.7-190.3,126.7-311.5c0-123.3-50-234.9-130.8-315.7"/><path id="XMLID_82_" class="lines" d="M184.3,19.7"/><path id="XMLID_81_" class="lines" d="M815.7,19.7"/></g><g id="XMLID_6_"><path id="XMLID_83_" class="lines" d="M300.3,134.9c-51.1,51.1-82.7,121.7-82.7,199.7c0,76.7,30.6,146.2,80.1,197.1"/><path id="XMLID_40_" class="lines" d="M702.3,531.7c49.6-50.9,80.1-120.4,80.1-197.1c0-78-31.6-148.6-82.7-199.7"/><path id="XMLID_39_" class="lines" d="M300.3,134.9"/><path id="XMLID_35_" class="lines" d="M699.7,134.9"/></g></g><line id="XMLID_36_" class="lines" x1="500" y1="302.5" x2="500" y2="1000"/></g></svg>';
        let tag = this.mk.tag(
            "div"
            , "telemetry-symbol"
            , null
            , svg
        );
        tag.style.width = "20px";
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