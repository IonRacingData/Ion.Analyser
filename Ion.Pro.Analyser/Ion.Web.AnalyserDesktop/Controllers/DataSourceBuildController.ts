class DataSourceBuildController extends Component{

    private plot: IViewerBase<any>;
    private sensorGroup: string;
    private groupArgs: number;

    private mk: HtmlHelper = new HtmlHelper();
    private subDivs: HTMLElement[] = [];
    private btnMakeSource: TextButton;

    private chosenData: sensys.ISensorInformation[] = [];
    private chosenList: ListBoxRearrangable;
    private chosenListClickCounter: number = 0;

    private sourcesList: TempDataSourceList;

    private availableSources: IDataSource<any>[];

    get viewer() {
        return this.plot;
    }

    constructor(plot: IViewerBase<any>) {
        super();
        this.plot = plot;

        this.wrapper = this.mk.tag("div", "dsbController-wrapper");
        for (let i = 0; i < 3; i++) {
            let div: HTMLElement = this.mk.tag("div", "dsbController-section");
            this.subDivs.push(div);
            this.wrapper.appendChild(div);
        }

        this.subDivs[1].style.display = "flex";
        this.subDivs[1].style.flexDirection = "column";
        this.subDivs[1].style.justifyContent = "space-between";

        this.btnMakeSource = new TextButton();
        this.btnMakeSource.text = "GENERATE";
        this.btnMakeSource.disabled = true;
        this.btnMakeSource.onclick.addEventListener((e) => {
            this.generateSource();
            this.chosenData = [];
            this.updateChosenList();
            this.btnMakeSource.disabled = true;
        });        
        
        this.determineGroup();
        this.listSensors();
        this.listDataSources();
        this.initChosenList();

        let emptyDiv = document.createElement("div");
        emptyDiv.style.height = "90px";
        emptyDiv.style.textAlign = "center";
        this.subDivs[1].appendChild(emptyDiv);
        emptyDiv.appendChild(this.btnMakeSource.wrapper);

    }

    private generateSource(): void {
        let sources: ISensorDataContainerTemplate[] = [];
        for (let s of this.chosenData) {
            sources.push({ name: s.SensorSet.Name, key: s.Key });
        }

        let template: DataSourceTemplate = {
            key: "",
            grouptype: this.sensorGroup,
            layers: [],
            sources: sources
        }

        let ds = kernel.senMan.createDataSource(template);
        if (ds) {
            kernel.senMan.registerDataSource(ds);
        }
        else {
            throw new Error("Data Source not created exception");
        }
        this.sourcesList.update();
    }

    private listSensors(): void {
        let expList: ExpandableList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);

        let sensorsets: sensys.SensorDataSet[] = kernel.senMan.getLoadedDatasets();
        let infos: sensys.ISensorInformation[] = [];

        for (let set of sensorsets) {
            for (let key of set.LoadedKeys) {
                let info: sensys.ISensorInformation = set.KeyInfoMap[key];
                if (info) {
                    infos.push(info);
                }
                else {
                    console.log("Undefined SensorInfo: ", key);
                }
            }
        }

        let data: IExpandableListSection[] = [];
        for (let info of infos) {
            let found: boolean = false;
            for (let section of data) {
                if (section.title === info.Name) {
                    found = true;
                    section.items.push(<IExpandableListItem>{ text: info.SensorSet.Name, object: info });
                    break;
                }                
            }
            if (!found) {
                data.push(<IExpandableListSection>{ title: info.Name, items: [<IExpandableListItem>{ text: info.SensorSet.Name, object: info }] });
            }
        }

        expList.selector = (item: IExpandableListSection) => {
            return <IExpandableListSection>{
                title: item.title,
                items: item.items
            }
        }

        expList.data = data;
        expList.onItemClick.addEventListener((e) => {
            this.chosenListClickCounter++;
            if (this.chosenData.length < this.groupArgs) {
                this.chosenData.push(e.data);
                this.updateChosenList();                
            }
            if (this.chosenData.length === this.groupArgs) {                
                
                if (this.chosenListClickCounter > this.groupArgs) {
                    this.chosenData.pop();
                    this.chosenData.push(e.data);
                    this.updateChosenList();
                }
                
                this.btnMakeSource.disabled = false;                
            }
        });
    }

    private updateChosenList(): void {
        this.chosenList.data = this.chosenData;
        this.chosenList.update;
    }

    private initChosenList(): void {
        this.chosenList = new ListBoxRearrangable();
        //this.chosenList.rowInfoMarkers = ["X", "Y", "Z"];
        this.chosenList.selector = (item: sensys.ISensorInformation) => {
            return <IListBoxRearrangableItem>{ mainText: item.Name, infoText: item.SensorSet.Name };
        }

        this.subDivs[1].appendChild(this.chosenList.wrapper);

        this.chosenList.onItemRemove.addEventListener((e) => {
            this.chosenData = this.chosenList.data;
            this.btnMakeSource.disabled = true;
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
        this.subDivs[2].appendChild(this.sourcesList.wrapper);
    }

    private determineGroup(): void {
        let s = kernel.senMan.getGroupByType(this.plot.type);
        if (s) {
            this.sensorGroup = (<any>s).name;
            this.groupArgs = (<any>s).numGroups;
            return;
        }

        throw new Error("Group not found exception");
    }

}

interface IExpListData {
    title: string,
    items: any[]
}