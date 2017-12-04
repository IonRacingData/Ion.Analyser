testing = true;
console.log("Activating testing");

window.addEventListener("load", () => {
    tester();
});

function tester() {

    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";

    const newT = newEvent<IEventData>("tester.test");

    const b = new TextButton();
    const b2 = new TextButton();
    const b3 = new TextButton();
    const lst = new ListBox();
    const table = new TableList();
    const ex: ExpandableList = new ExpandableList();
    const listArr: ListBoxRearrangable = new ListBoxRearrangable();
    const sw = new Switch();

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

    b.onclick.addEventListener(() => { alert("Yeay"); });

    const arr: IPerson[] = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" },
    ];

    const exArr: IWork[] = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" },
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" },
        },
    ];

    ex.selector = (item: IWork) => {
        return {
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last },
            ],
        } as IExpandableListSection;
    };
    ex.data = exArr;

    ex.onItemClick.addEventListener((item: IDataEvent<IWork>) => {
        console.log(item.data);
    });

    listArr.selector = (item: IPerson) => {
        return { mainText: item.first, infoText: item.last } as IListBoxRearrangableItem;
    };

    listArr.data = arr;

    const markers: string[] = ["X", "Y", "Z"];

    listArr.rowInfoMarkers = markers;

    b2.onclick.addEventListener(() => {
        arr.push({ first: "Fourth", last: "Tester" });
        lst.update();
        table.update();
    });

    b3.onclick.addEventListener(() => {
        exArr.push({ name: "new", employee: { first: "hans", last: "bobsen" } });
        ex.update();
    });

    table.header = ["Firstname", "Lastname"];

    table.selector = (item: IPerson) => {
        return [item.first, item.last];
    };

    table.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });

    table.data = arr;

    lst.selector = (item: IPerson) => {
        return item.first + " " + item.last;
    };

    lst.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    });

    lst.data = arr;



    const canvas = new Canvas();
    document.body.appendChild(canvas.wrapper);

    function draw() {
        canvas.clear();

        canvas.strokeStyle = "white";
        canvas.beginPath();

        canvas.moveTo(50, 40);

        for (let i = 50; i < 1000; i += 50) {
            if (i % 5 == 0) canvas.lineTo(i, 40);
            if (i % 10 == 0) canvas.lineTo(i, 90);
            if (i % 100 == 0) canvas.lineTo(i, 187);
        }
        canvas.stroke();
        canvas.closePath();

    }
    
    const inWidth = 500;
    const inHeight = 200;
    canvas.height = inHeight;
    canvas.width = inWidth;
    draw();

    let counter = 0;
    canvas.wrapper.addEventListener("click", (e) => {
        counter += 50;
        canvas.height = inHeight + counter;
        canvas.width = inWidth + counter;
        draw();
    });
    

    const menu: SlidingMenu = new SlidingMenu(document.createElement("div"));
    
    
}





function storageTest() {
    const storageList: IStorageList = {
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

