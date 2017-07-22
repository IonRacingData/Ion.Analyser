var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Component = (function () {
    function Component() {
    }
    return Component;
}());
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        var _this = _super.call(this) || this;
        _this.__disabled = false;
        _this.onclick = newEvent("Button.onclick");
        _this.wrapper = document.createElement("div");
        _this.wrapper.className = "comp-button";
        _this.wrapper.onclick = _this.onclick;
        return _this;
    }
    Object.defineProperty(Button.prototype, "disabled", {
        set: function (bool) {
            this.__disabled = bool;
            this.toggleDisabled();
        },
        enumerable: true,
        configurable: true
    });
    Button.prototype.toggleDisabled = function () {
        if (this.__disabled) {
            this.wrapper.className = "comp-button-disabled";
            this.wrapper.onclick = function () { };
        }
        else {
            this.wrapper.className = "comp-button";
            this.wrapper.onclick = this.onclick;
        }
    };
    return Button;
}(Component));
var IconButton = (function (_super) {
    __extends(IconButton, _super);
    function IconButton() {
        return _super.call(this) || this;
    }
    return IconButton;
}(Button));
var TextButton = (function (_super) {
    __extends(TextButton, _super);
    function TextButton() {
        var _this = _super.call(this) || this;
        _this.textNode = document.createTextNode("button");
        var span = document.createElement("span");
        span.appendChild(_this.textNode);
        _this.wrapper.appendChild(span);
        return _this;
    }
    Object.defineProperty(TextButton.prototype, "text", {
        get: function () {
            if (this.textNode.nodeValue)
                return this.textNode.nodeValue;
            else
                throw new Error("textNode.nodeValue is null");
        },
        set: function (value) {
            this.textNode.nodeValue = value;
        },
        enumerable: true,
        configurable: true
    });
    return TextButton;
}(Button));
var ListBox = (function (_super) {
    __extends(ListBox, _super);
    function ListBox() {
        var _this = _super.call(this) || this;
        _this.selector = null;
        _this.onItemClick = newEvent("ListBox.onItemClick");
        _this.wrapper = document.createElement("ul");
        _this.wrapper.className = "comp-listBox";
        return _this;
    }
    Object.defineProperty(ListBox.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            /*let oldPush = data.push;
            let box = this;
            data.push = function push(...items: any[]): number {
                let num = oldPush.apply(data, items);
                box.generateList();
                return num;
            }*/
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ListBox.prototype.update = function () {
        this.generateList();
    };
    ListBox.prototype.generateList = function () {
        var _this = this;
        this.wrapper.innerHTML = "";
        var _loop_1 = function (v) {
            var row = document.createElement("li");
            row.onclick = function () {
                _this.onItemClick(v);
            };
            var txt = null;
            if (this_1.selector) {
                txt = this_1.selector(v);
            }
            else {
                txt = v.toString();
            }
            row.appendChild(document.createTextNode(txt));
            this_1.wrapper.appendChild(row);
        };
        var this_1 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var v = _a[_i];
            _loop_1(v);
        }
    };
    return ListBox;
}(Component));
var Switch = (function (_super) {
    __extends(Switch, _super);
    function Switch() {
        var _this = _super.call(this) || this;
        _this.__checked = false;
        _this.onCheckedChange = newEvent("Switch.onCheckedChange");
        _this.wrapper = document.createElement("div");
        _this.wrapper.className = "comp-style";
        _this.slider = document.createElement("div");
        _this.wrapper.appendChild(_this.slider);
        _this.slider.className = "comp-style-slider";
        _this.text = document.createTextNode("OFF");
        _this.slider.appendChild(_this.text);
        _this.wrapper.addEventListener("click", function () {
            _this.checked = !_this.checked;
        });
        return _this;
    }
    Object.defineProperty(Switch.prototype, "checked", {
        get: function () {
            return this.__checked;
        },
        set: function (value) {
            this.__checked = value;
            this.onCheckedChange({ target: this, newValue: value });
            this.handleCheck();
        },
        enumerable: true,
        configurable: true
    });
    Switch.prototype.handleCheck = function () {
        if (this.__checked) {
            this.slider.classList.add("comp-style-slider-active");
            this.text.nodeValue = "ON";
        }
        else {
            this.slider.classList.remove("comp-style-slider-active");
            this.text.nodeValue = "OFF";
        }
    };
    return Switch;
}(Component));
var TableList = (function (_super) {
    __extends(TableList, _super);
    function TableList() {
        var _this = _super.call(this) || this;
        _this.__header = [];
        _this.selector = null;
        _this.onItemClick = newEvent("TabelList.onItemClick");
        _this.wrapper = document.createElement("table");
        _this.wrapper.className = "table selectable";
        _this.tableHeader = document.createElement("thead");
        _this.tableBody = document.createElement("tbody");
        _this.wrapper.appendChild(_this.tableHeader);
        _this.wrapper.appendChild(_this.tableBody);
        return _this;
    }
    Object.defineProperty(TableList.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableList.prototype, "header", {
        get: function () {
            return this.__header;
        },
        set: function (headers) {
            this.__header = headers;
            this.generateHeader();
        },
        enumerable: true,
        configurable: true
    });
    TableList.prototype.update = function () {
        this.generateList();
    };
    TableList.prototype.generateHeader = function () {
        this.tableHeader.innerHTML = "";
        var tr = document.createElement("tr");
        this.tableHeader.appendChild(tr);
        for (var _i = 0, _a = this.__header; _i < _a.length; _i++) {
            var v = _a[_i];
            var headerItem = document.createElement("th");
            headerItem.appendChild(document.createTextNode(v));
            tr.appendChild(headerItem);
        }
    };
    TableList.prototype.generateList = function () {
        var _this = this;
        this.tableBody.innerHTML = "";
        var _loop_2 = function (v) {
            var row = document.createElement("tr");
            row.onclick = function () {
                _this.onItemClick({ target: _this, data: v });
            };
            var txt = [];
            if (this_2.selector) {
                txt = this_2.selector(v);
            }
            else {
                txt = [v.toString()];
            }
            for (var _i = 0, txt_1 = txt; _i < txt_1.length; _i++) {
                var d = txt_1[_i];
                var cell = document.createElement("td");
                cell.appendChild(document.createTextNode(d));
                row.appendChild(cell);
            }
            this_2.tableBody.appendChild(row);
        };
        var this_2 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var v = _a[_i];
            _loop_2(v);
        }
    };
    return TableList;
}(Component));
var ExpandableList = (function (_super) {
    __extends(ExpandableList, _super);
    function ExpandableList() {
        var _this = _super.call(this) || this;
        _this.mk = new HtmlHelper();
        _this.selector = null;
        _this.onItemClick = newEvent("ExpandableList.onItemClick");
        _this.wrapper = document.createElement("div");
        _this.wrapper.className = "comp-expList";
        return _this;
    }
    Object.defineProperty(ExpandableList.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ExpandableList.prototype.update = function () {
        this.generateList();
    };
    ExpandableList.prototype.generateList = function () {
        var _this = this;
        var mk = this.mk;
        this.wrapper.innerHTML = "";
        var _loop_3 = function (d) {
            var section = mk.tag("div", "comp-expList-section");
            var clicker = mk.tag("div", "comp-expList-clicker");
            var collapsible = mk.tag("div", "comp-expList-collapsible");
            collapsible.style.maxHeight = "0px";
            var list = document.createElement("ul");
            this_3.wrapper.appendChild(section);
            section.appendChild(clicker);
            section.appendChild(collapsible);
            collapsible.appendChild(list);
            var title = void 0;
            var items = [];
            if (this_3.selector) {
                title = this_3.selector(d).title;
                items = this_3.selector(d).items;
            }
            else {
                title = d.toString();
            }
            clicker.appendChild(document.createTextNode(title));
            var _loop_4 = function (i) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(i.text));
                list.appendChild(li);
                li.onclick = function () {
                    _this.onItemClick({ target: _this, data: i.object });
                };
            };
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var i = items_1[_i];
                _loop_4(i);
            }
            clicker.onclick = function () {
                var contentHeight = collapsible.scrollHeight;
                collapsible.style.maxHeight = collapsible.style.maxHeight === "0px" ? contentHeight + "px" : "0px";
            };
        };
        var this_3 = this;
        for (var _i = 0, _a = this.__data; _i < _a.length; _i++) {
            var d = _a[_i];
            _loop_3(d);
        }
    };
    return ExpandableList;
}(Component));
var ListBoxRearrangable = (function (_super) {
    __extends(ListBoxRearrangable, _super);
    function ListBoxRearrangable() {
        var _this = _super.call(this) || this;
        _this.selector = null;
        _this.onItemClick = newEvent("ListBoxRearrangable.onItemClick");
        _this.onItemRemove = newEvent("ListBoxRearrangable.onItemRemove");
        _this.onItemRearrange = newEvent("ListBoxRearrangable.onItemRearrange");
        _this.mk = new HtmlHelper();
        _this.wrapper = document.createElement("ul");
        _this.wrapper.className = "comp-listBoxRearr";
        return _this;
    }
    Object.defineProperty(ListBoxRearrangable.prototype, "data", {
        get: function () {
            return this.__data;
        },
        set: function (data) {
            this.__data = data;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListBoxRearrangable.prototype, "rowInfoMarkers", {
        get: function () {
            return this.__rowInfoMarkers || null;
        },
        set: function (rims) {
            this.__rowInfoMarkers = rims;
            this.generateList();
        },
        enumerable: true,
        configurable: true
    });
    ListBoxRearrangable.prototype.update = function () {
        this.generateList();
    };
    ListBoxRearrangable.prototype.generateList = function () {
        var _this = this;
        var mk = this.mk;
        this.wrapper.innerHTML = "";
        if (this.__data) {
            var _loop_5 = function (i) {
                var row = document.createElement("li");
                var marker = null;
                if (this_4.__rowInfoMarkers) {
                    marker = mk.tag("div", "comp-listBoxRearr-marker");
                }
                var textWrapper = mk.tag("div", "comp-listBoxRearr-textWrapper");
                var mainSpan = mk.tag("span");
                var infoSpan = mk.tag("span");
                var iconWrapper = mk.tag("div", "comp-listBoxRearr-icons");
                var arrUp = mk.tag("span", "comp-listBoxRearr-icon");
                var arrDown = mk.tag("span", "comp-listBoxRearr-icon");
                var remove = mk.tag("span", "comp-listBoxRearr-icon");
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
                if (this_4.__rowInfoMarkers) {
                    if (i < this_4.__rowInfoMarkers.length && marker) {
                        marker.appendChild(document.createTextNode(this_4.__rowInfoMarkers[i]));
                    }
                }
                var mainTxt = void 0;
                var infoTxt = null;
                if (this_4.selector) {
                    var item = this_4.selector(this_4.__data[i]);
                    mainTxt = item.mainText;
                    infoTxt = item.infoText || null;
                }
                else {
                    mainTxt = this_4.__data[i].toString();
                }
                mainSpan.appendChild(document.createTextNode(mainTxt));
                if (infoTxt)
                    infoSpan.appendChild(document.createTextNode(infoTxt));
                this_4.wrapper.appendChild(row);
                remove.onclick = function () {
                    var temp = _this.__data[i];
                    _this.__data.splice(i, 1);
                    _this.onItemRemove({ target: _this, data: temp });
                    _this.generateList();
                };
                arrUp.onclick = function () {
                    if (i > 0) {
                        var temp = _this.__data[i];
                        _this.__data[i] = _this.__data[i - 1];
                        _this.__data[i - 1] = temp;
                        _this.onItemRearrange({ target: _this, data: temp });
                        _this.generateList();
                    }
                };
                arrDown.onclick = function () {
                    if (i < _this.__data.length - 1) {
                        var temp = _this.__data[i];
                        _this.__data[i] = _this.__data[i + 1];
                        _this.__data[i + 1] = temp;
                        _this.onItemRearrange({ target: _this, data: temp });
                        _this.generateList();
                    }
                };
            };
            var this_4 = this;
            for (var i = 0; i < this.__data.length; i++) {
                _loop_5(i);
            }
        }
    };
    return ListBoxRearrangable;
}(Component));
var TempDataSourceList = (function (_super) {
    __extends(TempDataSourceList, _super);
    function TempDataSourceList(plot) {
        var _this = _super.call(this) || this;
        _this.mk = new HtmlHelper();
        _this.plot = plot;
        var info = kernel.senMan.getDataSources(plot.type);
        _this.sensorTable = _this.mk.tag("div");
        //this.sensorTable.style.minWidth = "200px";
        _this.sensorTable.style.flexGrow = "1";
        _this.sensorTable.style.overflowY = "auto";
        _this.wrapper = _this.mk.tag("div");
        _this.wrapper.appendChild(_this.sensorTable);
        if (sensys.SensorManager.isViewer(plot)) {
            _this.drawSingleSensors(plot, info);
        }
        else if (sensys.SensorManager.isCollectionViewer(plot)) {
            _this.drawMultiSensors(plot, info);
        }
        return _this;
    }
    TempDataSourceList.prototype.update = function () {
        var info = kernel.senMan.getDataSources(this.plot.type);
        if (sensys.SensorManager.isViewer(this.plot)) {
            this.drawSingleSensors(this.plot, info);
        }
        else if (sensys.SensorManager.isCollectionViewer(this.plot)) {
            this.drawMultiSensors(this.plot, info);
        }
    };
    TempDataSourceList.prototype.drawSingleSensors = function (plot, info) {
        this.drawSensors(plot, info, this.createSingleSensor);
    };
    TempDataSourceList.prototype.drawMultiSensors = function (plot, info) {
        this.drawSensors(plot, info, this.createMultiSensor);
    };
    TempDataSourceList.prototype.createSingleSensor = function (plot, sensor) {
        var radio = this.mk.tag("input");
        radio.type = "radio";
        radio.name = "sensor";
        if (plot.dataSource && plot.dataSource === sensor) {
            radio.checked = true;
        }
        radio.addEventListener("change", function (e) {
            radio.disabled = true;
            console.log("Single checkbox click");
            plot.dataSource = sensor;
            if (sensor.length() == 0) {
                kernel.senMan.fillDataSource(sensor, function () {
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
    };
    TempDataSourceList.prototype.createMultiSensor = function (plot, sensor) {
        var checkBox = this.mk.tag("input");
        checkBox.type = "checkbox";
        for (var i = 0; i < plot.dataCollectionSource.length; i++) {
            if (plot.dataCollectionSource[i] === sensor) {
                checkBox.checked = true;
                break;
            }
        }
        checkBox.addEventListener("change", function (e) {
            checkBox.disabled = true;
            console.log("Multi checkbox click");
            if (checkBox.checked) {
                plot.dataCollectionSource.push(sensor);
                if (sensor.length() == 0) {
                    kernel.senMan.fillDataSource(sensor, function () {
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
                for (var i = 0; i < plot.dataCollectionSource.length; i++) {
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
    };
    TempDataSourceList.prototype.drawSensors = function (plot, info, drawMethod) {
        this.sensorTable.innerHTML = "";
        for (var i = 0; i < info.length; i++) {
            var sensor = info[i];
            var ctrl = drawMethod.call(this, plot, sensor);
            var label = this.mk.tag("label", "listitem");
            var firstInfo = sensor.infos.SensorInfos[0];
            label.title = firstInfo.ID.toString() + " (0x" + firstInfo.ID.toString(16) + ") " + (firstInfo.Key.toString() === firstInfo.Key ? firstInfo.Key : " No key found");
            if (firstInfo.ID.toString() === firstInfo.Key) {
                label.style.color = "red";
            }
            label.appendChild(ctrl);
            var innerBox = this.mk.tag("div");
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
    };
    return TempDataSourceList;
}(Component));
