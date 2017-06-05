﻿class BarController extends SingleValueController {
    private bar1: HTMLElement;
    private bar2: HTMLElement;
    private barWrapper1: HTMLElement;
    private barWrapper2: HTMLElement;
    private direction: Direction;
    private horizontal: boolean = false;
    private double: boolean = false;

    private silhouette: string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 152 316.2"><g id="XMLID_3_">	<rect id="XMLID_1_" x="0" class="silhouette" width="152" height="206"></rect>	<rect id="XMLID_2_" x="0" y="219.4" class="silhouette" width="152" height="96.9"></rect></g></svg>';
    private silhouetteContainer: HTMLElement;
    private barContainer: HTMLElement;

    constructor(width: number, height: number, direction: Direction) {
        super();
        this.direction = direction;
        this.width = width;
        this.height = height;
    }

    generate(): HTMLElement {
        this.wrapper = this.mk.tag("div", "bar-controller-wrapper");
        this.wrapper.setAttribute("tabindex", "0");

        this.barContainer = this.mk.tag("div");
        this.silhouetteContainer = this.mk.tag("div", "bar-controller-silhouette");
        this.silhouetteContainer.innerHTML = this.silhouette;

        this.barWrapper1 = this.mk.tag("div", "bar-controller-barWrapper1");
        this.barContainer.appendChild(this.barWrapper1);
        this.bar1 = this.mk.tag("div", "bar-controller-bar1");
        this.barWrapper1.appendChild(this.bar1);

        this.barWrapper2 = this.mk.tag("div", "bar-controller-barWrapper2");
        this.barContainer.appendChild(this.barWrapper2);
        this.bar2 = this.mk.tag("div", "bar-controller-bar2");
        this.barWrapper2.appendChild(this.bar2);

        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";

        this.setDirection(this.direction);

        // listeners for testing direction switch
        this.wrapper.addEventListener("mousedown", (e: MouseEvent) => {
            this.wrapper.focus();
        });   
        this.wrapper.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "t") {
                let dir = this.direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
                this.direction = dir;
                this.setDirection(dir);
            }
        });

        this.barContainer.style.display = "none";
        this.wrapper.appendChild(this.silhouetteContainer);
        this.wrapper.appendChild(this.barContainer);
        return this.wrapper;
    }

    private setDirection(dir: Direction): void {
        if (dir === Direction.Horizontal) {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar1.style.height = "100%";
            this.bar2.style.height = "100%";
            this.wrapper.style.flexDirection = "row";
            this.barWrapper2.style.display = "flex";
        }
        else {
            this.bar1.style.height = "0";
            this.bar2.style.height = "0";
            this.bar1.style.width = "100%";
            this.bar2.style.width = "100%";
            this.wrapper.style.flexDirection = "column";
        }
    }

    protected onSizeChange(): void {
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
    }

    protected onDataChange(): void {

        if (this.data) {
            this.silhouetteContainer.style.display = "none";
            this.barContainer.style.display = "flex";
        }
        else {
            this.barContainer.style.display = "none";
            this.silhouetteContainer.style.display = "flex";
            return;
        }

        let min = SensorInfoHelper.minValue(this.lastSensorInfo);

        let val = this.percent * 100;

        if (this.direction === Direction.Horizontal) {
            
            if (min < 0) {
                val = (val - 50) * 2;

                this.bar2.style.width = val < 0 ? "0%" : val + "%";
                this.bar1.style.width = val < 0 ? Math.abs(val) + "%" : "0%";
                
                this.barWrapper1.style.justifyContent = "flex-end";
                this.barWrapper2.style.display = "flex";
            }
            else {
                this.bar1.style.width = val < 0 ? "0%" : val + "%";

                this.barWrapper1.style.justifyContent = "initial";
                this.barWrapper2.style.display = "none";
            }
        }
        else {
            
            if (min < 0) {
                val = (val - 50) * 2;

                this.bar1.style.height = val < 0 ? "0%" : val + "%";
                this.bar2.style.height = val < 0 ? Math.abs(val) + "%" : "0%";

                this.barWrapper2.style.display = "flex";
            }
            else {
                this.bar1.style.height = val < 0 ? "0%" : val + "%";

                this.barWrapper2.style.display = "none";
            }
        }
    }
}

enum Direction {
    Horizontal = 1,
    Vertical
}
