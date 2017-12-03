interface IDataEvent<T> extends IEventData {
    data: T;
}

interface IExpandableListSection {
    title: string;
    items: IExpandableListItem[];
}

interface IExpandableListItem {
    text: string;
    object: any;
}

interface IListBoxRearrangableItem {
    mainText: string;
    infoText: string | null;
}

class Component {
    public wrapper: HTMLElement;
}

abstract class Button extends Component {

    private __disabled: boolean = false;
    set disabled(bool: boolean) {
        this.__disabled = bool;
        this.toggleDisabled();
    }

    constructor() {
        super();
        this.wrapper = document.createElement("div");
        this.wrapper.className = "comp-button";
        this.wrapper.onclick = this.onclick;
    }

    private toggleDisabled(): void {
        if (this.__disabled) {
            this.wrapper.className = "comp-button-disabled";
            this.wrapper.onclick = () => { };
        }
        else {
            this.wrapper.className = "comp-button";
            this.wrapper.onclick = this.onclick;
        }
    }

    onclick = newEvent("Button.onclick");
}

class IconButton extends Button {
    constructor() {
        super();

    }
}

class TextButton extends Button {
    private textNode: Text;

    get text(): string {
        if (this.textNode.nodeValue)
            return this.textNode.nodeValue;
        else
            throw new Error("textNode.nodeValue is null");
    }
    set text(value: string) {
        this.textNode.nodeValue = value;
    }

    constructor() {
        super();
        this.textNode = document.createTextNode("button");
        const span = document.createElement("span");
        span.appendChild(this.textNode);
        this.wrapper.appendChild(span);
    }

}

class ListBox extends Component {

    private __data: any[];
    public selector: (<T>(obj: T) => string) | null = null;

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        /*let oldPush = data.push;
        let box = this;
        data.push = function push(...items: any[]): number {
            let num = oldPush.apply(data, items);
            box.generateList();
            return num;
        }*/
        this.generateList();
    }

    onItemClick = newEvent<IDataEvent<any>>("ListBox.onItemClick");

    constructor() {
        super();
        this.wrapper = document.createElement("ul");
        this.wrapper.className = "comp-listBox";
    }

    public update() {
        this.generateList();
    }

    private generateList() {
        this.wrapper.innerHTML = "";
        for (const v of this.__data) {
            const row = document.createElement("li");

            row.onclick = () => {
                this.onItemClick(v);
            };
            let txt: string | null = null;
            if (this.selector) {
                txt = this.selector(v);
            }
            else {
                txt = (v as object).toString();
            }

            row.appendChild(document.createTextNode(txt));
            this.wrapper.appendChild(row);
        }
    }
}

interface ISwitchEvent extends IEventData {
    newValue: boolean;
}

class Switch extends Component {
    private __checked: boolean = false;
    private slider: HTMLElement;
    private text: Text;

    public onCheckedChange = newEvent<ISwitchEvent>("Switch.onCheckedChange");

    public get checked(): boolean {
        return this.__checked;
    }

    public set checked(value: boolean) {
        this.__checked = value;
        this.onCheckedChange({ target: this, newValue: value });
        this.handleCheck();
    }

    constructor() {
        super();
        this.wrapper = document.createElement("div");
        this.wrapper.className = "comp-style";

        this.slider = document.createElement("div");
        this.wrapper.appendChild(this.slider);
        this.slider.className = "comp-style-slider";
        this.text = document.createTextNode("OFF");
        this.slider.appendChild(this.text);

        this.wrapper.addEventListener("click", () => {
            this.checked = !this.checked;
        });
    }

    private handleCheck() {
        if (this.__checked) {
            this.slider.classList.add("comp-style-slider-active");
            this.text.nodeValue = "ON";
        }
        else {
            this.slider.classList.remove("comp-style-slider-active");
            this.text.nodeValue = "OFF";
        }
    }
}

class TableList extends Component {
    private __data: any[];
    private __header: string[] = [];

    public selector: (<T>(obj: T) => string[]) | null = null;

