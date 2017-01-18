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
    }
    return NetworkManager;
}());
//# sourceMappingURL=comsys.js.map