/* Kese'nin kısa oyunları. Oyun durumu yalnızca açık pencerede yaşar. */
window.openKeseGames = function ({ mascot, play, restoreFocus }) {
  if (document.querySelector('dialog[open]')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'pet-games';
  dialog.setAttribute('aria-labelledby', 'pet-game-title');
  dialog.innerHTML = '<header><h2 id="pet-game-title">Kese ile oyna</h2><button class="btn ghost sm" type="button" aria-label="Kapat">×</button></header><div class="game-body"></div><footer><button type="button" class="btn">Oyundan çık</button></footer>';
  document.body.appendChild(dialog);
  const title = dialog.querySelector('h2');
  const body = dialog.querySelector('.game-body');
  const close = dialog.querySelector('header button');
  close.onclick = () => dialog.close();
  dialog.querySelector('footer button').onclick = close.onclick;
  const timers = new Set();
  function later(fn, ms) {
    const timer = setTimeout(() => { timers.delete(timer); if (dialog.open) fn(); }, ms);
    timers.add(timer);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
  dialog.addEventListener('close', () => { clearTimers(); dialog.remove(); restoreFocus(); }, { once: true });
  function button(label, action, parent = body) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn ghost'; b.textContent = label; b.onclick = action;
    parent.appendChild(b);
    return b;
  }
  function page(name, game) {
    clearTimers();
    title.textContent = name;
    body.replaceChildren();
    if (game) button('‹ Oyunlar', menu).classList.add('game-back');
  }
  function status(message) {
    const p = document.createElement('p');
    p.className = 'game-status'; p.setAttribute('role', 'status'); p.textContent = message;
    body.appendChild(p);
    return p;
  }
  function row() {
    const r = document.createElement('div');
    r.className = 'game-choices'; body.appendChild(r); return r;
  }
  function menu() {
    page('Kese ile oyna');
    button('✋  Çak bir beşlik', highFive).focus();
    button('🎵  Sırayı tekrarla', sequence);
    button('🪙  Parayı bul', coin);
  }
  function highFive() {
    page('Çak bir beşlik', true);
    const hand = button('', () => {
      hand.classList.remove('clap'); void hand.offsetWidth; hand.classList.add('clap');
      play('pop'); message.textContent = 'Çak! ✋';
    });
    hand.classList.add('game-hand');
    hand.innerHTML = mascot.replaceAll('pk-k', 'game-k');
    hand.setAttribute('aria-label', 'Kese ile beşlik çak');
    const message = status('Elime dokun!');
    hand.focus();
  }
  function sequence() {
    page('Sırayı tekrarla', true);
    const message = status('Sırayı izle.');
    const choices = row();
    const names = ['Ay', 'Yıldız', 'Güneş'];
    const labels = ['☾ Ay', '★ Yıldız', '☀ Güneş'];
    const pattern = Array.from({length: 3}, () => Math.floor(Math.random() * names.length));
    let index = 0, ready = false;
    const pads = labels.map((label, i) => button(label, () => {
      if (!ready) return;
      if (pattern[index] !== i) { finish('Bu kez olmadı.'); return; }
      play('pop');
      index++;
      if (index === pattern.length) finish('Aynen öyle! 🎵');
      else message.textContent = index + ' / ' + pattern.length;
    }, choices));
    function finish(text) {
      ready = false;
      pads.forEach(b => { b.disabled = true; });
      message.textContent = text;
      button('Tekrar oyna', sequence).focus();
    }
    pads.forEach(b => { b.disabled = true; });
    body.querySelector('.game-back').focus();
    pattern.forEach((i, step) => {
      later(() => { pads[i].classList.add('lit'); message.textContent = (step + 1) + '. ' + names[i]; }, 550 + step * 900);
      later(() => pads[i].classList.remove('lit'), 1220 + step * 900);
    });
    later(() => {
      ready = true; message.textContent = 'Şimdi sıra sende.';
      pads.forEach(b => { b.disabled = false; }); pads[0].focus();
    }, 3250);
  }
  function coin() {
    page('Parayı bul', true);
    const target = Math.floor(Math.random() * 3);
    const message = status('Paranın yerini hatırla.');
    const cups = row();
    const buttons = Array.from({length: 3}, (_, i) => button(i === target ? '🪙' : '·', () => {
      buttons.forEach((b, n) => { b.disabled = true; b.textContent = n === target ? '🪙' : '·'; });
      message.textContent = i === target ? 'Buldun! 🪙' : 'Para ' + (target + 1) + '. kaptaydı.';
      if (i === target) play('ding');
      button('Tekrar oyna', coin).focus();
    }, cups));
    buttons.forEach((b, i) => {
      b.disabled = true; b.setAttribute('aria-label', (i + 1) + '. kap');
    });
    message.textContent = 'Para ' + (target + 1) + '. kapta. Yerini hatırla.';
    body.querySelector('.game-back').focus();
    later(() => {
      message.textContent = 'Para hangi kapta?';
      buttons.forEach((b, i) => { b.disabled = false; b.textContent = '▰ ' + (i + 1); });
      buttons[0].focus();
    }, 1500);
  }
  dialog.showModal();
  menu();
};
