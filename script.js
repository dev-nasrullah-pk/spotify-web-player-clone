console.log('Let start js');

let songs = [];
let currFolder;
let currentSong = new Audio();

// Time Formatting Function
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch Songs from Folder & Update UI
async function getSongs(folder) {
    currFolder = folder;

    try {
        let a = await fetch(`${folder}/songs.json`);
        if (!a.ok) {
            console.error(`Error: ${folder}/songs.json file is not defind`);
            return [];
        }
        songs = await a.json();
    } catch (error) {
        console.error("JSON fetch karne mein error:", error);
        return [];
    }

    // Playlist UI update 
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    }

    // Song items event listner attach
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

// Play Music Function
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    let playbtn = document.querySelector("#play") || (typeof play !== "undefined" ? play : null);

    if (!pause) {
        currentSong.play();
        if (playbtn) playbtn.src = "pause.svg";
    } else {
        if (playbtn) playbtn.src = "play.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Folders List Read and Console display function
async function displayAlbums() {
    try {
        let a = await fetch(`/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";
        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index]
            let href = e.href;
            if (href.includes("/songs/")) {
                let parts = href.split("/").filter(Boolean);
                let folder = parts[parts.length - 1];
                if (folder !== "songs") {
                    try {
                        let res = await fetch(`songs/${folder}/info.json`)
                        let info = await res.json();
                        cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                        <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="50" height="50">
                        <!-- Green Circle Background -->
                        <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                        <!-- Black Play Triangle -->
                        <polygon points="40,32 70,50 40,68" fill="#000000" />
                        </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                        </div>`;
                    } catch (err) {
                        console.error(`info.json missing in ${folder}:`, err);
                    }
                }
            }
        }
                    // Dynamic card listner
                    Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folderName = item.currentTarget.dataset.folder;
                if(!folderName){
                    console.error("Card par data-folder attribute missing hai");
                    return;
                }
                console.log("fetching songs folder", folder)
                songs = await getSongs(`songs/${folderName}`);
                if (songs && songs.length > 0) {
                    playMusic(songs[0]);
                }
            });
        });

    } catch (error) {
        console.error("Albums fetch kare mein error aaya:", error)
    }
}


// Main Execution Function
async function main() {
    // 1. First Playlist (NCS)
    await getSongs("songs/ncs");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }

    // 2. Display Albums
//    await displayAlbums();

    // 3. Album Card Click Events (ncs, cs, etc.)
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            if (!folder) {
                console.error("Card par data-folder attribute missing hai");
                return;
            }
            console.log("fetching songs folder:", folder);
            songs = await getSongs(`songs/${folder}`);
            if (songs && songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });

    // 4. Play / Pause Button Listener
    let playbtn = document.querySelector("#play") || (typeof play !== "undefined" ? play : null);
    if (playbtn) {
        playbtn.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                playbtn.src = "pause.svg";
            } else {
                currentSong.pause();
                playbtn.src = "play.svg";
            }
        });
    }

    // 5. TimeUpdate & Seekbar Circle Sync
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // 6. Seekbar Click Listener
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // 7. Mobile Hamburger Drawer Open
    let hamburger = document.querySelector(".hamburger");
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });
    }

    // 8. Mobile Drawer Close Button
    let closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });
    }

    // 9. Previous Song Button
    let prevbtn = document.querySelector("#previous") || (typeof previous !== "undefined" ? previous : null);
    if (prevbtn) {
        prevbtn.addEventListener("click", () => {
            let currentFileName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
            let index = songs.indexOf(currentFileName);
            console.log("current index ", index);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });
    }

    // 10. Next Song Button
    let nextbtn = document.querySelector("#next") || (typeof next !== "undefined" ? next : null);
    if (nextbtn) {
        nextbtn.addEventListener("click", () => {
            currentSong.pause();
            let currentFileName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
            let index = songs.indexOf(currentFileName);
            console.log("current index ", index);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });
    }

    // 11. Volume Control Slider
    let rangeInput = document.querySelector(".range input") || document.querySelector(".range");
    let volText = document.querySelector(".vol-text") || document.querySelector(".text");
    if (rangeInput) {
        rangeInput.addEventListener("input", (e) => {
            if (volText) volText.innerHTML = `${e.target.value}%`;
            currentSong.volume = parseInt(e.target.value) / 100;
        });
    }
}

main();