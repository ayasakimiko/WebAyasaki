// 🔒 Prevent zoom with Ctrl + Scroll
window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// 🔒 Prevent zoom
window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) {
    e.preventDefault();
  }
});

// ✅ Show profile once loaded
document.querySelector('.profile-center').classList.add('visible');

// 📏 Resize element to full screen
function resizeElement() {
  const fullScreenDiv = document.getElementById("fullscreen");
  fullScreenDiv.style.width = window.innerWidth + "px";
  fullScreenDiv.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resizeElement);
window.addEventListener("load", resizeElement);

// ✨ Firefly floating animation effect
(() => {
  const MQL_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (MQL_REDUCED.matches) return;

  // CONFIGURATION
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const COUNT = isMobile ? 15 : 50;              // Number of fireflies
  const SPEED_MIN = 20, SPEED_MAX = 50;          // Upward speed
  const SWAY_AMP_MIN = 10, SWAY_AMP_MAX = 20;    // Left-right sway amplitude
  const SWAY_FREQ_MIN = 0.5, SWAY_FREQ_MAX = 1;  // Sway frequency
  const SIZE_MIN = 4, SIZE_MAX = 7;              // Firefly size

  // Twinkle
  const OPACITY_BASE_MIN = 0.55, OPACITY_BASE_MAX = 0.85;
  const TWINKLE_AMP_MIN  = 0.10, TWINKLE_AMP_MAX  = 0.30;
  const TWINKLE_HZ_MIN   = 0.25, TWINKLE_HZ_MAX   = 0.9;

  // VARIABLES
  let container, particles = [], rafId = null, lastTime = 0;

  // Ensure the effect container exists
  function ensureContainer() {
    container = document.getElementById('effect-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'effect-container';
      document.body.appendChild(container);
    }
  }

  // 🔢 Random number generator helper
  const rand = (min, max) => min + Math.random() * (max - min);

  // 🟡 Create a single firefly particle
  function spawn(spawnAnywhere = true) {
    const el = document.createElement('div');
    el.className = 'effect-dot';

    // Set size
    const size = rand(SIZE_MIN, SIZE_MAX);
    el.style.width = el.style.height = size + 'px';
    el.style.willChange = 'transform, opacity, filter';

    // Random initial position
    const y = spawnAnywhere ? rand(0, innerHeight) : innerHeight + rand(0, 80);

    const p = {
      el,
      // Floating movement properties
      baseX: rand(0, innerWidth),
      y,
      vy: rand(SPEED_MIN, SPEED_MAX),
      swayAmp: rand(SWAY_AMP_MIN, SWAY_AMP_MAX),
      swayFreq: rand(SWAY_FREQ_MIN, SWAY_FREQ_MAX),
      phase: rand(0, Math.PI * 2),

      // Twinkle properties
      twPhase: rand(0, Math.PI * 2),
      twHz: rand(TWINKLE_HZ_MIN, TWINKLE_HZ_MAX),
      baseOpacity: rand(OPACITY_BASE_MIN, OPACITY_BASE_MAX),
      twAmp: rand(TWINKLE_AMP_MIN, TWINKLE_AMP_MAX),
    };

    // Initial opacity
    p.el.style.opacity = p.baseOpacity.toString();

    container.appendChild(el);
    particles.push(p);
    return p;
  }

  // 🟡 Spawn initial fireflies
  function fillInitial() {
    for (let i = 0; i < COUNT; i++) spawn(true);
  }

  // 🎞️ Animation frame update
  function step(now) {
    const dt = (now - (lastTime || now)) / 1000;
    lastTime = now;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move upward
      p.y -= p.vy * dt;
      p.phase += p.swayFreq * dt;
      const x = p.baseX + Math.sin(p.phase) * p.swayAmp;

      // Twinkle brightness effect
      p.twPhase += (Math.PI * 2) * p.twHz * dt;
      const tw = (Math.sin(p.twPhase) + 1) * 0.5;
      const opacity = p.baseOpacity + p.twAmp * (tw - 0.5) * 2;
      p.el.style.opacity = Math.max(0.05, Math.min(1, opacity)).toString();

      // Extra brightness boost
      const glowBoost = 1 + tw * 0.5;
      p.el.style.filter = `brightness(${glowBoost}) blur(0.5px)`;

      // Update position
      p.el.style.transform = `translate(${x}px, ${p.y}px)`;

      // Reset firefly if it leaves the screen
      if (p.y < -20) {
        p.y         = innerHeight + rand(0, 80);
        p.baseX     = rand(0, innerWidth);
        p.vy        = rand(SPEED_MIN, SPEED_MAX);
        p.swayAmp   = rand(SWAY_AMP_MIN, SWAY_AMP_MAX);
        p.swayFreq  = rand(SWAY_FREQ_MIN, SWAY_FREQ_MAX);
        p.phase     = rand(0, Math.PI * 2);
        p.twPhase     = rand(0, Math.PI * 2);
        p.twHz        = rand(TWINKLE_HZ_MIN, TWINKLE_HZ_MAX);
        p.baseOpacity = rand(OPACITY_BASE_MIN, OPACITY_BASE_MAX);
        p.twAmp       = rand(TWINKLE_AMP_MIN, TWINKLE_AMP_MAX);
      }
    }

    rafId = requestAnimationFrame(step);
  }

  // ▶️ Start animation
  function start() {
    ensureContainer();
    fillInitial();
    rafId = requestAnimationFrame(step);
  }

  // ⏹️ Stop animation
  function stop() {
    if (rafId) cancelAnimationFrame(rafId), rafId = null;
  }

  // ⏸️ Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      lastTime = 0;
      rafId = requestAnimationFrame(step);
    }
  });

  // 🚀 Auto-start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

