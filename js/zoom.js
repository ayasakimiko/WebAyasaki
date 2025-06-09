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