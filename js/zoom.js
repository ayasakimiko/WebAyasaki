// zoom lock
window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) {
    e.preventDefault();
  }
});
document.querySelector('.profile-center').classList.add('visible');

 function resizeElement() {
    const fullScreenDiv = document.getElementById("fullscreen");
    fullScreenDiv.style.width = window.innerWidth + "px";
    fullScreenDiv.style.height = window.innerHeight + "px";
  }

  window.addEventListener("resize", resizeElement);
  window.addEventListener("load", resizeElement);
