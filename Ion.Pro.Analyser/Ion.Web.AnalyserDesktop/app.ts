window.addEventListener("load", () => {
    let test = new Test();

    test.title = "Hello World";

    console.log(test.title);

    startUp();

});

class Test {
    private _title: string;

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = "Haha, you failed";
    }
}