    onItemClick = newEvent<IDataEvent<any>>("TabelList.onItemClick");

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        this.generateList();
    }

    get header(): string[] {
        return this.__header;
    }
    set header(headers: string[]) {
        this.__header = headers;
        this.generateHeader();
    }

    tableHeader: HTMLTableSectionElement;
    tableBody: HTMLTableSectionElement;

    constructor() {
        super();
        this.wrapper = document.createElement("table");
        this.wrapper.className = "table selectable";
        this.tableHeader = document.createElement("thead");
        this.tableBody = document.createElement("tbody");
        this.wrapper.appendChild(this.tableHeader);
        this.wrapper.appendChild(this.tableBody);

    }

    public update() {
        this.generateList();
    }

    private generateHeader() {
        this.tableHeader.innerHTML = "";
        const tr = document.createElement("tr");
        this.tableHeader.appendChild(tr);
        for (const v of this.__header) {
            const headerItem = document.createElement("th");
            headerItem.appendChild(document.createTextNode(v));
            tr.appendChild(headerItem);
        }
    }

    private generateList() {
        this.tableBody.innerHTML = "";
        for (const v of this.__data) {
            const row = document.createElement("tr");

            row.onclick = () => {
                this.onItemClick({ target: this, data: v });
            };
            let txt: string[] = [];
            if (this.selector) {
                txt = this.selector(v);
            }
            else {
                txt = [(v as object).toString()];
            }
            for (const d of txt) {
                const cell = document.createElement("td");
                cell.appendChild(document.createTextNode(d));
                row.appendChild(cell);
            }
            this.tableBody.appendChild(row);
        }
    }
}

class ExpandableList extends Component {
    private __data: any[];
    private mk: HtmlHelper = new HtmlHelper();

    public selector: (<T>(obj: T) => IExpandableListSection) | null = null;

    onItemClick = newEvent<IDataEvent<any>>("ExpandableList.onItemClick");

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        this.generateList();
    }

    constructor() {
        super();
        this.wrapper = document.createElement("div");
        this.wrapper.className = "comp-expList";
    }

    public update() {
        this.generateList();
    }

    private generateList() {
        const mk = this.mk;
        this.wrapper.innerHTML = "";
        for (const d of this.__data) {
            const section: HTMLElement = mk.tag("div", "comp-expList-section");
            const clicker: HTMLElement = mk.tag("div", "comp-expList-clicker");
            const collapsible: HTMLElement = mk.tag("div", "comp-expList-collapsible");
            collapsible.style.maxHeight = "0px";
            const list: HTMLElement = document.createElement("ul");

            this.wrapper.appendChild(section);
            section.appendChild(clicker);
            section.appendChild(collapsible);
            collapsible.appendChild(list);

            let title: string;
            let items: IExpandableListItem[] = [];
            if (this.selector) {
                title = this.selector(d).title;
                items = this.selector(d).items;
            }
            else {
                title = (d as object).toString();
            }

            clicker.appendChild(document.createTextNode(title));
            for (const i of items) {
                const li: HTMLElement = document.createElement("li");
                li.appendChild(document.createTextNode(i.text));
                list.appendChild(li);

                li.onclick = () => {
                    this.onItemClick({ target: this, data: i.object });
                };
            }

            clicker.onclick = () => {
                const contentHeight: number = collapsible.scrollHeight;
                collapsible.style.maxHeight = collapsible.style.maxHeight === "0px" ? contentHeight + "px" : "0px";
            };
        }
    }
}

class ListBoxRearrangable extends Component {

    private __data: any[];
    private __rowInfoMarkers: string[] | null;
    public selector: (<T>(obj: T) => IListBoxRearrangableItem) | null = null;

    get data(): any[] {
        return this.__data;
    }
    set data(data: any[]) {
        this.__data = data;
        this.generateList();
    }

    get rowInfoMarkers(): string[] | null {
        return this.__rowInfoMarkers || null;
    }
    set rowInfoMarkers(rims: string[] | null) {
        this.__rowInfoMarkers = rims;
        this.generateList();
    }

    onItemClick = newEvent<IDataEvent<any>>("ListBoxRearrangable.onItemClick");
    onItemRemove = newEvent<IDataEvent<any>>("ListBoxRearrangable.onItemRemove");
    onItemRearrange = newEvent<IDataEvent<any>>("ListBoxRearrangable.onItemRearrange");

    private mk: HtmlHelper = new HtmlHelper();

    constructor() {
        super();
        this.wrapper = document.createElement("ul");
        this.wrapper.className = "comp-listBoxRearr";
    }

    public update() {
        this.generateList();
    }

