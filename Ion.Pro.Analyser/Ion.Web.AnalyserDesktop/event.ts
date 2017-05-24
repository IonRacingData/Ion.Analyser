class EventData {

}

interface IWindowEvent {
    window: AppWindow;
    mouse: MouseEvent;
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
    event: INewEvent;
    info: string;
    handler: any;
}

class EventHandler {
    localEvents: IEventHandlerWrapper[] = [];
    localNewEvent: INewEventHandlerWrapper[] = [];

    public on(event: INewEvent, handler: any): void;
    public on(manager: IEventManager, type: string, handeler: any): void;
    public on(first: INewEvent | IEventManager, sec: any, handler: any = null): void {
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

