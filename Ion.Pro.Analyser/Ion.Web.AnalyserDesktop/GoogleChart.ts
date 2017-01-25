interface Google {
    charts: Chart;
    visualization: Visualization;
}

interface Chart {
    load(plot: string, data: any);
    setOnLoadCallback(callback: () => void);
}

interface Visualization {
    arrayToDataTable(data: any): any;
    LineChart: new (node: Node) => LineChart;
}

interface LineChart {
    draw(data: any, options: any);
}

var google: Google;