    private generateList() {
        const mk = this.mk;
        this.wrapper.innerHTML = "";
        if (this.__data) {
            for (let i: number = 0; i < this.__data.length; i++) {
                const row = document.createElement("li");

                let marker: HTMLElement | null = null;
                if (this.__rowInfoMarkers) {
                    marker = mk.tag("div", "comp-listBoxRearr-marker");
                }

                const textWrapper = mk.tag("div", "comp-listBoxRearr-textWrapper");
                const mainSpan = mk.tag("span");
                const infoSpan = mk.tag("span");

                const iconWrapper = mk.tag("div", "comp-listBoxRearr-icons");
                const arrUp = mk.tag("span", "comp-listBoxRearr-icon");
                const arrDown = mk.tag("span", "comp-listBoxRearr-icon");
                const remove = mk.tag("span", "comp-listBoxRearr-icon");

                arrUp.innerHTML = "&#8593;";
                arrDown.innerHTML = "&#8595;";
                remove.innerHTML = "&#10005;";

                textWrapper.appendChild(mainSpan);
                textWrapper.appendChild(infoSpan);

                iconWrapper.appendChild(arrUp);
                iconWrapper.appendChild(arrDown);
                iconWrapper.appendChild(remove);

                if (marker) {
                    row.appendChild(marker);
                }
                row.appendChild(textWrapper);
                row.appendChild(iconWrapper);

                if (this.__rowInfoMarkers) {
                    if (i < this.__rowInfoMarkers.length && marker) {
                        marker.appendChild(document.createTextNode(this.__rowInfoMarkers[i]));
                    }
                }

                let mainTxt: string;
                let infoTxt: string | null = null;
                if (this.selector) {
                    const item = this.selector(this.__data[i]);
                    mainTxt = item.mainText;
                    infoTxt = item.infoText || null;
                }
                else {
                    mainTxt = (this.__data[i] as object).toString();
                }

                mainSpan.appendChild(document.createTextNode(mainTxt));
                if (infoTxt) infoSpan.appendChild(document.createTextNode(infoTxt));

                this.wrapper.appendChild(row);

                remove.onclick = () => {
                    const temp = this.__data[i];
                    this.__data.splice(i, 1);

                    this.onItemRemove({ target: this, data: temp });

                    this.generateList();
                };

                arrUp.onclick = () => {
                    if (i > 0) {
                        const temp = this.__data[i];
                        this.__data[i] = this.__data[i - 1];
                        this.__data[i - 1] = temp;

                        this.onItemRearrange({ target: this, data: temp });

                        this.generateList();
                    }
                };

                arrDown.onclick = () => {
                    if (i < this.__data.length - 1) {
                        const temp = this.__data[i];
                        this.__data[i] = this.__data[i + 1];
                        this.__data[i + 1] = temp;

                        this.onItemRearrange({ target: this, data: temp });

                        this.generateList();
                    }
                };
            }
        }
    }
}

class TempDataSourceList extends Component {

    private mk: HtmlHelper = new HtmlHelper();
    private sensorTable: HTMLElement;
    private plot: IViewerBase<any>;

    constructor(plot: IViewerBase<any>) {
        super();

        this.plot = plot;

        const info: Array<IDataSource<any>> = kernel.senMan.getDataSources(plot.type);

        this.sensorTable = this.mk.tag("div");
        //this.sensorTable.style.minWidth = "200px";
        this.sensorTable.style.flexGrow = "1";
        this.sensorTable.style.overflowY = "auto";

        this.wrapper = this.mk.tag("div");
        this.wrapper.appendChild(this.sensorTable);

        if (sensys.SensorManager.isViewer(plot)) {
            this.drawSingleSensors(plot as IViewer<any>, info);
        }
        else if (sensys.SensorManager.isCollectionViewer(plot)) {
            this.drawMultiSensors(plot as ICollectionViewer<any>, info);
        }
    }

    public update(): void {
        const info: Array<IDataSource<any>> = kernel.senMan.getDataSources(this.plot.type);

        if (sensys.SensorManager.isViewer(this.plot)) {
            this.drawSingleSensors(this.plot as IViewer<any>, info);
        }
        else if (sensys.SensorManager.isCollectionViewer(this.plot)) {
            this.drawMultiSensors(this.plot as ICollectionViewer<any>, info);
        }
    }

