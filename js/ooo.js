const userId = "626071745576828955";

/*-----------------------------
| Unique Visit Counter
------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const visitKey = "hasVisited";
    const viewEl = document.getElementById("views-count");

    if (!localStorage.getItem(visitKey)) {
        let count = parseInt(localStorage.getItem("uniqueVisitCount")) || 0;
        count++;
        localStorage.setItem("uniqueVisitCount", count);
        localStorage.setItem(visitKey, "true");
        if (viewEl) viewEl.textContent = count;
    } else {
        const count = parseInt(localStorage.getItem("uniqueVisitCount")) || 0;
        if (viewEl) viewEl.textContent = count;
    }
});

/*-----------------------------
| Discord Presence via Lanyard
------------------------------*/
const statusEmojiMap = {
    online: "🟢",
    idle: "🌙",
    dnd: "⛔",
    offline: "⚫"
};

const statusTextMap = {
    online: "Online",
    idle: "Idle",
    dnd: "ห้ามรบกวน",
    offline: "Offline"
};

const ws = new WebSocket("wss://api.lanyard.rest/socket");

ws.addEventListener("open", () => {
    ws.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: userId }
    }));
});

ws.addEventListener("message", (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (err) {
        console.error("WebSocket JSON error:", err);
        return;
    }

    const { t, d } = data;
    if (!d || (t !== "INIT_STATE" && t !== "PRESENCE_UPDATE")) return;

    const user = d.discord_user;
    if (!user) return;

    const isGifAvatar = user.avatar && user.avatar.startsWith("a_");
    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGifAvatar ? "gif" : "webp"}?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

    const status = d.discord_status || "offline";
    const activities = d.activities || [];

    const customStatus = activities.find(a => a.type === 4);
    const game = activities.find(a => a.type === 0);         
    const spotify = activities.find(a => a.name === "Spotify"); 

    let fullActivityDisplay = ""; 

    // --- Logic ---
    if (game) {
        let serverTag = "";
        if (game.session_id) {
            serverTag = ` [Server: ${game.session_id}]`;
        } else if (game.party && game.party.id) {
            serverTag = ` [Server: ${game.party.id}]`;
        }

        if (game.details && game.state) {
            fullActivityDisplay = `🎮 กำลังเล่น ${game.name}: ${game.details} (${game.state})${serverTag}`;
        } else if (game.details) {
            fullActivityDisplay = `🎮 กำลังเล่น ${game.name}: ${game.details}${serverTag}`;
        } else if (game.state) {
            fullActivityDisplay = `🎮 กำลังเล่น ${game.name}: ${game.state}${serverTag}`;
        } else {
            fullActivityDisplay = `🎮 กำลังเล่น ${game.name}${serverTag}`;
        }
    } else if (customStatus && customStatus.state) {
        fullActivityDisplay = `${statusEmojiMap[status] || ""} ${customStatus.state}`;
    } else if (spotify) {
        fullActivityDisplay = `🎵 กำลังฟัง ${spotify.details || 'Unknown Song'} by ${spotify.state || 'Unknown Artist'}`;
    } else {
        fullActivityDisplay = `${statusEmojiMap[status] || ""} ${statusTextMap[status] || "ไม่มีสถานะ"}`;
    }

    // HTML elements
    const avatarEl = document.getElementById("discord-avatar");
    if (avatarEl) {
        avatarEl.src = avatarUrl;
        avatarEl.className = `avatar-main ${status}`;
    }

    const nameEl = document.getElementById("discord-name");
    if (nameEl) nameEl.textContent = user.username;

    const statusDotMini = document.getElementById("mini-status-dot");
    if (statusDotMini) statusDotMini.className = `status-dot ${status}`;

    const fullStatusEl = document.getElementById("discord-activity-status");
    if (fullStatusEl) {
        fullStatusEl.textContent = fullActivityDisplay;
        fullStatusEl.style.display = 'block';
    }

    const statusEl = document.getElementById("discord-status");
    if (statusEl) statusEl.style.display = 'none';

    const detailEl = document.getElementById("discord-activity-details");
    if (detailEl) detailEl.style.display = 'none';

    const miniActivityEl = document.getElementById("mini-activity");
    if (miniActivityEl) miniActivityEl.style.display = 'none';
});

/*-----------------------------
| Mouse Rotate Effect
------------------------------*/
const profile = document.querySelector('.profile-center');
const maxAngle = 20;
const deadZoneSizeX = window.innerWidth / 6;
const deadZoneSizeY = window.innerHeight / 6;
let timeoutId;

window.addEventListener('mousemove', (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    if (Math.abs(deltaX) < deadZoneSizeX && Math.abs(deltaY) < deadZoneSizeY) {
        profile.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    } else {
        const rotateY = (deltaX / centerX) * maxAngle * -1;
        const rotateX = (deltaY / centerY) * maxAngle;
        profile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        profile.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }, 1000);
});

/*-----------------------------
| Responsive Profile Transform
------------------------------*/
function adjustProfileTransform() {
    if (!profile) return;

    if (window.matchMedia("(max-width: 600px)").matches) {
        profile.style.transition = 'transform 0.3s ease';
        profile.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
    } else {
        profile.style.transition = '';
        profile.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
}
adjustProfileTransform();
window.addEventListener('resize', adjustProfileTransform);

/*-----------------------------
| Zoom Mini Player
------------------------------*/
const miniPlayer = document.querySelector('.mini-player');
function toggleZoom() {
    miniPlayer.classList.toggle('zoomed');
}

/*-----------------------------
| Lock F12
------------------------------*/

document.addEventListener('keydown', function(e) {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && (e.key === 'u' || e.key === 'c'))
  ) {
    e.preventDefault();
  }
});

/*-----------------------------
| Mouse Rotate Effect Intro
------------------------------*/

const enterText = document.getElementById('enter-text');
const maxTilt = 15; 
const shakeAmount = 1.5; 

window.addEventListener('mousemove', (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const offsetX = e.clientX - centerX;
  const offsetY = e.clientY - centerY;

  let rotateX = (-offsetY / centerY) * maxTilt;
  let rotateY = (offsetX / centerX) * maxTilt;

  rotateX += (Math.random() * shakeAmount * 2) - shakeAmount; 
  rotateY += (Math.random() * shakeAmount * 2) - shakeAmount;

  enterText.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
});

window.addEventListener('mouseleave', () => {
  enterText.style.transform = 'rotateX(0deg) rotateY(0deg)';
});


















