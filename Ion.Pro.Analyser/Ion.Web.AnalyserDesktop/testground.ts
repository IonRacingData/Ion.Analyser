testing = true;
console.log("Activating testing");

window.addEventListener("load", () => {
    tester();
});


function tester() {

    window.document.body.style.color = "white";
    window.document.body.innerHTML = "";

    let newT = newEvent<IEventData>("tester.test");

    let b = new Button();
    let b2 = new Button();
    let b3 = new Button();
    let lst = new ListBox();
    let table = new TableList();
    let ex: ExpandableList = new ExpandableList();
    let listArr: ListBoxRearrangable = new ListBoxRearrangable();
    let sw = new Switch();

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

    b.onclick.addEventListener(() => { alert("Yeay") });


    let arr: IPerson[] = [
        { first: "Per", last: "Pettersen" },
        { first: "Truls", last: "Trulsen" },
        { first: "Bob", last: "Bobsen" }
    ];

    let exArr: IWork[] = [
        {
            name: "work",
            employee: { first: "hey", last: "bye" }
        },
        {
            name: "work2",
            employee: { first: "hey2", last: "bye2" }
        }
    ];

    ex.selector = (item: IWork) => {
        return <IExpandableListSection>{
            title: item.name,
            items: [
                { text: item.employee.first, object: item.employee.first },
                { text: item.employee.last, object: item.employee.last }
            ]
        }
    }
    ex.data = exArr;

    ex.onItemClick.addEventListener((item: IDataEvent<IWork>) => {
        console.log(item.data);
    });

    listArr.selector = (item: IPerson) => {
        return <IListBoxRearrangableItem>{ mainText: item.first, infoText: item.last }
    }

    listArr.data = arr;

    let markers: string[] = ["X", "Y", "Z"];

    listArr.rowInfoMarkers = markers;

    b2.onclick.addEventListener(() => {
        arr.push({ first: "Fourth", last: "Tester" })
        lst.update();
        table.update();
    });

    b3.onclick.addEventListener(() => {
        exArr.push({ name: "new", employee: { first: "hans", last: "bobsen" } });
        ex.update();
    })

    table.header = ["Firstname", "Lastname"];

    table.selector = (item: IPerson) => {
        return [item.first, item.last];
    }

    table.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    })



    table.data = arr;

    lst.selector = (item: IPerson) => {
        return item.first + " " + item.last;
    };

    lst.onItemClick.addEventListener((item: IDataEvent<IPerson>) => {
        alert("You clicked on: " + item.data.last + ", " + item.data.first);
    })

    lst.data = arr;


}

function storageTest() {
    let storageList: IStorageList = {
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
    }


}

