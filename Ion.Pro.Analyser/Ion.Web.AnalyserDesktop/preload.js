var preloadStyle = document.createElement("style");
preloadStyle.id = "current-theme";
var preLoadDone = false;
var waitingCallbacks = [];
var preloaded = {};
var storePreload = false;
var testStore = document.createElement("script");
testStore.type = "application/json";
testStore.id = "preload";
if (storePreload) {
    var oldStore = document.getElementById("preload");
    if (oldStore) {
        testStore = oldStore;
        preloaded = JSON.parse(testStore.innerHTML);
    }
    else {
        document.head.insertBefore(testStore, document.head.firstChild);
    }
}
//preloadStyle.onload = (ev) => { console.log("data loaded"); };
function onPreloadDone(callback) {
    if (preLoadDone) {
        callback();
    }
    waitingCallbacks.push(callback);
}
function preloadFile(file, callback) {
    var request = new XMLHttpRequest();
    if (preloaded[file]) {
        callback(preloaded[file]);
        return;
    }
    request.onreadystatechange = function () {
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
preloadFile("/Style/app-style-dark.css", function (data) {
    preloadStyle.innerHTML = data;
    document.head.appendChild(preloadStyle);
    //console.log(preloadStyle);
    //console.log(preloadStyle.sheet);
    //console.log("requested: stylesheet");
    preLoadDone = true;
    for (var _i = 0, waitingCallbacks_1 = waitingCallbacks; _i < waitingCallbacks_1.length; _i++) {
        var a = waitingCallbacks_1[_i];
        a();
    }
});
preloadFile("/Style/app-style.css", function () {
});
//# sourceMappingURL=preload.js.map