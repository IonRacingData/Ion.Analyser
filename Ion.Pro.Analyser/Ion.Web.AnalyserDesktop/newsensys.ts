namespace Kernel.SenSys {

    export class SensorManager implements IEventManager {
        private eventManager: EventManager = new EventManager();
        private sensorInformation: ISensorInformation[] = [];
        private loadedDataSet: SensorDataSet[] = [];
        public viewers: IViewerBase<any>[] = [];
        private dataSources: IDataSource<any>[] = [];

        static readonly event_registerViewer = "registerViewer";

        public constructor() {
            //this.loadSensorInformation();
        }

        public addEventListener(type: string, handeler: any): void {

        }

        public removeEventListener(type: string, handeler: any): void {

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
                    this.loadedDataSet.push(new SensorDataSet(data));
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
                let temp = this.loadedDataSet[0].SensorData[data[0].ID];

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
            });*/
        }

        public fillDataSource<T>(source: IDataSource<T>, callback: () => void): void {
            let multiback = new Multicallback(source.infos.IDs.length, (...params: SensorDataContainer[]) => {
                callback();
            });

            for (let i = 0; i < source.infos.IDs.length; i++) {
                this.loadData(source.infos.SensorInfos[i].ID, multiback.createCallback());
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
        public LoadedKeys: string[] = [];
        public SensorData: SensorDataContainer[] = [];

        public constructor(data: ISensorDataSet) {
            this.Name = data.Name;
            this.LoadedKeys = data.LoadedKeys;
            this.AllInfos = data.AllInfos;
            for (let a of this.AllInfos) {
                let temp = new SensorDataContainer(a.Key);
                temp.info = a;
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



