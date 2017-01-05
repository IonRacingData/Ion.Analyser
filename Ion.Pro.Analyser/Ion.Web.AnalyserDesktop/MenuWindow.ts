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
