class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Matrix3 {
    values: number[];

    constructor(inputValues: number[]) {
        this.values = inputValues;
    }

    static createTranslation(x: number, y: number): Matrix3 {
        return new Matrix3(
            [
                1, 0, x,
                0, 1, y,
                0, 0, 1
            ]);
    }

    static createRotation(rad: number): Matrix3 {
        return new Matrix3(
            [
                Math.cos(rad), -Math.sin(rad), 0,
                Math.sin(rad),  Math.cos(rad), 0,
                            0,              0, 1
            ]);
    }

    static createTransformation(w: number, h: number): Matrix3 {
        return new Matrix3(
            [
                w, 0, 0,
                0, h, 0,
                0, 0, 1
            ]);
    }

    mul(matrix: Matrix3) {
        let newMat = new Matrix3([0,0,0, 0,0,0, 0,0,0]);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    newMat.values[i * 3 + j] += this.values[i * 3 + k] * matrix.values[k * 3 + j];
                }
            }
        }

        return newMat;
    }

    mulVector(vector: Vector3) {
        return new Vector3(
            this.values[0] * vector.x + this.values[1] * vector.y + this.values[2] * vector.z,
            this.values[3] * vector.x + this.values[4] * vector.y + this.values[5] * vector.z,
            this.values[6] * vector.x + this.values[7] * vector.y + this.values[8] * vector.z
        );
    }
}

