console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

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

async function getSongs(folder) {
    currFolder = folder;

    // Load master song list
    const res = await fetch("/songs/songs.json");
    const data = await res.json();

    // Extract album key (e.g. songs/ncs → ncs)
    const albumKey = folder.split("/")[1];

    songs = data[albumKey].songs;

    // Render song list
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="images_For_Project/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Rick</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="images_For_Project/play.svg">
            </div>
        </li>`;
    }

    // Click to play
    Array.from(document.querySelectorAll(".songList li"))
        .forEach((li, index) => {
            li.addEventListener("click", () => {
                playMusic(songs[index]);
            });
        });

    return songs;
}


const playMusic = (track, pause = false) => {
    const encodedTrack = encodeURIComponent(track);

    currentSong.src = `/${currFolder}/${encodedTrack}`;

    if (!pause) {
        currentSong.play().catch(err => console.log("Play error:", err));
        play.src = "images_For_Project/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
    const res = await fetch("./songs/songs.json");
    const albums = await res.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    Object.keys(albums).forEach(key => {
        const album = albums[key];

        cardContainer.innerHTML += `
            <div data-folder="${key}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                    </svg>
                </div>
                <img src="./songs/${key}/${album.cover}" alt="${album.title}">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>
        `;
    });

    // Click handler
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}



async function main() {
    // get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images_For_Project/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images_For_Project/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.
            currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous 
    previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop()
    );

    let index = songs.indexOf(currentTrack);

    // safety guard
    if (index === -1) {
        playMusic(songs[0]);
        return;
    }

    // wrap to last song if first
    if (index === 0) {
        playMusic(songs[songs.length - 1]);
    } else {
        playMusic(songs[index - 1]);
    }
});


    // Add an event listener to next
    next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop()
    );

    let index = songs.indexOf(currentTrack);

    if (index === -1) {
        playMusic(songs[0]);
        return;
    }

    if (index === songs.length - 1) {
        playMusic(songs[0]); // wrap to first
    } else {
        playMusic(songs[index + 1]);
    }
});



    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images_For_Project/mute.svg", "images_For_Project/volume.svg")
        }
    })

    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if(e.target.src.includes("images_For_Project/volume.svg")){
            e.target.src = e.target.src.replace("images_For_Project/volume.svg", "images_For_Project/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("images_For_Project/mute.svg", "images_For_Project/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()