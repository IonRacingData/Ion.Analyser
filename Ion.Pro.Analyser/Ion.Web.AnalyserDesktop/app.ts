window.addEventListener("load", () => {
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width = 1000;
    canvas.height = 500;
    canvas.style.position = "absolute";
    canvas.style.top = "40px";
    canvas.style.left = "0";
    canvas.style.backgroundColor = "white";

    let s = 30;
    let offset = 0.2 * s;

    let rot0 = Matrix3.createTranslation(s * 4 + offset, s).mul(Matrix3.createTransformation(s, s));
    let rot3 = Matrix3.createTranslation(s * 4 + offset, s * 7 + offset * 2).mul(Matrix3.createTransformation(s, s));
    let rot6 = Matrix3.createTranslation(s * 4 + offset, s * 13 + + offset * 4).mul(Matrix3.createTransformation(s, s));


    let rot1 = Matrix3.createTranslation(s, s * 4 + offset).mul(Matrix3.createRotation(Math.PI / 2)).mul(Matrix3.createTransformation(s, s));
    let rot2 = Matrix3.createTranslation(s * 7 + offset * 2, s * 4 + offset).mul(Matrix3.createRotation(Math.PI / 2)).mul(Matrix3.createTransformation(s, s));


    let rot4 = Matrix3.createTranslation(s, s * 10 + offset * 3).mul(Matrix3.createRotation(Math.PI / 2)).mul(Matrix3.createTransformation(s, s));
    let rot5 = Matrix3.createTranslation(s * 7 + offset * 2, s * 10 + offset * 3).mul(Matrix3.createRotation(Math.PI / 2)).mul(Matrix3.createTransformation(s, s));

    let numbers: number[][] = [];
    numbers[0] = [1, 1, 1, 0, 1, 1, 1];
    numbers[1] = [0, 0, 1, 0, 0, 1, 0];
    numbers[2] = [1, 0, 1, 1, 1, 0, 1];
    numbers[3] = [1, 0, 1, 1, 0, 1, 1];
    numbers[4] = [0, 1, 1, 1, 0, 1, 0];
    numbers[5] = [1, 1, 0, 1, 0, 1, 1];
    numbers[6] = [1, 1, 0, 1, 1, 1, 1];
    numbers[7] = [1, 0, 1, 0, 0, 1, 0];
    numbers[8] = [1, 1, 1, 1, 1, 1, 1];
    numbers[9] = [1, 1, 1, 1, 0, 1, 1];


    let ctx = canvas.getContext("2d");
    let fig1 = new Figure([
        new Point(3, 0),
        new Point(2.25, 0.75),
        new Point(-2.25, 0.75),
        new Point(-3, 0),
        new Point(-2.25, -0.75),
        new Point(2.25, -0.75)
    ]);

    let s2 = 10;
    let fig2Trans = Matrix3.createTranslation(s2 * 50, s2 * 25).mul(Matrix3.createTransformation(s2, s2));
    let fig2 = new Figure(
        [
            new Point(10, 0),
            new Point(5, 8.66025),
            new Point(-5, 8.66025),
            new Point(-10, 0),
            new Point(-5, -8.66025),
            new Point(5, -8.66025),
        ]);
    fig2.projection = fig2Trans;

    let index = 0;
    setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fig1.projection = rot0;
        drawFigure(ctx, fig1, numbers[index][0] > 0 ? "black" : "lightgray");
        fig1.projection = rot1;

        drawFigure(ctx, fig1, numbers[index][1] > 0 ? "black" : "lightgray");
        fig1.projection = rot2;

        drawFigure(ctx, fig1, numbers[index][2] > 0 ? "black" : "lightgray");
        fig1.projection = rot3;

        drawFigure(ctx, fig1, numbers[index][3] > 0 ? "black" : "lightgray");
        fig1.projection = rot4;

        drawFigure(ctx, fig1, numbers[index][4] > 0 ? "black" : "lightgray");
        fig1.projection = rot5;

        drawFigure(ctx, fig1, numbers[index][5] > 0 ? "black" : "lightgray");
        fig1.projection = rot6;

        drawFigure(ctx, fig1, numbers[index][6] > 0 ? "black" : "lightgray");

        drawFigure(ctx, fig2, "#00B8C8");
        fig2.projection = Matrix3.createTranslation(s2 * 50, s2 * 25).mul(Matrix3.createRotation(Math.PI / 3 * index / 10)).mul(Matrix3.createTransformation(s2, s2));
        index += 1;
        index %= 10;
    }, 500);

    let ma = new Matrix3(
        [
            2, 0, 0,
            0, 2, 0,
            0, 0, 1
        ]);

    let ma2 = new Matrix3(
        [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);

    let ma3 = ma.mul(ma2);

    //let rot = Matrix3.createRotation(Math.PI / 2);
    

    let test = rot0.mulVector(new Vector3(1, 0, 1));

    console.log(ma3);
    console.log(test);

    //startUp();

});

function drawFigure(ctx: CanvasRenderingContext2D, fig: Figure, color: string = "lightgray"){
    ctx.beginPath();
    ctx.fillStyle = color;
    let temp = fig.getPoint(0);
    ctx.moveTo(temp.x, temp.y);
    for (let i = 1; i < fig.points.length + 1; i++) {
        let temp = fig.getPoint(i % fig.points.length);
        ctx.lineTo(temp.x, temp.y);
    }
    ctx.closePath();
    ctx.fill();
}

class Figure {
    points: Point[] = [];
    projection: Matrix3;
    constructor(points: Point[]) {
        this.points = points;
    }

    getPoint(index: number) {
        let vector = this.projection.mulVector(new Vector3(this.points[index].x, this.points[index].y, 1));
        return new Point(vector.x, vector.y);
    }
}

class Test {
    private _title: string;

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = "Haha, you failed";
    }
}