class PlotData {
    points: Point[];
    ID: number;

    constructor(p: Point[]) {
        this.points = p;
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

