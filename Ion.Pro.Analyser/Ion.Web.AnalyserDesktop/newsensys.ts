namespace Kernel.SenSys {

    export class SensorManager implements IEventManager {
        private eventManager: EventManager = new EventManager();
        private sensorInformation: ISensorInformation[] = [];
        private loadedDataSet: SensorDataSet[] = [];
        public viewers: IViewerBase<any>[] = [];
        private dataSources: IDataSource<any>[] = [];

        static readonly event_registerViewer = "registerViewer";
        static readonly event_unregisterViewer = "unregisterViewer";

        public constructor() {
            //this.loadSensorInformation();
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
                    for (let v in dataSet.SensorData) {
                        this.dataSources.push(new PointSensorGroup(dataSet.SensorData[v]));
                    }
                    this.loadedDataSet.push(dataSet);
                }
                console.log(data);
                if (callback) {
                    callback(data);
                }
            });
        }

        public register<T>(viewer: IViewerBase<T>): void {
            this.viewers.push(viewer);
            this.eventManager.raiseEvent(SensorManager.event_registerViewer, null);
        }

        public unregister<T>(viewer: IViewerBase<T>): void {
            let index = this.viewers.indexOf(viewer);
            this.viewers.splice(index, 1);
            this.eventManager.raiseEvent(SensorManager.event_unregisterViewer, null);
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
                let temp = this.loadedDataSet[0].SensorData[key];

                temp.insertSensorPackage(data);

                console.log(this.dataSources);
                return temp;
            }
            return null;

        }

        private loadData(info: ISensorInformation, callback: (data: SensorDataContainer) => void): void {

            kernel.netMan.sendMessage("/sensor/getdata", { num: info.ID, dataset: info.SensorSet.Name }, (data: any) => {
                let dataContainer = this.pushToCache(this.convertToSensorPackage(data.Sensors));
                callback(dataContainer);
            });
            /*requestAction("getdata?number=" + id.toString(), (data: ISensorPackage[]) => {
                this.dataCache[id] = data;
                callback(data);
            });*/
        }

        public fillDataSource<T>(source: IDataSource<T>, callback: () => void): void {
            let multiback = new Multicallback(source.infos.Keys.length, (...params: SensorDataContainer[]) => {
                callback();
            });

            for (let i = 0; i < source.infos.Keys.length; i++) {
                this.loadData(source.infos.SensorInfos[i], multiback.createCallback());
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



