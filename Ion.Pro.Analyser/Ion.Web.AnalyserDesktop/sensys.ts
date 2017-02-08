class SensorManager implements IEventManager {
    dataCache: ISensorPackage[][] = [];
    plotCache: PlotData[] = [];


    globalPlot: ISensorPackage[];
    globalId: number;

    static event_globalPlot = "globalPlot";
    static event_registerIPlot = "registerIPlot";

    constructor() {
        kernel.netMan.registerService(10, (data: any) => {
            let dataArray = <ISensorPackage[]>this.convertToSensorPackage(data.Sensors);
            for (let j = 0; j < dataArray.length; j++){
                let realData = dataArray[j];
                if (!this.dataCache[realData.ID]) {
                    this.dataCache[realData.ID] = [];
                }
                this.dataCache[realData.ID].push(realData);
                if (!this.plotCache[realData.ID]) {
                    this.plotCache[realData.ID] = new PlotData([]);
                }
                this.plotCache[realData.ID].points.push(new Point(realData.TimeStamp, realData.Value));   
            }
            for (let i = 0; i < this.plotter.length; i++) {
                this.plotter[i].dataUpdate();
            }
            
            //if ()
        });
    }

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

    getPlotData(id: number, callback: (data: PlotData) => void): void {
        if (!this.plotCache[id]) {
            this.loadPlotData(id, callback);
        }
        else {
            callback(this.plotCache[id]);
        }
    }

    loadPlotData(id: number, callback: (data: PlotData) => void): void {
        this.loadData(id, (data: ISensorPackage[]): void => {
            let plot = this.convertData(data);
            this.plotCache[id] = plot;
            callback(plot);
        });
    }

    convertData(data: ISensorPackage[]): PlotData {
        if (data.length < 1)
            return null;
        let id = data[0].ID;
        let p: Point[] = [];
        for (let i = 0; i < data.length; i++) {
            p.push(new Point(data[i].TimeStamp, data[i].Value));
        }
        let plot = new PlotData(p);
        plot.ID = id;
        return plot;

    }

    loadData(id: number, callback: (data: ISensorPackage[]) => void): void {
        kernel.netMan.sendMessage("/sensor/getdata", { num: id }, (data: any) => {
            let realData = this.convertToSensorPackage(data.Sensors);
            console.log(realData);
            this.dataCache[id] = realData;
            callback(realData);
        });
        /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
            this.dataCache[id] = data;
            callback(data);
        });*/
    }

    convertToSensorPackage(str: string): ISensorPackage[] {
        let raw = atob(str);
        let ret: ISensorPackage[] = [];
        for (let i = 0; i < raw.length / 28; i++) {
            /*console.log(raw.charCodeAt(i * 28));
            console.log(raw.charCodeAt(i * 28 + 1));
            console.log(raw.charCodeAt(i * 28 + 2));
            console.log(raw.charCodeAt(i * 28 + 3));*/
            ret[i] = {
                ID: raw.charCodeAt(i * 28)
                | raw.charCodeAt(i * 28 + 1) << 8
                | raw.charCodeAt(i * 28 + 2) << 16
                | raw.charCodeAt(i * 28 + 3) << 24,

                Value: raw.charCodeAt(i * 28 + 4)
                | raw.charCodeAt(i * 28 + 5) << 8
                | raw.charCodeAt(i * 28 + 6) << 16
                | raw.charCodeAt(i * 28 + 7) << 24
                | raw.charCodeAt(i * 28 + 8) << 32
                | raw.charCodeAt(i * 28 + 9) << 40
                | raw.charCodeAt(i * 28 + 10) << 48
                | raw.charCodeAt(i * 28 + 11) << 56,

                TimeStamp:
                  raw.charCodeAt(i * 28 + 12)
                | raw.charCodeAt(i * 28 + 13) << 8
                | raw.charCodeAt(i * 28 + 14) << 16
                | raw.charCodeAt(i * 28 + 15) << 24
                | raw.charCodeAt(i * 28 + 16) << 32
                | raw.charCodeAt(i * 28 + 17) << 40
                | raw.charCodeAt(i * 28 + 18) << 48
                | raw.charCodeAt(i * 28 + 19) << 56,
                
            } 
        }
        return ret;
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
    plotData: IPlotData;
}

interface IMultiPlot extends IPlot {
    plotData: IPlotData[];
}