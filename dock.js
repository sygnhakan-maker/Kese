/* Kese yüzen cam menü (dock): her zaman görünür, sabit ve tek dokunuşta ulaşılabilir.
 * - Otomatik gizlenme yok; kullanıcı menüyü aramak zorunda kalmaz.
 * - #dock-handle her zaman gizli kalır.
 * - Alt+M kısayolu menüdeki aktif düğmeye odaklar (erişilebilirlik).
 * - Sekme değişiminde hafif yaylı vurgu (is-ping) ve main h1 odak yönetimi korunur. */
(function () {
  'use strict';
  var dock = document.getElementById('dock');
  var handle = document.getElementById('dock-handle');
  if (!dock) return;

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: no-preference)') : null;
  function allowMotion() { return !!(mq && mq.matches); }

  // Menü her zaman görünür ve etkileşime açık; tutamaç daima gizli
  dock.classList.remove('is-hidden');
  dock.removeAttribute('inert');
  dock.setAttribute('aria-keyshortcuts', 'Alt+M');
  if (handle) {
    handle.hidden = true;
    handle.setAttribute('aria-hidden', 'true');
    handle.setAttribute('aria-expanded', 'true');
  }

  function ping(btn) {
    if (!btn || !allowMotion()) return;
    btn.classList.remove('is-ping');
    void btn.offsetWidth;
    btn.classList.add('is-ping');
    clearTimeout(btn._pingT);
    btn._pingT = setTimeout(function () { btn.classList.remove('is-ping'); }, 480);
  }

  // Sekme veya eylem seçildiğinde: yaylı vurgu + sayfa başlığına odak
  dock.addEventListener('click', function (e) {
    var navBtn = e.target.closest('[data-nav]');
    var actBtn = e.target.closest('[data-act]');
    if (!navBtn && !actBtn) return;

    if (actBtn) ping(actBtn);
    if (navBtn) {
      requestAnimationFrame(function () {
        var cur = dock.querySelector('[aria-current="page"]');
        ping(cur || navBtn);
        var h = document.querySelector('main h1, .page-head h1');
        if (h) {
          h.setAttribute('tabindex', '-1');
          h.focus({ preventScroll: true });
        }
      });
    }
  });

  // Ekran okuyucu duyurusu
  var live = document.createElement('div');
  live.setAttribute('role', 'status');
  live.className = 'sr-only';
  document.body.appendChild(live);
  function announce(t) {
    live.textContent = '';
    setTimeout(function () { live.textContent = t; }, 30);
  }

  // Alt+M: ana menüdeki aktif düğmeye odakla
  document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      var b = dock.querySelector('[aria-current="page"], button');
      if (b) b.focus({ preventScroll: true });
      announce('Ana menüye odaklanıldı');
    }
  });
})();