    private drawSingleSensors(plot: IViewer<any>, info: Array<IDataSource<any>>) {
        this.drawSensors<IViewer<any>>(plot, info, this.createSingleSensor);
    }

    private drawMultiSensors(plot: ICollectionViewer<any>, info: Array<IDataSource<any>>) {
        this.drawSensors<ICollectionViewer<any>>(plot, info, this.createMultiSensor);
    }

    private createSingleSensor(plot: IViewer<any>, sensor: IDataSource<any>): HTMLElement {
        const radio = this.mk.tag("input") as HTMLInputElement;
        radio.type = "radio";
        radio.name = "sensor";
        if (plot.dataSource && plot.dataSource === sensor) {
            radio.checked = true;
        }
        radio.addEventListener("change", (e: Event) => {
            radio.disabled = true;
            console.log("Single checkbox click");
            plot.dataSource = sensor;
            if (sensor.length() == 0) {
                kernel.senMan.fillDataSource(sensor, () => {
                    plot.dataUpdate();
                    radio.disabled = false;
                });
            }
            else {
                plot.dataUpdate();
                radio.disabled = false;
            }

        });
        return radio;
    }

    private createMultiSensor(plot: ICollectionViewer<any>, sensor: IDataSource<any>): HTMLElement {
        const checkBox = this.mk.tag("input") as HTMLInputElement;
        checkBox.type = "checkbox";
        for (let i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i] === sensor) {
                checkBox.checked = true;
                break;
            }
        }

        checkBox.addEventListener("change", (e: Event) => {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                plot.dataCollectionSource.push(sensor);
                if (sensor.length() == 0) {
                    kernel.senMan.fillDataSource(sensor, () => {
                        plot.dataUpdate();
                        checkBox.disabled = false;
                    });
                }
                else {
                    plot.dataUpdate();
                    checkBox.disabled = false;
                }
            }
            else {
                for (let i = 0; i < plot.dataCollectionSource.length; i++) {
                    if (plot.dataCollectionSource[i] === sensor) {
                        plot.dataCollectionSource.splice(i, 1);
                        plot.dataUpdate();
                        checkBox.disabled = false;
                        break;
                    }
                }
            }
        });
        return checkBox;
    }

    drawSensors<T extends IViewerBase<any>>(plot: T, info: Array<IDataSource<any>>, drawMethod: (plot: T, sensor: IDataSource<any>) => HTMLElement) {
        this.sensorTable.innerHTML = "";
        for (let i = 0; i < info.length; i++) {
            const sensor = info[i];
            const ctrl = drawMethod.call(this, plot, sensor);
            const label = this.mk.tag("label", "listitem");
            const firstInfo = sensor.infos.SensorInfos[0];
            label.title = firstInfo.ID.toString() + " (0x" + firstInfo.ID.toString(16) + ") " + (firstInfo.Key.toString() === firstInfo.Key ? firstInfo.Key : " No key found");
            if (firstInfo.ID.toString() === firstInfo.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            const innerBox = this.mk.tag("div");
            innerBox.style.display = "inline-block";
            innerBox.style.verticalAlign = "middle";
            innerBox.appendChild(this.mk.tag("div", "", null, firstInfo.Name));
            innerBox.appendChild(this.mk.tag("div", "small", null, firstInfo.SensorSet.Name));
            label.appendChild(innerBox);
            //label.appendChild(document.createTextNode((sensor.Key ? "" : "(" + sensor.ID.toString() + ") ") + sensor.Name));
            //label.appendChild(document.createTextNode(firstInfo.Name));
            this.sensorTable.appendChild(label);
            //this.sensorTable.appendChild(this.mk.tag("br"));
        }
    }

}


class Canvas extends Component {

    private __canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private mk: HtmlHelper = new HtmlHelper();
    private dprAdjust: boolean;

    get canvas(): HTMLCanvasElement { return this.__canvas; }
    get context(): CanvasRenderingContext2D { return this.ctx; }

