/*class SensorManager implements IEventManager {
    private dataCache: SensorDataContainer[] = [];
    private eventManager: EventManager = new EventManager();
    private sensorInformations: SensorInformation[];

    public viewers: IViewerBase<any>[] = [];
    private dataSources: IDataSource<any>[] = [];

    static readonly event_registerIPlot = "registerIPlot";
    static readonly event_registerViewer = "registerViewer";

    constructor() {
        kernel.netMan.registerService(10, (data: any) => this.handleService(this.convertToSensorPackage(data.Sensors)));
        this.getLoadedIds((ids: number[]) => { });

    }

    private handleService(data: ISensorPackage[]) {
        for (let j = 0; j < data.length; j++) {
            let realData = data[j];
            let sensId = realData.ID;
            if (!this.dataCache[sensId]) {
                this.dataCache[sensId] = new SensorDataContainer(sensId);
            }
            this.dataCache[sensId].insertSensorPackage([realData]);
        }
        this.updateAllPlotters();
    }

    private convertData(data: ISensorPackage[]): SensorDataContainer {
        if (data.length < 1) {
            return null;
        }

        let plot = new SensorDataContainer(data[0].ID);
        plot.insertSensorPackage(data);

        return plot;
    }

    private convertToSensorPackage(str: string): ISensorPackage[] {
        let raw = atob(str);
        let ret: ISensorPackage[] = [];
        for (let i = 0; i < raw.length / 28; i++) {
            /*console.log(raw.charCodeAt(i * 28));
            console.log(raw.charCodeAt(i * 28 + 1));
            console.log(raw.charCodeAt(i * 28 + 2));
            console.log(raw.charCodeAt(i * 28 + 3));
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
            /* tslint:disable:no-bitwise
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

            };

            /* tslint:enable:no-bitwise
        }
        return ret;
    }

    private pushToCache(data: ISensorPackage[]): SensorDataContainer {
        if (data.length > 0) {
            let temp = this.dataCache[data[0].ID];

            temp.insertSensorPackage(data);

            console.log(this.dataSources);
            return temp;
        }
        return null;
        
    }

    private loadData(id: number, callback: (data: SensorDataContainer) => void): void {

        kernel.netMan.sendMessage("/sensor/getdata", { num: id }, (data: any) => {
            let dataContainer = this.pushToCache(this.convertToSensorPackage(data.Sensors));
            callback(dataContainer);
        });
        /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
            this.dataCache[id] = data;
            callback(data);
        });
    }

    private loadSensorInformation(): void {
        requestAction("GetIds", (ids: SensorInformation[]) => {
            this.sensorInformations = ids;
            //callback(this.sensorInformations);
        });
    }

    private updateAllPlotters() {
        for (let i = 0; i < this.viewers.length; i++) {
            this.viewers[i].dataUpdate();
        }
    }
    
    
    public getInfos(callback: (ids: SensorInformation[]) => void): void {
        if (this.sensorInformations !== undefined && this.sensorInformations !== null && this.sensorInformations.length > 0) {
            callback(this.sensorInformations);
        }
        requestAction("GetIds", (ids: SensorInformation[]) => {
            this.sensorInformations = ids;
            callback(this.sensorInformations);
        });
    }

    public getLoadedIds(callback: (ids: number[]) => void): void {
        requestAction("GetLoadedIds", (ids: number[]) => {
            ids.forEach((value: number, index: number, array: number[]) => {
                if (!this.dataCache[value]) {
                    this.dataCache[value] = new SensorDataContainer(value);
                    let a = new PointSensorGroup(this.dataCache[value]);
                    this.dataSources.push(a);
                }
            });
            
            callback(ids);
        });
    }

    public getLoadedInfos(callback: (ids: SensorInformation[]) => void): void {
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

    public getSensorData(id: number, callback: (data: SensorDataContainer) => void): void {
        if (!this.dataCache[id]) {
            this.loadData(id, callback);
        }
        else {
            callback(this.dataCache[id]);
        }
    }


    public clearCache(): void {
        this.dataCache = [];
        this.sensorInformations = null;
        for (let a of this.viewers) {
            if (SensorManager.isCollectionViewer(a)) {
                a.dataCollectionSource.splice(0);

            }
            else if (SensorManager.isViewer(a)) {
                a.dataSource = null;
            }
            else {
                console.log("[SensorManager.clearChache()] Here is something wrong ...");
            }
            a.dataUpdate();
        }
    }

    public getSensorInfo(data: IDataSource<any>, callback: (data: SensorInformation) => void): void {
        this.getLoadedInfos((all: SensorInformation[]) => {
            for (let i = 0; i < all.length; i++) {
                if (all[i].Key === data.infos.IDs[0]) {
                    callback(all[i]);
                    break;
                }
            }
        });
    }

    public addEventListener(type: string, listener: any): void {
        this.eventManager.addEventListener(type, listener);
    }

    public removeEventListener(type: string, listener: any): void {
        this.eventManager.removeEventListener(type, listener);
    }

    public register<T>(viewer: IViewerBase<T>): void {
        this.viewers.push(viewer);
        this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
    }

    public getDataSources<T>(type: IClassType<T>): IDataSource<T>[] {
        let returnArray: IDataSource<T>[] = [];
        for (let cur of this.dataSources) {
            if (SensorManager.isDatasource(cur, type)) {
                returnArray.push(cur);
            }
        }
        return returnArray;
    }

    public fillDataSource<T>(source: IDataSource<T>, callback: () => void): void {
        let multiback = new Multicallback(source.infos.IDs.length, (...params: SensorDataContainer[]) => {
            callback();
        });

        for (let i = 0; i < source.infos.IDs.length; i++) {
            this.loadData(source.infos.IDs[i], multiback.createCallback());
        }

    }



    public static isDatasource<T>(source: IDataSource<T>, type: IClassType<T>): source is IDataSource<T> {
        return source.type === type;
    }

    public static isViewer(value: IViewerBase<any>): value is IViewer<any> {
        return (<IViewer<any>>value).dataSource !== undefined;
    }

    public static isCollectionViewer(value: IViewerBase<any>): value is ICollectionViewer<any> {
        return (<ICollectionViewer<any>>value).dataCollectionSource !== undefined;
    }
}

*/
var Multicallback = (function () {
    function Multicallback(count, callback) {
        this.responses = [];
        this.curId = 0;
        this.returned = 0;
        this.callback = callback;
        this.count = count;
    }
    Multicallback.prototype.createCallback = function () {
        var _this = this;
        var current = this.curId;
        this.curId++;
        return function (param) {
            _this.responses[current] = param;
            _this.returned++;
            _this.checkReturn();
        };
    };
    Multicallback.prototype.checkReturn = function () {
        if (this.count === this.returned) {
            this.callback.apply(null, this.responses);
        }
    };
    return Multicallback;
}());
var SensorPlotInfo = (function () {
    function SensorPlotInfo() {
        this.IDs = [];
        this.SensorInfos = [];
    }
    return SensorPlotInfo;
}());
var SensorInformation = (function () {
    function SensorInformation() {
    }
    return SensorInformation;
}());
var SensorValueInformation = (function () {
    function SensorValueInformation() {
    }
    return SensorValueInformation;
}());
var SensorInfoHelper = (function () {
    function SensorInfoHelper() {
    }
    SensorInfoHelper.maxValue = function (info) {
        var val = 0;
        if (info.MaxDisplay) {
            val = info.MaxDisplay;
        }
        else if (info.MaxValue) {
            val = info.MaxValue;
        }
        else {
            /* tslint:disable:no-bitwise */
            val = (1 << info.Resolution) - 1;
        }
        return val;
    };
    SensorInfoHelper.minValue = function (info) {
        var val = 0;
        if (info.MinDisplay) {
            val = info.MinDisplay;
        }
        else if (info.MinValue) {
            val = info.MinValue;
        }
        else if (info.Signed) {
            val = -SensorInfoHelper.maxValue(info) - 1;
        }
        return val;
    };
    SensorInfoHelper.getPercent = function (info, p) {
        var min = SensorInfoHelper.minValue(info);
        var max = SensorInfoHelper.maxValue(info);
        var newVal = (p.y - min) / (max - min);
        return new Point(p.x, newVal);
    };
    return SensorInfoHelper;
}());
//# sourceMappingURL=sensys.js.map