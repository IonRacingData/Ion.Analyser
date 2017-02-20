﻿window.addEventListener("load", () => {

    let a: IDataSource<Point>;


    a = new PointSensorGroup();

    console.log(a.type == Point); 

    console.log(new a.type(5, 6));

    let testArray: IDataSource<any>[] = [];
    testArray.push(a);

    function getFrom<T>(type: IClassType<T>): IDataSource<T> {
        for (let val of testArray) {
            if (val.type === type) {
                return val;
            }
        }
        return null;
    }

    let b = <ITypeDef<Point>>getFrom(Point);
    
    alert((<any>b.type).name);



    let g: IViewerBase = new TestClass();

    

    //startUp();
    function isViewer<T>(test: IViewerBase): test is IViewer<T> {
        return (<IViewer<T>>test).dataSource !== undefined;
    }

    function isTypeDef(value: any): value is ITypeDef<any> {
        return (<ITypeDef<any>>value).type !== undefined;
    }


    if (isViewer<Point>(g)) {
    }
    
     
});



interface IClassType<T> {
    new (...param: any[]): T;
}

interface ITypeDef<T> {
    type: IClassType<T>;
}


interface IDataSource<T> extends ITypeDef<T> {
    getValue(index: number): T;
    length(): number;
}

class SensorGroup<T> implements IDataSource<T> {
    type: IClassType<T>;

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
    constructor() {
        super(Point);
    }
}

interface IViewerBase {
    dataUpdate(): void;
    plotType: string;
    plotWindow: AppWindow;
}

interface IViewer<T> extends IViewerBase, ITypeDef<T> {
    dataSource: IDataSource<T>;
}

interface ICollectionViewer<T> extends IViewerBase, ITypeDef<T> {
    dataCollectionSource: IDataSource<T>[];
}

class TestClass implements IViewer<Point>{
    plotType: string;
    plotWindow: AppWindow;
    dataSource: IDataSource<Point>;
    type: IClassType<Point> = Point;

    public dataUpdate(): void {
    }

}