var selectedSpan: HTMLSpanElement = null;

interface IEventTag {
    event: string;
    func: (e: Event) => void;
}

interface HTMLSpanElement {
    deltaX: number;
    deltaY: number;
}

class HtmlHelper {
    tag(tag: string, className: any = "", events: IEventTag[] = null, innerHTML: string = ""): HTMLElement {
        return HtmlHelper.tag(tag, className, events, innerHTML);
    }

    static tag(tag: string, className: any = "", events: IEventTag[] = null, innerHTML: string = ""): HTMLElement {
        let temp: HTMLElement = document.createElement(tag);
        temp.className = className;
        temp.innerHTML = innerHTML;
        if (events != null) {
            for (var i: number = 0; i < events.length; i++) {
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

    addArray<T>(data: T[], keys: string[] = null, check: (value: T) => boolean = null): void {
        if (check == null) {
            check = (value: T) => { return true; };
        }
        for (var i: number = 0; i < data.length; i++) {
            let row: string[] = [];
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
        var table: HTMLElement = document.createElement("table");
        if (this.className != null) {
            table.className = this.className;
        }

        if (this.header.length > 0) {
            var thead: HTMLElement = document.createElement("thead");
            var headerRow: HTMLTableRowElement = document.createElement("tr");
            for (var i: number = 0; i < this.header.length; i++) {
                var header: HTMLTableHeaderCellElement = document.createElement("th");
                header.innerHTML = this.header[i];
                headerRow.appendChild(header);
                if (this.resizeable) {
                    let span: HTMLSpanElement = document.createElement("span");
                    span.className = "table-resize";
                    span.addEventListener("mousedown", (e: MouseEvent) => {
                        span.deltaX = span.parentElement.offsetWidth - e.pageX;
                        selectedSpan = span;
                    });
                    header.appendChild(span);
                }
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
        }
        var rows: any[][] = this.rows;
        for (var row: number = 0; row < rows.length; row++) {
            var curRow: any[] = rows[row];
            var rowEle: HTMLTableRowElement = document.createElement("tr");
            for (var col: number = 0; col < curRow.length; col++) {
                if (Array.isArray(this.rows[row][col])) {
                    for (var i: number = 0; i < this.rows[row][col].length; i++) {
                        if (this.rows[row][col][i].event != null) {
                            rowEle.addEventListener(this.rows[row][col][i].event, this.rows[row][col][i].func);
                        }
                        else if (this.rows[row][col][i].field != null) {
                            rowEle[this.rows[row][col][i].field] = this.rows[row][col][i].data;
                        }
                    }
                }
                else {
                    var colEle: HTMLTableDataCellElement = document.createElement("td");
                    colEle.innerHTML = this.rows[row][col];
                    rowEle.appendChild(colEle);
                }
            }
            table.appendChild(rowEle);
        }
        return table;
    }
}