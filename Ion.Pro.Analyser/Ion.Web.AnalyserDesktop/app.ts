window.addEventListener("load", () => {
    startUp();
});


interface IClassType<T> {
    new (...param: any[]): T;
}

interface ITypeDef<T> {
    type: IClassType<T>;
}

interface IDataSource<T> extends ITypeDef<T> {
    infos: SensorPlotInfo;
    getValue(index: number): T;
    length(): number;
    color: Color;
}

class SensorGroup<T> implements IDataSource<T> {
    type: IClassType<T>;

    infos: SensorPlotInfo = new SensorPlotInfo();
    color: Color;

    public constructor(type: IClassType<T>) {
        this.type = type;
    }

    public getValue(index: number): T {
        return null;
    }

    public length(): number {
        return 0;
    }
}

class PointSensorGroup extends SensorGroup<Point>{
    private data: SensorDataContainer;

    constructor(data: SensorDataContainer) {
        super(Point);
        this.data = data;

        this.infos.IDs[0] = data.ID;
        this.color = data.color;
    }

    public getValue(index: number): Point {
        return this.data.points[index];
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
    dataSource: IDataSource<T>;
}

interface ICollectionViewer<T> extends IViewerBase<T>{
    dataCollectionSource: IDataSource<T>[];
}