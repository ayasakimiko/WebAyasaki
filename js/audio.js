document.addEventListener("DOMContentLoaded", () => {
    // ───── ELEMENTS ─────
    const audio = document.getElementById("bg-music");
    const playBtn = document.getElementById("mini-toggle");
    const muteBtn = document.getElementById("volume-icon");
    const topVolumeRange = document.getElementById("volume-range");
    const currentTimeEl = document.getElementById("mini-current");
    const durationEl = document.getElementById("mini-duration");
    const seekBar = document.getElementById("mini-seek");
    const miniTitle = document.querySelector(".mini-title");

    // ───── STATE ─────
    let lastVolume = audio?.volume ?? 0.5;

    // ───── UTILITIES ─────
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const extractFilename = (url) => {
        let name = url.substring(url.lastIndexOf('/') + 1);
        name = decodeURIComponent(name);
        return name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
    };

    const updatePlayPauseIcon = () => {
        if (!playBtn || !audio) return;
        playBtn.innerHTML = audio.paused
            ? '<i class="fas fa-play"></i>'
            : '<i class="fas fa-pause"></i>';
    };

    const updateVolumeIcon = () => {
        if (!muteBtn || !audio) return;
        let icon = 'fa-volume-up';
        if (audio.muted || audio.volume === 0) icon = 'fa-volume-mute';
        else if (audio.volume <= 0.5) icon = 'fa-volume-down';
        muteBtn.className = `fas ${icon}`;
    };

    const updateSeekBarProgress = () => {
        if (!audio || !seekBar || !audio.duration) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        seekBar.style.setProperty('--seek-progress', `${progress}%`);
    };

    const updateSeekUI = () => {
        if (!audio || !seekBar) return;
        seekBar.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        updateSeekBarProgress();
    };

    const syncSeekBar = () => {
        updateSeekUI();
        requestAnimationFrame(syncSeekBar);
    };

    // ───── INITIALIZE ─────
    if (audio) {
        const audioSrc = audio.querySelector("source")?.src || audio.src;
        miniTitle.textContent = extractFilename(audioSrc) || "Unknown Track";
        audio.volume = audio.volume ?? 0.5;
        if (topVolumeRange) {
            topVolumeRange.value = Math.round(audio.volume * 50);
            lastVolume = audio.volume;
        }
        updateVolumeIcon();
        updatePlayPauseIcon();
        updateSeekBarProgress();
    }

    // ───── EVENTS: AUDIO ─────
    if (audio) {
        audio.addEventListener("loadedmetadata", () => {
            if (seekBar) {
                seekBar.max = audio.duration;
                seekBar.value = 0;
            }
            if (durationEl) durationEl.textContent = formatTime(audio.duration);
            if (currentTimeEl) currentTimeEl.textContent = "0:00";
            updateSeekBarProgress();
        });

        audio.addEventListener("timeupdate", () => {
            updateSeekUI();
            if (audio.currentTime >= audio.duration && !audio.loop) {
                seekBar && (seekBar.value = seekBar.max);
                durationEl && (durationEl.textContent = formatTime(audio.duration));
                updatePlayPauseIcon();
            }
        });

        audio.addEventListener("play", updatePlayPauseIcon);
        audio.addEventListener("pause", updatePlayPauseIcon);
    }

    // ───── EVENTS: USER INPUT ─────
    seekBar?.addEventListener("input", () => {
        if (audio) {
            audio.currentTime = seekBar.value;
            updateSeekUI();
        }
    });

    seekBar?.addEventListener("change", updateSeekUI);

    playBtn?.addEventListener("click", () => {
        if (audio) {
            audio.paused ? audio.play() : audio.pause();
        }
    });

    muteBtn?.addEventListener("click", () => {
        if (!audio || !topVolumeRange) return;
        if (audio.muted) {
            audio.muted = false;
            audio.volume = lastVolume || 0.5;
            topVolumeRange.value = Math.round(audio.volume * 100);
        } else {
            if (audio.volume > 0) lastVolume = audio.volume;
            audio.muted = true;
            audio.volume = 0;
            topVolumeRange.value = 0;
        }
        updateVolumeIcon();
    });

    const handleVolumeChange = () => {
        if (!audio || !muteBtn || !topVolumeRange) return;
        const newVol = topVolumeRange.value / 100;
        audio.volume = newVol;
        audio.muted = newVol === 0;
        if (newVol > 0) lastVolume = newVol;
        updateVolumeIcon();
    };

    topVolumeRange?.addEventListener("input", handleVolumeChange);
    topVolumeRange?.addEventListener("touchmove", handleVolumeChange);
    topVolumeRange?.addEventListener("touchend", handleVolumeChange);

    syncSeekBar();
});

window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    const mainContent = document.querySelector('.profile-center');
    const topControls = document.querySelector('.top-controls');
    const bgMusic = document.getElementById('bg-music');
    const enterTextButton = document.getElementById('enter-text');
    const topVolumeRange = document.getElementById("volume-range");

    const handleStart = () => {
        loader?.classList.add('hidden');
        mainContent?.classList.add('visible');

        if (topControls) {
            topControls.style.display = 'flex';
            topControls.style.opacity = '1';
            topControls.style.pointerEvents = 'auto';
        }

        if (bgMusic) {
            bgMusic.volume = topVolumeRange ? topVolumeRange.value / 100 : 0.5;
            bgMusic.play().catch((e) => {
                console.log('Autoplay was blocked:', e);
            });
        }
    };

    enterTextButton?.addEventListener('click', handleStart);
    loader?.addEventListener('click', handleStart);
});























