class PlotData {
    ID: number;

    points: Point[];

    constructor(p: Point[]) {
        this.points = p;
    }

    getClosest(p: Point): Point {
        return this.points[this.getIndexOf(p)];
    }

    // returns index of closest point to 'p' on x-axis
    getIndexOf(p: Point): number {
        var min = 0;
        var max = this.points.length - 1;
        var half;
        while (true) {
            half = Math.floor((min + max) / 2);
            if (half === min) {
                var diffMin = p.x - this.points[min].x;
                var diffMax = this.points[max].x - p.x;
                if (diffMin < diffMax)
                    return min;
                else
                    return max;

            }
            else if (p.x < this.points[half].x) {
                max = half;
            }
            else if (p.x > this.points[half].x) {
                min = half;
            }
            else {
                return half
            }
        }
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

