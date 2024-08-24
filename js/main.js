

let controller = {
    audio: document.getElementById("audio"),
    playBtn: document.getElementById("play"),
    state: "pause",

    init: async function () {
        try {
            let res = await fetch("js/data.json");
            let jsonData = await res.json();
            for (let key in jsonData) {
                this.nextPrevTrack(jsonData[key]);
            }

        }
        catch (error) {
            console.error(error);
        }

    },

    loadDuration: function () {
        audio.load();
        this.audio.addEventListener("loadedmetadata", () => {
            this.formattedSeconds(this.audio.duration, "duration");
            this.formattedSeconds(this.audio.currentTime, "currentTime");
        })
        this.audio.addEventListener("timeupdate", () => {
            this.formattedSeconds(this.audio.currentTime, "currentTime");
            this.keepTrackSeekSlider(this.audio.currentTime);
        });

    },

    formattedSeconds: function (secs, type) {
        try {
            let minutes = Math.floor(secs / 60);
            let seconds = Math.floor(secs % 60);
            let formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
            let formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            if (type === 'duration') {
                view.updateDuration(formattedMinutes, formattedSeconds);
            } else if (type === 'currentTime') {
                view.updateCurrentTime(formattedMinutes, formattedSeconds);
            }
        } catch (error) {
            console.error(error);
        }
    },

    togglePlayStop: function () {
        let playStopSrc = ["images/Play_fill.svg", "images/Stop_and_play_fill.svg"];
        [playSrc, pauseSrc] = playStopSrc;
        this.playBtn.addEventListener("click", () => {
            this.state === "pause"
                ? (this.state = "play", this.audio.play(), view.updatePlayStop(pauseSrc))
                : (this.state = "pause", this.audio.pause(), view.updatePlayStop(playSrc));
        })
    },

    nextPrevTrack: function (data) {
        let playStopSrc = ["images/Play_fill.svg", "images/Stop_and_play_fill.svg"];
        [playSrc, pauseSrc] = playStopSrc;
        let currentTrackIndex = 0;
        let sourceElement = document.querySelector("source");
        let getTrackIndex = (index) => {
            let currentTrack = data.find(track => track.track_index === index)
            sourceElement.src = currentTrack.trackSrc;
            let currentTrackImg = currentTrack.src_img;
            let currentTrackName = currentTrack.trackName;
            let currentTrackSinger = currentTrack.singer
            view.updateTrackInfo(currentTrackImg, currentTrackName, currentTrackSinger)
            this.state = "play"
            this.audio.load();
            this.audio.play();
            view.updatePlayStop(pauseSrc);
        }
        let nextBtn = document.getElementById("next");
        let prevBtn = document.getElementById("prev");

        nextBtn.addEventListener("click", () => {
            if (nextBtn.id === "next" && currentTrackIndex < data.length - 1) {
                currentTrackIndex++;
            } else {
                currentTrackIndex = 0
            }
            getTrackIndex(currentTrackIndex);
        })
        prevBtn.addEventListener("click", () => {
            if (prevBtn.id === "prev" && currentTrackIndex > 0) {
                currentTrackIndex--;
            } else {
                currentTrackIndex = data.length - 1;
            }
            getTrackIndex(currentTrackIndex)
        })
    },

    keepTrackSeekSlider: function (currentTime) {
        let percentage = ((currentTime / this.audio.duration) * 100);
        view.updateSeekSlider(percentage);
    },

    setSeekSlider: function () {
        let SeekSliderElement = document.querySelector(".progress");
        SeekSliderElement.addEventListener("click", (e) => {
            let width = e.target.clientWidth;
            let clickPoint = e.offsetX;
            let percentage = Math.floor((clickPoint / 316) * 100);
            view.updateSeekSlider(Math.floor(percentage));
            this.audio.currentTime = (percentage / 100) * this.audio.duration;
            this.state = "play";
            view.updatePlayStop("images/Stop_and_play_fill.svg");
            this.audio.play();
        })
    }
}




let view = {
    updateDuration: function (minutes, seconds, type) {
        let durationElement = document.getElementById("duration");
        durationElement.innerHTML = `${minutes}:${seconds}`;
    },

    updateCurrentTime: function (minutes, seconds) {
        let currentTimeElement = document.getElementById("current_time");
        currentTimeElement.innerHTML = `${minutes}:${seconds}`;
    },

    updateSeekSlider: function (percentage) {
        let progressElement = document.getElementById("progress-bar");
        progressElement.style.width = `${percentage}%`;
    },

    updatePlayStop: function (currentSrc) {
        let imgElement = controller.playBtn.querySelector("img");
        imgElement.src = currentSrc;
    },

    updateTrackInfo: function (srcImg = "unknown_img.jpg", trackName, singerName = "unknown singer") {
        let trackImg = document.getElementById("track_img");
        trackImg.src = `images/${srcImg}`;
        let trackNameElement = document.getElementById("track_name");
        trackNameElement.innerHTML = trackName;
        let singerNameElement = document.getElementById("singer_name");
        singerNameElement.innerHTML = singerName;
    }

}


controller.init();
controller.loadDuration();
controller.togglePlayStop();
controller.setSeekSlider();
