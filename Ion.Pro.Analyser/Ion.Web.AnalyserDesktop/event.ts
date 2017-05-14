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

class EventHandler {
    localEvents: IEventHandlerWrapper[] = [];

    on(manager: IEventManager, type: string, handeler: any) {
        this.localEvents.push({ manager: manager, type: type, handler: handeler });
        manager.addEventListener(type, handeler);
    }

    close() {
        for (var cur of this.localEvents) {
            // var cur = this.localEvents[i];
            cur.manager.removeEventListener(cur.type, cur.handler);
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

