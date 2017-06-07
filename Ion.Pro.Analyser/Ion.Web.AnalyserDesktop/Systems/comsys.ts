﻿function requestAction(action: string, callback: ((data: any) => void) | null): void {
    var request = new XMLHttpRequest();

    request.responseType = "json";

    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            if (callback) {
                callback(request.response);
            }
        }
    };
    request.open("GET", "/test/" + action, true);
    request.send();
}

class NetworkManager {
    private socket: WebSocket | null;
    public connectionOpen: boolean;
    public curId: number = 0;

    private backlog: IComMessage[] = [];
    private serviceCallback: ((path: string, data: any) => void)[] = [];
    private callback: ((data: any) => void)[] = [];

    private reconnecter: number | null = null;

    public manager: EventManager = new EventManager();

    onGotConnection = newEvent("NetworkManager.onGotConnection");
    onLostConnection = newEvent("NetworkManager.onLoseConnection");

    constructor() {
        this.socket = this.createWebSocket();
    }

    createWebSocket(): WebSocket | null {
        let site = window.location.toString();
        if (site.match("file://")) {
            console.log("Detected from local machine, prevents websocket");
            return null;
        }

        let socket = new WebSocket(site.replace("http", "ws") + "socket/connect");

        socket.onmessage = (ev: MessageEvent) => {
            this.receiveMessage(ev);
            // console.log(ev);
            // console.log(ev.data);
        };

        socket.onerror = (ev: Event) => {
            console.log(ev);
        }

        socket.onclose = (ev: Event) => {
            this.connectionOpen = false;
            this.socket = null;
            this.tryReconnect();
            this.onLostConnection({ target: this });
            //this.manager.raiseEvent(NetworkManager.event_lostConnection, null);
        }

        socket.onopen = (ev: Event) => {
            this.connectionOpen = true;
            console.log("Connection established");
            this.onGotConnection({ target: this });
            //this.manager.raiseEvent(NetworkManager.event_gotConnection, null);
        };

        return socket;
    }

    private tryReconnect() {
        let reconnectInterval = 2000;
        console.log("Lost connection, trying to reconnect with interval: " + reconnectInterval)
        this.reconnecter = this.reconnecter = setInterval(() => {
            if (this.connectionOpen && this.reconnecter) {
                clearInterval(this.reconnecter);
            }
            requestAction("ping", (data: any) => {
                console.log(data);
                if (this.reconnecter) {
                    clearInterval(this.reconnecter);
                }
                if (!this.socket) {
                    this.socket = this.createWebSocket();
                }
            });
        }, reconnectInterval);
    }


    registerService(callbackId: number, callback: (path: string, data: any) => void) {
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
        if (!this.connectionOpen) {
            this.backlog.push(message);
        }
        else {
            this.sendRawMessage(pack);
        }
    }

    private sendRawMessage(message: IComMessage) {
        let str: string = JSON.stringify(message);
        if (this.socket) {
            this.socket.send(str);
        }
        else {
            throw "Tried sending message over non existring socket";
        }
    }

    receiveMessage(ev: MessageEvent) {
        let message: IComMessage = JSON.parse(ev.data);

        if (message.Status === ComMessageStatus.Request110) {
            if (this.serviceCallback[message.MessageId]) {
                this.serviceCallback[message.MessageId](message.Path, JSON.parse(message.Data));
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