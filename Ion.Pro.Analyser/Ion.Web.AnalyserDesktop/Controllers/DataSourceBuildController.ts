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

    private availableSources: Array<IDataSource<any>>;

    get viewer() {
        return this.plot;
    }

    constructor(plot: IViewerBase<any>) {
        super();
        this.plot = plot;

        this.wrapper = this.mk.tag("div", "dsbController-wrapper");
        for (let i = 0; i < 3; i++) {
            const div: HTMLElement = this.mk.tag("div", "dsbController-section");
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

        const emptyDiv = document.createElement("div");
        emptyDiv.style.height = "90px";
        emptyDiv.style.textAlign = "center";
        this.subDivs[1].appendChild(emptyDiv);
        emptyDiv.appendChild(this.btnMakeSource.wrapper);

    }

    private generateSource(): void {
        const sources: ISensorDataContainerTemplate[] = [];
        for (const s of this.chosenData) {
            sources.push({ name: s.SensorSet.Name, key: s.Key });
        }

        const template: DataSourceTemplate = {
            key: "",
            grouptype: this.sensorGroup,
            layers: [],
            sources,
        };

        const ds = kernel.senMan.createDataSource(template);
        if (ds) {
            kernel.senMan.registerDataSource(ds);
        }
        else {
            throw new Error("Data Source not created exception");
        }
        this.sourcesList.update();
    }

    private listSensors(): void {
        const expList: ExpandableList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);

        const sensorsets: sensys.SensorDataSet[] = kernel.senMan.getLoadedDatasets();
        const infos: sensys.ISensorInformation[] = [];

        for (const set of sensorsets) {
            for (const key of set.LoadedKeys) {
                const info: sensys.ISensorInformation = set.KeyInfoMap[key];
                if (info) {
                    infos.push(info);
                }
                else {
                    console.log("Undefined SensorInfo: ", key);
                }
            }
        }

        const data: IExpandableListSection[] = [];
        for (const info of infos) {
            let found: boolean = false;
            for (const section of data) {
                if (section.title === info.Name) {
                    found = true;
                    section.items.push({ text: info.SensorSet.Name, object: info } as IExpandableListItem);
                    break;
                }
            }
            if (!found) {
                data.push({ title: info.Name, items: [{ text: info.SensorSet.Name, object: info } as IExpandableListItem] } as IExpandableListSection);
            }
        }

        expList.selector = (item: IExpandableListSection) => {
            return {
                title: item.title,
                items: item.items,
            } as IExpandableListSection;
        };

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
        if (this.groupArgs > 1) {
            this.chosenList.rowInfoMarkers = ["X", "Y", "Z"];
        }
        this.chosenList.selector = (item: sensys.ISensorInformation) => {
            return { mainText: item.Name, infoText: item.SensorSet.Name } as IListBoxRearrangableItem;
        };

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
        const s = kernel.senMan.getGroupByType(this.plot.type);
        if (s) {
            this.sensorGroup = (s as any).name;
            this.groupArgs = (s as any).numGroups;
            return;
        }

        throw new Error("Group not found exception");
    }

}

interface IExpListData {
    title: string;
    items: any[];
}
