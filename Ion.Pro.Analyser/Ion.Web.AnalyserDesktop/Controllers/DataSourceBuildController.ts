class DataSourceBuildController extends Component{

    private plot: IViewerBase<any>;
    private template: DataSourceTemplate;

    private mk: HtmlHelper = new HtmlHelper();    
    private subDivs: HTMLElement[] = [];

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
        expList.onItemClick.addEventListener((item) => {console.log(item.data)})
    }

}