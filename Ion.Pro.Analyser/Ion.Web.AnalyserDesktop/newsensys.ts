namespace Kernel.SenSys {

    export class SensorManager implements IEventManager {
        private eventManager: EventManager = new EventManager();
        private sensorInformation: ISensorInformation[] = [];
        private loadedDataSet: SensorDataSet[] = [];
        public viewers: IViewerBase<any>[] = [];
        private dataSources: IDataSource<any>[] = [];
        public groups: (new (containers: SensorDataContainer[]) => SensorGroup<any>)[] = [];

        private telemetryDataSet: SensorDataSet = null;

        //static readonly event_registerViewer = "registerViewer";
        //static readonly event_unregisterViewer = "unregisterViewer";

        public constructor() {
            kernel.netMan.registerService(10, (data: any) => this.handleService(this.convertToSensorPackage(data.Sensors)));
            //this.loadSensorInformation();
        }

        private handleService(data: ISensorPackage[]) {
            //console.log("recived data!");
            if (this.telemetryDataSet) {
                for (let j = 0; j < data.length; j++) {
                    let realData = data[j];
                    //console.log(realData);
                    let sensId = realData.ID;
                    let realKey = this.telemetryDataSet.IdKeyMap[sensId];
                    if (!realKey) {
                        realKey = sensId.toString();
                    }
                    this.telemetryDataSet.SensorData[realKey].points.push(new SensorValue(realData.Value, realData.TimeStamp));
                    /*if (!this.telemetryDataSet.dataCache[sensId]) {
                        this.dataCache[sensId] = new SensorDataContainer(sensId);
                    }
                    this.dataCache[sensId].insertSensorPackage([realData]);*/
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
                    let data2: ISensorDataSet = JSON.parse(JSON.stringify(data));

                    let dataSet = new SensorDataSet(data);
                    data2.Name = "telemetry";
                    this.telemetryDataSet = new SensorDataSet(data2);
                    this.loadedDataSet.push(dataSet);
                    this.loadedDataSet.push(this.telemetryDataSet);
                    for (let v in dataSet.SensorData) {
                        this.dataSources.push(this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: this.telemetryDataSet.SensorData[v].ID, name: this.telemetryDataSet.Name }] }));
                        this.dataSources.push(this.createDataSource({ grouptype: "PointSensorGroup", key: "", layers: [], sources: [{ key: dataSet.SensorData[v].ID, name: dataSet.Name }] }));

                        //this.dataSources.push(new PointSensorGroup([dataSet.SensorData[v]]));
                    }
                    
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
            this.onRegisterViewer();
            //this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
        }

        public registerGroup(group: new (containers: SensorDataContainer[]) => SensorGroup<any>): void {
            this.groups.push(group);
        }

        public unregister<T>(viewer: IViewerBase<T>): void {
            let index = this.viewers.indexOf(viewer);
            this.viewers.splice(index, 1);
            this.onUnRegisterViewer();
            //this.eventManager.raiseEvent(SensorManager.event_unregisterViewer, null);
        }

        public getInfos(): ISensorInformation[] {
            return this.loadedDataSet[0].AllInfos;
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

        private pushToCache(data: ISensorPackage[]): SensorDataContainer {
            if (data.length > 0) {
                let key = this.loadedDataSet[0].IdKeyMap[data[0].ID];
                if (!key) {
                    key = data[0].ID.toString();
                }
                let temp = this.loadedDataSet[0].SensorData[key];

                temp.insertSensorPackage(data);

                console.log(this.dataSources);
                return temp;
            }
            return null;

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
                let dataContainer = this.pushToCache(this.convertToSensorPackage(data.Sensors));
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

        public getDataSet(name: string): SensorDataSet {
            for (let v of this.loadedDataSet) {
                if (v.Name === name) {
                    return v;
                }
            }
            console.log("Could not find dataset: " + name);
            return null;
        }

        public getSensorDataContainer(info: ISensorDataContainerTemplate): SensorDataContainer {
            let set: SensorDataSet = this.getDataSet(info.name);
            if (set) {
                let container: SensorDataContainer = set.SensorData[info.key];
                return container;
            }
            console.log("Could not find sensordatacontainer: " + info.name);
            return null;
        }

        public getGroup(name: string): new (containers: SensorDataContainer[]) => SensorGroup<any> {
            for (let v of this.groups) {
                if ((<any>v).name === name) {
                    return v;
                }
            }
            console.log("Could not find group: " + name);
            return null;
        }

        public createDataSource<T>(template: DataSourceTemplate): IDataSource<T> {
            let sources: SensorDataContainer[] = [];
            for (let v of template.sources) {
                sources.push(this.getSensorDataContainer(v));
            }
            let group = this.getGroup(template.grouptype);
            return new group(sources);
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
        public AllInfos: ISensorInformation[] = [];
        public KeyInfoMap: { [index: string]: ISensorInformation } = { };
        public LoadedKeys: string[] = [];
        public IdKeyMap: string[] = [];
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
                let temp = new SensorDataContainer(a);
                let sensInfo = this.KeyInfoMap[a];
                if (!sensInfo) {
                    sensInfo = {
                        ID: parseInt(a),
                        Key: a,
                        SensorSet: this,
                        Name: a,
                        MaxDisplay: null,
                        MaxValue: null,
                        MinDisplay: null,
                        MinValue: null,
                        Resolution: 0,
                        Signed: false,
                        Unit: null
                    }
                }
                temp.info = sensInfo;
                this.SensorData[temp.ID] = temp;
            }
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
        Unit: string;

        Resolution: number;
        Signed: boolean;
        MinValue: number;
        MaxValue: number;
        MinDisplay: number;
        MaxDisplay: number;

        SensorSet: SensorDataSet;
    }
}