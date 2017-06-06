class DataSourceBuildController extends Component{

    private plot: IViewerBase<any>;
    private sensorGroup: string;
    private groupArgs: number;

    private mk: HtmlHelper = new HtmlHelper();
    private subDivs: HTMLElement[] = [];
    private btnMakeSource: Button;

    private chosenData: sensys.ISensorInformation[] = [];
    private chosenList: ListBoxRearrangable;

    private sourcesList: TempDataSourceList;

    private availableSources: IDataSource<any>[];

    constructor(plot: IViewerBase<any>) {
        super();
        this.plot = plot;

        this.wrapper = this.mk.tag("div", "dsbController-wrapper");
        for (let i = 0; i < 4; i++) {
            let div: HTMLElement = this.mk.tag("div", "dsbController-section");
            this.subDivs.push(div);
            this.wrapper.appendChild(div);
        }

        this.btnMakeSource = new Button();
        this.btnMakeSource.text = "Generate";
        this.btnMakeSource.onclick.addEventListener((e) => {
            this.generateSource();            
        })
        this.toggleGenBtn();
        this.subDivs[2].appendChild(this.btnMakeSource.wrapper);

        console.log(this.plot);
        this.determineGroup();
        this.listSensors();
        this.listDataSources();
        this.initChosenList();
    }

    private generateSource(): void {
        let sources: ISensorDataContainerTemplate[] = [];
        for (let s of this.chosenData) {
            sources.push({ name: s.Name, key: s.SensorSet.Name });
        }

        let template: DataSourceTemplate = {
            key: "",
            grouptype: this.sensorGroup,
            layers: [],
            sources: sources
        }

        kernel.senMan.createDataSource(template);

        this.sourcesList.update();
    }

    private listSensors(): void {
        let expList: ExpandableList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);

        let sensorsets: sensys.SensorDataSet[] = kernel.senMan.getLoadedDatasets();
        let allInfos: sensys.ISensorInformation[] = [];        
        
        for (let set of sensorsets) {
            if (set.Name !== "telemetry") {
                allInfos = allInfos.concat(set.AllInfos);
            }
        }

        expList.selector = (item: sensys.ISensorInformation) => {
            return <IExpandableListSection>{
                title: item.Name,
                items: [<IExpandableListItem>{ text: item.SensorSet.Name, object: item }]
            }
        }

        expList.data = allInfos;
        expList.onItemClick.addEventListener((e) => {
            if (this.chosenData.length < this.groupArgs) {
                this.chosenData.push(e.data);
                this.updateChosenList();
            }
            if (this.chosenData.length === this.groupArgs) {
                this.toggleGenBtn();
            }
        });
    }

    private toggleGenBtn(): void {
        if (this.btnMakeSource.wrapper.style.display === "none") {
            this.btnMakeSource.wrapper.style.display = "inline-block";
        }
        else {
            this.btnMakeSource.wrapper.style.display = "none";
        }
    }

    private updateChosenList(): void {
        this.chosenList.data = this.chosenData;
        this.chosenList.update;
    }

    private initChosenList(): void {
        this.chosenList = new ListBoxRearrangable();
        this.chosenList.rowInfoMarkers = ["X", "Y", "Z"];
        this.chosenList.selector = (item: sensys.ISensorInformation) => {
            return <IListBoxRearrangableItem>{ mainText: item.Name, infoText: item.SensorSet.Name };
        }

        this.subDivs[1].appendChild(this.chosenList.wrapper);

        this.chosenList.onItemRemove.addEventListener((e) => {
            this.chosenData = this.chosenList.data;
            if (this.chosenData.length < (<any>this.sensorGroup).numGroups) {
                this.toggleGenBtn();
            }
        });

        this.chosenList.onItemRearrange.addEventListener((e) => {
            this.chosenData = this.chosenList.data;
        });      
    }

    private fillLayerSection(): void {
        // TODO: implement this
    }

    private listDataSources(): void {
        this.sourcesList = new TempDataSourceList(this.plot);
        this.subDivs[3].appendChild(this.sourcesList.wrapper);
    }

    private determineGroup(): void {
        let s = kernel.senMan.getGroupByType(this.plot.type);
        if (s) {
            console.log(s);
            this.sensorGroup = (<any>s).name;
            this.groupArgs = (<any>s).numGroups;
            console.log(this.sensorGroup);
            return;
        }

        throw new Error("Group not found exception");
    }

}