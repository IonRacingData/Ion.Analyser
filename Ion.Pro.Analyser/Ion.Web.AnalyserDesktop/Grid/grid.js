function addEvents() {
    var bar1 = document.getElementById("bar1");
    var bar2 = document.getElementById("bar2");
    var window1 = document.getElementById("window1");
    var window2 = document.getElementById("window2");

    var editFunction;

    var down = false;
    
    window.addEventListener("mousemove", function(event){
        if (down){
            //console.log("Is down");
            //console.log(event.clientY);
            editFunction(event);
            
            //editWindow.style.height = (window.innerHeight - (event.clientY) ) + "px";
            //editWindow.style.flexGrow = "0";
        }
    });
    window.addEventListener("mouseup", function(event){
        down = false;
        document.body.style.cursor = null;
        //console.log("Up");
    });
    bar1.addEventListener("mousedown", function(event) {
        /**
         * @param {MouseEvent} event Mouse event
         */
        editFunction = function (event) {
            
            window1.style.height = (window.innerHeight - (event.clientY) - 4) + "px";
            window1.style.flexGrow = "0";
        }
        document.body.style.cursor = "ns-resize";
        down = true;
    });
    bar2.addEventListener("mousedown", function(event){
        /**
         * @param {MouseEvent} event Mouse event
         */
        editFunction = function handle(event){
            window2.style.width = (window.innerWidth - (event.clientX) - 4) + "px";
            window2.style.flexGrow = "0";
        }
        document.body.style.cursor = "ew-resize";
        down = true;
    })
}