﻿class DataSourceBuildController extends Component{

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

    get viewer() {
        return this.plot;
    }

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
            this.chosenData = [];
            this.updateChosenList();
            this.btnMakeSource.wrapper.style.display = "none";
        });
        this.btnMakeSource.wrapper.style.display = "none";
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
            if (this.chosenData.length < this.groupArgs) {
                this.chosenData.push(e.data);
                this.updateChosenList();
            }
            if (this.chosenData.length === this.groupArgs) {
                this.btnMakeSource.wrapper.style.display = "inline-block";
            }
        });
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
            this.btnMakeSource.wrapper.style.display = "none";            
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