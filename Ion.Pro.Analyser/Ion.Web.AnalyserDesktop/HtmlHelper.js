var selectedSpan = null;
/* tslint:enable:interface-name */
var HtmlHelper = (function () {
    function HtmlHelper() {
    }
    HtmlHelper.prototype.tag = function (tag, className, events, innerHTML) {
        if (className === void 0) { className = ""; }
        if (events === void 0) { events = null; }
        if (innerHTML === void 0) { innerHTML = ""; }
        return HtmlHelper.tag(tag, className, events, innerHTML);
    };
    HtmlHelper.tag = function (tag, className, events, innerHTML) {
        if (className === void 0) { className = ""; }
        if (events === void 0) { events = null; }
        if (innerHTML === void 0) { innerHTML = ""; }
        var temp = document.createElement(tag);
        temp.className = className;
        temp.innerHTML = innerHTML;
        if (events != null) {
            for (var i = 0; i < events.length; i++) {
                temp.addEventListener(events[i].event, events[i].func);
            }
        }
        return temp;
    };
    return HtmlHelper;
}());
var HtmlTableGen = (function () {
    function HtmlTableGen(className, resizeable) {
        if (className === void 0) { className = ""; }
        if (resizeable === void 0) { resizeable = false; }
        this.header = [];
        this.rows = [];
        this.resizeable = false;
        this.className = className;
        this.resizeable = resizeable;
    }
    HtmlTableGen.prototype.addHeader = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        this.header = fields;
    };
    HtmlTableGen.prototype.addRow = function () {
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        this.rows.push(columns);
    };
    HtmlTableGen.prototype.addArrayRow = function (row) {
        this.rows.push(row);
    };
    HtmlTableGen.prototype.addArray = function (data, keys, check) {
        if (keys === void 0) { keys = null; }
        if (check === void 0) { check = null; }
        if (check == null) {
            check = function (value) { return true; };
        }
        for (var i = 0; i < data.length; i++) {
            var row = [];
            if (keys == null) {
                keys = Object.keys(data[i]);
            }
            if (check(data[i])) {
                for (var j = 0; j < keys.length; j++) {
                    row.push(data[i][keys[j]]);
                }
                this.addArrayRow(row);
            }
        }
    };
    HtmlTableGen.prototype.generate = function () {
        var table = document.createElement("table");
        if (this.className != null) {
            table.className = this.className;
        }
        if (this.header.length > 0) {
            var thead = document.createElement("thead");
            var headerRow = document.createElement("tr");
            var _loop_1 = function () {
                header = document.createElement("th");
                header.innerHTML = this_1.header[i];
                headerRow.appendChild(header);
                if (this_1.resizeable) {
                    var span_1 = document.createElement("span");
                    span_1.className = "table-resize";
                    span_1.addEventListener("mousedown", function (e) {
                        span_1.deltaX = span_1.parentElement.offsetWidth - e.pageX;
                        selectedSpan = span_1;
                    });
                    header.appendChild(span_1);
                }
            };
            var this_1 = this, header;
            for (var i = 0; i < this.header.length; i++) {
                _loop_1();
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
        }
        var rows = this.rows;
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        for (var row = 0; row < rows.length; row++) {
            var curRow = rows[row];
            var rowEle = document.createElement("tr");
            for (var col = 0; col < curRow.length; col++) {
                if (Array.isArray(this.rows[row][col])) {
                    for (var i = 0; i < this.rows[row][col].length; i++) {
                        if (this.rows[row][col][i].event != null) {
                            rowEle.addEventListener(this.rows[row][col][i].event, this.rows[row][col][i].func);
                        }
                        else if (this.rows[row][col][i].field != null) {
                            rowEle[this.rows[row][col][i].field] = this.rows[row][col][i].data;
                        }
                    }
                }
                else {
                    var colEle = document.createElement("td");
                    colEle.innerHTML = this.rows[row][col];
                    rowEle.appendChild(colEle);
                }
            }
            tbody.appendChild(rowEle);
        }
        return table;
    };
    return HtmlTableGen;
}());
//# sourceMappingURL=HtmlHelper.js.map