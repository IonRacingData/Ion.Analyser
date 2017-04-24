class Color {
    public r: number;
    public g: number;
    public b: number;
    public a?: number = null;

    constructor(r: number, g: number, b: number)
    constructor(r: number, g: number, b: number, a?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        if (a) {
            this.a = a;
        }
    }

    public toString(): string {
        if (this.a) {
            return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() + ")";
        }
        else {
            return "rgb(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ")";
        }
    }

    public static randomColor(lowLimit: number, highLimit: number): Color {

        let r = 0;
        let g = 0;
        let b = 0;

        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        }
        while (r + g + b > lowLimit && r + g + b < highLimit);

        return new Color(r, g, b);
    }
}

class SensorDataContainer {
    public ID: string;
    public color: Color;
    public points: SensorValue[];
    public info: sensys.ISensorInformation;


    constructor(id: string)
    constructor(id: string, p: SensorValue[] = []) {
        this.ID = id;
        this.points = p;
        this.color = Color.randomColor(0, 255 + 128);
    }

    insertSensorPackage(p: ISensorPackage[]) {
        this.insertData(p.map((value: ISensorPackage, index: number, array: ISensorPackage[]) => { return new SensorValue(value.Value, value.TimeStamp); }));
    }

    pushArray<T>(to: T[], from: T[]) {
        for (let i = 0; i < from.length; i++) {
            to.push(from[i]);
        }
    }

    insertData(p: SensorValue[]) {
        if (p.length > 0) {
            if (this.points.length === 0) {
                this.pushArray(this.points, p);
                //this.points.push(...p);
            }
            else {
                let first = p[0];
                let last = p[p.length - 1];
                if (first.timestamp > this.last().timestamp) {
                    this.pushArray(this.points, p);
                    //this.points.push(...p);
                }
                else if (last.timestamp < this.points[0].timestamp) {
                    this.points.splice(0, 0, ...p);
                }
                else {
                    let index = this.getClosesIndexOf(first);
                    if (first.timestamp > this.points[index].timestamp) {
                        index--;
                    }
                    this.points.splice(index, 0, ...p);
                }
            }
        }
    }

    last(): SensorValue {
        return this.points[this.points.length - 1];
    }

    getClosest(p: SensorValue): SensorValue {
        return this.points[this.getClosesIndexOf(p)];
    }

    // returns index of closest point to 'p' on x-axis
    getClosesIndexOf(p: SensorValue): number {
        var min: number = 0;
        var max: number = this.points.length - 1;
        var half: number;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin: number = p.timestamp - this.points[min].timestamp;
                var diffMax: number = this.points[max].timestamp - p.timestamp;
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }

            }
            else if (p.timestamp < this.points[half].timestamp) {
                max = half;
            }
            else if (p.timestamp > this.points[half].timestamp) {
                min = half;
            }
            else {
                return half;
            }
        }
    }
}

class SensorValue
{
    public value: number = 0;
    public timestamp: number = 0;

    constructor(value: number, timestamp: number) {
        this.value = value;
        this.timestamp = timestamp;
    }

    public getPoint(): Point {
        return new Point(this.timestamp, this.value);
    }
}

class PlotDataHelper {
    public static getClosest(plotData: IDataSource<Point>, p: Point): Point {
        return plotData.getValue(PlotDataHelper.getIndexOf(plotData, p));
    }

    public static getIndexOf(plotData: IDataSource<Point>, p: Point): number {
        if (plotData.length() == 0) {
            return -1;
        }
        var min: number = 0;
        var max: number = plotData.length() - 1;
        var half: number;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin: number = p.x - plotData.getValue(min).x;
                var diffMax: number = plotData.getValue(max).x - p.x;
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }

            }
            else if (p.x < plotData.getValue(half).x) {
                max = half;
            }
            else if (p.x > plotData.getValue(half).x) {
                min = half;
            }
            else {
                return half;
            }
        }
    }
}

class GPSPlotData {
    points: Point3D[];

    constructor(p: Point3D[]) {
        this.points = p;
    }
}

interface IPoint<T> {
    add(p: T): T;
    sub(p: T): T;
    multiply(p: T): T;
    divide(p: T): T;
}

class Point implements IPoint<Point> {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    sub(p: Point): Point {
        return new Point(this.x - p.x, this.y - p.y);
    }

    multiply(p: Point): Point {
        return new Point(this.x * p.x, this.y * p.y);
    }

    divide(p: Point): Point {
        return new Point(this.x / p.x, this.y / p.y);
    }

    toString(): string {
        return "x: " + this.x.toString() + "  y: " + this.y.toString();
    }
}

class Point3D implements IPoint<Point3D> {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(p: Point3D): Point3D {
        return new Point3D(this.x + p.x, this.y + p.y, this.z + p.z);
    }

    sub(p: Point3D): Point3D {
        return new Point3D(this.x - p.x, this.y - p.y, this.z - p.z);
    }

    multiply(p: Point3D): Point3D {
        return new Point3D(this.x * p.x, this.y * p.y, this.z * p.z);
    }

    divide(p: Point3D): Point3D {
        return new Point3D(this.x / p.x, this.y / p.y, this.z / p.z);
    }

    toString(): string {
        return "x: " + this.x.toString() + "  y: " + this.y.toString() + "  z: " + this.z.toString();
    }
}

class Point4D implements IPoint<Point4D> {
    public x: number;
    public y: number;
    public z: number;
    public i: number;

    constructor(x: number, y: number, z: number, i: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.i = i;
    }

    add(p: Point4D): Point4D {
        return new Point4D(this.x + p.x, this.y + p.y, this.z + p.z, this.i + p.i);
    }

    sub(p: Point4D): Point4D {
        return new Point4D(this.x - p.x, this.y - p.y, this.z - p.z, this.i - p.i);
    }

    multiply(p: Point4D): Point4D {
        return new Point4D(this.x * p.x, this.y * p.y, this.z * p.z, this.i * p.i);
    }

    divide(p: Point4D): Point4D {
        return new Point4D(this.x / p.x, this.y / p.y, this.z / p.z, this.i / p.i);
    }
}