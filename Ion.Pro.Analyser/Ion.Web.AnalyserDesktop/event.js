var EventData = (function () {
    function EventData() {
    }
    return EventData;
}());
var EventHandler = (function () {
    function EventHandler() {
        this.localEvents = [];
    }
    EventHandler.prototype.on = function (manager, type, handeler) {
        this.localEvents.push({ manager: manager, type: type, handler: handeler });
        manager.addEventListener(type, handeler);
    };
    EventHandler.prototype.close = function () {
        for (var i in this.localEvents) {
            var cur = this.localEvents[i];
            cur.manager.removeEventListener(cur.type, cur.handler);
        }
    };
    return EventHandler;
}());
var EventManager = (function () {
    function EventManager() {
        this.events = {};
    }
    EventManager.prototype.addEventListener = function (type, listener) {
        console.log("secondStep");
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
        //console.error("event of type: " + type + " does not exist!");
        return false;
    };
    return EventManager;
}());
//# sourceMappingURL=event.js.map