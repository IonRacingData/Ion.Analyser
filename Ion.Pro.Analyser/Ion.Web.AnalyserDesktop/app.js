window.addEventListener("load", function () {
    var test = new Test();
    test.title = "Hello World";
    console.log(test.title);
    startUp();
});
var Test = (function () {
    function Test() {
    }
    Object.defineProperty(Test.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            this._title = "Haha, you failed";
        },
        enumerable: true,
        configurable: true
    });
    return Test;
}());
//# sourceMappingURL=app.js.map