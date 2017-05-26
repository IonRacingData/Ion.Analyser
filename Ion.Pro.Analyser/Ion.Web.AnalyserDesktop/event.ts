class EventData {
    public target: any;
}

interface IEventData {
    target: any;
}

interface INewEvent<T extends IEventData> {
    (event: T): void;
    info: string;
    addEventListener(listener: (event: T) => void): void;
    removeEventListener(listener: (event: T) => void): void;
}

function newEvent<T extends IEventData>(info: string): INewEvent<T> {
    let callbacks: ((event: T) => void)[] = [];
    let handler = <any>function EventHandler(event: T) {
        // console.log("running events");
        // console.log(callbacks);
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](event);
        }
    }

    handler.info = info;

    handler.addEventListener = function addEventListener(callback: (event: T) => void) {
        callbacks.push(callback);
    }

    handler.removeEventListener = function removeEventListener(callback: (event: T) => void) {
        let a = callbacks.indexOf(callback);
        callbacks.splice(a, 1);
    }

    return handler;
}

interface IWindowEvent extends IEventData {
    window: AppWindow;
    mouse: MouseEvent | TouchEvent;
}

type EventMethod = (type: string, listener: any) => void;

interface IEventManager {
    addEventListener(type: string, handeler: any);
    removeEventListener(type: string, handeler: any);
}

interface IEventHandlerWrapper {
    manager: IEventManager;
    type: string;
    handler: any;
}

interface INewEventHandlerWrapper {
    event: INewEvent<any>;
    info: string;
    handler: any;
}

class EventHandler {
    localEvents: IEventHandlerWrapper[] = [];
    localNewEvent: INewEventHandlerWrapper[] = [];

    public on(event: INewEvent<any>, handler: any): void;
    public on(manager: IEventManager, type: string, handeler: any): void;
    public on(first: INewEvent<any> | IEventManager, sec: any, handler: any = null): void {
        if (typeof (first) === "function") {
            this.localNewEvent.push({ event: first, info: first.info, handler: sec });
            first.addEventListener(sec);
        }
        else {
            this.localEvents.push({ manager: first, type: sec, handler: handler });
            first.addEventListener(sec, handler);
        }
    }

    close() {
        for (var cur of this.localEvents) {
            // var cur = this.localEvents[i];
            cur.manager.removeEventListener(cur.type, cur.handler);
        }

        for (var temp of this.localNewEvent) {
            temp.event.removeEventListener(temp.handler);
        }
    }
}

class EventManager implements IEventManager {
    events: { [type: string]: ((e: any) => void)[] } = {};

    addEventListener(type: string, listener: any): void {
        //console.log("secondStep");
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
    }

    removeEventListener(type: string, listener: any): void {
        var i = this.events[type].indexOf(listener);
        this.events[type].splice(i, 1);
    }

    raiseEvent(type: string, data: EventData): boolean {
        if (this.events[type]) {
            var temp = this.events[type];
            for (var i = 0; i < temp.length; i++) {
                temp[i](data);
            }
            return true;
        }
        // console.error("event of type: " + type + " does not exist!");
        return false;
    }
}

