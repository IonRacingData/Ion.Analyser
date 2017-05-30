class DataSourceBuildController extends Component{

    private plot: IViewerBase<any>;
    private template: DataSourceTemplate;

    private mk: HtmlHelper = new HtmlHelper();    
    private subDivs: HTMLElement[] = [];

    private chosenData: sensys.ISensorInformation[] = [];
    private chosenList: ListBoxRearrangable;

    constructor(plot: IViewerBase<any>) {
        super();
        this.plot = plot;

        this.wrapper = this.mk.tag("div", "dsbController-wrapper");
        for (let i = 0; i < 4; i++) {
            let div: HTMLElement = this.mk.tag("div", "dsbController-section")
            this.subDivs.push(div);
            this.wrapper.appendChild(div);
        }

        this.listSensors();
        this.initChosenList();
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
            this.chosenData.push(e.data);
            this.updateChosenList();
        });
    }

    updateChosenList(): void {
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
            console.log(this.chosenData);
        });

        this.chosenList.onItemRearrange.addEventListener((e) => {
            this.chosenData = this.chosenList.data;
        })
      
    }

}