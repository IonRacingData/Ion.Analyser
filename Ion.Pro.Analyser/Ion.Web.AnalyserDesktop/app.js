var sensys = Kernel.SenSys;
window.addEventListener("load", function () {
    startUp();
});
window.onbeforeunload = function (e) {
    e = e || window.event;
    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = "Sure?";
    }
    // For Safari
    return "Sure?";
};
//# sourceMappingURL=app.js.map