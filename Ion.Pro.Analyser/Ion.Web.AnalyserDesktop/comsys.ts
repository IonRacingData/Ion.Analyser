function requestAction(action: string, callback: (data: any) => void): void {
    var request = new XMLHttpRequest();

    request.responseType = "json";

    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            callback(request.response);
        }
    };
    request.open("GET", "/test/" + action, true);
    request.send();
}

class NetworkManager {
    private socket: WebSocket;
    public isReady: boolean;
    public curId: number = 0;

    private backlog: IComMessage[] = [];
    private serviceCallback: ((data: any) => void)[] = [];
    private callback: ((data: any) => void)[] = [];

    constructor() {

        this.socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");

        this.socket.onmessage = (ev: MessageEvent) => {
            this.receiveMessage(ev);
            // console.log(ev);
            // console.log(ev.data);
        };

        this.socket.onopen = (ev: Event) => {
            this.isReady = true;
        };
    }

    registerService(callbackId: number, callback: (data: any) => void) {
        this.serviceCallback[callbackId] = callback;
    }

    sendMessage(path: string, message: any, callback: (data: any) => void) {
        let pack: IComMessage = {
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
    }

    private sendRawMessage(message: IComMessage) {
        let str: string = JSON.stringify(message);
        this.socket.send(str);
    }

    receiveMessage(ev: MessageEvent) {
        let message: IComMessage = JSON.parse(ev.data);

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
    }
}

interface IComMessage {
    MessageId: number;
    Path: string;
    Status: ComMessageStatus;
    Data: string;
}

enum ComMessageStatus {
    Request110 = 110,
    OK200 = 200,

}