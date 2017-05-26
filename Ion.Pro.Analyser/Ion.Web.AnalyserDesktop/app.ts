import sensys = Kernel.SenSys;

window.addEventListener("load", () => {
    startUp();
});

window.onbeforeunload = function (e) {
    /*e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';*/
};

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

    public subplots(): number
    {
        return 1;
    }
}

class PointSensorGroup extends SensorGroup<Point>{
    private data: SensorDataContainer;
    static numGroups: number = 1;

    constructor(data: SensorDataContainer[]) {
        super(Point);
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

interface ICollectionViewer<T> extends IViewerBase<T>{
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
