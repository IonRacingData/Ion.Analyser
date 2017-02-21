class SensorManager implements IEventManager {
    private dataCache: ISensorPackage[][] = [];
    private plotCache: SensorDataContainer[] = [];

    plotter: IPlot[] = [];

    viewers: IViewerBase<any>[] = [];

    static readonly event_registerIPlot = "registerIPlot";
    static readonly event_registerViewer = "registerViewer";

    constructor() {
        kernel.netMan.registerService(10, (data: any) => this.handleService(this.convertToSensorPackage(data.Sensors)));
    }

    private handleService(data: ISensorPackage[]) {

        for (let j = 0; j < data.length; j++) {
            let realData = data[j];
            let sensId = realData.ID;

            if (!this.dataCache[sensId]) {
                this.dataCache[sensId] = [];
            }
            this.dataCache[sensId].push(realData);

            if (!this.plotCache[sensId]) {
                this.plotCache[sensId] = new SensorDataContainer([]);
                this.plotCache[sensId].ID = sensId;
            }
            this.plotCache[sensId].points.push(new Point(realData.TimeStamp, realData.Value));
        }
        this.updateAllPlotters();
    }

    private updateAllPlotters() {
        for (let i = 0; i < this.plotter.length; i++) {
            this.plotter[i].dataUpdate();
        }
    }

    private eventManager: EventManager = new EventManager();

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

    getData(id: number, callback: (data: ISensorPackage[]) => void): void {
        if (!this.dataCache[id]) {
            this.loadData(id, callback);
        }
        else {
            callback(this.dataCache[id]);
        }
    }

    getPlotData(id: number, callback: (data: SensorDataContainer) => void): void {
        if (!this.plotCache[id]) {
            this.loadPlotData(id, callback);
        }
        else {
            callback(this.plotCache[id]);
        }
    }

    private loadPlotData(id: number, callback: (data: SensorDataContainer) => void): void {
        this.loadData(id, (data: ISensorPackage[]): void => {
            let plot = this.convertData(data);
            this.plotCache[id] = plot;
            callback(plot);
        });
    }

    private convertData(data: ISensorPackage[]): SensorDataContainer {
        if (data.length < 1) {
            return null;
        }
        let id = data[0].ID;
        let p: Point[] = [];
        for (let i = 0; i < data.length; i++) {
            p.push(new Point(data[i].TimeStamp, data[i].Value));
        }
        let plot = new SensorDataContainer(p);
        plot.ID = id;
        return plot;

    }

    private loadData(id: number, callback: (data: ISensorPackage[]) => void): void {
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

    private convertToSensorPackage(str: string): ISensorPackage[] {
        let raw = atob(str);
        let ret: ISensorPackage[] = [];
        for (let i = 0; i < raw.length / 28; i++) {
            /*console.log(raw.charCodeAt(i * 28));
            console.log(raw.charCodeAt(i * 28 + 1));
            console.log(raw.charCodeAt(i * 28 + 2));
            console.log(raw.charCodeAt(i * 28 + 3));*/
            let buf = new ArrayBuffer(8);
            let insert = new Uint8Array(buf);
            insert[0] = raw.charCodeAt(i * 28 + 4);
            insert[1] = raw.charCodeAt(i * 28 + 5);
            insert[2] = raw.charCodeAt(i * 28 + 6);
            insert[3] = raw.charCodeAt(i * 28 + 7);
            insert[4] = raw.charCodeAt(i * 28 + 8);
            insert[5] = raw.charCodeAt(i * 28 + 9);
            insert[6] = raw.charCodeAt(i * 28 + 10);
            insert[7] = raw.charCodeAt(i * 28 + 11);
            let output = new Float64Array(buf);
            /* tslint:disable:no-bitwise */
            ret[i] = {
                ID: raw.charCodeAt(i * 28)
                | raw.charCodeAt(i * 28 + 1) << 8
                | raw.charCodeAt(i * 28 + 2) << 16
                | raw.charCodeAt(i * 28 + 3) << 24,
                Value: output[0],
                /*Value: raw.charCodeAt(i * 28 + 4)
                | raw.charCodeAt(i * 28 + 5) << 8
                | raw.charCodeAt(i * 28 + 6) << 16
                | raw.charCodeAt(i * 28 + 7) << 24
                | raw.charCodeAt(i * 28 + 8) << 32
                | raw.charCodeAt(i * 28 + 9) << 40
                | raw.charCodeAt(i * 28 + 10) << 48
                | raw.charCodeAt(i * 28 + 11) << 56,*/

                TimeStamp:
                raw.charCodeAt(i * 28 + 12)
                | raw.charCodeAt(i * 28 + 13) << 8
                | raw.charCodeAt(i * 28 + 14) << 16
                | raw.charCodeAt(i * 28 + 15) << 24
                | raw.charCodeAt(i * 28 + 16) << 32
                | raw.charCodeAt(i * 28 + 17) << 40
                | raw.charCodeAt(i * 28 + 18) << 48
                | raw.charCodeAt(i * 28 + 19) << 56,

            };

            /* tslint:enable:no-bitwise */
        }
        return ret;
    }

    public clearCache(): void {
        this.dataCache = [];
        this.plotCache = [];
        for (let a of this.plotter) {
            if (Array.isArray((<any>a).plotData)) {
                (<IMultiPlot>a).plotData.splice(0);
                (<IMultiPlot>a).dataUpdate();
            }
            else {
                (<ISinglePlot>a).plotData = null;
                (<ISinglePlot>a).dataUpdate();
            }
        }
    }

    public getSensorInfo(data: IPlotData, callback: (data: SensorInformation) => void) {
        this.getLoadedInfos((all: SensorInformation[]) => {
            for (let i = 0; i < all.length; i++) {
                if (all[i].ID === data.infos.IDs[0]) {
                    callback(all[i]);
                    break;
                }
            }
        });
    }

    public getSensorInfoNew(data: IDataSource<any>, callback: (data: SensorInformation) => void) {
        this.getLoadedInfos((all: SensorInformation[]) => {
            for (let i = 0; i < all.length; i++) {
                if (all[i].ID === data.infos.IDs[0]) {
                    callback(all[i]);
                    break;
                }
            }
        });
    }

    addEventListener(type: string, listener: any) {
        this.eventManager.addEventListener(type, listener);
    }

    removeEventListener(type: string, listener: any) {
        this.eventManager.removeEventListener(type, listener);
    }

    private plotLinker: IPlot[][] = [];

    public registerDeprecated(plotter: IPlot): void {
        this.plotter.push(plotter);
        if (!this.plotLinker[plotter.plotDataType]) {
            this.plotLinker[plotter.plotDataType] = [];
        }
        this.plotLinker[plotter.plotDataType].push(plotter);

        this.eventManager.raiseEvent(SensorManager.event_registerIPlot, null);
    }

    public register<T>(viewer: IViewerBase<T>): void {
        this.viewers.push(viewer);
        this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
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
        if (this.count === this.returned) {
            this.callback.apply(null, this.responses);
        }
    }
}

class SensorPlotInfo {
    IDs: number[] = [];
}

class SensorInformation {
    public ID: number;
    public Key: string;
    public Name: string;
    public Unit: string;
    public ValueInfo: SensorValueInformation;
}

class SensorValueInformation {
    public Key: string;
    public Unit: string;
    public Resolution: number;

    public Signed?: boolean;
    public MinValue?: number;
    public MaxValue?: number;
    public MinDisplay?: number;
    public MaxDisplay?: number;
}

class SensorInfoHelper {
    public static maxValue(info: SensorInformation): number {
        let val = 0;
        let temp = info.ValueInfo;
        if (temp.MaxDisplay) {
            val = temp.MaxDisplay;
        }
        else if (temp.MaxValue) {
            val = temp.MaxValue;
        }
        else {
            /* tslint:disable:no-bitwise */
            val = (1 << temp.Resolution) - 1;
            /* tslint:enable:no-bitwise */
        }
        return val;
    }

    public static minValue(info: SensorInformation): number {
        let val = 0;
        let temp = info.ValueInfo;
        if (temp.MinDisplay) {
            val = temp.MinDisplay;
        }
        else if (temp.MinValue) {
            val = temp.MinValue;
        }
        else if (temp.Signed) {
            val = -SensorInfoHelper.maxValue(info) - 1;
        }
        return val;
    }

    public static getPercent(info: SensorInformation, p: Point): Point {
        let min = SensorInfoHelper.minValue(info);
        let max = SensorInfoHelper.maxValue(info);

        let newVal = (p.y - min) / (max - min);
        return new Point(p.x, newVal);
    }
}

enum PlotType {
    I1D,
    I2D,
    I3D
}

interface IPlot {
    dataUpdate();
    plotType: string;
    plotDataType: PlotType;
    plotWindow: AppWindow;
}


interface ISinglePlot extends IPlot {
    plotData: IPlotData;
}

interface IMultiPlot extends IPlot {
    plotData: IPlotData[];
}