class DataSourceBuildController extends Component{

    private plot: IViewerBase<any>;
    private sensorGroup: SensorGroup<any>;

    private mk: HtmlHelper = new HtmlHelper();
    private subDivs: HTMLElement[] = [];
    private btnMakeSource: Button;

    private chosenData: sensys.ISensorInformation[] = [];
    private chosenList: ListBoxRearrangable;

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
            console.log("hey");
        })
        this.toggleGenBtn();
        this.subDivs[2].appendChild(this.btnMakeSource.wrapper);

        console.log(this.plot);
        this.determineGroup();
        this.listSensors();
        this.initChosenList();
    }

    private generateSource(): void {
        let sources: ISensorDataContainerTemplate[] = [];
        for (let s of this.chosenData) {
            sources.push({ name: s.Name, key: s.SensorSet.Name });
        }

        let template: DataSourceTemplate = {
            key: "",
            grouptype: (<any>this.sensorGroup).name,
            layers: [],
            sources: sources          
        }

        console.log(kernel.senMan.createDataSource(template));
    }

    private listSensors() {
        let expList: ExpandableList = new ExpandableList();
        this.subDivs[0].appendChild(expList.wrapper);

        let infos: sensys.ISensorInformation[] = kernel.senMan.getInfos();

        expList.selector = (item: sensys.ISensorInformation) => {
            return <IExpandableListSection>{
                title: item.Name,
                items: [<IExpandableListItem>{ text: item.SensorSet.Name, object: item }]
            }
        }

        expList.data = infos;
        expList.onItemClick.addEventListener((e) => {
            let numGroups: number = (<any>this.sensorGroup).numGroups;
            if (this.chosenData.length < numGroups) {
                this.chosenData.push(e.data);
                this.updateChosenList();
            }
            if (this.chosenData.length === numGroups) {
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
        if (sensys.SensorManager.isCollectionViewer(this.plot)) {
            // multiple stuffs
        }
        else if (sensys.SensorManager.isViewer(this.plot)) {
            // one stuff
        }
        else {
            throw new Error("Viewer is somehow neither single nor multiple exception");
        }
    }

    private determineGroup(): void {
        

        throw new Error("Group not found exception");
    }

}