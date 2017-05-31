function requestAction(action, callback) {
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            if (callback) {
                callback(request.response);
            }
        }
    };
    request.open("GET", "/test/" + action, true);
    request.send();
}
var NetworkManager = (function () {
    function NetworkManager() {
        this.curId = 0;
        this.backlog = [];
        this.serviceCallback = [];
        this.callback = [];
        this.reconnecter = null;
        this.manager = new EventManager();
        this.onGotConnection = newEvent("NetworkManager.onGotConnection");
        this.onLostConnection = newEvent("NetworkManager.onLoseConnection");
        this.socket = this.createWebSocket();
    }
    NetworkManager.prototype.createWebSocket = function () {
        var _this = this;
        var site = window.location.toString();
        if (site.match("file://")) {
            console.log("Detected from local machine, prevents websocket");
            return null;
        }
        var socket = new WebSocket(site.replace("http", "ws") + "socket/connect");
        socket.onmessage = function (ev) {
            _this.receiveMessage(ev);
            // console.log(ev);
            // console.log(ev.data);
        };
        socket.onerror = function (ev) {
            console.log(ev);
        };
        socket.onclose = function (ev) {
            _this.connectionOpen = false;
            _this.socket = null;
            _this.tryReconnect();
            _this.onLostConnection({ target: _this });
            //this.manager.raiseEvent(NetworkManager.event_lostConnection, null);
        };
        socket.onopen = function (ev) {
            _this.connectionOpen = true;
            console.log("Connection established");
            _this.onGotConnection({ target: _this });
            //this.manager.raiseEvent(NetworkManager.event_gotConnection, null);
        };
        return socket;
    };
    NetworkManager.prototype.tryReconnect = function () {
        var _this = this;
        var reconnectInterval = 2000;
        console.log("Lost connection, trying to reconnect with interval: " + reconnectInterval);
        this.reconnecter = this.reconnecter = setInterval(function () {
            if (_this.connectionOpen && _this.reconnecter) {
                clearInterval(_this.reconnecter);
            }
            requestAction("ping", function (data) {
                console.log(data);
                if (_this.reconnecter) {
                    clearInterval(_this.reconnecter);
                }
                if (!_this.socket) {
                    _this.socket = _this.createWebSocket();
                }
            });
        }, reconnectInterval);
    };
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
        if (!this.connectionOpen) {
            this.backlog.push(message);
        }
        else {
            this.sendRawMessage(pack);
        }
    };
    NetworkManager.prototype.sendRawMessage = function (message) {
        var str = JSON.stringify(message);
        if (this.socket) {
            this.socket.send(str);
        }
        else {
            throw "Tried sending message over non existring socket";
        }
    };
    NetworkManager.prototype.receiveMessage = function (ev) {
        var message = JSON.parse(ev.data);
        if (message.Status === ComMessageStatus.Request110) {
            if (this.serviceCallback[message.MessageId]) {
                this.serviceCallback[message.MessageId](JSON.parse(message.Data));
            }
            else {
                console.log("Ohh no, no service callback registerd for that id :( here is the object: ");
                console.log(ev);
            }
        }
        else if (message.Status === ComMessageStatus.OK200) {
            console.log(ev);
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