// Song selection
let selectElem = document.getElementById("select");
let settingsElem = document.getElementById("settings");
let customElem = document.getElementById("custom");

let selectMenuOpen = true;
let customMenuOpen = false;

let track;
let audio = new Audio("songs/backgroundmusic.mp3");
audio.volume = 0.5; // Set default volume to match the slider

let songs = {
    "Nobody from Kaijuu-8": [track_nobody, "songs/nobody.mp3"],
    "Abyss from Kaijuu-8": [track_abyss, "songs/abyss.mp3"],
    "Titanium from Alisiabeats": [track_abyss, "songs/titanium.mp3"]
}

for (let song_name of Object.keys(songs)) {
    document.getElementById("song-button-container").innerHTML += `
    <button onclick="selectSong('${song_name}')">${song_name}</button>`;
}
document.getElementById("song-button-container").innerHTML += `
    <button onclick="openCustom()" style="border:4px solid #9F5EF2;background-color:#4E297D">Custom...</button>`;

function selectSong(song) {
    console.log(playing);
    if (!playing && loaded) {
        track = songs[song][0];
        selectElem.style.top = "-100%";
        selectMenuOpen = false;
        audio.pause();
        audio = new Audio(songs[song][1]);
        audio.volume = document.getElementById("volume").value; // Set volume based on the slider value
        start();
    }
}

function reset() {
    selectElem.style.top = "50%";
    selectMenuOpen = true;
    audio.pause();
    audio = new Audio("songs/backgroundmusic.mp3");
    audio.volume = document.getElementById("volume").value; // Set volume based on the slider value
    audio.play();
}

async function backgroundmusic() {
    while (true) {
        if (loaded && !playing) {
            reset();
            document.getElementById("splash").style.display = "none";
            break;
        }
        await new Promise(r => setTimeout(r, 1000)); 
    }
}
backgroundmusic();

// settings menu
settingsElem.style.top = "-100%";
customElem.style.top = "-100%";

function openSettings() {
    customElem.style.top = "-100%";
    selectElem.style.top = "-100%";
    settingsElem.style.top = "50%";
}

function closeSettings() {
    if (selectMenuOpen) {
        selectElem.style.top = "50%";
    }
    if (customMenuOpen) {
        customElem.style.top = "50%";
    }
    settingsElem.style.top = "-100%";
}

// custom track
function openCustom() {
    selectElem.style.top = "-100%";
    settingsElem.style.top = "-100%";
    customElem.style.top = "50%";
    customMenuOpen = true;
    selectMenuOpen = false;
}

function closeCustom() {
    customElem.style.top = "-100%";
    selectMenuOpen = true;
    selectElem.style.top = "50%";
    customMenuOpen = false;
}

function playCustom() {
    let musicFile = document.getElementById("custom-music").files[0];
    let trackFile = document.getElementById("custom-track").files[0];

    let trackReader = new FileReader();
    trackReader.readAsText(trackFile);
    trackReader.onload = function(e) {
        console.log(e.target.result);
        track = JSON.parse(e.target.result);
    }

    let fileReader = new FileReader();
    fileReader.readAsDataURL(musicFile);
    fileReader.onload = function(e) {
        selectElem.style.top = "-100%";
        customElem.style.top = "-100%";
        selectMenuOpen = false;
        audio.pause();
        audio.src = e.target.result;
        audio.volume = document.getElementById("volume").value; 
        start();
    }
}

function setVolume(value) {
    audio.volume = value;
}
