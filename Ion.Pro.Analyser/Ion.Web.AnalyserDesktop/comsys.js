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
        /*this.socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");

        this.socket.onmessage = (ev: MessageEvent) => {
            console.log(ev);
            console.log(ev.data);
        }

        this.socket.onopen = (ev: Event) => {
            this.socket.send("Hello World from a web socket :D, and this is a realy realy long message, so we can provoke it to send it as a longer message, to check that everything works");
        }*/
    }
    NetworkManager.prototype.receiveMessage = function (ev) {
    };
    return NetworkManager;
}());
//# sourceMappingURL=comsys.js.map