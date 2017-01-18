function requestAction(action: string, callback: (data: any) => void): void {
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.onreadystatechange = () => {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.response);
        }
    }
    request.open("GET", "/test/" + action, true);
    request.send();
}

class NetworkManager {
    
}