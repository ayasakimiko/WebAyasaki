document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-music");
  const playBtn = document.getElementById("mini-toggle");
  const muteBtn = document.getElementById("volume-icon");
  const topVolumeRange = document.getElementById("volume-range");
  const currentTimeEl = document.getElementById("mini-current");
  const durationEl = document.getElementById("mini-duration");
  const seekBar = document.getElementById("mini-seek");
  const miniTitle = document.querySelector(".mini-title");
  if (!audio) return;

  // State
  let lastVolume = typeof audio.volume === "number" ? audio.volume : 0.5;
  let uiReady = false;
  let durationKnown = false;
  let isScrubbing = false;
  let wasPlayingBeforeScrub = false;

  // Util
  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const extractFilename = (url) => {
    if (!url) return "";
    let name = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1));
    return name.includes(".") ? name.substring(0, name.lastIndexOf(".")) : name;
  };

  const setSeekMaxIfPossible = () => {
    if (!seekBar) return;
    if (isFinite(audio.duration) && audio.duration > 0) {
      durationKnown = true;
      seekBar.max = audio.duration;
      seekBar.step = 0.001;
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    }
  };

  const updatePlayPauseIcon = () => {
    if (!playBtn) return;
    playBtn.innerHTML = audio.paused
      ? '<i class="fas fa-play"></i>'
      : '<i class="fas fa-pause"></i>';
  };

  const updateVolumeIcon = () => {
    if (!muteBtn) return;
    let icon = "fa-volume-up";
    if (audio.muted || audio.volume === 0) icon = "fa-volume-mute";
    else if (audio.volume <= 0.5) icon = "fa-volume-down";
    muteBtn.className = `fas ${icon}`;
  };

  const updateSeekBarProgress = () => {
    if (!seekBar) return;
    const max = parseFloat(seekBar.max || "0");
    const val = parseFloat(seekBar.value || "0");
    const progress = max > 0 ? (val / max) * 100 : 0;
    seekBar.style.setProperty("--seek-progress", `${progress}%`);
  };

  const updateSeekUI = () => {
    if (!seekBar || isScrubbing) return;
    if (!durationKnown && isFinite(audio.currentTime) && audio.currentTime > 0) {seekBar.max = Math.max(seekBar.max || 0, 1);}
    seekBar.value = audio.currentTime || 0;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime || 0);
    updateSeekBarProgress();
  };

  const loop = () => {
    if (uiReady) updateSeekUI();
    requestAnimationFrame(loop);
  };

  // Init
  const audioSrc = audio.querySelector("source")?.src || audio.src;
  if (miniTitle) miniTitle.textContent = extractFilename(audioSrc) || "Unknown Track";

  if (typeof audio.volume !== "number") audio.volume = 0.5;
  if (topVolumeRange) {
    topVolumeRange.value = Math.round((audio.volume ?? 0.5) * 100);
    lastVolume = audio.volume ?? 0.5;
  }
  updateVolumeIcon();
  updatePlayPauseIcon();
  updateSeekBarProgress();

  // Media Even
  audio.addEventListener("loadedmetadata", () => {
    setSeekMaxIfPossible();
    uiReady = true;
  });

  audio.addEventListener("durationchange", setSeekMaxIfPossible);

  audio.addEventListener("canplay", () => {
    uiReady = true;
    setSeekMaxIfPossible();
  });

  audio.addEventListener("playing", () => {
    uiReady = true;
    setSeekMaxIfPossible();
  });

  audio.addEventListener("timeupdate", () => {
    uiReady = true;
    if (!durationKnown) setSeekMaxIfPossible();
    updateSeekUI();
  });

  audio.addEventListener("ended", () => {
    updatePlayPauseIcon();
    setSeekMaxIfPossible();
    updateSeekUI();
  });

  audio.addEventListener("play", updatePlayPauseIcon);
  audio.addEventListener("pause", updatePlayPauseIcon);

  // User input
  const onScrubStart = () => {
    if (!seekBar) return;
    isScrubbing = true;
    wasPlayingBeforeScrub = !audio.paused;
    if (wasPlayingBeforeScrub) audio.pause();
  };

  const onScrubMove = () => {
    if (!isScrubbing || !seekBar) return;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(parseFloat(seekBar.value) || 0);updateSeekBarProgress();
  };

  const onScrubEnd = () => {
    if (!isScrubbing || !seekBar) return;
    const max = isFinite(audio.duration) && audio.duration > 0? audio.duration: Math.max(parseFloat(seekBar.max || "0"), 0);
    const val = Math.min(Math.max(parseFloat(seekBar.value) || 0, 0), max || 0);
    audio.currentTime = val;
    isScrubbing = false;
    uiReady = true;
    if (wasPlayingBeforeScrub) audio.play().catch(() => {});
  };

  seekBar?.addEventListener("pointerdown", onScrubStart);
  seekBar?.addEventListener("pointermove", onScrubMove);
  window.addEventListener("pointerup", onScrubEnd);
  seekBar?.addEventListener("touchstart", onScrubStart, { passive: true });
  seekBar?.addEventListener("touchmove",  onScrubMove,  { passive: true });
  window.addEventListener("touchend", onScrubEnd);

  seekBar?.addEventListener("input", () => {
    if (isScrubbing) return;
    const max = isFinite(audio.duration) && audio.duration > 0? audio.duration: Math.max(parseFloat(seekBar.max || "0"), 0);
    const val = Math.min(Math.max(parseFloat(seekBar.value) || 0, 0), max || 0);
    audio.currentTime = val;
    uiReady = true;
    updateSeekBarProgress();
    if (currentTimeEl) currentTimeEl.textContent = formatTime(val);
  });

  seekBar?.addEventListener("change", updateSeekUI);

  playBtn?.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  muteBtn?.addEventListener("click", () => {
    if (!topVolumeRange) return;
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

  const onVolume = () => {
    if (!topVolumeRange) return;
    const v = Math.min(Math.max(topVolumeRange.value / 100, 0), 1);
    audio.volume = v;
    audio.muted = v === 0;
    if (v > 0) lastVolume = v;
    updateVolumeIcon();
  };
  
  topVolumeRange?.addEventListener("input", onVolume);
  topVolumeRange?.addEventListener("touchmove", onVolume);
  topVolumeRange?.addEventListener("touchend", onVolume);

  // Safety Fallback
  setTimeout(() => {
    if (!uiReady && !audio.paused) uiReady = true;}, 1200);

  loop();
});

// Loading/Start
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  const mainContent = document.querySelector(".profile-center");
  const topControls = document.querySelector(".top-controls");
  const bgMusic = document.getElementById("bg-music");
  const enter = document.getElementById("enter-text");
  const vol = document.getElementById("volume-range");

  const handleStart = () => {
    loader?.classList.add("hidden");
    mainContent?.classList.add("visible");

    if (topControls) {
      topControls.style.display = "flex";
      topControls.style.opacity = "1";
      topControls.style.pointerEvents = "auto";
    }

    if (bgMusic) {
      bgMusic.volume = vol ? vol.value / 100 : 0.5;
      bgMusic.play().catch(() => {});
    }
  };

  enter?.addEventListener("click", handleStart);
  loader?.addEventListener("click", handleStart);
});
























