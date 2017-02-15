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

    public toString() {
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

class PlotData {
    ID: number;
    color: Color;
    points: Point[];

    constructor(p: Point[]) {
        this.points = p;
        this.color = Color.randomColor(0, 255 + 128);
    }

    getClosest(p: Point): Point {
        return this.points[this.getIndexOf(p)];
    }

    // returns index of closest point to 'p' on x-axis
    getIndexOf(p: Point): number {
        var min: number = 0;
        var max: number = this.points.length - 1;
        var half: number;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin: number = p.x - this.points[min].x;
                var diffMax: number = this.points[max].x - p.x;
                if (diffMin < diffMax) {
                    return min;
                }
                else {
                    return max;
                }

            }
            else if (p.x < this.points[half].x) {
                max = half;
            }
            else if (p.x > this.points[half].x) {
                min = half;
            }
            else {
                return half;
            }
        }
    }
}

class PlotDataHelper {
    public static getClosest(plotData: IPlotData, p: Point): Point {
        return plotData.getValue(PlotDataHelper.getIndexOf(plotData, p));
    }

    public static getIndexOf(plotData: IPlotData, p: Point): number {
        var min: number = 0;
        var max: number = plotData.getLength() - 1;
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

class Point {

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

    copy(): Point {
        return new Point(this.x, this.y);
    }

    toString(): string {
        return "x: " + this.x.toString() + "  y: " + this.y.toString();        
    }
}

class Point3D {
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

interface IPlotData {
    ID: number;
    color: Color;

    getLength(): number;
    getValue(index: number): Point;
    getLastValue(): Point;
}

class PlotDataViewer implements IPlotData {
    public ID: number;
    public color: Color;
    private realData: PlotData;


    constructor(realData: PlotData) {
        this.realData = realData;
        this.ID = realData.ID;
        this.color = realData.color;
    }

    public getLength(): number {
        return this.realData.points.length;
    }

    public getValue(index: number): Point {
        return this.realData.points[index];
    }

    public getLastValue(): Point {
        return this.realData.points[this.realData.points.length - 1];
    }
}
