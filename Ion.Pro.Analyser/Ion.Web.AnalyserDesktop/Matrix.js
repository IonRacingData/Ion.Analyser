var Vector3 = (function () {
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector3;
}());
var Matrix3 = (function () {
    function Matrix3(inputValues) {
        this.values = inputValues;
    }
    Matrix3.createTranslation = function (x, y) {
        return new Matrix3([
            1, 0, x,
            0, 1, y,
            0, 0, 1
        ]);
    };
    Matrix3.createRotation = function (rad) {
        return new Matrix3([
            Math.cos(rad), -Math.sin(rad), 0,
            Math.sin(rad), Math.cos(rad), 0,
            0, 0, 1
        ]);
    };
    Matrix3.createTransformation = function (w, h) {
        return new Matrix3([
            w, 0, 0,
            0, h, 0,
            0, 0, 1
        ]);
    };
    Matrix3.prototype.mul = function (matrix) {
        var newMat = new Matrix3([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    newMat.values[i * 3 + j] += this.values[i * 3 + k] * matrix.values[k * 3 + j];
                }
            }
        }
        return newMat;
    };
    Matrix3.prototype.mulVector = function (vector) {
        return new Vector3(this.values[0] * vector.x + this.values[1] * vector.y + this.values[2] * vector.z, this.values[3] * vector.x + this.values[4] * vector.y + this.values[5] * vector.z, this.values[6] * vector.x + this.values[7] * vector.y + this.values[8] * vector.z);
    };
    return Matrix3;
}());
//# sourceMappingURL=Matrix.js.map