    set height(height: number) {
        if (this.dprAdjust) {
            this.__canvas.height = height * devicePixelRatio;
            this.__canvas.style.height = height + "px";
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        else this.__canvas.height = height
    }
    get height() { return this.__canvas.height; }

    set width(width: number) {
        if (this.dprAdjust) {
            this.__canvas.width = width * devicePixelRatio;
            this.__canvas.style.width = width + "px";
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        else this.__canvas.width = width
    }
    get width() { return this.__canvas.height; }

    set fillStyle(fillStyle: string) { this.ctx.fillStyle = fillStyle; }
    set strokeStyle(strokeStyle: string) { this.ctx.strokeStyle = strokeStyle; }
    set lineWidth(lineWidth: number) { this.ctx.lineWidth = lineWidth; }
    set textBaseline(textBaseline: string) { this.ctx.textBaseline = textBaseline; }
    set textAlign(textAlign: string) { this.ctx.textAlign = textAlign; }
    set font(font: string) { this.ctx.font = font; }
    set lineCap(lineCap: string) { this.ctx.lineCap = lineCap; }

    constructor(adjustForPixelRatio?: boolean) {
        super();
        this.dprAdjust = adjustForPixelRatio || true;
        this.__canvas = this.mk.tag("canvas") as HTMLCanvasElement;
        this.wrapper = this.mk.tag("div", "comp-canvas");
        this.wrapper.appendChild(this.__canvas);

        const tempContext = this.__canvas.getContext("2d");
        if (tempContext) {
            this.ctx = tempContext;
        }
        else {
            console.error("Context not defined error");
        }
    }

    public fill() {
        this.ctx.fill();
    }
    public moveTo(x: number, y: number): void {
        const newX: number = Math.floor(x) + 0.5;
        const newY: number = Math.floor(y) + 0.5;
        this.ctx.moveTo(newX, newY);
    }
    public lineTo(x: number, y: number): void {
        const newX: number = Math.floor(x) + 0.5;
        const newY: number = Math.floor(y) + 0.5;
        this.ctx.lineTo(newX, newY);
    }
    public clear(): void {
        this.ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
    }
    public beginPath(): void {
        this.ctx.beginPath();
    }
    public closePath(): void {
        this.ctx.closePath();
    }
    public stroke(): void {
        this.ctx.stroke();
    }
    public fillText(text: string, x: number, y: number, maxWidth?: number): void {
        if (maxWidth) {
            this.ctx.fillText(text, Math.floor(x) + 0.5, Math.floor(y) + 0.5, maxWidth);
        }
        else {
            this.ctx.fillText(text, Math.floor(x) + 0.5, Math.floor(y) + 0.5);
        }
    }
    public fillRect(x: number, y: number, width: number, height: number): void {
        const newX: number = Math.floor(x);
        const newY: number = Math.floor(y);
        const newWidth: number = Math.floor(width);
        const newHeight: number = Math.floor(height);
        this.ctx.fillRect(newX, newY, newWidth, newHeight);
    }
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
        radius = radius < 0 ? 0 : radius;
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }
    public measureText(text: string): number {
        return this.ctx.measureText(text).width;
    }
    public translate(x: number, y: number): void {
        this.ctx.translate(x, y);
    }
    public rotate(angle: number): void {
        this.ctx.rotate(angle);
    }
    public drawImage(image: Canvas, dstX: number, dstY: number): void {
        this.ctx.drawImage(image.canvas, dstX, dstY);
    }
    public setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {
        this.ctx.setTransform(m11, m12, m21, m22, dx, dy);
    }
    public rect(x: number, y: number, w: number, h: number): void {
        this.ctx.rect(x, y, w, h);
    }
    public getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
        return this.ctx.getImageData(sx, sy, sw * devicePixelRatio, sh * devicePixelRatio );
    }
    public putImageData(imageData: ImageData, dx: number, dy: number): void {
        this.ctx.putImageData(imageData, dx * devicePixelRatio, dy * devicePixelRatio );
    }
}

class LayeredCanvas extends Component {
    private canvases: Canvas[] = [];
    private mk: HtmlHelper = new HtmlHelper();

    get width(): number {
        if (this.canvases.length > 0) {
            return this.canvases[0].width;
        }
        return -1;
    }
    get height(): number {
        if (this.canvases.length > 0) {
            return this.canvases[0].height;
        }
        return -1;
    }

    constructor() {
        super();
        this.wrapper = this.mk.tag("div", "comp-layeredCanvas");
    }

    public addCanvas(): Canvas {
        const canvas = new Canvas();
        this.wrapper.appendChild(canvas.wrapper);
        this.canvases.push(canvas);
        return canvas;
    }

    public setSize(width: number, height: number): void {
        for (const c of this.canvases) {
            c.width = width;
            c.height = height;
        }
    }
}