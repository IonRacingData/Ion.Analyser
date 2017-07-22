let selectedSpan: HTMLSpanElement | null = null;

interface IEventTag {
    event: string;
    func: (e: Event) => void;
}

/* tslint:disable:interface-name */
interface HTMLSpanElement {
    deltaX: number;
    deltaY: number;
}
/* tslint:enable:interface-name */

class HtmlHelper {
    tag(tag: string, className: any = "", events: IEventTag[] | null = null, innerHTML: string = ""): HTMLElement {
        return HtmlHelper.tag(tag, className, events, innerHTML);
    }

    static tag(tag: string, className: any = "", events: IEventTag[] | null = null, innerHTML: string = ""): HTMLElement {
        const temp: HTMLElement = document.createElement(tag);
        temp.className = className;
        temp.innerHTML = innerHTML;
        if (events != null) {
            for (let i: number = 0; i < events.length; i++) {
                temp.addEventListener(events[i].event, events[i].func);
            }
        }
        return temp;
    }
}

class HtmlTableGen {
    header: string[] = [];
    rows: any[][] = [];
    className: string;
    resizeable: boolean = false;

    constructor(className: string = "", resizeable: boolean = false) {
        this.className = className;
        this.resizeable = resizeable;
    }

    addHeader(...fields: string[]): void {
        this.header = fields;
    }

    addRow(...columns: any[]): void {
        this.rows.push(columns);
    }

    addArrayRow(row: string[]): void {
        this.rows.push(row);
    }

    addArray<T>(data: T[], keys: string[] | null = null, check: ((value: T) => boolean) | null = null): void {
        if (check == null) {
            check = (value: T) => true;
        }
        for (let i: number = 0; i < data.length; i++) {
            const row: string[] = [];
            if (keys == null) {
                keys = Object.keys(data[i]);
            }
            if (check(data[i])) {
                for (let j: number = 0; j < keys.length; j++) {
                    row.push(data[i][keys[j]]);
                }
                this.addArrayRow(row);
            }
        }
    }

    generate(): HTMLElement {
        const table: HTMLElement = document.createElement("table");
        if (this.className != null) {
            table.className = this.className;
        }

        if (this.header.length > 0) {
            const thead: HTMLElement = document.createElement("thead");
            const headerRow: HTMLTableRowElement = document.createElement("tr");
            for (let i: number = 0; i < this.header.length; i++) {
                const header: HTMLTableHeaderCellElement = document.createElement("th");
                header.innerHTML = this.header[i];
                headerRow.appendChild(header);
                if (this.resizeable) {
                    const span: HTMLSpanElement = document.createElement("span");
                    span.className = "table-resize";
                    span.addEventListener("mousedown", (e: MouseEvent) => {
                        if (span.parentElement === null) {
                            throw new Error("Parent null exception");
                        }
                        span.deltaX = span.parentElement.offsetWidth - e.pageX;
                        selectedSpan = span;
                    });
                    header.appendChild(span);
                }
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
        }
        const rows: any[][] = this.rows;
        const tbody: HTMLElement = document.createElement("tbody");
        table.appendChild(tbody);
        for (let row: number = 0; row < rows.length; row++) {
            const curRow: any[] = rows[row];
            const rowEle: HTMLTableRowElement = document.createElement("tr");
            for (let col: number = 0; col < curRow.length; col++) {
                if (Array.isArray(this.rows[row][col])) {
                    for (let i: number = 0; i < this.rows[row][col].length; i++) {
                        if (this.rows[row][col][i].event != null) {
                            rowEle.addEventListener(this.rows[row][col][i].event, this.rows[row][col][i].func);
                        }
                        else if (this.rows[row][col][i].field != null) {
                            rowEle[this.rows[row][col][i].field] = this.rows[row][col][i].data;
                        }
                    }
                }
                else {
                    const colEle: HTMLTableDataCellElement = document.createElement("td");
                    colEle.innerHTML = this.rows[row][col];
                    rowEle.appendChild(colEle);
                }
            }
            tbody.appendChild(rowEle);
        }
        return table;
    }
}
