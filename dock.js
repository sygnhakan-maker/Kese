/* Ana menü klavye kısayolu. */
(function () {
  'use strict';
  const toggle = document.getElementById('fab-btn');
  toggle.setAttribute('aria-keyshortcuts', 'Alt+M');
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key.toLowerCase() === 'm' && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      if (toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
    }
  });
})();
