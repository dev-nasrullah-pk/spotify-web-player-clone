console.log('Let start js');
let songs;
let currFolder;
let currentSong = new Audio();
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    };

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
};
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/songs.json`);
    songs = await a.json()
    // let response = await a.json();
    // let div = document.createElement("div");
    // div.innerHTML = ""
    // let as = div.getElementsByTagName("a")
    // for (let index = 0; index < as.length; index++) {
    //     const element = as[index];
    //     if (element.href.endsWith(".mp3")) {
    //         let clearUrl = element.href.replaceAll("%5C", "/")
    //         let songName = clearUrl.split(`${folder}/`)[1] || clearUrl.split(`${folder}`)[1];
    //         songs.push(songName);
    //     }
    // };
    //Show all the songs in the playliist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    };
    //Attach an event listner to each Song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index)=> {
        e.addEventListener("click", () => {
            playMusic(songs[index])
        })
    });
    return songs
};

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `${currFolder}/${track}`;
    let playbtn =document.querySelector("#play")
    if (!pause) {
        currentSong.play() 
        if(playbtn) playbtn.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach(e => {
        if (e.href.includes("/songs")) {
            console.log(e.href)
        }

    });
};
async function main() {
    //Get the First All the songs
    await getSongs("songs/ncs");
    if(songs && songs.length > 0){
        playMusic(songs[0], true)
    }

    displayAlbums();
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            if (!folder){
                console.error("Card par data-folder missing hai")
                return;
            }
            console.log("fetching songs folder", folder)
            songs = await getSongs(`songs/${folder}`)
            if(songs && songs.length > 0 ){
                playMusic(songs[0]);
            }
        })
    });
    //Play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
        }
    });
    // TimeUpdate Listener
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //Seekhbar Listener
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })
    //Humburger Select Button
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listner for close buutton
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    //Previous Button
    previous.addEventListener("click", () => {
        let currentFileName = decodeURI(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFileName);
        console.log("current index ", index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //Next Listener
    next.addEventListener("click", () => {
        currentSong.pause()
        let currentFileName = decodeURI(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFileName);
        console.log("current index ", index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //Volume Listener
    let para = document.querySelector(".text")
    document.querySelector(".range").addEventListener("input", (e) => {
        para.innerHTML = `${e.target.value}%`;
        currentSong.volume = parseInt(e.target.value) / 100;

    })
};
main();