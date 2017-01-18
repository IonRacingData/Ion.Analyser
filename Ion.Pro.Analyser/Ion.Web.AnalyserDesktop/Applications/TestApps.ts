﻿class DataViewer implements IApplication {
    application: Application;
    window: AppWindow;
    data: ISensorPackage[];
    innerTable: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Data Viewer");
        requestAction("GetIds", (data: number[]) => this.draw(data));
    }

    draw(data: number[]): void {
        var mk = new HtmlHelper();
        for (var i = 0; i < data.length; i++) {
            let curValue = data[i];
            var a = <HTMLAnchorElement>mk.tag("span", "taskbar-button-text", null, curValue.toString());

            a.onclick = () => {
                requestAction("GetData?number=" + curValue.toString(), (data: ISensorPackage[]) => this.drawInner(data))
            };
            this.window.content.appendChild(a);
        }
        this.innerTable = mk.tag("div");
        this.window.content.appendChild(this.innerTable);
    }

    drawInner(data: ISensorPackage[]): void {
        this.innerTable.innerHTML = "";
        var gen = new HtmlTableGen("table");
        gen.addHeader("ID", "Value", "Timestamp");
        this.data = data;
        for (var i = 0; i < 10; i++) {
            gen.addRow(data[i].ID, data[i].Value, data[i].TimeStamp);
        }
        //gen.addArray(data, ["ID", "Value", "TimeStamp"]);

        this.innerTable.appendChild(gen.generate());
    }
}

class PlotViewer implements IApplication {
    application: Application;
    window: AppWindow;
    innerChart: HTMLElement;
    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Plot window");
        this.innerChart = document.createElement("div");
        this.window.content.appendChild(this.innerChart);

        google.charts.load("current", { "packages": ["corechart"] });
        google.charts.setOnLoadCallback(() => this.loadData());

    }

    loadData() {
        requestAction("getdata?number=61457", (data: ISensorPackage[]) => this.drawChart(data));
    }

    drawChart(sensorData: ISensorPackage[]): void {

        var preData: any[][] = [["Time stamp", "Value"]];
        for (var i = 1; i < 30; i++) {
            preData[i] = [(sensorData[i].TimeStamp / 1000).toString() + "s", sensorData[i].Value];
        }
        var data = google.visualization.arrayToDataTable(preData);
        /*var data = google.visualization.arrayToDataTable([
            ["Year", "Sales", "Expenses"],
            ["2004", 1000, 400],
            ['2005', 1170, 460],
            ['2006', 660, 1120],
            ['2007', 1030, 540]
        ]);*/

        var options = {
            title: "Sensor package 61457",
            curveType: "function",
            legende: { position: "bottom" }
        };

        var chart = new google.visualization.LineChart(this.innerChart);
        chart.draw(data, options);
    }
}

class WebSocketTest implements IApplication {
    application: Application;
    window: AppWindow;

    main(): void {
        this.window = kernel.winMan.createWindow(this.application, "Web Socket test");

        let socket = new WebSocket(window.location.toString().replace("http", "ws") + "socket/connect");

        socket.onmessage = (ev: MessageEvent) => {
            console.log(ev);
            console.log(ev.data);
        }

        socket.onopen = (ev: Event) => {
            socket.send("Hello World from a web socket :D, and this is a realy realy long message, so we can provoke it to send it as a longer message, to check that everything works");
        }
    }
}

class TestViewer implements IApplication {
    application: Application;
    window: AppWindow;
    window2: AppWindow;
    helloData: IHelloPackage;
    mk: HtmlHelper;

    main(): void {
        this.mk = new HtmlHelper();
        this.window = kernel.winMan.createWindow(this.application, "Test Window");

        requestAction("hello", (data: IHelloPackage) => {
            this.helloData = data;
            this.draw();
        });
    }

    draw(): void {
        this.window.content.innerHTML = "";
        this.window.content.appendChild(this.mk.tag("h1", "", null, "Hello World"));
    }
}