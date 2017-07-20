namespace Kernel.SenSys {
    export class SensorManager implements IEventManager {
        private eventManager: EventManager = new EventManager();
        private sensorInformation: ISensorInformation[] = [];
        private loadedDataSet: SensorDataSet[] = [];
        public viewers: IViewerBase<any>[] = [];
        private dataSources: IDataSource<any>[] = [];
        public groups: (new (containers: SensorDataContainer[]) => SensorGroup<any>)[] = [];

        private __telemetryAvailable = false;
        get telemetryAvailable() {
            return this.__telemetryAvailable;
        }

        private telemetryDataSet: SensorDataSet | null = null;

        //static readonly event_registerViewer = "registerViewer";
        //static readonly event_unregisterViewer = "unregisterViewer";

        public constructor() {

            //this.loadSensorInformation();
        }

        public lateInit(): void {
            kernel.netMan.registerService(10, (path: string, data: any) => {
                switch (path) {
                    case "/sensor/start":
                        this.registerTelemetry(data);
                        break;
                    case "/sensor/update":
                        this.handleService(this.convertToSensorPackage(data.Sensors));
                        break;
                }
            });


            requestAction("GetInfo", (data: { telemetry: boolean, version: string }) => {
                if (data.telemetry) {
                    this.load("telemetry");
                }
            });
        }

        private registerTelemetry(data: ISensorDataSet) {
            console.log(data);
            let dataSet = new SensorDataSet(data);
            this.telemetryDataSet = dataSet;
            this.__telemetryAvailable = true;
            this.loadedDataSet.push(dataSet);
        }

        private handleService(data: ISensorPackage[]) {
            //console.log("recived data!");
            if (this.telemetryDataSet) {
                for (let j = 0; j < data.length; j++) {
                    this.telemetryDataSet.insertData(data[j]);
                }
                this.refreshViewers();
            }
            /**/
        }

        private refreshViewers() {
            for (let v of this.viewers) {
                v.dataUpdate();
            }
        }

        public addEventListener(type: string, handeler: any): void {
            this.eventManager.addEventListener(type, handeler);
        }

        public removeEventListener(type: string, handeler: any): void {
            this.eventManager.removeEventListener(type, handeler);
        }

        private loadSensorInformation(): void {
            requestAction("GetSensorInformation", (ids: ISensorInformation[]) => {

            });
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

        public getAvailable(callback: (data: string[]) => void): void {
            requestAction("Available", callback);
        }

        public load(file: string, callback?: (data: ISensorDataSet) => void): void {
            requestAction("LoadNewDataSet?file=" + file, (data: ISensorDataSet) => {
                if (!(<any>data).data) {

                    let dataSet = new SensorDataSet(data);
                    this.loadedDataSet.push(dataSet);

                    if (dataSet.Name == "telemetry") {
                        this.__telemetryAvailable = true;
                        this.telemetryDataSet = dataSet;
                    }

                    /*for (let v in dataSet.SensorData) {
                        let temp = this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: dataSet.SensorData[v].ID, name: dataSet.Name }] });
                        if (temp) {
                            this.dataSources.push(temp);
                        }

                        //this.dataSources.push(new PointSensorGroup([dataSet.SensorData[v]]));
                    }*/


                }
                console.log(data);
                if (callback) {
                    callback(data);
                }
            });
        }

        public onRegisterViewer = newEvent("SensorManager.onRegisterViewer");
        public onUnRegisterViewer = newEvent("SensorManager.onUnRegisterViewer");

        public register<T>(viewer: IViewerBase<T>): void {
            this.viewers.push(viewer);
            console.log("New register view");
            this.onRegisterViewer({ target: this });
            //this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
        }

        public registerGroup(group: new (containers: SensorDataContainer[]) => SensorGroup<any>): void {
            this.groups.push(group);
        }

        public registerDataSource(source: IDataSource<any>): void {
            this.dataSources.push(source);
        }

        public unregister<T>(viewer: IViewerBase<T>): void {
            let index = this.viewers.indexOf(viewer);
            this.viewers.splice(index, 1);
            this.onUnRegisterViewer({ target: this });
            //this.eventManager.raiseEvent(SensorManager.event_unregisterViewer, null);
        }

        public getInfos(): ISensorInformation[] {
            return this.loadedDataSet[0].AllInfos;
        }

        public getLoadedDatasets(): SensorDataSet[] {
            return this.loadedDataSet;

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

        private pushToCache(data: ISensorPackage[], info: ISensorInformation): SensorDataContainer {
            if (data.length > 0) {
                let id = data[0].ID;
                let key = info.SensorSet.IdKeyMap[id];//  this.loadedDataSet[0].IdKeyMap[data[0].ID];
                if (!key) {
                    key = id.toString();
                }
                let temp = info.SensorSet.SensorData[key];

                temp.insertSensorPackage(data);

                console.log(this.dataSources);
                return temp;
            }
            throw "Empty dataset exception";

        }

        private loadData(info: ISensorInformation, callback: (data: SensorDataContainer) => void): void {
            console.log("loadData");
            console.log(info);

            for (let i = 0; i < this.callbackStack.length; i++) {
                let item = this.callbackStack[i];
                if (item.name === info.SensorSet.Name && item.key === info.Key) {
                    this.callbackStack[i].callbacks.push(callback);
                    return;
                }
            }
            let all = { name: info.SensorSet.Name, key: info.Key, callbacks: [callback] };
            this.callbackStack.push(all);
            kernel.netMan.sendMessage("/sensor/getdata", { num: info.ID, dataset: info.SensorSet.Name }, (data: any) => {
                let dataContainer = this.pushToCache(this.convertToSensorPackage(data.Sensors), info);
                console.log(all);
                for (let i = 0; i < all.callbacks.length; i++) {
                    all.callbacks[i](dataContainer);
                }
                this.callbackStack.splice(this.callbackStack.indexOf(all), 1);
            });
            /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
                this.dataCache[id] = data;
                callback(data);
            });*/
        }

        private callbackStack: { name: string, key: string, callbacks: ((data: SensorDataContainer) => void)[] }[] = [];

        public fillDataSource<T>(source: IDataSource<T>, callback: () => void): void {
            if (source.length() > 0) {
                callback();
                return;
            }
            let multiback = new Multicallback(source.infos.Keys.length, (...params: SensorDataContainer[]) => {
                callback();
            });

            for (let i = 0; i < source.infos.Keys.length; i++) {
                this.loadData(source.infos.SensorInfos[i], multiback.createCallback());
            }

        }

        public getDataSet(name: string): SensorDataSet | null {
            for (let v of this.loadedDataSet) {
                if (v.Name === name) {
                    return v;
                }
            }
            console.log("Could not find dataset: " + name);
            return null;
        }

        public getSensorDataContainer(info: ISensorDataContainerTemplate): SensorDataContainer | null {
            let set: SensorDataSet | null = this.getDataSet(info.name);
            if (set) {
                let container: SensorDataContainer = set.SensorData[info.key];
                return container;
            }
            console.log("Could not find sensordatacontainer: " + info.name);
            return null;
        }

        public getGroup(name: string): (new (containers: SensorDataContainer[]) => SensorGroup<any>) | null {
            for (let v of this.groups) {
                if ((<any>v).name === name) {
                    return v;
                }
            }
            console.log("Could not find group: " + name);
            return null;
        }

        public getGroupByType(type: IClassType<any>): (new (container: SensorDataContainer[]) => SensorGroup<any>) | null {
            for (let v of this.groups) {
                if ((<any>v).type === type) {
                    return v;
                }
            }
            return null;
        }

        public createDataSource<T>(template: DataSourceTemplate): IDataSource<T> | null {
            let sources: SensorDataContainer[] = [];
            for (let v of template.sources) {
                let temp = this.getSensorDataContainer(v);
                if (temp) {
                    sources.push(temp);
                }
                else {
                    console.log(template);
                    console.log("Got empty dataset");
                }
            }
            let group = this.getGroup(template.grouptype);
            if (group && ((group as any).numGroups as number) === sources.length) {
                return new group(sources);
            }
            else {
                console.log("Failed to create dataset");
                console.log(template);
                return null;
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

    export class SensorDataSet {
        public Name: string;
        // List of all information
        public AllInfos: ISensorInformation[] = [];
        // Mapping from key to information
        public KeyInfoMap: { [index: string]: ISensorInformation } = {};
        // All loaded keys on the web server
        public LoadedKeys: string[] = [];
        // ID to Key Mapping
        public IdKeyMap: string[] = [];
        // The actual sensordata
        public SensorData: { [index: string]: SensorDataContainer } = { };

        public constructor(data: ISensorDataSet) {
            this.Name = data.Name;
            this.LoadedKeys = data.LoadedKeys;
            this.AllInfos = data.AllInfos;
            for (let a of this.AllInfos) {
                this.IdKeyMap[a.ID] = a.Key;
                this.KeyInfoMap[a.Key] = a;
                a.SensorSet = this;
            }
            for (let a of this.LoadedKeys) {
                this.createLoadedKey(a);
            }
        }

        private createLoadedKey(key: string): void{
            let temp = new SensorDataContainer(key);
            let sensInfo = this.KeyInfoMap[key];
            if (!sensInfo) {
                sensInfo = {
                    ID: parseInt(key),
                    Key: key,
                    SensorSet: this,
                    Name: key,
                    Resolution: 0
                }
            }
            temp.info = sensInfo;
            this.SensorData[temp.ID] = temp;
        }

        public insertData(pack: ISensorPackage) {
            let key = this.IdKeyMap[pack.ID];
            if (!key)
                key = pack.ID.toString();
            if (!this.SensorData[key]) {
                this.LoadedKeys.push(key);
                this.createLoadedKey(key);
            }
            //TODO: Potential bug if the telemetry data restart, maybe use insertData
            this.SensorData[key].points.push(new SensorValue(pack.Value, pack.TimeStamp));
        }
    }

    export interface ISensorDataSet {
        Name: string;
        AllInfos: ISensorInformation[];
        LoadedKeys: string[];
    }


    export interface ISensorInformation {
        Key: string;

        ID: number;

        Name: string;
        Unit?: string;

        Resolution: number;
        Signed?: boolean;
        MinValue?: number;
        MaxValue?: number;
        MinDisplay?: number;
        MaxDisplay?: number;

        SensorSet: SensorDataSet;
    }
}

interface IClassType<T> {
    new (...param: any[]): T;
}

interface ITypeDef<T> {
    type: IClassType<T>;
}

interface IDataSource<T> extends ITypeDef<T> {
    infos: SensorPlotInfo;
    getValue(index: number, subplot?: number): T;
    length(subplot?: number): number;
    subplots(): number;
    color: Color;
}

class SensorGroup<T> implements IDataSource<T> {
    type: IClassType<T>;
    static type: IClassType<any>;

    infos: SensorPlotInfo = new SensorPlotInfo();
    color: Color;
    static numGroups: number;

    public constructor(type: IClassType<T>) {
        this.type = type;
    }

    public getValue(index: number, subplot: number = 0): T {
        throw "Not implmeneted exception";
    }

    public length(subplot: number = 0): number {
        return 0;
    }

    public subplots(): number {
        return 1;
    }
}

class PointSensorGroup extends SensorGroup<Point>{
    private data: SensorDataContainer;
    static numGroups: number = 1;
    static type: IClassType<Point> = Point;

    constructor(data: SensorDataContainer[]) {
        super(Point);
        if (!data || data.length < 1) {
            console.log(data);
            throw new Error("Empty array argument detected");
        }
        this.data = data[0];

        this.infos.Keys[0] = data[0].ID;
        this.infos.SensorInfos[0] = data[0].info;
        this.color = data[0].color;
    }

    public getValue(index: number): Point {
        if (index < this.length() && index >= 0) {
            return this.data.points[index].getPoint();
        }
        throw "Index out of bounds exception";
    }

    public length(): number {
        return this.data.points.length;
    }
}

class Point3DSensorGroup extends SensorGroup<Point3D>{
    private dataX: SensorDataContainer;
    private dataY: SensorDataContainer;
    static numGroups: number = 2;
    static type: IClassType<Point3D> = Point3D;

    constructor(data: SensorDataContainer[]) {
        super(Point3D);
        if (!data || data.length < 2) {
            console.log(data);
            throw new Error("Too few arguments given");
        }

        this.dataX = data[0];
        this.dataY = data[1];

        this.infos.Keys[0] = data[0].ID;
        this.infos.SensorInfos[0] = data[0].info;

        this.infos.Keys[1] = data[1].ID;
        this.infos.SensorInfos[1] = data[1].info;

        this.color = this.dataX.color;
    }

    public getValue(index: number): Point3D {
        let max = this.length();
        let percent = index / max;
        let x = percent * this.dataX.points.length;
        let y = percent * this.dataY.points.length;
        let intX = x | 0;
        let intY = y | 0;
        let partX = x - intX;
        let partY = y - intY;

        let valX = this.dataX.points[intX];
        let valY = this.dataY.points[intY];

        return new Point3D(valX.value, valY.value, valX.timestamp);


    }

    public length(): number {
        return Math.max(this.dataX.points.length, this.dataY.points.length);
    }
}

class DataSourceInfo<T> {

}

interface IViewerBase<T> extends ITypeDef<T> {
    dataUpdate(): void;
    plotType: string;
    plotWindow: AppWindow;
}

interface IViewer<T> extends IViewerBase<T> {
    dataSource: IDataSource<T> | null;
}

interface ICollectionViewer<T> extends IViewerBase<T> {
    dataCollectionSource: IDataSource<T>[];
}

class DataSourceTemplate {
    public key: string;
    public sources: ISensorDataContainerTemplate[] = [];
    public grouptype: string;
    public layers: string[] = [];
}

interface ISensorDataContainerTemplate {
    name: string;
    key: string;
}