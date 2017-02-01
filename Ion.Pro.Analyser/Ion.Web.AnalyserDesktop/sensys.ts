class SensorManager implements IEventManager {
    dataCache: ISensorPackage[][] = [];

    globalPlot: ISensorPackage[];
    globalId: number;

    static event_globalPlot = "globalPlot";
    static event_registerIPlot = "registerIPlot";

    eventManager: EventManager = new EventManager();

    getInfos(callback: (ids: SensorInformation[]) => void): void {
        requestAction("GetIds", callback);
    }

    getLoadedIds(callback: (ids: number[]) => void): void {
        requestAction("GetLoadedIds", callback);
    }

    getLoadedInfos(callback: (ids: SensorInformation[]) => void): void {
        let multiBack = new Multicallback(2, (ids: SensorInformation[], loaded: number[]) => {
            let newLoaded: SensorInformation[] = [];
            let allIds: SensorInformation[] = [];
            for (let i = 0; i < ids.length; i++) {
                allIds[ids[i].ID] = ids[i];
            }
            for (let i = 0; i < loaded.length; i++) {
                if (allIds[loaded[i]]) {
                    newLoaded.push(allIds[loaded[i]]);
                }
                else {
                    let temp = new SensorInformation();
                    temp.ID = loaded[i];
                    temp.Name = "Not Found";
                    temp.Key = null;
                    temp.Unit = null;
                    newLoaded.push(temp);
                }
            }
            callback(newLoaded);
        });
        this.getInfos(multiBack.createCallback());
        this.getLoadedIds(multiBack.createCallback());
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

    removeEventListener(type: string, listener: any) {
        this.eventManager.removeEventListener(type, listener);
    }

    plotter: IPlot[] = [];
    
    register(plotter: IPlot): void {
        this.plotter.push(plotter);
        this.eventManager.raiseEvent(SensorManager.event_registerIPlot, null);
    }
}

class Multicallback {
    callback: (...param: any[]) => void;
    responses: any[] = [];
    curId: number = 0;
    returned: number = 0;
    count: number;
    constructor(count: number, callback: (...param: any[]) => void) {
        this.callback = callback;
        this.count = count;
    }

    createCallback(): (param: any) => void {
        let current = this.curId;
        this.curId++;
        return (param: any) => {
            this.responses[current] = param;
            this.returned++;
            this.checkReturn();
        };
    }

    checkReturn() {
        if (this.count == this.returned) {
            this.callback.apply(null, this.responses);
        }
    }
}

class SensorInformation {
    ID: number;
    Key: string;
    Name: string;
    Unit: string;
}

interface IPlot {
    dataUpdate();
    plotType: string;
    plotWindow: AppWindow;
}

interface ISinglePlot extends IPlot {
    plotData: PlotData;
}

interface IMultiPlot extends IPlot {
    plotData: PlotData[];
}