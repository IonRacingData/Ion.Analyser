class EventData {

}

interface IWindowEvent {
    window: AppWindow;
    mouse: MouseEvent;
}

class EventManager {
    events: { [type: string]: ((e: any) => void)[] } = {};

    addEventListener(type: string, listener: any): void {
        console.log("secondStep");
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
    }

    raiseEvent(type: string, data: EventData): boolean {
        if (this.events[type]) {
            var temp = this.events[type];
            for (var i = 0; i < temp.length; i++) {
                temp[i](data);
            }
            return true;
        }
        //console.error("event of type: " + type + " does not exist!");
        return false;
    }
}

