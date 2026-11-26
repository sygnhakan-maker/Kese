/* Kese · Kese arkadaş ve açılır "+" menüsü
 * - "+" düğmesi: alt menü sağdan sola uzar, seçenekler aşağıdan yukarı açılır; seçim yapılınca geri çekilir.
 * - Kese: ekranda gezer, sayfalara göre konuşur, çay içer / reels izler / uyur / dans eder.
 *   Dokununca tepki verir, sürüklenebilir. Ses açıksa efekt çalar ve (tarayıcı destekliyorsa) Türkçe konuşur.
 * Veriye yalnızca window.KeseApp.snapshot() ile salt okunur erişir; hiçbir kaydı değiştirmez. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const sysReduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const reduce = () => sysReduce() && store.get('kese_motion', '') !== '1';
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* yok say */ } } };
  const app = () => window.KeseApp || null;
  const muted = () => { const a = app(); if (a) return !!a.muted; return store.get('kese_ses', '1') === '0'; };
  const KESE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 132\" aria-hidden=\"true\" class=\"kese-svg\"><defs><radialGradient id=\"pk-kb\" cx=\"42%\" cy=\"40%\" r=\"70%\"><stop offset=\"0\" stop-color=\"#FFE08A\"/><stop offset=\".55\" stop-color=\"#FFC13D\"/><stop offset=\"1\" stop-color=\"#F08A12\"/></radialGradient><linearGradient id=\"pk-kr\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFE9A8\"/><stop offset=\"1\" stop-color=\"#FFC94F\"/></linearGradient><linearGradient id=\"pk-kp\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#8B5CF6\"/><stop offset=\"1\" stop-color=\"#6D28D9\"/></linearGradient></defs><ellipse class=\"k-foot k-foot-left\" cx=\"46\" cy=\"124\" rx=\"10\" ry=\"6\" fill=\"#C2570C\"/><ellipse class=\"k-foot k-foot-right\" cx=\"74\" cy=\"124\" rx=\"10\" ry=\"6\" fill=\"#C2570C\"/><g class=\"k-arm k-arm-l\"><ellipse cx=\"17\" cy=\"88\" rx=\"8\" ry=\"12\" transform=\"rotate(25 17 88)\" fill=\"url(#pk-kb)\" stroke=\"#B45309\" stroke-width=\"2\"/></g><g class=\"k-arm k-arm-r\"><ellipse cx=\"103\" cy=\"88\" rx=\"8\" ry=\"12\" transform=\"rotate(-25 103 88)\" fill=\"url(#pk-kb)\" stroke=\"#B45309\" stroke-width=\"2\"/></g><path d=\"M22 62 C14 98 26 124 60 124 C94 124 106 98 98 62 C94 50 80 46 60 46 C40 46 26 50 22 62 Z\" fill=\"url(#pk-kb)\" stroke=\"#B45309\" stroke-width=\"2.5\"/><path d=\"M36 66 C33 82 35 96 42 106\" fill=\"none\" stroke=\"#FFF3C4\" stroke-width=\"5\" stroke-linecap=\"round\" opacity=\".55\"/><path d=\"M30 50 C30 36 38 28 44 34 C46 22 56 20 60 30 C64 20 74 22 76 34 C82 28 90 36 90 50 Z\" fill=\"url(#pk-kr)\" stroke=\"#B45309\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/><rect x=\"28\" y=\"46\" width=\"64\" height=\"9\" rx=\"4.5\" fill=\"url(#pk-kp)\"/><path d=\"M60 51 C50 40 42 44 46 52 C49 58 56 55 60 51 Z\" fill=\"#A78BFA\" stroke=\"#5B21B6\" stroke-width=\"1.5\"/><path d=\"M60 51 C70 40 78 44 74 52 C71 58 64 55 60 51 Z\" fill=\"#A78BFA\" stroke=\"#5B21B6\" stroke-width=\"1.5\"/><circle cx=\"60\" cy=\"51\" r=\"3.5\" fill=\"#5B21B6\"/><path d=\"M58 54 L53 64 M62 54 L67 64\" stroke=\"#6D28D9\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><ellipse cx=\"36\" cy=\"94\" rx=\"8\" ry=\"5\" fill=\"#FF7FA8\" opacity=\".55\"/><ellipse cx=\"84\" cy=\"94\" rx=\"8\" ry=\"5\" fill=\"#FF7FA8\" opacity=\".55\"/><g class=\"k-eyes\"><ellipse cx=\"46\" cy=\"82\" rx=\"7.5\" ry=\"9.5\" fill=\"#2A1840\"/><ellipse cx=\"74\" cy=\"82\" rx=\"7.5\" ry=\"9.5\" fill=\"#2A1840\"/><circle cx=\"48.5\" cy=\"78\" r=\"3\" fill=\"#fff\"/><circle cx=\"76.5\" cy=\"78\" r=\"3\" fill=\"#fff\"/><circle cx=\"44\" cy=\"86\" r=\"1.4\" fill=\"#fff\" opacity=\".8\"/><circle cx=\"72\" cy=\"86\" r=\"1.4\" fill=\"#fff\" opacity=\".8\"/></g><path class=\"k-smile\" d=\"M53 96 Q60 103 67 96\" fill=\"none\" stroke=\"#2A1840\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><ellipse class=\"k-mouth\" cx=\"60\" cy=\"99\" rx=\"4.5\" ry=\"0\" fill=\"#7A1F3D\"/><circle cx=\"60\" cy=\"113\" r=\"7.5\" fill=\"#FFE27A\" stroke=\"#B45309\" stroke-width=\"1.8\"/><path d=\"M58 108.5 V117.5 M58 117.5 Q63.5 117.5 63.8 112.8 M55.8 112 L61.5 110.2 M55.8 114.6 L61.5 112.8\" fill=\"none\" stroke=\"#B45309\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>";
  // "Hareketi azalt" açıkken kullanıcı izin verirse Kese yine de hareket eder (yalnızca bu uygulamada)
  const motionOk = () => store.get('kese_motion', '') === '1';
  if (motionOk()) document.documentElement.classList.add('motion-ok');

  // ---------- Ses efektleri (WebAudio, küçük ve yumuşak) ----------
  let actx = null;
  const ac = () => { if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; actx = new A(); } if (actx.state === 'suspended') actx.resume(); return actx; };
  function tone(f, d, o) {
    o = o || {}; if (muted()) return; const c = ac(); if (!c) return;
    const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.05, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + d + 0.05);
  }
  const SFX = {
    boing: () => { tone(220, 0.25, { to: 660, type: 'triangle', vol: 0.06 }); tone(660, 0.18, { at: 0.2, to: 330, type: 'triangle', vol: 0.04 }); },
    pop: () => tone(520, 0.08, { to: 980, vol: 0.05 }),
    whoosh: () => { tone(300, 0.18, { to: 900, type: 'sawtooth', vol: 0.018 }); },
    back: () => { tone(900, 0.16, { to: 300, type: 'sawtooth', vol: 0.016 }); },
    sip: () => { tone(1200, 0.06, { to: 700, vol: 0.03 }); tone(1100, 0.06, { at: 0.12, to: 650, vol: 0.03 }); },
    giggle: () => [0, 0.09, 0.18, 0.27].forEach((a, i) => tone(880 + i * 90, 0.07, { at: a, type: 'square', vol: 0.02 })),
    snore: () => tone(110, 0.6, { to: 160, type: 'sawtooth', vol: 0.015 }),
    step: () => tone(180, 0.05, { type: 'triangle', vol: 0.011 }),
    ding: () => { tone(988, 0.12, { vol: 0.045 }); tone(1318, 0.2, { at: 0.1, vol: 0.04 }); },
  };
  const play = (n) => { try { SFX[n] && SFX[n](); } catch (e) { /* yok say */ } };

  // ---------- Kese'nin sesi ----------
  const voiceMode = () => store.get('kese_konus', 'mirilti') === '0' ? '0' : 'mirilti';
  let lastVoice = -Infinity;
  function speak(cue = 'merak') {
    const time = performance.now();
    if (muted() || voiceMode() === '0' || time - lastVoice < 2600 || document.hidden) return 0;
    lastVoice = time;
    const sounds = { neseli: [470, 690], uzgun: [370, 265], sasir: [410, 690], merak: [525, 570] };
    const [low, high] = sounds[cue] || sounds.merak;
    try {
      tone(low, .085, { to: low * 1.12, type: 'triangle', vol: .028 });
      tone(high, .13, { at: .105, to: high * (cue === 'uzgun' ? .82 : 1.1), type: 'triangle', vol: .023 });
    } catch (e) { return 0; }
    return 235;
  }
  function yuppi() {
    if (muted() || voiceMode() === '0' || document.hidden) return;
    try {
      const voice = window.speechSynthesis?.getVoices().find((v) => /^tr/i.test(v.lang));
      if (voice && voice.localService) {
        const u = new SpeechSynthesisUtterance('Yuppi!');
        u.voice = voice; u.lang = 'tr-TR'; u.pitch = 1.45; u.rate = 1.12; u.volume = .5;
        window.speechSynthesis.speak(u);
        return;
      }
    } catch (e) { /* Kısa neşe sesi kullanılır. */ }
    speak('neseli');
  }
  document.addEventListener('pointerdown', () => { if (!muted()) { try { ac(); } catch (e) { /* Ses kullanılamıyor. */ } } }, { once: true, passive: true });
  const VOICE_LBL = { mirilti: 'Kese mırıltısı', 0: 'Sessiz' };

  // ======================================================================
  // 1) Açılır "+" menüsü
  // ======================================================================
  let fabOpen = false;
  let menuPage = 'main';
  const menu = $('#fab'), menuButton = $('#fab-btn'), menuShade = $('#fab-bd');
  function showMenuPage(page, focusTarget) {
    menuPage = page;
    menu.querySelectorAll('[data-menu-page]').forEach((group) => { group.hidden = group.dataset.menuPage !== page; });
    menu.querySelector('[data-menu-back]').hidden = page === 'main';
    const first = focusTarget || menu.querySelector('[data-menu-page]:not([hidden]) button');
    first?.focus({ preventScroll: true });
    menu.scrollTop = 0;
  }
  function openFab() {
    fabOpen = true;
    menu.hidden = menuShade.hidden = false;
    menuShade.classList.add('open');
    $('#dock').classList.add('fab-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Menüyü kapat');
    showMenuPage('main');
    play('whoosh');
    pet.react('fab');
  }
  function closeFab(quiet) {
    if (!fabOpen) return;
    fabOpen = false;
    menu.hidden = menuShade.hidden = true;
    menuShade.classList.remove('open');
    $('#dock').classList.remove('fab-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menüyü aç');
    if (!quiet) play('back');
  }
  function goBack() {
    if (menuPage !== 'main') {
      const previous = menu.querySelector(`[data-menu-target="${menuPage}"]`);
      showMenuPage('main', previous);
    } else {
      closeFab();
      menuButton.focus();
    }
  }
  menuButton.addEventListener('click', () => { if (fabOpen) closeFab(); else openFab(); });
  menuShade.addEventListener('click', () => { closeFab(); menuButton.focus(); });
  menu.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.menuTarget) { showMenuPage(button.dataset.menuTarget); return; }
    if (button.hasAttribute('data-menu-back')) { goBack(); return; }
    closeFab(true);
    menuButton.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (event) => {
    if (!fabOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); goBack(); return; }
    if (event.key !== 'Tab') return;
    const choices = [...menu.querySelectorAll('button')].filter((button) => !button.closest('[hidden]'));
    const order = [...choices, menuButton];
    const current = order.indexOf(document.activeElement);
    event.preventDefault();
    order[(current + (event.shiftKey ? -1 : 1) + order.length) % order.length].focus();
  });

  // ======================================================================
  // 2) Kese arkadaş
  // ======================================================================
  const ACTS = {
    cay: { prop: '☕', cls: 'a-cay', sfx: 'sip', says: ['Çay molası ☕', 'Hmm, demli olmuş.'] },
    reels: { prop: '📱', cls: 'a-reels', sfx: 'giggle', says: ['Şu kediye bak! 😄', 'Bir video daha…'] },
    uyku: { prop: '💤', cls: 'a-uyku', sfx: 'snore', says: ['Zzz…', 'Biraz kestireyim.'] },
    otur: { prop: '', cls: 'a-otur', sfx: 'pop', says: ['Biraz oturayım.', 'Mola!'] },
    dans: { prop: '🎵', cls: 'a-dans', sfx: 'pop', says: ['Dans zamanı 🎶', 'Hop!'] },
    hesap: { prop: '🧮', cls: 'a-hesap', sfx: 'step', says: ['Bir, iki, üç…', 'Hesap zamanı.'] },
    selam: { prop: '', cls: 'a-selam', sfx: 'pop', says: [] },
    neseli: { prop: '', cls: 'a-neseli', sfx: 'ding', says: [] },
    uzgun: { prop: '', cls: 'a-uzgun', says: [] },
    sasir: { prop: '', cls: 'a-sasir', sfx: 'pop', says: [] },
    seksek: { prop: '', cls: 'a-seksek', says: [] },
  };
  function greet() {
    const h = new Date().getHours();
    return h < 6 ? 'İyi geceler 🌙' : h < 11 ? 'Günaydın! ☀️' : h < 17 ? 'Merhaba! Ben Kese.' : h < 22 ? 'İyi akşamlar!' : 'İyi geceler 😴';
  }
  function viewLine(view) {
    const a = app(), s = a && a.snapshot && a.snapshot(); if (!s) return null;
    const f = s.fmt || ((v) => String(v));
    if (s.bos) return 'Başlamak için aşağıdaki + düğmesine dokun, birlikte kuralım!';
    if (view === 'ozet') {
      if (s.gecikmis > 0.5) return `Gecikmiş ${f(s.gecikmis)} var, önce onu halledelim mi?`;
      if (s.gelirVar && s.kalan > 0) return `Bu ay ödemelerden sonra ${f(s.kalan)} kalıyor. Fena değil!`;
      if (s.gelirVar && s.kalan < 0) return `Bu ay ödemeler gelirini ${f(-s.kalan)} aşıyor, dikkatli olalım.`;
      return `Bu ay toplam ${f(s.odeme)} ödeme var.`;
    }
    if (view === 'borclar') {
      const hot = (s.kartlar || []).slice().sort((x, y) => y.oran - x.oran)[0];
      if (hot && hot.oran > 0.8) return `${hot.ad} kartının limiti %${Math.round(hot.oran * 100)} dolu, biraz yavaş 😅`;
      if (s.eksi) return 'Hesabın eksiye düşmüş; para girince önce artı parayı kapatalım.';
      if (s.limit > 0) return `Limitlerinin ${f(Math.max(0, s.limit - s.kullanilan))} kadarı boşta.`;
      return 'Kartların, hesapların, kredilerin hepsi burada.';
    }
    if (view === 'takvim') return s.bitecek ? `${s.bitecek.ay}'da "${s.bitecek.ad}" bitiyor, sabır! 🏁` : 'Her ay ne kadar ödediğini buradan izliyoruz.';
    if (view === 'dahafazla') return 'Araçlar burada. Tanıtımı tekrar izlemek istersen de buradan!';
    if (view === 'butce') return 'Maaşını ve faturalarını gir, kalan paranı ben hesaplarım.';
    return null;
  }

  const pet = (() => {
    let hiding = null, el = null, bubble = null, body = null, prop = null, x = 0, y = 0, timer = null, actT = null, sayT = null, dragging = false, moved = false, pinnedUntil = 0, curAct = null;
    const enabled = () => store.get('kese_pet', '1') !== '0';
    function build() {
      if (el) return;
      el = document.createElement('div'); el.id = 'kese-pet'; el.className = 'pet';
      el.innerHTML = `<div class="pet-bubble" role="status" aria-live="polite" hidden></div><button type="button" class="pet-body" aria-label="Kese ile konuş">${KESE_SVG}<span class="pet-prop" aria-hidden="true"></span><span class="pet-fx" aria-hidden="true"></span></button><button type="button" class="pet-play" hidden>Oyna</button><span class="pet-shadow" aria-hidden="true"></span>`;
      document.body.appendChild(el);
      bubble = $('.pet-bubble', el); body = $('.pet-body', el); prop = $('.pet-prop', el);
      x = innerWidth - 84; y = innerHeight - 190; place(true);
      el.addEventListener('pointerdown', onDown);
      body.addEventListener('click', (e) => { if (e.detail === 0) tap(); });
      $('.pet-play', el).onclick = () => {
        dismissPlay();
        window.openKeseGames({ mascot: KESE_SVG, play, restoreFocus: () => body.focus({ preventScroll: true }) });
      };
      document.addEventListener('focusin', syncQuiet);
      document.addEventListener('focusout', () => queueMicrotask(syncQuiet));
      document.addEventListener('visibilitychange', syncQuiet);
      new MutationObserver(syncQuiet).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
      document.addEventListener('pointerdown', e => { if (!el.contains(e.target)) dismissPlay(); }, true);
      el.addEventListener('keydown', e => { if (e.key === 'Escape') { dismissPlay(); body.focus(); } });
      syncQuiet();
    }
    function dismissPlay() {
      const playButton = el && $('.pet-play', el);
      if (playButton) playButton.hidden = true;
    }
    function formActive() {
      return document.hidden || !!$('dialog[open]') || document.activeElement?.matches('input, select, textarea, [contenteditable="true"]');
    }
    function syncQuiet() {
      const quiet = formActive();
      el.classList.toggle('quiet', !!quiet);
      if (!quiet) return;
      if (hiding) endHide('lost');
      clearTimeout(actT); clearTimeout(walkT); clearInterval(stepT);
      el.classList.remove('walking', 'talking');
      if (curAct) body.classList.remove(ACTS[curAct].cls);
      curAct = null; prop.textContent = ''; bubble.hidden = true; dismissPlay();
      x = innerWidth - 84; y = innerHeight - 190; place(true);
    }
    function place(instant, keepFlip) {
      const W = innerWidth, H = innerHeight; x = Math.max(6, Math.min(W - 70, x)); y = Math.max(70, Math.min(H - 150, y));
      el.classList.toggle('instant', !!instant || reduce());
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      if (!keepFlip) el.classList.toggle('flip', x > W / 2);
    }
    let mouthT = null;
    function say(text, ms, voice) {
      if (!el || el.hidden || formActive() || !text || !$('.pet-play', el).hidden) return;
      bubble.textContent = text; bubble.hidden = false;
      const talkMs = voice ? speak(typeof voice === 'string' ? voice : 'merak') : 0;
      clearTimeout(mouthT);
      el.classList.toggle('talking', talkMs > 0);
      if (talkMs) mouthT = setTimeout(() => el?.classList.remove('talking'), talkMs);
      clearTimeout(sayT); sayT = setTimeout(() => { bubble.hidden = true; }, ms || Math.min(7000, 2200 + text.length * 45));
    }
    function act(name, quiet) {
      const a = ACTS[name]; if (!a || !el || el.hidden || formActive()) return;
      if (curAct) body.classList.remove(ACTS[curAct].cls);
      curAct = name; body.classList.add(a.cls); prop.textContent = a.prop; play(a.sfx);
      if (!quiet && a.says.length && Math.random() < 0.7) say(pick(a.says), null, Math.random() < 0.6);
      clearTimeout(actT); actT = setTimeout(() => {
        body.classList.remove(a.cls); prop.textContent = ''; curAct = null;
        if (name === 'uyku' && el && !hiding) { body.classList.remove('jump'); void body.offsetWidth; body.classList.add('jump'); say('Aaah, güzel uyudum! 🥱'); }
      }, name === 'uyku' ? 14000 : name === 'otur' ? 9000 : name === 'selam' || name === 'seksek' || name === 'sasir' ? 2200 : 6500);
    }
    // Ekrandaki öğelerin üst kenarına "oturur"
    function spots() {
      const sels = ['.page-head h1', '.homehead h1', '.mcard-home', '.sumcard', '.debt-card', '.mcal', '.panel', '.tool-card', '.welcome-mascot'];
      const out = [];
      sels.forEach((s) => document.querySelectorAll(s).forEach((n) => { const r = n.getBoundingClientRect(); if (r.width > 60 && r.top > 80 && r.top < innerHeight - 200) out.push({ x: Math.min(innerWidth - 74, r.right - 70 - Math.random() * Math.max(0, r.width - 120)), y: r.top - 60 }); }));
      out.push({ x: innerWidth - 84, y: innerHeight - 190 }, { x: 10, y: innerHeight - 190 });
      return out;
    }
    // Serbest nokta: ekranın boş bir yerine (üst çubuk ve alt menü hariç)
    function freeSpot() {
      const W = innerWidth, H = innerHeight;
      return { x: 8 + Math.random() * Math.max(10, W - 84), y: 90 + Math.random() * Math.max(10, H - 260) };
    }
    let walkT = null, stepT = null;
    function walkTo(p, cb) {
      if (busy()) return;
      if (Date.now() < pinnedUntil) { cb && cb(); return; }
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < 24) { cb && cb(); return; }
      const dur = reduce() ? 0 : Math.max(700, Math.min(3200, dist / 0.14)); // ~140 px/sn
      clearTimeout(walkT); clearInterval(stepT);
      el.style.transitionDuration = `${dur}ms`;
      el.classList.add('walking'); el.classList.toggle('flip', p.x > x ? false : true);
      if (dur) stepT = setInterval(() => play('step'), 300);
      x = p.x; y = p.y; place(false, true);
      walkT = setTimeout(() => { clearInterval(stepT); if (!el) return; el.classList.remove('walking'); el.style.transitionDuration = ''; el.classList.toggle('flip', x > innerWidth / 2); cb && cb(); }, dur);
    }
    function busy() { return !!hiding || !el || el.hidden || document.hidden || dragging || fabOpen || formActive() || !$('.pet-play', el).hidden || $('#pet-ask') || document.body.classList.contains('tour-on'); }
    function edgeWalk() {
      const edges = Array.from(document.querySelectorAll('#dock, .welcome-actions .btn, .sumcard, .panel, .tool-card'))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width >= 85 && r.top >= 135 && r.top < innerHeight - 86 && r.right > 78);
      if (!edges.length) { walkTo(pick(spots())); return; }
      const r = pick(edges);
      const edgeY = r.top - 65;
      const left = Math.max(6, r.left - 5);
      const right = Math.min(innerWidth - 70, r.right - 65);
      walkTo({ x: left, y: edgeY }, () => { if (!busy()) walkTo({ x: right, y: edgeY }); });
    }
    function wander() {
      if (busy() || reduce() || curAct || el.classList.contains('walking')) return;
      const r = Math.random();
      if (r < 0.49) edgeWalk();
      else if (r < 0.68) {
        walkTo(freeSpot(), () => {
          if (busy()) return;
          act('seksek', true);
          [320, 710, 1150].forEach((ms) => setTimeout(() => { if (el && !el.hidden && curAct === 'seksek') play('step'); }, ms));
        });
      } else act(pick(['cay', 'uyku', 'otur', 'otur', 'dans', 'hesap']));
    }
    function loop() { clearTimeout(timer); timer = setTimeout(() => { wander(); loop(); }, reduce() ? 30000 : (curAct ? 6500 : 3500 + Math.random() * 4000)); }
    // ---------- Saklambaç: menülerin, düğmelerin, kartların arkasına saklanır ----------
    const HIDE_SELS = ['#fab-btn', '.dock .dock-items > *', '.tb-actions button', '.tb-actions a', '.mcard-home', '.sumcard', '.debt-card', '.tool-card', '.mcal', '.mc2', '.page-head h1', '.homehead h1'];
    function hideTargets() {
      const out = [];
      HIDE_SELS.forEach((sel) => document.querySelectorAll(sel).forEach((n) => {
        if (n.closest('#kese-pet, dialog, #fab')) return;
        const r = n.getBoundingClientRect();
        if (r.width >= 34 && r.height >= 28 && r.top > 64 && r.top < innerHeight - 40 && r.left > -10 && r.right < innerWidth + 10) out.push(n);
      }));
      return out;
    }
    function hidePlace() {
      if (!hiding || !el) return;
      const r = hiding.target.getBoundingClientRect();
      if (r.bottom < 40 || r.top > innerHeight - 20 || !hiding.target.isConnected) { endHide('lost'); return; }
      const H = el.offsetHeight || 72, peekLine = r.top;
      x = Math.max(-8, Math.min(innerWidth - 56, r.left + hiding.fx * Math.max(0, r.width - 56)));
      y = peekLine - 10; // gövdenin yalnızca fiyonk ucu çizginin üstünde
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      el.style.clipPath = `inset(-60px -40px ${Math.max(0, H - 10)}px -40px)`; // çizginin altını gizle
      el.style.webkitClipPath = el.style.clipPath;
    }
    let hideScroll = null;
    function hideSeek() {
      if (!el || hiding || busy()) return;
      clearTimeout(walkT); clearInterval(stepT); el.classList.remove('walking'); el.style.transitionDuration = '';
      const ts = hideTargets(); if (!ts.length) return;
      const target = pick(ts);
      if (curAct) { body.classList.remove(ACTS[curAct].cls); prop.textContent = ''; curAct = null; }
      say(pick(['Saklanıyorum! 🙈', 'Ebe sensin!']), 2600, true);
      play('giggle');
      hiding = { target, fx: Math.random(), found: false, t0: Date.now() };
      setTimeout(() => {
        if (!hiding || !el) return;
        bubble.hidden = true; el.classList.add('instant', 'hiding', 'vanish');
        setTimeout(() => {
          if (!hiding || !el) return;
          hidePlace(); el.classList.remove('vanish'); play('whoosh');
          hideScroll = () => requestAnimationFrame(hidePlace);
          window.addEventListener('scroll', hideScroll, { passive: true, capture: true }); window.addEventListener('resize', hideScroll);
          peekLoop();
        }, 380);
      }, 2400);
      hiding.timeout = setTimeout(() => endHide('timeout'), 30000);
    }
    function peekLoop() {
      if (!hiding || !el) return;
      clearTimeout(hiding.peekT);
      hiding.peekT = setTimeout(() => {
        if (!hiding || !el) return;
        el.classList.add('peek'); if (Math.random() < 0.5) play('giggle');
        setTimeout(() => { el && el.classList.remove('peek'); peekLoop(); }, 1300 + Math.random() * 700);
      }, 1800 + Math.random() * 2600);
    }
    function endHide(why) {
      if (!hiding) return; const h = hiding; hiding = null;
      clearTimeout(h.timeout); clearTimeout(h.peekT);
      if (hideScroll) { window.removeEventListener('scroll', hideScroll, { capture: true }); window.removeEventListener('resize', hideScroll); hideScroll = null; }
      if (!el) return;
      el.classList.remove('hiding', 'peek', 'vanish'); el.style.clipPath = ''; el.style.webkitClipPath = '';
      const r = h.target.isConnected ? h.target.getBoundingClientRect() : null;
      if (r && why !== 'lost') { y = r.top - (el.offsetHeight || 72) - 4; }
      place(true);
      body.classList.remove('jump'); void body.offsetWidth; body.classList.add('jump');
      if (why === 'found') {
        play('ding'); const sn = Math.round((Date.now() - h.t0) / 1000);
        say(pick([`Buldun! 🎉 ${sn} saniyede yakaladın!`, 'Eyvah, yakalandım! 😆', 'Hihi, buldun beni!']), 3500, true);
        act('dans', true);
      } else if (why === 'timeout') { play('boing'); say(pick(['Ce-eee! Buradaydım! 😜', 'Bulamadın, ben kazandım! 🏆', 'Sobe! Buradaydım işte 😄']), 3500, true); }
      loop();
    }
    function tap() {
      clearTimeout(walkT); clearInterval(stepT); el.classList.remove('walking'); el.style.transitionDuration = '';
      if (hiding) { endHide('found'); return; }
      if (formActive()) return;
      act('sasir', true); speak('sasir');
      bubble.hidden = true;
      const playButton = $('.pet-play', el);
      playButton.hidden = false; playButton.focus({ preventScroll: true });
    }
    // Sürükle-bırak; kısa dokunuş = konuş
    let sx = 0, sy = 0, ox = 0, oy = 0;
    function onDown(e) {
      if (!body.contains(e.target) || !e.isPrimary || e.button !== 0) return;
      if (hiding) { e.preventDefault(); endHide('found'); return; }
      dragging = true; moved = false; clearTimeout(walkT); clearInterval(stepT); el.classList.remove('walking'); el.style.transitionDuration = ''; sx = e.clientX; sy = e.clientY; ox = x; oy = y; el.setPointerCapture && el.setPointerCapture(e.pointerId);
      el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp, { once: true }); el.addEventListener('pointercancel', onUp, { once: true });
    }
    function onMove(e) {
      const dx = e.clientX - sx, dy = e.clientY - sy; if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true; el.classList.add('held'); x = ox + dx; y = oy + dy; place(true);
    }
    function onUp(e) {
      el.removeEventListener('pointercancel', onUp); el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointermove', onMove); dragging = false; el.classList.remove('held');
      if (e.type === 'pointercancel') return;
      if (moved) { dismissPlay(); pinnedUntil = Date.now() + 8000; loop(); play('pop'); say(pick(['Burası güzelmiş.', 'Tamam, buradayım!', 'Wiii! 🎢']), null, true); }
      else tap();
    }
    return {
      start() {
        if (!enabled()) return; build(); el.hidden = false;
        setTimeout(() => { if (busy()) return; act('selam', true); say(greet(), 4500, true); maybeAskMotion(); }, 900);
        loop();
      },
      stop() { if (hiding) endHide('lost'); if (el) { el.hidden = true; dismissPlay(); } clearTimeout(timer); clearInterval(stepT); clearTimeout(walkT); },
      toggle() { const on = !enabled(); store.set('kese_pet', on ? '1' : '0'); if (on) this.start(); else this.stop(); return on; },
      get on() { return enabled(); },
      onView(view) {
        if (!el || el.hidden) return;
        if (hiding) { endHide('lost'); }
        const line = viewLine(view);
        setTimeout(() => walkTo(pick(spots()), () => { if (!line) return;
          if (app()?.snapshot?.()?.gecikmis > 0.5) { act('uzgun', true); say(line, null, 'uzgun'); }
          else if (Math.random() < 0.5) say(line); }), 350);
      },
      react(kind) {
        if (!el || el.hidden) return;
        if (kind === 'fab') { say(pick(['Ne ekliyoruz? 👀', 'Buradayım!', 'Hadi bakalım!']), 2400, true); play('pop'); }
      },
      hideSeek() { hideSeek(); },
      hideForTour(on) { if (el) el.classList.toggle('away', !!on); },
      cheer() { if (!el || el.hidden || formActive()) return; act('neseli', true); say('Yuppi!', 1900); yuppi(); },
    };
  })();
  window.KesePet = pet;

  // Sayfa değişince Kese de yanına gelir
  document.addEventListener('kese:render', (e) => {
    const v = e.detail && e.detail.view; if (fabOpen) closeFab(true);
    const tg = document.querySelector('[data-act="pet-toggle"] b'); if (tg) tg.textContent = pet.on ? 'Kese arkadaşın: Açık' : 'Kese arkadaşın: Kapalı';
    if (e.detail?.paymentCompleted) { pet._last = v; pet.cheer(); }
    else if (pet._last !== v) { pet._last = v; pet.onView(v); }
  });
  // Tanıtımda Kese konuşur, efekt çalar
  document.addEventListener('kese:tour', (e) => {
    const d = e.detail || {};
    if (d.end) { pet.hideForTour(false); try { speechSynthesis.cancel(); } catch (x) { /* yok say */ } play('ding'); return; }
    pet.hideForTour(true); play(d.i === 0 ? 'ding' : 'boing'); setTimeout(() => speak('merak'), 180);
    const tm = document.querySelector('.tour-mascot'); if (tm) { tm.classList.add('talking'); clearTimeout(tm._t); tm._t = setTimeout(() => tm.classList.remove('talking'), 235); }
  });
  // Araçlar'daki aç/kapat
  document.addEventListener('click', (e) => {
    if (e.target.closest?.('[data-act="pet-games"]')) {
      const opener = e.target.closest('button');
      window.openKeseGames({ mascot: KESE_SVG, play, restoreFocus: () => (opener.closest('#fab') ? menuButton : opener).focus() });
      return;
    }
    if (e.target.closest?.('[data-act="pet-hide"]')) { if (pet.on) pet.hideSeek(); return; }
    const t = e.target.closest && e.target.closest('[data-act="pet-toggle"]'); if (!t) return;
    const on = pet.toggle(); const b = t.querySelector('b'); if (b) b.textContent = on ? 'Kese arkadaşın: Açık' : 'Kese arkadaşın: Kapalı';
  });
  // İlk açılış: telefonda "Hareketi azalt" açıksa Kese, uygulama içinde hareket etmek için izin ister
  function maybeAskMotion() {
    if (!sysReduce() || store.get('kese_motion', '') !== '' || $('#pet-ask')) return;
    const box = document.createElement('div'); box.id = 'pet-ask'; box.className = 'pet-ask'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Kese hareket izni');
    box.innerHTML = `<div class="pa-face">${KESE_SVG}</div><p><b>Telefonunda "Hareketi azalt" açık</b>, o yüzden yerimde duruyorum. Uygulamada özgürce gezip oynayabilmem için hareketleri açayım mı?</p>
      <small>Telefonun genel ayarı değişmez; sadece Kese ve menü animasyonları açılır. Telefon ayarı: Ayarlar › Erişilebilirlik › Hareket › Hareketi Azalt.</small>
      <div class="pa-btns"><button type="button" class="btn ghost sm" data-pa="0">Böyle kalsın</button><button type="button" class="btn primary sm" data-pa="1">Evet, hareket et!</button></div>`;
    document.body.appendChild(box); play('ding'); speak('Hareketleri açayım mı?');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pa]'); if (!b) return;
      const yes = b.dataset.pa === '1'; store.set('kese_motion', yes ? '1' : '0');
      document.documentElement.classList.toggle('motion-ok', yes); box.remove();
      if (yes) { play('boing'); pet.cheer(); }
    });
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-act="pet-voice"]'); if (!t) return;
    const order = ['mirilti', '0'], cur = voiceMode(), nx = order[(order.indexOf(cur) + 1) % order.length];
    store.set('kese_konus', nx); const b = t.querySelector('b'); if (b) b.textContent = `Kese'nin sesi: ${VOICE_LBL[nx]}`;
    if (nx !== '0') speak('merak');
  });
  window.KeseVoiceLabel = () => `Kese'nin sesi: ${VOICE_LBL[voiceMode()]}`;
  const boot = () => { pet.start(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
