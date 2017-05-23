var EventData = (function () {
    function EventData() {
    }
    return EventData;
}());
var EventHandler = (function () {
    function EventHandler() {
        this.localEvents = [];
        this.localNewEvent = [];
    }
    EventHandler.prototype.on = function (first, sec, handler) {
        if (handler === void 0) { handler = null; }
        if (typeof (first) === "function") {
            this.localNewEvent.push({ event: first, handler: sec });
            first.addEventListener(sec);
        }
        else {
            this.localEvents.push({ manager: first, type: sec, handler: handler });
            first.addEventListener(sec, handler);
        }
    };
    EventHandler.prototype.close = function () {
        for (var _i = 0, _a = this.localEvents; _i < _a.length; _i++) {
            var cur = _a[_i];
            // var cur = this.localEvents[i];
            cur.manager.removeEventListener(cur.type, cur.handler);
        }
        for (var _b = 0, _c = this.localNewEvent; _b < _c.length; _b++) {
            var temp = _c[_b];
            temp.event.removeEventListener(temp.handler);
        }
    };
    return EventHandler;
}());
var EventManager = (function () {
    function EventManager() {
        this.events = {};
    }
    EventManager.prototype.addEventListener = function (type, listener) {
        //console.log("secondStep");
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
    };
    EventManager.prototype.removeEventListener = function (type, listener) {
        var i = this.events[type].indexOf(listener);
        this.events[type].splice(i, 1);
    };
    EventManager.prototype.raiseEvent = function (type, data) {
        if (this.events[type]) {
            var temp = this.events[type];
            for (var i = 0; i < temp.length; i++) {
                temp[i](data);
            }
            return true;
        }
        // console.error("event of type: " + type + " does not exist!");
        return false;
    };
    return EventManager;
}());
//# sourceMappingURL=event.js.map