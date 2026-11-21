/* Kese · Dopamin, Kutlama, Ses ve Özgürlük HUD Motoru.
 * Saf hesaplar (kapanma yüzdesi, eşikler, ay ilerlemesi, seri, seviye, eşik farkı)
 * + WebAudio sentezleyici + combo/konfeti/jeton/uçan delta + zafer penceresi + Gamified HUD.
 * Kurallar: yeşil renk yok, sabit hex yok (yalnız CSS belirteçleri), reduced-motion tam uyumlu. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseLive = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MILESTONES = [25, 50, 75, 100];
  const RANKS = [
    { min: 0, icon: '🚀', label: 'Başlangıç', tier: 1 },
    { min: 10, icon: '⚡', label: 'Hız Kazanan', tier: 2 },
    { min: 25, icon: '🔥', label: 'Ritmi Yakaladı', tier: 3 },
    { min: 50, icon: '💎', label: 'Yarı Yolu Geçti', tier: 4 },
    { min: 75, icon: '🏆', label: 'Son Düzlük', tier: 5 },
    { min: 100, icon: '👑', label: 'Borçsuz Özgürlük', tier: 6 },
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const ymOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const ymPrev = (ym) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 2, 1); return ymOf(d); };
  const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  /** Tüm kalemlerin taksitleri (KMH/kart hareketleri + krediler). */
  function allInstallments(db) {
    const out = [];
    const push = (item) => (item && item.taksitler || []).forEach((t) => out.push(t));
    ((db && db.kmh_hesaplar) || []).forEach((h) => (h.hareketler || []).forEach(push));
    ((db && db.kredi_kartlari) || []).forEach((k) => (k.hareketler || []).forEach(push));
    ((db && db.krediler) || []).forEach(push);
    return out;
  }
  /** Sigortanın üstlendiği taksitler bizim ödememiz gerekenler arasında sayılmaz. */
  const ours = (t) => !t.sigortaOder && !t.sigortaGecmis;

  /** Borcun ne kadarı kapandı: ödenen taksit tutarı / tüm taksit tutarı. Yüzde aşağı yuvarlanır (yalnız gerçekten bitince 100). */
  function closedPercent(db) {
    const ts = allInstallments(db).filter(ours);
    let total = 0, paid = 0;
    ts.forEach((t) => { const v = Number(t.tutar) || 0; total += v; if (t.odendi) paid += v; });
    total = r2(total); paid = r2(paid);
    if (total <= 0) return { paid, total, pct: 0, has: false };
    const done = ts.every((t) => t.odendi);
    return { paid, total, pct: done ? 100 : Math.min(99, Math.floor(paid / total * 100)), has: true };
  }
  /** Sıradaki hedef rozeti: pct'den büyük ilk eşik; hepsi geçildiyse null. */
  function nextMilestone(pct) { return MILESTONES.find((m) => m > pct) || null; }
  /** prev -> cur arasında geçilen en yüksek eşik (yoksa null). */
  function crossedMilestone(prevPct, curPct) {
    const hit = MILESTONES.filter((m) => prevPct < m && curPct >= m);
    return hit.length ? hit[hit.length - 1] : null;
  }

  /** Yüzdeye göre özgürlük seviyesi rozeti. */
  function rankForPct(pct) {
    const p = Math.max(0, Math.min(100, Math.floor(Number(pct) || 0)));
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (p >= RANKS[i].min) return Object.assign({}, RANKS[i]);
    }
    return Object.assign({}, RANKS[0]);
  }

  /** Sıradaki hedef eşiğine ulaşmak için kalan tutar: { milestone, amount, target } | null. */
  function milestoneGap(input) {
    if (!input) return null;
    const cp = (typeof input.pct === 'number' && typeof input.total === 'number') ? input : closedPercent(input);
    if (!cp || !cp.has || !(cp.total > 0)) return null;
    const nm = nextMilestone(cp.pct);
    if (!nm) return null;
    const target = r2(cp.total * nm / 100);
    const amount = nm === 100 ? r2(Math.max(0, cp.total - cp.paid)) : r2(Math.max(0, target - cp.paid));
    return { milestone: nm, amount, target };
  }

  /** Bir ayın bizim ödememiz gereken taksitleri: { done, total }. */
  function monthCounts(ts, ym) {
    const m = ts.filter((t) => ours(t) && t.ym === ym);
    return { done: m.filter((t) => t.odendi).length, total: m.length };
  }
  /** Bu ay: N / M ödeme; geçmişten ödenmemiş taksit varsa ay "tamam" sayılmaz. */
  function monthProgress(db, now) {
    const ym = ymOf(now), ts = allInstallments(db);
    const c = monthCounts(ts, ym);
    const overdue = ts.filter((t) => ours(t) && !t.odendi && t.ym < ym).length;
    return { ym, done: c.done, total: c.total, overdue, complete: c.total > 0 && c.done === c.total && overdue === 0 };
  }
  /** Ardışık ay serisi: ayın tüm taksitleri ödenmişse sayılır. Taksiti olmayan ay seriyi bitirir (veri yok → iddia yok).
   *  Ödeme tarihi tutulmadığı için "zamanında" değil, "hepsi ödendi" denir. */
  function paidStreak(db, now) {
    const ym = ymOf(now), ts = allInstallments(db);
    let cur = ym, n = 0;
    const here = monthCounts(ts, ym);
    if (!(here.total > 0 && here.done === here.total)) cur = ymPrev(ym);
    for (let i = 0; i < 120; i++) {
      const c = monthCounts(ts, cur);
      if (c.total > 0 && c.done === c.total) { n++; cur = ymPrev(cur); } else break;
    }
    return n;
  }

  /** Borç kalemlerinin açık/kapalı özet haritası (kapanan borç tespiti için). */
  function debtClosureMap(db) {
    const map = {};
    const add = (key, name, ts) => {
      const list = (ts || []).filter(ours);
      if (!list.length) return;
      const open = list.filter((t) => !t.odendi);
      const last = list[list.length - 1];
      const monthly = r2(Number(last && last.tutar) || 0);
      map[key] = { name, closed: open.length === 0, openCount: open.length, monthly };
    };
    ((db && db.kmh_hesaplar) || []).forEach((h) => {
      (h.hareketler || []).forEach((x) => {
        const lbl = [h.banka, x.aciklama || h.hesap_adi].filter(Boolean).join(' · ') || 'KMH borcu';
        add(`KMH:${h.id}:${x.id}`, lbl, x.taksitler);
      });
    });
    ((db && db.kredi_kartlari) || []).forEach((k) => {
      (k.hareketler || []).forEach((x) => {
        const lbl = [k.banka, x.aciklama || k.kart_adi].filter(Boolean).join(' · ') || 'Kart borcu';
        add(`KART:${k.id}:${x.id}`, lbl, x.taksitler);
      });
    });
    ((db && db.krediler) || []).forEach((kr) => {
      const lbl = [kr.banka, kr.kredi_adi || kr.kredi_turu].filter(Boolean).join(' · ') || 'Kredi';
      add(`KREDI:${kr.id}`, lbl, kr.taksitler);
    });
    ((db && db.sabit_giderler) || []).forEach((g) => {
      if (g && g.kategori === 'Elden borç' && g.kalan != null && g.kalan !== '') {
        const rem = Number(g.kalan) || 0;
        map[`ELDEN:${g.id}`] = { name: g.ad || 'Elden borç', closed: rem <= 0.005, openCount: rem > 0.005 ? 1 : 0, monthly: r2(Number(g.tutar) || 0) };
      }
    });
    return map;
  }

  /** Önceki haritada açık olup şimdi tamamen kapanan ilk borcu bulur. */
  function findNewlyClosed(prevMap, curMap) {
    if (!prevMap || !curMap) return null;
    const keys = Object.keys(curMap);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], prev = prevMap[k], cur = curMap[k];
      if (prev && !prev.closed && cur && cur.closed) {
        return { name: cur.name, monthlySaved: cur.monthly };
      }
    }
    return null;
  }

  const noopSfx = { play: () => {}, isOn: () => true, setOn: () => {}, toggle: () => true };
  const api = {
    MILESTONES,
    RANKS,
    closedPercent,
    nextMilestone,
    crossedMilestone,
    monthProgress,
    paidStreak,
    rankForPct,
    milestoneGap,
    sfx: noopSfx,
    celebrate: () => {},
    burst: () => {},
    floatDelta: () => {},
    showVictory: () => {},
    afterRender: () => {},
  };
  if (typeof document === 'undefined') return api;

  /* ---------------- Tarayıcı / DOM katmanı ---------------- */
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: no-preference)') : null;
  const motion = () => !!(mq && mq.matches);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (window.KeseCalc && window.KeseCalc.fmtMoney ? window.KeseCalc.fmtMoney(n) : String(n));
  const fmtCompact = (n) => {
    const v = Number(n) || 0;
    const frac = Math.abs(v - Math.round(v)) < 0.005 ? 0 : 2;
    return '₺' + v.toLocaleString('tr-TR', { minimumFractionDigits: frac, maximumFractionDigits: frac });
  };

  const LS_MONTH = 'kese_ay_kutlama';
  const LS_SOUND = 'kese_ses';
  const COMBO_MS = 8000;
  const PARTICLE_VARS = ['var(--accent)', 'var(--gold)', 'var(--ok)', 'var(--accent-soft)', 'var(--panel)'];

  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* depolama yoksa yok say */ } };

  const state = {
    debt: null,
    next: null,
    pct: null,
    prevPct: null,
    prevPaid: null,
    prevClosed: null,
    view: null,
    combo: 0,
    lastPayAt: 0,
    lastCelebrateAt: 0,
    lastTap: null,
  };

  // Son tıklanan / dokunulan koordinatı sessizce izle (butondan konfeti patlatmak için)
  document.addEventListener('pointerdown', (e) => {
    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
      state.lastTap = { x: e.clientX, y: e.clientY, at: Date.now() };
    }
  }, { capture: true, passive: true });

  /* ---------------- WebAudio Dopamin Ses Sentezleyici ---------------- */
  const sfx = (() => {
    let ctx = null;
    let enabled = lsGet(LS_SOUND) !== '0';

    const readPref = () => {
      const v = lsGet(LS_SOUND);
      if (v === '0') enabled = false;
      else if (v === '1') enabled = true;
      return enabled;
    };

    const getCtx = () => {
      try {
        if (!ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          ctx = new AC();
        }
        if (ctx.state === 'suspended') {
          const p = ctx.resume();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        return ctx;
      } catch (e) {
        return null;
      }
    };

    // Kullanıcı etkileşiminde AudioContext kilitliyse aç
    const unlock = () => { if (ctx && ctx.state === 'suspended') { try { ctx.resume().catch(() => {}); } catch (e) {} } };
    document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    document.addEventListener('keydown', unlock, { capture: true, passive: true });

    const note = (c, freq, dur, opts) => {
      const o = opts || {};
      const t = c.currentTime + (o.at || 0);
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      const peak = o.vol || 0.08;
      const atk = o.atk || 0.01;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + atk);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    };

    const voices = {
      pay(c, combo) {
        const step = Math.min(12, Math.max(0, (Number(combo) || 1) - 1) * 2);
        const mul = Math.pow(2, step / 12);
        // 1. parlak jeton tınısı + üst armonik shimmer
        note(c, 587.33 * mul, 0.11, { type: 'triangle', vol: 0.085, at: 0 });
        note(c, 1174.66 * mul, 0.10, { type: 'sine', vol: 0.035, at: 0.005 });
        // 2. kasa çınlaması + ışıltılı kuyruk
        note(c, 880.00 * mul, 0.24, { type: 'triangle', vol: 0.095, at: 0.075 });
        note(c, 1760.00 * mul, 0.22, { type: 'sine', vol: 0.04, at: 0.08 });
        // Seri 3 ve üstünde ekstra arcade ışıltı notası
        if ((Number(combo) || 1) >= 3) {
          note(c, 1174.66 * mul, 0.22, { type: 'sine', vol: 0.065, at: 0.145 });
          note(c, 2349.32 * mul, 0.18, { type: 'sine', vol: 0.025, at: 0.155 });
        }
      },
      debtClosed(c) {
        // 4 notalı yükselen altın zafer arpeji (C5 - E5 - G5 - C6)
        const arp = [523.25, 659.25, 783.99, 1046.50];
        arp.forEach((f, i) => {
          note(c, f, 0.16, { type: 'triangle', vol: 0.085, at: i * 0.08 });
          note(c, f * 2, 0.13, { type: 'sine', vol: 0.03, at: i * 0.08 + 0.008 });
        });
        // Parlak final akoru
        const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chord.forEach((f, i) => {
          note(c, f, 0.56, { type: i < 2 ? 'triangle' : 'sine', vol: i < 3 ? 0.055 : 0.04, at: 0.32 });
        });
      },
      milestone(c) {
        // 3 notalı ışıltılı eşik fanfarı (G5 - B5 - D6 + G6 shimmer)
        note(c, 783.99, 0.13, { type: 'triangle', vol: 0.08, at: 0 });
        note(c, 987.77, 0.14, { type: 'triangle', vol: 0.085, at: 0.095 });
        note(c, 1174.66, 0.36, { type: 'triangle', vol: 0.095, at: 0.19 });
        note(c, 1567.98, 0.34, { type: 'sine', vol: 0.045, at: 0.20 });
      },
      add(c) {
        note(c, 440, 0.09, { type: 'sine', to: 680, vol: 0.075, at: 0 });
        note(c, 880, 0.10, { type: 'sine', vol: 0.045, at: 0.055 });
      },
      undo(c) {
        note(c, 520, 0.16, { type: 'sine', to: 310, vol: 0.065, at: 0 });
      },
      tap(c) {
        note(c, 740, 0.038, { type: 'triangle', to: 480, vol: 0.038, at: 0 });
      },
      err(c) {
        note(c, 260, 0.15, { type: 'triangle', to: 195, vol: 0.06, at: 0 });
        note(c, 200, 0.16, { type: 'triangle', to: 160, vol: 0.045, at: 0.08 });
      },
    };

    const alias = { ok: 'pay', click: 'tap', open: 'add', close: 'undo' };

    return {
      play(name, arg) {
        if (!readPref()) return;
        const key = voices[name] ? name : alias[name];
        if (!key) return;
        const c = getCtx();
        if (!c) return;
        try { voices[key](c, arg); } catch (e) { /* ses çalınamazsa sessiz geç */ }
      },
      isOn() { return readPref(); },
      setOn(v) {
        enabled = !!v;
        lsSet(LS_SOUND, enabled ? '1' : '0');
        return enabled;
      },
      toggle() {
        const next = !readPref();
        enabled = next;
        lsSet(LS_SOUND, next ? '1' : '0');
        if (next) this.play('add');
        return next;
      },
    };
  })();
  api.sfx = sfx;

  /* ---------------- Titreşim (yalnız hareket serbestse) ---------------- */
  const buzz = (pattern) => {
    if (!motion()) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* desteklenmiyor */ }
  };

  /* ---------------- Slot-Odometer Sayı Sayacı ---------------- */
  function countTo(el, from, to, pop) {
    if (!el) return;
    cancelAnimationFrame(el._raf);
    el.textContent = fmt(to);
    if (!motion()) return;
    if (pop) {
      el.classList.remove('is-pop');
      void el.offsetWidth;
      el.classList.add('is-pop');
      clearTimeout(el._popT);
      el._popT = setTimeout(() => el.classList.remove('is-pop'), 600);
    }
    if (from == null || from === to) return;
    const t0 = performance.now(), dur = 680;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(k >= 1 ? to : from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ---------------- Koordinat çözümleyici ---------------- */
  function resolveOrigin(ev) {
    if (ev && typeof ev.x === 'number' && typeof ev.y === 'number') return { x: ev.x, y: ev.y };
    if (ev && typeof ev.clientX === 'number' && typeof ev.clientY === 'number') return { x: ev.clientX, y: ev.clientY };
    if (state.lastTap && Date.now() - state.lastTap.at <= 1600) return { x: state.lastTap.x, y: state.lastTap.y };
    const ae = document.activeElement;
    if (ae && ae !== document.body && typeof ae.getBoundingClientRect === 'function') {
      const r = ae.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    }
    return { x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight * 0.34) };
  }

  /* ---------------- Konfeti + Altın Jeton Patlaması ---------------- */
  function burst(x, y, big) {
    if (!motion()) return;
    const wrap = document.createElement('div');
    wrap.className = 'live-confetti';
    wrap.setAttribute('aria-hidden', 'true');
    const ox = typeof x === 'number' ? x : Math.round(window.innerWidth / 2);
    const oy = typeof y === 'number' ? y : Math.round(window.innerHeight * 0.34);
    wrap.style.left = Math.max(16, Math.min(window.innerWidth - 16, ox)) + 'px';
    wrap.style.top = Math.max(16, Math.min(window.innerHeight - 16, oy)) + 'px';

    const total = big ? 66 : 40;
    for (let i = 0; i < total; i++) {
      const s = document.createElement('i');
      const isCoin = i % 4 === 0;
      const clsIdx = (i % 5) + 1;
      s.className = isCoin ? 'live-coin c2' : `c${clsIdx}`;
      if (isCoin) s.textContent = '₺';

      const angle = (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const spread = (big ? 115 : 82) + Math.random() * (big ? 195 : 135);
      const lift = big ? 95 : 70;
      s.style.setProperty('--dx', Math.round(Math.cos(angle) * spread) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(angle) * spread - lift) + 'px');
      s.style.setProperty('--rot', Math.round(Math.random() * 640 - 320) + 'deg');
      s.style.animationDelay = Math.round(Math.random() * 110) + 'ms';
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 1850);
  }
  api.burst = burst;

  /* ---------------- Uçan Delta Rozeti ---------------- */
  function floatDelta(x, y, amount, combo) {
    if (!motion()) return;
    const amt = Number(amount) || 0;
    const c = Number(combo) || 1;
    let label = '';
    if (c >= 2 && amt > 0) label = `⚡ ${c}x SERİ! -${fmtCompact(amt)}`;
    else if (c >= 2) label = `⚡ ${c}x SERİ!`;
    else if (amt > 0) label = `-${fmtCompact(amt)}`;
    else label = 'Ödendi!';

    const el = document.createElement('div');
    el.className = 'live-float-delta' + (c >= 2 ? ' is-gold' : '');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = label;
    const ox = typeof x === 'number' ? x : Math.round(window.innerWidth / 2);
    const oy = typeof y === 'number' ? y : Math.round(window.innerHeight * 0.34);
    const padX = Math.min(92, Math.round(window.innerWidth * 0.24));
    el.style.left = Math.max(padX, Math.min(window.innerWidth - padX, ox)) + 'px';
    el.style.top = Math.max(72, Math.min(window.innerHeight - 96, oy - 14)) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1450);

    if (c >= 2) {
      document.querySelectorAll('.live-combo').forEach((old) => old.remove());
      const badge = document.createElement('div');
      badge.className = 'live-combo';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = c >= 3 ? `🔥 ${c}x SÜPER SERİ!` : `⚡ ${c}x SERİ!`;
      document.body.appendChild(badge);
      setTimeout(() => badge.remove(), 1850);
    }
  }
  api.floatDelta = floatDelta;

  /* ---------------- Zafer Kutlama Overlay'i ---------------- */
  let activeVictory = null;
  function showVictory(opts) {
    if (!opts) return;
    if (activeVictory) activeVictory();

    const prevFocus = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'live-victory';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'live-victory-title');

    const statsArr = Array.isArray(opts.stats) ? opts.stats.filter(Boolean) : (opts.stats ? [opts.stats] : []);
    const statsHtml = statsArr.length
      ? `<div class="live-victory-stats">${statsArr.map((s) => `<p class="live-victory-stat">${esc(s)}</p>`).join('')}</div>`
      : '';
    const raysHtml = motion() ? '<div class="live-victory-rays" aria-hidden="true"></div>' : '';
    const badgeHtml = opts.badge ? `<span class="live-victory-badge">${esc(opts.badge)}</span>` : '';

    wrap.innerHTML = `${raysHtml}<div class="live-victory-card">
      <img class="live-victory-mascot" src="icons/mascot-400.png" alt="" width="116" height="106" decoding="async">
      ${badgeHtml}
      <h2 id="live-victory-title" class="live-victory-title">${esc(opts.title || 'Harika gidiyorsun!')}</h2>
      ${opts.subtitle ? `<p class="live-victory-sub">${esc(opts.subtitle)}</p>` : ''}
      ${statsHtml}
      <button type="button" class="btn primary live-victory-ok">Harika!</button>
    </div>`;

    const close = () => {
      document.removeEventListener('keydown', onKey, true);
      wrap.remove();
      activeVictory = null;
      if (prevFocus && typeof prevFocus.focus === 'function' && document.contains(prevFocus)) {
        try { prevFocus.focus({ preventScroll: true }); } catch (e) {}
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        close();
      }
    };
    wrap.addEventListener('click', close);
    document.addEventListener('keydown', onKey, true);
    activeVictory = close;

    document.body.appendChild(wrap);
    const okBtn = wrap.querySelector('.live-victory-ok');
    if (okBtn) { try { okBtn.focus({ preventScroll: true }); } catch (e) {} }
  }
  api.showVictory = showVictory;

  /* ---------------- Oturum Combo & Tatmin Motoru ---------------- */
  function celebrate(opts) {
    const o = opts || {};
    const nowTs = Date.now();
    state.combo = (nowTs - state.lastPayAt <= COMBO_MS) ? state.combo + 1 : 1;
    state.lastPayAt = nowTs;
    state.lastCelebrateAt = nowTs;

    const pt = resolveOrigin(o.event);
    const hasClosed = !!o.debtClosed;
    const hasMilestone = !!o.milestone;
    const hasMonth = !!o.monthComplete;
    const big = !!(hasClosed || hasMilestone || hasMonth || state.combo >= 3);

    // Ses
    if (!o.silent) {
      if (o.sound) sfx.play(o.sound, state.combo);
      else if (hasClosed || o.milestone === 100) sfx.play('debtClosed');
      else if (hasMilestone || hasMonth) sfx.play('milestone');
      else sfx.play('pay', state.combo);
    }

    // Konfeti + altın jeton + uçan delta + titreşim (motion() kontrollü)
    burst(pt.x, pt.y, big);
    floatDelta(pt.x, pt.y, o.amount, state.combo);
    buzz(big ? [35, 45, 35, 45, 75] : [28, 36, 28]);

    // Zafer Kutlama Overlay'i
    if (o.title) {
      showVictory({ title: o.title, subtitle: o.subtitle, stats: o.stats, badge: o.badge });
    } else if (o.milestone === 100) {
      showVictory({
        badge: '👑 %100 BORÇSUZ ÖZGÜRLÜK',
        title: 'Tüm borçların kapandı!',
        subtitle: 'Büyük bir yük omuzlarından kalktı. Bu anı doyasıya kutla!',
        stats: o.stats || ['Artık her ayın tamamen senin!'],
      });
    } else if (hasClosed) {
      const dc = typeof o.debtClosed === 'object' ? o.debtClosed : {};
      const name = dc.name || 'Bir borcun';
      const saved = Number(dc.monthlySaved) || 0;
      const stats = [];
      if (saved > 0) stats.push(`Gelecek aydan itibaren +${fmtCompact(saved)}/ay nefes!`);
      if (o.stats) stats.push(...(Array.isArray(o.stats) ? o.stats : [o.stats]));
      showVictory({
        badge: '🏆 BORÇ KAPANDI',
        title: `${name} bitti!`,
        subtitle: 'Bir borcu daha tarihe gömdün, nefesin açılıyor.',
        stats: stats.length ? stats : ['Bir kalem daha kalıcı olarak kapandı!'],
      });
    } else if (hasMilestone) {
      const rank = rankForPct(o.milestone);
      showVictory({
        badge: `${rank.icon} %${o.milestone} EŞİĞİ GEÇİLDİ`,
        title: `${rank.label} seviyesindesin!`,
        subtitle: `Toplam borcunun %${o.milestone} kısmı artık geride kaldı.`,
        stats: o.stats || ['Aynı ritimle devam et, her ödeme seni özgürlüğe yaklaştırıyor.'],
      });
    } else if (hasMonth) {
      const mc = typeof o.monthComplete === 'object' ? o.monthComplete : {};
      const total = mc.total || 0;
      showVictory({
        badge: '🔥 AY TAMAMLANDI',
        title: 'Bu ayın tüm ödemeleri bitti!',
        subtitle: total > 0 ? `Bu ayki ${total} ödemenin tamamını kapattın.` : 'Bu ayki tüm ödemelerini kapattın.',
        stats: o.stats || ['Gelecek aya tertemiz ve kafan rahat giriyorsun!'],
      });
    }

    return { combo: state.combo };
  }
  api.celebrate = celebrate;

  /* ---------------- Bugün Ekranı Gamified Özgürlük HUD ---------------- */
  function ringHtml(pct, fromPct) {
    const R = 44, C = 2 * Math.PI * R, off = (p) => (C * (1 - p / 100)).toFixed(1);
    return `<svg class="live-ring" viewBox="0 0 108 108" role="img" aria-label="Borcunuzun %${pct} kapandı">
      <circle class="trk" cx="54" cy="54" r="${R}"/>
      <circle class="val" cx="54" cy="54" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off(fromPct)}" data-to="${off(pct)}" transform="rotate(-90 54 54)"/>
      <text x="54" y="60" text-anchor="middle">%${pct}</text></svg>`;
  }

  function nearestTargetHtml(db, now) {
    if (!window.KeseCalc || typeof window.KeseCalc.nextPayoffTarget !== 'function') return '';
    let tgt = null;
    try { tgt = window.KeseCalc.nextPayoffTarget(db, now); } catch (e) { return ''; }
    if (!tgt) return '';
    const count = tgt.kalanTaksit ?? tgt.kalan ?? tgt.remainingCount ?? tgt.taksit ?? tgt.count;
    if (!(count > 0)) return '';
    const rawName = tgt.ad || tgt.name || tgt.aciklama || tgt.title || '';
    const banka = tgt.banka && rawName.indexOf(tgt.banka) === -1 ? tgt.banka : '';
    const name = [banka, rawName].filter(Boolean).join(' · ') || 'Sıradaki borç';
    return `<p class="live-target">🎯 En yakın bitiş: <b>${esc(name)}</b> — son <b>${count}</b> taksit!</p>`;
  }

  function streakHtml(streak, mp) {
    if (streak >= 2) {
      return `<p class="live-streak is-hot">🔥 ${streak} ay üst üste tam ödeme!</p>`;
    }
    if (streak === 1) {
      return '<p class="live-streak">🔥 1 ay tamam — seriyi 2\'ye çıkar!</p>';
    }
    if (mp.total > 0) {
      const rem = Math.max(0, mp.total - mp.done);
      if (rem > 0) {
        return `<p class="live-streak is-spark">⚡ Bu ay ${rem} ödeme kaldı — serini başlat!</p>`;
      }
      if (mp.overdue > 0) {
        return `<p class="live-streak is-spark">⚡ Geciken ${mp.overdue} ödemeyi kapat — serini başlat!</p>`;
      }
    }
    return '';
  }

  function buildHud(db, now, ctx) {
    const cp = closedPercent(db);
    if (!cp.has) return { html: '', cp };
    const nm = nextMilestone(cp.pct);
    const gap = milestoneGap(cp);
    const rank = rankForPct(cp.pct);
    const mp = monthProgress(db, now);
    const streak = paidStreak(db, now);
    const from = state.pct == null || !motion() ? cp.pct : state.pct;

    const pips = MILESTONES.map((m) => `<li class="${cp.pct >= m ? 'on' : ''}${m === nm ? ' nxt' : ''}"><span>%${m}</span></li>`).join('');
    const segs = mp.total > 0 && mp.total <= 24
      ? Array.from({ length: mp.total }, (_, i) => `<i class="${i < mp.done ? 'on' : ''}" style="--i:${i}"></i>`).join('')
      : `<i class="on wide" style="width:${mp.total ? (mp.done / mp.total * 100).toFixed(1) : 0}%"></i>`;

    const gapText = gap
      ? `Sıradaki <b>%${gap.milestone}</b> hedefine <b>${esc(fmtCompact(gap.amount))}</b> kaldı`
      : '<b>Tüm borç kapandı!</b>';

    const cele = ctx.monthCelebrate
      ? `<div class="live-cele" role="status"><b>Bu ayın ödemeleri tamam.</b> ${mp.total} ödemenin hepsi kayıtlı.</div>`
      : '';
    const miles = ctx.milestone && ctx.milestone < 100
      ? `<p class="live-note" role="status">%${ctx.milestone} eşiğini geçtiniz!</p>`
      : ctx.milestone === 100
        ? '<p class="live-note" role="status">Borcunuzun tamamı kapandı!</p>'
        : '';

    const targetLine = nearestTargetHtml(db, now);
    const streakLine = streakHtml(streak, mp);

    return {
      cp,
      html: `<div class="live-block" data-live="1">${cele}
        <div class="live-ringrow live-hud-top">
          ${ringHtml(cp.pct, from)}
          <div class="live-ringinfo live-hud-meta">
            <span class="live-rank-badge" data-tier="${rank.tier}">${rank.icon} ${esc(rank.label)}</span>
            <p class="live-title">Borcunuzun %${cp.pct} kısmı kapandı</p>
            <p class="live-sub">${esc(fmt(cp.paid))} / ${esc(fmt(cp.total))}</p>
            <p class="live-sub live-gap live-milestone-gap">${gapText}</p>
          </div>
        </div>
        <ol class="live-pips" aria-label="Hedef rozetleri">${pips}</ol>${miles}
        ${mp.total > 0 ? `<div class="live-month"><p class="live-title">Bu ay ${mp.done} / ${mp.total} ödeme tamam</p><div class="live-segs" role="img" aria-label="Bu ay ${mp.total} ödemeden ${mp.done} tanesi tamam">${segs}</div></div>` : ''}
        ${streakLine}
        ${targetLine}
      </div>`,
    };
  }

  /* ---------------- app.js render() sonrası kanca ---------------- */
  api.afterRender = function (o) {
    try {
      const view = document.getElementById('view');
      if (!view || !o) return;

      const viewChanged = state.view !== o.view;
      state.view = o.view;

      // Tek birleşik kademeli giriş animasyonu (yalnız görünüm değişince & hareket serbestse)
      if (viewChanged && motion()) {
        view.querySelectorAll('.home > *, .cards > *, .panel, .page-head, .today-next, .today-progress').forEach((el, i) => {
          if (el.closest('.live-in')) return;
          el.style.setProperty('--i', Math.min(i, 10));
          el.classList.add('live-in');
        });
      }

      const db = o.db;
      const now = o.now || new Date();
      const cp = db ? closedPercent(db) : { paid: 0, total: 0, pct: 0, has: false };
      const mp = db ? monthProgress(db, now) : { ym: '', done: 0, total: 0, overdue: 0, complete: false };
      const curClosed = db ? debtClosureMap(db) : null;

      // Ödeme kutlamasını TÜM görünümlerde değerlendir (ozet, borclar, takvim, butce, ...)
      const ctx = {};
      if (o.paymentCompleted) {
        if (o.milestone) ctx.milestone = o.milestone;
        else if (state.prevPct != null && cp.has) ctx.milestone = crossedMilestone(state.prevPct, cp.pct);

        if (o.monthComplete) {
          ctx.monthCelebrate = true;
        } else if (mp.complete && lsGet(LS_MONTH) !== mp.ym) {
          ctx.monthCelebrate = true;
          lsSet(LS_MONTH, mp.ym);
        }

        const newlyClosed = o.debtClosed || findNewlyClosed(state.prevClosed, curClosed);
        const paidDiff = o.amount > 0
          ? Number(o.amount)
          : (state.prevPaid != null && cp.paid > state.prevPaid ? r2(cp.paid - state.prevPaid) : 0);

        // Eğer celebrate() az önce doğrudan çağrılmadıysa şimdi tetikle
        if (Date.now() - state.lastCelebrateAt > 180) {
          celebrate({
            amount: paidDiff,
            event: o.event,
            debtClosed: newlyClosed || false,
            milestone: ctx.milestone || null,
            monthComplete: ctx.monthCelebrate ? { total: mp.total, ym: mp.ym } : false,
          });
        }
      }

      // Bugün (ozet) ekranı: Gamified Özgürlük HUD + Slot-Odometer sayaçları
      if (o.view === 'ozet') {
        const debtEl = view.querySelector('.progress-amount[data-live-count]');
        const nextEl = view.querySelector('.today-amount[data-live-count]');

        if (debtEl) {
          const box = debtEl.closest('.today-progress');
          if (box) {
            const oldHud = box.querySelector('.live-block[data-live="1"]');
            if (oldHud) oldHud.remove();
            const hud = buildHud(db, now, ctx);
            if (hud.html) {
              // Çift ilerleme çubuğu olmasın: fallback <progress> gizlenir
              const fallbackProg = box.querySelector('progress');
              if (fallbackProg) {
                fallbackProg.hidden = true;
                fallbackProg.setAttribute('aria-hidden', 'true');
              }
              box.insertAdjacentHTML('beforeend', hud.html);
              const val = box.querySelector('.live-ring .val');
              if (val) {
                const to = val.getAttribute('data-to');
                if (motion()) {
                  requestAnimationFrame(() => requestAnimationFrame(() => val.setAttribute('stroke-dashoffset', to)));
                } else {
                  val.setAttribute('stroke-dashoffset', to);
                }
              }
            }
          }
          const dv = parseFloat(debtEl.getAttribute('data-live-count'));
          const changed = state.debt != null && dv !== state.debt;
          countTo(debtEl, state.debt, dv, !!(o.paymentCompleted || changed));
          state.debt = dv;
          state.pct = cp.has ? cp.pct : null;
        }

        if (nextEl) {
          const nv = parseFloat(nextEl.getAttribute('data-live-count'));
          const changed = state.next != null && nv !== state.next;
          countTo(nextEl, state.next, nv, !!(o.paymentCompleted || changed));
          state.next = nv;
        } else {
          state.next = null;
        }
      } else {
        state.debt = null;
        state.next = null;
        state.pct = cp.has ? cp.pct : null;
      }

      // Sonraki render'da fark ve kapanan borç tespiti için durumu güncelle
      state.prevPct = cp.has ? cp.pct : null;
      state.prevPaid = cp.has ? cp.paid : null;
      state.prevClosed = curClosed;
    } catch (e) {
      /* canlı katman asla uygulamayı bozmamalı */
    }
  };

  return api;
}));
