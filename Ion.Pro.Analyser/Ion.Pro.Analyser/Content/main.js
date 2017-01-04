//console.log("This works :D");
window.onload = function () {
    //videoPlayer();
};

function videoPlayer() {
    var playButton = document.getElementById("play");
    var video = document.getElementById("player");

    checkText();

    playButton.addEventListener("click", function () {
        if (video.paused) {
            video.play();
            playButton.innerHTML = "pause";
        }
        else {
            video.pause();
            playButton.innerHTML = "play";
        }

    });

    function checkText() {
        playButton.innerHTML = video.paused ? "play" : "pause";
    }
}