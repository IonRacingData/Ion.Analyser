testing = true;
console.log("Activating testing");
window.addEventListener("load", function () {
    tester();
});
function tester() {
    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";
    var newT = newEvent("tester.test");
    var b = new TextButton();
    var b2 = new TextButton();
    var b3 = new TextButton();
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
    document.body.appendChild(listArr.wrapper);
    document.body.appendChild(sw.wrapper);*/
    b.text = "Click Me!";
    b2.text = "Add Fourth";
    b3.text = "Add expList item";
    b.onclick.addEventListener(function () { alert("Yeay"); });
    var arr = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" },
    ];
    var exArr = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" },
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" },
        },
    ];
    ex.selector = function (item) {
        return {
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last },
            ],
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
    var canvas = new Canvas();
    document.body.appendChild(canvas.wrapper);
    function draw() {
        canvas.clear();
        canvas.strokeStyle = "white";
        canvas.beginPath();
        canvas.moveTo(50, 40);
        for (var i = 50; i < 1000; i += 50) {
            if (i % 5 == 0)
                canvas.lineTo(i, 40);
            if (i % 10 == 0)
                canvas.lineTo(i, 90);
            if (i % 100 == 0)
                canvas.lineTo(i, 187);
        }
        canvas.stroke();
        canvas.closePath();
    }
    var inWidth = 500;
    var inHeight = 200;
    canvas.height = inHeight;
    canvas.width = inWidth;
    draw();
    var counter = 0;
    canvas.wrapper.addEventListener("click", function (e) {
        counter += 50;
        canvas.height = inHeight + counter;
        canvas.width = inWidth + counter;
        draw();
    });
    /*const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tincidunt augue at justo posuere, sed scelerisque libero rutrum. Donec fermentum, quam et placerat mattis, augue arcu cursus quam, vitae finibus neque nulla sed massa. Mauris congue massa non nisl rhoncus, id malesuada odio iaculis. Aliquam mauris neque, molestie sed tellus vitae, efficitur scelerisque enim. Aliquam viverra vulputate velit quis gravida. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur interdum lorem sed porttitor posuere. Sed posuere nulla quis neque tempus, id ullamcorper metus cursus.";
    canvas.fillStyle = "white";
    canvas.font = "30px sans-serif";
    canvas.fillText(lorem, 50, 50);*/
    var leg = new LineChartLegend(100, 50, false);
    document.body.appendChild(leg.canvas.wrapper);
    leg.dataSources = null;
}
function storageTest() {
    var storageList = {
        bob: {
            longText: "This is a long text",
            text: "bob",
            type: "string",
            value: "Hello World",
        },
        test: {
            longText: "AnotherTest",
            text: "hello",
            type: "number",
            value: 3,
        },
        anotherTest: {
            longText: "dsadsa",
            text: "test",
            type: "boolean",
            value: false,
        },
    };
}
//# sourceMappingURL=testground.js.map