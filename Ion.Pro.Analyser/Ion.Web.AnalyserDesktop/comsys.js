function requestAction(action, callback) {
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.response);
        }
    };
    request.open("GET", "/test/" + action, true);
    request.send();
}
var NetworkManager = (function () {
    function NetworkManager() {
        var _this = this;
        this.curId = 0;
        this.backlog = [];
        this.serviceCallback = [];
        this.callback = [];
        this.socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");
        this.socket.onmessage = function (ev) {
            _this.receiveMessage(ev);
            //console.log(ev);
            //console.log(ev.data);
        };
        this.socket.onopen = function (ev) {
            _this.isReady = true;
        };
    }
    NetworkManager.prototype.registerService = function (callbackId, callback) {
        this.serviceCallback[callbackId] = callback;
    };
    NetworkManager.prototype.sendMessage = function (path, message, callback) {
        var pack = {
            Status: ComMessageStatus.Request110,
            Path: path,
            Data: JSON.stringify(message),
            MessageId: this.curId++
        };
        this.callback[pack.MessageId] = callback;
        if (!this.isReady) {
            this.backlog.push(message);
        }
        else {
            this.sendRawMessage(pack);
        }
    };
    NetworkManager.prototype.sendRawMessage = function (message) {
        var str = JSON.stringify(message);
        this.socket.send(str);
    };
    NetworkManager.prototype.receiveMessage = function (ev) {
        console.log(ev);
        var message = JSON.parse(ev.data);
        if (message.Status == ComMessageStatus.Request110) {
            if (this.serviceCallback[message.MessageId]) {
                this.serviceCallback[message.MessageId](JSON.parse(message.Data));
            }
            else {
                console.log("Ohh no, no service callback registerd for that id :( here is the object: ");
                console.log(ev);
            }
        }
        else if (message.Status == ComMessageStatus.OK200) {
            if (this.callback[message.MessageId]) {
                this.callback[message.MessageId](JSON.parse(message.Data));
            }
            else {
                console.log("Ohh no, no callback registerd for that id :( here is the object: ");
                console.log(ev);
            }
        }
    };
    return NetworkManager;
}());
var ComMessageStatus;
(function (ComMessageStatus) {
    ComMessageStatus[ComMessageStatus["Request110"] = 110] = "Request110";
    ComMessageStatus[ComMessageStatus["OK200"] = 200] = "OK200";
})(ComMessageStatus || (ComMessageStatus = {}));
//# sourceMappingURL=comsys.js.map