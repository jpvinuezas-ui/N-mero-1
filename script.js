// script.js — Menú móvil accesible y estable
(function () {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mainMenu');
  if (!btn || !menu) return;

  // abrir/cerrar por click
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // cerrar si se hace click fuera
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // reset si se cambia a escritorio
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // cierre con tecla Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
})();
