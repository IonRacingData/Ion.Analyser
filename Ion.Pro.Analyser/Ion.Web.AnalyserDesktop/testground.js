testing = true;
console.log("Activating testing");
window.addEventListener("load", function () {
    tester();
});
function tester() {
    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";
    var newT = newEvent("tester.test");
    var b = new Button();
    var b2 = new Button();
    var b3 = new Button();
    var lst = new ListBox();
    var table = new TableList();
    var ex = new ExpandableList();
    var listArr = new ListBoxRearrangable();
    var sw = new Switch();
    /*document.body.appendChild(ex.wrapper);
    document.body.appendChild(b.wrapper);
    document.body.appendChild(b2.wrapper);
    document.body.appendChild(b3.wrapper);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(lst.wrapper);
    document.body.appendChild(table.wrapper);
    document.body.appendChild(listArr.wrapper);*/
    document.body.appendChild(sw.wrapper);
    b.text = "Click Me!";
    b2.text = "Add Fourth";
    b3.text = "Add expList item";
    b.onclick.addEventListener(function () { alert("Yeay"); });
    var arr = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" }
    ];
    var exArr = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" }
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" }
        }
    ];
    ex.selector = function (item) {
        return {
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last }
            ]
        };
    };
    ex.data = exArr;
    ex.onItemClick.addEventListener(function (item) {
        console.log(item.data);
    });
    listArr.selector = function (item) {
        return { mainText: item.first, infoText: item.last };
    };
    listArr.data = arr;
    var markers = ["X", "Y", "Z"];
    listArr.rowInfoMarkers = markers;
    b2.onclick.addEventListener(function () {
        arr.push({ first: "Fourth", last: "Tester" });
        lst.update();
        table.update();
    });
    b3.onclick.addEventListener(function () {
        exArr.push({ name: "new", employee: { first: "hans", last: "bobsen" } });
        ex.update();
    });
    table.header = ["Firstname", "Lastname"];
    table.selector = function (item) {
        return [item.first, item.last];
    };
    table.onItemClick.addEventListener(function (item) {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });
    table.data = arr;
    lst.selector = function (item) {
        return item.first + " " + item.last;
    };
    lst.onItemClick.addEventListener(function (item) {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });
    lst.data = arr;
}
function storageTest() {
    var storageList = {
        bob: {
            longText: "This is a long text",
            text: "bob",
            type: "string",
            value: "Hello World"
        },
        test: {
            longText: "AnotherTest",
            text: "hello",
            type: "number",
            value: 3
        },
        anotherTest: {
            longText: "dsadsa",
            text: "test",
            type: "boolean",
            value: false
        }
    };
}
