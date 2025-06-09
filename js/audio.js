// Audio Full setting
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-music");
  const playBtn = document.getElementById("mini-toggle");
  const muteBtn = document.getElementById("volume-icon");
  const topVolumeRange = document.getElementById("volume-range");
  const currentTimeEl = document.getElementById("mini-current");
  const durationEl = document.getElementById("mini-duration"); 
  const seekBar = document.getElementById("mini-seek");
  const miniTitle = document.querySelector(".mini-title");

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updatePlayPauseIcon() {
    playBtn.innerHTML = audio.paused
      ? '<i class="fas fa-play"></i>'
      : '<i class="fas fa-pause"></i>';
  }

  function updateVolumeIcon() {
    let iconClass;
    if (audio.muted || audio.volume === 0) iconClass = 'fa-volume-mute';
    else if (audio.volume <= 0.5) iconClass = 'fa-volume-down';
    else iconClass = 'fa-volume-up';

    muteBtn.className = `fas ${iconClass}`;
  }

  function extractFilename(url) {
    let filename = url.substring(url.lastIndexOf('/') + 1);
    filename = decodeURIComponent(filename);
    if (filename.includes('.')) {
      filename = filename.substring(0, filename.lastIndexOf('.'));
    }
    return filename;
  }

  const audioSrc = audio.querySelector("source")?.src || audio.src;
  if (audioSrc && miniTitle) {
    miniTitle.textContent = extractFilename(audioSrc);
  }

  function updateSeekBarProgress() {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    seekBar.style.setProperty('--seek-progress', `${progressPercent}%`);
  }

  audio.addEventListener("loadedmetadata", () => {
    seekBar.max = audio.duration;
    if(durationEl) durationEl.textContent = formatTime(audio.duration);
    currentTimeEl.textContent = `0:00`;
    seekBar.value = 0;
    updateSeekBarProgress();
  });

  audio.addEventListener("timeupdate", () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    seekBar.value = audio.currentTime;
    updateSeekBarProgress();

    if (audio.currentTime >= audio.duration) {
      seekBar.value = seekBar.max;
      if(durationEl) durationEl.textContent = formatTime(audio.duration);
      updatePlayPauseIcon();
    }
  });

  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
    updateSeekBarProgress();
  });

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  audio.addEventListener("play", updatePlayPauseIcon);
  audio.addEventListener("pause", updatePlayPauseIcon);

  topVolumeRange.addEventListener("input", (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    if (audio.muted && volume > 0) audio.muted = false;
    updateVolumeIcon();
  });

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    if (!audio.muted && audio.volume === 0) {
      audio.volume = 0.5;
      topVolumeRange.value = 50;
    }
    updateVolumeIcon();
  });


  topVolumeRange.value = Math.round(audio.volume * 100);
  updateVolumeIcon();
  updatePlayPauseIcon();
});




















