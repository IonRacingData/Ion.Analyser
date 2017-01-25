class SensorManager {
    dataCache: ISensorPackage[][] = [];

    globalPlot: ISensorPackage[];
    globalId: number;

    static event_globalPlot = "globalPlot";

    eventManager: EventManager = new EventManager(); 

    getIds(callback: (ids: SensorInformation[]) => void): void {
        requestAction("GetIds", callback);
    }

    getLoadedIds(callback: (ids: number[]) => void): void {
        requestAction("GetLoadedIds", callback);
    }

    getData(id: number, callback: (data: ISensorPackage[]) => void): void{
        if (!this.dataCache[id]) {
            this.loadData(id, callback);
        }
        else {
            callback(this.dataCache[id]);
        }
    }

    loadData(id: number, callback: (data: ISensorPackage[]) => void): void {
        requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
            this.dataCache[id] = data;
            callback(data);
        });
    }

    setGlobal(id: number) {
        this.globalId = id;
        this.getData(id, (data: ISensorPackage[]) => {
            this.globalPlot = data;
            this.eventManager.raiseEvent(SensorManager.event_globalPlot, this.globalPlot);
        });
    }

    addEventListener(type: string, listener: any) {
        if (type == SensorManager.event_globalPlot && this.globalPlot != null) {
            listener(this.globalPlot);
        }
        this.eventManager.addEventListener(type, listener);
    }
}

class SensorInformation {
    ID: number;
    Key: string;
    Name: string;
    Unit: string;
}

interface ISinglePlot {

}

interface IMultiPlot {

}