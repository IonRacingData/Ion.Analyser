let preloadStyle = document.createElement("style");
preloadStyle.id = "current-theme";
let preLoadDone = false;
let waitingCallbacks: Array<() => void> = [];

let preloaded: { [key: string]: string } = {};

let storePreload = false;
let testStore = document.createElement("script");
testStore.type = "application/json";
testStore.id = "preload";

if (storePreload) {
    const oldStore = document.getElementById("preload") as HTMLScriptElement;
    if (oldStore) {
        testStore = oldStore;
        preloaded = JSON.parse(testStore.innerHTML);
    }
    else {
        document.head.insertBefore(testStore, document.head.firstChild);
    }
}

//preloadStyle.onload = (ev) => { console.log("data loaded"); };

function onPreloadDone(callback: () => void): void {
    if (preLoadDone) {
        callback();
    }
    waitingCallbacks.push(callback);
}

function preloadFile(file: string, callback: (data: string) => void) {
    const request = new XMLHttpRequest();
    if (preloaded[file]) {
        callback(preloaded[file]);
        return;
    }
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            //alert("requested: stylesheet");
            preloaded[file] = request.responseText;
            callback(request.responseText);
            if (storePreload) {
                testStore.innerHTML = JSON.stringify(preloaded);
            }

        }
    };

    request.open("GET", file, true);
    request.send();
}

preloadFile("/Style/app-style-dark.css", (data: string) => {
    preloadStyle.innerHTML = data;

    document.head.appendChild(preloadStyle);

    //console.log(preloadStyle);
    //console.log(preloadStyle.sheet);

    //console.log("requested: stylesheet");
    preLoadDone = true;
    for (const a of waitingCallbacks) {
        a();
    }
});

preloadFile("/Style/app-style.css", () => {
});
