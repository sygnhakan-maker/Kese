/* Kese arayüzü. Hesaplar calc.js içindedir. */
(function () {
  'use strict';
  const C = window.KeseCalc;
  const M = C.fmtMoney;
  // ---------- Simgeler (SVG, tek renk: yazı rengini alır) ----------
  const ICONS = {
    flask: '<path d="M9 3h6M10 3v6.2L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9.2V3M7.5 14h9"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    shield: '<path d="M12 3l7.5 2.8v5.7c0 4.6-3.2 7.7-7.5 9.5-4.3-1.8-7.5-4.9-7.5-9.5V5.8z"/>',
    warn: '<path d="M12 4l9.5 16.5h-19z"/><path d="M12 10v5M12 17.8v.2"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.3v.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    bank: '<path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    bolt: '<path d="M13 2.5L5 13.5h6.5L10.5 21.5 19 10.5h-6.5z"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16z"/>',
    flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
    save: '<path d="M5 3.5h11l3.5 3.5V20.5H5zM8 3.5V8h7V3.5M8 20.5V14h8v6.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4.5 20h15"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3.5a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3.5z"/>',
    cart: '<path d="M3 4h2.2l2.3 11h10.2L20 7.5H6.2"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    bus: '<rect x="4.5" y="3.5" width="15" height="13" rx="2"/><path d="M4.5 11h15M7.5 16.5V20M16.5 16.5V20M8 14h.01M16 14h.01"/>',
    cap: '<path d="M2.5 9L12 4.5 21.5 9 12 13.5zM6.5 11.5V16c3 2 8 2 11 0v-4.5"/>',
    med: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M8 20.5h8M12 16.5v4"/>',
    swap: '<path d="M6 8h13l-3.5-3.5M18 16H5l3.5 3.5"/>',
    box: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4zM3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
    trend: '<path d="M3.5 17l5.5-5.5 4 4 7.5-7.5M15 8h5.5v5.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-5M12.5 16V8M17 16v-8"/>',
  home: '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6"/>',
    gear: '<path d="M10 2h4l.6 2.6 1.5.7 2.4-1.1 2.8 2.8-1.2 2.4.7 1.6 2.2.5v3l-2.5.6-.7 1.5 1.1 2.3-2.8 2.8-2.4-1.1-1.5.6-.6 2.2H10l-.6-2.4-1.5-.6-2.4 1.1-2.8-2.8 1.2-2.4-.7-1.5L1 14v-3l2.4-.6.7-1.6L3 6.5l2.8-2.8 2.4 1.1 1.3-.6Z"/><circle cx="12" cy="12" r="3.3"/>',
    bell: '<path d="M6 17.5V11a6 6 0 0 1 12 0v6.5l1.5 1.5h-15zM10 21h4"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V18a2 2 0 0 0 2 2h13.5V8H6.5A2.5 2.5 0 0 1 4 7.5zM16 14h.01"/>',
    doc: '<path d="M7 3.5h7l4 4V20.5H7zM14 3.5v4h4M10 12h5M10 16h5"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4.5 20h15"/>',
    undo: '<path d="M9 7L4.5 11.5 9 16M5 11.5h9a5 5 0 0 1 0 10"/>',
    vol: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
    spark: '<path d="M11 5c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8z"/><path d="M18.5 3.5v4M16.5 5.5h4"/>',
  };
  const icon = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ICONS.box}</svg>`;
  // index.html'deki <i data-ic="ad"></i> işaretlerini SVG ile değiştirir.
  const hydrateIcons = (root) => (root || document).querySelectorAll('i[data-ic]').forEach((el) => { el.outerHTML = icon(el.dataset.ic); });

  const BANKALAR = [
    'Akbank', 'Albaraka Türk Katılım', 'Alternatif Bank', 'Anadolubank', 'Burgan Bank', 'Colendi Bank', 'DenizBank', 'Dünya Katılım',
    'Emlak Katılım', 'Enpara Bank', 'Fibabanka', 'FUPS Bank', 'Garanti BBVA', 'Halkbank', 'Hayat Finans Katılım', 'HSBC', 'ICBC Turkey',
    'ING', 'Kuveyt Türk Katılım', 'Odeabank', 'QNB Türkiye', 'Şekerbank', 'TEB (Türk Ekonomi Bankası)', 'T.O.M. Katılım Bankası',
    'Türkiye Finans Katılım', 'Türkiye İş Bankası', 'VakıfBank', 'Vakıf Katılım', 'Yapı Kredi', 'Ziraat Bankası', 'Ziraat Dinamik Banka', 'Ziraat Katılım',
  ];
  const TUR = {
    KMH: ['Nakit Kullanım / Harcama', 'Taksitli KMH'],
    KART: ['Tek Çekim Harcama', 'Taksitli Alışveriş', 'Taksitli Nakit Avans'],
  };
  let db = null;
  let rates = null; // {durum, oranlar, cekildi, hata}
  const VALID_VIEWS = ['ozet', 'borclar', 'takvim', 'dahafazla', 'butce', 'maliyet', 'ayarlar', 'pano', 'oneriler'];
  const ui = { view: 'ozet', tab: 'KART', debtFilter: 'ALL', todayExpanded: false, selKmh: null, selKart: null, open: null, picked: new Set(), ym: null, calPage: 0, calOpen: {}, sbxPanel: true, panelNormal: false };
  let lastSnap = null;
  let lastPayOrigin = null;
  // Simülasyon modu: db geçici bir kopyaya çevrilir, hiçbir şey sunucuya yazılmaz.
  const sbx = { on: false, real: null, base: null };
  let lastDay = C.isoOf(new Date());

  const $ = (id) => document.getElementById(id);
  const btnCenter = (el) => {
    if (!el || !el.getBoundingClientRect) return {};
    const r = el.getBoundingClientRect();
    if (!(r.width || r.height)) return {};
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  };
  function setView(v, opts) {
    opts = opts || {};
    if (!VALID_VIEWS.includes(v)) v = 'ozet';
    ui.view = v;
    if (!opts.fromHash) {
      const targetHash = '#' + v;
      if (location.hash !== targetHash) {
        try { location.hash = targetHash; } catch (e) { /* yok say */ }
      }
    }
    render();
    if (!opts.noScroll) { const m = $('main'); if (m) m.focus(); window.scrollTo(0, 0); }
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#/, '');
    if (VALID_VIEWS.includes(h) && h !== ui.view) setView(h, { fromHash: true });
  });
  // Seçili ay görünümünde (yalnızca çizim sırasında) "şimdi" o ayın ilk günüdür; olay işleyicilerde gerçek tarih.
  let projecting = false, viewDate = null;
  const now = () => (projecting ? viewDate : new Date());
  const S = () => db.ayarlar;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // "100.000,12" (TR biçimi), "100000,12" ve "3.89" yazımlarının hepsini okur.
  const num = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
    let s = String(v ?? '').trim();
    if (s === '') return NaN;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const x = parseFloat(s); return Number.isFinite(x) ? x : NaN;
  };
  const pct = (v) => '%' + Number(v || 0).toFixed(2).replace('.', ',');
  const short = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + ' Mn' : v >= 1e3 ? Math.round(v / 1e3) + ' B' : String(Math.round(v)));

  // ---------- Veri ----------
  async function load() {
    db = await KeseStore.load();
    normalizeDb();
  }
  function normalizeDb() {
    // Eski sunucu sürümü bu alanları eklemeyebilir; arayüz kendi başına tamamlar.
    ['ek_gelirler', 'kmh_hesaplar', 'kredi_kartlari', 'krediler', 'sabit_giderler', 'tek_seferlik'].forEach((k) => { if (!Array.isArray(db[k])) db[k] = []; });
    if (Array.isArray(db.sigortalar) && db.sigortalar.length) {   // eski "prim" kayıtları -> sigorta kapsamı
      db.sigortalar.forEach((sg) => { const h = C.coverageHolder(db, sg.bagli_cat, sg.bagli_id); if (h && !h.sigorta_kapsam && sg.ilk_taksit_ym) h.sigorta_kapsam = { tarih: sg.tarih, ilk_ym: sg.ilk_taksit_ym, ay: sg.toplam_taksit, ad: sg.aciklama || 'Sigorta' }; });
    }
    delete db.sigortalar;
    db.ayarlar = Object.assign({ vergi_carpani: 1.3, vergi_carpani_konut: 1, asgari_limit_esigi: 100000, asgari_oran_alt: 20, asgari_oran_ust: 40, aylik_borc_butcesi: 0, aylik_yasam_gideri: 0 }, db.ayarlar || {});
    db.ayarlar.elle_oranlar = Object.assign({ ihtiyac_kredisi: 3.89, tasit_kredisi: 3.49, konut_kredisi: 2.79 }, db.ayarlar.elle_oranlar || {});
    if (db.ayarlar.aylik_yasam_gideri > 0 && !db.sabit_giderler.length) {
      db.sabit_giderler.push({ id: 1, ad: 'Aylık yaşam gideri', kategori: 'Diğer', tutar: db.ayarlar.aylik_yasam_gideri, gun: 1, sure: 0, baslangic_ym: C.ymOf(new Date()), odendi_aylar: [] });
      db.ayarlar.aylik_yasam_gideri = 0;
    }
    if (!ui.selKmh && db.kmh_hesaplar.length) ui.selKmh = db.kmh_hesaplar[0].id;
    if (!ui.selKart && db.kredi_kartlari.length) ui.selKart = db.kredi_kartlari[0].id;
  }
  async function save(msg, undoSnap, payment = false) {
    if (sbx.on) {   // simülasyonda kaydetme yok
      if (msg) toast(`${msg} (simülasyon: kaydedilmedi)`, Object.assign({ quiet: !!payment }, undoSnap ? { undo: undoSnap } : {}));
      render(payment || false); return;
    }
    let saved = false;
    try {
      await KeseStore.save(db);
      saved = true;
      window.KesePush?.changed();
      if (typeof syncApi !== 'undefined' && syncApi) syncApi.markDirty();
      if (msg) toast(msg, Object.assign({ quiet: !!payment }, undoSnap ? { undo: undoSnap } : {}));
    } catch (e) {
      toast('Kaydedilemedi: ' + e.message + ' Değişiklik yalnızca bu pencerede duruyor; sayfayı kapatmayın.', { err: true });
    }
    render(saved && payment ? payment : false);
  }
  // Yalnız geri dönüşü olmayan işlemler için uygulama içi onay (Promise<boolean>).
  function askConfirm(text, okLabel, title) {
    const dlg = $('dlg-onay');
    $('onay-title').textContent = title || 'Emin misiniz?'; $('onay-text').textContent = text; $('onay-tamam').textContent = okLabel || 'Devam et';
    return new Promise((resolve) => {
      const done = (v) => { dlg.removeEventListener('close', onClose); $('onay-tamam').onclick = $('onay-iptal').onclick = null; if (dlg.open) dlg.close(); resolve(v); };
      const onClose = () => done(false);
      dlg.addEventListener('close', onClose);
      $('onay-tamam').onclick = () => done(true); $('onay-iptal').onclick = () => done(false);
      dlg.showModal(); $('onay-iptal').focus();
    });
  }
  const nameOf = (s, fallback) => String(s || '').trim() || fallback;
  function removeWithUndo(mutator, msg) {
    const snap = JSON.stringify(db);
    mutator();
    save(msg, snap);
  }
  async function loadRates(force) {
    try {
      rates = await KeseStore.rates(force);
    } catch (e) {
      rates = { durum: 'yok', oranlar: null, hata: e.message };
    }
    renderRateChip();
    if (ui.view === 'ayarlar' || ui.view === 'oneriler') render();
  }
  const R = () => (rates && rates.oranlar) || null;

  // ---------- Ses efektleri (KeseLive.sfx varsa onu kullanır; varsayılan AÇIK) ----------
  const sfx = (() => {
    let ctx = null, muted = false;
    try { muted = localStorage.getItem('kese_ses') === '0'; } catch (e) { muted = false; }
    const liveSfx = () => (window.KeseLive && window.KeseLive.sfx) || null;
    const ac = () => {
      if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    const tone = (f, d, o) => {
      o = o || {}; const c = muted ? null : ac(); if (!c) return;
      const t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.06, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + d + 0.03);
    };
    const sounds = {
      click: () => tone(880, 0.05, { type: 'triangle', to: 600, vol: 0.04 }),
      open: () => { tone(420, 0.12, { to: 760, vol: 0.045 }); },
      close: () => { tone(760, 0.12, { to: 420, vol: 0.04 }); },
      ok: () => { tone(660, 0.09, { vol: 0.05 }); tone(990, 0.14, { at: 0.08, vol: 0.05 }); },
      err: () => { tone(220, 0.2, { type: 'sawtooth', to: 150, vol: 0.045 }); },
    };
    return {
      play(n) {
        try {
          const ls = liveSfx();
          if (ls) {
            if (typeof ls.play === 'function') { ls.play(n); return; }
            if (typeof ls[n] === 'function') { ls[n](); return; }
          }
          if (!this.muted && sounds[n]) sounds[n]();
        } catch (e) { /* ses çalınamazsa sessiz geç */ }
      },
      get muted() {
        const ls = liveSfx();
        if (ls) {
          if (typeof ls.isOn === 'function') return !ls.isOn();
          if (typeof ls.muted === 'boolean') return ls.muted;
          if (typeof ls.enabled === 'boolean') return !ls.enabled;
        }
        return muted;
      },
      toggle() {
        const ls = liveSfx();
        if (ls && typeof ls.toggle === 'function') {
          ls.toggle();
          muted = this.muted;
          return muted;
        }
        muted = !muted;
        try { localStorage.setItem('kese_ses', muted ? '0' : '1'); } catch (e) { /* yok say */ }
        if (!muted) sounds.ok();
        return muted;
      },
    };
  })();
  const renderSesBtn = () => {
    const on = !sfx.muted;
    document.querySelectorAll('[data-act="ses-toggle"]').forEach((b) => {
      b.innerHTML = icon(on ? 'vol' : 'mute') + (b.classList.contains('mt-btn') ? '' : (on ? ' Ses efektleri: Açık' : ' Ses efektleri: Kapalı'));
      b.setAttribute('aria-label', on ? 'Ses efektleri açık' : 'Ses efektleri kapalı');
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('on', on);
      b.title = on ? 'Ses açık' : 'Ses kapalı';
    });
  };

  function toast(text, o) {
    o = o || {}; if (!o.quiet) sfx.play(o.err ? 'err' : 'ok');
    const t = $('toast');
    t.className = 'toast' + (o.err ? ' err' : '');
    t.innerHTML = `<span>${esc(text)}</span>` + (o.undo ? '<button type="button" id="toast-undo">Geri al</button>' : '');
    t.hidden = false;
    if (o.undo) $('toast-undo').onclick = () => {
      t.hidden = true;
      if (typeof o.undo === 'function') { o.undo(); return; }
      lastSnap = null; db = JSON.parse(o.undo); save('Geri alındı.');
    };
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, o.undo ? 15000 : o.err ? 9000 : 3500);
  }

  // ---------- Ortak parçalar ----------
  function findItem(cat, pid, iid) {
    if (cat === 'KREDI') return db.krediler.find((x) => x.id === iid);
    const list = cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari;
    const p = list.find((x) => x.id === pid);
    return p ? p.hareketler.find((x) => x.id === iid) : null;
  }
  const covText = (holder, cat) => {
    if (!holder || !holder.sigorta_kapsam) return '';
    const k = holder.sigorta_kapsam, inf = C.coverageInfo(db, cat, holder.id);
    return `${icon('shield')} ${C.fmtYM(k.ilk_ym)} – ${C.fmtYM(C.ymAdd(k.ilk_ym, k.ay - 1))} taksitlerini sigorta öder${inf.adet ? ` (${inf.adet} taksit, ${M(inf.tutar)})` : ''}`;
  };
  const chip = (st) => ({
    odendi: '<span class="chip ok">Ödendi</span>', gecikmis: '<span class="chip bad">Gecikmiş</span>',
    bu_ay: '<span class="chip warn">Bu ay</span>', bekliyor: '<span class="chip">Bekliyor</span>',
    sigorta: `<span class="chip info">${icon('shield')} Sigorta öder</span>`, sigorta_odedi: `<span class="chip info">${icon('shield')} Sigorta ödedi</span>`,
  }[st]);
  const monthOpts = (sel, blankLabel, past = 0) => {
    const base = C.ymOf(new Date()), arr = [];
    for (let i = -past; i <= 36; i++) arr.push(C.ymAdd(base, i));
    if (sel && !arr.includes(sel)) arr.unshift(sel);
    return (blankLabel != null ? `<option value="">${blankLabel}</option>` : '') + arr.map((ym) => `<option value="${ym}" ${ym === sel ? 'selected' : ''}>${C.fmtYM(ym)}</option>`).join('');
  };
  const rangeText = (x) => {
    const cur = C.ymOf(new Date());
    const bas = x.baslangic_ym && x.baslangic_ym > cur ? `${C.fmtYM(x.baslangic_ym)}'den itibaren` : '';
    const sure = x.sure > 0 ? `${x.sure} ay` : '';
    return [bas, sure].filter(Boolean).join(' · ');
  };
  // "Bu ay" hücresi: kalan ödeme; ödenmişse ödenen tutar da görünür
  const buCell = (rem, paid) => (rem > 0.5
    ? `<td class="n warn-t">${M(rem)}${paid > 0.5 ? `<div class="muted" style="font-size:11px">+${M(paid)} ödendi</div>` : ''}</td>`
    : paid > 0.5 ? `<td class="n ok-t">${icon('check')} ${M(paid)}<div class="muted" style="font-size:11px">ödendi</div></td>` : '<td class="n">-</td>');
  const catName = { KMH: 'KMH', KART: 'Kredi kartı', KREDI: 'Kredi' };
  const pageHead = (title, sub, actions) =>
    `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div>${actions || ''}</div></div>`;
  const payBtn = (u, cls) => {
    if (ui.ym) return '';
    if (u.stmt) return stmtBtn(u);
    const a = `data-cat="${u.cat}" data-pid="${u.parentId ?? 0}" data-iid="${u.itemId}" data-no="${u.taksitNo}"`;
    const mainCls = cls || 'btn sm';
    return `<button type="button" class="${mainCls}" data-act="pay" ${a}>Ödedim</button><button type="button" class="btn sm ghost" data-act="pay-diff" ${a}>Farklı tutar</button>`;
  };

  const NAVIC = { ozet: 'home', pano: 'chart', butce: 'wallet', borclar: 'card', maliyet: 'trend', takvim: 'cal', oneriler: 'bell', ayarlar: 'gear', dahafazla: 'list' };
  const subToolViews = new Set(['butce', 'oneriler', 'maliyet', 'pano', 'ayarlar']);
  function renderNav(sum) {
    $('fab-tools').innerHTML = toolCards();
    const active = subToolViews.has(ui.view) ? 'dahafazla' : ui.view;
    const items = [
      ['ozet', 'Bugün', ''],
      ['borclar', 'Hesaplarım', ''],
      ['takvim', 'Takvimim', sum.gecikmis > 0 ? '!' : ''],
      ['dahafazla', 'Araçlar', ''],
    ];
    document.querySelectorAll('#fab [data-nav], .topbar [data-nav]').forEach((button) => {
      if (button.dataset.nav === ui.view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    $('deposit-accounts').innerHTML = db.kmh_hesaplar.map((account) =>
      `<button type="button" data-act="hesap-giris" data-id="${esc(account.id)}">${esc([account.banka, account.hesap_adi].filter(Boolean).join(' · '))}</button>`
    ).join('') || '<p>Para girişini kaydetmek için önce vadesiz hesabını ekle.</p><button type="button" data-wzgo="hesapv">Vadesiz hesap ekle</button>';
    $('nav').innerHTML = items.map(([k, l, b]) =>
      `<button type="button" data-nav="${k}" title="${{ borclar: 'Hesaplarım', takvim: 'Ödeme takvimim' }[k] || l}" ${active === k ? 'aria-current="page"' : ''}>${icon(NAVIC[k])}<span class="dl">${l}</span>${b ? `<span class="badge" aria-label="Geciken ödeme var">${b}</span>` : ''}</button>`).join('');
  }

  function toolCards() {
    const card = (attr, ic, title, desc) => `<button type="button" class="btn tool-card" ${attr}>${icon(ic)}<span><b>${title}</b><small>${desc}</small></span></button>`;
    const cards = [
      card('data-act="ai-open"', 'spark', 'Kese Asistan (Yapay Zeka)', 'Borçlarını sor, kişiselleştirilmiş ödeme stratejisi al.'),
      card('data-nav="butce"', 'wallet', 'Gelir ve Sabit Giderler', 'Maaşını ve faturalarını gir, elinde ne kalıyor gör.'),
      card('data-act="sbx-panel"', 'flag', 'Borç Kapatma Planı', 'Hangi borcu önce kapatırsan en az faiz ödersin?'),
    ];
    if (hasDebt(db) || sbx.on) {
      cards.push(card('data-act="sbx-toggle"', 'flask', sbx.on ? 'Simülasyondan Çık' : 'Simülasyon ("Ya Şöyle Yapsam?")', sbx.on ? 'Gerçek verilerine geri dön.' : 'Gerçek verin bozulmadan senaryo dene.'));
    }
    cards.push(
      card('data-nav="takvim"', 'cal', 'Ödeme takvimi', 'Taksitleri ay ay gör.'),
      card('data-nav="pano"', 'chart', 'Ayrıntılı pano', 'Gelir, borç ve ödeme tahminlerini incele.'),
      card('data-nav="oneriler"', 'bell', 'Öneriler', 'Bütçene uygun hatırlatmaları gör.'),
      card('data-act="budget-limit"', 'wallet', 'Harcama hedefi', 'Aylık harcama sınırını belirle.'),
      card('data-act="weekly-insight"', 'chart', 'Haftalık değerlendirme', 'Son yedi günü incele.'),
      card('data-act="pet-games"', 'spark', 'Kese ile oyna', 'Bir oyun seç.'),
      card('data-nav="maliyet"', 'trend', 'Faiz Raporu', 'Bankalara toplam ne kadar faiz gidiyor?'),
      card('data-act="asgari-ac"', 'info', 'Asgari Ödeme Rehberi', 'Sadece asgari ödersen borç ne kadar uzar?'),
      card('data-act="tour"', 'spark', 'Tanıtımı izle', 'Kese maskotu uygulamayı adım adım göstersin.'),
      card('data-act="pet-hide"', 'spark', 'Kese ile saklambaç', 'Kese saklanınca gözlerini ya da kurdelesini bul.'),
      card('data-act="pet-voice"', 'vol', window.KeseVoiceLabel ? window.KeseVoiceLabel() : 'Kese\'nin sesi: Kese mırıltısı', 'Dokunarak değiştir: mırıltı ya da sessiz.'),
      card('data-act="pet-toggle"', 'spark', window.KesePet && !window.KesePet.on ? 'Kese arkadaşın: Kapalı' : 'Kese arkadaşın: Açık', 'Ekranda gezen, konuşan Kese. Dokun, sürükle, sohbet et.'),
      card('data-nav="ayarlar"', 'gear', 'Ayarlar & Yedek', 'Verini yedekle, eşitle veya sıfırla.'),
    );
    return cards.join('');
  }
  function viewMore() {
    return pageHead('Araçlar', 'Borçlarını ve bütçeni kolayca yönet.') + `<div class="tools-grid today-more">${toolCards()}</div>`;
  }
  function renderRateChip() {
    const el = $('rate-chip');
    if (!el) return;
    if (!rates) { el.textContent = 'Faiz oranları yükleniyor…'; return; }
    el.className = 'rate-chip' + (rates.durum === 'eski' ? ' stale' : rates.durum === 'yok' ? ' none' : '');
    const r = rates.oranlar;
    if (!r) { el.innerHTML = '<b>TCMB oranları alınamadı.</b><br>Aşağıdan yeniden deneyin veya oranları elle girin.'; return; }
    el.innerHTML = `<b>TCMB azami oranlar</b> (${C.fmtDate(r.gecerlilik)}) · KMH / nakit ${pct(r.nakit_kmh.akdi)} · Kart ${pct(r.kart_30bin_alti.akdi)}–${pct(r.kart_180bin_ustu.akdi)}` +
      (rates.durum === 'eski' ? ' · <b class="warn-t">Son bilinen değerler</b>' : '');
  }

  // ---------- Ana sayfa (Bugün · Aksiyon Merkezi) ----------
  const personalDebts = (d) => (d.sabit_giderler || []).filter((g) => g.kategori === 'Elden borç' && g.kalan != null && g.kalan !== '');
  const hasDebt = (d) => C.items(d).length > 0 || personalDebts(d).length > 0;
  const debtName = (u) => (u.banka && u.banka !== 'Diğer' ? `${u.banka} · ${u.aciklama}` : u.aciklama);
  // Kart ödemesinin kayıt tarihi vade ayından farklı olabilir. Ekstre kaydı ve
  // işaretlediği taksit aynı ödemedir. Eski kayıtlarda taksit tek kaynak olabilir.
  function homePaid(sum, fixed) {
    let paid = sum.buAyOdenen + fixed.toplam - fixed.odenmemis;
    for (const card of db.kredi_kartlari) {
      const payments = card.ekstre_odemeleri || [];
      if (!payments.length) continue;
      const moved = new Map();
      let unlinked = 0;
      for (const p of payments) {
        if ((p.tarih || p.ym || '').slice(0, 7) === sum.thisYm) paid += Number(p.tutar) || 0;
        let allocated = 0;
        for (const r of p.refs || []) {
          const item = (card.hareketler || []).find((h) => h.id === r.hid);
          const t = item && (item.taksitler || []).find((x) => x.no === r.no);
          if (!t || t.kapatildi) continue;
          const amount = r.tutar == null ? t.tutar : Number(r.tutar);
          allocated += amount;
          if (t.ym === sum.thisYm) moved.set(t, r.tutar == null ? t.tutar : (moved.get(t) || 0) + amount);
        }
        if (!allocated && p.ym === sum.thisYm) unlinked += Number(p.tutar) || 0;
      }
      let legacyPaid = 0;
      for (const h of card.hareketler || []) {
        for (const t of h.taksitler || []) {
          if (t.kapatildi || t.ym !== sum.thisYm || (h.gecikmis && h.odemeler?.length)) continue;
          const marked = t.tutar - C.installmentBalance(t);
          const linked = Math.min(marked, moved.get(t) || 0);
          paid -= linked;
          legacyPaid += marked - linked;
        }
      }
      paid -= Math.min(unlinked, legacyPaid);
    }
    return C.r2(paid);
  }

  function homeEndings(thisYm) {
    const endings = [];
    for (const e of C.items(db)) {
      const terms = (e.item.taksitler || []).filter((t) => !t.kapatildi);
      if (!(e.item.toplam_taksit > 1 || terms.length > 1)) continue;
      const last = terms.reduce((latest, t) => (!latest || t.ym > latest.ym ? t : latest), null);
      if (!last || last.ym < thisYm) continue;
      endings.push({ ym: last.ym, name: e.item.kredi_adi || e.item.aciklama || e.hesap, amount: last.sigortaOder ? 0 : last.tutar });
    }
    for (const g of personalDebts(db)) {
      const amount = Number(g.tutar), rem = Number(g.kalan);
      if (!(amount > 0)) continue;
      const paid = new Set(g.odendi_aylar || []);
      let ym = g.baslangic_ym > thisYm ? g.baslangic_ym : thisYm;
      if (rem > 0.005) {
        const count = Math.ceil((rem - 0.005) / amount);
        let end = C.ymAdd(ym, count - 1);
        for (const month of [...paid].sort()) {
          if (month >= ym && month <= end) end = C.ymAdd(end, 1);
        }
        endings.push({ ym: end, name: g.ad, amount: C.r2(rem - (count - 1) * amount) });
      } else if (paid.has(thisYm)) endings.push({ ym: thisYm, name: g.ad, amount: C.giderTutar(g, thisYm) });
    }
    return endings.sort((a, b) => a.ym.localeCompare(b.ym));
  }

  function viewHome(sum) {
    const at = now(), ym = sum.thisYm, today = C.isoOf(at);
    const heading = pageHead('Ödeme planım', C.fmtYM(ym));
    const fixed = C.fixedSummary(db, at);
    const empty = !hasDebt(db) && !db.kredi_kartlari.length && !db.kmh_hesaplar.length && !db.sabit_giderler.length && !(db.tek_seferlik || []).length && !db.ek_gelirler.length;
    if (empty) return heading + welcomeHtml();
    const firstCard = db.kredi_kartlari.length === 1 && !db.kredi_kartlari[0].hareketler?.length ? db.kredi_kartlari[0] : null;
    const firstActions = firstCard ? `<section class="panel first-card-actions"><h2>${esc(firstCard.kart_adi)} hazır</h2>
      <div class="welcome-actions"><button type="button" class="btn primary" data-act="first-spend" data-id="${firstCard.id}">İlk harcamamı ekle</button>
      <button type="button" class="btn" data-act="opening-statement" data-id="${firstCard.id}">Mevcut ekstre borcumu gir</button></div></section>` : '';
    const due = groupCardRows(sum.upcoming.filter((r) => r.durum !== 'sigorta' && r.tutar > 0), 'parentId');
    const fixedDue = fixed.list.filter((g) => !g.odendi && g.gun > 0 && g.tutar > 0)
      .map((g) => ({ vade: g.vade, aciklama: g.ad, tutar: g.tutar, gider: g }));
    for (const g of db.sabit_giderler) {
      if (!(g.gun > 0) || fixedDue.some((r) => r.gider.id === g.id)) continue;
      let month = g.baslangic_ym > ym ? g.baslangic_ym : C.ymAdd(ym, 1);
      const paidMonths = new Set(g.odendi_aylar || []);
      while (paidMonths.has(month)) month = C.ymAdd(month, 1);
      if (C.giderAktif(g, month) && C.giderTutar(g, month) > 0) {
        fixedDue.push({ vade: C.dueDate(month, g.gun), aciklama: g.ad, tutar: C.giderTutar(g, month), gider: g, future: true });
      }
    }
    const next = due.concat(fixedDue).sort((a, b) => a.vade.localeCompare(b.vade))[0];
    const nextAction = !next || next.future ? '' : next.gider
      ? `<button type="button" class="btn sm" data-act="${next.gider.kategori === 'Elden borç' ? 'pay-elden' : 'pay-gider'}" data-id="${next.gider.id}">Ödedim</button>`
      : payBtn(next);
    const remaining = C.r2(sum.buAy + fixed.odenmemis + sum.kmhFaiz + sum.tekSeferlik);
    const covered = (month) => C.sum(C.items(db), (e) => C.sum((e.item.taksitler || []).filter((t) => t.ym === month && t.sigortaOder && !t.kapatildi), C.installmentBalance));
    const endings = homeEndings(ym);
    const line = (label, value) => `<div class="plan-line"><span>${esc(label)}</span><strong>${M(value)}</strong></div>`;
    const monthRow = (month) => {
      const vm = C.monthView(db, at, month, S());
      const bills = due.filter((r) => r.ym === month);
      const expenses = C.r2(vm.gider - vm.giderOdenen);
      const insurance = covered(month);
      const total = C.r2(C.sum(bills, (r) => r.tutar) + expenses + vm.tek + vm.faiz);
      const details = bills.map((r) => line(debtName(r), r.tutar));
      if (expenses > 0) details.push(line('Giderler ve elden borçlar', expenses));
      if (vm.tek > 0) details.push(line('Tek seferlik ödemeler', vm.tek));
      if (vm.faiz > 0) details.push(line('Tahmini artı para faizi', vm.faiz));
      if (insurance > 0) details.push(line('Sigortanın karşılayacağı', insurance));
      return `<details class="plan-month"><summary><span>${C.fmtYM(month)}</span><b>${M(total)}</b></summary><div class="plan-breakdown">${details.join('') || 'Kayıtlı ödeme yok.'}</div></details>`;
    };
    return `<div class="home plan-home">${heading}${firstActions}
      <section class="panel plan-current"><div class="plan-hero"><h2>Bu ay cebimden çıkacak kalan</h2><strong>${M(remaining)}</strong>
        ${sum.gecikmis > 0 ? `<small>Gecikmiş ${M(sum.gecikmis)} dahil</small>` : ''}</div>
        <div class="plan-stats"><div><span>Bu ay ödenen</span><b>${M(homePaid(sum, fixed))}</b></div><div><span>Sigortanın karşılayacağı</span><b>${M(covered(ym))}</b></div></div>
      </section>
      <section class="panel plan-next"><div><h2>Sıradaki ödeme</h2>${next ? `<strong>${esc(debtName(next))}</strong><small>${C.fmtDate(next.vade)}${next.vade < today ? ' · Gecikmiş' : next.vade === today ? ' · Bugün' : ''}</small>` : '<p>Vadesi belirlenmiş bekleyen ödeme yok.</p>'}</div>
        ${next ? `<div class="plan-next-amount"><b>${M(next.tutar)}</b><div>${nextAction}</div></div>` : ''}</section>
      <section class="panel plan-upcoming"><header><h2>Gelecek aylar</h2><button class="btn sm" data-nav="takvim">Ödeme takvimim</button></header>
        ${[1, 2, 3].map((i) => monthRow(C.ymAdd(ym, i))).join('')}</section>
      <section class="panel plan-endings"><header><h2>Taksitlerim ne zaman bitiyor?</h2></header>${endings.length ? endings.map((e) => `<div class="plan-line"><span><b>${esc(e.name)}</b><small>Son taksit · ${C.fmtYM(e.ym)}</small></span><span>${e.amount > 0 ? `Sonraki aydan itibaren<br><b>ayda ${M(e.amount)} daha az</b>` : 'Son taksiti sigorta karşılıyor'}</span></div>`).join('') : '<p>Planında bitiş tarihi olan taksitli borç yok.</p>'}</section>
      <div class="plan-links"><button class="btn" data-nav="borclar">${icon('card')} Hesaplarım</button><details class="plan-budget"${document.querySelector('.plan-budget[open]') ? ' open' : ''}><summary>Gelir, gider ve limitlerim</summary>${monthCardHtml()}</details></div></div>`;
  }

  /** Ana ekran ay kartı: o ayın ödemeleri, ödemelerden sonra kalan para ve limitler. Oklarla geçmiş/gelecek aylar. */
  function monthCardHtml() {
    const thisYm = C.ymOf(new Date()), minYm = C.ymAdd(thisYm, -12), maxYm = C.lastPlanYm(db, new Date());
    let ym = ui.homeYm || thisYm; if (ym < minYm) ym = minYm; if (ym > maxYm) ym = maxYm; ui.homeYm = ym;
    const v = C.monthView(db, new Date(), ym, S()), gelirVar = db.ek_gelirler.length > 0;
    const sg = (x) => `${x < -0.005 ? '−' : ''}${M(Math.abs(x))}`;
    const parts = [v.borc > 0.005 ? `Borç ödemeleri ${M(v.borc)}` : '', v.gider > 0.005 ? `Giderler ${M(v.gider)}` : '', v.faiz > 0.005 ? `Artı para faizi ${M(v.faiz)}` : '', v.tek > 0.005 ? `Tek seferlik ${M(v.tek)}` : ''].filter(Boolean);
    const cardLimit = C.sum(db.kredi_kartlari, (k) => Math.max(0, (Number(k.limit) || 0) - C.cardUsed(k, !v.cur && !v.past ? ym : null)));
    const pctL = v.limit > 0 ? Math.min(100, Math.round(v.kullanilan / v.limit * 100)) : 0;
    const label = v.cur ? 'Bu ay' : v.past ? 'Geçmiş ay' : 'Gelecek ay (tahmin)';
    const kalanLbl = v.past ? 'Ödemelerden sonra kalan' : v.cur ? 'Ödemelerden sonra kalacak' : 'Ödemeleri eksiksiz yaparsan kalacak';
    return `<section class="panel mcard-home" aria-label="Aylık özet">
      <div class="mh-nav"><button type="button" class="btn sm ghost mh-arrow" data-act="home-ym" data-d="-1" ${ym <= minYm ? 'disabled' : ''} aria-label="Önceki ay">‹</button>
        <div class="mh-title"><b>${C.fmtYM(ym)}</b><small>${label}</small></div>
        <button type="button" class="btn sm ghost mh-arrow" data-act="home-ym" data-d="1" ${ym >= maxYm ? 'disabled' : ''} aria-label="Sonraki ay">›</button></div>
      <div class="mh-grid">
        <div class="mh-cell"><span>${v.past ? 'O ayın ödemeleri' : 'Bu ayın ödemeleri toplamı'.replace('Bu ayın', v.cur ? 'Bu ayın' : 'Ayın')}</span><strong>${M(v.toplamOdeme)}</strong><small>${parts.join(' · ') || 'Ödeme yok'}</small>
          ${v.cur && v.toplamOdeme > 0.005 ? `<small class="mh-paid">${icon('check')} ${M(v.odenenToplam)} ödendi · <b>${M(v.kalanOdeme)}</b> kaldı</small>` : ''}</div>
        <div class="mh-cell"><span>${kalanLbl}</span>${gelirVar ? `<strong class="${v.kalan < -0.005 ? 'bad-t' : 'ok-t'}">${sg(v.kalan)}</strong><small>Gelir ${M(v.gelir)} − ödemeler ${M(v.toplamOdeme)}</small>` : `<strong class="muted">—</strong><small><button type="button" class="linkbtn" data-nav="butce">Gelirini ekle</button>, kalan paranı görelim</small>`}</div>
      </div>
      ${v.limit > 0 || v.kullanilan > 0 || db.kmh_hesaplar.length ? `<div class="mh-limit"><div class="mh-limit-top"><span>${v.cur || v.past ? 'Limitlerin' : 'Bu ayın ödemelerinden sonra limitlerin'}</span><b>${M(v.kullanilan)} / ${M(v.limit)}</b></div>
        <div class="meter${pctL > 85 ? ' hot' : ''}" aria-label="Limitlerin %${pctL} kullanılıyor"><i style="width:${pctL}%"></i></div>
        <div class="home-money-labels">${db.kredi_kartlari.length ? `<small>Kullanılabilir kart limiti <b>${M(cardLimit)}</b></small>` : ''}
        ${db.kmh_hesaplar.length ? `<small>Hesaplarındaki para <b>${M(v.bakiye)}</b></small>` : ''}</div></div>` : ''}
    </section>`;
  }

  /** "Bu ay paran": gelir, ödenenler, şu an elde kalan ve ay sonu tahmini. */
  function cashCardHtml() {
    const c = C.monthCash(db, now(), C.ymOf(now()), S()); if (!c) return '';
    const sgn = (v) => `<b class="${v < -0.005 ? 'bad-t' : 'ok-t'}">${v < -0.005 ? '−' : ''}${M(Math.abs(v))}</b>`;
    const row = (l, v, cls) => `<div class="cash-row${cls ? ' ' + cls : ''}"><span>${l}</span>${v}</div>`;
    const kalanOdeme = C.r2((c.borcKalan || 0) + (c.giderKalan || 0) + (c.tek || 0));
    const body = c.buAy && !ui.ym
      ? row('Gelir', `<b class="ok-t">+${M(c.gelir)}</b>`)
        + row('Ödenen borç taksitleri', `<b>−${M(c.borcOdenen)}</b>`)
        + row('Ödenen giderler', `<b>−${M(c.giderOdenen)}</b>`)
        + row('Şu an elinde kalan', sgn(c.elde), 'total')
        + row('Bu ay ödenecek kalan', `<b class="warn-t">−${M(kalanOdeme)}</b>`)
        + row('Ay sonunda kalacak', sgn(c.aySonu), 'total big')
      : row('Gelir', `<b class="ok-t">+${M(c.gelir)}</b>`) + row('Borç ödemeleri', `<b>−${M(c.borc)}</b>`) + row('Giderler', `<b>−${M(c.gider + (c.tek || 0))}</b>`) + row('Ay sonunda kalacak', sgn(c.aySonu), 'total big');
    const note = c.aySonu < -0.005 ? `<p class="cash-note bad">${icon('warn')} Bu ay ödemelerin gelirini <b>${M(-c.aySonu)}</b> aşıyor.</p>` : '';
    return `<section class="panel cash-card" aria-labelledby="cash-h"><header><h2 id="cash-h">${ui.ym ? C.fmtYM(C.ymOf(now())) + ' için paran' : 'Bu ay paran'}</h2><button type="button" class="btn sm" data-nav="butce">Gelir / gider</button></header><div class="cash-body">${body}</div>${note}</section>`;
  }

  // Kese arkadaş (kese-pet.js) için salt okunur özet
  window.KeseApp = {
    get view() { return ui.view; },
    snapshot() {
      try {
        if (!db) return null;
        const n = new Date(), ym = C.ymOf(n), mv = C.monthView(db, n, ym, S()), sum = C.summarize(db, n, S());
        const kartlar = db.kredi_kartlari.map((k) => ({ ad: k.kart_adi, oran: k.limit > 0 ? C.cardUsed(k) / k.limit : 0 }));
        let bitecek = null;
        C.items(db).forEach((e) => { const u = C.unpaid(e.item); if (!u.length) return; const last = u.reduce((m, t) => (t.ym > m ? t.ym : m), ''); if (!bitecek || last < bitecek.ym) bitecek = { ym: last, ad: e.cat === 'KREDI' ? e.item.kredi_adi : e.item.aciklama }; });
        return { gelirVar: db.ek_gelirler.length > 0, kalan: mv.kalan, odeme: mv.toplamOdeme, kalanOdeme: mv.kalanOdeme, gecikmis: sum.gecikmis, limit: mv.limit, kullanilan: mv.kullanilan,
          kartlar, eksi: db.kmh_hesaplar.some((a) => C.hesapBakiye(a) < 0), bitecek: bitecek ? { ay: C.fmtYM(bitecek.ym), ad: bitecek.ad } : null, bos: !hasDebt(db) && !(db.kredi_kartlari.length + db.kmh_hesaplar.length), fmt: (v) => M(v) };
      } catch (e) { return null; }
    },
    get muted() { return sfx.muted; },
  };
  // ---------- İlk açılış: bilgilendirme ekranı ve maskotlu kısa tanıtım ----------
  function welcomeHtml() {
    return `<div class="welcome wl">
      <img class="welcome-mascot" src="icons/mascot-400.png" alt="" width="160" height="183" decoding="async">
      <h2>Ödeme planını oluşturmaya başla</h2>
      <p class="lead">Kartını veya kredini eklediğinde ilk ödeme tarihini ve aylık tutarlarını burada göreceksin.</p>
      <div class="welcome-actions">
        <button type="button" class="btn primary" id="tw-kart" data-act="add-hesap" data-cat="KART">İlk kartımı ekle</button>
        <button type="button" class="btn" data-act="add-kredi">Kredi ekle</button>
        <button type="button" class="btn" id="tw-demo" data-act="demo-card">Örnek kartla dene</button>
      </div>
      <button type="button" class="btn ghost" data-act="tour">${icon('spark')} Kısa tanıtımı izle</button>
    </div>`;
  }
  // İki tanıtım: ilk açılış ekranı (kayıt yokken) ve ana ekran (kayıt varken).
  const TOUR_WELCOME = [
    { sel: '.welcome-mascot', t: 'Merhaba, ben Kese! Bir kart ve bir alışverişle başlayalım.' },
    { sel: '#tw-kart', t: 'Kartını ekle, ardından ilk harcamanı yaz. Kese tutarı ve ödeme tarihini gösterir.' },
    { sel: '#tw-demo', t: 'Örnek kartla gerçek bilgilerini girmeden deneyebilirsin.' },
  ];
  const TOUR_HOME = [
    { sel: '.plan-current', t: 'Bu ay cebinden çıkacak kalan tutarı, ödediklerini ve sigortanın karşılayacağı taksitleri burada görebilirsin.' },
    { sel: '.plan-next', t: 'Sıradaki ödemenin tarihi ve tutarı burada. Ödemeni yaptığında kaydedebilirsin.' },
    { sel: '.plan-upcoming', t: 'Bir ayı açarak o ay ödenecek tutarın ayrıntılarını görebilirsin.' },
    { sel: '.plan-endings', t: 'Son taksitin tarihini ve sonraki ay ödemelerinin ne kadar azalacağını burada görebilirsin.' },
    { sel: '.dock-add', t: '+ düğmesinden ödeme planına, hesaplarına ve bütçene ulaşabilir, harcama, para girişi veya borç ekleyebilirsin.' },
    { sel: '.topbar [data-nav="ayarlar"]', t: 'Ayarlar bölümünden yedeklerine ve tüm araçlara ulaşabilirsin.' },
  ];
  let TOUR = TOUR_WELCOME, tourSeenMem = false;
  const TOUR_KEY = 'kese_tour_v3';
  let tourI = -1;
  function tourEl() {
    let o = $('tour'); if (o) return o;
    o = document.createElement('div'); o.id = 'tour'; o.className = 'tour'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-live', 'polite');
    o.innerHTML = '<div class="tour-hole"></div><img class="tour-mascot" src="icons/mascot-96.png" alt="" width="64" height="73"><div class="tour-bubble"><p id="tour-t"></p><div class="tour-btns"><button type="button" class="btn ghost sm" id="tour-skip">Geç</button><span id="tour-n" class="muted"></span><button type="button" class="btn primary sm" id="tour-next">İleri</button></div></div>';
    document.body.appendChild(o);
    o.querySelector('#tour-skip').onclick = () => endTour();
    o.querySelector('#tour-next').onclick = () => tourGo(tourI + 1);
    window.addEventListener('resize', () => { if (tourI >= 0) tourGo(tourI, true); });
    return o;
  }
  function tourGo(i, same) {
    if (i >= TOUR.length) return endTour();
    tourI = i; const st = TOUR[i], o = tourEl(), target = document.querySelector(st.sel);
    if (!target) return tourGo(i + 1);
    if (!same) target.scrollIntoView({ block: 'center', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
    const r = target.getBoundingClientRect(), pad = 8, W = innerWidth, H = innerHeight;
    const hole = o.querySelector('.tour-hole'), mas = o.querySelector('.tour-mascot'), bub = o.querySelector('.tour-bubble');
    Object.assign(hole.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    o.querySelector('#tour-t').textContent = st.t;
    try { document.dispatchEvent(new CustomEvent('kese:tour', { detail: { i, n: TOUR.length, text: st.t } })); } catch (e) { /* yok say */ }
    o.querySelector('#tour-n').textContent = `${i + 1}/${TOUR.length}`;
    o.querySelector('#tour-next').textContent = i === TOUR.length - 1 ? 'Başla' : 'İleri';
    const below = r.bottom + 190 < H || r.top < 220;
    const bw = Math.min(340, W - 24), bx = Math.max(12, Math.min(W - bw - 12, r.left + r.width / 2 - bw / 2));
    Object.assign(bub.style, { width: `${bw}px`, left: `${bx}px`, top: below ? `${Math.min(H - 170, r.bottom + pad + 64)}px` : 'auto', bottom: below ? 'auto' : `${Math.min(H - 120, H - r.top + pad + 64)}px` });
    const mx = Math.max(8, Math.min(W - 72, r.left + r.width / 2 - 32));
    Object.assign(mas.style, { left: `${mx}px`, top: below ? `${r.bottom + pad - 4}px` : `${r.top - pad - 70}px` });
    mas.classList.remove('hop'); void mas.offsetWidth; mas.classList.add('hop');
    o.hidden = false; o.querySelector('#tour-next').focus({ preventScroll: true });
  }
  let tourPending = false;
  function launchTour() {
    TOUR = document.querySelector('#tw-kart') ? TOUR_WELCOME : TOUR_HOME;
    document.body.classList.add('tour-on');
    setTimeout(() => tourGo(0), 300);
  }
  function startTour(force) {
    let seen = tourSeenMem; try { seen = seen || !!localStorage.getItem(TOUR_KEY); } catch (e) { /* depolama yoksa yalnız bu oturumda hatırla */ }
    if (!force && seen) return;
    tourSeenMem = true;
    if (document.querySelector('#tw-kart') || document.querySelector('.mcard-home')) return launchTour();
    tourPending = true; ui.view = 'ozet'; ui.homeYm = null; render();
  }
  function endTour() { try { document.dispatchEvent(new CustomEvent('kese:tour', { detail: { end: true } })); } catch (e) { /* yok say */ } tourI = -1; tourSeenMem = true; document.body.classList.remove('tour-on'); const o = $('tour'); if (o) o.hidden = true; try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) { /* yok say */ } }
  document.addEventListener('keydown', (e) => { if (tourI >= 0 && e.key === 'Escape') endTour(); });

  // ---------- Özet (ayrıntılı pano) ----------
  const pc0 = (v, t) => (t > 0 ? Math.round(v / t * 100) : 0) + '%';
  function viewOzet(sum) {
    if (!hasDebt(db) && !db.ek_gelirler.length && !db.sabit_giderler.length) {
      return pageHead('Ayrıntılı pano', '') + `<section class="panel"><div class="empty">Henüz kayıt yok. Borç, gelir veya gider ekleyince pano dolar.<br><br>Eklemek için alttaki <b>+</b> düğmesine dokun. <button type="button" class="btn" data-nav="butce">Gelir ekle</button></div></section>`;
    }
    const F = C.fixedSummary(db, now());
    const incomeKnown = db.ek_gelirler.length > 0;
    const gelir = sum.gelir, giderTop = C.r2(F.toplam + (sum.kmhFaiz || 0)), borcBuAy = sum.buAyToplam, gec = sum.gecikmis;
    const tek = sum.tekSeferlik || 0;
    const kalan = C.r2(gelir - giderTop - borcBuAy - tek);
    const AY = ui.ym ? C.fmtYM(ui.ym) : 'Bu ay';
    let cls = 'ok', msg = `${AY} giderleriniz ve borç ödemeleriniz karşılanıyor.`, sub = `Ay sonunda ${M(kalan)} kalıyor.`;
    if (!incomeKnown) { cls = 'warn'; msg = 'Gelir eklenmemiş.'; sub = 'Ay sonu tahmini için aylık gelirinizi girin.'; }
    else if (gec > 0) { cls = 'bad'; msg = `${M(gec)} gecikmiş ödemeniz var.`; sub = 'Gecikme faizi her gün işliyor; önce bunları kapatın.'; }
    else if (kalan < 0) { cls = 'bad'; msg = `${AY} ${M(-kalan)} açık veriyorsunuz.`; sub = 'Öneriler ekranında çıkış yolları var.'; }
    else if (gelir > 0 && kalan < gelir * 0.1) { cls = 'warn'; msg = `${AY} bütçeniz çok sıkışık.`; sub = `Ay sonunda yalnızca ${M(kalan)} kalıyor.`; }

    // Paranın dağılımı (CSS belirteçleri, sabit hex yok)
    const total = Math.max(gelir, giderTop + borcBuAy + tek, 1);
    const seg = [
      ['Sabit giderler', giderTop, 'var(--bad)'],
      ['Borç taksitleri', borcBuAy - gec, 'color-mix(in srgb, var(--bad) 58%, var(--panel))'],
      ['Gecikmiş borç', gec, 'color-mix(in srgb, var(--bad) 75%, var(--text))'],
      ['Tek seferlik / borç kapatma', tek, 'color-mix(in srgb, var(--gold) 75%, var(--panel))'],
    ];
    if (incomeKnown) seg.push([kalan >= 0 ? 'Ay sonu kalan' : 'Açık', Math.abs(kalan), kalan >= 0 ? 'var(--accent)' : 'var(--bad)']);
    const flowBar = `<div class="bar" style="height:22px">${seg.filter((x) => x[1] > 0).map((x) => `<span style="width:${x[1] / (kalan < 0 ? giderTop + borcBuAy + tek : total) * 100}%;background:${x[2]}" title="${x[0]}: ${M(x[1])}"></span>`).join('')}</div>`;
    const legend = seg.map((x) => `<div class="lg"><i style="background:${x[2]}"></i><span>${x[0]}</span><b>${M(x[1])}</b><em>${pc0(x[1], gelir)}</em></div>`).join('');
    const catMax = Math.max(1, ...F.kategoriler.map((k) => k.tutar));
    const cats = F.kategoriler.slice(0, 5).map((k) => `<div class="mini"><span>${icon(C.giderIkon(k.kategori))} ${esc(k.kategori)}</span><div class="meter"><i style="width:${k.tutar / catMax * 100}%;background:var(--bad)"></i></div><b>−${M(k.tutar)}</b></div>`).join('')
      || '<div class="muted">Sabit gider eklenmemiş. <button class="btn sm" data-nav="butce">Ekle</button></div>';

    // Şimdi yapılacaklar (borç taksitleri + ödenmemiş giderler)
    const todo = groupCardRows(sum.upcoming.filter((u) => u.ym <= sum.thisYm && u.durum !== 'sigorta'), 'parentId').map((u) => ({ vade: u.vade, tip: 'borc', durum: u.durum, ad: `${u.banka} · ${u.aciklama}`, alt: u.stmt ? `Kart ekstresi · ${u.adet} kalem` : `${catName[u.cat]} ${u.taksitNo}/${u.toplamTaksit}`, tutar: u.tutar, btn: payBtn(u) }))
      .concat((db.tek_seferlik || []).filter((x) => x.ym === sum.thisYm).map((x) => ({ vade: `${x.ym}-01`, tip: 'tek', durum: 'bu_ay', ad: x.ad, alt: x.birikim ? 'Tek seferlik · birikimden' : 'Tek seferlik ödeme', tutar: x.tutar, btn: '' })))
      .concat(F.list.filter((g) => !g.odendi).map((g) => ({ vade: g.vade, tip: 'gider', durum: g.gecti ? 'gecikmis' : 'bu_ay', ad: g.ad, alt: g.kategori, tutar: g.tutar, btn: ui.ym ? '' : `<button class="btn sm" data-act="${g.kategori === 'Elden borç' ? 'pay-elden' : 'pay-gider'}" data-id="${g.id}">Ödedim</button>` })))
      .sort((a, b) => a.vade.localeCompare(b.vade));
    const N = 8;
    const rows = todo.slice(0, N).map((t) => `<li><span class="dt">${t.vade.slice(8)}.${t.vade.slice(5, 7)}</span><div class="grow"><b>${esc(t.ad)}</b><small>${esc(t.alt)}</small></div>${t.durum === 'gecikmis' ? (t.tip === 'gider' ? '<span class="chip warn">Vade geçti</span>' : '<span class="chip bad">Gecikmiş</span>') : ''}<span class="amt">${M(t.tutar)}</span>${t.btn}</li>`).join('');
    const more = todo.length > N ? `<div class="more"><button class="btn sm" data-nav="takvim">+${todo.length - N} ödeme daha · Takvim</button></div>` : '';

    // Önce ne yapmalı
    const gecItems = C.items(db).filter((e) => e.item.gecikmis && C.unpaid(e.item).length).map((e) => ({ e, o: C.overdueInfo(e.item, now(), C.vergiFor(S())) })).sort((a, b) => b.o.gunluk - a.o.gunluk);
    const kartlar = db.kredi_kartlari.map((k) => ({ k, m: C.cardMinPayment(k, now(), S()) })).filter((x) => x.m.toplam > 0);
    const asgari = C.sum(kartlar, (x) => x.m.kalanAsgari);
    const steps = [];
    if (gec > 0) steps.push(`<b>Gecikmişleri kapatın (${M(gec)})</b>${gecItems.length ? ` · önce ${esc(gecItems[0].e.item.aciklama)} (günde +${M(gecItems[0].o.gunluk)})` : ''}`);
    if (F.odenmemis > 0) steps.push(`<b>Sabit giderler: ${M(F.odenmemis)}</b> henüz ödenmedi`);
    if (asgari > 0) steps.push(`<b>Kartlarda en az ${M(asgari)}</b> (asgari) ödeyin`);
    if (incomeKnown) steps.push(kalan >= 0 ? `<b>Artan ${M(kalan)}</b>'yi en pahalı borca yatırın` : `<b>${M(-kalan)} açık</b>: yapılandırma/ek gelir için Öneriler`);
    const stepsHtml = steps.length ? `<div class="sec">Önce ne yapmalı?</div><ol class="steps2">${steps.slice(0, 3).map((x) => `<li>${x}</li>`).join('')}</ol>` : '';

    // Borç durumu
    const cs = C.costSummary(db, S()).total;
    const bmax = Math.max(1, sum.kalanBorc);
    const dRow = (l, v, col) => `<div class="mini d"><span>${l}</span><div class="meter"><i style="width:${v / bmax * 100}%;background:${col}"></i></div><b>${M(v)}</b></div>`;
    const bitis = sum.months.length ? C.fmtYM(sum.months[sum.months.length - 1].ym) : '—';
    const recos = C.recommendations(db, now(), S(), R(), ui.ym ? C.fmtYM(ui.ym) : 'Bu ay').slice(0, 2);
    const ic = { kritik: icon('alert'), uyari: icon('warn'), bilgi: icon('info') };

    return `<div class="dash">
      <div class="dash-head"><div><h1>Ayrıntılı pano</h1><span class="muted">${ui.ym ? C.fmtYM(ui.ym) + ' · tahmin' : C.fmtDate(C.isoOf(now()))}</span></div><div class="status ${cls}"><b>${esc(msg)}</b> <span>${esc(sub)}</span></div></div>
      <div class="kpis">
        <div class="stat"><div class="k">Aylık gelir</div><div class="v ${incomeKnown ? 'ok-t' : 'muted'}">${incomeKnown ? M(gelir) : '—'}</div><div class="s">${incomeKnown ? `${db.ek_gelirler.length} gelir kalemi` : 'Henüz girilmedi'}</div></div>
        <div class="stat"><div class="k">Sabit giderler</div><div class="v bad-t">−${M(giderTop)}</div><div class="s">${F.list.length} kalem · kira, fatura, market…</div></div>
        <div class="stat"><div class="k">Borç ödemeleri (${ui.ym ? C.fmtYM(ui.ym) : 'bu ay'})</div><div class="v bad-t">−${M(borcBuAy)}</div><div class="s">${sum.buAyOdenen > 0.5 ? `${icon('check')} ${M(sum.buAyOdenen)} ödendi · ${M(sum.buAy)} kalan` : (gec > 0 ? `${M(gec)} gecikmiş dahil` : 'Gecikmiş yok')}${tek > 0 ? ` · +${M(tek)} tek seferlik` : ''}</div></div>
        <div class="stat"><div class="k">Ay sonu kalan</div><div class="v ${!incomeKnown ? 'muted' : kalan < 0 ? 'bad-t' : 'ok-t'}">${incomeKnown ? M(kalan) : '—'}</div><div class="s">${incomeKnown ? 'Gelir − giderler − borç ödemeleri' : 'Gelir bilgisi gerekli'}</div></div>
        <div class="stat"><div class="k">Toplam kalan borç</div><div class="v bad-t">${M(sum.kalanBorc)}</div><div class="s">Bitiş ${bitis}${F.eldenKalan > 0 ? ` · elden borç ${M(F.eldenKalan)}` : ''}</div></div>
      </div>
      <div class="dash-cols">
        <section class="dp"><header><h2>Paranız nereye gidiyor?</h2><button class="btn sm" data-nav="butce">Düzenle</button></header>
          <div class="body">${flowBar}<div class="legend2">${legend}</div><div class="sec">Giderlerin dağılımı</div>${cats}</div></section>
        <section class="dp"><header><h2>${ui.ym ? C.fmtYM(ui.ym) + ' ödemeleri' : 'Şimdi yapılacaklar'}</h2><span class="muted">${todo.length} ödeme</span></header>
          <div class="body">${rows ? `<ul class="list compact" data-total="${todo.length}">${rows}</ul>${more}` : '<div class="empty">Bu ay yapılacak ödeme kalmadı.</div>'}${stepsHtml}</div></section>
        <section class="dp"><header><h2>Borç durumu</h2><button class="btn sm" data-nav="borclar">Ayrıntı</button></header>
          <div class="body">${dRow(icon('card') + ' Kredi kartları', sum.byCat.KART, 'var(--accent)')}${dRow(icon('bolt') + ' Eksi hesap (KMH)', sum.byCat.KMH, 'color-mix(in srgb, var(--accent) 65%, var(--panel))')}${dRow(icon('bank') + ' Krediler', sum.byCat.KREDI, 'color-mix(in srgb, var(--accent) 38%, var(--panel))')}${sum.sigortaKarsilanan > 0 ? `<div class="sigline">${icon('shield')} Sigorta sizin yerinize ödeyecek: <b>${M(sum.sigortaKarsilanan)}</b></div>` : ''}
            <div class="sec">Faiz yükü <button class="btn sm" data-nav="maliyet" style="float:right">Ayrıntı</button></div>
            <div class="bar" style="height:16px"><span class="a" style="width:${cs.anaToplam / Math.max(1, cs.anaToplam + cs.faizToplam) * 100}%"></span><span class="f" style="width:${cs.faizToplam / Math.max(1, cs.anaToplam + cs.faizToplam) * 100}%"></span></div>
            <div class="legend2"><div class="lg"><i style="background:var(--accent)"></i><span>Ana para</span><b>${M(cs.anaToplam)}</b></div><div class="lg"><i style="background:var(--bad)"></i><span>Faiz yükü</span><b>${M(cs.faizToplam)}</b></div><div class="lg"><i style="background:var(--gold)"></i><span>Kalan faiz</span><b>${M(cs.faizKalan)}</b></div></div>
            <div class="sec">Öneriler <button class="btn sm" data-nav="oneriler" style="float:right">Tümü</button></div>
            ${recos.map((r) => `<div class="rc ${r.seviye}"><span class="ic">${ic[r.seviye]}</span><span>${esc(r.baslik)}</span></div>`).join('')}</div></section>
      </div></div>`;
  }

  // ---------- Gelir & Gider ----------
  function viewButce() {
    const F = C.fixedSummary(db, now()), ym = C.ymOf(now());
    const curYm0 = C.ymOf(now());
    const readOnly = !!ui.ym;
    const expenseAmounts = new Map(F.list.map((item) => [item.id, item.tutar]));
    const gelirler = db.ek_gelirler.map((x) => `<li class="${C.gelirAktif(x, curYm0) ? '' : 'dim'}"><div class="grow"><b>${esc(x.aciklama)}</b>${rangeText(x) ? `<small>${esc(rangeText(x))}</small>` : ''}</div><span class="amt ok-t">+${M(x.tutar)}</span>${readOnly ? '' : `<button class="btn sm" data-act="gelir-edit" data-id="${x.id}">Düzenle</button><button class="btn sm danger" data-act="del-gelir" data-id="${x.id}" aria-label="Sil">${icon('x')}</button>`}</li>`).join('');
    const giderler = (db.sabit_giderler || []).slice().sort((a, b) => (a.gun || 0) - (b.gun || 0)).map((x) => {
      const aktif = C.giderAktif(x, ym), odendi = C.giderIkon && (x.odendi_aylar || []).includes(ym);
      return `<li class="${aktif ? '' : 'dim'}"><input type="checkbox" style="width:auto;margin:0" data-giderpaid="${x.id}" ${odendi ? 'checked' : ''} ${aktif && !ui.ym ? '' : 'disabled'} title="${ui.ym ? 'Tahmin görünümünde değiştirilemez; Bu aya dönün' : ''}" aria-label="${esc(x.ad)} bu ay ödendi">
        <div class="grow"><b>${icon(C.giderIkon(x.kategori))} ${esc(x.ad)}</b><small>${esc(x.kategori)}${x.gun ? ` · her ayın ${x.gun}. günü` : ''}${x.kalan != null && x.kalan !== '' ? ` · kalan borç ${M(x.kalan)}` : ''}${x.sure > 0 ? ` · ${x.sure} taksit` : ''}${aktif ? '' : (x.baslangic_ym && x.baslangic_ym > curYm0 ? ' · henüz başlamadı' : ' · bitti')}${x.baslangic_ym && x.baslangic_ym > curYm0 ? ` · ${C.fmtYM(x.baslangic_ym)}'den itibaren` : ''}</small></div>
        <span class="amt bad-t">−${M(expenseAmounts.get(x.id) ?? x.tutar)}</span>${readOnly ? '' : `<button class="btn sm" data-act="gider-edit" data-id="${x.id}">Düzenle</button><button class="btn sm danger" data-act="gider-del" data-id="${x.id}" aria-label="Sil">${icon('x')}</button>`}</li>`;
    }).join('');
    const monthLimit = Number(db.ayarlar.harcama_butceleri?.[ym]) || 0;
    const end = C.isoOf(now()), start = new Date(now());
    start.setDate(start.getDate() - 6);
    const spent = C.recordedSpend(db, ym + '-01', readOnly ? C.dueDate(ym, 31) : end);
    const weekly = C.recordedSpend(db, C.isoOf(start), end);
    const incomeKnown = db.ek_gelirler.length > 0, income = sumGelir();
    return `<div class="dash"><div class="dash-head"><div><h1>Bütçem</h1></div>
      <div class="status ${!incomeKnown ? 'warn' : F.toplam > income ? 'bad' : 'ok'}">${incomeKnown ? `<b>Gelir ${M(income)}</b> <span>Sabit gider ${M(F.toplam)} · borç ödemelerinden önce ${M(income - F.toplam)} kalır</span>` : `<b>Gelir eklenmedi</b> <span>Sabit gider ${M(F.toplam)}</span>`}</div></div>
      <div class="dash-cols c3b">
        <section class="dp"><header><h2>Gelirler</h2></header><div class="body" style="padding:0">
          ${gelirler ? `<ul class="list compact">${gelirler}</ul>` : '<div class="empty">Gelir eklenmemiş.</div>'}
          ${readOnly ? '' : '<button class="btn" data-act="gelir-new">Gelir ekle</button>'}</div></section>
        <section class="dp"><header><h2>Sabit giderler</h2>${readOnly ? '' : '<button class="btn sm" data-act="gider-new">Gider ekle</button>'}<span class="muted">${ui.ym ? C.fmtYM(ui.ym) + ' görünümü' : 'Kutuyu işaretleyince bu ay ödendi sayılır'}</span></header>
           <div class="body" style="padding:0;overflow:auto">${giderler ? `<ul class="list compact">${giderler}</ul>` : '<div class="empty">Henüz sabit gider eklemediniz.</div>'}</div>
          <div class="foot">${F.kategoriler.map((k) => `<span>${icon(C.giderIkon(k.kategori))} ${esc(k.kategori)} <b>${M(k.tutar)}</b></span>`).join('') || '<span>Bu ay gider yok</span>'}</div></section>
        <section class="dp"><header><h2>Harcama bütçesi</h2></header><div class="body">
          <p>${C.fmtYM(ym)} · Kayıtlı harcama <b>${M(spent)}</b></p>
          ${monthLimit ? `<p>Hedef ${M(monthLimit)} · ${spent > monthLimit ? 'Aşım' : 'Kalan'} <b>${M(Math.abs(monthLimit - spent))}</b></p>` : '<p>Bu ay için hedef belirlenmedi.</p>'}
          <small>Kart alışverişleri işlem tarihinde, vadesiz hesap çıkışları kaydedildikleri tarihte sayılır.</small>
          ${readOnly ? '' : `<p><button class="btn" data-act="budget-limit">${monthLimit ? 'Hedefi düzenle' : 'Hedef belirle'}</button></p>
          ${window.KesePush?.dayButton() || ''}<p>Son 7 gün · ${M(weekly)}</p><button class="btn sm" data-act="weekly-insight">Haftalık değerlendirme</button>`}
        </div></section>
      </div></div>`;
  }
  const sumGelir = () => C.incomeMonthly(db, C.ymOf(now()));

  // Öneri kartındaki eylem düğmesi: başlığa göre ilgili ekrana götürür
  function recoAction(r) {
    if (/^Aylık gelirinizi ekleyin/.test(r.baslik)) return ['butce', 'Gelir ekle'];
    if (/gecikmiş (borçlarınız|ödemeniz)|Vadesi geçen taksit/i.test(r.baslik)) return ['takvim', 'Gecikenleri göster'];
    return null;
  }
  function recoCard(r) {
    const ic = { kritik: icon('alert'), uyari: icon('warn'), bilgi: icon('info') }, a = recoAction(r);
    return `<div class="reco ${r.seviye}"><div class="ic">${ic[r.seviye]}</div><div><h3>${esc(r.baslik)}</h3><p>${esc(r.aciklama)}</p>${a ? `<button type="button" class="btn sm" data-nav="${a[0]}">${a[1]}</button>` : ''}</div></div>`;
  }
  function recoList(list) { return list.map(recoCard).join(''); }

  // ---------- Borçlarım (tek birleşik kart görünümü) ----------
  function nextUnpaidOf(itemsList) {
    const out = [];
    itemsList.forEach(({ cat, pid, item }) => {
      C.unpaid(item).forEach((t) => {
        out.push({ cat, pid, iid: item.id, no: t.no, vade: t.vade_tarihi, tutar: t.tutar, ym: t.ym, durum: C.installmentStatus(t, now()) });
      });
    });
    out.sort((a, b) => a.vade.localeCompare(b.vade));
    return out[0] || null;
  }
  function progressOfInstallments(itemsList) {
    let total = 0, paid = 0, paidCount = 0, totalCount = 0;
    itemsList.forEach((it) => (it.taksitler || []).forEach((t) => {
      if (t.sigortaOder || t.sigortaGecmis) return;
      const v = Number(t.tutar) || 0;
      total += v; totalCount++;
      if (t.odendi) { paid += v; paidCount++; }
    }));
    const pctVal = total > 0.01 ? (paidCount === totalCount ? 100 : Math.min(99, Math.floor(paid / total * 100))) : 100;
    return { total: C.r2(total), paid: C.r2(paid), pct: pctVal, paidCount, totalCount };
  }
  /** Kart / KMH: sıradaki ekstrenin (en erken ödenmemiş ay ve öncesi) ödenmemiş taksitleri. Gecikmiş (faizli) kalemler hariç; onlar ayrı ödenir. */
  function stmtOf(acc) {
    const rows = [];
    (acc.hareketler || []).forEach((h) => { if (!h.gecikmis) C.unpaid(h).forEach((t) => rows.push({ h, t })); });
    if (!rows.length) return null;
    const ym = rows.reduce((m, x) => (x.t.ym < m ? x.t.ym : m), '9999-99');
    const list = rows.filter((x) => x.t.ym <= ym);
    const vade = list.reduce((m, x) => (x.t.vade_tarihi > m ? x.t.vade_tarihi : m), '');
    return { ym, vade, list, toplam: C.sum(list, ({ t }) => C.installmentBalance(t)) };
  }
  function viewBorclar() {
    const curNow = now(), curYm = C.ymOf(curNow);
    const eldenList = personalDebts(db);
    const counts = {
      KART: db.kredi_kartlari.length,
      KREDI: db.krediler.length,
      KMH: db.kmh_hesaplar.length,
      ELDEN: eldenList.length,
    };
    const totalCount = counts.KART + counts.KREDI + counts.KMH + counts.ELDEN;
    const head = pageHead('Hesaplarım', 'Kartların, vadesiz hesapların, kredilerin ve elden borçların. Eklemek için alttaki + düğmesini kullan.');
    const filters = [
      ['ALL', 'Tümü', totalCount],
      ['KART', 'Kart', counts.KART],
      ['KREDI', 'Kredi', counts.KREDI],
      ['KMH', 'Hesaplar', counts.KMH],
      ['ELDEN', 'Elden', counts.ELDEN],
    ];
    const loanActions = !ui.ym && ui.debtFilter === 'KREDI' ? '<div class="debt-actions loan-entry"><button type="button" class="btn primary" data-act="add-kredi">Kredi ekle</button></div>' : '';
    const filterBar = `<div class="debt-filters" role="tablist" aria-label="Borç filtreleri">${filters.map(([k, l, n]) =>
      `<button type="button" role="tab" class="btn sm${ui.debtFilter === k ? ' primary on' : ''}" data-debt-filter="${k}" aria-selected="${ui.debtFilter === k}">${l} (${n})</button>`).join('')}</div>`;

    const cards = [];
    const want = (k) => ui.debtFilter === 'ALL' || ui.debtFilter === k;

    // 1) Kredi kartları: bu ekstre, son ödeme, asgari, limit kullanımı
    if (want('KART')) {
      db.kredi_kartlari.forEach((a) => {
        const st = stmtOf(a), used = C.cardUsed(a), lim = Number(a.limit) || 0;
        const nxt = nextUnpaidOf((a.hareketler || []).map((h) => ({ cat: 'KART', pid: a.id, item: h })));
        const isLate = nxt && nxt.durum === 'gecikmis';
        const sonraki = st ? C.r2(used - st.toplam) : used;
        const asgari = st && lim > 0 ? C.r2(st.toplam * C.minPaymentRate(lim, S())) : 0;
        const pctUsed = lim > 0 ? Math.min(100, Math.round(used / lim * 100)) : 0;
        const payAct = !ui.ym && st ? `<button type="button" class="btn sm primary" data-act="pay-stmt" data-cat="KART" data-id="${a.id}">Yaptığım ödemeyi kaydet</button>` : '';
        cards.push({
          sortVade: st ? st.vade : '9999-99-99', late: isLate ? 0 : 1,
          html: `<article class="debt-card acct${isLate ? ' is-late' : ''}">
            <div class="debt-card-top"><span class="debt-type-tag">${icon('card')} Kredi kartı</span>${isLate ? '<span class="chip bad">Gecikmiş!</span>' : ''}${a.sigorta_kapsam ? `<span class="chip info">${icon('shield')} Sigorta</span>` : ''}</div>
            <div class="debt-card-head">${a.banka && a.banka !== 'Diğer' ? `<span class="muted">${esc(a.banka)}</span>` : ''}<h3>${esc(a.kart_adi)}</h3></div>
            <div class="debt-card-amt"><strong>${M(st ? st.toplam : 0)}</strong><small>${st ? `Ekstre borcu · son ödeme ${C.fmtDate(st.vade)}` : 'Ödenecek ekstre yok'}</small></div>
            ${asgari > 0 ? `<div class="debt-meta">Asgari ödeme: <b class="warn-t">${M(asgari)}</b></div>` : ''}
            <div class="debt-prog">${lim > 0 ? `<div class="meter${pctUsed > 85 ? ' hot' : ''}" aria-label="Limitin %${pctUsed} kullanılıyor"><i style="width:${pctUsed}%"></i></div>` : ''}<span>${lim > 0 ? `Kullanılan ${M(used)} / ${M(lim)} · kullanılabilir <b>${M(Math.max(0, lim - used))}</b>` : `Kullanılan ${M(used)} · limit girilmedi`}</span></div>
            ${sonraki > 0.5 ? `<div class="debt-meta">${icon('cal')} Sonraki ekstrelere taksitler: <b>${M(sonraki)}</b></div>` : ''}
            <div class="debt-actions">${payAct}<button type="button" class="btn sm" data-act="sel-acc" data-cat="KART" data-id="${a.id}">Detay</button>${ui.ym ? '' : `<button type="button" class="btn sm" data-act="add-har" data-cat="KART" data-pid="${a.id}">Harcama ekle</button>
              <details class="record-actions"><summary>Yönet</summary><div><button type="button" class="btn sm" data-act="edit-hesap" data-cat="KART" data-id="${a.id}">Düzenle</button><button type="button" class="btn sm danger" data-act="del-hesap" data-cat="KART" data-id="${a.id}">Sil</button></div></details>`}</div>
          </article>`,
        });
      });
    }

    // 2) Krediler / taksitli borçlar
    if (want('KREDI')) {
      db.krediler.forEach((kr) => {
        const kalan = C.remainingTotal(kr);
        const prog = progressOfInstallments([kr]);
        const nxt = nextUnpaidOf([{ cat: 'KREDI', pid: 0, item: kr }]);
        const isLate = nxt && nxt.durum === 'gecikmis';
        const key = `KREDI:0:${kr.id}`;
        const bitis = kr.taksitler && kr.taksitler.length ? C.fmtYM(kr.taksitler[kr.taksitler.length - 1].ym) : '';
        const payAct = !ui.ym && nxt
          ? `<button type="button" class="btn sm primary" data-act="pay" data-cat="KREDI" data-pid="0" data-iid="${kr.id}" data-no="${nxt.no}">Ödedim</button>` : '';
        cards.push({
          sortVade: nxt ? nxt.vade : '9999-99-99',
          late: isLate ? 0 : 1,
          html: `<article class="debt-card${isLate ? ' is-late' : ''}${kalan <= 0.01 ? ' is-done' : ''}">
            <div class="debt-card-top">
              <span class="debt-type-tag">${icon('bank')} Kredi</span>
              ${isLate ? '<span class="chip bad">Gecikmiş!</span>' : ''}
              ${kr.sigorta_kapsam ? `<span class="chip info">${icon('shield')} Sigorta ödüyor</span>` : ''}
            </div>
            <div class="debt-card-head">
              ${kr.banka && kr.banka !== 'Diğer' ? `<span class="muted">${esc(kr.banka)}</span>` : ''}
              <h3>${esc(kr.kredi_adi)}</h3>
            </div>
            <div class="debt-card-amt"><strong>${M(kalan)}</strong><small>${kalan <= 0.01 ? 'Kapandı!' : `${prog.totalCount - prog.paidCount} taksit kaldı`}</small></div>
            <div class="debt-prog"><div class="meter" aria-label="%${prog.pct} ödendi"><i style="width:${prog.pct}%"></i></div><span>%${prog.pct} ödendi (${prog.paidCount}/${prog.totalCount})${bitis ? ` · Bitiş ${bitis}` : ''}</span></div>
            <div class="debt-meta">${nxt ? `${icon('cal')} Sıradaki: <b>${C.fmtDate(nxt.vade)}</b> · ${M(nxt.tutar)}` : `${icon('check')} Tüm taksitler ödendi`}</div>
            <div class="debt-actions">${payAct}<button type="button" class="btn sm" data-act="toggle-details" data-key="${key}" aria-haspopup="dialog">Detay</button><button type="button" class="btn sm ghost" data-act="edit-kredi" data-iid="${kr.id}">Düzenle</button>
              <details class="record-actions"><summary>Yönet</summary><div><button type="button" class="btn sm" data-act="add-sig" data-bcat="KREDI" data-bid="${kr.id}">${kr.sigorta_kapsam ? 'Sigorta kapsamı' : 'Sigorta taksitleri ödüyor'}</button>
              <button type="button" class="btn sm danger" data-act="del-kredi" data-iid="${kr.id}">Sil</button></div></details></div>
          </article>`,
        });
      });
    }

    // 3) Vadesiz hesaplar (artı para / KMH dahil)
    if (want('KMH')) {
      db.kmh_hesaplar.forEach((a) => {
        const bak = C.hesapBakiye(a), lim = Number(a.limit) || 0, kul = C.hesapKullanilan(a), faiz = C.hesapAylikFaiz(a, S());
        const nxt = nextUnpaidOf((a.hareketler || []).map((h) => ({ cat: 'KMH', pid: a.id, item: h })));
        const isLate = nxt && nxt.durum === 'gecikmis';
        const pctUsed = lim > 0 ? Math.min(100, Math.round(kul / lim * 100)) : 0;
        const payAct = !ui.ym && nxt ? `<button type="button" class="btn sm primary" data-act="pay" data-cat="KMH" data-pid="${a.id}" data-iid="${nxt.iid}" data-no="${nxt.no}">Taksiti ödedim</button>` : '';
        cards.push({
          sortVade: nxt ? nxt.vade : (bak < 0 ? '9999-00-00' : '9999-99-99'), late: isLate ? 0 : 1,
          html: `<article class="debt-card acct${isLate ? ' is-late' : ''}">
            <div class="debt-card-top"><span class="debt-type-tag">${icon('bank')} Vadesiz hesap</span>${bak < 0 ? '<span class="chip warn">Eksi bakiye</span>' : ''}${isLate ? '<span class="chip bad">Gecikmiş!</span>' : ''}</div>
            <div class="debt-card-head">${a.banka && a.banka !== 'Diğer' ? `<span class="muted">${esc(a.banka)}</span>` : ''}<h3>${esc(a.hesap_adi)}</h3></div>
            <div class="debt-card-amt"><strong class="${bak < 0 ? 'bad-t' : ''}">${bak < 0 ? '−' : ''}${M(Math.abs(bak))}</strong><small>Bakiye${lim > 0 ? ` · kullanılabilir ${M(Math.max(0, bak) + Math.max(0, lim - kul))}` : ''}</small></div>
            ${lim > 0 ? `<div class="debt-prog"><div class="meter${pctUsed > 85 ? ' hot' : ''}" aria-label="Artı paranın %${pctUsed} kullanılıyor"><i style="width:${pctUsed}%"></i></div><span>Artı para: ${M(kul)} / ${M(lim)} kullanılıyor</span></div>` : ''}
            ${faiz > 0 ? `<div class="debt-meta">${icon('warn')} Eksi bakiyeye tahmini aylık faiz: <b class="bad-t">${M(faiz)}</b> (her ayın ${a.hesap_kesim_gunu || 30}. günü)</div>` : ''}
            ${nxt ? `<div class="debt-meta">${icon('cal')} Taksitli avans: <b>${C.fmtDate(nxt.vade)}</b> · ${M(nxt.tutar)}</div>` : ''}
            <div class="debt-actions">${payAct}${bak < 0 && !ui.ym ? `<button type="button" class="btn sm primary" data-act="hesap-giris" data-id="${a.id}" data-tutar="${-bak}">Borcu öde</button>` : ''}<button type="button" class="btn sm" data-act="hesap-giris" data-id="${a.id}">${icon('plus')} Para girişi</button><button type="button" class="btn sm" data-act="sel-acc" data-cat="KMH" data-id="${a.id}">Detay</button>${ui.ym ? '' : `<button type="button" class="btn sm" data-act="add-har" data-cat="KMH" data-pid="${a.id}">Harcama ekle</button>
              <details class="record-actions"><summary>Yönet</summary><div><button type="button" class="btn sm" data-act="edit-hesap" data-cat="KMH" data-id="${a.id}">Düzenle</button><button type="button" class="btn sm danger" data-act="del-hesap" data-cat="KMH" data-id="${a.id}">Sil</button></div></details>`}</div>
          </article>`,
        });
      });
    }

    // 4) Elden borçlar
    if (want('ELDEN')) {
      eldenList.forEach((g) => {
        const kalan = Math.max(0, Number(g.kalan) || 0);
        const odenenAy = (g.odendi_aylar || []).length;
        const paidBuAy = (g.odendi_aylar || []).includes(curYm);
        const aylik = Math.min(kalan || Number(g.tutar) || 0, Number(g.tutar) || kalan || 0);
        const baslangic = Math.max(kalan, Number(g.baslangic_kalan) || (kalan + odenenAy * (Number(g.tutar) || 0)));
        const pctVal = baslangic > 0.01 ? (kalan <= 0.01 ? 100 : Math.min(99, Math.floor((baslangic - kalan) / baslangic * 100))) : (kalan <= 0.01 ? 100 : 0);
        const vadeYm = paidBuAy ? C.ymAdd(curYm, 1) : curYm;
        const vade = C.dueDate(vadeYm, g.gun || 15);
        const isLate = !paidBuAy && kalan > 0.01 && vade < C.isoOf(curNow);
        const payAct = !ui.ym && !paidBuAy && kalan > 0.01
          ? `<button type="button" class="btn sm primary" data-act="pay-elden" data-id="${g.id}">Ödedim</button>` : '';
        const closeAct = !ui.ym && kalan > 0.01
          ? `<button type="button" class="btn sm ghost" data-act="early-close-elden" data-id="${g.id}">Erken Kapattım</button>` : '';
        cards.push({
          sortVade: kalan > 0.01 ? vade : '9999-99-99',
          late: isLate ? 0 : 1,
          html: `<article class="debt-card${isLate ? ' is-late' : ''}${kalan <= 0.01 ? ' is-done' : ''}">
            <div class="debt-card-top">
              <span class="debt-type-tag">${icon('wallet')} Elden</span>
              ${isLate ? '<span class="chip bad">Gecikmiş!</span>' : ''}
              ${paidBuAy && kalan > 0.01 ? '<span class="chip ok">Bu ay ödendi</span>' : ''}
            </div>
            <div class="debt-card-head">
              <span class="muted">Elden borç</span>
              <h3>${esc(g.ad)}</h3>
            </div>
            <div class="debt-card-amt"><strong>${M(kalan)}</strong><small>${kalan <= 0.01 ? 'Tamamen ödendi!' : `Aylık ${M(g.tutar)}`}</small></div>
            <div class="debt-prog"><div class="meter" aria-label="%${pctVal} ödendi"><i style="width:${pctVal}%"></i></div><span>%${pctVal} ödendi</span></div>
            <div class="debt-meta">${kalan > 0.01 ? `${icon('cal')} Sıradaki: <b>${C.fmtDate(vade)}</b> · ${M(aylik)}` : `${icon('check')} Borç kapandı`}</div>
            <div class="debt-actions">${payAct}${closeAct}<button type="button" class="btn sm" data-act="edit-elden" data-id="${g.id}">Düzenle</button><button type="button" class="btn sm danger" data-act="del-elden" data-id="${g.id}" aria-label="Sil">${icon('x')}</button></div>
          </article>`,
        });
      });
    }

    cards.sort((a, b) => a.late - b.late || a.sortVade.localeCompare(b.sortVade));
    const grid = cards.length
      ? `<div class="debt-grid">${cards.map((c) => c.html).join('')}</div>`
      : `<section class="panel"><div class="empty">Bu filtrede borç görünmüyor.<br><br><button type="button" class="btn" data-debt-filter="ALL">Tümünü göster</button></div></section>`;
    return head + filterBar + loanActions + grid;
  }

  function accountStats(cat, acc) {
    let kullanilan = 0, buAy = 0, odenen = 0;
    acc.hareketler.forEach((h) => {
      kullanilan += C.remainingPrincipal(h);
      C.unpaid(h).forEach((t) => { if (t.ym <= C.ymOf(now())) buAy += C.installmentBalance(t); });
      (h.taksitler || []).forEach((t) => { if (t.odendi && !t.kapatildi && t.ym === C.ymOf(now())) odenen += t.tutar; });
    });
    return { kullanilan: C.r2(kullanilan), buAy: C.r2(buAy), odenen: C.r2(odenen), kalanLimit: C.r2(acc.limit - kullanilan) };
  }

  // ---------- Ayrıntı pencereleri: hesap (kart/KMH) ve taksit listesi ----------
  function fillAcc() {
    const dlg = $('dlg-acc'), x = ui.accDlg, list = x && (x.cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari), sel = list && list.find((y) => y.id === x.id);
    if (!sel) { if (dlg.open) dlg.close(); return; }
    $('acc-title').textContent = x.cat === 'KMH' ? 'Vadesiz hesap' : 'Kredi kartı ayrıntısı';
    $('acc-body').innerHTML = hesapDetailHtml(x.cat, sel);
  }
  function openAcc() {
    const dlg = $('dlg-acc'); fillAcc(); if (!ui.accDlg) return;
    dlg.onclose = () => { ui.accDlg = null; }; if (!dlg.open) dlg.showModal();
  }
  function fillInst() {
    const dlg = $('dlg-inst'), key = ui.instDlg, [cat, pid, iid] = String(key || '').split(':'), it = key ? findItem(cat, parseInt(pid), parseInt(iid)) : null;
    if (!it) { if (dlg.open) dlg.close(); return; }
    const kredi = cat === 'KREDI', top = kredi ? C.fmtYM(it.taksitler.length ? it.taksitler[it.taksitler.length - 1].ym : it.ilk_taksit_ym) : '';
    const hasUnpaid = C.unpaid(it).length > 0;
    $('inst-title').textContent = kredi ? `${it.banka && it.banka !== 'Diğer' ? it.banka + ' · ' : ''}${it.kredi_adi}` : (it.aciklama || it.tur);
    $('inst-sub').innerHTML = it.gecikmis ? 'Gecikmiş borç' : `${it.toplam_taksit} taksit · kalan ${M(C.remainingTotal(it))}${kredi && top ? ` · bitiş ${top}` : ''}`;
    const topBar = `<div class="inst-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      ${!ui.ym && hasUnpaid ? `<button type="button" class="btn sm primary" data-act="early-close" data-cat="${cat}" data-pid="${parseInt(pid)}" data-iid="${it.id}">${icon('check')} Borcu Erken Kapattım</button>` : ''}
      ${kredi ? `<button type="button" class="btn sm" data-act="edit-kredi" data-iid="${it.id}">Düzenle</button>` : ''}
      ${kredi ? `<button type="button" class="btn sm" data-act="add-sig" data-bcat="KREDI" data-bid="${it.id}">${icon('shield')} Sigorta ödüyor</button>` : ''}
      ${kredi ? `<button type="button" class="btn sm danger" data-act="del-kredi" data-iid="${it.id}">Sil</button>` : ''}
    </div>`;
    $('inst-body').innerHTML = topBar + `<table class="detailtbl"><tbody>${detailRow(cat, parseInt(pid), it, 1)}</tbody></table>`;
  }
  function openInst() {
    const dlg = $('dlg-inst'); fillInst(); if (!ui.instDlg) return;
    dlg.onclose = () => { ui.instDlg = null; }; if (!dlg.open) dlg.showModal();
  }

  /** Kart / KMH hesabının tüm ayrıntısı (pencere içeriği): özet, gecikme uyarısı, harcama/kullanım tablosu ve düğmeler. */
  function hesapKmhHtml(sel) {
    const bak = C.hesapBakiye(sel), lim = Number(sel.limit) || 0, kul = C.hesapKullanilan(sel), faiz = C.hesapAylikFaiz(sel, S());
    const isl = (sel.islemler || []).slice().sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '') || b.id - a.id);
    const islHtml = isl.length ? `<ul class="list compact">${isl.slice(0, 60).map((x) => `<li><span class="dt">${(x.tarih || '').slice(8)}.${(x.tarih || '').slice(5, 7)}</span><div class="grow"><b>${esc(x.aciklama || (x.yon === 'giris' ? 'Para girişi' : 'Harcama'))}</b><small>${x.yon === 'giris' ? 'Giriş' : 'Çıkış'} · ${C.fmtDate(x.tarih)}</small></div><span class="amt ${x.yon === 'giris' ? 'ok-t' : ''}">${x.yon === 'giris' ? '+' : '−'}${M(x.tutar)}</span>${ui.ym ? '' : `<button type="button" class="btn sm" data-act="edit-islem" data-pid="${sel.id}" data-iid="${x.id}">Düzenle</button><button type="button" class="btn sm ghost" data-act="del-islem" data-pid="${sel.id}" data-iid="${x.id}" aria-label="İşlemi sil">${icon('x')}</button>`}</li>`).join('')}</ul>`
      : '<div class="empty">Henüz işlem yok. Harcama veya para girişi ekleyince burada görünür.</div>';
    const rows = (sel.hareketler || []).map((h) => harRow('KMH', sel, h)).join('');
    return `<section class="panel"><header><div><h2>${esc(sel.banka)} · ${esc(sel.hesap_adi)}</h2><p>Vadesiz hesap${lim > 0 ? ` · artı para limiti ${M(lim)} · faiz ${pct(sel.faiz_orani)} aylık` : ''}</p></div>
        <div><button class="btn sm primary" data-act="hesap-giris" data-id="${sel.id}">${icon('plus')} Para girişi</button><button class="btn sm" data-act="edit-hesap" data-cat="KMH" data-id="${sel.id}">Düzenle</button><button class="btn sm danger" data-act="del-hesap" data-cat="KMH" data-id="${sel.id}">Sil</button></div></header>
        <div class="kv"><div><span>Bakiye</span><b class="${bak < 0 ? 'bad-t' : ''}">${bak < 0 ? '−' : ''}${M(Math.abs(bak))}</b></div>${lim > 0 ? `<div><span>Artı paradan kullanılan</span><b>${M(kul)}</b></div><div><span>Kullanılabilir</span><b>${M(Math.max(0, bak) + Math.max(0, lim - kul))}</b></div>` : ''}${faiz > 0 ? `<div><span>Tahmini aylık faiz + vergi</span><b class="bad-t">${M(faiz)}</b></div>` : ''}</div>
        ${faiz > 0 ? `<div class="note">Eksi bakiyeye her gün faiz işler; banka her ayın ${sel.hesap_kesim_gunu || 30}. günü faizi ve %15 BSMV + %15 KKDF'yi hesaptan çeker. Hesaba para girdikçe önce artı para borcu kapanır.</div>` : ''}
        <h3 class="sub-h">Hesap hareketleri</h3>${islHtml}
        ${rows ? `<h3 class="sub-h">Taksitli KMH / eski kayıtlar</h3><div class="table-wrap"><table><thead><tr><th>Açıklama</th><th>Tarih</th><th class="n">Ana para</th><th class="n">Kalan borç</th><th class="n">Faiz yükü</th><th class="n">Taksit</th><th class="n">Bu ay</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${bekleyenHtml('KMH', sel)}` : ''}
      </section>`;
  }
  function hesapDetailHtml(cat, sel) {
    if (cat === 'KMH') return hesapKmhHtml(sel);
    const st = accountStats(cat, sel);
    const name = cat === 'KMH' ? sel.hesap_adi : sel.kart_adi;
    let extra = '';
    if (cat === 'KART') {
      const m = C.cardMinPayment(sel, now(), S());
      const t = C.minPaymentTrap(m.donemBorcu, sel.faiz_orani, C.vergiFor(S()), m.oran, 0);
      extra = `<div class="kv"><div><span>Dönem borcu (toplam)</span><b>${M(m.toplam)}</b></div>${m.odenen > 0.5 ? `<div><span>Bu ay ödenen</span><b class="ok-t">${icon('check')} ${M(m.odenen)}</b></div><div><span>Ödenecek kalan</span><b>${M(m.donemBorcu)}</b></div>` : ''}
        <div><span>Asgari ödeme (%${Math.round(m.oran * 100)})</span><b class="warn-t">${M(m.asgari)}</b>${m.odenen > 0.5 ? `<small class="${m.kalanAsgari > 0 ? 'warn-t' : 'ok-t'}" style="display:block">${m.kalanAsgari > 0 ? M(m.kalanAsgari) + ' daha ödemelisiniz' : icon('check') + ' asgari karşılandı'}</small>` : ''}</div>
        <div><span>Kesim / son ödeme</span><b>${sel.kesim_gunu}. gün / ${sel.son_odeme_gunu}. gün</b></div></div>
        ${m.donemBorcu > 0 && t.toplamFaiz > 0 ? `<div class="note">Yalnız asgari öderseniz (yeni harcama yapmazsanız) borç yaklaşık <b>${t.ay} ayda</b> biter ve <b>${M(t.toplamFaiz)}</b> faiz ödersiniz.</div>` : ''}`;
    }
    const capMsg = capWarning(cat, sel);
    const gecList = sel.hareketler.filter((h) => h.gecikmis && C.unpaid(h).length).map((h) => ({ h, o: C.overdueInfo(h, now(), C.vergiFor(S())) }));
    const gecNote = gecList.length ? `<div class="note" style="border-top:0;color:var(--bad)">${icon('warn')} Bu ${cat === 'KMH' ? 'hesapta' : 'kartta'} ${gecList.length} gecikmiş borç var: toplam <b>${M(C.sum(gecList, (x) => x.o.toplam))}</b> (faiz ${M(C.sum(gecList, (x) => x.o.faiz))}). Her gün <b>${M(C.sum(gecList, (x) => x.o.gunluk))}</b> büyüyor.</div>` : '';
    const rows = sel.hareketler.map((h) => harRow(cat, sel, h)).join('');
    return `<section class="panel"><header><div><h2>${esc(sel.banka)} · ${esc(name)}</h2><p>${sel.limit > 0 ? `Kalan limit ${M(st.kalanLimit)}` : 'Limit belirtilmedi'} · Faiz ${pct(sel.faiz_orani)} aylık${capMsg}${sel.sigorta_kapsam ? ` · <span class="info-t">${covText(sel, cat)}</span>` : ''}</p></div>
        <div>${cat === 'KART' && stmtOf(sel) && !ui.ym ? `<button class="btn sm primary" data-act="pay-stmt" data-id="${sel.id}">Yaptığım ödemeyi kaydet</button>` : ''}<button class="btn sm" data-act="edit-hesap" data-cat="${cat}" data-id="${sel.id}">Düzenle</button>
        ${cat === 'KART' && !sel.hareketler.length && !ui.ym ? `<button class="btn sm" data-act="opening-statement" data-id="${sel.id}">Mevcut ekstre borcumu gir</button>` : ''}
        <button class="btn sm danger" data-act="del-hesap" data-cat="${cat}" data-id="${sel.id}">Sil</button>
        <button class="btn sm" data-act="add-sig" data-bcat="${cat}" data-bid="${sel.id}" title="Sigorta bu ürünün taksitlerini bir süre sizin yerinize öder">${icon('shield')} Sigorta ödüyor</button>
</div></header>
        ${extra}${gecNote}
        ${rows ? `<div class="table-wrap"><table><thead><tr><th>Açıklama</th><th>Tarih</th><th class="n">Ana para</th><th class="n">Kalan borç</th><th class="n" title="Bu kalem için ödenen ve ödenecek toplam faiz">Faiz yükü</th><th class="n">Taksit</th><th class="n">Bu ay</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
          : `<div class="empty">Bu ${cat === 'KMH' ? 'hesapta' : 'kartta'} kayıtlı ${cat === 'KMH' ? 'kullanım' : 'harcama'} yok.</div>`}
        ${bekleyenHtml(cat, sel)}
        ${cat === 'KART' && (sel.ekstre_odemeleri || []).length ? `<div class="bekleyen"><h3>Ekstre ödemeleri</h3><ul class="list compact">${sel.ekstre_odemeleri.slice().reverse().slice(0, 24).map((x) => `<li><span class="dt">${(x.tarih || '').slice(8)}.${(x.tarih || '').slice(5, 7)}</span><div class="grow"><b>${C.fmtYM(x.ym)} ekstresi</b><small>Dönem borcu ${M(x.toplam)}${x.kalan > 0.005 ? ` · kayıt sonrası kalan ${M(x.kalan)}` : ' · tamamı ödendi'}</small></div><span class="amt">${M(x.tutar)}</span>${ui.ym ? '' : `<button type="button" class="btn sm ghost" data-act="undo-cardpay" data-pid="${sel.id}" data-iid="${x.id}">Geri al</button>`}</li>`).join('')}</ul></div>` : ''}
      </section>`;
  }
  /** Hesaptaki tüm kalemlerin ödenmemiş taksitleri, aylara göre gruplu (bu ay + sonraki aylar; geçmişten kalanlar en üstte). */
  function bekleyenHtml(cat, sel) {
    const nowYm = C.ymOf(now()), map = {};
    sel.hareketler.forEach((h) => C.unpaid(h).forEach((t) => { const k = t.ym < nowYm ? 'gecmis' : t.ym; (map[k] = map[k] || []).push({ h, t }); }));
    const keys = Object.keys(map).sort((x, y) => (x === 'gecmis' ? -1 : y === 'gecmis' ? 1 : x < y ? -1 : 1));
    if (!keys.length) return '';
    const all = keys.reduce((l, k) => l.concat(map[k]), []);
    const groups = keys.map((k) => { const rows = map[k]; return `<div class="bk"><div class="bkh"><b>${k === 'gecmis' ? 'Geçmiş aylardan kalan' : C.fmtYM(k)}</b><span>${rows.length} ödeme · <b>${M(C.sum(rows, ({ t }) => C.installmentBalance(t)))}</b></span></div>
      <ul class="list compact">${rows.map(({ h, t }) => `<li><span class="dt">${t.vade_tarihi.slice(8)}.${t.vade_tarihi.slice(5, 7)}</span><div class="grow"><b>${esc(h.aciklama)}</b><small>${h.gecikmis ? 'Gecikmiş borç' : `${t.no}/${h.toplam_taksit}. taksit`}</small></div>${chip(C.installmentStatus(t, now()))}<span class="amt">${M(C.installmentBalance(t))}</span></li>`).join('')}</ul></div>`; }).join('');
    return `<div class="bekleyen"><h3>${cat === 'KART' ? 'Ekstreler (ödeme ayına göre)' : 'Bekleyen taksitler (aylara göre)'}</h3><p class="muted">Toplam <b>${M(C.sum(all, ({ t }) => C.installmentBalance(t)))}</b> · ${all.length} ödeme · ${keys.length} ay</p>${groups}</div>`;
  }
  function capWarning(cat, acc) {
    const r = R(); if (!r) return '';
    const cap = cat === 'KMH' ? r.nakit_kmh.akdi : r.kart_180bin_ustu.akdi;
    return Number(acc.faiz_orani) > cap + 0.001 ? ` · <span class="warn-t">${icon('warn')} TCMB azami oranı ${pct(cap)}; kayıtlı faiz bunun üstünde, kontrol edin</span>` : '';
  }

  const HAR_LABELS = ['Açıklama', 'Tarih', 'Ana para', 'Kalan borç', 'Faiz yükü', 'Taksit', 'Bu ay', ''];
  /** Tablo satırındaki hücrelere başlık etiketi ekler (dar ekranda satır kart olarak gösterilir). */
  const labelTds = (html, labels) => { let i = 0; return html.replace(/<td(?=[\s>])/g, () => { const l = labels[i++]; return l ? `<td data-label="${l}"` : '<td'; }); };
  function harRow(cat, parent, h) { return labelTds(harRowRaw(cat, parent, h), HAR_LABELS); }
  function hasLinkedCardPayment(card, itemId) {
    return (card.ekstre_odemeleri || []).some((payment) => payment.devreden_id === itemId || (payment.refs || []).some((ref) => ref.hid === itemId));
  }
  function harRowRaw(cat, parent, h) {
    const key = `${cat}:${parent.id}:${h.id}`, open = ui.open === key, v = C.vergiFor(S());
    const faizYuku = C.r2(C.costBreakdown(h, v).reduce((t, c) => t + c.faiz, 0) + (h.odenen_faiz || 0));
    const un = C.unpaid(h).length > 0;
    const linked = cat === 'KART' && hasLinkedCardPayment(parent, h.id);
    const earlyBtn = !ui.ym && un && !sbx.on && !linked ? `<button type="button" class="btn sm ghost" data-act="early-close" data-cat="${cat}" data-pid="${parent.id}" data-iid="${h.id}">Erken Kapattım</button> ` : '';
    const btns = `<button type="button" class="btn sm" data-act="toggle-details" data-key="${key}" aria-haspopup="dialog">${h.gecikmis ? 'Ödemeler' : 'Taksitler'}</button> ` + `${h.gecikmis && un ? `<button class="btn sm primary" data-act="kismi" data-cat="${cat}" data-pid="${parent.id}" data-iid="${h.id}">Ödeme kaydet</button> ` : ''}` +
      (linked ? '<small class="hint">Bu kayıt bir ödemeye bağlı. Düzenlemek veya silmek için ilgili ekstre ödemesini aşağıdan geri al.</small>' : `${earlyBtn}<button class="btn sm" data-act="edit-har" data-cat="${cat}" data-pid="${parent.id}" data-iid="${h.id}">Düzenle</button> ` +
      `<button class="btn sm danger" data-act="del-har" data-cat="${cat}" data-pid="${parent.id}" data-iid="${h.id}">Sil</button>`);
    const kapatBtn = sbx.on && un ? `<button class="btn sm" data-act="kapat-ac" data-cat="${cat}" data-pid="${parent.id}" data-iid="${h.id}" title="Simülasyon: bu borcu kapat">${icon('lock')} Kapat</button> ` : '';
    if (h.gecikmis) {
      const o = C.overdueInfo(h, now(), v);
      return `<tr class="click ${open ? 'sel' : ''}" data-act="toggle" data-key="${key}">
        <td><b>${esc(h.aciklama)}</b> <span class="chip bad">Gecikmiş</span><div class="muted">${un ? `${o.days} gündür gecikmede · günde +${M(o.gunluk)}` : 'Tamamen ödendi'}</div></td>
        <td>${C.fmtDate(h.tarih || h.gecikme_baslangic)}</td><td class="n">${M(h.ana_para)}</td>
        <td class="n"><b>${un ? M(o.toplam) : M(0)}</b>${un ? `<div class="muted">içinde faiz ${M(o.faiz)}</div>` : ''}</td>
        <td class="n">${M(faizYuku)}</td><td class="n">${un ? 'Tek ödeme' : 'Ödendi'}</td><td class="n warn-t">${un ? M(o.toplam) : '-'}</td><td class="n">${kapatBtn}${btns}</td></tr>`;
    }
    const kalan = C.remainingTotal(h), od = h.taksitler.filter((t) => t.odendi).length;
    const buAy = C.sum(C.unpaid(h).filter((t) => t.ym <= C.ymOf(now())), C.installmentBalance);
    const buAyOd = C.sum(h.taksitler.filter((t) => t.odendi && !t.kapatildi && t.ym === C.ymOf(now())), (t) => t.tutar);
    return `<tr class="click ${open ? 'sel' : ''}" data-act="toggle" data-key="${key}">
      <td><b>${esc(h.aciklama)}</b><div class="muted">${esc(h.tur)}</div></td><td>${h.tarih_tahmini ? C.fmtYM(h.tarih.slice(0, 7)) + ' (tahmini)' : C.fmtDate(h.tarih)}</td>
      <td class="n">${M(h.ana_para)}</td><td class="n"><b>${M(kalan)}</b></td><td class="n ${faizYuku > 0 ? 'bad-t' : 'muted'}">${M(faizYuku)}</td><td class="n">${od}/${h.toplam_taksit}</td>${buCell(buAy, buAyOd)}
      <td class="n">${kapatBtn}${btns}</td></tr>`;
  }
  function detailRow(cat, pid, h, span) {
    const v = C.vergiFor(S(), h.kredi_turu);
    if (h.gecikmis) {
      const un = C.unpaid(h).length > 0, o = C.overdueInfo(h, now(), v);
      const hist = (h.odemeler || []).map((x) => `<li><div class="grow">${C.fmtDate(x.tarih)}<small>Faize ${M(x.faize)} · ana paraya ${M(x.anaya)}</small></div><span class="amt">${M(x.tutar)}</span></li>`).join('');
      return `<tr class="detail"><td colspan="${span}">
        ${un ? `<div class="kv" style="padding:0 0 10px"><div><span>Kalan asıl borç</span><b>${M(h.ana_para)}</b></div><div><span>İşlemiş gecikme faizi</span><b class="bad-t">${M(o.faiz)}</b></div><div><span>Bugünkü toplam</span><b>${M(o.toplam)}</b></div><div><span>Günlük artış</span><b class="warn-t">+${M(o.gunluk)}</b></div><div><span>30 gün sonra</span><b>${M(o.toplam + o.aylik)}</b></div></div>` : ''}
        <div class="muted" style="margin-bottom:6px">Yapılan ödemeler (önce faize, sonra ana paraya işlenir):</div>
        ${hist ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${hist}</ul>` : '<div class="muted">Henüz kısmi ödeme yok.</div>'}</td></tr>`;
    }
    const cb = C.costBreakdown(h, v);
    const multiKey = `${cat}:${pid}:${h.id}`, multi = !!(ui.multi && ui.multi.has(multiKey));
    const rows = h.taksitler.map((t, i) => {
      const k = `${multiKey}:${t.no}`, c = cb[i] || { ana: 0, faiz: 0 }, a = `data-cat="${cat}" data-pid="${pid}" data-iid="${h.id}" data-no="${t.no}"`;
      const act = ui.ym || cat === 'KART' ? '' : t.odendi ? `<button type="button" class="btn sm ghost" data-act="unpay" ${a}>Geri al</button>` : `<button type="button" class="btn sm" data-act="pay" ${a}>Ödedim</button>`;
      return `<li>${multi ? `<input type="checkbox" style="width:22px;height:22px;margin:0" data-act="pick" data-k="${k}" ${ui.picked.has(k) ? 'checked' : ''} aria-label="${t.no}. taksidi seç">` : ''}
        <div class="grow">${t.no}/${h.toplam_taksit}. taksit<small>Vade ${C.fmtDate(t.vade_tarihi)} · ana para ${M(c.ana)} + faiz ${M(c.faiz)}</small></div>${chip(C.installmentStatus(t, now()))}<span class="amt">${M(t.tutar)}</span>${act}</li>`;
    }).join('');
    const bulk = multi ? `<button class="btn sm primary" data-act="pay-picked" data-cat="${cat}" data-pid="${pid}" data-iid="${h.id}" data-val="1">Seçilenleri ödendi yap</button>
        <button class="btn sm" data-act="pay-picked" data-cat="${cat}" data-pid="${pid}" data-iid="${h.id}" data-val="0">Seçilenleri geri al</button>
        <button class="btn sm" data-act="pick-all" data-cat="${cat}" data-pid="${pid}" data-iid="${h.id}">Tümünü seç / bırak</button>` : '';
    return `<tr class="detail"><td colspan="${span}"><div class="muted" style="margin-bottom:8px">${cat === 'KART' ? 'Kart taksitleri ekstreyle ödenir: ödemeyi kartın "Yaptığım ödemeyi kaydet" düğmesinden dönem borcu, asgari veya istediğin tutar olarak gir.' : 'Her taksidin ne kadarı ana para, ne kadarı faiz olduğu altta yazar. Ödediğiniz taksidin yanındaki "Ödedim"e basın.'}</div>
      <ul class="list" style="border:1px solid var(--line);border-radius:10px">${rows}</ul>
      <div style="margin-top:10px;display:${cat === 'KART' ? 'none' : 'flex'};gap:8px;flex-wrap:wrap"><button type="button" class="btn sm ghost" data-act="multi-toggle" data-cat="${cat}" data-pid="${pid}" data-iid="${h.id}" aria-expanded="${multi}">${multi ? 'Birden çok seçmeyi kapat' : 'Birden çok seç'}</button>${bulk}</div></td></tr>`;
  }

  // ---------- Faiz yükü (maliyet) ----------
  function viewMaliyet() {
    const cs = C.costSummary(db, S()), t = cs.total;
    if (!cs.rows.length) return pageHead('Faiz maliyeti','Ana para ve faiz dağılımı.') + `<section class="panel"><div class="empty">Henüz borç kaydı yok. Borç ekleyince faiz yükü burada hesaplanır.<br><br>Eklemek için alttaki <b>+</b> düğmesine dokun.</div></section>`;
    const bar = (a, f, label) => {
      const tot = a + f || 1;
      return `<div class="barrow"><div class="lbl"><span>${label}</span><b>${M(a + f)}</b></div><div class="bar"><span class="a" style="width:${a / tot * 100}%">${a / tot > 0.14 ? 'Ana para ' + M(a) : ''}</span><span class="f" style="width:${f / tot * 100}%">${f / tot > 0.14 ? 'Faiz ' + M(f) : ''}</span></div></div>`;
    };
    const oran = t.anaToplam > 0 ? t.faizToplam / t.anaToplam * 100 : 0;
    const row = (r, name) => `<tr><td>${name}</td><td class="n">${M(r.anaToplam)}</td><td class="n bad-t"><b>${M(r.faizToplam)}</b></td><td class="n">${r.anaToplam > 0 ? '%' + (r.faizToplam / r.anaToplam * 100).toFixed(1).replace('.', ',') : '-'}</td>
      <td class="n">${M(r.anaOdenen)}</td><td class="n">${M(r.faizOdenen)}</td><td class="n">${M(r.anaKalan)}</td><td class="n warn-t">${M(r.faizKalan)}</td><td class="n">${r.anaSigorta + r.faizSigorta > 0 ? M(r.anaSigorta + r.faizSigorta) : '-'}</td></tr>`;
    const head = (first) => `<thead><tr><th>${first}</th><th class="n">Kullanılan ana para</th><th class="n">Faiz yükü</th><th class="n" title="Faiz yükü / ana para">Maliyet oranı</th><th class="n">Ödenen ana para</th><th class="n">Ödenen faiz</th><th class="n">Kalan ana para</th><th class="n">Kalan faiz</th><th class="n" title="Sigortanın sizin yerinize ödeyeceği taksitler">Sigorta ödeyecek</th></tr></thead>`;
    const rows = cs.rows.slice().sort((a, b) => b.faizToplam - a.faizToplam).map((r) =>
      row(r, `<b>${esc(r.banka)}</b> · ${esc(r.ad)}${r.gecikmis ? ' <span class="chip bad">Gecikmiş</span>' : ''}<div class="muted">${catName[r.cat]} · ${esc(r.hesap)}</div>`)).join('');
    const banks = Object.keys(cs.banks).sort((a, b) => cs.banks[b].faizToplam - cs.banks[a].faizToplam).map((b) => row(cs.banks[b], `<b>${esc(b)}</b>`)).join('');
    return `${pageHead('Faiz maliyeti', 'Kayıtlı borçlara ve faiz oranlarına göre tahmini dağılım.')}
      <div class="cards">
        <div class="stat"><div class="k">Hesaplanan ana para</div><div class="v">${M(t.anaToplam)}</div><div class="s">Eksik bilgiler varsa varsayılan oranlar kullanılır</div></div>
        <div class="stat"><div class="k">Toplam faiz yükü</div><div class="v bad-t">${M(t.faizToplam)}</div><div class="s">Her 100 ₺ borç için ${oran.toFixed(0)} ₺ faiz</div></div>
        <div class="stat"><div class="k">Şimdiye kadar ödenen</div><div class="v">${M(t.anaOdenen + t.faizOdenen)}</div><div class="s">${M(t.anaOdenen)} ana para + ${M(t.faizOdenen)} faiz</div></div>
        <div class="stat"><div class="k">Sigorta ödeyecek</div><div class="v" style="color:var(--muted)">${M(t.anaSigorta + t.faizSigorta)}</div><div class="s">${M(t.anaSigorta)} ana para + ${M(t.faizSigorta)} faiz · sizden çıkmaz</div></div>
        <div class="stat"><div class="k">Bundan sonra ödenecek</div><div class="v warn-t">${M(t.anaKalan + t.faizKalan)}</div><div class="s">${M(t.anaKalan)} ana para + ${M(t.faizKalan)} faiz</div></div>
      </div>
      <div class="cols2">
      <section class="panel"><header><div><h2>Ana para ve faiz dağılımı</h2><p>Mavi: ana para · Kırmızı: faiz</p></div></header>
        ${bar(t.anaToplam, t.faizToplam, 'Toplam borç')}${bar(t.anaOdenen, t.faizOdenen, 'Şimdiye kadar ödenen')}${bar(t.anaKalan, t.faizKalan, 'Bundan sonra ödenecek')}</section>
      <section class="panel"><header><div><h2>Banka bazında</h2></div></header><div class="table-wrap"><table>${head('Banka')}<tbody>${banks}</tbody></table></div>
        <div class="note">Her taksidin faiz payı, eşit taksit hesabına göre ana para ve faize ayrılır; banka ekstresindeki küçük sapmalar olabilir. Gecikmiş borçta işlemiş gecikme faizi "kalan faiz" sayılır.</div></section>
      </div>
      <section class="panel"><header><div><h2>Kalem kalem</h2><p>Faiz yükü en yüksek olandan başlar. En üstteki kalem sizi en çok yoruyor.</p></div></header>
        <div class="table-wrap"><table>${head('Kalem')}<tbody>${rows}</tbody></table></div></section>`;
  }

  // ---------- Gecikmiş borç / kısmi ödeme ----------
  const gecState = { faizManual: false };
  function accOf(cat, pid) { return (cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === pid); }
  function gecDefaultFaiz(cat, ana) {
    const r = R(); if (!r) return '';
    if (cat === 'KMH') return r.nakit_kmh.gecikme;
    return ana > 180000 ? r.kart_180bin_ustu.gecikme : ana >= 30000 ? r.kart_30_180bin.gecikme : r.kart_30bin_alti.gecikme;
  }
  function openGec(cat, pid, iid) {
    const p = accOf(cat, pid); if (!p) return;
    const it = iid ? p.hareketler.find((x) => x.id === iid) : null;
    gecState.faizManual = !!it;
    $('gec-cat').value = cat; $('gec-pid').value = pid; $('gec-id').value = iid || '';
    $('gec-title').textContent = it ? 'Gecikmiş borcu düzenle' : 'Gecikmiş borç ekle';
    $('gec-sub').textContent = `${p.banka} · ${cat === 'KMH' ? p.hesap_adi : p.kart_adi}`;
    $('gec-ack').value = it ? it.aciklama : ''; $('gec-ana').value = it ? it.ana_para : ''; $('gec-tarih').value = it ? it.tarih || it.gecikme_baslangic : '';
    $('gec-faiz').value = it ? it.gecikme_faiz : gecDefaultFaiz(cat, 0);
    const r = R();
    $('gec-faiz-hint').textContent = r ? `TCMB azami gecikme faizi: ${cat === 'KMH' ? pct(r.nakit_kmh.gecikme) : pct(r.kart_30bin_alti.gecikme) + '–' + pct(r.kart_180bin_ustu.gecikme)} (aylık). Bankanızın sözleşmedeki oranını yazın.` : 'Sözleşmenizdeki aylık gecikme faizi oranı.';
    setErr('gec-ana', 'gec-ana-err', ''); setErr('gec-tarih', 'gec-tarih-err', ''); setErr('gec-faiz', 'gec-faiz-err', '');
    gecLive(); $('dlg-gec').showModal(); $('gec-ack').focus();
  }
  function gecInfo() {
    const ana = num($('gec-ana').value), tarih = $('gec-tarih').value, faiz = num($('gec-faiz').value) || 0;
    if (!(ana > 0) || !tarih) return null;
    const p = accOf($('gec-cat').value, parseInt($('gec-pid').value));
    const existing = p?.hareketler.find((x) => x.id === parseInt($('gec-id').value));
    return C.overdueInfo({ ana_para: ana, tarih, gecikme_baslangic: gecAccrualStart(existing, tarih), gecikme_faiz: faiz, birikmis_faiz: existing?.birikmis_faiz || 0 }, now(), C.vergiFor(S()));
  }
  function gecLive() {
    const o = gecInfo();
    $('gec-live').innerHTML = o ? `<b>${o.days}</b> gündür gecikmede · işlemiş faiz <b class="bad-t">${M(o.faiz)}</b> · bugünkü borç <b>${M(o.toplam)}</b><br>Günde <b>+${M(o.gunluk)}</b> · 30 gün sonra yaklaşık <b>${M(o.toplam + o.aylik)}</b>`
      : 'Tutar ve tarihi girin; faiz otomatik hesaplanır.';
  }
  function gecAccrualStart(existing, date) {
    const originalDue = existing?.tarih || existing?.gecikme_baslangic;
    return existing?.gecikme_baslangic && (date === originalDue || existing.odemeler?.length)
      ? existing.gecikme_baslangic : date;
  }
  function submitGec(e) {
    e.preventDefault();
    const ana = num($('gec-ana').value), tarih = $('gec-tarih').value, faiz = num($('gec-faiz').value) || 0;
    const a = setErr('gec-ana', 'gec-ana-err', !(ana > 0) ? 'Geçerli bir tutar girin.' : '');
    const b = setErr('gec-tarih', 'gec-tarih-err', !tarih ? 'Tarih seçin.' : tarih > C.isoOf(now()) ? 'Gelecek tarih olamaz; gecikme geçmişte başlar.' : '');
    const f = setErr('gec-faiz', 'gec-faiz-err', $('gec-faiz').value.trim() === '' ? 'Aylık gecikme faizini yazın (faizsizse 0).' : !(num($('gec-faiz').value) >= 0 && num($('gec-faiz').value) <= 100) ? 'Faiz 0 ile 100 arasında olmalı.' : '');
    if (!a || !b || !f) return;
    const cat = $('gec-cat').value, p = accOf(cat, parseInt($('gec-pid').value)), id = parseInt($('gec-id').value) || 0;
    const ack = $('gec-ack').value.trim() || 'Gecikmiş borç';
    const ex = id ? p.hareketler.find((x) => x.id === id) : null;
    if (ex) Object.assign(ex, { aciklama: ack, ana_para: ana, gecikme_baslangic: gecAccrualStart(ex, tarih), gecikme_faiz: faiz, faiz_orani: faiz, tarih, ilk_taksit_ym: tarih.slice(0, 7) });
    else p.hareketler.push(C.newOverdueItem({ id: p.hareketler.reduce((m, x) => Math.max(m, x.id), 1000) + 1, aciklama: ack, ana, baslangic: tarih, faiz }, now(), S()));
    $('dlg-gec').close(); save('Kaydedildi.');
  }
  // Normal taksitte "Farklı tutar": ödenen tutar planlıdan az ise fark sonraki takside eklenir, fazla ise sonraki taksitlerden düşülür.
  const kismiNo = () => parseInt($('kismi-no').value) || 0;
  const diffInfo = (it, no) => C.installmentDiffInfo(it.taksitler, no);
  function openDiff(cat, pid, iid, no) {
    const it = findItem(cat, pid, iid); if (!it) return;
    const { t, later } = diffInfo(it, no); if (!t || t.odendi) return;
    $('kismi-cat').value = cat; $('kismi-pid').value = pid; $('kismi-id').value = iid; $('kismi-no').value = no;
    $('kismi-title').textContent = 'Taksidi farklı tutarla öde';
    $('kismi-sub').textContent = `${debtName({ banka: it.banka || (accOf(cat, pid) || {}).banka, aciklama: it.aciklama || it.kredi_adi })} · ${no}/${it.toplam_taksit}. taksit`;
    $('kismi-now').innerHTML = `Planlanan taksit <b>${M(t.tutar)}</b>${later.length ? '' : ' · son taksit olduğu için tutar değiştirilemez'}`;
    $('kismi-hint').textContent = 'Daha az öderseniz aradaki fark sonraki taksite eklenir; daha fazla öderseniz fazlası sonraki taksitlerden düşülür. Geri al düğmesi bir süre ekranda kalır.';
    $('kismi-full').textContent = 'Planlanan tutarı yaz';
    $('kismi-tutar').value = ''; $('kismi-err').textContent = ''; kismiLive();
    $('dlg-kismi').showModal(); $('kismi-tutar').focus();
  }
  function openKismi(cat, pid, iid) {
    const it = findItem(cat, pid, iid), p = accOf(cat, pid); if (!it) return;
    const o = C.overdueInfo(it, now(), C.vergiFor(S()));
    $('kismi-no').value = ''; $('kismi-title').textContent = 'Gecikmiş borca ödeme yap'; $('kismi-full').textContent = 'Tamamını öde';
    $('kismi-hint').textContent = 'Ödeme önce işlemiş faizi kapatır, kalanı ana paradan düşer. Kalan borç için faiz bugünden yeniden işlemeye başlar.';
    $('kismi-cat').value = cat; $('kismi-pid').value = pid; $('kismi-id').value = iid;
    $('kismi-sub').textContent = `${p.banka} · ${it.aciklama}`;
    $('kismi-now').innerHTML = `Kalan asıl borç <b>${M(it.ana_para)}</b> + işlemiş faiz <b class="bad-t">${M(o.faiz)}</b> = <b>${M(o.toplam)}</b>`;
    $('kismi-tutar').value = ''; $('kismi-err').textContent = ''; kismiLive();
    $('dlg-kismi').showModal(); $('kismi-tutar').focus();
  }
  function kismiLive() {
    const it = findItem($('kismi-cat').value, parseInt($('kismi-pid').value), parseInt($('kismi-id').value)); if (!it) return;
    if (kismiNo()) {
      const { t, later } = diffInfo(it, kismiNo()), v = num($('kismi-tutar').value) || 0; if (!t) return;
      const d = C.r2(v - t.tutar);
      $('kismi-live').innerHTML = v > 0 && later.length ? (Math.abs(d) < 0.005 ? 'Planlanan tutarın aynısı.' : d < 0 ? `Eksik <b>${M(-d)}</b> sonraki taksite eklenir.` : `Fazla <b>${M(d)}</b> sonraki taksitlerden düşülür.`) : 'Ödediğiniz tutarı yazın.';
      return;
    }
    const o = C.overdueInfo(it, now(), C.vergiFor(S())), x = Math.min(num($('kismi-tutar').value) || 0, o.toplam);
    const faize = Math.min(x, o.faiz), anaya = Math.min(it.ana_para, x - faize), kalan = o.toplam - x;
    $('kismi-live').innerHTML = x > 0 ? `Faize <b>${M(faize)}</b> · ana paraya <b>${M(anaya)}</b><br>Ödeme sonrası kalan borç: <b>${M(kalan)}</b>${kalan > 0.005 ? ` (günde +${M((it.ana_para - anaya) * C.monthlyRate(it.gecikme_faiz, C.vergiFor(S())) / 30)})` : ' · borç kapanır'}` : 'Ödediğiniz tutarı yazın.';
  }
  function itemLabel(cat, pid, it) {
    if (!it) return 'Borç';
    const b = cat === 'KREDI' ? it.banka : (accOf(cat, pid) || {}).banka;
    const ad = cat === 'KREDI' ? it.kredi_adi : (it.aciklama || it.tur);
    return b && b !== 'Diğer' ? `${b} · ${ad}` : (ad || 'Borç');
  }
  function submitKismi(e) {
    e.preventDefault();
    const cat = $('kismi-cat').value, pid = parseInt($('kismi-pid').value), iid = parseInt($('kismi-id').value);
    const submitBtn = e.submitter || $('form-kismi').querySelector('button[type="submit"]');
    const origin = (lastPayOrigin && lastPayOrigin.x != null) ? lastPayOrigin : btnCenter(submitBtn);
    lastPayOrigin = null;
    if (kismiNo()) {
      const it0 = findItem(cat, pid, iid), x0 = num($('kismi-tutar').value); if (!it0) return;
      const snap = JSON.stringify(db);
      const tBefore = diffInfo(it0, kismiNo()).t;
      const monthlyBefore = tBefore ? Number(tBefore.tutar) || 0 : 0;
      const r = C.applyInstallmentAmount(it0.taksitler, kismiNo(), x0);
      if (!r.ok) {
        if (r.err === 'yok') { $('dlg-kismi').close(); return; }
        $('kismi-err').textContent = r.err === 'tutar' ? 'Ödediğiniz tutarı yazın.' : r.err === 'son' ? `Bu son taksit; tutarı ${M(tBefore.tutar)} olarak ödeyin.` : `Bu taksit ve sonrakilerin toplamı ${M(r.max)}; bundan fazla girilemez.`;
        return;
      }
      const closed = C.unpaid(it0).length === 0;
      const payInfo = Object.assign({ amount: C.r2(x0), debtClosed: closed, debtName: itemLabel(cat, pid, it0), monthlyRelief: closed ? monthlyBefore : 0 }, origin);
      $('dlg-kismi').close(); save('Ödeme kaydedildi.', snap, payInfo); return;
    }
    const it = findItem(cat, pid, iid), o = C.overdueInfo(it, now(), C.vergiFor(S())), x = num($('kismi-tutar').value);
    if (!(x > 0)) { $('kismi-err').textContent = 'Ödediğiniz tutarı yazın.'; return; }
    if (x > o.toplam + 0.01) { $('kismi-err').textContent = `Bugünkü borç ${M(o.toplam)}; bundan fazla tutar girilemez.`; return; }
    const snap = JSON.stringify(db);
    C.applyPartialPayment(it, x, now(), S());
    const closed = C.unpaid(it).length === 0;
    const payInfo = Object.assign({ amount: C.r2(x), debtClosed: closed, debtName: itemLabel(cat, pid, it), monthlyRelief: closed ? C.r2(o.toplam) : 0 }, origin);
    $('dlg-kismi').close(); save('Ödeme kaydedildi.', snap, payInfo);
  }

  // ---------- Sigorta kapsamları ----------
  const PIC = { KREDI: icon('bank'), KART: icon('card'), KMH: icon('bolt') };
  function viewSigortalar() {
    const add = `<button class="btn primary" data-act="add-sig">${icon('plus')} Sigorta kapsamı ekle</button>`;
    const prods = C.coverageProducts(db).filter((p) => p.kapsam);
    if (!prods.length) {
      return `<section class="panel"><div class="empty"><b>Henüz sigorta kapsamı eklemediniz.</b><br>Bazı kredi ve kartlarda sigorta, belirli bir tarihten sonra belirli sayıda ay taksitlerinizi sizin yerinize öder.<br>
        <span class="muted">Örnek: "20 Ekim'den sonraki 6 ay taksitleri sigorta öder".</span><br><br>${add}</div></section>`;
    }
    const rows = prods.map((p) => {
      const k = p.kapsam, inf = C.coverageInfo(db, p.cat, p.id);
      return `<tr><td><b>${esc(p.banka)}</b><div class="muted">${PIC[p.cat]} ${esc(p.ad)}</div></td><td>${esc(k.ad || 'Sigorta')}</td>
        <td class="n">${C.fmtYM(k.ilk_ym)} → ${C.fmtYM(C.ymAdd(k.ilk_ym, k.ay - 1))}</td><td class="n">${k.ay} ay</td><td class="n">${inf.adet}</td><td class="n"><b>${M(inf.tutar)}</b></td>
        <td class="n"><button class="btn sm" data-act="edit-sig" data-bcat="${p.cat}" data-bid="${p.id}">Düzenle</button> <button class="btn sm danger" data-act="del-sig" data-bcat="${p.cat}" data-bid="${p.id}">Kaldır</button></td></tr>`;
    }).join('');
    const toplam = C.sum(prods, (p) => C.coverageInfo(db, p.cat, p.id).tutar);
    return `<section class="panel"><header><div><h2>Sigorta kapsamları</h2><p>Bu aylardaki taksitleri sigorta ödediği için ödeme yükünüze girmez. Sigortanın ödeyeceği toplam: <b>${M(toplam)}</b></p></div>${add}</header>
      <div class="table-wrap"><table><thead><tr><th>Ürün</th><th>Sigorta</th><th class="n">Sigorta ödeyeceği aylar</th><th class="n">Süre</th><th class="n">Taksit sayısı</th><th class="n">Sigortanın ödeyeceği tutar</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="note">Sigortanın ödediği taksitler Takvim'de "Sigorta öder" olarak görünür; bu ay yükünüze, nakit akışına ve tahminlere eklenmez. Ürünün Faiz yükü satırında "Sigorta ödeyecek" olarak ayrı gösterilir.</div></section>`;
  }
  const sigState = { ilkManual: false };
  function sigDefaultFirst() { const t = $('sig-tarih').value; return t ? C.coverageFirstYm(t) : C.ymOf(now()); }
  function openSig(bcat, bid) {
    const prods = C.coverageProducts(db);
    if (!prods.length) { toast('Önce bir kredi, kart veya KMH hesabı ekleyin.', { err: true }); return; }
    const want = bcat ? `${bcat}:${bid}` : '';
    $('sig-urun').innerHTML = prods.map((p) => `<option value="${p.cat}:${p.id}">${esc(p.banka)} · ${esc(p.ad)}${p.kapsam ? ' (kapsam var)' : ''}</option>`).join('');
    if (want && prods.some((p) => `${p.cat}:${p.id}` === want)) $('sig-urun').value = want;
    fillSigForm();
    ['sig-urun', 'sig-sure'].forEach((k) => setErr(k, k + '-err', ''));
    $('dlg-sig').showModal(); $('sig-ad').focus();
  }
  function fillSigForm() {
    const [cat, idS] = $('sig-urun').value.split(':'), p = C.coverageProducts(db).find((x) => x.cat === cat && x.id === parseInt(idS)), k = p && p.kapsam;
    $('sig-title').textContent = k ? 'Sigorta kapsamını düzenle' : 'Sigorta kapsamı ekle';
    $('sig-ad').value = k ? (k.ad || '') : ''; $('sig-tarih').value = k && k.tarih ? k.tarih : C.isoOf(now());
    $('sig-sure').value = k ? k.ay : 6; sigState.ilkManual = !!k;
    fillMonths($('sig-ilk'), k ? k.ilk_ym : sigDefaultFirst());
    $('sig-remove').hidden = !k; sigLive();
  }
  function sigLive() {
    const [cat, idS] = $('sig-urun').value.split(':'), n = parseInt($('sig-sure').value) || 0, ilk = $('sig-ilk').value;
    if (!(n > 0)) { $('sig-live').textContent = 'Kaç ay boyunca ödeyeceğini girin.'; return; }
    const inf = C.coverageInfo(db, cat, parseInt(idS), { ilk_ym: ilk, ay: n });
    $('sig-live').innerHTML = `Sigorta <b>${C.fmtYM(ilk)}</b> – <b>${C.fmtYM(C.ymAdd(ilk, n - 1))}</b> aylarındaki taksitleri öder.<br>` +
      (inf.adet ? `Bu aralıkta <b>${inf.adet}</b> taksit var, toplam <b class="ok-t">${M(inf.tutar)}</b>; bunları siz ödemeyeceksiniz.` : '<span class="warn-t">Bu aralıkta bu ürüne ait ödenmemiş taksit görünmüyor.</span>');
  }
  function submitSig(e) {
    e.preventDefault();
    const n = parseInt($('sig-sure').value) || 0;
    if (!setErr('sig-sure', 'sig-sure-err', !(n >= 1 && n <= 120) ? '1 ile 120 arasında bir ay sayısı girin.' : '')) return;
    const [cat, idS] = $('sig-urun').value.split(':'), h = C.coverageHolder(db, cat, parseInt(idS));
    if (!h) return;
    h.sigorta_kapsam = { tarih: $('sig-tarih').value || C.isoOf(now()), ilk_ym: $('sig-ilk').value, ay: n, ad: $('sig-ad').value.trim() || 'Sigorta' };
    $('dlg-sig').close(); save('Sigorta kapsamı kaydedildi.');
  }

  // ---------- Takvim (Elden borç dahil + "Borç bitiyor" rozetleri) ----------
  const CAL_PAGE = 12;   // 3 sütun x 4 satır
  function calMonths(sum) {
    const thisYm = sum.thisYm, groups = {}, closingByYm = {};
    const add = (key, row) => (groups[key] = groups[key] || { key, rows: [] }).rows.push(row);
    const markClose = (ym, name) => { if (!ym) return; (closingByYm[ym] = closingByYm[ym] || []).push(name); };

    C.items(db).forEach((e) => {
      const it = e.item;
      const un = C.unpaid(it);
      if (un.length > 0) {
        const lastYm = un.reduce((m, t) => (t.ym > m ? t.ym : m), '');
        const closeKey = lastYm < thisYm ? 'gecmis' : lastYm;
        markClose(closeKey, e.cat === 'KREDI' ? it.kredi_adi : it.aciklama);
      }
      (it.taksitler || []).forEach((t) => {
        if (t.kapatildi || t.sigortaGecmis) return;
        const paid = !!t.odendi, covered = !!t.sigortaOder;
        if (paid && t.ym < thisYm) return;                       // geçmiş ayların ödenmişleri gösterilmez
        const key = !paid && !covered && t.ym < thisYm ? 'gecmis' : t.ym;
        add(key, { vade: t.vade_tarihi, durum: paid ? 'odendi' : covered ? 'sigorta' : C.installmentStatus(t, now()), banka: e.banka, cat: e.cat, hesap: e.hesap,
          aciklama: e.cat === 'KREDI' ? it.kredi_adi : it.aciklama, taksitNo: t.no, toplam: it.toplam_taksit, tutar: paid || covered ? t.tutar : C.installmentBalance(t), pid: e.parent ? e.parent.id : 0, iid: it.id });
      });
    });

    // Elden borçları takvime dahil et
    const firstCard = db.kredi_kartlari.length === 1 && !(db.kredi_kartlari[0].hareketler || []).length ? db.kredi_kartlari[0] : null;
    const firstActions = firstCard && !ui.ym ? `<section class="panel first-card-actions"><h2>${esc(firstCard.kart_adi)} hazır</h2>
      <div class="welcome-actions"><button type="button" class="btn primary" data-act="first-spend" data-id="${firstCard.id}">İlk harcamamı ekle</button>
      <button type="button" class="btn" data-act="opening-statement" data-id="${firstCard.id}">Mevcut ekstre borcumu gir</button></div></section>` : '';
    const curNow = now(), todayIso = C.isoOf(curNow);
    personalDebts(db).forEach((g) => {
      const gun = g.gun || 15;
      const paidThis = (g.odendi_aylar || []).includes(thisYm);
      if (paidThis) {
        add(thisYm, { vade: C.dueDate(thisYm, gun), durum: 'odendi', cat: 'ELDEN', eldenId: g.id, banka: '', hesap: 'Elden borç', aciklama: g.ad, tutar: Number(g.tutar) || 0, thisMonth: true });
      }
      let rem = Math.max(0, Number(g.kalan) || 0);
      const stepAmt = Math.max(0.01, Number(g.tutar) || rem || 1);
      const startOff = paidThis ? 1 : 0;
      for (let i = 0; i < 60 && rem > 0.01; i++) {
        const ym = C.ymAdd(thisYm, startOff + i);
        const payAmt = C.r2(Math.min(stepAmt, rem));
        rem = C.r2(rem - payAmt);
        const vade = C.dueDate(ym, gun);
        const isLate = ym === thisYm && vade < todayIso;
        add(ym, { vade, durum: isLate ? 'gecikmis' : (ym === thisYm ? 'bu_ay' : 'bekliyor'), cat: 'ELDEN', eldenId: g.id, banka: '', hesap: 'Elden borç', aciklama: g.ad, tutar: payAmt, thisMonth: ym === thisYm });
        if (rem <= 0.01) markClose(ym, g.ad);
      }
    });

    (db.tek_seferlik || []).forEach((x) => { if (x.ym >= thisYm) add(x.ym, { vade: `${x.ym}-01`, durum: 'tek', ad: x.ad, tutar: x.tutar, birikim: x.birikim }); });
    return Object.keys(groups).sort((a, b) => a === 'gecmis' ? -1 : b === 'gecmis' ? 1 : a.localeCompare(b)).map((k) => {
      const g = groups[k]; g.rows.sort((a, b) => a.vade.localeCompare(b.vade));
      const due = g.rows.filter((r) => r.durum !== 'sigorta');
      g.title = k === 'gecmis' ? 'Önceki aylardan kalanlar' : C.fmtYM(k);
      g.toplam = C.sum(due, (r) => r.tutar); g.odenen = C.sum(due.filter((r) => r.durum === 'odendi'), (r) => r.tutar);
      g.adet = due.length; g.sigorta = g.rows.filter((r) => r.durum === 'sigorta').length;
      g.closing = closingByYm[k] || [];
      g.closingCount = g.closing.length;
      g.rows = groupCardRows(g.rows, 'pid').sort((a, b) => a.vade.localeCompare(b.vade)); g.adet = g.rows.filter((r) => r.durum !== 'sigorta').length;
      return g;
    });
  }
  const calRowsHtml = (g) => `<ul class="list compact">${g.rows.map((r) => {
    if (r.durum === 'tek') {
      return `<li><span class="dt">${r.vade.slice(8)}.${r.vade.slice(5, 7)}</span><div class="grow"><b>${esc(r.ad)}</b><small>Tek seferlik${r.birikim ? ' · birikimden' : ''}</small></div><span class="amt">${M(r.tutar)}</span></li>`;
    }
    if (r.cat === 'ELDEN') {
      const act = !ui.ym && r.durum !== 'odendi' && r.thisMonth ? `<button type="button" class="btn sm primary" data-act="pay-elden" data-id="${r.eldenId}">Ödedim</button>` : '';
      return `<li class="${r.durum === 'odendi' ? 'dim' : ''}"><span class="dt">${r.vade.slice(8)}.${r.vade.slice(5, 7)}</span><div class="grow"><b>${esc(r.aciklama)}</b><small>Elden borç</small></div>${chip(r.durum)}<span class="amt">${M(r.tutar)}</span>${act}</li>`;
    }
    const label = r.banka && r.banka !== 'Diğer' ? `${r.banka} · ${r.aciklama}` : r.aciklama;
    if (r.stmt) return `<li class="${r.durum === 'odendi' ? 'dim' : ''}"><span class="dt">${r.vade.slice(8)}.${r.vade.slice(5, 7)}</span><div class="grow"><b>${esc(label)}</b><small>Kart ekstresi · ${r.adet} kalem</small></div>${chip(r.durum)}<span class="amt">${M(r.tutar)}</span>${stmtBtn(r)}</li>`;
    return `<li class="${r.durum === 'odendi' ? 'dim' : ''}"><span class="dt">${r.vade.slice(8)}.${r.vade.slice(5, 7)}</span><div class="grow"><b>${esc(label)}</b><small>${catName[r.cat]} · ${esc(r.hesap)} · ${r.taksitNo}/${r.toplam}</small></div>${chip(r.durum)}<span class="amt ${r.durum === 'sigorta' ? 'muted' : ''}">${M(r.tutar)}</span>${['odendi', 'sigorta'].includes(r.durum) ? '' : payBtn({ cat: r.cat, parentId: r.pid, itemId: r.iid, taksitNo: r.taksitNo })}</li>`;
  }).join('')}</ul>`;
  /** Takvimdeki aylar için nakit durumu (gelir varsa). Tek seferde hesaplanır. */
  function cashMap(keys) {
    if (!db.ek_gelirler.length) return {};
    const thisYm = C.ymOf(now()), fut = keys.filter((k) => k !== 'gecmis' && k > thisYm), out = {};
    if (keys.includes(thisYm)) out[thisYm] = C.monthCash(db, now(), thisYm, S());
    if (fut.length) {
      const last = fut.reduce((m, k) => (k > m ? k : m), thisYm);
      C.forecast(db, now(), S(), C.monthsBetween(thisYm, last)).forEach((r) => { if (fut.includes(r.ym)) out[r.ym] = { ym: r.ym, gelir: r.gelir, borc: r.borc, gider: r.sabit, tek: r.tek, aySonu: r.kalan }; });
    }
    return out;
  }
  const cashLine = (c) => (c ? `<small class="cash-mini ${c.aySonu < -0.005 ? 'bad-t' : 'ok-t'}">${c.aySonu < -0.005 ? `${M(-c.aySonu)} açık` : `Ay sonu +${M(c.aySonu)} kalır`}</small>` : '');
  function cashBreakdown(c) {
    if (!c) return db.ek_gelirler.length ? '' : `<div class="cash-tip">${icon('wallet')} Gelirini eklersen her ay ödemelerden sonra elinde ne kalacağını burada görürsün. <button type="button" class="btn sm" data-nav="butce">Gelir ekle</button></div>`;
    const r = (l, v, cls) => `<div class="cash-row${cls ? ' ' + cls : ''}"><span>${l}</span><b${v < -0.005 ? ' class="bad-t"' : ''}>${v < -0.005 ? '−' : ''}${M(Math.abs(v))}</b></div>`;
    return `<div class="cash-body boxed">${r('Gelir', c.gelir)}${r('Borç ödemeleri', -c.borc)}${r('Sabit giderler', -c.gider)}${c.tek > 0.005 ? r('Tek seferlik', -c.tek) : ''}${c.buAy ? r('Şu an elinde (ödenenlerden sonra)', c.elde, 'total') : ''}${r('Ay sonunda kalacak', c.aySonu, 'total big')}</div>`;
  }
  /** Takvim kartına tıklanınca açılan pencerenin içeriği: seçili ayın ödemeleri (veri değişince render() yeniler). */
  function fillCal(sum) {
    const dlg = $('dlg-cal'), g = calMonths(sum).find((x) => x.key === ui.calDlg);
    if (!g) { ui.calDlg = null; if (dlg.open) dlg.close(); return; }
    $('cal-title').textContent = g.title;
    $('cal-sub').innerHTML = `${g.adet} ödeme · ${M(g.toplam)}${g.odenen > 0.5 ? ` · ${M(g.odenen)} ödendi` : ''}${g.closingCount ? ` · 🏆 ${g.closingCount} borç bitiyor!` : ''}`;
    const v = g.key === 'gecmis' ? null : C.monthView(db, new Date(), g.key, S());
    const r = (l, x, cls) => `<div class="cash-row${cls ? ' ' + cls : ''}"><span>${l}</span><b${x < -0.005 ? ' class="bad-t"' : ''}>${x < -0.005 ? '−' : ''}${M(Math.abs(x))}</b></div>`;
    const box = v ? `<div class="cash-body boxed">${db.ek_gelirler.length ? r('Gelir', v.gelir) : ''}${r('Borç ödemeleri', -v.borc)}${v.gider > 0.005 ? r('Sabit giderler', -v.gider) : ''}${v.faiz > 0.005 ? r('Artı para faizi (tahmini)', -v.faiz) : ''}${v.tek > 0.005 ? r('Tek seferlik', -v.tek) : ''}${r('Toplam ödeme', -v.toplamOdeme, 'total')}${db.ek_gelirler.length ? r('Ödemelerden sonra kalan', v.kalan, 'total big') : ''}</div>`
      + (g.closingCount ? `<p class="hint" style="margin:0 0 10px">🏆 Bu ay biten: <b>${esc(g.closing.join(', '))}</b></p>` : '') : '';
    $('cal-body').innerHTML = box + calRowsHtml(g);
  }
  function viewTakvim(sum) {
    const all = calMonths(sum);
    if (!all.length) return pageHead('Ödeme takvimim', 'Ay ay ödemelerin.') + `<section class="panel"><div class="empty">${hasDebt(db) ? 'Ödenmeyi bekleyen taksit yok. Tüm borçların ödenmiş görünüyor!' : 'Henüz borç eklemedin. Borçlarını ekleyince ödemeler ay ay burada görünür.'}<br><br>Eklemek için alttaki <b>+</b> düğmesine dokun.</div></section>`;
    const pages = Math.ceil(all.length / CAL_PAGE);
    ui.calPage = Math.min(Math.max(0, ui.calPage || 0), pages - 1);
    const list = all.slice(ui.calPage * CAL_PAGE, (ui.calPage + 1) * CAL_PAGE);
    const mvOf = (k) => (k === 'gecmis' ? null : C.monthView(db, new Date(), k, S()));
    const gelirVar = db.ek_gelirler.length > 0;
    const cards = list.map((g) => {
      const v = mvOf(g.key), top = v ? v.toplamOdeme : g.toplam;
      const parts = v ? [v.borc > 0.005 ? `borç ${M(v.borc)}` : '', v.gider > 0.005 ? `gider ${M(v.gider)}` : '', v.faiz > 0.005 ? `faiz ${M(v.faiz)}` : ''].filter(Boolean).join(' · ') : `${g.adet} ödeme`;
      const kalan = v && gelirVar ? `<div class="mc-row"><span>Ödemelerden sonra kalan</span><b class="${v.kalan < -0.005 ? 'bad-t' : 'ok-t'}">${v.kalan < -0.005 ? '−' : '+'}${M(Math.abs(v.kalan))}</b></div>` : '';
      const biten = g.closingCount ? `<div class="mc-win">🏆 Biten: ${esc(g.closing.slice(0, 3).join(', '))}${g.closing.length > 3 ? ` +${g.closing.length - 3}` : ''}</div>` : '';
      return `<button type="button" class="mcal mc2 ${g.key === 'gecmis' ? 'warn' : ''}${g.closingCount ? ' has-win' : ''}" data-act="cal-open" data-cal="${g.key}" aria-haspopup="dialog">
        <div class="mc-head"><b>${esc(g.title)}</b><span class="muted">${g.adet} ödeme${g.sigorta ? ` · ${icon('shield')} ${g.sigorta}` : ''}</span></div>
        <div class="mc-row main"><span>${g.key === 'gecmis' ? 'Ödenmemiş' : 'Toplam ödeme'}</span><b>${M(top)}</b></div>
        <small class="mc-sub">${parts}${g.odenen > 0.5 ? ` · <span class="ok-t">${M(g.odenen)} ödendi</span>` : ''}</small>
        ${kalan}${biten}</button>`;
    }).join('');
    const from = list[0].key === 'gecmis' ? 'Önceki aylar' : C.fmtYM(list[0].key), to = list[list.length - 1].key === 'gecmis' ? 'Önceki aylar' : C.fmtYM(list[list.length - 1].key);
    const nav = `<div class="calnav"><button class="btn sm" data-act="cal-page" data-d="-1" ${ui.calPage <= 0 ? 'disabled' : ''}>‹ Önceki</button><span>${from} – ${to} <span class="muted">· sayfa ${ui.calPage + 1}/${pages}</span></span><button class="btn sm" data-act="cal-page" data-d="1" ${ui.calPage >= pages - 1 ? 'disabled' : ''}>Sonraki ›</button>
      </div>`;
    const tip = gelirVar ? '' : `<div class="cash-tip">${icon('wallet')} Gelirini eklersen her ayın kartında ödemelerden sonra elinde ne kalacağını görürsün. <button type="button" class="btn sm" data-nav="butce">Gelir ekle</button></div>`;
    return pageHead('Ödeme takvimim', 'Her ay ne kadar ödüyorsun, hangi borç ne zaman bitiyor, ödemelerden sonra ne kalıyor. Ayrıntı için bir aya dokun.') + tip + (pages > 1 ? nav : '') + `<div class="calgrid">${cards}</div>`;
  }

  const shortYm = (ym) => { const [y, m] = ym.split('-').map(Number); return `${C.AYLAR[m].slice(0, 3)} ${String(y).slice(2)}`; };
  const n0 = (v) => Math.round(v).toLocaleString('tr-TR');

  // ---------- Öneriler ----------
  function viewOneriler() {
    const list = C.recommendations(db, now(), S(), R(), ui.ym ? C.fmtYM(ui.ym) : 'Bu ay');
    return pageHead('Öneriler', 'Mevcut verilerinizden hesaplanır. Kural tabanlıdır; yatırım veya hukuki tavsiye değildir.') +
      `<div class="recogrid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">${recoList(list)}</div>
       <div class="note" style="margin-top:14px;padding:0">Rakamlar kayıtlı faiz oranlarına ve ayarlardaki vergi çarpanına dayanır. Yeni kredi önerilerinde tahsis ücreti, sigorta ve erken kapama bedeli hesaba katılmaz; bankadan yazılı teklif alın.</div>`;
  }

  // ---------- Ayarlar ----------
  const SET_LIMITS = { vergi_carpani: [1, 3], vergi_carpani_konut: [1, 3], asgari_limit_esigi: [0, 1e9], asgari_oran_alt: [0, 100], asgari_oran_ust: [0, 100], aylik_borc_butcesi: [0, 1e9] };
  function viewAyarlar() {
    const s = S(), r = R();
    const field = (k, label, step, hint) => `<label>${label}<input type="text" data-fmt="1" value="${s[k] ?? 0}" data-set="${k}" inputmode="decimal">${hint ? `<small class="hint">${hint}</small>` : ''}</label>`;
    const elle = (k, label) => `<label>${label}<input type="text" data-fmt="1" value="${s.elle_oranlar[k] ?? 0}" data-elle="${k}" inputmode="decimal"></label>`;
    const rateTbl = r ? `<div class="table-wrap"><table><thead><tr><th>Kalem</th><th class="n">Azami faiz (aylık)</th><th class="n">Azami gecikme (aylık)</th></tr></thead><tbody>
      <tr><td>Kart · dönem borcu 30.000 TL altı</td><td class="n">${pct(r.kart_30bin_alti.akdi)}</td><td class="n">${pct(r.kart_30bin_alti.gecikme)}</td></tr>
      <tr><td>Kart · 30.000–180.000 TL</td><td class="n">${pct(r.kart_30_180bin.akdi)}</td><td class="n">${pct(r.kart_30_180bin.gecikme)}</td></tr>
      <tr><td>Kart · 180.000 TL üzeri / kurumsal</td><td class="n">${pct(r.kart_180bin_ustu.akdi)}</td><td class="n">${pct(r.kart_180bin_ustu.gecikme)}</td></tr>
      <tr><td>Nakit çekim, kart nakit avans ve KMH</td><td class="n">${pct(r.nakit_kmh.akdi)}</td><td class="n">${pct(r.nakit_kmh.gecikme)}</td></tr>
      <tr><td>Yabancı para kart</td><td class="n">${pct(r.yabanci_para.akdi)}</td><td class="n">${pct(r.yabanci_para.gecikme)}</td></tr></tbody></table></div>
      <div class="note">TCMB geçerlilik tarihi: ${C.fmtDate(r.gecerlilik)} · Son çekilme: ${esc(rates.cekildi || '-')} · Referans oran ${pct(r.referans)}</div>` : '<div class="empty">Oranlar alınamadı.</div>';

    const sigProds = C.coverageProducts(db).filter((p) => p.kapsam);
    const sigSection = sigProds.length ? viewSigortalar() : '';

    return `${pageHead('Ayarlar & Yedek', 'Verini güvenle sakla ve uygulama tercihlerini yönet.')}
      <button type="button" class="btn settings-tools" data-nav="dahafazla">${icon('list')} Tüm araçlar</button>
      <div class="setgrid">
        <div class="setcol">
          <section class="panel"><header><div><h2>Veriler ve yedekler</h2><p>${KeseStore.mode === 'local' ? 'Kayıtlar bu cihazda saklanır. Yedek indirip istediğin zaman geri yükleyebilirsin.' : 'Kayıtlar bu bilgisayarda Kese_data.json dosyasında tutulur.'}</p></div></header>
            <div class="pad" style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="btn primary" data-act="export">${icon('download')} Yedek indir</button>
              <button type="button" class="btn" data-act="import">${icon('upload')} Yedek yükle</button>
              <input id="imp-file" type="file" accept=".json,application/json" hidden>
              ${KeseStore.mode === 'local' ? `<button type="button" class="btn danger" data-act="wipe">${icon('x')} Tüm verileri sil</button>` : ''}
            </div>
          </section>
          ${accountPanelHtml()}
        </div>
        <div class="setcol">
          <section class="panel"><header><div><h2>Ses efektleri</h2><p>Ödeme kutlamaları ve dokunuş seslerini aç veya kapat.</p></div></header>
            <div class="pad"><button type="button" class="btn" data-act="ses-toggle"></button></div>
          </section>
          ${sbx.on ? '' : window.KesePush?.panel() || ''}
          ${sigSection}
        </div>
      </div>
      <details class="adv-settings">
        <summary>Gelişmiş banka ve faiz ayarları</summary>
        <div class="adv-settings-body">
          <section class="panel"><header><div><h2>Güncel faiz oranları (TCMB)</h2><p>Kayıtlı TCMB azami oranları ve kredi tahminleri burada görünür.</p></div>
            <button type="button" class="btn sm" data-act="refresh-rates">Şimdi güncelle</button></header>
            <div class="pad"><div id="rate-chip" class="rate-chip" role="status"></div></div>
            ${rates && rates.hata ? `<div class="note warn-t">Güncelleme hatası: ${esc(rates.hata)}${rates.durum === 'eski' ? ' (son bilinen değerler gösteriliyor)' : ''}</div>` : ''}
            ${rateTbl}
            <div class="pad fgrid">${elle('ihtiyac_kredisi', 'İhtiyaç kredisi ort. (aylık %)')}${elle('tasit_kredisi', 'Taşıt kredisi ort. (aylık %)')}${elle('konut_kredisi', 'Konut kredisi ort. (aylık %)')}</div>
          </section>
          <section class="panel"><header><div><h2>Hesaplama varsayımları</h2><p>Yalnızca ne yaptığından eminsen değiştir.</p></div></header>
            <div class="pad fgrid">
              ${field('aylik_borc_butcesi', 'Aylık borç bütçesi (₺)', 100, '0 bırakırsan gelir − sabit giderler kullanılır.')}
              ${field('vergi_carpani', 'Vergi çarpanı (KKDF + BSMV)', 0.01, 'Varsayılan 1,30.')}
              ${field('vergi_carpani_konut', 'Konut kredisi vergi çarpanı', 0.01, '')}
              ${field('asgari_limit_esigi', 'Asgari ödeme limit eşiği (₺)', 1000, 'BDDK limiti: altındaysa %20, üstündeyse %40.')}
              ${field('asgari_oran_alt', 'Asgari oranı · eşik altı (%)', 1, '')}
              ${field('asgari_oran_ust', 'Asgari oranı · eşik üstü (%)', 1, '')}
            </div>
          </section>
        </div>
      </details>`;
  }

  // ---------- Ana render ----------
  /** Çok sütunlu tablolara (4+ sütun) başlık etiketleri ekler; dar ekranda satırlar kart olarak dizilir (ui-fix.css: table.stack). */
  function stackTables(root) {
    if (!root) return;
    root.querySelectorAll('.table-wrap table').forEach((tb) => {
      const heads = [...tb.querySelectorAll('thead th')].map((th) => th.textContent.trim());
      if (heads.length < 4) return;
      tb.classList.add('stack');
      tb.querySelectorAll('tbody tr').forEach((tr) => [...tr.children].forEach((td, i) => { if (heads[i] && !td.hasAttribute('data-label') && !td.hasAttribute('colspan')) td.setAttribute('data-label', heads[i]); }));
    });
  }
  function render(paymentInfo = false) {
    if (!db) return;
    const real = db, realNow = new Date(), realYm = C.ymOf(realNow);
    if (ui.ym && ui.ym <= realYm) ui.ym = null;
    if (ui.ym && ui.view !== 'pano') ui.ym = null;
    C.refreshOverdue(real, realNow, S());
    C.markCoverage(real, realNow);
    renderSimUi(real, realNow);
    $('main').classList.toggle('dash-mode', ui.view === 'pano' || ui.view === 'butce');
    renderMonthBar(real, realNow);
    if (ui.ym) { const [y, m] = ui.ym.split('-').map(Number); db = C.projectDb(real, ui.ym, realNow); viewDate = new Date(y, m - 1, 1); projecting = true; }
    try {
      const sum = C.summarize(db, now(), S());
      renderNav(sum);
      {
        const hd = hasDebt(db) || sbx.on;
        const simBtn = $('sim-toggle'); if (simBtn) simBtn.hidden = !hd;
        const stb = $('simtab'); if (stb) stb.style.display = hd ? '' : 'none';
      }
      renderSyncChip();
      const isPay = !!paymentInfo;
      const payCtx = paymentInfo && typeof paymentInfo === 'object' ? paymentInfo : {};
      const v = { ozet: () => viewHome(sum), pano: () => viewOzet(sum), butce: viewButce, borclar: viewBorclar, maliyet: viewMaliyet, takvim: () => viewTakvim(sum), oneriler: viewOneriler, ayarlar: viewAyarlar, dahafazla: viewMore }[ui.view] || (() => viewHome(sum, isPay));
      const active = document.activeElement && document.activeElement.id;
      $('view').innerHTML = v();
      stackTables($('view'));
      try { document.dispatchEvent(new CustomEvent('kese:render', { detail: { view: ui.view, paymentCompleted: isPay } })); } catch (e) { /* yok say */ }
      if (tourPending && (document.querySelector('#tw-kart') || document.querySelector('.mcard-home'))) { tourPending = false; launchTour(); }
      renderRateChip();
      renderSesBtn();
      if (window.KeseLive) {
        const livePayload = {
          view: ui.view, db, now: now(), paymentCompleted: isPay,
          amount: payCtx.amount || 0,
          event: (typeof payCtx.x === 'number' && typeof payCtx.y === 'number') ? { x: payCtx.x, y: payCtx.y } : undefined,
          debtClosed: payCtx.debtClosed ? { name: payCtx.debtName || 'Borç', monthlySaved: payCtx.monthlyRelief || 0 } : false,
        };
        KeseLive.afterRender(livePayload);
      }
      if (ui.calDlg) fillCal(sum);
      if (ui.accDlg && $('dlg-acc') && $('dlg-acc').open) fillAcc();
      if (ui.instDlg && $('dlg-inst') && $('dlg-inst').open) fillInst();
      if (active && $(active)) { const el = $(active); el.focus(); if (el.setSelectionRange && el.type === 'text') try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* yok say */ } }
    } finally { db = real; projecting = false; viewDate = null; }
  }

  // ---------- Üst ay çubuğu: bu ay + gelecek ay tahminleri ----------
  function renderMonthBar(real, realNow) {
    const bar = $('monthbar'); bar.classList.remove('compact');
    if (!C.items(real).length || ui.view !== 'pano') { bar.innerHTML = ''; bar.style.display = 'none'; return; }
    bar.style.display = '';
    const oldRow = bar.querySelector('.mrow'), keepLeft = oldRow ? oldRow.scrollLeft : 0;
    const sum = C.summarize(real, realNow, S()), F = C.fixedSummary(real, realNow);
    const curKalan = C.r2(sum.gelir - F.toplam - sum.buAyToplam - (sum.tekSeferlik || 0));
    // Son taksit bitene kadar (en az 6, en çok 120 ay)
    const thisYm = C.ymOf(realNow);
    let endYm = thisYm;
    C.items(real).forEach((e) => (e.item.taksitler || []).forEach((t) => { if (!t.odendi && t.ym > endYm) endYm = t.ym; }));
    const n = Math.max(6, Math.min(120, C.monthsBetween(thisYm, endYm)));
    const fc0 = C.forecast(real, realNow, S(), n);
    // Asgari modu: kartlarda yalnız asgari ödenir, kalan faizle devreder; kredi/KMH taksitleri tam
    const mp = ui.asgari ? C.minPayPlan(real, realNow, S(), n) : null;
    const fc = mp ? fc0.map((r, i) => { const m = mp.aylar[i + 1]; return m ? Object.assign({}, r, { borc: m.toplam, kalan: m.kalan }) : r; }) : fc0;
    const curK2 = mp ? mp.aylar[0].kalan : curKalan, curB2 = mp ? mp.aylar[0].toplam : sum.buAyToplam;
    const sg = (v) => (v > 0.5 ? '+' : v < -0.5 ? '−' : '') + M(Math.abs(v));
    const n0b = (v) => Math.round(v).toLocaleString('tr-TR');
    const incomeKnown = real.ek_gelirler.length > 0;
    const card = (ym, label, kalan, g, gd, b, cur, title) => `<button type="button" class="mcard ${cur ? 'cur' : ''} ${(ui.ym || null) === (cur ? null : ym) ? 'sel' : ''} ${incomeKnown && kalan < 0 ? 'neg' : ''}" data-act="pick-ym" data-ym="${cur ? '' : ym}" title="${esc(incomeKnown ? title : 'Borç ödemeleri. Ay sonu hesabı için gelir girin.') }" aria-pressed="${(ui.ym || null) === (cur ? null : ym)}">
      <span class="m">${label}</span>${incomeKnown ? `<span class="big ${kalan < 0 ? 'bad-t' : 'ok-t'}">${sg(kalan)}</span><span class="one"><b class="ok-t">+${n0b(g)}</b> <b class="bad-t">−${n0b(gd)}</b> <b class="bad-t">−${n0b(b)}</b></span>` : `<span class="big">${M(b)}</span><span class="one">Borç ödemesi</span>`}</button>`;
    const legend = '\n+ gelir · − sabit gider · − borç taksitleri' + (mp ? ' (asgari modu: kartlarda yalnız asgari ödenir)' : '');
    const cards = card(thisYm, `${sbx.on ? 'Simülasyon · ' : ''}${C.fmtYM(thisYm)} · şimdi`, curK2, sum.gelir, F.toplam, curB2, true, 'Bu ayın gerçek durumu (ay sonu kalan para)' + legend)
      + fc.map((r) => card(r.ym, C.fmtYM(r.ym), r.kalan, r.gelir, r.sabit, r.borc, false, `Tahmin: ${C.fmtYM(r.ym)} görünümüne geç (ay sonu kalan para)${legend}${r.sigorta > 0 ? '\nSigorta ödeyecek: ' + M(r.sigorta) : ''}${r.bitenler.length ? '\nBiter: ' + r.bitenler.join('\nBiter: ') : ''}`)).join('');
    // Tahmin görünümü uyarısı satırı büyütmesin: aynı satırda küçük bir etiket
    const chipHtml = ui.ym ? `<div class="mchip" title="${C.fmtYM(ui.ym)} tahmin görünümü: bu aydan önceki ödemelerin yapıldığı varsayılır."><b>${icon('trend')} Tahmin · Salt okunur</b><button class="btn sm" data-act="pick-ym" data-ym="">Bu aya dön</button></div>` : '';
    const tools = `<div class="mtools"><span class="muted">${incomeKnown ? 'Büyük rakam: ay sonunda kalan para. Altındaki üç rakam sırayla: + gelir, − sabit gider, − borç taksitleri.' : 'Rakam: o ayki borç ödemeniz. Ay sonu hesabı için gelir ekleyin.'}</span>${mp ? `<span class="muted">Asgari modu açık: kartlarda yalnız asgari ödenir, kalan borç faizle sonraki aya devreder. Kredi ve KMH taksitleri tam ödenir.</span><button type="button" class="btn sm on" data-act="asgari-toggle" aria-pressed="true">Asgari modunu kapat</button>` : ''}</div>`;
    bar.innerHTML = tools + `<div class="mwrap"><button type="button" class="marr" data-act="mscroll" data-d="-1" aria-label="Önceki aylar">‹</button><div class="mrow">${cards}</div><button type="button" class="marr" data-act="mscroll" data-d="1" aria-label="Sonraki aylar">›</button>${chipHtml}</div>`;
    const row = bar.querySelector('.mrow'); if (row) row.scrollLeft = keepLeft;
  }

  // ---------- Simülasyon modu ----------
  const deep = (o) => JSON.parse(JSON.stringify(o));
  ui.spOpen = { detay: false, plset: false, iki: true, aybay: true, degisiklik: true, sonuc: true, limit: true, kapatma: true, ayrisim: false, etki: false };
  ui.spN = 0;   // 0 = taksitler bitene kadar
  function simReport(real, realNow) {
    C.refreshOverdue(sbx.base, realNow, real.ayarlar); C.markCoverage(sbx.base, realNow);
    return C.simulationReport(sbx.base, real, realNow, real.ayarlar, { ay: ui.spN || 0 });
  }
  const fmtMetric = (m, v) => (m.tur === 'para' ? M(v) : String(v));
  const fmtDelta = (m) => {
    if (m.tur === 'metin') return m.fark ? `${m.fark > 0 ? '+' : '−'}${Math.abs(m.fark)} ay` : '—';
    if (m.tur === 'sayi') return m.fark ? `${m.fark > 0 ? '+' : '−'}${Math.abs(m.fark)}` : '—';
    return Math.abs(m.fark) < 0.5 ? '—' : `${m.fark > 0 ? '+' : '−'}${M(Math.abs(m.fark))}`;
  };
  const tone = (iyi) => (iyi === true ? 'ok-t' : iyi === false ? 'bad-t' : 'muted');
  // ---------- Borç döndürme (takla) hesabı ----------
  ui.takla = { faiz: '', oran: '' };
  function taklaOf() {
    const rs = R(), defF = rs && rs.nakit_kmh ? rs.nakit_kmh.akdi : 4.25;
    return C.rolloverSim(db, new Date(), S(), { avansFaiz: num(ui.takla.faiz) || defF, avansOran: ui.takla.oran === '' ? 25 : num(ui.takla.oran) });
  }
  function taklaHtml(printable) {
    const kartlar = (db.kredi_kartlari || []).filter((k) => (k.hareketler || []).length);
    if (kartlar.length && !kartlar.some((k) => (Number(k.limit) || 0) > 0)) return '<div class="plnote warn"><b>Kart limitiniz girilmemiş.</b> Nakit avans hesabı için Borçlar ekranında kartı düzenleyip limiti yazın.</div>';
    if (!kartlar.length) return '<div class="plnote ok"><b>Kredi kartı borcunuz yok.</b> Nakit avansla borç döndürme yalnızca kredi kartı olanlar için hesaplanır; sizin için gerekmiyor.</div>';
    const tk = taklaOf(), bilgi = (cls, h) => `<div class="plnote ${cls}">${h}</div>`;
    const fld = (key, ad, ipucu) => `<label>${ad}<input type="text" data-fmt="1" inputmode="decimal" data-takla="${key}" value="${esc(ui.takla[key])}"><small class="hint">${ipucu}</small></label>`;
    const ayar = printable ? `<p class="muted pl-var">Varsayım: nakit avans faizi aylık %${String(tk.avFaiz).replace('.', ',')}, avans limiti kart limitinin %${tk.avOran}.</p>`
      : `<details class="plset" data-sp="taklaset" ${ui.spOpen.taklaset ? 'open' : ''}><summary>Avans faizini ve limitini değiştireyim <small class="muted">· aylık %${String(tk.avFaiz).replace('.', ',')} · limitin %${tk.avOran}'i</small></summary>
        <div class="plfields">${fld('faiz', 'Nakit avans faizi (aylık %)', 'Boş bırakırsanız TCMB azami oranı alınır.')}${fld('oran', 'Avans limiti (kart limitinin %)', 'Çoğu bankada %25–50; boş = %25.')}</div></details>`;
    let v;
    if (!tk.kartAdet) v = bilgi('warn', '<b>Kredi kartınız yok.</b> Bu hesap kartların nakit avansına dayanır.');
    else if (tk.durum === 'gerekmez') v = bilgi('ok', '<b>Borç döndürmeye gerek yok.</b> Gelirin her ay asgari ödemelere ve diğer taksitlere yetiyor; açık oluşmuyor.');
    else if (tk.durum === 'donmez') v = bilgi('bad', `<b>Borç döndürme işe yaramaz.</b><br>${C.fmtYM(tk.kirilma.ym)} ayında kartların nakit avans limiti doluyor; o ay <b>${M(tk.kirilma.eksik)}</b> açık kalır ve ödeme yapılamaz.<br>O güne kadar <b>${M(tk.toplamAvans)}</b> avans çekilir, <b>${M(tk.toplamFaiz)}</b> faiz işler; kart borcu <b>${M(tk.pik)}</b>'ye çıkar.`);
    else if (tk.durum === 'doner_biter') v = bilgi('warn', `<b>Borç döndürme çalışır ama pahalıdır.</b><br>${C.fmtYM(tk.ilkAvansYm)} ayından itibaren toplam <b>${M(tk.toplamAvans)}</b> avans çekilir; borçlar ${C.fmtYM(tk.bitisYm)} ayında biter.<br>Bu sürede <b>${M(tk.toplamFaiz)}</b> faiz ödersiniz, kart borcu en çok <b>${M(tk.pik)}</b> olur.`);
    else v = bilgi('warn', `<b>Limit kırılmıyor ama borç ${tk.ay} ayda bitmiyor.</b><br>Toplam avans <b>${M(tk.toplamAvans)}</b>, faiz <b>${M(tk.toplamFaiz)}</b>; kart borcu en çok <b>${M(tk.pik)}</b>.`);
    const rows = tk.rows.filter((r) => r.cekilen > 0.5 || r.kirildi || r.i < 3).slice(0, 14);
    const tablo = tk.durum === 'gerekmez' || !tk.kartAdet ? '' : `<table class="spm"><thead><tr><th>Ay</th><th class="n" title="Gelirin yetmeyen kısmı">Açık</th><th class="n">Çekilen avans</th><th class="n">Kart borcu</th><th class="n" title="Toplam kart limitinin dolu kısmı">Limit</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(C.fmtYM(r.ym))}</td><td class="n ${r.net < 0 ? 'bad-t' : 'ok-t'}">${r.net < 0 ? '−' + n0(-r.net) : '+' + n0(r.net)}</td><td class="n">${r.cekilen > 0.5 ? n0(r.cekilen) : '·'}</td><td class="n"><b>${n0(r.kartBorcu)}</b></td><td class="n ${r.doluluk > 0.9 ? 'bad-t' : ''}">%${Math.round(r.doluluk * 100)}</td></tr>`).join('')}</tbody></table>`;
    return `${ayar}${v}${tablo}<p class="muted pl-var">Her ay asgari ödenir, gelirin yetmeyen kısmı kartların nakit avansından çekilir; artan para önce avansı kapatır. Nakit avansta faiz çekim gününden başlar; bankalar avans limitini kısabilir ya da hiç vermeyebilir. Yeni harcama yapılmadığı ve oranların sabit kaldığı varsayılır.</p>`;
  }

  // ---------- Asgari ödeme rehberi ----------
  function openAsgari() {
    const p = C.minPayPlan(db, new Date(), S(), 120), thisYm = C.ymOf(new Date());
    const esik = S().asgari_limit_esigi || 100000;
    const kartRows = p.kartlar.map((k) => `<tr><td><b>${esc(k.ad)}</b></td><td class="n">${M(k.limit)}</td><td class="n">%${Math.round(k.oran * 100)}</td><td class="n">${M(k.donemBorcu)}</td><td class="n"><b>${M(k.ilkAsgari)}</b></td>
      <td class="n">${!k.taksitVar ? '—' : k.bitisAy == null ? '10 yıldan uzun' : `${k.bitisAy + 1} dönem<small class="muted"> · ${esc(C.fmtYM(k.bitisYm))}</small>`}</td><td class="n bad-t">${M(k.toplamFaiz)}</td></tr>`).join('');
    const a = p.ilkAcik, t = p.ilkAcikTam;
    const cevap = !p.kartlar.length ? 'Kredi kartınız yok; asgari ödeme seçeneği kartlar için geçerlidir.'
      : !a ? `<b class="ok-t">Gelirin yetiyor:</b> kartlarda yalnız asgari ödeyerek tüm dönemleri sürdürebilirsin. Kart borçları en geç <b>${esc(C.fmtYM(p.kartlar.reduce((m, k) => (k.bitisYm && k.bitisYm > m ? k.bitisYm : m), thisYm)))}</b> ayında biter; bunun bedeli <b>${M(p.toplamFaiz)}</b> faizdir.`
        : `<b class="bad-t">Asgariyle de gelir yetmiyor:</b> ${a.i === 0 ? `Bu ay (<b>${esc(C.fmtYM(a.ym))}</b>)` : `<b>${a.i} ay</b> devam edebilirsin; <b>${esc(C.fmtYM(a.ym))}</b> ayında`} <b>${M(a.eksik)}</b> açık oluşuyor.${t ? ` Tam ödemede ilk açık ${esc(C.fmtYM(t.ym))} (${M(t.eksik)}).` : ' Tam ödemede açık yok.'} Asgari devir biriktikçe taksitler yüzünden yük artabilir.`;
    const rows12 = p.aylar.slice(0, 12).map((m) => `<tr><td>${esc(C.fmtYM(m.ym))}</td><td class="n">${n0(m.tam)}</td><td class="n"><b>${n0(m.toplam)}</b></td><td class="n">${n0(m.devir)}</td><td class="n ${m.kalan < 0 ? 'bad-t' : 'ok-t'}">${m.kalan < 0 ? '−' + n0(-m.kalan) : '+' + n0(m.kalan)}</td></tr>`).join('');
    $('as-body').innerHTML = `
      <section><h3>Kısa cevap</h3><div class="plnote ${a ? 'bad' : 'ok'}">${cevap}</div></section>
      ${p.kartlar.length ? `<section><h3>Kartlar: yalnız asgari ödenirse</h3><div class="table-wrap"><table class="spm"><thead><tr><th>Kart</th><th class="n">Limit</th><th class="n">Oran</th><th class="n">Dönem borcu</th><th class="n">Bu ay asgari</th><th class="n" title="Yeni harcama yapılmazsa">Biter</th><th class="n">Ekstra faiz</th></tr></thead><tbody>${kartRows}</tbody></table></div>
        <p class="muted pl-var">Yeni harcama yapılmadığı ve faiz oranının sabit kaldığı varsayılır. "Dönem" = ekstre dönemi (ay).</p></section>
      <section><h3>İlk 12 ay</h3><div class="table-wrap"><table class="spm"><thead><tr><th>Ay</th><th class="n">Tam ödeme</th><th class="n">Asgari ödeme</th><th class="n">Devreden kart borcu</th><th class="n">Ay sonu kalan (asgari)</th></tr></thead><tbody>${rows12}</tbody></table></div></section>` : ''}
      <section><h3>Kurallar ve sorulan sorular</h3><ul class="asul">
        <li><b>Asgari ne kadar?</b> BDDK kararına göre (1 Ekim 2026, sayı 11581) kart limiti <b>${M(esik)}</b> ve altındaysa dönem borcunun <b>%20</b>'si, üstündeyse <b>%40</b>'ı. Dönem borcu taksitleri de içerir.</li>
        <li><b>Asgariyi ödersem ne olur?</b> Kart kullanıma açık kalır, ama kalan borca akdi faiz (TCMB azami oranları + vergi) işler. Tam ödenirse dönem borcuna faiz işlemez.</li>
        <li><b>Kaç dönem asgari ödenebilir?</b> Araştırmada yasal bir üst sınır bulamadım; teknik olarak sürekli ödenebilir. Ama kalan borç her dönem faizle büyür, banka bunu risk sayıp limiti kısabilir. Yukarıdaki tablo her kart için kaç dönem süreceğini hesaplar.</li>
        <li><b>Asgariyi de ödemezsem?</b> Gecikme faizi işler, kayıt olumsuz görünür; uzarsa takip süreci başlar. Ödeme güçlüğünde bankadan yapılandırma (taksitlendirme) istenebilir.</li>
        <li><b>Kredi asgari ödenebilir mi?</b> Hayır. İhtiyaç, taşıt, konut kredisi ve taksitli KMH'de asgari yoktur; taksitin tamamı ödenir. Ödenmeyen taksit gecikme faizi işler. "Asgari ile devam" yalnız kredi kartı dönem borcu için geçerlidir; bu yüzden hesap kredilere tam taksit yazar.</li>
        <li><b>Nakit avansla borç döndürmek?</b> Nakit avansta faiz çekildiği gün başlar, avans limiti genelde kart limitinin %25–50'sidir. Bankalar bunu önermez; borç sarmalına yol açabilir. Simülasyon panelindeki "Borç döndürme" hesabı bunun döner mi dönmez mi olduğunu gösterir.</li>
      </ul><p class="muted pl-var">Kaynaklar: BDDK kararı haberi (alomaliye.com, 5 Ekim 2026), hesapkurdu.com ve enuygunfinans.com rehberleri. Güncel oranlar için bankanıza danışın; bu bir hukuki veya yatırım tavsiyesi değildir.</p></section>
      <section><button class="btn primary" type="button" data-act="takla-ac">${icon('refresh')} Borç döndürme hesabını aç</button></section>`;
    $('dlg-asgari').showModal();
  }

  // ---------- Kapatma planı (hangi ay hangi borç?) ----------
  ui.plan = { nakit: '', tampon: '', masraf: '' };
  const planOf = (at) => C.payoffPlan(db, at || new Date(), S(), { nakit: num(ui.plan.nakit) || 0, tampon: num(ui.plan.tampon) || 0, masraf: num(ui.plan.masraf) || 0, ay: 60 });
  const signM = (v) => (v > 0.5 ? '+' : v < -0.5 ? '−' : '') + M(Math.abs(v));
  function ikiYolHtml(pl) {
    const k = pl.kiyas; if (!pl.adimlar.length || !k) return '';
    const A = k.kapatilmazsa, B = k.kapatilirsa, fark = r2c(A.toplamOdeme - B.toplamOdeme);
    const ay = (ym) => (ym ? C.fmtYM(ym) : 'borç yok');
    const row = (ad, a, b, cls) => `<tr><td>${ad}</td><td class="n ${cls ? cls(b, a) : ''}"><b>${b}</b></td><td class="n">${a}</td></tr>`;
    const iyiAz = (b, a) => 'ok-t';
    return `<table class="spm ikiyol"><thead><tr><th>${k.ay} ay boyunca</th><th class="n">Önerilen borçlar kapatılırsa</th><th class="n">Kapatılmazsa</th></tr></thead><tbody>
      ${row('Borçlarınız biter', ay(A.bitisYm), ay(B.bitisYm), iyiAz)}
      ${row('Bundan sonra ödeyeceğiniz faiz', M(A.faizKalan), M(B.faizKalan), iyiAz)}
      ${row('Toplam çıkacak para (taksit + kapatma)', M(A.toplamOdeme), M(B.toplamOdeme), iyiAz)}
      ${row('Gelecek ayki taksit yükü', M(A.ilkAyTaksit), M(B.ilkAyTaksit), iyiAz)}
      <tr><td>Sonunda elinizde kalan para</td><td class="n ${B.nakitSonu >= 0 ? 'ok-t' : 'bad-t'}"><b>${signM(B.nakitSonu)}</b></td><td class="n ${A.nakitSonu >= 0 ? 'ok-t' : 'bad-t'}">${signM(A.nakitSonu)}</td></tr></tbody></table>
      <p class="pl-how" style="margin-top:8px">${fark > 0.5 ? `Kapatırsanız toplam <b class="ok-t">${M(fark)}</b> daha az para çıkar.` : 'İki yol arasında para farkı küçük.'}</p>`;
  }
  const r2c = (v) => C.r2(v);
  function stepsHtml(pl) {
    const thisYm = C.ymOf(new Date());
    return `<ol class="plsteps">${pl.adimlar.map((x, i) => `<li class="plstep"><div class="plwhen"><span class="pln">${i + 1}</span><div><b>${C.fmtYM(x.ym)}</b><small>${x.ym === thisYm ? 'bu ay' : `${x.k} ay sonra`}</small></div></div>
          <div class="plbody"><div class="plwhat">Kapatın: <b>${esc(x.banka)} · ${esc(x.ad)}</b>${x.gecikmis ? ' <span class="chip bad">Gecikmiş</span>' : ''}</div>
          <div class="plpay">Bankaya ödeyeceğiniz: <b>${M(x.odeme)}</b>${x.masraf > 0 ? ` <small class="muted">(${M(x.masraf)} masraf dahil)</small>` : ''}</div>
          <div class="plgain">${icon('check')} Ayda <b>${M(x.aylik)}</b> daha az taksit · <b>${M(x.faizKazanc)}</b> faiz vermezsiniz</div>
          <div class="plwhy">${x.gecikmis ? 'Neden önce bu? Gecikmiş borçta her gün gecikme faizi işler.' : i === 0 ? `Neden önce bu? Aylık faizi %${String(x.oran).replace('.', ',')} ile en pahalı borcunuz.` : `Neden şimdi? Kalan borçların en pahalısı (aylık faiz %${String(x.oran).replace('.', ',')}).`}</div></div></li>`).join('')}</ol>`;
  }
  const validApplied = () => (ui.planApplied && ui.planApplied.ids.every((id) => (db.tek_seferlik || []).some((x) => x.id === id)) ? ui.planApplied : null);
  function planHtml(pl, printable) {
    const a = pl.ozet, thisYm = C.ymOf(new Date());
    const fld = (key, ad, ipucu) => `<label>${ad}<input type="text" data-fmt="1" inputmode="decimal" data-plan="${key}" value="${esc(ui.plan[key])}"><small class="hint">${ipucu}</small></label>`;
    const ayar = printable ? `<p class="muted pl-var">Varsayım: elde nakit ${M(pl.nakit)}, her ay kenarda tutulan ${M(pl.tampon)}, kapatma masrafı %${pl.masraf}.</p>`
      : `<details class="plset" data-sp="plset" ${ui.spOpen.plset ? 'open' : ''}><summary>Rakamları kendime göre değiştireyim <small class="muted">· elde nakit ${M(pl.nakit)} · her ay kenarda ${M(pl.tampon)}</small></summary>
        <div class="plfields">${fld('nakit', 'Şu an elimde duran para (₺)', 'Kapatmaya ayırabileceğiniz nakit. Yoksa boş bırakın.')}${fld('tampon', 'Her ay kenarda kalsın (₺)', 'Kapatmaya gitmeyecek, acil durum payı.')}${fld('masraf', 'Banka kapatma masrafı (%)', 'Bilmiyorsanız 0 bırakın.')}</div></details>`;
    const bilgi = (cls, html) => `<div class="plnote ${cls}">${html}</div>`;
    let govde = '';
    const ap = validApplied();
    if (ap) {
      return `${bilgi('ok', `<b>Önerilen kapatmalar simülasyona uygulandı.</b><br>${ap.ozet.adet} borç kapandı; ${M(ap.ozet.toplamOdeme)} ödeme biriken paradan yapılmış sayıldı. Gerçek verileriniz değişmedi.`)}
        <div class="plsum"><b>Fark:</b> toplam <b class="ok-t">${M(C.r2(ap.kiyas.kapatilmazsa.toplamOdeme - ap.kiyas.kapatilirsa.toplamOdeme))}</b> daha az para çıkar, her ay <b class="ok-t">${M(ap.ozet.aylikRahatlama)}</b> rahatlarsınız.</div>
        ${ikiYolHtml(ap)}${stepsHtml(ap)}
        ${printable ? '' : `<button class="btn plapply" data-act="plan-undo">${icon('undo')} Uygulamayı geri al</button>`}`;
    }
    if (!pl.adimlar.length) {
      if (pl.hicParaYok) govde = bilgi('bad', `<b>Şu an plan çıkmıyor: her ay cebinizde para artmıyor.</b><br>Gelir, giderleri ve taksitleri karşılamıyor. Önce geliri artırın ya da gideri azaltın${pl.siradaki ? '; ya da elinizdeki nakdi yukarıya yazın' : ''}.`);
      else govde = bilgi('warn', `<b>Önümüzdeki ${pl.ufuk} ayda hiçbir borcu kapatmaya yetecek para birikmiyor.</b>${pl.siradaki ? `<br>İlk hedef <b>${esc(pl.siradaki.ad)}</b>: kapatmak için <b>${M(pl.siradaki.gerek)}</b> gerekir, <b>${M(pl.siradaki.eksik)}</b> eksik.` : ''}`);
      if (pl.siradaki && !pl.bitti && pl.hicParaYok && pl.siradaki.gerek > 0) govde += bilgi('', `En pahalı borcunuz: <b>${esc(pl.siradaki.ad)}</b> (aylık faiz %${String(pl.siradaki.oran).replace('.', ',')}). Kapatmak için <b>${M(pl.siradaki.gerek)}</b> gerekir.`);
    } else {
      const bos = pl.bitti ? `<b>Hepsi bu kadar:</b> bu sırayla ${C.fmtYM(a.sonYm)} ayında faizli borcunuz kalmaz.` : `Sonrası için sıradaki hedef: <b>${esc(pl.siradaki.ad)}</b> (${M(pl.siradaki.gerek)}). Para birikince aynı yöntemle devam edin.`;
      govde = `<div class="plsum"><b>${a.adet} borcu</b> ${C.fmtYM(a.ilkYm)}${a.sonYm !== a.ilkYm ? ' – ' + C.fmtYM(a.sonYm) : ''} arasında kapatabilirsiniz.<br>Toplam <b>${M(a.toplamOdeme)}</b> ödersiniz, <b class="ok-t">${M(a.faizKazanc)}</b> faizden kurtulur, her ay <b class="ok-t">${M(a.aylikRahatlama)}</b> rahatlarsınız.</div>
        ${ikiYolHtml(pl)}
        ${printable ? '' : `<button class="btn primary plapply" data-act="plan-apply">${icon('check')} ${sbx.on ? 'Önerilen kapatmaları simülasyona uygula' : 'Simülasyonda uygula ve farkı gör'}</button><small class="hint">${sbx.on ? 'Kapatmalar bu simülasyona işlenir (gerçek verileriniz değişmez); yukarıdaki fark ve ay ay tablolar buna göre güncellenir.' : 'Simülasyon modu açılır ve kapatmalar orada denenir; gerçek verileriniz değişmez.'}</small>`}
        <p class="pl-how"><b>Nasıl yapacağım?</b> Her ay cebinizde artan parayı kenara koyun. Aşağıdaki ayda sıra size gelince biriken parayla o borcu bankadan <b>kapattırın</b>. Başka bir şey yapmanız gerekmez.</p>
        ${stepsHtml(pl)}
        ${bilgi('ok', bos)}`;
    }
    if (pl.acik.length) govde += bilgi('warn', `<b>Dikkat:</b> ${pl.acik.slice(0, 3).map((x) => C.fmtYM(x.ym)).join(', ')}${pl.acik.length > 3 ? ` (+${pl.acik.length - 3} ay)` : ''} aylarında gelir yetmiyor; o aylarda para birikmez, plan geç kalabilir.`);
    return `${ayar}${govde}<p class="muted pl-var">Faizsiz taksitler kapatılmaz; kendi vadesinde bitsin. Rakamlar tahmindir: kapatmadan önce bankadan güncel kapatma tutarını isteyin.</p>`;
  }

  function reportSections(rep, printable, plan) {
    plan = validApplied() || plan;
    const o = rep.ozet, N = rep.ay, sg = (v) => (v > 0.5 ? '+' : v < -0.5 ? '−' : '');
    const ic = { ekle: icon('plus'), sil: icon('minus'), degis: icon('edit') }, lbl = { ekle: 'Eklendi', sil: 'Silindi', degis: 'Değişti' };
    const sec = [];

    // 1) En sade cevap: cebime ne oluyor? (büyük rakam + birkaç düz cümle)
    const rng = (x) => `${C.fmtYM(x.ilk)} – ${C.fmtYM(x.son)}${x.sabit ? '' : ' (ortalama)'}`;
    const t = o.taksit, g = o.gelir, d = o.gider, net = o.ortNet, kp = o.kapatma;
    const satir = (cls, ikon, metin) => `<li class="${cls}"><span>${ikon}</span><div>${metin}</div></li>`;
    const degisim = [
      g ? satir(g.deger > 0 ? 'iyi' : 'kotu', g.deger > 0 ? icon('up') : icon('warn'), `Geliriniz ayda <b>${g.deger > 0 ? '+' : '−'}${M(Math.abs(g.deger))}</b> ${g.deger > 0 ? 'artıyor' : 'azalıyor'} <small>${rng(g)}</small>`) : '',
      t ? satir(t.deger > 0 ? 'kotu' : 'iyi', t.deger > 0 ? icon('up') : icon('down'), `Taksit ödemeniz ayda <b>${M(Math.abs(t.deger))}</b> ${t.deger > 0 ? 'artıyor' : 'azalıyor'} <small>${rng(t)}</small>`) : '',
      d ? satir(d.deger > 0 ? 'kotu' : 'iyi', d.deger > 0 ? icon('up') : icon('down'), `Giderleriniz ayda <b>${M(Math.abs(d.deger))}</b> ${d.deger > 0 ? 'artıyor' : 'azalıyor'} <small>${rng(d)}</small>`) : '',
      kp ? satir('iyi', icon('lock'), `Kapattığınız borçlar için <b>${M(kp.toplamOdeme)}</b> ödersiniz; ayda <b>${M(kp.aylikKurtulan)}</b> rahatlarsınız`) : '',
    ].join('');
    const faz = o.fazlar.slice(0, 3).map((f) => `<div class="${f.deger > 0.5 ? 'ok-t' : f.deger < -0.5 ? 'bad-t' : 'muted'}"><b>${f.deger > 0.5 ? '+' : f.deger < -0.5 ? '−' : ''}${M(Math.abs(f.deger))}</b> <span class="muted">${f.ilk === f.son ? C.fmtYM(f.ilk) : `${C.fmtYM(f.ilk)} – ${C.fmtYM(f.son)}`}</span></div>`).join('');
    sec.push({ id: 'cevap', title: 'Kısaca', html: rep.changes.length ? `<div class="pl-head ${net < -0.5 ? 'bad' : net > 0.5 ? 'ok' : ''}">
        <div class="pl-q">Her ay cebinizde kalan para, şimdikine göre</div>
        <div class="pl-big">${net > 0.5 ? '+' : net < -0.5 ? '−' : ''}${M(Math.abs(net))} <small>${net > 0.5 ? 'fazla' : net < -0.5 ? 'az' : 'değişmez'}</small></div>
        ${o.fazlar.length > 1 ? `<div class="pl-faz">${faz}</div>` : ''}
        <div class="pl-sub">Ortalama, ${N + 1} ay üzerinden. Artı değerler cebinize yarar, kırmızı değerler yükü gösterir.</div></div>
      ${degisim ? `<ul class="pl-list">${degisim}</ul>` : ''}
      ${rep.warnings.length ? `<div class="spwarn"><b>${icon('warn')} Dikkat</b><ul>${rep.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}`
      : '<div class="muted">Henüz değişiklik yapmadınız.</div>' });

    // 1b) Kapatma planı: hangi ay hangi borç?
    sec.push({ id: 'plan', title: 'Borçları hangi sırayla kapatmalıyım?', html: planHtml(plan, printable) });

    sec.push({ id: 'takla', title: 'Borcu döndürmek işe yarar mı?', html: taklaHtml(printable) });

    // 1c) Ay ay: kapatılırsa / kapatılmazsa
    if (plan && plan.adimlar.length && plan.kiyas) {
      const A = plan.kiyas.kapatilmazsa.aylar, B = plan.kiyas.kapatilirsa.aylar;
      const sg2 = (v) => `<span class="${v < 0 ? 'bad-t' : 'ok-t'}">${n0(v)}</span>`;
      sec.push({ id: 'iki', title: 'Ay ay: kapatılırsa ve kapatılmazsa', html: `<table class="spm spmm"><thead><tr><th>Ay</th><th class="n" title="O ay bankaya ödenecek kapatma bedeli">Kapatma</th><th class="n" colspan="2">Cebinizde kalan (ay sonu)</th><th class="n" colspan="2">Elde biriken toplam</th></tr>
        <tr><th></th><th></th><th class="n">Kapatılırsa</th><th class="n">Kapatılmazsa</th><th class="n">Kapatılırsa</th><th class="n">Kapatılmazsa</th></tr></thead><tbody>${B.map((m, i) => `<tr><td>${esc(C.fmtYM(m.ym))}</td><td class="n ${m.odeme > 0 ? 'bad-t' : 'muted'}">${m.odeme > 0 ? '−' + n0(m.odeme) : '·'}</td><td class="n"><b>${sg2(m.kalan)}</b></td><td class="n">${sg2(A[i].kalan)}</td><td class="n"><b>${sg2(m.nakit)}</b></td><td class="n">${sg2(A[i].nakit)}</td></tr>`).join('')}</tbody></table>
        <div class="muted" style="font-size:12px;margin-top:6px">"Elde biriken toplam": başlangıç nakdiniz + her ay artan para − kapatma ödemeleri.</div>` });
    }

    // 2) Ay ay: Gelir | Sabit gider | Taksit | Fark | Kalan  (simülasyondaki tutarlar; altta şimdiye göre değişim)
    const sub = (d, kotuArtis) => { // d: simülasyon − şimdi; kotuArtis: artış cebe kötü mü (gider/taksit)
      if (Math.abs(d) < 0.5) return '';
      const kotu = kotuArtis ? d > 0 : d < 0;
      return `<small class="${kotu ? 'bad-t' : 'ok-t'}">${d > 0 ? '+' : '−'}${n0(Math.abs(d))}</small>`;
    };
    const hasTek = rep.months.some((m) => m.tekSonra > 0.5 || m.tekOnce > 0.5);
    sec.push({ id: 'aybay', title: 'Ay ay liste (taksitler bitene kadar)', html: `<table class="spm spmm"><thead><tr><th>Ay</th><th class="n" title="O ayki toplam gelir">Gelir</th><th class="n" title="O ayki sabit giderler (kira, fatura, market…)">Sabit gider</th><th class="n" title="O ay ödeyeceğiniz toplam taksit">Taksit</th>${hasTek ? '<th class="n" title="Borç kapatma gibi tek seferlik ödemeler">Tek seferlik</th>' : ''}<th class="n" title="Şimdiki duruma göre cebinize etkisi">Fark</th><th class="n" title="Ay sonunda cebinizde kalan">Kalan</th></tr></thead><tbody>${
      rep.months.map((m) => `<tr><td>${esc(C.fmtYM(m.ym))}${m.bu ? ' <span class="muted">· şimdi</span>' : ''}</td>
        <td class="n"><b>${n0(m.gelirSonra)}</b>${sub(m.gelirSonra - m.gelirOnce, false)}</td>
        <td class="n"><b>${n0(m.giderSonra)}</b>${sub(m.giderSonra - m.giderOnce, true)}</td>
        <td class="n"><b>${n0(m.borcSonra)}</b>${sub(m.borcSonra - m.borcOnce, true)}</td>
        ${hasTek ? `<td class="n ${m.tekSonra > 0.5 ? 'bad-t' : 'muted'}">${m.tekSonra > 0.5 ? '<b>−' + n0(m.tekSonra) + '</b>' : '·'}</td>` : ''}
        <td class="n ${Math.abs(m.fark) < 0.5 ? 'muted' : m.fark > 0 ? 'ok-t' : 'bad-t'}"><b>${Math.abs(m.fark) < 0.5 ? '·' : (m.fark > 0 ? '+' : '−') + n0(Math.abs(m.fark))}</b></td>
        <td class="n ${m.sonra < 0 ? 'bad-t' : ''}" title="Şimdiki durumda: ${n0(m.once)}"><b>${n0(m.sonra)}</b></td></tr>`).join('')}</tbody></table>
      <div class="muted" style="font-size:12px;margin-top:6px">Liste, son taksit bitene kadar uzar. <b>Gelir, Sabit gider, Taksit:</b> simülasyonda o ay beklenen toplam tutar; altındaki küçük rakam şimdiki duruma göre değişimdir (<span class="ok-t">olumlu</span> cebinize iyi, <span class="bad-t">kırmızı</span> kötü). <b>Fark:</b> bu değişimlerin cebinize toplam etkisi. <b>Kalan:</b> ay sonunda cebinizde kalan para = Gelir − Sabit gider − Taksit${hasTek ? ' − Tek seferlik' : ''}.</div>` });

    // 3) Yapılan değişiklikler
    sec.push({ id: 'degisiklik', title: `Yaptığınız değişiklikler (${rep.changes.length})`, html: rep.changes.length
      ? `<ul class="spchg">${rep.changes.map((c) => `<li class="${c.tur}"><span class="ci">${ic[c.tur]}</span><div><b>${esc(c.baslik)}</b> <span class="chip">${esc(c.kat)}</span> <span class="muted">${lbl[c.tur]}</span>${c.ayrinti.map((a) => `<div class="muted">${esc(a)}</div>`).join('')}</div></li>`).join('')}</ul>`
      : '<div class="muted">Henüz değişiklik yapmadınız.</div>' });

    if (rep.kapatmalar && rep.kapatmalar.length) sec.push({ id: 'kapatma', title: `Kapatılan borçlar (${rep.kapatmalar.length})`, html: `<ul class="spchg">${rep.kapatmalar.map((k) => `<li><span class="ci">${icon('lock')}</span><div><b>${esc(k.ad.replace(/ kapatma$/, ''))}</b>
        <div class="muted">${C.fmtYM(k.ym)} ayında ${M(k.tutar)} öde${k.birikim ? ' (birikimden)' : ''} · ${k.adet} taksit silinir (aylık ${M(k.aylik)}) · ${M(k.faizKazanc)} faiz kazancı${k.masraf > 0 ? ` · ${M(k.masraf)} masraf` : ''}</div>
        ${printable ? '' : `<button class="btn sm" data-act="sbx-reopen" data-id="${k.id}">Geri al</button>`}</div></li>`).join('')}</ul>` });

    // 4) Yorum ve uyarılar
    if (rep.changes.length) sec.push({ id: 'sonuc', title: 'Yorum', html: `
      <ul class="spv">${rep.verdict.map((v) => `<li class="${v.iyi === true ? 'iyi' : v.iyi === false ? 'kotu' : ''}"><span>${v.iyi === true ? icon('check') : v.iyi === false ? icon('warn') : '•'}</span>${esc(v.t)}</li>`).join('')}</ul>
      ` });

    // 5) Limit
    if (rep.limits.length) sec.push({ id: 'limit', title: 'Kart ve KMH limiti', html: rep.limits.map((l) => `<div class="mini"><span>${esc(l.ad)}</span><div class="meter"><i class="${l.asildi ? 'b' : l.oran > 0.7 ? 'w' : ''}" style="width:${Math.min(100, l.oran * 100)}%"></i></div><b>${M(l.sonra)} / ${M(l.limit)}</b></div><div class="muted" style="font-size:12px;margin:-2px 0 6px">Şimdi ${M(l.once)}${l.asildi ? ' · <span class="bad-t">limit aşılıyor</span>' : ''}</div>`).join('') });

    // 6) Teknik ayrıntılar (kapalı gelir)
    const a = rep.ayrisim;
    sec.push({ id: 'ayrisim', title: `${N + 1} aylık toplam: nereden geliyor?`, html: `<table class="spm"><tbody>
      <tr><td>Gelir farkı</td><td class="n ${a.gelir > 0.5 ? 'ok-t' : a.gelir < -0.5 ? 'bad-t' : 'muted'}">${sg(a.gelir)}${M(Math.abs(a.gelir))}</td></tr>
      <tr><td>Sabit gider farkı</td><td class="n ${a.gider > 0.5 ? 'ok-t' : a.gider < -0.5 ? 'bad-t' : 'muted'}">${sg(a.gider)}${M(Math.abs(a.gider))}</td></tr>
      ${Math.abs(a.tek) > 0.5 ? `<tr><td>Tek seferlik ödeme farkı</td><td class="n ${a.tek > 0.5 ? 'ok-t' : 'bad-t'}">${sg(a.tek)}${M(Math.abs(a.tek))}</td></tr>` : ''}
      <tr><td>Taksit (borç ödemesi) farkı</td><td class="n ${a.borc > 0.5 ? 'ok-t' : a.borc < -0.5 ? 'bad-t' : 'muted'}">${sg(a.borc)}${M(Math.abs(a.borc))}</td></tr>
      <tr><td><b>Net etki</b></td><td class="n ${a.net > 0.5 ? 'ok-t' : a.net < -0.5 ? 'bad-t' : 'muted'}"><b>${sg(a.net)}${M(Math.abs(a.net))}</b></td></tr></tbody></table>` });
    sec.push({ id: 'etki', title: 'Ayrıntılı ölçüler (teknik)', html: `<table class="spm"><thead><tr><th>Ölçü</th><th class="n">Şimdi</th><th class="n">Simülasyon</th><th class="n">Fark</th></tr></thead><tbody>${
      rep.metrics.map((m) => `<tr><td>${esc(m.ad)}</td><td class="n">${esc(fmtMetric(m, m.once))}</td><td class="n"><b>${esc(fmtMetric(m, m.sonra))}</b></td><td class="n ${tone(m.iyi)}">${fmtDelta(m)}</td></tr>`).join('')}</tbody></table>` });
    return sec;
  }
  const shortYmL = (ym) => `${C.fmtYM(ym)}`;
  function simPanelHtml(rep, plan) {
    const normal = !sbx.on;
    const empty = !normal && !rep.changes.length ? `<div class="sphelp"><b>Nasıl kullanılır?</b><ol><li><button class="btn sm" data-nav="borclar">Borçlar</button> ekranından yeni kredi, harcama ya da taksit ekleyin.</li><li><button class="btn sm" data-nav="butce">Gelir ve giderler</button> ekranından yeni geliri yazın.</li><li>Bu panel size <b>hangi ay hangi borcu kapatacağınızı</b> söyler.</li></ol><p class="muted" style="margin:6px 0 0">Hiçbir şey kaydedilmez; çıkınca gerçek verileriniz aynen kalır.</p></div>` : '';
    const secs = reportSections(rep, false, plan), by = (id) => secs.find((x) => x.id === id);
    const ana = ['cevap', 'plan', 'takla'], detay = secs.filter((x) => !ana.includes(x.id) && (!normal || x.id === 'iki'));
    const kart = (x, cls) => `<section class="plcard ${cls || ''}"><h3>${esc(x.title)}</h3>${x.html}</section>`;
    return `<header><h2>${icon('flask')} ${normal ? 'Borç kapatma planı' : 'Ne yapmalıyım?'}</h2><button class="x" data-act="sbx-panel" aria-label="Paneli kapat">${icon('x')}</button></header>
      <div class="spbody">${normal ? '<p class="muted pl-var" style="margin:0 0 10px">Bu plan gerçek verilerinize göre hesaplanır. Farkı görmek için simülasyonda uygulayın; gerçek verileriniz yine değişmez.</p>' : empty}${rep.changes.length ? kart(by('cevap')) : ''}${kart(by('plan'), 'main')}${kart(by('takla'))}
        ${detay.length ? `<details class="spsec spmore" data-sp="detay" ${ui.spOpen.detay ? 'open' : ''}><summary>Daha fazla ayrıntı (ay ay tablo, değişiklik listesi…)</summary><div class="spc">
          ${rep.changes.length ? `<label class="sphor">Liste kaç aya uzasın? <select data-spn="1" style="width:auto;margin:0">${[[0, 'Taksitler bitene kadar'], [12, '12 ay'], [24, '24 ay'], [36, '36 ay']].map(([n, l]) => `<option value="${n}" ${n === (ui.spN || 0) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
          ${detay.map((x) => `<details class="spsec" data-sp="${x.id}" ${ui.spOpen[x.id] ? 'open' : ''}><summary>${esc(x.title)}</summary><div class="spc">${x.html}</div></details>`).join('')}</div></details>` : ''}
      </div>
      ${normal ? '' : `<footer><button class="btn" data-act="sbx-export" ${rep.changes.length ? '' : 'disabled'}>${icon('download')} Raporu indir</button><button class="btn" data-act="sbx-reset" ${rep.changes.length ? '' : 'disabled'}>Sıfırla</button></footer>`}`;
  }
  function showPanel(panel, open) {
    const was = panel.dataset.open === '1';
    panel.dataset.open = open ? '1' : '0';
    clearTimeout(showPanel.t);
    if (open) {
      panel.hidden = false; panel.classList.remove('out');
      if (!was) { panel.classList.add('in'); sfx.play('open'); setTimeout(() => panel.classList.remove('in'), 420); }
    } else if (was) {
      panel.classList.add('out'); sfx.play('close');
      showPanel.t = setTimeout(() => { if (panel.dataset.open !== '1') { panel.hidden = true; panel.classList.remove('out'); } }, 290);
    } else panel.hidden = true;
  }
  function renderSimUi(real, realNow) {
    const bar = $('simbar'), panel = $('simpanel'), tab = $('simtab'), btn = $('sim-toggle');
    document.body.classList.toggle('sim-on', sbx.on);
    if (btn) {
      btn.innerHTML = icon('flask');
      btn.classList.toggle('on', sbx.on);
      btn.setAttribute('aria-pressed', String(sbx.on));
      btn.title = sbx.on ? 'Simülasyonu bitir' : 'Simülasyon';
      btn.hidden = !(hasDebt(real) || sbx.on);
    }
    $('simtab-l').textContent = sbx.on ? 'Rapor' : 'Plan';
    if (!sbx.on) {
      bar.hidden = true; tab.hidden = window.innerWidth <= 860; $('simtab-n').textContent = ''; tab.classList.toggle('open', ui.panelNormal);
      showPanel(panel, ui.panelNormal); document.body.classList.toggle('simp-open', ui.panelNormal);
      if (ui.panelNormal) { const top = panel.querySelector('.spbody') ? panel.querySelector('.spbody').scrollTop : 0; panel.innerHTML = simPanelHtml(C.simulationReport(real, real, realNow, S(), { ay: ui.spN || 0 }), planOf(realNow)); const b = panel.querySelector('.spbody'); if (b) b.scrollTop = top; }
      return;
    }
    const rep = simReport(real, realNow);
    bar.hidden = false;
    bar.innerHTML = `<b>${icon('flask')} SİMÜLASYON MODU</b><span>Denediğiniz hiçbir şey kaydedilmez.</span><span class="simchg">${rep.changes.length} değişiklik</span><span class="sp"></span>
      <button class="btn sm" data-act="kapat-ac">${icon('lock')} Borç kapat</button><button class="btn sm" data-act="sbx-panel">${ui.sbxPanel ? 'Paneli gizle' : 'Planı göster'}</button><button class="btn sm danger" data-act="sbx-exit">Çık</button>`;
    tab.hidden = false; $('simtab-n').textContent = rep.changes.length || ''; tab.classList.toggle('open', ui.sbxPanel);
    showPanel(panel, ui.sbxPanel); document.body.classList.toggle('simp-open', ui.sbxPanel);
    if (ui.sbxPanel) { const top = panel.querySelector('.spbody') ? panel.querySelector('.spbody').scrollTop : 0; panel.innerHTML = simPanelHtml(rep, planOf(realNow)); const b = panel.querySelector('.spbody'); if (b) b.scrollTop = top; }
  }
  function enterSim() {
    if (sbx.on) return;
    const t = new Date();
    C.refreshOverdue(db, t, S()); C.markCoverage(db, t);
    ui.planApplied = null; sbx.real = db; db = deep(db); sbx.base = deep(db); sbx.on = true; ui.sbxPanel = window.innerWidth > 860; ui.picked.clear();
    toast('Simülasyon modu açık: yaptığınız hiçbir değişiklik kaydedilmez.');
    render();
  }
  async function exitSim() {
    if (!sbx.on) return;
    const n = C.diffDb(sbx.base, db).length;
    if (n) {
      const ok = await askConfirm(`Simülasyondaki ${n} değişiklik silinecek (gerçek verileriniz zaten değişmedi). Raporu indirmediyseniz önce indirin.`, 'Simülasyondan çık', 'Simülasyondan çıkılsın mı?');
      if (!ok) return;
    }
    ui.planApplied = null; db = sbx.real; sbx.on = false; sbx.real = sbx.base = null;
    window.KesePush?.changed();
    toast('Simülasyondan çıkıldı. Gerçek verileriniz değişmedi.');
    render();
    showPendingReminder();
  }
  async function resetSim() {
    if (!sbx.on) return;
    if (C.diffDb(sbx.base, db).length) {
      const ok = await askConfirm('Simülasyondaki tüm değişiklikler geri alınacak.', 'Sıfırla', 'Simülasyon sıfırlansın mı?');
      if (!ok) return;
    }
    ui.planApplied = null; db = deep(sbx.base); render(); toast('Simülasyon başa döndü.');
  }
  function exportSimReport() {
    const t = new Date(), rep = simReport(db, t);
    const body = reportSections(rep, true, planOf(t)).map((x) => `<section><h2>${esc(x.title)}</h2>${x.html}</section>`).join('');
    const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Kese simülasyon raporu</title><style>
      :root{--ink:#16161a;--muted:#666673;--line:#e9e9ee;--accent:#4f46e5;--bad:#c42b2b;--gold:#f4a62a;--surf:#fafafb}
      body{font:14px/1.5 system-ui,Segoe UI,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:var(--ink)}h1{font-size:22px}h2{font-size:16px;border-bottom:1px solid var(--line);padding-bottom:4px;margin-top:26px}
      table{border-collapse:collapse;width:100%}td,th{padding:4px 8px;border-bottom:1px solid var(--line);text-align:left}.n{text-align:right;font-variant-numeric:tabular-nums}th{font-size:12px;color:var(--muted)}
      .ok-t{color:var(--accent)}.bad-t{color:var(--bad)}.muted{color:var(--muted)}.chip{border:1px solid var(--line);border-radius:99px;padding:0 8px;font-size:12px}ul{padding-left:20px}.spgen{font-weight:700;margin:6px 0}
      .fb{display:inline-block;height:6px;margin-left:6px;border-radius:3px}.fb.up{background:var(--accent)}.fb.dn{background:var(--bad)}.mini{display:flex;gap:10px}.meter{display:none}
      .plcard{border:1px solid var(--line);border-radius:10px;padding:10px}.plsteps{list-style:none;padding:0}.plstep{display:flex;gap:12px;border:1px solid var(--line);border-radius:10px;padding:10px;margin:8px 0}.plwhen{width:90px}.plwhen small{display:block;color:var(--muted)}.pln{font-weight:700;margin-right:6px}.plbody{display:grid;gap:2px}.plgain{color:var(--accent)}.plwhy{color:var(--muted);font-size:12px}.plnote{background:var(--surf);border-radius:8px;padding:8px 10px;margin:6px 0}.plsum{background:var(--surf);border-radius:8px;padding:8px 10px}.plset{display:none}.spchg{list-style:none;padding:0}.spchg li{margin:6px 0;display:flex;gap:8px}.note{background:var(--surf);border:1px solid var(--gold);padding:8px 12px;border-radius:8px}</style></head><body>
      <h1>Kese simülasyon raporu</h1><p class="muted">${C.fmtDate(C.isoOf(t))} · Bu rapor bir simülasyondur; hiçbir değişiklik gerçek verilere kaydedilmemiştir.</p>
      <p class="note">Hesaplar kayıtlı faiz oranlarına, gelir sabitliği ve "yeni harcama yok" varsayımlarına dayanır; bankadan yazılı teklif ve ekstreyle doğrulayın. Yatırım veya hukuki tavsiye değildir.</p>${body}</body></html>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    a.download = `kesemden-simulasyon-raporu-${C.isoOf(t)}.html`; a.click(); URL.revokeObjectURL(a.href);
  }
  window.addEventListener('beforeunload', (e) => { if (sbx.on && C.diffDb(sbx.base, db).length) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('toggle', (e) => { const d = e.target && e.target.dataset; if (!d) return; if (d.sp) ui.spOpen[d.sp] = e.target.open; if (d.cal) ui.calOpen[d.cal] = e.target.open; }, true);

  // ---------- Borç kapatma sihirbazı (yalnız simülasyon) ----------
  const kp = { sel: new Set(), tutar: {} };
  const kpKey = (q) => `${q.cat}:${q.pid}:${q.iid}`;
  function openKapat(pre) {
    if (!sbx.on) { toast('Borç kapatma yalnızca simülasyon modunda yapılır. Üstteki deney şişesi simgesine veya Daha fazla > Simülasyonu aç\'a basın.', { err: true }); return; }
    const base = C.ymOf(new Date());
    $('kp-ym').innerHTML = Array.from({ length: 37 }, (_, i) => C.ymAdd(base, i)).map((ym) => `<option value="${ym}">${C.fmtYM(ym)}</option>`).join('');
    kp.sel = new Set(pre ? [pre] : []); kp.tutar = {}; $('kp-masraf').value = ''; $('kp-birikim').checked = false; $('kp-err').textContent = '';
    renderKapat(); $('dlg-kapat').showModal();
  }
  function kpQuotes() { return C.closableDebts(db, $('kp-ym').value, S(), new Date()); }
  function renderKapat() {
    const list = kpQuotes();
    $('kp-list').innerHTML = list.length ? list.map((q) => {
      const k = kpKey(q), on = kp.sel.has(k);
      return `<label class="kprow ${on ? 'on' : ''}"><input type="checkbox" data-kp="${k}" ${on ? 'checked' : ''} style="width:auto;margin:0">
        <span class="kn"><b>${esc(q.banka)} · ${esc(q.ad)}${q.gecikmis ? ' <span class="chip bad">Gecikmiş</span>' : ''}</b><small>${q.adet} taksit × ${M(q.aylik)} = ${M(q.nominal)}</small></span>
        <span class="kt"><input type="number" step="0.01" min="0" data-kp-t="${k}" value="${kp.tutar[k] ?? q.ana}" aria-label="Kapatma bedeli"><small>Kapatma bedeli</small></span></label>`;
    }).join('') : '<div class="muted">Seçilen ayda kapatılabilecek borç yok.</div>';
    kapatLive(list);
  }
  function kapatLive(list) {
    list = list || kpQuotes();
    const m = (num($('kp-masraf').value) || 0) / 100, sel = list.filter((q) => kp.sel.has(kpKey(q)));
    const tutar = (q) => (kp.tutar[kpKey(q)] != null ? Number(kp.tutar[kpKey(q)]) : q.ana);
    const top = C.sum(sel, (q) => tutar(q) * (1 + m));
    $('kp-live').innerHTML = sel.length ? `Tek seferlik ödeme: <b>${M(top)}</b>${m > 0 ? ` <span class="muted">(masraf ${M(top - C.sum(sel, tutar))} dahil)</span>` : ''}<br>Kurtulacağınız taksit: <b>${C.sum(sel, (q) => q.adet)}</b> adet · ayda <b class="ok-t">${M(C.sum(sel, (q) => q.aylik))}</b> rahatlama<br>Faiz kazancı: <b class="ok-t">${M(C.sum(sel, (q) => Math.max(0, q.nominal - tutar(q))))}</b>`
      : 'Kapatmak istediğiniz borçları işaretleyin.';
  }
  function onKapatChange(t) {
    if (t.dataset.kp) { if (t.checked) kp.sel.add(t.dataset.kp); else kp.sel.delete(t.dataset.kp); t.closest('.kprow').classList.toggle('on', t.checked); kapatLive(); }
    else if (t.dataset.kpT) { kp.tutar[t.dataset.kpT] = num(t.value); kapatLive(); }
    else if (t.id === 'kp-ym') { kp.tutar = {}; renderKapat(); }
    else kapatLive();
  }
  function submitKapat(e) {
    e.preventDefault();
    const list = kpQuotes(), sel = list.filter((q) => kp.sel.has(kpKey(q)));
    if (!sel.length) { $('kp-err').textContent = 'En az bir borç seçin.'; return; }
    const ym = $('kp-ym').value, masrafOran = num($('kp-masraf').value) || 0, birikim = $('kp-birikim').checked;
    let n = 0;
    sel.forEach((q) => { const t = kp.tutar[kpKey(q)]; if (C.closeDebt(db, q.cat, q.pid, q.iid, { ym, tutar: t != null && Math.abs(t - q.ana) > 0.005 ? t : null, masrafOran, birikim, settings: S(), now: new Date() })) n++; });
    $('dlg-kapat').close(); ui.sbxPanel = true; save(`${n} borç kapatıldı`);
  }

  // ---------- Modal yardımcıları ----------
  function fillBanks(sel, cur) {
    const set = BANKALAR.includes(cur) || !cur ? BANKALAR : [cur].concat(BANKALAR);
    sel.innerHTML = set.map((b) => `<option>${esc(b)}</option>`).join('');
    sel.value = cur || 'Türkiye İş Bankası';
  }
  function fillMonths(sel, cur) {
    const base = C.ymOf(now()); const opts = [];
    for (let o = -60; o <= 36; o++) opts.push(C.ymAdd(base, o));
    if (cur && !opts.includes(cur)) opts.unshift(cur);
    sel.innerHTML = opts.map((ym) => `<option value="${ym}">${C.fmtYM(ym)}</option>`).join('');
    sel.value = cur || base;
  }
  function setErr(inputId, errId, msg) {
    const i = $(inputId);
    let e = $(errId);
    if (!e && msg && i) {   // sayfada hata alanı yoksa girdinin hemen altında oluşturulur
      e = document.createElement('small'); e.className = 'err'; e.id = errId; e.setAttribute('role', 'alert');
      i.insertAdjacentElement('afterend', e);
    }
    if (e) e.textContent = msg || '';
    if (i) i.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  const nextId = (arr, min) => arr.reduce((m, x) => Math.max(m, x.id), min) + 1;

  // Hesap / kart
  function openHesap(cat, id) {
    const acc = id ? (cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === id) : null;
    const r = R();
    $('he-cat').value = cat; $('he-id').value = id || '';
    $('hesap-title').textContent = (acc ? 'Düzenle: ' : 'Yeni ') + (cat === 'KMH' ? 'KMH hesabı' : 'kredi kartı');
    $('he-ad-lbl').textContent = cat === 'KMH' ? 'Hesap adı' : 'Kart adı';
    fillBanks($('he-banka'), acc && acc.banka);
    $('he-ad').value = acc ? (cat === 'KMH' ? acc.hesap_adi : acc.kart_adi) : (cat === 'KMH' ? 'Avans Hesap' : 'Kredi Kartı');
    $('he-limit').value = acc ? acc.limit : '';
    const defF = cat === 'KMH' ? (r && r.nakit_kmh.akdi) : (r && r.kart_30_180bin.akdi);
    $('he-faiz').value = acc ? (cat === 'KART' && acc.faiz_otomatik ? '' : acc.faiz_orani) : (defF ?? '');
    $('he-faiz-hint').textContent = r ? `TCMB azami: ${cat === 'KMH' ? pct(r.nakit_kmh.akdi) : pct(r.kart_30bin_alti.akdi) + '–' + pct(r.kart_180bin_ustu.akdi)} (bankanız daha düşük uygulayabilir)` : 'Sözleşmenizdeki aylık akdi faiz.';
    $('he-kesim-lbl').textContent = cat === 'KMH' ? 'Hesap kesim / ödeme günü' : 'Hesap kesim günü';
    $('he-kesim').value = acc ? (cat === 'KMH' ? acc.hesap_kesim_gunu : acc.kesim_gunu) : (cat === 'KMH' ? 30 : 15);
    $('he-kesim-hint').textContent = cat === 'KMH' ? 'Taksitlerin vade günü olarak kullanılır.' : 'Ekstrenin kesildiği ay günü.';
    $('he-son-box').hidden = cat === 'KMH';
    $('he-bak-box').hidden = cat !== 'KMH';
    $('he-limit-lbl').textContent = cat === 'KMH' ? 'Artı para limiti (₺)' : 'Kart limiti (₺)';
    if (cat === 'KMH') { const b = acc ? C.hesapBakiye(acc) : 0; $('he-para').value = b > 0 ? numToTR(b) : ''; $('he-eksi').value = ''; $('he-eksi').closest('label').hidden = true; $('he-para').dataset.orig = String(b); }
    $('hesap-title').textContent = (acc ? 'Düzenle: ' : 'Yeni ') + (cat === 'KMH' ? 'vadesiz hesap' : 'kredi kartı');
    $('he-kesim-lbl').textContent = cat === 'KMH' ? 'Artı para faizinin işlendiği gün' : 'Hesap kesim günü';
    $('he-kesim-hint').textContent = cat === 'KMH' ? 'Çoğu bankada ay sonu (30).' : 'Ekstrenin kesildiği ay günü.';
    $('he-son').value = acc && acc.son_odeme_gunu ? acc.son_odeme_gunu : 25;
    ['he-limit', 'he-faiz', 'he-kesim', 'he-son'].forEach((k) => setErr(k, k + '-err', ''));
    $('dlg-hesap').showModal(); $('he-ad').focus();
  }
  function submitHesap(e) {
    e.preventDefault();
    const cat = $('he-cat').value, id = parseInt($('he-id').value) || 0;
    const limit = num($('he-limit').value) || 0;
    const faizRaw = num($('he-faiz').value), dayOk = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 31; };
    const kesimRaw = $('he-kesim').value.trim(), sonRaw = $('he-son').value.trim(), needSon = cat !== 'KMH';
    const ok = [
      setErr('he-limit', 'he-limit-err', limit < 0 ? 'Limit eksi olamaz.' : ''),
      setErr('he-faiz', 'he-faiz-err', $('he-faiz').value.trim() !== '' && !(faizRaw >= 0 && faizRaw <= 100) ? 'Faiz 0 ile 100 arasında olmalı.' : ''),
      setErr('he-kesim', 'he-kesim-err', !dayOk(kesimRaw) ? 'Günü 1 ile 31 arasında yazın.' : ''),
      setErr('he-son', 'he-son-err', needSon && !dayOk(sonRaw) ? 'Günü 1 ile 31 arasında yazın.' : ''),
    ];
    if (ok.includes(false)) return;
    const faiz = faizRaw || 0, kesim = parseInt(kesimRaw), son = needSon ? parseInt(sonRaw) : (parseInt(sonRaw) || 25);
    const banka = $('he-banka').value, ad = $('he-ad').value.trim() || (cat === 'KMH' ? 'Hesap' : 'Kart');
    if (cat === 'KMH') {
      const orig = Number($('he-para').dataset.orig) || 0, paraIn = $('he-para').value.trim();
      const bakiye = orig < 0 && paraIn === '' ? orig : C.r2(num(paraIn) || 0);   // eksi bakiye harcamalardan gelir; para yazılmadıkça korunur
      if (id) Object.assign(db.kmh_hesaplar.find((x) => x.id === id), { banka, hesap_adi: ad, limit, faiz_orani: faiz, hesap_kesim_gunu: kesim, bakiye });
      else { const n = nextId(db.kmh_hesaplar, 100); db.kmh_hesaplar.push({ id: n, banka, hesap_adi: ad, limit, faiz_orani: faiz, hesap_kesim_gunu: kesim, bakiye, islemler: [], hareketler: [] }); ui.selKmh = n; }
    } else if (id) Object.assign(db.kredi_kartlari.find((x) => x.id === id), { banka, kart_adi: ad, limit, faiz_orani: faiz, faiz_otomatik: !$('he-faiz').value.trim(), kesim_gunu: kesim, son_odeme_gunu: son });
    else { const n = nextId(db.kredi_kartlari, 200); db.kredi_kartlari.push({ id: n, banka, kart_adi: ad, limit, faiz_orani: faiz, faiz_otomatik: !$('he-faiz').value.trim(), kesim_gunu: kesim, son_odeme_gunu: son, hareketler: [] }); ui.selKart = n; }
    $('dlg-hesap').close(); save('Kaydedildi.');
  }

  // Harcama / kullanım
  const har = { ilkManual: false };
  function openHar(cat, pid, iid) {
    const parent = (cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === pid);
    if (!parent) return;
    har.pid = pid; har.ilkManual = false; har.auto = {};
    const item = iid ? parent.hareketler.find((x) => x.id === iid) : null;
    $('har-cat').value = cat; $('har-id').value = iid || '';
    $('har-title').textContent = (item ? 'Düzenle: ' : 'Ekle: ') + (cat === 'KMH' ? 'KMH kullanımı' : 'kart harcaması');
    $('har-sub').textContent = `${parent.banka} · ${cat === 'KMH' ? parent.hesap_adi : parent.kart_adi}`;
    $('har-tur').innerHTML = TUR[cat].map((t) => `<option>${esc(t)}</option>`).join('');
    $('har-tarih').value = item ? item.tarih : C.isoOf(now());
    $('har-ack').value = item ? item.aciklama : '';
    if (item) {
      $('har-tur').value = item.tur; $('har-tutar').value = item.ana_para; $('har-n').value = item.toplam_taksit; $('har-faiz').value = item.faiz_orani;
      const paid = item.taksitler.filter((t) => t.odendi).length;
      $('har-odenen').value = paid || ''; $('har-orig-paid').value = paid;
      const calc = C.annuityTotal(item.ana_para, item.faiz_orani, item.toplam_taksit, C.vergiFor(S()));
      $('har-aylik').value = Math.abs(calc - item.toplam_geri_odeme) > 0.005 ? C.r2(item.toplam_geri_odeme / item.toplam_taksit) : ''; har.auto.aylik = !$('har-aylik').value;
      fillMonths($('har-ilk'), item.ilk_taksit_ym); har.ilkManual = true;
      onHarTur(false);
    } else {
      $('har-tutar').value = ''; $('har-odenen').value = ''; $('har-orig-paid').value = ''; $('har-aylik').value = ''; har.auto.aylik = true;
      fillMonths($('har-ilk'), null); onHarTur(true);
    }
    setErr('har-tutar', 'har-tutar-err', ''); setErr('har-n', 'har-n-err', '');
    harLive();
    $('dlg-har').showModal(); $('har-ack').focus();
  }
  function onHarTur(reset) {
    const cat = $('har-cat').value, tur = $('har-tur').value, parent = harParentObj();
    const r = R();
    if (reset) {
      har.auto = Object.assign(har.auto || {}, { n: true, faiz: true });
      if (tur === 'Tek Çekim Harcama' || tur === 'Nakit Kullanım / Harcama') { $('har-n').value = 1; $('har-faiz').value = cat === 'KMH' ? parent.faiz_orani : 0; }
      else if (tur === 'Taksitli Nakit Avans') { $('har-n').value = 3; $('har-faiz').value = parent.faiz_orani || (r ? r.nakit_kmh.akdi : 0); }
      else if (tur === 'Taksitli KMH') { $('har-n').value = 6; $('har-faiz').value = parent.faiz_orani || 0; }
      else { $('har-n').value = 3; $('har-faiz').value = 0; }
    }
    $('har-n').disabled = tur === 'Tek Çekim Harcama' || tur === 'Nakit Kullanım / Harcama';
    if (reset) $('har-n').value = $('har-n').disabled ? 1 : $('har-n').value;
    $('har-faiz-hint').textContent = (tur === 'Taksitli Alışveriş' || tur === 'Tek Çekim Harcama') ? 'Çoğu alışverişte 0. Bankanız faiz uyguluyorsa girin.' : (r ? `TCMB azami nakit/KMH: ${pct(r.nakit_kmh.akdi)}` : '');
    syncHarMonth(); harLive();
  }
  /** Hesabın kalan kullanım limiti (limit yoksa null). exceptId: düzenlenen kalem, kendi tutarı kullanımdan sayılmaz. */
  function limitLeft(parent, exceptId) {
    const lim = Number(parent && parent.limit) || 0; if (!(lim > 0)) return null;
    const used = C.sum((parent.hareketler || []).filter((h) => h.id !== exceptId), (h) => C.remainingPrincipal(h));
    return { limit: lim, kalan: C.r2(lim - used) };
  }
  function harKalan(c) {
    const el = $('har-kalan'), p = harParentObj(); if (!el) return;
    const L = p ? limitLeft(p, parseInt($('har-id').value) || 0) : null;
    if (!L) { el.className = 'hint'; el.textContent = 'Limit belirtilmedi; kalan kullanım hesaplanamaz.'; return; }
    const asil = c.ana > L.kalan + 0.005;
    el.className = asil ? 'err' : 'hint';
    el.innerHTML = `Kalan limit: <b>${M(L.kalan)}</b> / ${M(L.limit)}` + (asil ? ` · bu tutar limiti <b>${M(c.ana - L.kalan)}</b> aşıyor, kaydedilemez` : (c.ana > 0 ? ` · işlemden sonra ${M(L.kalan - c.ana)}` : ''));
  }
  function harParentObj() { return (($('har-cat').value) === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === har.pid); }
  function syncHarMonth() {
    if (har.ilkManual) return;
    const iso = $('har-tarih').value; if (!iso) return;
    const p = harParentObj(), cat = $('har-cat').value, tur = $('har-tur').value;
    const tek = tur === 'Tek Çekim Harcama' || tur === 'Nakit Kullanım / Harcama';
    const o = tek ? 0 : Math.min(parseInt($('har-n').value) || 60, Math.max(0, parseInt($('har-odenen').value) || 0));   // ödenen taksit varsa sıradaki taksit bugüne göre bulunur
    const base = o > 0 ? C.isoOf(now()) : iso;
    const ym = cat === 'KMH' ? C.kmhFirstYm(base, p.hesap_kesim_gunu || 30, tur.includes('Taksitli')) : C.cardFirstYm(base, p.kesim_gunu || 15, p.son_odeme_gunu || 25);
    fillMonths($('har-ilk'), C.ymAdd(ym, -o));
  }
  function harCompute() {
    const ana0 = num($('har-tutar').value), n = Math.max(1, parseInt($('har-n').value) || 1), faiz = num($('har-faiz').value) || 0;
    const aylikEl = har.auto && har.auto.aylik ? 0 : num($('har-aylik').value);      // otomatik yazılan taksit hesaba katılmaz
    const vergi = C.vergiFor(S());
    const ana = ana0 > 0 ? ana0 : (aylikEl > 0 ? C.r2(C.annuityPrincipal(aylikEl, faiz, n, vergi)) : 0); const toplam = aylikEl > 0 ? C.r2(aylikEl * n) : (ana > 0 ? C.annuityTotal(ana, faiz, n, vergi) : 0);
    return { ana, n, faiz, toplam, aylik: toplam / n };
  }
  function harDefaults() {
    const cat = $('har-cat').value, tur = $('har-tur').value, parent = harParentObj() || {}, r = R();
    if (tur === 'Tek Çekim Harcama' || tur === 'Nakit Kullanım / Harcama') return { n: 1, faiz: cat === 'KMH' ? parent.faiz_orani : 0 };
    if (tur === 'Taksitli Nakit Avans') return { n: 3, faiz: parent.faiz_orani || (r ? r.nakit_kmh.akdi : 0) };
    if (tur === 'Taksitli KMH') return { n: 6, faiz: parent.faiz_orani || 0 };
    return { n: 3, faiz: 0 };
  }
  function harLive(trig) {
    const tur = $('har-tur').value;
    if (har.auto && tur !== 'Tek Çekim Harcama' && tur !== 'Nakit Kullanım / Harcama') autoFillLoan($('dlg-har'), { ana: 'har-tutar', n: 'har-n', aylik: 'har-aylik', faiz: 'har-faiz' }, har.auto, { trigger: trig, defaults: harDefaults(), vergi: C.vergiFor(S()) });
    const c = harCompute();
    harKalan(c);
    $('har-live').innerHTML = c.ana > 0 ? `Aylık taksit: <b>${M(c.aylik)}</b> × ${c.n} · Toplam geri ödeme: <b>${M(c.toplam)}</b> · Faiz maliyeti: <b>${M(Math.max(0, c.toplam - c.ana))}</b>` : 'Tutarı ya da aylık taksidi girin; diğeri otomatik hesaplanır.';
  }
  function submitHar(e) {
    e.preventDefault();
    const c = harCompute();
    const ok1 = setErr('har-tutar', 'har-tutar-err', !(c.ana > 0) ? 'Tutarı ya da aylık taksit tutarını girin.' : '');
    const ok2 = setErr('har-n', 'har-n-err', c.n > 60 ? 'En fazla 60 taksit.' : '');
    if (!ok1 || !ok2) return;
    const cat = $('har-cat').value, parent = harParentObj(), tur = $('har-tur').value, iid = parseInt($('har-id').value) || 0;
    const existing = iid ? parent.hareketler.find((x) => x.id === iid) : null;
    const odenen = Math.min(c.n, Math.max(0, parseInt($('har-odenen').value) || 0));
    const preserve = existing && String(odenen) === $('har-orig-paid').value;
    const taksitler = C.buildSchedule({
      toplam: c.toplam || c.ana, n: c.n, ilkYm: $('har-ilk').value, gun: cat === 'KMH' ? (parent.hesap_kesim_gunu || 30) : (parent.son_odeme_gunu || 25),
      odenenSayisi: odenen, odendiFlags: preserve ? existing.taksitler.map((t) => t.odendi) : null,
    });
    const rec = { id: iid || nextId(parent.hareketler, 1000), tur, aciklama: $('har-ack').value.trim() || tur, tarih: $('har-tarih').value || C.isoOf(now()),
      ilk_taksit_ym: $('har-ilk').value, ana_para: c.ana, faiz_orani: c.faiz, toplam_geri_odeme: c.toplam || c.ana, toplam_taksit: c.n, taksitler };
    if (existing?.tarih_tahmini && rec.tarih === existing.tarih) rec.tarih_tahmini = true;
    const L = limitLeft(parent, iid), need = C.remainingPrincipal(rec);
    if (L && need > L.kalan + 0.005) { setErr('har-tutar', 'har-tutar-err', `Kalan limitiniz ${M(Math.max(0, L.kalan))}; ${M(need)} tutarındaki kullanım limiti aşıyor, kaydedilmedi.`); return; }
    if (existing) parent.hareketler[parent.hareketler.indexOf(existing)] = rec; else parent.hareketler.push(rec);
    $('dlg-har').close(); save('Kaydedildi.');
  }

  // Kredi varsayılan faizi
  function krediDefaultFaiz(tur) { const e = S().elle_oranlar; return tur === 'Konut Kredisi' ? e.konut_kredisi : tur === 'Taşıt Kredisi' ? e.tasit_kredisi : e.ihtiyac_kredisi; }
  function defaultAccountFaiz(cat) {
    const r = R();
    if (cat === 'KMH') return (r && r.nakit_kmh && r.nakit_kmh.akdi) || 4.5;
    return (r && r.kart_30_180bin && r.kart_30_180bin.akdi) || 4.25;
  }

  // ---------- Adım adım sihirbaz (soru soru ilerler) ----------
  const wiz = { def: null, i: 0, d: {} };
  const wizSteps = () => wiz.def.steps.filter((st) => !(st.skip && st.skip(wiz.d)));
  const wizBody = () => $('wiz-body');
  let wizFromChooser = false;   // "Borç ekle" türü seçiminden açıldıysa ilk adımda Geri o ekrana döner
  const WIZ_FIELD = 'input:not([type=radio]):not([type=hidden]):not([type=checkbox]):not([disabled]), select:not([disabled]), input[type=radio]:checked, input[type=radio]';
  function wizFocus() { const f = wizBody().querySelector(WIZ_FIELD + ',button[data-wiz-choice],button[data-wiz-edit],button[data-act="choose-debt-file"]'); if (f) f.focus(); }
  // Hata varsa: ilk boş (yoksa ilk) alanı işaretle ve odağı ona ver.
  function wizMarkInvalid() {
    const fields = [...wizBody().querySelectorAll(WIZ_FIELD)];
    const f = fields.find((x) => x.type !== 'radio' && x.value === '') || fields[0];
    if (!f) return;
    f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', 'wiz-err'); f.focus();
    const clear = () => { f.removeAttribute('aria-invalid'); f.removeEventListener('input', clear); f.removeEventListener('change', clear); };
    f.addEventListener('input', clear); f.addEventListener('change', clear);
  }
  function openWiz(def) { wiz.def = def; wiz.i = def.start || 0; wiz.d = def.init(); wiz.fromChooser = wizFromChooser; wizFromChooser = false; renderWiz(); $('dlg-wiz').showModal(); if (!matchMedia('(pointer: coarse)').matches) wizFocus(); }
  function renderWiz() {
    const steps = wizSteps(), st = steps[wiz.i], last = wiz.i === steps.length - 1;
    $('wiz-title').textContent = wiz.def.baslik;
    $('wiz-step').textContent = steps.length > 1 ? `Adım ${wiz.i + 1} / ${steps.length}` : '';
    $('wiz-bar').style.width = `${(wiz.i + 1) / steps.length * 100}%`; $('wiz-bar').parentElement.hidden = steps.length === 1;
    wizBody().innerHTML = `<div class="wizq"><h3>${typeof st.soru === 'function' ? st.soru(wiz.d) : st.soru}</h3>${(typeof st.ipucu === 'function' ? st.ipucu(wiz.d) : st.ipucu) ? `<p class="hint">${typeof st.ipucu === 'function' ? st.ipucu(wiz.d) : st.ipucu}</p>` : ''}${wiz.d.impNote && wiz.d.impStep === wiz.i ? `<div class="live impnote">${wiz.d.impNote}</div>` : ''}${st.liveTop ? '<div class="live top" id="wz-live-top"></div>' : ''}${wiz.def.reminder && wiz.i === 0 ? window.KesePush.dayButton() : ''}${st.html(wiz.d)}<div class="live" id="wz-live" ${st.live ? '' : 'hidden'} aria-live="polite"></div><small class="err" id="wiz-err" role="alert"></small></div>`;
    $('wiz-back').textContent = wiz.i > 0 || wiz.fromChooser ? '‹ Geri' : 'Vazgeç'; $('wiz-next').hidden = !!st.noNext; document.querySelector('#form-wiz footer').hidden = !!st.hideFooter; $('wiz-next').textContent = last ? (wiz.def.saveLabel || 'Kaydet') : 'İleri ›';
    const skipBtn = $('wiz-skip');
    if (skipBtn) skipBtn.hidden = !(wiz.def && typeof wiz.def.onSkip === 'function');
    if (st.live || st.liveTop || st.auto) wizLive();
    if ($('dlg-wiz').open) wizFocus();
  }
  function wizAuto(st, trigger) {
    const a = st.auto, d = wiz.d, b = wizBody();
    if (!d.auto) d.auto = a.init ? a.init(d) : {};
    autoFillLoan(b, a.keys, d.auto, { trigger, defaults: a.defaults(d), vergi: a.vergi(d) });
    const fe = a.keys.faiz && b.querySelector('#' + a.keys.faiz);
    if (fe) { d.faiz = fe.value; d.faizManual = !d.auto.faiz; }
    if (st.read) st.read(d, b);
  }
  function wizLive(trigger) {
    const st = wizSteps()[wiz.i]; if (!st || !(st.live || st.liveTop || st.auto)) return;
    if (st.read) st.read(wiz.d, wizBody());
    if (st.auto) wizAuto(st, trigger);
    const el = $('wz-live'), top = $('wz-live-top'); if (top && st.liveTop) top.innerHTML = st.liveTop(wiz.d); if (el && st.live) el.innerHTML = st.live(wiz.d);
  }
  function wizNext(e) {
    e.preventDefault();
    const steps = wizSteps(), st = steps[wiz.i];
    if (st.noNext) return;
    if (st.read) st.read(wiz.d, wizBody());
    const err = st.validate ? st.validate(wiz.d) : '';
    if (err) { $('wiz-err').textContent = err; wizMarkInvalid(); return; }
    if (st.go && st.go(wiz.d)) return;
    if (wiz.i === steps.length - 1) { $('dlg-wiz').close(); wiz.def.save(wiz.d); return; }
    wiz.i++; renderWiz();
  }
  function wizBack() { const st = wizSteps()[wiz.i]; if (st.read) st.read(wiz.d, wizBody()); if (wiz.i > 0) { wiz.i--; renderWiz(); } else { $('dlg-wiz').close(); if (wiz.fromChooser) openAddDebt(); } }
  const wzVal = (b, id) => { const el = b.querySelector('#' + id); return el ? el.value : ''; };
  const wzRadio = (b, name) => { const el = b.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
  const choiceHtml = (name, list, cur) => `<div class="choices">${list.map(([v, t, sub]) => `<label class="choice"><input type="radio" name="${name}" value="${esc(v)}" ${v === cur ? 'checked' : ''}><span><b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></label>`).join('')}</div>`;
  const bankSelect = (id, cur) => `<select id="${id}">${BANKALAR.map((b) => `<option ${b === (cur || 'Türkiye İş Bankası') ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
  const moneyIn = (id, v) => `<input id="${id}" type="text" data-fmt="1" inputmode="decimal" value="${esc(v ?? '')}">`;
  const posNum = (v) => { const x = num(v); return x > 0 ? x : 0; };

  function wizardChoice(key, question, choices, options = {}) {
    return { id: key, edit: options.edit, soru: question, skip: options.skip, noNext: true,
      html: (d) => {
        const list = typeof choices === 'function' ? choices(d) : choices;
        return '<div class="wiz-cards bigchoices">' + list.map(([value, label, hint]) =>
          `<button type="button" class="bigchoice wiz-card" data-wiz-choice="${esc(value)}" aria-pressed="${d[key] === value}"><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</button>`).join('') + '</div>';
      },
      choose: (d, value) => { if (options.change) options.change(d, value); d[key] = value; }
    };
  }
  function entryMethod(skip) {
    return wizardChoice('method', 'Nasıl eklemek istersin?', [['manual', 'Elle gir'], ['document', 'Belgeden doldur']], { skip });
  }
  function uploadStep() {
    return { id: 'upload', soru: 'Belgeni seç', skip: d => d.method !== 'document', noNext: true,
      html: () => importPicker() + '<p class="hint" id="wz-imp-status" aria-live="polite"></p>' };
  }
  function readDraft(d, b) {
    b.querySelectorAll('input[id^="wz-"]:not([type=file]), select[id^="wz-"]').forEach(el => { d[el.id.slice(3)] = el.value; });
  }
  const dayField = (key, label, value, max = 31, min = 1) => fld(label, `<input id="wz-${key}" type="number" min="${min}" max="${max}" step="1" inputmode="numeric" value="${esc(value)}">`);
  const dateField = (key, label, value) => fld(label, `<input id="wz-${key}" type="date" value="${esc(value)}">`);
  const boundedInt = (v, lo, hi) => String(v).trim() !== '' && Number.isInteger(Number(v)) && Number(v) >= lo && Number(v) <= hi;
  function reviewLinks() {
    return '<div class="debt-actions">' + wizSteps().filter(st => st.edit).map(st =>
      `<button type="button" class="btn sm" data-wiz-edit="${esc(st.id)}">${esc(st.edit)} düzenle</button>`).join('') + '</div>';
  }
  const reviewRows = rows => '<table class="wizsum compact"><tbody>' + rows.filter(Boolean).map(([k,v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('') + '</tbody></table>';

  // ----- Kredi alanlarını birbirinden otomatik doldurma -----
  // Çekilen tutar, aylık taksit, taksit sayısı ve faizden biri eksikse diğerlerinden hesaplanıp alana yazılır.
  // Kullanıcının kendi yazdığı alana dokunulmaz; otomatik yazılanlar (auto[k]) girdi değişince yeniden hesaplanır.
  const fld = (lab, inner) => `<label>${lab}${inner}</label>`;
  const fgrp = (title, inner) => `<fieldset class="fgrp"><legend>${title}</legend><div class="fg">${inner}</div></fieldset>`;
  const dnum = (v) => (v == null || v === '' ? null : (typeof v === 'number' ? v : num(v)));
  function autoFillLoan(root, keys, auto, opt) {
    const el = {};
    Object.keys(keys).forEach((k) => { const e = root.querySelector('#' + keys[k]); if (e && !e.disabled) el[k] = e; });
    const trig = opt.trigger, active = document.activeElement, dflt = opt.defaults || {};
    if (trig && trig.id) Object.keys(keys).forEach((k) => { if (keys[k] === trig.id) delete auto[k]; });    // kullanıcı yazdı: artık "kendi değeri"
    const val = (k) => (el[k] ? el[k].value.trim() : '');
    const given = (k) => !!el[k] && val(k) !== '' && !auto[k];
    const der = C.deriveLoan({ ana: given('ana') ? num(val('ana')) : null, aylik: given('aylik') ? num(val('aylik')) : null, n: given('n') ? parseInt(val('n')) : null,
      faiz: given('faiz') ? num(val('faiz')) : null, faizDefault: dnum(dflt.faiz), vergi: opt.vergi });
    Object.keys(el).forEach((k) => {
      if (given(k) || el[k] === active) return;
      const v = der[k] != null ? der[k] : dnum(dflt[k]);
      const s = v == null ? '' : (k === 'n' ? String(v) : (el[k].dataset.fmt ? numToTR(v) : String(v)));
      if (el[k].value !== s) { el[k].value = s; if (der[k] != null && k !== 'aylik') { const det = el[k].closest('details.more'); if (det && !det.open) det.open = true; } }
      auto[k] = s !== '';
    });
  }
  const loanAuto = { keys: { ana: 'wz-ana', aylik: 'wz-aylik', n: 'wz-toplam', faiz: 'wz-faiz' },
    init: (d) => ({ faiz: !d.faizManual }), defaults: (d) => ({ faiz: krediDefaultFaiz(d.tur || 'İhtiyaç Kredisi') }), vergi: (d) => C.vergiFor(S(), d.tur || 'İhtiyaç Kredisi') };

  // ----- Dosyadan (ekran görüntüsü / PDF) doldurma -----
  const importPicker = (classes = '') => `<div class="document-actions">
    <button type="button" class="btn ${classes}" data-act="choose-debt-file" data-input="wz-photo">Fotoğraf</button>
    <button type="button" class="btn ${classes}" data-act="choose-debt-file" data-input="wz-camera">Kamera</button>
    <button type="button" class="btn ${classes}" data-act="choose-debt-file">Dosya / PDF</button>
    <input id="wz-photo" type="file" accept="image/*" hidden>
    <input id="wz-camera" type="file" accept="image/*" capture="environment" hidden>
    <input id="wz-file" type="file" accept="image/*,application/pdf,.pdf" hidden>
  </div>`;
  const documentFields = (label, open) => `<details class="document-entry"${open ? ' open' : ''}><summary>${label}</summary>
    ${importPicker()}<p class="hint" id="wz-imp-status" aria-live="polite"></p></details>`;
  const trNum = (v) => String(v).replace('.', ',');
  function normalizeAiItem(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const it = Object.assign({}, raw);
    const u = String(it.urun || '').toUpperCase();
    if (u === 'KREDI' || u === 'KMH' || u === 'KART') it.urun = u;
    else it.urun = it.kind === 'kredi' ? 'KREDI' : 'KART';
    if (!it.kind) it.kind = (it.urun === 'KREDI' || it.taksitli) ? 'kredi' : 'kart';
    if (it.tur && !['İhtiyaç Kredisi', 'Taşıt Kredisi', 'Konut Kredisi'].includes(it.tur)) {
      const adFold = window.KeseImport && typeof KeseImport.fold === 'function' ? KeseImport.fold(it.ad || '') : String(it.ad || '').toLowerCase();
      if (/konut/.test(adFold)) it.tur = 'Konut Kredisi';
      else if (/tasit|arac/.test(adFold)) it.tur = 'Taşıt Kredisi';
      else delete it.tur;
    }
    if (it.banka && !BANKALAR.includes(it.banka) && window.KeseImport && typeof KeseImport.detectBank === 'function' && typeof KeseImport.fold === 'function') {
      const matched = KeseImport.detectBank(KeseImport.fold(it.banka), BANKALAR);
      if (matched) it.banka = matched;
    }
    if (!Array.isArray(it.notes)) it.notes = [];
    if (!Array.isArray(it.borclar)) it.borclar = [];
    if (!Array.isArray(it.bulunan)) {
      it.bulunan = [];
      if (it.banka) it.bulunan.push(`Banka: ${it.banka}`);
      if (it.kind === 'kredi') {
        if (it.aylik > 0) it.bulunan.push(`Aylık taksit: ${M(it.aylik)}`);
        if (it.kalan >= 1) it.bulunan.push(`Kalan taksit: ${it.kalan}`);
        if (it.sonraki) it.bulunan.push(`Sıradaki taksit: ${C.fmtDate(it.sonraki)}`);
        if (it.toplam) it.bulunan.push(`Toplam taksit sayısı: ${it.toplam}`);
        if (it.ana) it.bulunan.push(`Çekilen tutar: ${M(it.ana)}`);
      } else {
        if (it.limit > 0) it.bulunan.push(`Toplam limit: ${M(it.limit)}`);
        if (it.kesim) it.bulunan.push(`Kesim günü: ${it.kesim}`);
        if (it.son) it.bulunan.push(`Son ödeme günü: ${it.son}`);
        it.borclar.forEach((b) => { if (b && b.tutar > 0) it.bulunan.push(`${b.ad || 'Borç'}: ${M(b.tutar)}`); });
      }
      if (it.faiz != null) it.bulunan.push(`Aylık faiz: ${pct(it.faiz)}`);
    }
    it.fromAi = true;
    return it;
  }
  let readingDebtFile = false;
  async function wzImport(files) {
    const def = wiz.def;
    const draft = wiz.d;
    const importView = wizBody().firstElementChild;
    const current = () => wiz.def === def && wiz.d === draft && $('dlg-wiz').open && wizBody().firstElementChild === importView;
    const say = (m, err) => { const el = $('wz-imp-status'); if (el) { el.textContent = m; el.style.color = err ? 'var(--bad)' : ''; } };
    if (!def || !def.importer || !files.length) return;
    const hasAi = !!(window.KeseAI && typeof window.KeseAI.parseFile === 'function');
    if (!window.KeseImport && !hasAi) { say('Okuma bileşeni yüklenemedi.', true); return; }
    if (readingDebtFile) { say('Önceki dosya hâlâ okunuyor. Bittiğinde yeniden deneyin.'); return; }
    const pick = $('dlg-wiz').querySelector('[data-act="choose-debt-file"]');
    const isImgOrPdf = (fl) => !!fl && (/^image\//.test(fl.type) || fl.type === 'application/pdf' || /\.pdf$/i.test(fl.name || ''));
    readingDebtFile = true;
    if (pick) pick.disabled = true;
    try {
      // 1) Önce Gemini Vision (KeseAI.parseFile) dene; kapalı/çevrimdışı/kota/boş sonuçta sessizce yerel OCR'a düş.
      if (!def.localDocument && hasAi && files.every(isImgOrPdf) && navigator.onLine !== false) {
        try {
          const aiRawItems = [];
          let aiFailed = false;
          for (let i = 0; i < files.length; i++) {
            if (!current()) return;
            say(files.length > 1 ? `✨ Kese Asistan görseli inceliyor... (${i + 1}/${files.length})` : '✨ Kese Asistan görseli inceliyor...');
            const aiRes = await window.KeseAI.parseFile(files[i]);
            if (!current()) return;
            if (!aiRes || aiRes.ok === false) { aiFailed = true; break; }
            const found = Array.isArray(aiRes) ? aiRes : (Array.isArray(aiRes.items) ? aiRes.items : []);
            if (found.length) aiRawItems.push(...found);
          }
          if (!aiFailed && aiRawItems.length > 0) {
            let converted = null;
            if (typeof window.KeseAI.toImportCandidates === 'function') {
              const opts = { bankalar: BANKALAR, now: new Date() };
              try { converted = window.KeseAI.toImportCandidates(aiRawItems, opts); } catch (e) { converted = null; }
              const probe = Array.isArray(converted) ? converted : (converted && Array.isArray(converted.items) ? converted.items : []);
              if (!probe.length) {
                try { converted = window.KeseAI.toImportCandidates({ items: aiRawItems }, opts); } catch (e) { /* yok say */ }
              }
            } else {
              converted = aiRawItems;
            }
            const candList = (Array.isArray(converted) ? converted : (converted && Array.isArray(converted.items) ? converted.items : []))
              .map(normalizeAiItem)
              .filter(Boolean);
            if (candList.length > 0) {
              const rAi = def.multi ? { items: candList, notes: [] } : candList[0];
              const resAi = def.importer(wiz.d, rAi);
              if (resAi && resAi.ok) {
                if (resAi.done) { $('dlg-wiz').close(); resAi.done(); return; }
                wiz.d.impNote = '<span class="ai-badge">✨ Yapay Zeka ile okundu</span> — bilgileri kontrol edip kaydet';
                wiz.d.impStep = resAi.goto; wiz.i = resAi.goto; renderWiz();
                return;
              }
            }
          }
        } catch (e) { /* AI kapalı, çevrimdışı veya kota doluysa hata göstermeden yerel OCR'a düş */ }
      }

      // 2) Yerel OCR / PDF okuyucu (KeseImport)
      if (!window.KeseImport) { say('Okuma bileşeni yüklenemedi.', true); return; }
      say('Dosya okunuyor…');
      let text;
      try { text = await KeseImport.readFiles(files, (m) => { if (current()) say(m); }, { separateDocuments: def.multi }); }
      catch (e) { if (current()) say(e && e.message ? e.message : 'Dosya okunamadı.', true); return; }
      if (!current()) return;
      const r = def.receipt ? KeseImport.parseReceipt(text) : def.multi ? KeseImport.parseAll(text, { now: new Date(), bankalar: BANKALAR }) : KeseImport.parse(text, { now: new Date(), bankalar: BANKALAR });
      const res = def.importer(wiz.d, r);
      if (!res.ok) { say(res.msg, true); return; }
      if (res.done) { $('dlg-wiz').close(); res.done(); return; }
      if (!def.multi && !def.receipt) wiz.d.impNote = impNoteHtml(r);
      else if (def.receipt) wiz.d.impNote = 'Belge okundu. Kaydetmeden önce tutarı, tarihi ve taksitleri kontrol et.';
      else delete wiz.d.impNote;
      wiz.d.impStep = res.goto; wiz.i = res.goto; renderWiz();
    } finally {
      readingDebtFile = false;
      if (pick) pick.disabled = false;
    }
  }
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t && ['wz-file', 'wz-photo', 'wz-camera'].includes(t.id)) { const step = wizSteps()[wiz.i]; if (step?.read) step.read(wiz.d, wizBody()); const files = Array.from(t.files || []); t.value = ''; wzImport(files); }
  });

  // ----- Borç ekle: 4 anlaşılır kart -----
  const nextDay15 = (n) => C.dueDate(C.ymAdd(C.ymOf(new Date()), n), 15);
  function openAddDebt() {
    openWiz({
      baslik: 'Ekle',
      init: () => ({}),
      steps: [{ soru: 'Ne eklemek istiyorsun?', noNext: true, hideFooter: true,
        html: () => `<div class="wiz-cards bigchoices addmenu">
          <button type="button" class="bigchoice wiz-card" data-wzgo="harcama"><b>${icon('plus')} Harcama ekle</b><small>Kartla aldığın telefon, market alışverişi veya hesabından yaptığın harcama</small></button>
          <button type="button" class="bigchoice wiz-card" data-wzgo="kart"><b>${icon('card')} Kredi kartı ekle</b><small>Limit, hesap kesim ve son ödeme günü</small></button>
          <button type="button" class="bigchoice wiz-card" data-wzgo="hesapv"><b>${icon('wallet')} Hesap ekle</b><small>Vadesiz hesap; varsa artı para (KMH) limitiyle</small></button>
          <button type="button" class="bigchoice wiz-card" data-wzgo="kalan"><b>${icon('bank')} Banka kredisi / kredili ürün ekle</b><small>Bankanın ayrı ödeme planı verdiği ihtiyaç, taşıt veya konut kredisi</small></button>
          <p class="addmenu-more"><button type="button" class="linkbtn" data-wzgo="elden">Elden borç ekle</button></p>
        </div>` }],
      save: () => {},
    });
  }

  // ----- Kredi kartı ekstre ödemesi: tamamı / asgari / başka tutar -----
  function openCardPay(kartId, ym) {
    const k = db.kredi_kartlari.find((x) => x.id === kartId); if (!k) return;
    const st = stmtOf(k);
    if (!st) return toast('Bu kartta ödenecek ekstre yok.');
    const sYm = ym && ym >= st.ym ? ym : st.ym;
    const base = C.cardPayPreview(k, sYm, 0, S(), R());
    const vade = base.rows.reduce((date, { t }) => date ? (t.vade_tarihi < date ? t.vade_tarihi : date) : t.vade_tarihi, '');
    const amount = (d) => d.sec === 'tam' ? base.toplam : d.sec === 'asgari' ? base.asgari : posNum(d.tutar);
    openWiz({
      baslik: 'Yaptığım ödemeyi kaydet', saveLabel: 'Ödemeyi kaydet',
      init: () => ({ sec: '', tutar: '', tarih: C.isoOf(now()) }),
      steps: [{ soru: esc(k.kart_adi), ipucu: 'Bankanda yaptığın ödemeyi burada işaretle.',
        html: (d) => `<div class="kv tight">
          <div><span>Son ödeme tarihi</span><b>${C.fmtDate(vade)}</b></div>
          <div><span>Ödenen toplam</span><b>${M(base.oncekiOdeme)}</b></div>
          <div><span>Kalan ekstre borcu</span><b>${M(base.toplam)}</b></div>
          <div><span>Asgari için kalan</span><b class="warn-t">${M(base.asgari)}</b></div></div>`
          + choiceHtml('wz-sec', [['tam', 'Kalan borcun tamamını ödedim', M(base.toplam)],
            ...(base.asgari > 0 ? [['asgari', 'Asgari için gereken tutarı ödedim', M(base.asgari)]] : []),
            ['diger', 'Başka bir tutar ödedim', 'Ödediğin tutarı yaz']], d.sec)
          + (d.sec === 'diger' ? fld('Ödediğin tutar (₺) *', moneyIn('wz-tutar', d.tutar)) : '')
          + fld('Ödeme tarihi *', `<input id="wz-tarih" type="date" max="${C.isoOf(now())}" value="${esc(d.tarih)}">`),
        read: (d, b) => { const v = wzRadio(b, 'wz-sec'); if (v && v !== d.sec) { d.sec = v; d._rr = true; } ['tutar', 'tarih'].forEach((x) => { if (b.querySelector('#wz-' + x)) d[x] = wzVal(b, 'wz-' + x); }); },
        live: (d) => {
          if (d._rr) { d._rr = false; setTimeout(() => { if ($('dlg-wiz').open) renderWiz(); }, 0); return ''; }
          if (!d.sec || !(amount(d) > 0)) return '';
          const p = C.cardPayPreview(k, sYm, amount(d), S(), R());
          const late = d.tarih > vade ? '<p class="warn-t">Son ödeme tarihi geçmiş. Varsa faiz ve masrafları banka ekstrenden kontrol et.</p>' : '';
          return `<div>Kaydedilecek ödeme <b>${M(p.odenen)}</b></div>
            <div>Ödemeden sonra kalan borç <b>${M(p.kalan)}</b></div>`
            + (p.kalan > 0 ? `<div>Bu tutar vade sonunda kalırsa tahmini devir <b>${M(p.devreden)}</b></div>
              <small>Bu bir tahmindir. Yeni bir ödeme yaparsan aynı ekstreye kaydedebilirsin.</small>` : '') + late;
        },
        validate: (d) => {
          if (!d.sec) return 'Hangi tutarı ödediğini seç.';
          if (!(amount(d) > 0)) return 'Ödediğin tutarı yaz.';
          if (amount(d) > base.toplam + 0.005) return `Kalan ekstre borcu ${M(base.toplam)}. Bu tutarı veya daha azını gir.`;
          if (!d.tarih || d.tarih > C.isoOf(now())) return 'Bugünün veya geçmiş bir günün tarihini seç.';
          return '';
        } }],
      save: (d) => {
        const snap = JSON.stringify(db);
        const r = C.payCardStatement(k, sYm, { tutar: amount(d), tarih: d.tarih, settings: S(), rates: R() });
        if (!r) return;
        save(r.kalan > 0 ? `${M(r.odenen)} ödeme kaydedildi. Bu ekstrede ${M(r.kalan)} kaldı.` : `${k.kart_adi} ekstre ödemesi kaydedildi.`,
          snap, Object.assign({ amount: r.odenen, debtClosed: false, debtName: k.kart_adi, monthlyRelief: 0 }, lastPayOrigin || {}));
      },
    });
  }
  function openOpeningStatement(id, editId) {
    const k = db.kredi_kartlari.find((x) => x.id === id);
    const existing = editId && k?.hareketler.find((h) => h.id === editId && h.ekstre_baslangic);
    if (!k || (editId ? !existing : k.hareketler.length)) return;
    openWiz({
      baslik: existing ? 'Ekstre borcunu düzenle' : 'Mevcut ekstre borcumu gir',
      init: () => existing ? { tutar: trNum(existing.ana_para), asgari: trNum(existing.ekstre_asgari || 0), kesim: existing.tarih, son: existing.taksitler[0]?.vade_tarihi || '' } : { tutar: '', asgari: '', kesim: '', son: '' },
      steps: [{ soru: esc(k.kart_adi), ipucu: 'Bankanın son ekstresindeki tarihleri ve bugün kalan ödeme tutarlarını gir. Bu ekstredeki alışverişler tek borç olarak kaydedilecek.',
        html: (d) => fgrp('Banka ekstresi',
          fld('Kalan ekstre borcu (₺) *', moneyIn('wz-tutar', d.tutar))
          + fld('Asgari için kalan tutar (₺) *', moneyIn('wz-asgari', d.asgari) + '<small class="hint">Asgariyi karşıladıysan 0 yaz.</small>')
          + fld('Ekstrenin kesildiği tarih *', `<input id="wz-kesim" type="date" value="${esc(d.kesim)}">`)
          + fld('Son ödeme tarihi *', `<input id="wz-son" type="date" value="${esc(d.son)}">`)),
        read: (d, b) => { ['tutar','asgari','kesim','son'].forEach((key) => { d[key] = wzVal(b, 'wz-' + key); }); },
        validate: (d) => !(posNum(d.tutar) > 0) ? 'Kalan borç tutarını yaz.'
          : !d.asgari.trim() || posNum(d.asgari) > posNum(d.tutar) ? 'Asgari için 0 ile kalan ekstre borcu arasında bir tutar yaz.'
          : !d.kesim || d.kesim > C.isoOf(now()) || !d.son || d.son <= d.kesim ? 'Geçerli kesim ve son ödeme tarihlerini gir.' : '' }],
      save: (d) => {
        const snap = JSON.stringify(db), tutar = C.r2(posNum(d.tutar)), ym = d.son.slice(0, 7);
        const taksitler = [{ no: 1, ym, vade_tarihi: d.son, tutar, odendi: false }];
        const record = { id: existing?.id || nextId(k.hareketler, 1000), tur: 'Mevcut Ekstre', aciklama: 'Bankadan girilen ekstre borcu',
          ekstre_baslangic: true, ekstre_asgari: C.r2(posNum(d.asgari)), tarih: d.kesim, ilk_taksit_ym: ym,
          ana_para: tutar, faiz_orani: 0, toplam_geri_odeme: tutar, toplam_taksit: 1, taksitler };
        if (existing) Object.assign(existing, record);
        else k.hareketler.push(record);
        save('Mevcut ekstre borcun kaydedildi.', snap);
      },
    });
  }
  function openingStatementConflict(p) {
    if (!p || p.src.cat !== 'KART') return '';
    const opening = p.src.acc.hareketler.find((h) => h.ekstre_baslangic);
    const first = p.taksitler.find((t) => !t.odendi);
    return opening && (p.devam ? first && first.ym <= opening.ilk_taksit_ym : p.tarih <= opening.tarih)
      ? 'Bu dönem mevcut ekstre olarak kaydedilmiş. Sonraki ekstreye ait bir harcama ya da taksit seç.' : '';
  }
  /** Listelerde kart taksitlerini ekstre başına tek satırda toplar (taksit taksit ödeme yok). */
  function groupCardRows(rows, pidKey) {
    const out = [], map = {}, thisYm = C.ymOf(now());
    rows.forEach((u) => {
      if (u.cat !== 'KART' || u.durum === 'sigorta') { out.push(u); return; }
      const pid = u[pidKey], key = `${pid}|${u.ym < thisYm ? 'past' : u.ym}`;
      let g = map[key];
      if (!g) {
        const k = db.kredi_kartlari.find((x) => x.id === pid);
        g = map[key] = Object.assign({}, u, { stmt: true, kartId: pid, adet: 0, tutar: 0, banka: k ? k.banka : u.banka, aciklama: `${k ? k.kart_adi : 'Kart'} ekstresi`, hesap: k ? k.kart_adi : u.hesap, durum: 'odendi' });
        out.push(g);
      }
      g.adet++; g.tutar = C.r2(g.tutar + (u.durum === 'odendi' ? 0 : u.tutar));
      if (u.vade > g.vade) g.vade = u.vade;
      if (u.ym > g.ym) g.ym = u.ym;
      const rank = { gecikmis: 3, bu_ay: 2, bekliyor: 1, odendi: 0 };
      if ((rank[u.durum] || 0) > (rank[g.durum] || 0)) g.durum = u.durum;
      if (u.durum === 'odendi') g.odenenVar = true;
    });
    out.forEach((g) => { if (g.stmt && g.durum === 'odendi') g.tutar = C.r2(rows.filter((u) => u.cat === 'KART' && u[pidKey] === g.kartId && (u.ym === g.ym)).reduce((t, u) => t + u.tutar, 0)); });
    return out;
  }
  const stmtBtn = (u, cls) => (ui.ym || u.durum === 'odendi' ? '' : `<button type="button" class="${cls || 'btn sm primary'}" data-act="pay-stmt" data-id="${u.kartId}" data-ym="${u.ym}">Ödemeyi kaydet</button>`);

  // ----- Harcama ekle: kredi kartı veya vadesiz hesap -----
  // Kart: tek çekim / taksitli alışveriş / taksitli nakit avans. İlk taksit, harcama tarihine göre doğru ekstreye
  // (kesim günü dahil o ayın kesimine, sonrası bir sonraki kesime) ve o ekstrenin son ödeme tarihine yazılır.
  // Vadesiz hesap: tutar hesaptan düşer; bakiye eksiye inerse artı paradan kullanılır.
  const SPEND_TUR = [['tek', 'Tek çekim', 'Ekstrede tek seferde ödenir'], ['taksit', 'Taksitli alışveriş', 'Ödeme aylara bölünür (genelde faizsiz)'], ['avans', 'Taksitli nakit avans', 'Karttan çekilen nakit; faizli']];
  const srcKey = (cat, id) => `${cat}:${id}`;
  function spendSources() {
    return db.kredi_kartlari.map((k) => ({ key: srcKey('KART', k.id), cat: 'KART', acc: k, ad: `${k.banka && k.banka !== 'Diğer' ? k.banka + ' · ' : ''}${k.kart_adi}`, sub: `Kredi kartı${k.limit > 0 ? ' · kullanılabilir ' + M(Math.max(0, k.limit - C.cardUsed(k))) : ''}` }))
      .concat(db.kmh_hesaplar.map((a) => ({ key: srcKey('KMH', a.id), cat: 'KMH', acc: a, ad: `${a.banka && a.banka !== 'Diğer' ? a.banka + ' · ' : ''}${a.hesap_adi}`, sub: `Vadesiz hesap · bakiye ${C.hesapBakiye(a) < 0 ? '−' : ''}${M(Math.abs(C.hesapBakiye(a)))}${a.limit > 0 ? ' · artı para ' + M(a.limit) : ''}` })));
  }
  const nextDueIso = (gun) => { const t = now(), ym = C.ymOf(t), iso = C.dueDate(ym, gun || 25); return iso >= C.isoOf(t) ? iso : C.dueDate(C.ymAdd(ym, 1), gun || 25); };
  const fromCardInstallment = d => d.src.startsWith('KART:') && d.tur === 'taksit' && d.bil === 'taksit';
  function inferredCardDates(d, card) {
    const today = C.isoOf(now()), cut = card.kesim_gunu || 15, due = card.son_odeme_gunu || 25;
    const paid = Number(d.odenen) || 0;
    const nextMonth = d.vadeAy || (paid ? nextDueIso(due).slice(0, 7) : C.cardStatementOf(today, cut, due).odemeYm);
    const firstMonth = C.ymAdd(nextMonth, -paid);
    const statementMonth = C.ymAdd(firstMonth, due <= cut ? -1 : 0);
    const end = C.dueDate(statementMonth, cut);
    const previousCut = C.dueDate(C.ymAdd(statementMonth, -1), cut);
    const startDate = new Date(previousCut + 'T12:00:00');
    startDate.setDate(startDate.getDate() + 1);
    const start = C.isoOf(startDate);
    return { nextMonth, firstMonth, start, end, estimate: end < today ? end : today };
  }
  function spendPlan(d) {
    const src = spendSources().find((x) => x.key === d.src); if (!src) return null;
    const dates = fromCardInstallment(d) ? inferredCardDates(d, src.acc) : null;
    const today = C.isoOf(now()), tarih = dates?.estimate || d.tarih || today;
    if (src.cat === 'KMH' && d.tur !== 'avans') {
      const a = src.acc, tutar = posNum(d.tutar), yeni = C.r2(C.hesapBakiye(a) - tutar), lim = Number(a.limit) || 0;
      const bos = C.r2(Math.max(0, C.hesapBakiye(a)) + Math.max(0, lim - C.hesapKullanilan(a)));
      return { src, tutar, tarih, kmh: true, yeni, asim: tutar > bos + 0.005, eksiye: yeni < 0 };
    }
    if (src.cat === 'KMH') {      // artı paradan taksitli nakit avans (taksitli KMH)
      const a = src.acc, v = C.vergiFor(S()), n = Math.min(60, Math.max(1, parseInt(d.n) || 0)), gun = Number(d.sonraki?.slice(8)) || a.hesap_kesim_gunu || 30;
      const faiz = spendRate(d);
      let ana, toplam;
      if (d.bil === 'taksit') { const x = posNum(d.aylik); toplam = C.r2(x * n); ana = C.r2(C.annuityPrincipal(x, faiz, n, v)); }
      else { ana = posNum(d.tutar); toplam = C.annuityTotal(ana, faiz, n, v); }
      const devam = d.mod === 'devam', odenen = Math.min(n - 1, Math.max(0, parseInt(d.odenen) || 0));
      const ilkYm = devam ? C.ymAdd((d.sonraki || nextDueIso(gun)).slice(0, 7), -odenen) : C.ymAdd(tarih.slice(0, 7), 1);
      const taksitler = C.buildSchedule({ toplam, n, ilkYm, gun, odenenSayisi: odenen });
      const kalanBorc = C.r2(C.sum(taksitler.filter((t) => !t.odendi), (t) => t.tutar));
      const lim = Number(a.limit) || 0, kullanilabilir = C.r2(Math.max(0, lim - C.hesapKullanilan(a))), sonraki = taksitler.find((t) => !t.odendi);
      const ex = { kesimIso: tarih, odemeYm: ilkYm, sonOdemeIso: C.dueDate(ilkYm, gun) };
      return { src, tutar: ana, ana, tarih, kmh: false, kmhAvans: true, n, faiz, toplam, aylik: C.r2(toplam / n), ex, ilkYm, taksitler, gecmis: 0, odenen, devam, kalanBorc, sonraki,
        kullanilabilir, asim: C.r2(ana * (n - odenen) / n) > kullanilabilir + 0.005 };
    }
    const k = src.acc, tek = d.tur === 'tek', v = C.vergiFor(S());
    const n = tek ? 1 : Math.min(60, Math.max(1, parseInt(d.n) || 0));
    const faiz = spendRate(d);
    let ana, toplam;
    if (!tek && d.bil === 'taksit') { const a = posNum(d.aylik); toplam = C.r2(a * n); ana = C.r2(C.annuityPrincipal(a, faiz, n, v)); }
    else { ana = posNum(d.tutar); toplam = tek ? ana : C.annuityTotal(ana, faiz, n, v); }
    const devam = !tek && (dates ? Number(d.odenen) > 0 || !!d.vadeAy : d.mod === 'devam'), odenen = !tek ? Math.min(n - 1, Math.max(0, parseInt(d.odenen) || 0)) : 0;
    let ilkYm, ex = null, gun = devam && Number(d.sonraki?.slice(8)) || k.son_odeme_gunu || 25;
    if (dates) { ilkYm = dates.firstMonth; gun = k.son_odeme_gunu || 25; ex = C.cardStatementOf(tarih, k.kesim_gunu || 15, gun); }
    else if (devam) { const sn = d.sonraki || nextDueIso(gun); ilkYm = C.ymAdd(sn.slice(0, 7), -odenen); }
    else { ex = C.cardStatementOf(tarih, k.kesim_gunu || 15, gun); ilkYm = ex.odemeYm; }
    const taksitler = C.buildSchedule({ toplam, n, ilkYm, gun, odenenSayisi: odenen });
    const gecmis = devam ? 0 : taksitler.filter((t) => !t.odendi && t.vade_tarihi < today).length;
    if (!devam && d.gecmisOdendi !== false) taksitler.forEach((t) => { if (t.vade_tarihi < today) t.odendi = true; });
    const kalanBorc = C.r2(C.sum(taksitler.filter((t) => !t.odendi), (t) => t.tutar));
    const kullanilabilir = k.limit > 0 ? C.r2(k.limit - C.cardUsed(k)) : null;
    const sonraki = taksitler.find((t) => !t.odendi);
    return { src, tutar: ana, ana, tarih, kmh: false, n, faiz, toplam, aylik: C.r2(toplam / n), ex, ilkYm, taksitler, gecmis, odenen, devam, kalanBorc, sonraki,
      kullanilabilir, asim: kullanilabilir != null && kalanBorc > kullanilabilir + 0.005 };
  }
  function remainingSpendPrincipal(plan) {
    const unpaid = plan.taksitler.filter(t => !t.odendi);
    if (unpaid.length === plan.n) return plan.ana;
    const factor = 1 + C.monthlyRate(plan.faiz, C.vergiFor(S()));
    // Son taksit, kuruş yuvarlaması nedeniyle diğerlerinden farklı olabilir.
    const principal = unpaid.reduceRight((balance, t) => (balance + t.tutar) / factor, 0);
    return C.r2(Math.min(plan.ana, plan.kalanBorc, principal));
  }
  function spendRate(d) {
    if (d.tur === 'tek') return 0;
    if (String(d.faiz ?? '').trim() !== '') return num(d.faiz);
    if (d.tur === 'avans') return R()?.nakit_kmh?.akdi ?? 4.25;
    return 0;
  }
  function openSpend(pre) {
    const srcs = spendSources();
    if (!srcs.length) { toast('Önce bir kredi kartı veya vadesiz hesap ekle.'); return openWizHesap(); }
    const pick = pre && pre.cat ? srcKey(pre.cat, pre.id) : (srcs.length === 1 ? srcs[0].key : (ui.lastSrc && srcs.some((x) => x.key === ui.lastSrc) ? ui.lastSrc : srcs[0].key));
    const isK = (d) => d.src.startsWith('KMH'), tak = (d) => d.tur !== 'tek';
    const kmhLim = (d) => { const s0 = isK(d) && spendSources().find((x) => x.key === d.src); return !!(s0 && Number(s0.acc.limit) > 0); };
    const srcOf = (d) => spendSources().find((x) => x.key === d.src);
    const kartInfo = (d) => { const s = srcOf(d); return `<div class="fld-info wide"><span>${isK(d) ? 'Hesap' : 'Kart'}</span><b>${esc(s ? s.ad : '')}</b></div>`; };
    const summary = (d) => {
      const p = spendPlan(d); if (!p) return '';
      if (p.kmh) return `<table class="wizsum compact"><tbody><tr><td>Tutar</td><td>${M(p.tutar)}</td></tr><tr><td>Tarih</td><td>${C.fmtDate(p.tarih)}</td></tr><tr><td>Bakiye</td><td>${C.hesapBakiye(p.src.acc) < 0 ? '−' : ''}${M(Math.abs(C.hesapBakiye(p.src.acc)))} → <b class="${p.yeni < 0 ? 'bad-t' : ''}">${p.yeni < 0 ? '−' : ''}${M(Math.abs(p.yeni))}</b></td></tr></tbody></table>`
        + (p.eksiye && !p.asim ? `<p class="hint">Hesap eksiye düşer; ayda yaklaşık ${M(-p.yeni * (Number(p.src.acc.faiz_orani) || 0) / 100 * C.vergiFor(S()))} faiz ve vergi işler.</p>` : '');
      const kalanAna = remainingSpendPrincipal(p);
      const faizTop = C.r2(p.toplam - p.ana), rows = [
        [d.tur === 'avans' ? 'Çekilen tutar' : 'Harcama tutarı', M(p.ana) + (tak(d) && d.bil === 'taksit' ? ' <span class="calc-tag">hesaplandı</span>' : '')],
        tak(d) ? ['Taksit', `${p.n} × ${M(p.aylik)}` + (d.bil !== 'taksit' ? ' <span class="calc-tag">hesaplandı</span>' : '')] : null,
        tak(d) ? ['Toplam geri ödeme', M(p.toplam)] : null,
        tak(d) ? ['Aylık faiz', pct(p.faiz) + (d.tur === 'avans' && d.faiz === '' ? ' · TCMB azami oranıyla tahmin' : '')] : null,
        tak(d) ? ['Toplam faiz ve vergi', M(faizTop)] : null,
        tak(d) ? ['Kalan ana para', M(kalanAna)] : null,
        tak(d) ? ['Kalan faiz ve vergi', M(C.r2(p.kalanBorc - kalanAna))] : null,
        p.devam ? ['Ödenen / kalan', `${p.odenen} / ${p.n - p.odenen} taksit`] : p.kmhAvans ? ['İlk taksit', C.fmtDate(p.ex.sonOdemeIso)] : ['Ekstre', `${C.fmtDate(p.ex.kesimIso)} kesimi → ödeme ${C.fmtDate(p.ex.sonOdemeIso)}`],
        p.sonraki && tak(d) ? ['Sıradaki taksit', C.fmtDate(p.sonraki.vade_tarihi)] : null,
        tak(d) ? ['Son taksit', C.fmtYM(C.ymAdd(p.ilkYm, p.n - 1))] : null,
        p.sonraki ? ['İlk ödeme', `<b>${C.fmtDate(p.sonraki.vade_tarihi)} · ${M(p.sonraki.tutar)}</b>`] : null,
        ['Kalan borç', `<b>${M(p.kalanBorc)}</b>`],
        p.kullanilabilir != null ? [p.kmhAvans ? 'Kullanılabilir artı para' : 'Kullanılabilir limit', p.asim ? `<span class="bad-t">${M(p.kullanilabilir)} · yetmiyor</span>` : `${M(p.kullanilabilir)} → ${M(Math.max(0, p.kullanilabilir - (p.kmhAvans ? C.r2(p.ana * (p.n - p.odenen) / p.n) : p.kalanBorc)))}`] : null,
      ].filter(Boolean);
      return `<table class="wizsum compact"><tbody>${rows.map(([a, v]) => `<tr><td>${a}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
    };
    function validateSpend(d) {
      const p = spendPlan(d);
      if (!p || !(p.tutar > 0)) return 'Tutarı gir.';
      if (p.kmh && d.tarih > C.isoOf(now())) return 'Hesap harcamasının tarihi gelecekte olamaz.';
      return openingStatementConflict(p) || (p.asim && (!p.devam || (fromCardInstallment(d) && !p.odenen)) ? 'Kullanılabilir bakiye veya limit yetersiz.' : '');
    }
    openWiz({
      baslik: 'Harcama ekle', saveLabel: 'Kaydet',
      receipt: true,
      reminder: !!pre?.reminder,
      localDocument: true,
      init: () => ({ src: pick, srcFixed: !!pre?.cat, tur: 'tek', mod: 'yeni', bil: 'tutar', n: '', kalan: '', vadeAy: '', tutar: pre?.demo ? '1.000' : '', aylik: '', tarih: C.isoOf(now()), ack: pre?.demo ? 'Örnek alışveriş' : '', faiz: '', odenen: '0', sonraki: '', gecmisOdendi: false }),
      importer: (d, receipt) => {
        if (!receipt.tutar) return { ok: false, msg: 'Belgede toplam tutar bulunamadı. Daha net bir fotoğraf seçebilir veya tutarı elle yazabilirsin.' };
        d.tutar = trNum(receipt.tutar);
        d.bil = 'tutar';
        d.tarih = receipt.tarih || '';
        if (receipt.aciklama) d.ack = receipt.aciklama;
        d.tur = receipt.taksit > 1 && !isK(d) ? 'taksit' : 'tek';
        Object.assign(d, { n: d.tur === 'taksit' ? String(receipt.taksit) : '', faiz: '', odenen: '0', sonraki: '', mod: 'yeni' });
        const steps = wizSteps();
        const goto = !d.tarih || validateSpend(d) ? steps.findIndex(st => st.id === 'amount') : steps.length - 1;
        return { ok: true, goto };
      },
      steps: [
        wizardChoice('src', 'Hangi karttan veya hesaptan?', srcs.map(x => [x.key, x.ad, x.sub]), { skip: d => d.srcFixed || srcs.length === 1, change: (d, v) => { if (d.src !== v) d.tur = 'tek'; } }),
        entryMethod(), uploadStep(),
        wizardChoice('tur', 'Hangi işlem türü?', d => isK(d) ? [['tek', 'Hesap harcaması'], ['avans', 'Taksitli nakit avans']] : SPEND_TUR, { edit: 'İşlem türünü', skip: d => isK(d) && !kmhLim(d) }),
        wizardChoice('bil', 'Hangi tutarı biliyorsun?', [['tutar','İşlem tutarı'],['taksit','Bir taksidin tutarı']], { skip: d => !tak(d) }),
        { id: 'amount', edit: 'İşlemi', soru: 'Harcama bilgileri', skip: fromCardInstallment,
          html: d => kartInfo(d) + fgrp('İşlem', (tak(d) && d.bil === 'taksit' ? fld('Bir taksidin tutarı (₺) *', moneyIn('wz-aylik', d.aylik)) : fld('İşlem tutarı (₺) *', moneyIn('wz-tutar', d.tutar)))
            + dateField('tarih','İşlem tarihi *', d.tarih) + fld('Açıklama (isteğe bağlı)', `<input id="wz-ack" maxlength="80" value="${esc(d.ack)}">`)),
          read: readDraft,
          validate: d => !posNum(tak(d) && d.bil === 'taksit' ? d.aylik : d.tutar) ? 'Tutarı gir.' : !d.tarih ? 'İşlem tarihini seç.' : !tak(d) ? validateSpend(d) : '' },
        { id: 'counts', edit: 'Taksit bilgilerini', soru: 'Taksit bilgilerin', skip: d => !fromCardInstallment(d),
          html: d => kartInfo(d) + fgrp('Taksitli alışveriş',
            fld('Aylık taksit tutarı (₺) *', moneyIn('wz-aylik', d.aylik))
            + dayField('odenen','Kaç taksit ödedin?',d.odenen,59,0)
            + dayField('kalan','Kaç taksit kaldı?',d.kalan,60)
            + fld('Açıklama (isteğe bağlı)', `<input id="wz-ack" maxlength="80" value="${esc(d.ack)}">`)),
          read: (d,b) => { readDraft(d,b); d.n = String(Number(d.odenen) + Number(d.kalan)); },
          validate: d => !posNum(d.aylik) ? 'Aylık taksit tutarını gir.' : !boundedInt(d.odenen,0,59) ? 'Ödediğin taksit sayısını gir. Henüz ödemediysen 0 yaz.' : !boundedInt(d.kalan,1,60) ? 'Kalan taksit sayısını 1 ile 60 arasında gir.' : !boundedInt(d.n,2,60) ? 'Ödenen ve kalan taksitlerin toplamı 2 ile 60 arasında olmalı.' : '',
          live: d => {
            if (!posNum(d.aylik) || !boundedInt(d.odenen,0,59) || !boundedInt(d.kalan,1,60) || !boundedInt(d.n,2,60)) return '';
            const dates = inferredCardDates(d, srcOf(d).acc);
            return reviewRows([
              ['Toplam taksit sayısı', `${d.n} adet`],
              ['Toplam geri ödeme', M(C.r2(posNum(d.aylik) * Number(d.n)))],
              ['Kalan ödeme', M(C.r2(posNum(d.aylik) * Number(d.kalan)))],
              dates.start <= C.isoOf(now()) && ['Tahmini harcama ayı', C.fmtYM(dates.estimate.slice(0,7))]
            ]);
          } },
        { id: 'schedule', edit: 'Planı', soru: 'Taksit planı', skip: d => !tak(d) || fromCardInstallment(d),
          html: d => fgrp('Ödeme planı', dayField('n','Toplam taksit sayısı (adet) *',d.n,60,2)
            + dayField('odenen','Ödenen taksit',d.odenen,59,0)
            + dateField('sonraki','Sıradaki vade (isteğe bağlı)',d.sonraki)
            + fld('Aylık faiz (%)', moneyIn('wz-faiz',d.faiz) + `<small class="hint">${d.tur === 'avans' ? `Boş bırakırsan %${trNum(spendRate({...d, faiz:''}))} ile tahmin edilir.` : 'Faizli alışverişte aylık oranı gir. Boş bırakırsan faizsiz hesaplanır.'}</small>`)),
          read: (d,b) => { readDraft(d,b); d.mod = d.sonraki ? 'devam' : 'yeni'; },
          validate: d => !boundedInt(d.n,2,60) ? 'Toplam taksiti 2 ile 60 arasında gir.' : !boundedInt(d.odenen || 0,0,Number(d.n)-1) ? 'Ödenen taksit, toplam taksitten az olmalı.' : d.faiz !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 20) ? 'Aylık faizi 0 ile 20 arasında gir.' : validateSpend(d) },
        { id: 'cardReview', soru: 'Ödeme planın doğru mu?', skip: d => !fromCardInstallment(d),
          html: d => kartInfo(d) + moreBox(!!d.vadeAy || d.faiz !== '', fld('Sıradaki taksidin ödeme ayı', `<input type="month" id="wz-vadeAy" value="${esc(d.vadeAy)}"><small>Ekstrendeki ay farklıysa seç.</small>`)
            + faizField(d,'Faizli alışverişte aylık oranı gir. Boş bırakırsan faizsiz hesaplanır.')) + reviewLinks(),
          read: readDraft,
          liveTop: d => {
            const p = spendPlan(d), dates = inferredCardDates(d,p.src.acc);
            if (dates.start > C.isoOf(now())) return 'Bu ödeme ayı harcamayı geleceğe taşıyor. Ekstrendeki ödeme ayını kontrol et.';
            const kalanAna = remainingSpendPrincipal(p);
            return reviewRows([
              ['Bir taksidin tutarı', M(p.aylik)], ['Taksit sayısı', `${d.odenen} ödendi · ${d.kalan} kaldı`],
              ['Toplam geri ödeme', M(p.toplam)], ['Kalan ödeme', M(p.kalanBorc)],
              ['Sıradaki ödeme', C.fmtDate(p.sonraki.vade_tarihi)],
              ['Son ödeme', C.fmtDate(p.taksitler[p.n - 1].vade_tarihi)],
              ['Tahmini harcama ayı', C.fmtYM(dates.estimate.slice(0,7))],
              ...(d.ack ? [['Açıklama',d.ack]] : [])
            ]) + `<details><summary>Tahmin ve taksit dökümü</summary><p>Kartın hesap kesimine göre alışveriş ${C.fmtDate(dates.start)} ile ${C.fmtDate(dates.estimate)} arasında yapılmış olabilir.</p>${reviewRows([
              ['Aylık faiz', pct(p.faiz)],
              ['Tahmini kalan ana para', M(kalanAna)],
              ['Tahmini kalan faiz ve vergi', M(C.r2(p.kalanBorc - kalanAna))]
            ])}<ol>${p.taksitler.map(t => `<li>${C.fmtDate(t.vade_tarihi)} · ${M(t.tutar)} · ${t.odendi ? 'Ödendi' : 'Ödenecek'}</li>`).join('')}</ol></details>`;
          },
          validate: d => inferredCardDates(d,srcOf(d).acc).start > C.isoOf(now()) ? 'Bu ödeme ayı harcamayı geleceğe taşıyor. Ekstrendeki ödeme ayını kontrol et.' : d.faiz !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 20) ? 'Aylık faizi 0 ile 20 arasında gir.' : validateSpend(d) },
        { soru: 'Harcamayı kontrol et', skip: fromCardInstallment, html: d => kartInfo(d) + reviewRows([['İşlem tarihi',C.fmtDate(d.tarih)], d.ack && ['Açıklama',d.ack]]) + summary(d)
            + (tak(d) ? `<details><summary>Ödeme tarihleri</summary><ul class="list compact">${spendPlan(d).taksitler.map(t => `<li><span>${t.no}. taksit · ${C.fmtDate(t.vade_tarihi)}</span><b>${M(t.tutar)}${t.odendi ? ' · Ödendi' : ''}</b></li>`).join('')}</ul></details>` : '') + reviewLinks(), validate: validateSpend }
      ],
      save: (d) => {
        const p = spendPlan(d); if (!p) return;
        ui.lastSrc = d.src;
        if (p.kmh) {
          C.hesapIslem(p.src.acc, { yon: 'cikis', tutar: p.tutar, tarih: d.tarih, aciklama: d.ack.trim() || 'Harcama' });
          ui.selKmh = p.src.acc.id; save(p.yeni < 0 ? 'Harcama kaydedildi; hesap eksiye düştü.' : 'Harcama kaydedildi.');
          return;
        }
        if (p.kmhAvans) {
          const a = p.src.acc;
          a.hareketler.push({ id: nextId(a.hareketler, 1000), tur: 'Taksitli KMH', aciklama: d.ack.trim() || 'Taksitli nakit avans', tarih: d.tarih, ilk_taksit_ym: p.ilkYm, ana_para: p.ana, faiz_orani: p.faiz, toplam_geri_odeme: p.toplam, toplam_taksit: p.n, taksitler: p.taksitler });
          ui.selKmh = a.id; save(`Taksitli nakit avans eklendi; ${p.n - p.odenen} taksit kaldı.`);
          return;
        }
        const k = p.src.acc, tur = d.tur === 'tek' ? 'Tek Çekim Harcama' : d.tur === 'avans' ? 'Taksitli Nakit Avans' : 'Taksitli Alışveriş';
        k.hareketler.push({ id: nextId(k.hareketler, 1000), tur, aciklama: d.ack.trim() || tur, tarih: p.tarih, ...(fromCardInstallment(d) ? { tarih_tahmini: true } : {}), ilk_taksit_ym: p.ilkYm, ana_para: p.ana, faiz_orani: p.faiz, toplam_geri_odeme: p.toplam, toplam_taksit: p.n, taksitler: p.taksitler });
        ui.selKart = k.id; save(p.devam ? `${tur} eklendi; ${p.n - p.odenen} taksit kaldı.` : `Harcama ${C.fmtDate(p.ex.kesimIso)} ekstresine eklendi.`);
      },
    });
  }
  function openAccountTransaction(pid, iid) {
    const account = db.kmh_hesaplar.find((a) => a.id === pid);
    const record = account?.islemler?.find((entry) => entry.id === iid);
    if (!record) return;
    openWiz({
      baslik: 'Hesap işlemini düzenle',
      init: () => ({ tutar: trNum(record.tutar), tarih: record.tarih, ack: record.aciklama || '' }),
      steps: [{ soru: record.yon === 'giris' ? 'Para girişi' : 'Harcama',
        html: (d) => fgrp('İşlem', fld('Tutar (₺)', moneyIn('wz-tutar', d.tutar))
          + fld('Tarih', `<input id="wz-tarih" type="date" value="${esc(d.tarih)}">`)
          + fld('Açıklama', `<input id="wz-ack" maxlength="80" value="${esc(d.ack)}">`)),
        read: (d, b) => { ['tutar', 'tarih', 'ack'].forEach((k) => { d[k] = wzVal(b, 'wz-' + k); }); },
        validate: (d) => !(posNum(d.tutar) > 0) ? 'Tutarı gir.' : !d.tarih || d.tarih > C.isoOf(now()) ? 'Bugünün veya geçmiş bir günün tarihini seç.' : '' }],
      save: (d) => {
        const snap = JSON.stringify(db), tutar = C.r2(posNum(d.tutar));
        account.bakiye = C.r2(C.hesapBakiye(account) + (record.yon === 'giris' ? 1 : -1) * (tutar - record.tutar));
        Object.assign(record, { tutar, tarih: d.tarih, aciklama: d.ack.trim() });
        save('İşlem güncellendi.', snap);
      },
    });
  }

  /** Vadesiz hesaba para girişi (maaş, havale) */
  function openDeposit(id, borc) {
    const a = db.kmh_hesaplar.find((x) => x.id === id); if (!a) return;
    openWiz({
      baslik: borc > 0 ? 'Artı para borcunu öde' : 'Hesaba para girişi', saveLabel: 'Kaydet',
      init: () => ({ tutar: borc > 0 ? numToTR(C.r2(borc)) : '', tarih: C.isoOf(now()), ack: borc > 0 ? 'Artı para borcu ödemesi' : '' }),
      steps: [{ soru: esc(`${a.banka !== 'Diğer' ? a.banka + ' · ' : ''}${a.hesap_adi}`), ipucu: 'Maaş, havale veya yatırdığın para. Hesap eksideyse önce artı para borcu kapanır.',
        html: (d) => fgrp('Para girişi', fld('Tutar (₺) *', moneyIn('wz-tutar', d.tutar)) + fld('Tarih', `<input id="wz-tarih" type="date" value="${esc(d.tarih)}">`) + fld('Açıklama', `<input id="wz-ack" type="text" maxlength="80" value="${esc(d.ack)}" placeholder="Örn: Maaş">`)),
        read: (d, b) => { ['tutar', 'tarih', 'ack'].forEach((k) => { d[k] = wzVal(b, 'wz-' + k); }); },
        live: (d) => { const t = posNum(d.tutar); if (!(t > 0)) return ''; const y = C.r2(C.hesapBakiye(a) + t); return `Bakiye <b>${C.hesapBakiye(a) < 0 ? '−' : ''}${M(Math.abs(C.hesapBakiye(a)))}</b> → <b>${y < 0 ? '−' : ''}${M(Math.abs(y))}</b>`; },
        validate: (d) => (!(posNum(d.tutar) > 0) ? 'Tutarı yazın.' : !d.tarih ? 'Tarihi seçin.' : '') }],
      save: (d) => { C.hesapIslem(a, { yon: 'giris', tutar: posNum(d.tutar), tarih: d.tarih, aciklama: d.ack.trim() || 'Para girişi' }); ui.selKmh = a.id; save('Para girişi kaydedildi.'); },
    });
  }

  /** Vadesi geçmiş eski kart / hesap borcu: önce kartı veya hesabı seç. */
  function openGecPick() {
    const list = db.kredi_kartlari.map((k) => ['KART:' + k.id, `${k.banka !== 'Diğer' ? k.banka + ' · ' : ''}${k.kart_adi}`, 'Kredi kartı']).concat(db.kmh_hesaplar.map((a) => ['KMH:' + a.id, `${a.banka !== 'Diğer' ? a.banka + ' · ' : ''}${a.hesap_adi}`, 'Vadesiz hesap']));
    if (!list.length) { toast('Önce bir kart veya hesap ekle.'); return; }
    const go = (v) => { const [c, id] = v.split(':'); openGec(c, parseInt(id)); };
    if (list.length === 1) return go(list[0][0]);
    openWiz({ baslik: 'Vadesi geçmiş borç', saveLabel: 'Devam', init: () => ({ v: list[0][0] }),
      steps: [{ soru: 'Hangi kart veya hesapta?', ipucu: 'Geçmiş dönemden kalan, gecikme faizi işleyen borç için.', html: (d) => choiceHtml('wz-gp', list, d.v), read: (d, b) => { const v = wzRadio(b, 'wz-gp'); if (v) d.v = v; } }],
      save: (d) => setTimeout(() => go(d.v), 50) });
  }
  function openRecurring(income, id) {
    const list = income ? db.ek_gelirler : db.sabit_giderler;
    const record = id ? list.find((x) => x.id === id) : null;
    if (id && !record) return;
    if (record?.kategori === 'Elden borç') return openAddElden(id);
    const label = income ? 'Gelir' : 'Gider';
    openWiz({
      baslik: label + (id ? ' düzenle' : ' ekle'),
      init: () => ({ ad: (income ? record?.aciklama : record?.ad) || '', kategori: record?.kategori || 'Kira',
        tutar: record ? trNum(record.tutar) : '', bas: record?.baslangic_ym || '', sure: record?.sure || '', gun: record?.gun || '' }),
      steps: [{ soru: label + ' bilgileri',
        html: (d) => (income ? '' : fld('Kategori', `<select id="wz-rec-cat">${C.GIDER_KATEGORILERI.filter(([k]) => k !== 'Elden borç').map(([k]) => `<option ${k === d.kategori ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>`))
          + fld('Ad', `<input id="wz-rec-name" maxlength="60" value="${esc(d.ad)}">`)
          + fld('Aylık tutar (₺)', moneyIn('wz-rec-amount', d.tutar)),
        read: (d, b) => {
          d.ad = wzVal(b, 'wz-rec-name'); d.tutar = wzVal(b, 'wz-rec-amount');
          if (!income) d.kategori = wzVal(b, 'wz-rec-cat');
        },
        validate: (d) => posNum(d.tutar) > 0 ? '' : 'Aylık tutarı gir.',
      }, { soru: 'Hangi aylarda tekrarlanacak?',
        html: (d) => fld('Başlangıç ayı', `<select id="wz-rec-start">${monthOpts(d.bas, 'Bu ay')}</select>`)
          + fld('Kaç ay? (sürekliyse boş bırak)', `<input type="number" id="wz-rec-months" min="1" value="${esc(d.sure)}">`)
          + (income ? '' : fld('Ödeme günü (isteğe bağlı)', `<input type="number" id="wz-rec-day" min="1" max="31" value="${esc(d.gun)}">`)),
        read: (d, b) => {
          d.bas = wzVal(b, 'wz-rec-start'); d.sure = wzVal(b, 'wz-rec-months');
          if (!income) d.gun = wzVal(b, 'wz-rec-day');
        },
        validate: (d) => {
          const months = Number(d.sure), day = Number(d.gun), max = income ? 600 : 360;
          if (d.sure && !(Number.isInteger(months) && months >= 1 && months <= max)) return `Ay sayısı 1 ile ${max} arasında olmalı.`;
          if (!income && d.gun && !(Number.isInteger(day) && day >= 1 && day <= 31)) return 'Ödeme günü 1 ile 31 arasında olmalı.';
          return '';
        },
      }],
      save: (d) => {
        const item = record || { id: nextId(list, 0) };
        item.tutar = C.r2(posNum(d.tutar));
        item.sure = Number(d.sure) || 0;
        item.baslangic_ym = d.bas || C.ymOf(now());
        if (income) item.aciklama = d.ad.trim() || 'Gelir';
        else {
          item.ad = d.ad.trim() || d.kategori; item.kategori = d.kategori;
          item.gun = Number(d.gun) || 0;
          if (!record) item.odendi_aylar = [];
        }
        if (!record) list.push(item);
        save(label + ' kaydedildi.');
      },
    });
  }

  function openSpendingLimit() {
    const month = C.ymOf(now()), prev = db.ayarlar.harcama_butceleri?.[month];
    openWiz({
      baslik: 'Harcama bütçesi', init: () => ({ limit: prev ? trNum(prev) : '' }),
      steps: [{ soru: C.fmtYM(month) + ' için harcama hedefin ne kadar?',
        html: (d) => fld('Aylık hedef (₺)', moneyIn('wz-limit', d.limit)),
        read: (d, b) => { d.limit = wzVal(b, 'wz-limit'); },
        validate: (d) => posNum(d.limit) > 0 ? '' : 'Sıfırdan büyük bir hedef gir.',
      }],
      save: (d) => {
        db.ayarlar.harcama_butceleri = { ...db.ayarlar.harcama_butceleri, [month]: C.r2(posNum(d.limit)) };
        save('Harcama hedefi kaydedildi.');
      },
    });
  }

  function openWeeklyDiscipline() {
    const today = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
    const marked = new Set(Array.isArray(S().harcamasiz_gunler) ? S().harcamasiz_gunler : []);
    const days = Array.from({length: 7}, (_, i) =>
      new Date(Date.parse(today) - (6 - i) * 86400000).toISOString().slice(0, 10));
    const rows = days.map(date => {
      const spent = C.recordedSpend(db, date, date);
      return {date, logged: spent > 0 || marked.has(date),
        label: spent > 0 ? M(spent) : marked.has(date) ? 'Harcamasız gün' : 'Kayıt yok'};
    });
    openWiz({baslik: 'Haftalık disiplin özeti', init: () => ({}), steps: [{
      soru: `Son 7 günün ${rows.filter(row => row.logged).length} gününde kayıt var`,
      noNext: true, hideFooter: true,
      html: () => '<ul class="list compact">' + rows.map(row =>
        `<li><span>${C.fmtDate(row.date)}</span><b>${row.label}</b></li>`).join('') +
        '</ul><button class="btn" type="button" data-act="weekly-insight">Asistan ile değerlendir</button>'
    }]});
  }

  const reminderViews = new Map([['daily','butce'], ['weekly','butce'], ['due','takvim'], ['complete','borclar']]);
  let pendingReminder = '';
  function showPendingReminder() {
    if (!pendingReminder || !db || sbx.on || document.querySelector('dialog[open]') ||
        document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return;
    const kind = pendingReminder;
    pendingReminder = '';
    setView(reminderViews.get(kind));
    if (kind === 'weekly') openWeeklyDiscipline();
    if (kind === 'daily') {
      if (spendSources().length) openSpend({reminder: true});
      else openWiz({baslik: 'Günlük harcama kaydı', init: () => ({}), steps: [{
        soru: 'Bugün harcama yaptın mı?', noNext: true, hideFooter: true,
        html: () => window.KesePush.dayButton() +
          '<p>Harcamayı kaydetmek için hesabını ekleyebilirsin.</p><button type="button" class="btn" data-wzgo="kart">Kredi kartı ekle</button> <button type="button" class="btn" data-wzgo="hesapv">Vadesiz hesap ekle</button>'
      }]});
    }
  }
  function requestReminder(kind) {
    if (!reminderViews.has(kind)) return;
    pendingReminder = kind;
    showPendingReminder();
  }
  for (const event of ['close', 'focusout']) document.addEventListener(event, () => {
    if (pendingReminder) setTimeout(showPendingReminder, 0);
  }, true);
  navigator.serviceWorker?.addEventListener('message', ev => {
    if (ev.data?.type === 'kese-notification') requestReminder(ev.data.kind);
  });
  async function weeklyInsight() {
    const ai = window.KeseAI;
    if (!ai || !(await ai.checkStatus(true).catch(() => null))?.available) {
      toast('Haftalık değerlendirme için Kese Asistan şu an çevrimdışı.');
      return;
    }
    if (ui.view !== 'butce' || ui.ym) return;
    const end = now(), start = new Date(end), month = C.ymOf(end);
    start.setDate(start.getDate() - 6);
    const weekly = C.recordedSpend(db, C.isoOf(start), C.isoOf(end));
    const monthly = C.recordedSpend(db, month + '-01', C.isoOf(end));
    const limit = db.ayarlar.harcama_butceleri?.[month];
    ai.openModal({ getDb: () => db, getCalc: () => C, getNow: now, getSettings: S,
      initialPrompt: `Son 7 günlük kayıtlı harcamam ${M(weekly)}, bu ayki harcamam ${M(monthly)}. ${limit ? 'Aylık harcama hedefim ' + M(limit) + '.' : 'Aylık hedef belirlemedim.'} Bu haftayı değerlendir ve gelecek hafta için bir somut adım öner.` });
  }

  function openAddElden(editId) {
    const existing = editId ? db.sabit_giderler.find((x) => x.id === editId) : null;
    if (editId && !existing) return;
    openWiz({
      baslik: existing ? 'Elden borcu düzenle' : 'Birine Borcum (Elden)',
      saveLabel: existing ? 'Değişiklikleri kaydet' : 'Borcu kaydet',
      init: () => existing
        ? { ad: existing.ad || '', kalan: existing.kalan != null ? trNum(existing.kalan) : '', tutar: existing.tutar ? trNum(existing.tutar) : '', gun: String(existing.gun || 15) }
        : { ad: '', kalan: '', tutar: '', gun: '15' },
      steps: [{ soru: 'Kime, ne kadar borcun var?',
        html: (d) => fld('Kime?', `<input id="wz-ad" maxlength="60" value="${esc(d.ad)}">`)
          + fld('Toplam kalan borç (₺)', moneyIn('wz-kalan', d.kalan)),
        read: (d, b) => { d.ad = wzVal(b, 'wz-ad'); d.kalan = wzVal(b, 'wz-kalan'); },
        validate: (d) => !d.ad.trim() ? 'Kime borçlu olduğunu yazın.' : !(posNum(d.kalan) > 0) ? 'Toplam borç tutarını yazın.' : '',
      }, { soru: 'Her ay ne zaman, ne kadar ödeyeceksin?',
        html: (d) => fld('Aylık ödeme (₺)', moneyIn('wz-tutar', d.tutar))
          + fld('Ödeme günü', `<input id="wz-gun" type="number" min="1" max="31" value="${esc(d.gun)}">`),
        read: (d, b) => { d.tutar = wzVal(b, 'wz-tutar'); d.gun = wzVal(b, 'wz-gun'); },
        liveTop: (d) => {
          const k = posNum(d.kalan), t = posNum(d.tutar);
          if (!(k > 0) || !(t > 0)) return '<div class="bigresult"><small>Toplam borç ve aylık ödemeyi yaz; kaç ayda biteceğini gösterelim.</small></div>';
          const ay = Math.ceil(k / t - 1e-9);
          return `<div class="bigresult"><span>Tahmini bitiş</span><b>${ay} ay</b><small>${M(k)} · ayda ${M(t)}</small></div>`;
        },
        validate: (d) => {
          if (!d.ad.trim()) return 'Kime borçlu olduğunu yazın.';
          if (!(posNum(d.kalan) > 0)) return 'Toplam borç tutarını yazın.';
          if (!(posNum(d.tutar) > 0)) return 'Aylık ödeme tutarını yazın.';
          const g = Number(d.gun);
          if (!(Number.isInteger(g) && g >= 1 && g <= 31)) return 'Ödeme günü 1 ile 31 arasında olmalı.';
          return '';
        },
      }],
      save: (d) => {
        const kalan = C.r2(posNum(d.kalan)), tutar = C.r2(posNum(d.tutar)), gun = parseInt(d.gun) || 15;
        if (existing) {
          existing.ad = d.ad.trim();
          existing.kalan = kalan;
          existing.tutar = tutar;
          existing.gun = gun;
          if (!existing.baslangic_kalan || existing.baslangic_kalan < kalan) existing.baslangic_kalan = kalan;
          save('Elden borç güncellendi.');
          return;
        }
        db.sabit_giderler.push({
          id: nextId(db.sabit_giderler, 0),
          ad: d.ad.trim(), kategori: 'Elden borç', tutar, gun, sure: 0,
          kalan, baslangic_kalan: kalan,
          baslangic_ym: C.ymOf(now()), odendi_aylar: [],
        });
        ui.debtFilter = 'ALL';
        save('Elden borç kaydedildi.');
      },
    });
  }

  /** Sıradaki taksit tarihi geçmişteyse kaç taksit gecikmiş görüneceğini söyler (yalnızca bilgilendirir, kaydetmeyi engellemez). */
  const lateIssue = (sonraki, kalan) => {
    const today = C.isoOf(now()); if (!sonraki || sonraki >= today) return null;
    const k = Math.max(1, parseInt(kalan) || 1), gun = parseInt(sonraki.slice(8)) || 15; let c = 0;
    for (let i = 0; i < k; i++) { if (C.dueDate(C.ymAdd(sonraki.slice(0, 7), i), gun) < today) c++; else break; }
    return { seviye: 'uyari', alanlar: ['sonraki'], mesaj: `Sıradaki taksit tarihi (${C.fmtDate(sonraki)}) geçmişte: kayıttan sonra ${c} taksit "gecikmiş" görünecek. Ödenmişse sıradaki ödenmemiş tarihi yazabilirsin.` };
  };
  const loanIssues = (d) => { const iss = C.checkLoan({ aylik: posNum(d.aylik), kalan: parseInt(d.kalan) || 0, toplam: parseInt(d.toplam) || 0, ana: posNum(d.ana), faiz: num(d.faiz), faizBilinen: !!d.faizManual, vergi: C.vergiFor(S(), d.tur || 'İhtiyaç Kredisi'), faizOneri: krediDefaultFaiz(d.tur || 'İhtiyaç Kredisi') }); const l = lateIssue(d.sonraki, d.kalan); if (l) iss.push(l); return iss; };
  const issuesHtml = (iss) => iss.map((x) => `<div class="issue uyari"><b>Bilgi:</b> ${esc(x.mesaj)}${x.oneri ? ` <button type="button" class="btn sm" data-wzset="wz-aylik:${trNum(x.oneri)}">Taksidi ${M(x.oneri)} yap</button>` : ''}</div>`).join('');

  // ----- Taksitli kredi / borç: tek ekran, anlaşılır alanlar -----
  // Zorunlu: aylık taksit, kalan taksit sayısı, sıradaki taksit tarihi. Toplam vade boşsa kalan taksit kadar sayılır.
  // Faiz ve çekilen tutardan biri yazılırsa diğeri hesaplanır (alan boşken hesaplanan değer gri olarak içinde görünür).
  const KREDI_TURLERI = [['İhtiyaç Kredisi', 'İhtiyaç / tüketici kredisi'], ['Taşıt Kredisi', 'Taşıt kredisi'], ['Konut Kredisi', 'Konut kredisi (BSMV/KKDF yok)']];
  function kalanPlan(d, nFixed) {
    const tur = d.tur || 'İhtiyaç Kredisi';
    const kalan = parseInt(d.kalan) || 0;
    const n = nFixed ?? (parseInt(d.toplam) || 0);
    const faiz = String(d.faiz ?? '').trim() === '' ? null : num(d.faiz);
    const ana = posNum(d.ana) || null, vergi = C.vergiFor(S(), tur);
    const faizDefault = d.kmhPlan ? (R()?.nakit_kmh?.akdi ?? 4.25) : krediDefaultFaiz(tur);
    const aylik = d.loanAmount === 'ana'
      ? C.annuityPayment(ana, faiz ?? faizDefault, n || kalan, vergi)
      : posNum(d.aylik);
    return C.loanPlan({ aylik, kalan, n, faiz: d.loanAmount === 'ana' ? faiz ?? faizDefault : faiz, ana, faizDefault, vergi, konut: tur === 'Konut Kredisi' });
  }
  function openAddKalan(editId, pre) {
    const tur0 = 'İhtiyaç Kredisi';
    const existing = editId ? db.krediler.find((x) => x.id === editId) : null;
    if (editId && !existing) return;
    const kmhPlan = !!(pre && pre.kmh);
    const pending = existing ? C.unpaid(existing).filter((t) => !t.kapatildi) : [];
    const firstPending = pending[0];
    const history = existing ? existing.taksitler.filter((t) => !pending.includes(t)) : [];
    const historyMonths = new Set(history.map((t) => t.ym));
    const scheduleChanged = (d) => parseInt(d.kalan) !== pending.length
      || posNum(d.aylik) !== (firstPending ? firstPending.tutar : 0)
      || d.sonraki !== (firstPending ? firstPending.vade_tarihi : '');
    const remainingOnly = d => !existing && d.stage === 'ongoing' && d.historyMode !== 'yes';
    const principalLabel = d => remainingOnly(d) ? 'Kalan ana para' : 'Çekilen ana para';
    const nOf = d => existing ? history.length + (Number(d.kalan) || 0)
      : d.stage === 'ongoing' && d.historyMode === 'yes' ? Number(d.toplam) : Number(d.kalan);
    const srcTag = (src) => (src === 'girdi' ? '' : src === 'hesap' ? ' <span class="calc-tag">hesaplandı</span>' : ' <span class="calc-tag est">tahmini</span>');
    openWiz({
      baslik: (editId ? 'Krediyi düzenle' : (kmhPlan ? 'KMH taksit planı' : 'Taksitli kredi / borç ekle')) + (pre && pre.queue ? ` · ${pre.queue}` : ''),
      saveLabel: editId ? 'Değişiklikleri kaydet' : 'Borcu kaydet',
      onSkip: pre && pre.onSkip,
      localDocument: true,
      importer: existing ? null : (d, result) => {
        if (result.kind !== 'kredi' || !(result.aylik || result.ana || result.kalan)) return { ok: false, msg: 'Kredi bilgisi bulunamadı. Ödeme planını veya kredi dekontunu daha net yükle.' };
        if (result.aylik > 0) { d.aylik = trNum(result.aylik); d.loanAmount = 'aylik'; }
        else if (result.ana > 0) d.loanAmount = 'ana';
        if (result.kalan > 0) d.kalan = String(result.kalan);
        if (result.toplam > 0) d.toplam = String(result.toplam);
        if (result.sonraki) d.sonraki = result.sonraki;
        if (result.ana > 0) d.ana = trNum(result.ana);
        if (result.faiz != null) d.faiz = trNum(result.faiz);
        if (BANKALAR.includes(result.banka)) d.banka = result.banka;
        if (KREDI_TURLERI.some(([tur]) => tur === result.tur)) d.tur = result.tur;
        d.stage = Number(d.toplam) > Number(d.kalan) && Number(d.kalan) > 0 ? 'ongoing' : 'new';
        d.historyMode = d.stage === 'ongoing' ? 'yes' : 'no';
        if (!d.kalan && d.toplam) d.kalan = d.toplam;
        return { ok: true, goto: wiz.i + 1 };
      },
      init: () => {
        if (!existing) {
          const base = { ad: '', banka: '', tur: tur0, kmhPlan, loanAmount: 'aylik', aylik: '', kalan: '', sonraki: '', toplam: '', ana: '', faiz: '' };
          const x = pre && pre.d ? Object.assign(base, pre.d) : base;
          x.stage = Number(x.toplam) > Number(x.kalan) && Number(x.kalan) > 0 ? 'ongoing' : 'new';
          x.historyMode = x.stage === 'ongoing' ? 'yes' : 'no';
          if (!x.faizManual) x.faiz = '';      // bilinmeyen faiz: alan boş kalır, ortalama faizle tahmin gösterilir
          return x;
        }
        return { ad: existing.kredi_adi, banka: existing.banka === 'Diğer' ? '' : existing.banka, tur: existing.kredi_turu || tur0, aylik: firstPending ? trNum(firstPending.tutar) : '', kalan: String(pending.length), sonraki: firstPending ? firstPending.vade_tarihi : '', toplam: '', ana: trNum(existing.ana_para), faiz: trNum(existing.faiz_orani) };
      },
      steps: [
        entryMethod(() => !!existing || !!pre?.d), uploadStep(),
        wizardChoice('stage', 'Kredin hangi aşamada?', [['new','Yeni kredi','Henüz taksit ödemedim'],['ongoing','Devam eden kredi','Kalan ödemelerimi takip etmek istiyorum']], { skip: () => !!existing }),
        wizardChoice('historyMode', 'Ödeme geçmişini eklemek ister misin?', [['no','Yalnızca kalan taksitler'],['yes','Ödenmiş taksitleri de ekle']], { skip: d => !!existing || d.stage !== 'ongoing', change: (d,v) => { if (d.historyMode !== v) d.ana = ''; } }),
        wizardChoice('loanAmount', 'Hangi tutarı biliyorsun?', d => [['aylik','Aylık taksit'],['ana',principalLabel(d)]], { skip: () => !!existing }),
        { id: 'terms', edit: 'Taksitleri', soru: 'Taksit bilgileri',
          html: d => fgrp('Taksitler',
            (d.loanAmount === 'ana' ? fld(principalLabel(d) + ' (₺) *', moneyIn('wz-ana', d.ana)) : fld('Aylık taksit tutarı (₺) *', moneyIn('wz-aylik', d.aylik)))
            + dayField('kalan', existing || d.stage === 'ongoing' ? 'Kalan taksit sayısı *' : 'Vade (ay) *', d.kalan,360)
            + (!existing && d.stage === 'ongoing' && d.historyMode === 'yes' ? dayField('toplam','Başlangıçtaki toplam taksit sayısı *',d.toplam,360) : '')
            + dateField('sonraki', existing || d.stage === 'ongoing' ? 'Sıradaki taksit tarihi *' : 'İlk taksit tarihi *',d.sonraki)),
          read: readDraft,
          validate: d => !posNum(d.loanAmount === 'ana' ? d.ana : d.aylik) ? 'Bildiğin tutarı gir.' : !boundedInt(d.kalan,1,360) ? 'Taksit sayısını 1 ile 360 arasında gir.' : !d.sonraki ? 'Taksit tarihini seç.' : !existing && d.stage === 'ongoing' && d.historyMode === 'yes' && !boundedInt(d.toplam,Number(d.kalan),360) ? 'Başlangıçtaki toplam vade, kalan taksit sayısından az olamaz.' : '' },
        { id: 'loanDetails', edit: 'Ayrıntıları', soru: 'Kredi ayrıntıları', ipucu: 'Bildiğin alanları doldurabilir veya doğrudan özete geçebilirsin.',
          html: d => fgrp('Kredi', fld('Kredi adı', `<input id="wz-ad" maxlength="60" value="${esc(d.ad)}">`)
            + fld('Banka', `<select id="wz-banka"><option value="">Belirtilmedi</option>${BANKALAR.map(b => `<option ${b === d.banka ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`)
            + (kmhPlan ? '' : fld('Kredi türü', `<select id="wz-tur">${KREDI_TURLERI.map(([v,t]) => `<option value="${esc(v)}" ${v === d.tur ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`))
            + fld('Aylık faiz (%)', moneyIn('wz-faiz',d.faiz) + '<small class="hint">Boş bırakırsan faiz tahmini hesaplanır.</small>')
            + (d.loanAmount === 'ana' ? '' : fld(principalLabel(d) + ' (₺)',moneyIn('wz-ana',d.ana)))),
          read: readDraft,
          validate: d => d.faiz !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 15) ? 'Aylık faiz 0 ile 15 arasında olmalı.' : kalanPlan(d,nOf(d)).hata || '' },
        { soru: 'Krediyi kontrol et',
          html: d => reviewRows([['Kredi',d.ad || d.tur],d.banka && ['Banka',d.banka],['Sıradaki ödeme',C.fmtDate(d.sonraki)]]) + reviewLinks(),
        liveTop: (d) => {
          const p = kalanPlan(d, nOf(d)), b = wizBody(), tur = d.tur || tur0, konut = tur === 'Konut Kredisi';
          const fe = b.querySelector('#wz-faiz'), ae = b.querySelector('#wz-ana'), fh = b.querySelector('#wz-faiz-hint'), ah = b.querySelector('#wz-ana-hint');
          if (fe) fe.placeholder = p.faiz != null && p.faizSrc !== 'girdi' ? `${p.faizSrc === 'varsayilan' ? 'ortalama ' : 'hesaplanan '}%${trNum(p.faiz)}` : `Örn: ${trNum(krediDefaultFaiz(tur))}`;
          if (ae) ae.placeholder = p.ana != null && p.anaSrc !== 'girdi' ? `${p.anaSrc === 'tahmin' ? 'tahmini ' : 'hesaplanan '}${p.ana.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Bilmiyorsan boş bırak';
          if (fh) fh.textContent = konut ? 'Sözleşmedeki aylık oran. Konut kredisinde BSMV ve KKDF alınmaz.' : 'Sözleşmedeki aylık oran. Faize ayrıca %15 BSMV + %15 KKDF eklenir; hesapta dahil edilir.';
          if (ah) ah.textContent = 'Bankadan ilk çektiğin tutar. Boş bırakırsan taksit, vade ve faizden hesaplanır.';
          if (!(p.aylik > 0) || !(p.kalan >= 1)) { d._sumHtml = ''; return '<div class="bigresult"><small>Tutarı ve kalan taksiti girince borç özeti burada görünür.</small></div>'; }
          const sonYm = d.sonraki ? C.ymAdd(d.sonraki.slice(0, 7), p.kalan - 1) : null;
          const rows = [
            remainingOnly(d) ? ['Kalan taksit', p.kalan] : ['Ödenen / kalan taksit', `${p.odenen} / ${p.kalan} (toplam ${p.n})`],
            sonYm ? ['Son taksit', C.fmtYM(sonYm)] : null,
            [principalLabel(d), M(p.ana) + srcTag(p.anaSrc)],
            ['Aylık faiz', `%${trNum(p.faiz)}` + srcTag(d.loanAmount === 'ana' && d.faiz === '' ? 'varsayilan' : p.faizSrc) + (konut ? '' : ` <small class="muted">(vergiyle %${trNum(C.r2(p.faiz * p.vergi))})</small>`)],
            ['Toplam geri ödeme', M(p.toplamOdeme)],
            ['Toplam faiz ve vergi', `<span class="bad-t">${M(p.toplamFaiz)}</span>`],
            ['Bugün kapatırsan yaklaşık', `${M(p.kalanAnapara + p.tazminat)} <small class="muted">(anapara ${M(p.kalanAnapara)} + erken ödeme tazminatı en çok %${trNum(p.tazminatOran)})</small>`],
          ].filter(Boolean);
          d._sumHtml = `<details><summary>Faiz ve ödeme ayrıntıları</summary><table class="wizsum compact"><tbody>${rows.map(([a, v]) => `<tr><td>${a}</td><td>${v}</td></tr>`).join('')}</tbody></table>`
            + (p.faizSrc === 'varsayilan' ? '<p class="hint" style="margin:6px 0 0">Faiz ve çekilen tutar bilinmediği için ortalama faizle tahmin edildi. Sözleşmendeki oranı yazarsan tahmin güncellenir.</p>' : '') + '</details>';
          return `<div class="bigresult"><span>Kalan borcun</span><b>${M(p.kalanBorc)}</b><small>${p.kalan} taksit × ${M(p.aylik)}${sonYm ? ' · son taksit ' + C.fmtYM(sonYm) : ''}</small><small>Kalan ana para ${M(p.kalanAnapara)} · kalan faiz ve vergi ${M(Math.max(0, p.kalanBorc - p.kalanAnapara))}</small></div>`
            + (p.hata ? `<div class="issue uyari"><b>Kontrol et:</b> ${esc(p.hata)}</div>` : '');
        },
        live: (d) => d._sumHtml || '',
        validate: (d) => {
          if (d.loanAmount === 'ana' ? !(posNum(d.ana) > 0) : !(posNum(d.aylik) > 0)) return 'Bildiğin tutarı gir.';
          const kn = parseInt(d.kalan); if (!(kn >= 1 && kn <= 360)) return 'Kaç taksit kaldığını yazın (1 ile 360 arası).';
          if (!d.sonraki) return 'Sıradaki taksidin tarihini seçin.';
          if (!existing && d.stage === 'ongoing' && d.historyMode === 'yes') { const tn = parseInt(d.toplam); if (!(tn >= kn && tn <= 360)) return `Toplam taksit sayısı kalan taksitten (${kn}) az olamaz.`; }
          if (String(d.faiz).trim() !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 15)) return 'Aylık faiz 0 ile 15 arasında olmalı (yıllık değil, aylık oran).';
          if (existing) {
            if (kn + history.length > 360) return `En fazla ${360 - history.length} bekleyen taksit girebilirsiniz.`;
            if (scheduleChanged(d) && historyMonths.has(d.sonraki.slice(0, 7)) && d.sonraki !== firstPending?.vade_tarihi) return 'Bu ayda ödenmiş bir taksit var. Sıradaki taksit için başka bir ay seçin.';
          }
          const p = kalanPlan(d, nOf(d));
          if (p.hata) return p.hata;
          return '';
        } }],
      save: (d) => {
        const p = kalanPlan(d, nOf(d)), tur = kmhPlan ? tur0 : (d.tur || tur0);
        if (existing) {
          const loan = db.krediler.find((x) => x.id === editId);
          if (!loan) return;
          loan.kredi_adi = d.ad.trim() || C.uniqueName(d.banka ? `${d.banka} kredisi` : 'Taksitli borç', db.krediler.filter((x) => x !== loan).map((x) => x.kredi_adi));
          loan.banka = d.banka || 'Diğer';
          loan.kredi_turu = tur;
          if (p.ana > 0) loan.ana_para = p.ana;
          if (p.faiz != null && p.faiz >= 0) loan.faiz_orani = p.faiz;
          if (scheduleChanged(d)) {
            const aylik = posNum(d.aylik), kalan = parseInt(d.kalan);
            const ayniTarih = d.sonraki === firstPending?.vade_tarihi;
            const gun = ayniTarih ? loan.odeme_gunu : Number(d.sonraki.slice(8));
            let changed = pending.map((t) => ({ ...t, tutar: aylik }));
            if (!ayniTarih || kalan !== pending.length) {
              changed = [];
              let ym = d.sonraki.slice(0, 7);
              while (changed.length < kalan) {
                if (!historyMonths.has(ym)) changed.push({ ym, vade_tarihi: changed.length ? C.dueDate(ym, gun) : d.sonraki, tutar: aylik, odendi: false });
                ym = C.ymAdd(ym, 1);
              }
            }
            const taksitler = [...history, ...changed].sort((a, b) => a.vade_tarihi.localeCompare(b.vade_tarihi)).map((t, i) => ({ ...t, no: i + 1 }));
            Object.assign(loan, { odeme_gunu: gun, ilk_taksit_ym: taksitler[0].ym, toplam_taksit: taksitler.length, toplam_geri_odeme: C.sum(taksitler, (t) => t.tutar), taksitler });
          }
          save('Kredi güncellendi.');
          return;
        }
        const gun = parseInt(d.sonraki.split('-')[2]) || 15, ilkYm = C.ymAdd(d.sonraki.slice(0, 7), -p.odenen), toplam = C.r2(p.aylik * p.n);
        const taksitler = C.buildSchedule({ toplam, n: p.n, ilkYm, gun, odenenSayisi: p.odenen });
        const ad = d.ad.trim() || C.uniqueName(d.banka ? `${d.banka} kredisi` : 'Taksitli borç', db.krediler.map((x) => x.kredi_adi));
        if (kmhPlan) {      // Taksitli Artı Para / Ek Hesap: eksi hesaba "Taksitli KMH" kaydı olarak eklenir
          const kc = pre.kmh, lst = db.kmh_hesaplar, acc = kc.pid ? lst.find((x) => x.id === kc.pid) : kc.draft;
          if (!acc) return;
          if (!kc.pid && !lst.includes(acc)) lst.push(acc);
          acc.hareketler.push({ id: nextId(acc.hareketler, 1000), tur: 'Taksitli KMH', aciklama: ad, tarih: C.isoOf(now()), ilk_taksit_ym: ilkYm, ana_para: p.ana, faiz_orani: p.faiz, toplam_geri_odeme: toplam, toplam_taksit: p.n, taksitler });
          ui.selKmh = acc.id; save('KMH taksit planı eklendi.');
          if (pre.onDone) pre.onDone(acc.id);
          return;
        }
        db.krediler.push({ id: nextId(db.krediler, 300), banka: d.banka || 'Diğer', kredi_adi: ad, kredi_turu: tur, kullanim_tarihi: C.dueDate(C.ymAdd(ilkYm, -1), gun), ilk_taksit_ym: ilkYm, odeme_gunu: gun, ana_para: p.ana, faiz_orani: p.faiz, toplam_geri_odeme: toplam, toplam_taksit: p.n, taksitler });
        ui.debtFilter = 'KREDI';
        save('Kredi kaydedildi.');
        if (pre && pre.onDone) pre.onDone();
      },
    });
  }

  function wizYeni(d) {
    const n = Math.min(360, parseInt(d.n) || 0), faiz = num(d.faiz) || 0, ilk = d.ilk || nextDay15(1), vergi = C.vergiFor(S(), 'İhtiyaç Kredisi');
    const el = d.auto && d.auto.aylik ? 0 : posNum(d.aylik), ana0 = posNum(d.tutar);      // otomatik yazılan taksit hesaba katılmaz (yuvarlama farkı olmasın)
    const ana = ana0 > 0 ? ana0 : (el > 0 && n >= 1 ? C.r2(C.annuityPrincipal(el, faiz, n, vergi)) : 0);
    const toplam = n >= 1 && el > 0 ? C.r2(el * n) : (n >= 1 && ana > 0 ? C.annuityTotal(ana, faiz, n, vergi) : 0);
    return { ana, n, faiz, toplam, aylik: n >= 1 ? toplam / n : 0, ilkYm: ilk.slice(0, 7), gun: parseInt(ilk.split('-')[2]) || 15 };
  }
  function openAddYeni() {
    openWiz({
      baslik: 'Yeni harcama / borç', saveLabel: 'Ödeme planını kaydet',
      init: () => ({ ad: '', tutar: '', n: '', aylik: '', faiz: krediDefaultFaiz('İhtiyaç Kredisi'), ilk: nextDay15(1) }),
      steps: [{ soru: 'Tutar, vade ve faiz', ipucu: 'Bu üçünü yazın; ödeme planı aşağıda kendiliğinden oluşur.',
        html: (d) => fgrp('Borç', fld('Ne için? (isteğe bağlı)', `<input id="wz-ad" type="text" maxlength="60" value="${esc(d.ad)}" placeholder="Örn: Telefon, Araba">`) + fld('Tutar (₺)', moneyIn('wz-tutar', d.tutar))
            + fld('Kaç ay vadeli?', `<input id="wz-n" type="number" min="1" max="360" step="1" inputmode="numeric" value="${esc(d.n)}">`)
            + `<div class="chipsrow wide">${[3, 6, 9, 12, 24, 36, 48].map((n) => `<button type="button" class="btn sm" data-wzset="wz-n:${n}">${n} ay</button>`).join('')}</div>`)
          + fgrp('Faiz ve taksit', fld('Aylık faiz (%)', `<input id="wz-faiz" type="text" data-fmt="1" inputmode="decimal" value="${esc(d.faiz)}">`) + fld('Aylık taksit (₺)', moneyIn('wz-aylik', d.aylik)) + fld('İlk taksit günü', `<input id="wz-ilk" type="date" value="${esc(d.ilk)}">`)
            + `<div class="chipsrow wide"><button type="button" class="btn sm" data-wzset="wz-faiz:0">Faizsiz</button><small class="hint">Taksidi biliyorsanız yazın: tutar ya da faiz hesaplanır.</small></div>`),
        read: (d, b) => { d.ad = wzVal(b, 'wz-ad'); d.tutar = wzVal(b, 'wz-tutar'); d.n = wzVal(b, 'wz-n'); d.aylik = wzVal(b, 'wz-aylik'); d.faiz = wzVal(b, 'wz-faiz'); d.ilk = wzVal(b, 'wz-ilk'); const o = b.querySelector('#wz-onay'); if (o) d.onay = o.checked; },
        auto: { keys: { ana: 'wz-tutar', n: 'wz-n', aylik: 'wz-aylik', faiz: 'wz-faiz' }, init: () => ({ faiz: true }), defaults: () => ({ faiz: krediDefaultFaiz('İhtiyaç Kredisi') }), vergi: () => C.vergiFor(S(), 'İhtiyaç Kredisi') },
        liveTop: (d) => {
          const k = wizYeni(d);
          if (!(k.ana > 0) || !(k.n >= 1)) return '<div class="bigresult"><small>Tutarı ve kaç ay vadeli olduğunu yazın; aylık taksitiniz burada görünecek.</small></div>';
          const faizTop = C.r2(k.toplam - k.ana), iss = C.checkLoan({ aylik: k.aylik, toplam: k.n, ana: k.ana, faiz: k.faiz, faizBilinen: true, vergi: C.vergiFor(S(), 'İhtiyaç Kredisi') });
          return `<div class="bigresult"><span>Aylık taksitiniz</span><b>${M(k.aylik)}</b><small>${k.n} ay · toplam geri ödeme ${M(k.toplam)}${faizTop > 0.5 ? ` · faiz ${M(faizTop)}` : ' · faizsiz'}</small></div>` + issuesHtml(iss);
        },
        live: (d) => {
          const k = wizYeni(d);
          if (!(k.ana > 0) || !(k.n >= 1)) return '';
          const plan = C.buildSchedule({ toplam: k.toplam, n: k.n, ilkYm: k.ilkYm, gun: k.gun, odenenSayisi: 0 });
          let kalan = k.toplam;
          const rows = plan.map((t) => { kalan = C.r2(kalan - t.tutar); return `<tr><td>${t.no}</td><td>${C.fmtDate(t.vade_tarihi)}</td><td class="n">${M(t.tutar)}</td><td class="n">${M(Math.max(0, kalan))}</td></tr>`; });
          const shown = rows.length > 12 ? rows.slice(0, 12).join('') + `<tr><td colspan="4" class="muted">… ve ${rows.length - 12} taksit daha</td></tr>` : rows.join('');
          return `<b>Ödeme planınız</b><div class="plan"><table><thead><tr><th>#</th><th>Tarih</th><th class="n">Taksit</th><th class="n">Kalan borç</th></tr></thead><tbody>${shown}</tbody></table></div>`;
        },
        validate: (d) => {
          const k = wizYeni(d);
          if (!(k.ana > 0)) return 'Tutarı yazın.';
          const nRaw = parseInt(d.n);
          if (!(nRaw >= 1 && nRaw <= 360)) return 'Kaç ay vadeli olduğunu yazın (1 ile 360 arası).';
          if (!(num(d.faiz) >= 0 || String(d.faiz).trim() === '') || num(d.faiz) > 100) return 'Aylık faiz 0 ile 100 arasında olmalı.';
          if (!d.ilk) return 'İlk taksidin gününü seçin.';
          return '';
        } }],
      save: (d) => {
        const k = wizYeni(d);
        const taksitler = C.buildSchedule({ toplam: k.toplam, n: k.n, ilkYm: k.ilkYm, gun: k.gun, odenenSayisi: 0 });
        db.krediler.push({ id: nextId(db.krediler, 300), banka: 'Diğer', kredi_adi: d.ad.trim() || C.uniqueName('Yeni borç', db.krediler.map((x) => x.kredi_adi)), kredi_turu: 'İhtiyaç Kredisi', kullanim_tarihi: C.isoOf(new Date()), ilk_taksit_ym: k.ilkYm, odeme_gunu: k.gun, ana_para: k.ana, faiz_orani: k.faiz, toplam_geri_odeme: k.toplam, toplam_taksit: k.n, taksitler });
        ui.tab = 'KREDI'; save('Ödeme planı oluşturuldu.');
      },
    });
  }

  // ----- Dosyadan ekle: önce dosya yüklenir; bulunan kayıtlar eksikleriyle listelenir; her biri için bilgileri dolu form açılır -----
  const impNoteHtml = (r) => {
    const head = r && r.fromAi ? '<span class="ai-badge">✨ Yapay Zeka ile okundu</span> ' : '<b>Dosyadan okunanlar:</b> ';
    const bul = (r && Array.isArray(r.bulunan) ? r.bulunan : []).map(esc).join(' · ') || 'okunabilen bilgi yok';
    const notes = r && Array.isArray(r.notes) && r.notes.length ? ' ' + r.notes.map(esc).join(' ') : '';
    const eksik = r && Array.isArray(r.eksik) && r.eksik.length ? ' <b>Okunamayanlar:</b> ' + r.eksik.map(esc).join(', ') + '.' : '';
    return `${head}${bul}.${notes}${eksik} Okuma hatalı olabilir; lütfen kontrol edin.`;
  };
  const impKmhAdi = (it) => (it.ad || '').replace(/^Taksitli\s+/i, '').trim() || 'Avans Hesap';
  const impTitle = (it) => (it.urun === 'KREDI' ? (it.ad || 'Kredi') : it.urun === 'KMH' ? (it.taksitli ? `KMH taksit planı · ${it.ad || 'Taksitli hesap'}` : 'KMH (eksi hesap)') : 'Kredi kartı');
  const impSummary = (it) => (Array.isArray(it.bulunan) ? it.bulunan : []).filter((x) => !/^Banka:/.test(x)).join(' · ');
  const impAccList = (urun) => (urun === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari);
  const impAccName = (urun, x) => `${x.banka} · ${urun === 'KMH' ? x.hesap_adi : x.kart_adi}${x.limit > 0 ? ' · limit ' + M(x.limit) : ''}`;
  const impDefaultPid = (it) => { const same = it.bankaSec ? impAccList(it.urun).find((x) => x.banka === it.bankaSec) : null; return same ? String(same.id) : 'new'; };

  function impItemHtml(it, i, all) {
    const kart = it.urun !== 'KREDI', kmh = it.urun === 'KMH';
    let h = `<fieldset class="impitem"><label class="impon"><input type="checkbox" id="wz-i${i}-on" ${it.on ? 'checked' : ''}> <b>${i + 1}. ${esc(impTitle(it))}</b></label><p class="hint" style="margin:4px 0 8px">${esc(impSummary(it)) || 'Ayrıntı okunamadı'}</p>`;
    if (it.eksik && it.eksik.length) h += `<p class="warn-t" style="margin:0 0 8px">Okunamayan: ${it.eksik.map(esc).join(', ')}. Bir sonraki ekranda siz yazacaksınız.</p>`;
    if (!kart || it.taksitli) C.checkLoan({ aylik: it.aylik, kalan: it.kalan, toplam: it.toplam, ana: it.ana, faiz: it.faiz, faizBilinen: it.faiz != null, vergi: C.vergiFor(S(), it.tur || 'İhtiyaç Kredisi'), faizOneri: krediDefaultFaiz(it.tur || 'İhtiyaç Kredisi') }).concat(lateIssue(it.sonraki, it.kalan) || []).forEach((x) => { h += `<p class="issue ${x.seviye}"><b>${x.seviye === 'hata' ? 'Tutarsız:' : 'Dikkat:'}</b> ${esc(x.mesaj)}</p>`; });
    if (it.belirsiz) h += `<p class="hint" style="margin:0 0 4px">Bunun kredi kartı mı, KMH (eksi hesap) mı olduğunu anlayamadım, seçin:</p><div class="seg"><label><input type="radio" name="wz-i${i}-urun" value="KART" ${it.urun === 'KART' ? 'checked' : ''}> Kredi kartı</label><label><input type="radio" name="wz-i${i}-urun" value="KMH" ${it.urun === 'KMH' ? 'checked' : ''}> KMH (eksi hesap)</label></div>`;
    h += `<label>Banka<select id="wz-i${i}-banka"><option value="">Bankayı seçin</option>${BANKALAR.map((b) => `<option ${b === it.bankaSec ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></label>`;
    if (!kart) {
      h += `<label style="margin-top:8px">Borcun adı <span class="opt">(isteğe bağlı)</span><input id="wz-i${i}-ad" type="text" maxlength="60" value="${esc(it.adSec != null ? it.adSec : (it.ad || ''))}"></label>`;
    } else {
      const list = impAccList(it.urun), pick = it.pid || impDefaultPid(it);
      h += `<label style="margin-top:8px">${kmh ? 'Hangi hesaba eklensin?' : 'Hangi karta eklensin?'}<select id="wz-i${i}-pid">${list.map((x) => `<option value="${x.id}" ${String(x.id) === pick ? 'selected' : ''}>${esc(impAccName(it.urun, x))}</option>`).join('')}<option value="new" ${pick === 'new' ? 'selected' : ''}>＋ Yeni ${kmh ? 'KMH hesabı' : 'kredi kartı'} oluştur</option></select></label>`;
      const dup = pick === 'new' ? (all || []).findIndex((x, j) => j < i && x.on && x.urun === it.urun && x.bankaSec === it.bankaSec && (x.pid || impDefaultPid(x)) === 'new') : -1;
      h += dup >= 0 ? `<p class="hint" style="margin:8px 0 0">Bu kayıt, ${dup + 1}. kayıt için oluşturulacak aynı hesaba eklenecek.</p>`
        : `<label style="margin-top:8px">Yeni oluşturulacaksa adı<input id="wz-i${i}-yeni" type="text" maxlength="60" value="${esc(it.yeniAd != null ? it.yeniAd : (kmh ? (it.taksitli ? impKmhAdi(it) : 'Avans Hesap') : 'Kredi Kartı'))}"></label>`;
    }
    return h + '</fieldset>';
  }

  function impNewAccount(cat, it) {
    const kmh = cat === 'KMH', rt = R(), ad = (it.yeniAd || '').trim();
    return kmh
      ? { id: nextId(db.kmh_hesaplar, 100), banka: it.bankaSec, hesap_adi: ad || (it.taksitli ? impKmhAdi(it) : 'Avans Hesap'), limit: it.limit || 0, faiz_orani: it.faiz != null && !it.taksitli ? it.faiz : (rt ? rt.nakit_kmh.akdi : 3), hesap_kesim_gunu: it.son || it.kesim || 30, hareketler: [] }
      : { id: nextId(db.kredi_kartlari, 200), banka: it.bankaSec, kart_adi: ad || 'Kredi Kartı', limit: it.limit || 0, faiz_orani: it.faiz != null ? it.faiz : (rt ? rt.kart_30_180bin.akdi : 3.5), kesim_gunu: it.kesim || 15, son_odeme_gunu: it.son || 25, hareketler: [] };
  }

  /** Seçilen kayıtları sırayla, her biri için bilgileri dolu formu açarak ekler. Aynı bankada "yeni hesap" gereken kayıtlar tek hesapta toplanır. */
  function impRun(list, idx, created) {
    created = created || {};
    if (idx >= list.length) { if (list.length > 1) toast('Dosyadaki kayıtların aktarımı tamamlandı.'); return; }
    const it = list[idx], queue = list.length > 1 ? `${idx + 1}/${list.length}` : '';
    const cat = it.urun === 'KMH' ? 'KMH' : 'KART', key = `${cat}|${it.bankaSec}`;
    const pid = it.urun === 'KREDI' ? null : (it.pid && it.pid !== 'new' ? parseInt(it.pid) : (created[key] || null));
    const done = (id) => { if (id && it.urun !== 'KREDI' && !created[key]) created[key] = id; impRun(list, idx + 1, created); };
    const onSkip = list.length > 1 ? () => { $('dlg-wiz').close(); impRun(list, idx + 1, created); } : null;
    if (it.urun === 'KREDI' || it.taksitli) {
      const dd = { banka: it.bankaSec, ad: (it.adSec != null ? it.adSec : (it.ad || '')).trim() };
      dd.aylik = it.aylik > 0 ? trNum(it.aylik) : ''; dd.kalan = it.kalan >= 1 ? String(it.kalan) : ''; dd.toplam = it.toplam ? String(it.toplam) : ''; dd.ana = it.ana ? trNum(it.ana) : '';
      if (it.sonraki) dd.sonraki = it.sonraki;
      if (it.tur) { dd.tur = it.tur; dd.faiz = krediDefaultFaiz(it.tur); }
      if (it.faiz != null) { dd.faiz = trNum(it.faiz); dd.faizManual = true; }
      dd.impNote = impNoteHtml(it); dd.impStep = 0;
      openAddKalan(0, it.taksitli ? { d: dd, onDone: done, onSkip, queue, kmh: { pid, draft: pid ? null : impNewAccount('KMH', it) } } : { d: dd, onDone: done, onSkip, queue });
      return;
    }
    openAddHesapBorc(cat, pid, it, { draft: pid ? null : impNewAccount(cat, it), onDone: done, onSkip, queue });
  }

  function openImportWiz() {
    openWiz({
      baslik: 'Ekran görüntüsü / PDF\'den ekle', multi: true, saveLabel: 'Devam et',
      init: () => ({ items: [], rr: false }),
      importer: (d, ra) => {
        if (!ra.items.length) return { ok: false, msg: (ra.notes[0] || 'Dosyadan borç, limit ya da taksit bilgisi okunamadı.') + ' Daha net bir görüntü deneyin ya da bilgileri elle girin.' };
        d.items = ra.items.map((it) => { it.on = true; it.bankaSec = it.banka || ''; it.pid = impDefaultPid(it); return it; });
        return { ok: true, goto: 1 };
      },
      steps: [
        { soru: 'Ekran görüntüsünü veya PDF\'i seçin', ipucu: 'Bir veya birden çok dosya seçebilirsiniz. PDF başına ilk 10 sayfa cihazınızda okunur. Kaydetmeden önce bulunan borçları kontrol edin.', noNext: true, hideFooter: true,
          html: () => `<div class="impdrop">${importPicker('primary big')}<p class="hint" id="wz-imp-status" aria-live="polite"></p></div>
            <p class="hint" style="margin-top:14px">Dosyanız yok mu? <button type="button" class="linkbtn" data-wzgo="manual">Bilgileri elle gireyim</button></p>` },
        { soru: 'Dosyada bulunanlar', ipucu: 'Eklemek istemediğinizi işaretten çıkarın, eksik olan bankayı ve hesabı seçin. Ayrıntıları sonraki ekranlarda kontrol edeceksiniz.',
          html: (d) => d.items.map((it, i) => impItemHtml(it, i, d.items)).join(''),
          read: (d, b) => {
            d.items.forEach((it, i) => {
              const on = b.querySelector(`#wz-i${i}-on`); if (!on) return;
              it.on = on.checked; it.bankaSec = wzVal(b, `wz-i${i}-banka`);
              const u = wzRadio(b, `wz-i${i}-urun`); if (u && u !== it.urun) { it.urun = u; it.pid = impDefaultPid(it); d.rr = true; }
              if (it.urun === 'KREDI') it.adSec = wzVal(b, `wz-i${i}-ad`);
              else { const pid = wzVal(b, `wz-i${i}-pid`); if (pid) it.pid = pid; const yn = wzVal(b, `wz-i${i}-yeni`); if (yn !== '') it.yeniAd = yn; }
            });
          },
          live: (d) => { if (d.rr) { d.rr = false; setTimeout(renderWiz, 0); } return ''; },
          validate: (d) => {
            const sel = d.items.filter((x) => x.on);
            if (!sel.length) return 'En az bir kaydı işaretleyin.';
            const eksik = sel.find((x) => !x.bankaSec);
            return eksik ? `"${impTitle(eksik)}" için bankayı seçin.` : '';
          } },
      ],
      save: (d) => impRun(d.items.filter((x) => x.on), 0),
    });
  }

  /** Kart / KMH için dosyadan okunan borcu ve hesap bilgilerini gösterir; onaylanınca hesabı günceller ve borcu ekler. */
  function openAddHesapBorc(cat, pid, r, pre) {
    const kmh = cat === 'KMH', list = () => (kmh ? db.kmh_hesaplar : db.kredi_kartlari), find = () => (pid ? list().find((x) => x.id === pid) : (pre && pre.draft)), acc = find();
    if (!acc) { toast('Kart / hesap bulunamadı.', { err: true }); return; }
    const adi = kmh ? acc.hesap_adi : acc.kart_adi, sec = r && r.borclar ? r.borclar : [];
    const ilkAy = (d) => { const today = C.isoOf(new Date()), kes = parseInt(d.kesim) || 15; return kmh ? C.kmhFirstYm(today, kes, false) : C.cardFirstYm(today, kes, parseInt(d.son) || 25); };
    openWiz({
      baslik: (kmh ? 'KMH kullanımını ekle' : 'Kart borcunu ekle') + (pre && pre.queue ? ` · ${pre.queue}` : ''), saveLabel: 'Kaydet', onSkip: pre && pre.onSkip,
      init: () => ({
        tutar: sec.length ? trNum(sec[0].tutar) : '', limit: (r && r.limit) || acc.limit > 0 ? trNum(r && r.limit ? r.limit : acc.limit) : '',
        kesim: String(kmh ? ((r && (r.son || r.kesim)) || acc.hesap_kesim_gunu) : ((r && r.kesim) || acc.kesim_gunu)),
        son: String((r && r.son) || acc.son_odeme_gunu || 25), faiz: trNum(r && r.faiz != null ? r.faiz : acc.faiz_orani),
        impNote: r ? impNoteHtml(r) : '', impStep: 0,
      }),
      steps: [{ soru: `${pid ? '' : 'Yeni: '}${esc(acc.banka)} · ${esc(adi)}`, ipucu: kmh ? 'Hesaptan şu an kullandığınız (borçlu olduğunuz) tutarı yazın.' : 'Kartta şu an ödemeniz gereken borcu yazın. Bankanın ekranında "ekstre borcu" ya da "toplam borç" olarak geçer.',
        html: (d) => `<label>${kmh ? 'Kullanılan tutar' : 'Kart borcu'} (₺)${moneyIn('wz-tutar', d.tutar)}</label>`
          + (sec.length > 1 ? `<p class="hint" style="margin:8px 0 4px">Dosyada birden çok tutar bulundu, hangisini yazalım?</p><div class="chipsrow">${sec.map((b) => `<button type="button" class="btn sm" data-wzset="wz-tutar:${trNum(b.tutar)}">${esc(b.ad)} ${M(b.tutar)}</button>`).join('')}</div>` : '')
          + moreBox(!!r, `<label style="margin-top:12px">Toplam limit (₺) <span class="opt">(isteğe bağlı)</span>${moneyIn('wz-limit', d.limit)}</label>`
            + `<label style="margin-top:12px">${kmh ? 'Hesap kesim / ödeme günü' : 'Hesap kesim günü'}<input id="wz-kesim" type="number" min="1" max="31" step="1" value="${esc(d.kesim)}"></label>`
            + (kmh ? '' : `<label style="margin-top:12px">Son ödeme günü<input id="wz-son" type="number" min="1" max="31" step="1" value="${esc(d.son)}"></label>`)
            + faizField(d, 'Bilmiyorsanız olduğu gibi bırakın.')),
        read: (d, b) => { d.tutar = wzVal(b, 'wz-tutar'); d.limit = wzVal(b, 'wz-limit'); d.kesim = wzVal(b, 'wz-kesim'); if (!kmh) d.son = wzVal(b, 'wz-son'); d.faiz = wzVal(b, 'wz-faiz'); },
        liveTop: (d) => (posNum(d.tutar) > 0
          ? `<div class="bigresult"><span>Eklenecek borç</span><b>${M(posNum(d.tutar))}</b><small>İlk ödeme: ${C.fmtYM(ilkAy(d))}</small></div>`
          : '<div class="bigresult"><small>Borç tutarını yazın. Boş bırakırsanız yalnızca kart / hesap bilgileri güncellenir.</small></div>'),
        validate: (d) => {
          const ok = (v) => { const x = parseInt(v); return x >= 1 && x <= 31; };
          if (!ok(d.kesim)) return 'Kesim günü 1 ile 31 arasında olmalı.';
          if (!kmh && !ok(d.son)) return 'Son ödeme günü 1 ile 31 arasında olmalı.';
          if (String(d.faiz).trim() !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 100)) return 'Aylık faiz 0 ile 100 arasında olmalı.';
          return '';
        } }],
      save: (d) => {
        const a = find(); if (!a) return;
        if (!pid && !list().includes(a)) list().push(a);
        const lim = posNum(d.limit), kes = parseInt(d.kesim), son = parseInt(d.son), faiz = num(d.faiz) || 0, tutar = posNum(d.tutar);
        if (lim > 0) a.limit = lim;
        a.faiz_orani = faiz;
        if (kmh) a.hesap_kesim_gunu = kes; else { a.faiz_otomatik = !String(d.faiz).trim(); a.kesim_gunu = kes; if (son) a.son_odeme_gunu = son; }
        if (tutar > 0) {
          const today = C.isoOf(new Date()), ym = ilkAy(d), gun = kmh ? kes : (son || 25);
          const toplam = kmh ? C.annuityTotal(tutar, faiz, 1, C.vergiFor(S())) : tutar;
          a.hareketler.push({ id: nextId(a.hareketler, 1000), tur: kmh ? 'Nakit Kullanım / Harcama' : 'Tek Çekim Harcama', aciklama: kmh ? 'Mevcut KMH borcu' : 'Mevcut kart borcu', tarih: today, ilk_taksit_ym: ym, ana_para: tutar, faiz_orani: kmh ? faiz : 0, toplam_geri_odeme: toplam, toplam_taksit: 1, taksitler: C.buildSchedule({ toplam, n: 1, ilkYm: ym, gun, odenenSayisi: 0 }) });
        }
        if (kmh) ui.selKmh = a.id; else ui.selKart = a.id;
        ui.tab = cat; ui.view = 'borclar'; save('Kaydedildi.');
        if (pre && pre.onDone) pre.onDone(a.id);
      },
    });
  }

  // ----- Kredi -----
  // Yalnızca bankanın ekranında görülen bilgiler istenir: taksit tutarı, kalan taksit, sıradaki taksit tarihi.
  // Faiz, toplam taksit ve çekilen tutar "Daha fazla bilgi" içinde isteğe bağlıdır.
  const moreBox = (open, inner) => `<details class="more"${open ? ' open' : ''}><summary>Daha fazla bilgi <span class="opt">(isteğe bağlı)</span></summary>${inner}</details>`;
  const faizField = (d, hint) => `<label style="margin-top:12px">Aylık faiz (%)<input id="wz-faiz" type="text" data-fmt="1" inputmode="decimal" value="${esc(d.faiz)}">${hint ? `<small class="hint">${hint}</small>` : ''}</label>`;
  function wizKredi(d) {
    const aylik = posNum(d.aylik), kalan = Math.min(360, Math.max(1, parseInt(d.kalan) || 1));
    const n = Math.min(360, Math.max(kalan, parseInt(d.toplam) || kalan)), odenen = n - kalan;
    const faiz = num(d.faiz) || 0, vergi = C.vergiFor(S(), d.tur), ana0 = posNum(d.ana);
    const sonrakiIso = d.sonraki || C.isoOf(new Date()), sonYm = sonrakiIso.slice(0, 7);
    const ana = ana0 > 0 ? ana0 : C.r2(C.annuityPrincipal(aylik, faiz, n, vergi));
    return { aylik, kalan, n, odenen, faiz, ana, toplam: C.r2(aylik * n), kalanToplam: C.r2(aylik * kalan), ilkYm: C.ymAdd(sonYm, -odenen), sonTaksitYm: C.ymAdd(sonYm, kalan - 1), gun: parseInt(sonrakiIso.split('-')[2]) || 15 };
  }

  // ----- Harcama / kullanım (kart veya KMH) -----
  function openWizHar(cat, pid) {
    const hesaplar = cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari;
    if (!hesaplar.length) { toast(`Önce bir ${cat === 'KMH' ? 'KMH hesabı' : 'kredi kartı'} ekleyin.`, { err: true }); return; }
    const turler = TUR[cat], r = R();
    const TUR_AYRINTI = { 'Tek Çekim Harcama': 'Tek seferde ödenir (ekstre borcu da olabilir)', 'Taksitli Alışveriş': 'Mağazada taksitle alışveriş', 'Taksitli Nakit Avans': 'Karttan çekilen nakit, taksitli', 'Nakit Kullanım / Harcama': 'Hesaptan tek seferlik kullanım', 'Taksitli KMH': 'Kullanımı taksitlendirdiniz' };
    const defs = (tur, p) => (tur === 'Tek Çekim Harcama' ? { n: 1, faiz: 0 } : tur === 'Nakit Kullanım / Harcama' ? { n: 1, faiz: p.faiz_orani || 0 } : tur === 'Taksitli Nakit Avans' ? { n: 3, faiz: p.faiz_orani || (r ? r.nakit_kmh.akdi : 0) } : tur === 'Taksitli KMH' ? { n: 6, faiz: p.faiz_orani || 0 } : { n: 3, faiz: 0 });
    const hp = (d) => hesaplar.find((x) => x.id === parseInt(d.pid)) || hesaplar[0];
    // İlk taksit ayı: ödenmiş taksit varsa, sıradaki ödenmemiş taksit bugüne göre bulunur ve ödenen sayısı kadar geriye gidilir.
    const firstYm = (d) => {
      const p = hp(d), tur = d.tur, o = tekCekim(d) ? 0 : Math.min(parseInt(d.n) || 60, Math.max(0, parseInt(d.odenen) || 0)), iso = o > 0 ? C.isoOf(new Date()) : d.tarih;
      return C.ymAdd(cat === 'KMH' ? C.kmhFirstYm(iso, p.hesap_kesim_gunu || 30, tur.includes('Taksitli')) : C.cardFirstYm(iso, p.kesim_gunu || 15, p.son_odeme_gunu || 25), -o);
    };
    const tekCekim = (d) => d.tur === 'Tek Çekim Harcama' || d.tur === 'Nakit Kullanım / Harcama';
    openWiz({
      baslik: cat === 'KMH' ? 'KMH kullanımı ekle' : 'Karta harcama ekle',
      init: () => { const p = hesaplar.find((x) => x.id === pid) || hesaplar[0]; return Object.assign({ pid: p.id, pidLocked: !!pid, tur: turler[0], ack: '', tutar: '', tarih: C.isoOf(new Date()), ilkYm: null, ilkManual: false, odenen: '', aylik: '', faizManual: false }, defs(turler[0], p)); },
      steps: [
        { soru: cat === 'KMH' ? 'Hangi KMH hesabından?' : 'Hangi karttan?', html: (d) => `<select id="wz-pid">${hesaplar.map((x) => `<option value="${x.id}" ${x.id === parseInt(d.pid) ? 'selected' : ''}>${esc(x.banka)} · ${esc(cat === 'KMH' ? x.hesap_adi : x.kart_adi)}</option>`).join('')}</select>`,
          skip: (d) => d.pidLocked, read: (d, b) => { const v = wzVal(b, 'wz-pid'); if (v) d.pid = parseInt(v); } },
        { soru: 'Ne tür bir işlem?', html: (d) => choiceHtml('wz-tur', turler.map((t) => [t, t, TUR_AYRINTI[t]]), d.tur) + `<label style="margin-top:14px">Ne için? <span class="opt">(isteğe bağlı)</span><input id="wz-ack" type="text" maxlength="80" value="${esc(d.ack)}" placeholder="Örn: Telefon, Market"></label>`,
          read: (d, b) => { const t = wzRadio(b, 'wz-tur') || d.tur; if (t !== d.tur) { Object.assign(d, defs(t, hp(d)), { faizManual: false }); d.auto = Object.assign({}, d.auto, { n: true, faiz: true }); d.tur = t; if (!d.ilkManual) d.ilkYm = null; } d.ack = wzVal(b, 'wz-ack'); } },
        { soru: 'Tutar ve tarih', ipucu: 'Faiz hariç, harcadığınız / çektiğiniz tutar.',
          html: (d) => {
            const tek = tekCekim(d);
            if (!d.ilkManual && d.tarih) d.ilkYm = firstYm(d);
            const faizHint = d.tur === 'Taksitli Alışveriş' ? 'Çoğu alışverişte 0. Bankanız faiz uyguluyorsa girin.' : (r ? `TCMB azami nakit/KMH: ${pct(r.nakit_kmh.akdi)}` : '');
            const faizIn = `<input id="wz-faiz" type="text" data-fmt="1" inputmode="decimal" value="${esc(d.faiz)}">`, ilkSel = `<select id="wz-ilk">${monthOpts(d.ilkYm, null, 60)}</select>`;
            const nIn = `<input id="wz-n" type="number" min="1" max="60" step="1" value="${esc(d.n)}">`;
            return fgrp('Tutar', fld('Tutar (₺)', moneyIn('wz-tutar', d.tutar)) + (tek ? '' : fld('Kaç taksit?', nIn)) + fld('İşlem tarihi', `<input id="wz-tarih" type="date" value="${esc(d.tarih)}">`)
                + (tek ? '' : `<div class="chipsrow wide">${[2, 3, 6, 9, 12, 18, 24].map((n) => `<button type="button" class="btn sm" data-wzset="wz-n:${n}">${n}</button>`).join('')}</div>`))
              + fgrp(tek ? 'Ödeme' : 'Taksit ve faiz', (tek ? '' : fld('Aylık taksit (₺)', moneyIn('wz-aylik', d.aylik)) + fld('Ödenen taksit', `<input id="wz-odenen" type="number" min="0" step="1" value="${esc(d.odenen)}">`))
                + (d.tur === 'Tek Çekim Harcama' ? '' : fld('Aylık faiz (%)', faizIn)) + fld(tek ? 'Ödeme ayı' : 'İlk taksit ayı', ilkSel)
                + (faizHint && d.tur !== 'Tek Çekim Harcama' ? `<small class="hint wide">${faizHint}</small>` : ''));
          },
          read: (d, b) => {
            d.tutar = wzVal(b, 'wz-tutar');
            if (!tekCekim(d)) { d.n = wzVal(b, 'wz-n'); d.aylik = wzVal(b, 'wz-aylik'); d.odenen = wzVal(b, 'wz-odenen'); }
            if (d.tur !== 'Tek Çekim Harcama') d.faiz = wzVal(b, 'wz-faiz');
            const t = wzVal(b, 'wz-tarih'), ilk = wzVal(b, 'wz-ilk'), sel = b.querySelector('#wz-ilk');
            if (ilk && ilk !== d.ilkYm) { d.ilkYm = ilk; d.ilkManual = true; }
            else if (t && t !== d.tarih && !d.ilkManual) {
              d.tarih = t; d.ilkYm = firstYm(d);
              if (sel) { if (![...sel.options].some((o) => o.value === d.ilkYm)) sel.add(new Option(C.fmtYM(d.ilkYm), d.ilkYm)); sel.value = d.ilkYm; }
            }
            d.tarih = t;
            if (!d.ilkManual && d.tarih) { const y = firstYm(d); if (y !== d.ilkYm) { d.ilkYm = y; if (sel) { if (![...sel.options].some((o) => o.value === y)) sel.add(new Option(C.fmtYM(y), y)); sel.value = y; } } }
          },
          auto: { keys: { ana: 'wz-tutar', n: 'wz-n', aylik: 'wz-aylik', faiz: 'wz-faiz' }, init: () => ({ n: true, faiz: true }), defaults: (d) => defs(d.tur, hp(d)), vergi: () => C.vergiFor(S()) },
          live: (d) => {
            const L = limitLeft(hp(d), 0), kInfo = L ? `Kalan limit: <b>${M(L.kalan)}</b> / ${M(L.limit)}` : '';
            if (!d.tarih) return kInfo;
            const k = wizHar(d, cat, hp(d), firstYm); if (!(k.ana > 0)) return kInfo;
            const need = harLimitNeed(k), asil = L && need > L.kalan + 0.005;
            const bas = tekCekim(d) ? `Ödeme ayı: <b>${C.fmtYM(k.ilkYm)}</b>` : `Aylık taksit <b>${M(k.aylik)}</b> × ${k.n} · ilk ödeme <b>${C.fmtYM(k.ilkYm)}</b>`;
            const lim = L ? `<br>${kInfo} · ${asil ? `<span class="bad-t">bu tutar limiti <b>${M(need - L.kalan)}</b> aşıyor, eklenemez</span>` : `işlemden sonra <b>${M(L.kalan - need)}</b>`}` : '';
            return (posNum(d.tutar) > 0 ? bas : `${bas} · tutar yaklaşık ${M(k.ana)}`) + lim;
          },
          validate: (d) => {
            const tek = tekCekim(d);
            if (!(posNum(d.tutar) > 0) && (tek || !(posNum(d.aylik) > 0))) return tek ? 'Tutarı yazın.' : 'Tutarı yazın. Bilmiyorsanız aşağıdaki \'Aylık taksit\' alanını doldurun.';
            if (!tek) { const n = parseInt(d.n); if (!(n >= 1 && n <= 60)) return 'Taksit sayısı 1 ile 60 arasında olmalı.'; const o = parseInt(d.odenen) || 0; if (o < 0 || o > n) return `Ödenen taksit 0 ile ${n} arasında olmalı.`; }
            if (!d.tarih) return 'İşlem tarihini seçin.';
            const L = limitLeft(hp(d), 0), need = harLimitNeed(wizHar(d, cat, hp(d), firstYm));
            if (L && need > L.kalan + 0.005) return `Kalan limitiniz ${M(Math.max(0, L.kalan))}; ${M(need)} tutarındaki kullanım limiti aşıyor. Tutarı azaltın.`;
            return '';
          } },
        { soru: 'Bilgileri kontrol edin', ipucu: 'Yanlış bir şey varsa Geri ile düzeltin; doğruysa Kaydet.', html: (d) => { const k = wizHar(d, cat, hp(d), firstYm); return `<table class="wizsum"><tbody>
            <tr><td>${cat === 'KMH' ? 'Hesap' : 'Kart'}</td><td>${esc(hp(d).banka)} · ${esc(cat === 'KMH' ? hp(d).hesap_adi : hp(d).kart_adi)}</td></tr><tr><td>İşlem</td><td>${esc(d.ack || d.tur)} (${esc(d.tur)})</td></tr><tr><td>Tutar</td><td>${M(k.ana)}</td></tr>
            <tr><td>Taksit</td><td>${k.n} × ${M(k.aylik)}</td></tr><tr><td>Aylık faiz</td><td>${pct(k.faiz)}</td></tr><tr><td>Toplam geri ödeme</td><td>${M(k.toplam)}</td></tr><tr><td>Faiz maliyeti</td><td class="bad-t">${M(Math.max(0, k.toplam - k.ana))}</td></tr>
            <tr><td>İşlem tarihi</td><td>${C.fmtDate(d.tarih)}</td></tr><tr><td>İlk ödeme</td><td>${C.fmtYM(k.ilkYm)}</td></tr><tr><td>Son ödeme</td><td>${C.fmtYM(C.ymAdd(k.ilkYm, k.n - 1))}</td></tr><tr><td>Ödenmiş / kalan</td><td>${k.odenen} / ${k.n - k.odenen} taksit</td></tr></tbody></table>`; } },
      ],
      save: (d) => {
        const p = hp(d), k = wizHar(d, cat, p, firstYm);
        const taksitler = C.buildSchedule({ toplam: k.toplam || k.ana, n: k.n, ilkYm: k.ilkYm, gun: cat === 'KMH' ? (p.hesap_kesim_gunu || 30) : (p.son_odeme_gunu || 25), odenenSayisi: k.odenen });
        p.hareketler.push({ id: nextId(p.hareketler, 1000), tur: d.tur, aciklama: d.ack.trim() || d.tur, tarih: d.tarih, ilk_taksit_ym: k.ilkYm, ana_para: k.ana, faiz_orani: k.faiz, toplam_geri_odeme: k.toplam || k.ana, toplam_taksit: k.n, taksitler });
        if (cat === 'KMH') ui.selKmh = p.id; else ui.selKart = p.id;
        ui.tab = cat; ui.view = 'borclar'; save('Kaydedildi.');
      },
    });
  }
  /** Yeni kalemin limitten düşeceği tutar: ödenmiş taksit varsa yalnızca kalan taksitlerin ana para payı. */
  function harLimitNeed(k) { return k.odenen > 0 ? C.r2(k.ana * (k.n - k.odenen) / k.n) : k.ana; }
  function wizHar(d, cat, p, firstYm) {
    const tek = d.tur === 'Tek Çekim Harcama' || d.tur === 'Nakit Kullanım / Harcama';
    const ana0 = posNum(d.tutar), n = tek ? 1 : Math.max(1, parseInt(d.n) || 1), faiz = d.tur === 'Tek Çekim Harcama' ? 0 : (num(d.faiz) || 0), el = tek || (d.auto && d.auto.aylik) ? 0 : posNum(d.aylik), vergi = C.vergiFor(S());
    const ana = ana0 > 0 ? ana0 : (el > 0 ? C.r2(C.annuityPrincipal(el, faiz, n, vergi)) : 0); const toplam = el > 0 ? C.r2(el * n) : C.annuityTotal(ana, faiz, n, vergi);
    return { ana, n, faiz, toplam, aylik: toplam / n, ilkYm: d.ilkYm || firstYm(d), odenen: tek ? 0 : Math.min(n, Math.max(0, parseInt(d.odenen) || 0)) };
  }

  // ----- Kart / vadesiz hesap tanımla -----
  // Vadesiz hesap: hesaptaki para + isteğe bağlı artı para (KMH) limiti. Kart: limit, hesap kesim ve son ödeme günü.
  function openWizHesap(cat, pre) {
    const r = R(), dayOk = (v) => { const x = Number(v); return Number.isInteger(x) && x >= 1 && x <= 31; };
    const isK = (d) => d.cat === 'KMH';
    const defFaiz = (c) => (c === 'KMH' ? (r ? r.nakit_kmh.akdi : 4.5) : (r ? r.kart_30bin_alti.akdi : 4.25));
    openWiz({
      baslik: cat === 'KMH' ? 'Vadesiz hesap ekle' : cat === 'KART' ? 'Kredi kartı ekle' : 'Kart / hesap ekle',
      saveLabel: 'Kaydet',
      init: () => { const c = cat || 'KART'; return { cat: c, catFixed: !!cat, banka: (pre && pre.banka) || 'Türkiye İş Bankası', ad: '', limit: '', faiz: '', kesim: c === 'KMH' ? '30' : '', son: '', para: '', kullanilan: '' }; },
      localDocument: true,
      importer: (d, result) => {
        if (result.kind === 'kredi' || !(result.banka || result.limit || result.kesim || result.son)) return { ok:false, msg:'Hesap bilgisi bulunamadı. Başka bir belge seçebilir veya geri dönüp elle girebilirsin.' };
        if (BANKALAR.includes(result.banka)) d.banka = result.banka;
        if (result.limit) { d.limit = trNum(result.limit); d.overdraft = 'yes'; }
        if (result.kesim) d.kesim = String(result.kesim);
        if (!isK(d) && result.son) d.son = String(result.son);
        return {ok:true, goto:wiz.i + 1};
      },
      steps: [
        wizardChoice('cat','Ne eklemek istiyorsun?', [['KART','Kredi kartı'],['KMH','Vadesiz hesap']], {skip: d => d.catFixed, change: (d,v) => {
          if (d.cat !== v) Object.assign(d,{kesim:v === 'KMH' ? '30' : '',son:'',limit:'',faiz:'',overdraft:''});
        }}),
        entryMethod(), uploadStep(),
        {id:'account',edit:'Hesabı',soru: d => isK(d) ? 'Hangi banka hesabı?' : 'Hangi kredi kartı?',
          html: d => fgrp('Hesap',fld('Banka',bankSelect('wz-banka',d.banka))
            + fld(isK(d) ? 'Hesap adı (isteğe bağlı)' : 'Kart adı (isteğe bağlı)', `<input id="wz-ad" maxlength="60" value="${esc(d.ad)}">`)
            + (isK(d) ? fld('Hesaptaki para (₺)',moneyIn('wz-para',d.para) + '<small class="hint">Eksi bakiyen varsa 0 yaz. Kullanılan artı parayı hesabı açtıktan sonra harcama olarak ekleyebilirsin.</small>') : '')), read: readDraft },
        wizardChoice('overdraft','Hesabında artı para limiti var mı?', [['no','Hayır'],['yes','Evet, limitimi gireceğim']], {skip: d => !isK(d)}),
        {id:'accountTerms',edit:'Koşulları',soru: d => isK(d) ? 'Artı para bilgileri' : 'Kart limiti ve ödeme günleri', skip: d => isK(d) && d.overdraft !== 'yes',
          html: d => fgrp(isK(d) ? 'Artı para' : 'Kart bilgileri', fld(isK(d) ? 'Artı para limiti (₺) *' : 'Toplam kart limiti (₺) *',moneyIn('wz-limit',d.limit))
            + dayField('kesim',isK(d) ? 'Faizin işlendiği gün *' : 'Hesap kesim günü *',d.kesim)
            + (isK(d) ? '' : dayField('son','Son ödeme günü *',d.son))
            + fld('Aylık faiz (%)', moneyIn('wz-faiz',d.faiz) + '<small class="hint">Boş bırakırsan tahminlerde azami oran kullanılır.</small>')), read:readDraft,
          validate: d => !posNum(d.limit) ? 'Limiti yaz.' : !dayOk(d.kesim) || (!isK(d) && !dayOk(d.son)) ? 'Günleri 1 ile 31 arasında gir.' : d.faiz !== '' && !(num(d.faiz) >= 0 && num(d.faiz) <= 15) ? 'Aylık faiz 0 ile 15 arasında olmalı.' : '' },
        {soru:d => isK(d) ? 'Hesabı kontrol et' : 'Kartı kontrol et',
          html:d => reviewRows([['Banka',d.banka],['Ad',d.ad || (isK(d) ? 'Vadesiz hesap' : 'Kredi kartı')],
            isK(d) && ['Bakiye',M(posNum(d.para))],(!isK(d) || d.overdraft === 'yes') && ['Limit',M(posNum(d.limit))],
            (!isK(d) || d.overdraft === 'yes') && [isK(d) ? 'Faiz günü' : 'Kesim günü',d.kesim],
            !isK(d) && ['Son ödeme günü',d.son],(!isK(d) || d.overdraft === 'yes') && ['Aylık faiz',d.faiz !== '' ? pct(num(d.faiz)) : pct(defFaiz(d.cat)) + ' · tahmini']]) + reviewLinks() }
      ],
      save: (d) => {
        if (isK(d) && d.overdraft !== 'yes') Object.assign(d, { limit: '', faiz: '', kesim: '30' });
        const kmh = isK(d), faiz = String(d.faiz).trim() !== '' ? num(d.faiz) : defFaiz(d.cat);
        const base = { banka: d.banka || 'Diğer', limit: posNum(d.limit), faiz_orani: faiz, hareketler: [] };
        if (kmh) {
          const id = nextId(db.kmh_hesaplar, 100), bak = C.r2(posNum(d.para));
          db.kmh_hesaplar.push(Object.assign({ id, hesap_adi: d.ad.trim() || C.uniqueName('Vadesiz hesap', db.kmh_hesaplar.map((x) => x.hesap_adi)), hesap_kesim_gunu: parseInt(d.kesim) || 30, bakiye: bak, islemler: [] }, base)); ui.selKmh = id;
        } else {
          const id = nextId(db.kredi_kartlari, 200), k = parseInt(d.kesim) || 15;
          db.kredi_kartlari.push(Object.assign({ id, kart_adi: d.ad.trim() || C.uniqueName('Kredi kartı', db.kredi_kartlari.map((x) => x.kart_adi)), kesim_gunu: k, son_odeme_gunu: parseInt(d.son), faiz_otomatik: !String(d.faiz).trim() }, base)); ui.selKart = id;
        }
        ui.debtFilter = 'ALL'; save(kmh && posNum(d.limit) > 0 ? 'Hesap eklendi. Artı paradan kullandığın tutarları "Harcama ekle"den gir.' : `${kmh ? 'Hesap' : 'Kart'} eklendi.`);
        if (pre && pre.onDone) pre.onDone(kmh ? ui.selKmh : ui.selKart);
      },
    });
  }

  // ---------- Sayı kutuları: yazarken 100.000,12 biçimi ----------
  const groupDigits = (d) => d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function fmtTR(raw) {
    const s = String(raw).replace(/[^\d,]/g, ''), ci = s.indexOf(',');
    let ip = ci < 0 ? s : s.slice(0, ci); const dp = ci < 0 ? null : s.slice(ci + 1).replace(/,/g, '').slice(0, 2);
    ip = ip.replace(/^0+(?=\d)/, '');
    if (ip === '' && dp !== null) ip = '0';
    return groupDigits(ip) + (dp !== null ? ',' + dp : '');
  }
  const numToTR = (n) => { const t = (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, ''); return fmtTR(t.replace('.', ',')); };
  function normalizeFmt(el) {
    if (!el.value) return;
    const n = num(el.value);
    if (Number.isFinite(n) && n >= 0) { const v = numToTR(n); if (v !== el.value) el.value = v; }
  }
  const fmtAll = (root) => (root.querySelectorAll ? root.querySelectorAll('input[data-fmt]') : []).forEach((el) => { if (el !== document.activeElement) normalizeFmt(el); });
  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!el.dataset || !el.dataset.fmt || el.type !== 'text') return;
    let v = el.value, caret = el.selectionStart == null ? v.length : el.selectionStart;
    if (ev.data === '.') { v = v.slice(0, caret - 1) + ',' + v.slice(caret); }    // nokta = ondalık ayracı
    else if ((ev.data?.length > 1 || ev.inputType === 'insertFromPaste' || ev.inputType === 'insertFromDrop')
      && v.lastIndexOf('.') > v.lastIndexOf(',') && /\.\d{1,2}\s*$/.test(v)) {
      const decimal = v.lastIndexOf('.');
      v = v.slice(0, decimal).replace(/[,.]/g, '') + ',' + v.slice(decimal + 1);
    }
    const right = v.slice(caret).replace(/[^\d,]/g, '').length;
    const out = fmtTR(v);
    if (out !== el.value) {
      el.value = out;
      let pos = out.length, seen = 0;
      while (pos > 0 && seen < right) { pos--; if (/[\d,]/.test(out[pos])) seen++; }
      try { el.setSelectionRange(pos, pos); } catch (e) { /* desteklenmiyorsa geç */ }
    }
  });
  document.addEventListener('focusin', (ev) => { if (ev.target.dataset && ev.target.dataset.fmt) normalizeFmt(ev.target); });
  new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) { fmtAll(n); hydrateIcons(n); } }))).observe(document.body, { childList: true, subtree: true });
  const _showModal = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function () { _showModal.call(this); fmtAll(this); sfx.play('open'); };
  hydrateIcons(); renderSesBtn();

  // ---------- Hesap ve bulut eşitleme (isteğe bağlı) ----------
  const CFG = window.KESE_CONFIG || {};
  let syncApi = null, conflictInfo = null;
  const syncState = { status: 'out', lastSyncAt: null, message: '' };
  const cloudOn = () => !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase && window.KeseSync && KeseStore.mode === 'local');
  const userEmail = () => { const se = syncApi && syncApi.getSession(); return se && se.user ? se.user.email || '' : ''; };
  const fmtWhen = (t) => (t ? new Date(t).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—');
  const STATUS_TXT = { out: 'Üye ol · verilerinizi koruyun', syncing: 'Eşitleniyor…', synced: 'Eşitlendi', offline: 'Çevrimdışı · bekliyor', conflict: 'Karar bekliyor', error: 'Eşitlenemedi' };
  function renderSyncChip() {
    const b = $('sync-chip'); if (!b) return;
    b.hidden = !cloudOn();
    if (b.hidden) return;
    const out = syncState.status === 'out';
    const icName = out ? 'upload' : syncState.status === 'synced' ? 'check' : syncState.status === 'error' || syncState.status === 'conflict' ? 'warn' : 'refresh';
    b.className = 'mt-btn' + (out ? '' : ' on') + ' st-' + syncState.status;
    b.innerHTML = icon(icName);
    b.dataset.act = out ? 'auth-open' : 'sync-open';
    const label = out ? 'Hesap aç veya giriş yap' : `Hesap (${STATUS_TXT[syncState.status] || ''}): ${userEmail()}`;
    b.title = label;
    b.setAttribute('aria-label', label);
    const panel = $('sync-panel'); if (panel) panel.innerHTML = syncPanelInner();
    renderNudge();
  }
  function renderNudge() {
    const n = $('nudge'); if (!n) return;
    let off = false; try { off = Number(localStorage.getItem('kese_nudge_until') || 0) > Date.now(); } catch (e) { /* yok say */ }
    const has = db ? (db.krediler.length + db.kredi_kartlari.length + db.kmh_hesaplar.length + db.ek_gelirler.length) > 0 : false;
    n.hidden = !(cloudOn() && syncState.status === 'out' && has && !off && !sbx.on);
    if (!n.hidden && !n.innerHTML) n.innerHTML = `<span>${icon('shield')} <b>Verilerinizi kaybetmeyin.</b> Üyelik zorunlu değil; isterseniz ücretsiz hesap açıp verilerinizi yedekleyin ve cihazlar arası eşitleyin.</span><span class="nb"><button class="btn sm primary" data-act="auth-open">Üye ol / Giriş yap</button><button class="btn sm" data-act="nudge-close">Şimdi değil</button></span>`;
  }
  function syncPanelInner() {
    if (!cloudOn()) return '';
    if (syncState.status === 'out') return `<p class="muted" style="margin:0 0 10px">Şu an verileriniz yalnızca bu cihazda. Ücretsiz bir hesap açarsanız verileriniz hesabınıza (AB bölgesindeki sunucuda) yedeklenir ve telefon, bilgisayar arasında eşitlenir. Hesap <b>zorunlu değildir</b>.</p><button class="btn primary" data-act="auth-open">${icon('upload')} Üye ol / Giriş yap</button>`;
    return `<div class="kvs"><div><span>Hesap</span><b>${esc(userEmail())}</b></div><div><span>Durum</span><b>${esc(STATUS_TXT[syncState.status] || '')}${syncState.message ? ` · ${esc(syncState.message)}` : ''}</b></div><div><span>Son eşitleme</span><b>${esc(fmtWhen(syncState.lastSyncAt))}</b></div></div>
      <div class="acts"><button class="btn" data-act="sync-now">${icon('refresh')} Şimdi eşitle</button><button class="btn" data-act="sign-out">Çıkış yap</button><button class="btn" data-act="sign-out-wipe" title="Ortak bilgisayarlar için">Çıkış yap ve bu cihazdan verimi sil</button><button class="btn danger" data-act="delete-account">${icon('x')} Hesabımı ve bulut verimi sil</button></div>
      <p class="muted" style="margin:10px 0 0;font-size:12.5px">Verileriniz hesabınızda saklanır; her güncellemede önceki 10 sürüm yedek tutulur. Hesabı silerseniz bulut verisi kalıcı olarak silinir (bu cihazdaki kopya kalır).</p>`;
  }
  const accountPanelHtml = () => (cloudOn() ? `<section class="panel"><header><div><h2>Hesap ve eşitleme</h2><p>İsteğe bağlı. Üyeliksiz kullanım aynen devam eder.</p></div></header><div class="pad" id="sync-panel">${syncPanelInner()}</div></section>` : '');

  const dbCounts = (d) => `${(d.ek_gelirler || []).length} gelir, ${(d.sabit_giderler || []).length} gider, ${(d.kredi_kartlari || []).length} kart, ${(d.kmh_hesaplar || []).length} KMH, ${(d.krediler || []).length} kredi`;
  function openConflict(info) {
    conflictInfo = info;
    const why = { first: 'Bu cihazdaki verilerle hesabınızdaki veriler farklı.', both: 'Hem bu cihazda hem hesabınızda değişiklik var.', edited: 'Hesabınızdaki veri başka bir cihazdan güncellenmiş.', again: 'Hesabınızdaki veri bu arada tekrar değişti.' }[info.reason] || 'Veriler farklı.';
    $('cf-why').textContent = why;
    $('cf-local').textContent = dbCounts(info.local); $('cf-cloud').textContent = dbCounts(info.cloud.data || {});
    if (!$('dlg-conflict').open) $('dlg-conflict').showModal();
  }
  async function resolveConflict(choice) {
    if (!conflictInfo || !syncApi) return;
    try {
      const r = await syncApi.resolve(choice, conflictInfo);
      if (r === 'synced') { conflictInfo = null; $('dlg-conflict').close(); toast(choice === 'cloud' ? 'Hesabınızdaki veriler alındı. Önceki yerel veriniz yedeklendi.' : 'Bu cihazdaki veriler hesabınıza yüklendi.'); render(); }
    } catch (e) { toast('İşlem tamamlanamadı: ' + KeseSync.authMessage(e), { err: true }); }
  }
  function downloadJson(obj, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }

  let authMode = 'giris';
  function setAuthMode(m) {
    authMode = m;
    $('auth-title').textContent = { giris: 'Giriş yap', uye: 'Ücretsiz üye ol', sifre: 'Şifremi unuttum' }[m];
    document.querySelectorAll('[data-authtab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.authtab === m)));
    $('au-pass-box').hidden = m === 'sifre'; $('au-consent-box').hidden = m !== 'uye'; $('au-google').hidden = m === 'sifre'; $('au-forgot').hidden = m !== 'giris';
    $('au-submit').textContent = { giris: 'Giriş yap', uye: 'Hesap oluştur', sifre: 'Bağlantı gönder' }[m];
    $('au-pass').autocomplete = m === 'giris' ? 'current-password' : 'new-password';
    $('au-msg').textContent = ''; $('au-msg').className = 'err';
  }
  function openAuth(mode) { if (!cloudOn()) return; setAuthMode(mode || 'giris'); if (!$('dlg-auth').open) $('dlg-auth').showModal(); setTimeout(() => $('au-email').focus(), 50); }
  async function submitAuth(e) {
    e.preventDefault(); if (!syncApi) return;
    const email = $('au-email').value, pass = $('au-pass').value, msg = $('au-msg'), btn = $('au-submit');
    const say = (t, ok) => { msg.textContent = t; msg.className = ok ? 'okmsg' : 'err'; };
    if (authMode === 'uye' && !$('au-consent').checked) return say('Devam etmek için gizlilik politikasını kabul edin.');
    btn.disabled = true;
    try {
      let r;
      if (authMode === 'giris') r = await syncApi.signIn(email, pass);
      else if (authMode === 'uye') r = await syncApi.signUp(email, pass);
      else r = await syncApi.resetPassword(email);
      if (!r.ok) return say(r.message);
      if (authMode === 'giris') { $('dlg-auth').close(); $('au-pass').value = ''; toast('Giriş yapıldı. Verileriniz eşitleniyor…'); }
      else if (authMode === 'uye') say(r.needsConfirm ? 'Hesabınız oluşturuldu. E-postanıza bir doğrulama bağlantısı gönderdik; tıkladıktan sonra giriş yapın.' : 'Hesabınız oluşturuldu.', true);
      else say('E-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderildi.', true);
    } catch (err) { say(KeseSync.authMessage(err)); } finally { btn.disabled = false; }
  }
  async function submitNewPass(e) {
    e.preventDefault(); const p = $('np-pass').value, msg = $('np-msg');
    const r = await syncApi.updatePassword(p);
    if (!r.ok) { msg.textContent = r.message; return; }
    $('dlg-newpass').close(); toast('Şifreniz güncellendi.');
  }
  async function initSync() {
    renderSyncChip();
    if (!cloudOn()) return;
    let cid = null; try { cid = localStorage.getItem('kese_client_id'); if (!cid) { cid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)); localStorage.setItem('kese_client_id', cid); } } catch (e) { /* yok say */ }
    const client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    syncApi = KeseSync.create({
      client, storage: localStorage, clientId: cid, redirectTo: location.origin + '/',
      getDb: () => (sbx.on ? sbx.real : db),
      setDb: (d) => { if (sbx.on) sbx.real = d; else { db = d; normalizeDb(); } },
      sanitize: (d) => KeseStore.sanitize(d), persist: (d) => KeseStore.save(d),
      online: () => navigator.onLine,
      onStatus: (st, info) => { syncState.status = st; syncState.message = st === 'error' ? (info.message || '') : ''; if (info.lastSyncAt) syncState.lastSyncAt = info.lastSyncAt; renderSyncChip(); if (info.pulled && !sbx.on) { render(); window.KesePush?.changed(); } },
      onConflict: openConflict,
      onRecovery: () => { if (!$('dlg-newpass').open) $('dlg-newpass').showModal(); },
    });
    addEventListener('online', () => syncApi.syncNow());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncApi.syncNow(); });
    await syncApi.init();
    const want = new URLSearchParams(location.search).get('auth');
    if (want && syncState.status === 'out') openAuth(want === 'uye' ? 'uye' : 'giris');
    if (want) history.replaceState(null, '', location.pathname);
  }

  async function clearLocalDevice() {
    try { await window.KesePush?.reset(); } catch { /* Bağlantı gelince silme isteği yenilenir. */ }
    KeseStore.resetLocal();
    db = null;
    location.reload();
  }

  // ---------- Olaylar ----------
  function setPaid(obj, no, val) { const t = obj.taksitler.find((x) => x.no === no); if (t) t.odendi = val; }
  document.addEventListener('keydown', (ev) => {
    const tab = ev.target.closest?.('[data-debt-filter], [data-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ev.key)) return;
    const sel = tab.hasAttribute('data-debt-filter') ? '[data-debt-filter]' : '[data-tab]';
    const tabs = [...tab.parentElement.querySelectorAll(sel)];
    const index = tabs.indexOf(tab);
    const next = ev.key === 'Home' ? 0 : ev.key === 'End' ? tabs.length - 1 : (index + tabs.length + (ev.key === 'ArrowLeft' ? -1 : 1)) % tabs.length;
    ev.preventDefault(); tabs[next].click(); tabs[next].focus();
  });
  document.addEventListener('click', (ev) => { if (ev.target.closest && ev.target.closest('button, .btn, [data-nav], [data-act], summary, .mcard, .acc, [role="tab"]') && !ev.target.closest('#sim-toggle, #simtab, [data-act="sbx-panel"]')) sfx.play('click'); }, true);
  document.addEventListener('close', (ev) => { if (ev.target && ev.target.tagName === 'DIALOG') sfx.play('close'); }, true);
  document.addEventListener('click', (ev) => {
    const choice = ev.target.closest('[data-wiz-choice]');
    if (choice) {
      const step = wizSteps()[wiz.i];
      if (step.choose) { step.choose(wiz.d, choice.dataset.wizChoice); wiz.i++; renderWiz(); }
      return;
    }
    const edit = ev.target.closest('[data-wiz-edit]');
    if (edit) {
      const index = wizSteps().findIndex(st => st.id === edit.dataset.wizEdit);
      if (index >= 0) { wiz.i = index; renderWiz(); }
      return;
    }
    const wzg = ev.target.closest && ev.target.closest('[data-wzgo]');
    if (wzg) {
      const go = wzg.dataset.wzgo; $('dlg-wiz').close(); wizFromChooser = go !== 'manual' && !wzg.closest('#fab');
      const fn = { kalan: () => openAddKalan(), hesap: () => openWizHesap(), hesapv: () => openWizHesap('KMH'), gecikmis: openGecPick, harcama: () => openSpend(), kartkmh: () => openSpend(), elden: () => openAddElden(), yeni: openAddYeni, dosya: openImportWiz, manual: openAddDebt, kart: () => openWizHesap('KART'), kmh: () => openWizHesap('KMH') }[go];
      if (fn) fn();
      wizFromChooser = false; return;
    }
    const wzs = ev.target.closest && ev.target.closest('[data-wzset]');
    if (wzs) { const [id, v] = wzs.dataset.wzset.split(':'); const el = $(id); if (el) { el.value = v; wizLive(el); } return; }
    const closeBtn = ev.target.closest('[data-close]');
    if (closeBtn) { closeBtn.closest('dialog')?.close(); return; }
    const nav = ev.target.closest('[data-nav]');
    if (nav) { const dl = nav.closest('dialog'); if (dl && dl.open) dl.close(); setView(nav.dataset.nav); return; }
    const dfBtn = ev.target.closest('[data-debt-filter]');
    if (dfBtn) { ui.debtFilter = dfBtn.dataset.debtFilter; render(); return; }
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const d = el.dataset, act = d.act, pid = parseInt(d.pid) || 0, iid = parseInt(d.iid) || 0, id = parseInt(d.id) || 0;
    if (act === 'ai-open') {
      if (window.KeseAI && typeof window.KeseAI.openModal === 'function') {
        window.KeseAI.openModal({ getDb: () => db, getCalc: () => C, getNow: now, getSettings: S, initialPrompt: d.prompt || '', autoAdvice: d.advice === '1' });
      } else {
        toast('Kese Asistan şu an kullanılamıyor.', { err: true });
      }
      return;
    }
    if (act === 'today-expand') { ui.todayExpanded = !ui.todayExpanded; return render(); }
    if (act === 'choose-debt-file') { $(d.input || 'wz-file').click(); return; }
    if (act === 'pick') return; // onay kutusu değişiminde işlenir
    if (act === 'toggle-details' || (act === 'toggle' && !ev.target.closest('button,input'))) { ui.instDlg = d.key; openInst(); return; }
    if (act === 'sel-acc') { ui[d.cat === 'KMH' ? 'selKmh' : 'selKart'] = id; ui.open = null; ui.accDlg = { cat: d.cat, id }; render(); openAcc(); return; }
    if (act === 'demo-card') {
      enterSim();
      if (!db.kredi_kartlari.length) {
        db.kredi_kartlari.push({ id: 200, kart_adi: 'Örnek kart', banka: 'Diğer', limit: 10000, kesim_gunu: 25, son_odeme_gunu: 5, hareketler: [] });
        ui.selKart = 200; render();
      }
      return openSpend({ cat: 'KART', id: db.kredi_kartlari[0].id, demo: true });
    }
    if (act === 'first-spend') return openSpend({ cat: 'KART', id });
    if (act === 'opening-statement') { const dl = el.closest('dialog'); if (dl && dl.open) dl.close(); return openOpeningStatement(id); }
    if (act === 'add-hesap') return openWizHesap(d.cat);
    if (act === 'edit-hesap') return openHesap(d.cat, id);
    if (act === 'del-hesap') {
      const acc = (d.cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === id); if (!acc) return;
      const accName = nameOf(d.cat === 'KMH' ? acc.hesap_adi : acc.kart_adi, d.cat === 'KMH' ? 'Eksi hesap' : 'Kredi kartı');
      const count = (acc.hareketler || []).length;
      askConfirm(`${accName}${count ? ` ve içindeki ${count} kayıt` : ''} silinecek. Emin misin?`, 'Sil', 'Hesabı sil?').then((ok) => {
        if (!ok) return;
        if ($('dlg-acc') && $('dlg-acc').open) $('dlg-acc').close();
        removeWithUndo(() => {
          if (d.cat === 'KMH') { db.kmh_hesaplar = db.kmh_hesaplar.filter((x) => x.id !== id); ui.selKmh = db.kmh_hesaplar[0] ? db.kmh_hesaplar[0].id : null; }
          else { db.kredi_kartlari = db.kredi_kartlari.filter((x) => x.id !== id); ui.selKart = db.kredi_kartlari[0] ? db.kredi_kartlari[0].id : null; }
        }, `${accName} ve içindeki kayıtlar silindi.`);
      });
      return;
    }
    if (act === 'add-har') { const dl = el.closest('dialog'); if (dl && dl.open && dl.id !== 'dlg-wiz') dl.close(); return openSpend(d.cat ? { cat: d.cat, id: pid } : null); }
    if (act === 'add-spend') return openSpend();
    if (act === 'home-ym') { ui.homeYm = C.ymAdd(ui.homeYm || C.ymOf(new Date()), parseInt(d.d) || 0); return render(); }
    if (act === 'tour') return startTour(true);
    if (act === 'hesap-giris') { const dl = el.closest('dialog'); if (dl && dl.open) dl.close(); return openDeposit(id, d.tutar ? Number(d.tutar) : 0); }
    if (act === 'edit-islem') return openAccountTransaction(pid, iid);
    if (act === 'del-islem') {
      const a = db.kmh_hesaplar.find((x) => x.id === pid); if (!a) return;
      return removeWithUndo(() => { C.hesapIslemSil(a, iid); }, 'İşlem silindi; bakiye düzeltildi.');
    }
    if (act === 'edit-har') {
      const it = findItem(d.cat, pid, iid);
      if (d.cat === 'KART' && hasLinkedCardPayment(db.kredi_kartlari.find((k) => k.id === pid) || {}, iid)) return;
      if (it?.ekstre_baslangic) return openOpeningStatement(pid, iid);
      return it && it.gecikmis ? openGec(d.cat, pid, iid) : openHar(d.cat, pid, iid);
    }
    if (act === 'add-gec') return openGec(d.cat, pid);
    if (act === 'add-sig' || act === 'edit-sig') return openSig(d.bcat, parseInt(d.bid) || 0);
    if (act === 'del-sig') { const h = C.coverageHolder(db, d.bcat, parseInt(d.bid)); if (!h) return; return removeWithUndo(() => { delete h.sigorta_kapsam; }, `${nameOf(h.kredi_adi || h.kart_adi || h.hesap_adi, 'Borç')} için sigorta kapsamı kaldırıldı.`); }
    if (act === 'kismi') { lastPayOrigin = btnCenter(el); return openKismi(d.cat, pid, iid); }
    if (act === 'pay-diff' && d.cat === 'KART') { if (ui.ym) return; const o = findItem('KART', pid, iid), t = o && o.taksitler.find((y) => y.no === parseInt(d.no)); const dl = el.closest('dialog'); if (dl && dl.open) dl.close(); lastPayOrigin = btnCenter(el); return openCardPay(pid, t ? t.ym : null); }
    if (act === 'pay-diff') { const o = findItem(d.cat, pid, iid); if (!o || ui.ym) return; lastPayOrigin = btnCenter(el); return o.gecikmis ? openKismi(d.cat, pid, iid) : openDiff(d.cat, pid, iid, parseInt(d.no)); }
    if (act === 'unpay') {
      const o = findItem(d.cat, pid, iid); if (!o) return;
      const no = parseInt(d.no);
      const t = o.taksitler.find((y) => y.no === no);
      if (!t) return;
      return removeWithUndo(() => {
        if (t.planli_tutar != null && Math.abs(t.tutar - t.planli_tutar) > 0.005) {
          const diff = C.r2(t.tutar - t.planli_tutar);
          const nextUnpaid = o.taksitler.find((y) => y.no > no && !y.sigortaOder && !y.sigortaGecmis);
          if (diff < 0 && nextUnpaid && !nextUnpaid.odendi) {
            nextUnpaid.tutar = C.r2(Math.max(0, nextUnpaid.tutar + diff));
          } else if (diff > 0) {
            let rest = diff;
            const later = o.taksitler.filter((y) => y.no > no && !y.sigortaOder && !y.sigortaGecmis);
            for (const n of later) {
              const target = n.planli_tutar != null ? n.planli_tutar : t.planli_tutar;
              const gap = C.r2(Math.max(0, target - n.tutar));
              if (gap > 0.005) {
                const addBack = Math.min(rest, gap);
                n.tutar = C.r2(n.tutar + addBack);
                if (n.odendi && n.tutar > 0.005) n.odendi = false;
                rest = C.r2(rest - addBack);
              }
              if (rest <= 0.005) break;
            }
          }
          t.tutar = t.planli_tutar;
          delete t.planli_tutar;
        }
        delete t.erken_kapandi;
        t.odendi = false;
      }, 'Ödeme geri alındı.');
    }
    if (act === 'del-har') {
      const p = (d.cat === 'KMH' ? db.kmh_hesaplar : db.kredi_kartlari).find((x) => x.id === pid); if (!p) return;
      const har = p.hareketler.find((x) => x.id === iid);
      if (!har || (d.cat === 'KART' && hasLinkedCardPayment(p, iid))) return;
      const hName = nameOf(har && har.aciklama, 'Kayıt');
      askConfirm(`${hName} kalıcı olarak silinecek. Emin misin?`, 'Sil', 'Kaydı sil?').then((ok) => {
        if (!ok) return;
        removeWithUndo(() => { p.hareketler = p.hareketler.filter((x) => x.id !== iid); }, `${hName} silindi.`);
      });
      return;
    }
    if (act === 'add-kredi') return openAddKalan();
    if (act === 'add-debt') return openAddDebt();
    if (act === 'edit-kredi') { if ($('dlg-inst') && $('dlg-inst').open) $('dlg-inst').close(); return openAddKalan(iid); }
    if (act === 'del-kredi') {
      const loan = db.krediler.find((x) => x.id === iid); if (!loan) return;
      const lName = nameOf(loan.kredi_adi, 'Taksitli borç');
      askConfirm(`${lName} ve tüm taksit geçmişi silinecek. Emin misin?`, 'Sil', 'Borcu sil?').then((ok) => {
        if (!ok) return;
        if ($('dlg-inst') && $('dlg-inst').open) $('dlg-inst').close();
        removeWithUndo(() => { db.krediler = db.krediler.filter((x) => x.id !== iid); }, `${lName} silindi.`);
      });
      return;
    }
    if (act === 'edit-elden') return openAddElden(id);
    if (act === 'del-elden') {
      const g = db.sabit_giderler.find((x) => x.id === id); if (!g) return;
      const eName = nameOf(g.ad, 'Elden borç');
      askConfirm(`${eName} elden borcu silinecek. Emin misin?`, 'Sil', 'Borcu sil?').then((ok) => {
        if (!ok) return;
        removeWithUndo(() => { db.sabit_giderler = db.sabit_giderler.filter((x) => x.id !== id); }, `${eName} silindi.`);
      });
      return;
    }
    if (act === 'early-close') {
      if (ui.ym) return;
      const o = findItem(d.cat, pid, iid); if (!o) return;
      const un = C.unpaid(o);
      if (!un.length) return toast('Bu borcun bekleyen taksiti kalmamış.');
      const rem = C.r2(o.gecikmis ? C.overdueInfo(o, now(), C.vergiFor(S())).toplam : C.sum(un, (t) => t.tutar));
      const dName = itemLabel(d.cat, pid, o);
      const relief = C.r2(Number(un[0].tutar) || 0);
      const origin = btnCenter(el);
      askConfirm(`${dName} borcunun kalan ${un.length} taksiti (${M(rem)}) tamamen kapatılsın mı?`, 'Evet, borcu kapat!', 'Borcu erken kapat').then((ok) => {
        if (!ok) return;
        const snap = JSON.stringify(db);
        if (o.gecikmis) C.applyPartialPayment(o, rem, now(), S());
        else un.forEach((t) => { t.odendi = true; t.erken_kapandi = true; });
        if ($('dlg-inst') && $('dlg-inst').open) $('dlg-inst').close();
        const payInfo = Object.assign({ amount: rem, debtClosed: true, debtName: dName, monthlyRelief: relief }, origin);
        save(`🎉 ${dName} tamamen kapandı!`, snap, payInfo);
      });
      return;
    }
    if (act === 'early-close-elden') {
      if (ui.ym) return;
      const g = db.sabit_giderler.find((x) => x.id === id); if (!g) return;
      const rem = C.r2(Math.max(0, Number(g.kalan) || 0));
      if (!(rem > 0.01)) return toast('Bu borç zaten kapalı.');
      const eName = nameOf(g.ad, 'Elden borç');
      const relief = C.r2(Number(g.tutar) || rem);
      const origin = btnCenter(el);
      askConfirm(`${eName} borcunun kalan ${M(rem)} tutarı tamamen kapatılsın mı?`, 'Evet, borcu kapat!', 'Borcu erken kapat').then((ok) => {
        if (!ok) return;
        const snap = JSON.stringify(db);
        const ym = C.ymOf(now());
        g.kalan = 0;
        if (!Array.isArray(g.odendi_aylar)) g.odendi_aylar = [];
        if (!g.odendi_aylar.includes(ym)) g.odendi_aylar.push(ym);
        const payInfo = Object.assign({ amount: rem, debtClosed: true, debtName: eName, monthlyRelief: relief }, origin);
        save(`🎉 ${eName} tamamen kapandı!`, snap, payInfo);
      });
      return;
    }
    if ((act === 'pay' || act === 'pay-diff') && d.cat === 'KART') {
      if (ui.ym) return; const o = findItem('KART', pid, iid), t = o && o.taksitler.find((y) => y.no === parseInt(d.no));
      const dl = el.closest('dialog'); if (dl && dl.open) dl.close(); lastPayOrigin = btnCenter(el);
      return openCardPay(pid, t ? t.ym : null);
    }
    if (act === 'pay') {
      if (ui.ym) return;
      const o = findItem(d.cat, pid, iid); if (!o) return;
      const installment = o.taksitler.find((t) => t.no === parseInt(d.no));
      if (!installment || installment.odendi) return;
      const before = deep(o), dataAtPayment = db;
      const origin = btnCenter(el);
      const amount = C.r2(o.gecikmis ? C.overdueInfo(o, now(), C.vergiFor(S())).toplam : Number(installment.tutar) || 0);
      if (o.gecikmis) C.applyPartialPayment(o, amount, now(), S());
      else installment.odendi = true;
      const closed = C.unpaid(o).length === 0;
      const dName = itemLabel(d.cat, pid, o);
      const payInfo = Object.assign({ amount, debtClosed: closed, debtName: dName, monthlyRelief: closed ? amount : 0 }, origin);
      save(closed ? `🎉 ${dName} tamamen kapandı!` : 'Ödeme kaydedildi.', () => {
        if (db !== dataAtPayment || findItem(d.cat, pid, iid) !== o) return toast('Kayıt değiştiği için bu ödemeyi artık buradan geri alamazsınız.', { err: true });
        if (before.gecikmis) Object.keys(o).forEach((key) => { if (!Object.hasOwn(before, key)) delete o[key]; });
        if (before.gecikmis) Object.assign(o, before);
        else installment.odendi = false;
        save('Ödeme kaydı geri alındı.');
      }, payInfo); return;
    }
    if (act === 'pay-stmt') { if (ui.ym) return; lastPayOrigin = btnCenter(el); const dl = el.closest('dialog'); if (dl && dl.open) dl.close(); return openCardPay(id, d.ym || null); }
    if (act === 'undo-cardpay') {
      const k = db.kredi_kartlari.find((x) => x.id === pid); if (!k) return;
      askConfirm('Bu ödeme geri alınacak ve ekstrede kalan tutar güncellenecek.', 'Geri al', 'Ödemeyi geri al?').then((ok) => { if (ok) removeWithUndo(() => { C.undoCardPayment(k, iid); }, 'Ekstre ödemesi geri alındı.'); });
      return;
    }
    if (act === 'pay-picked') {
      const o = findItem(d.cat, pid, iid); if (!o) return;
      const prefix = `${d.cat}:${pid}:${iid}:`;
      const nos = [...ui.picked].filter((k) => k.startsWith(prefix)).map((k) => parseInt(k.slice(prefix.length)));
      if (!nos.length) return toast('Önce listeden taksit seçin.', { err: true });
      const snap = JSON.stringify(db);
      const markPaid = d.val === '1';
      const origin = btnCenter(el);
      let paidAmt = 0;
      nos.forEach((n) => {
        const t = o.taksitler.find((x) => x.no === n);
        if (t && markPaid && !t.odendi) paidAmt += Number(t.tutar) || 0;
        setPaid(o, n, markPaid);
        ui.picked.delete(prefix + n);
      });
      const closed = markPaid && C.unpaid(o).length === 0;
      const dName = itemLabel(d.cat, pid, o);
      const relief = closed && o.taksitler.length ? Number(o.taksitler[0].tutar) || 0 : 0;
      const payInfo = markPaid && paidAmt > 0 ? Object.assign({ amount: C.r2(paidAmt), debtClosed: closed, debtName: dName, monthlyRelief: relief }, origin) : false;
      return save(markPaid ? (closed ? `🎉 ${dName} tamamen kapandı!` : 'Seçilenler ödendi yapıldı.') : 'Seçilenler geri alındı.', snap, payInfo);
    }
    if (act === 'multi-toggle') {
      ui.multi = ui.multi || new Set(); const mk = `${d.cat}:${pid}:${iid}`;
      if (ui.multi.has(mk)) { ui.multi.delete(mk); [...ui.picked].forEach((k) => { if (k.startsWith(mk + ':')) ui.picked.delete(k); }); } else ui.multi.add(mk);
      return render();
    }
    if (act === 'pick-all') {
      const o = findItem(d.cat, pid, iid); const keys = o.taksitler.map((t) => `${d.cat}:${pid}:${iid}:${t.no}`);
      const all = keys.every((k) => ui.picked.has(k)); keys.forEach((k) => (all ? ui.picked.delete(k) : ui.picked.add(k))); return render();
    }
    if (act === 'sbx-toggle') return sbx.on ? exitSim() : enterSim();
    if (act === 'sbx-exit') return exitSim();
    if (act === 'sbx-reset') return resetSim();
    if (act === 'asgari-toggle') { ui.asgari = !ui.asgari; return render(); }
    if (act === 'asgari-ac') return openAsgari();
    if (act === 'takla-ac') { $('dlg-asgari').close(); if (sbx.on) ui.sbxPanel = true; else ui.panelNormal = true; ui.spOpen.taklaset = false; render(); const pn = $('simpanel'); const c = pn && [...pn.querySelectorAll('.plcard h3')].find((h) => /döndürmek/.test(h.textContent)); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (act === 'ses-toggle') { sfx.toggle(); return renderSesBtn(); }
    if (act === 'sbx-panel') { if (sbx.on) ui.sbxPanel = !ui.sbxPanel; else ui.panelNormal = !ui.panelNormal; return render(); }
    if (act === 'sbx-export') return exportSimReport();
    if (act === 'kapat-ac') return openKapat(d.cat ? `${d.cat}:${parseInt(d.pid) || 0}:${parseInt(d.iid) || 0}` : null);
    if (act === 'plan-apply') {
      if (!sbx.on) enterSim();
      const pl = planOf(new Date());
      if (!pl.adimlar.length) return toast('Uygulanacak kapatma önerisi yok.', { err: true });
      const ids = [];
      pl.adimlar.forEach((x) => { const rec = C.closeDebt(db, x.cat, x.pid, x.iid, { ym: x.ym, masrafOran: pl.masraf, birikim: true, settings: S(), now: new Date() }); if (rec) ids.push(rec.id); });
      ui.planApplied = { ids, adimlar: pl.adimlar, ozet: pl.ozet, kiyas: pl.kiyas }; ui.sbxPanel = true;
      return save(`${ids.length} borç kapatması simülasyona uygulandı`);
    }
    if (act === 'plan-undo') { const ap = validApplied(); if (ap) ap.ids.forEach((id) => C.reopenDebt(db, id)); ui.planApplied = null; return save('Uygulama geri alındı'); }
    if (act === 'sbx-reopen') { C.reopenDebt(db, id); return save('Kapatma geri alındı'); }
    if (act === 'mscroll') { const r = document.querySelector('#monthbar .mrow'); if (r) r.scrollBy({ left: parseInt(d.d) * 540, behavior: 'smooth' }); return; }
    if (act === 'cal-page') { ui.calPage = (ui.calPage || 0) + parseInt(d.d); window.scrollTo(0, 0); return render(); }
    if (act === 'cal-open') { ui.calDlg = d.cal; const dlg = $('dlg-cal'); render(); if (!ui.calDlg) return; dlg.onclose = () => { ui.calDlg = null; }; if (!dlg.open) dlg.showModal(); return; }
    if (act === 'pick-ym') { ui.ym = d.ym || null; ui.open = null; ui.picked.clear(); render(); return; }
    if (act === 'pay-elden' || act === 'pay-gider') {
      const g = db.sabit_giderler.find((x) => x.id === id), ym = C.ymOf(now());
      if (!g || (g.odendi_aylar || []).includes(ym)) return;
      const origin = btnCenter(el);
      const isElden = g.kategori === 'Elden borç' && g.kalan != null && g.kalan !== '';
      const beforeKalan = isElden ? Math.max(0, Number(g.kalan) || 0) : 0;
      const amount = C.r2(isElden ? Math.min(beforeKalan || Number(g.tutar) || 0, Number(g.tutar) || beforeKalan) : (Number(g.tutar) || 0));
      C.toggleGiderPaid(g, ym, true);
      const closed = isElden && (Number(g.kalan) || 0) <= 0.01;
      const payInfo = Object.assign({ amount, debtClosed: closed, debtName: nameOf(g.ad, 'Elden borç'), monthlyRelief: closed ? C.r2(Number(g.tutar) || amount) : 0 }, origin);
      save(closed ? `🎉 ${nameOf(g.ad, 'Elden borç')} tamamen kapandı!` : 'Ödeme kaydedildi.', () => {
        if (!db.sabit_giderler.includes(g)) return toast('Kayıt değiştiği için bu ödemeyi artık buradan geri alamazsınız.', { err: true });
        C.toggleGiderPaid(g, ym, false); save('Ödeme kaydı geri alındı.');
      }, payInfo); return;
    }
    if (ui.ym && el.closest('#fab') && ['gelir-new', 'gider-new', 'budget-limit', 'weekly-insight'].includes(act)) setView('butce');
    if (['gider-edit', 'gider-new', 'gelir-edit', 'gelir-new'].includes(act)) {
      if (!ui.ym) openRecurring(act.startsWith('gelir'), id);
      return;
    }
    if (act === 'budget-limit' && !ui.ym) return openSpendingLimit();
    if (act === 'weekly-insight' && !ui.ym) {
      el.closest('dialog')?.close();
      return weeklyInsight();
    }
    if (act === 'gider-del') { const g = db.sabit_giderler.find((x) => x.id === id); if (!g) return; return removeWithUndo(() => { db.sabit_giderler = db.sabit_giderler.filter((x) => x.id !== id); }, `${nameOf(g.ad, 'Gider')} silindi.`); }
    if (act === 'del-gelir') { const g = db.ek_gelirler.find((x) => x.id === id); if (!g) return; return removeWithUndo(() => { db.ek_gelirler = db.ek_gelirler.filter((x) => x.id !== id); }, `${nameOf(g.aciklama, 'Gelir')} silindi.`); }
    if (act === 'auth-open') return openAuth('giris');
    if (act === 'sync-open') { setView('ayarlar'); return; }
    if (act === 'nudge-close') { try { localStorage.setItem('kese_nudge_until', String(Date.now() + 14 * 864e5)); } catch (e) { /* yok say */ } return renderNudge(); }
    if (act === 'sync-now') { if (syncApi) syncApi.syncNow(); return; }
    if (act === 'sign-out') {
      if (!syncApi) return;
      askConfirm('Bu cihazdaki verileriniz kalır, eşitleme durur.', 'Çıkış yap', 'Çıkış yapılsın mı?').then((ok) => {
        if (ok) syncApi.signOut().then(() => toast('Çıkış yapıldı.'));
      });
      return;
    }
    if (act === 'sign-out-wipe') {
      if (!syncApi) return;
      askConfirm('Çıkış yapılacak ve BU CİHAZDAKİ tüm Kese verileri silinecek (hesabınızdaki kopya kalır).', 'Çıkış yap ve sil').then((ok) => { if (ok) syncApi.signOut().then(() => { clearLocalDevice(); }); });
      return;
    }
    if (act === 'delete-account') {
      if (!syncApi) return;
      askConfirm('Hesabınız ve bulutta saklanan TÜM verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz; bu cihazdaki kopya kalır.', 'Hesabı sil', 'Hesap silinsin mi?')
        .then((ok) => { if (ok) syncApi.deleteAccount().then((r) => toast(r.ok ? 'Hesabınız ve bulut verileriniz silindi.' : r.message, r.ok ? {} : { err: true })); });
      return;
    }
    if (act === 'cf-cloud') return resolveConflict('cloud');
    if (act === 'cf-local') return resolveConflict('local');
    if (act === 'cf-both') { if (conflictInfo) { downloadJson(conflictInfo.local, `kesemden-bu-cihaz-${C.isoOf(new Date())}.json`); downloadJson(conflictInfo.cloud.data, `kesemden-hesap-${C.isoOf(new Date())}.json`); toast('İki kopya da indirildi.'); } return; }
    if (act === 'cf-later') { $('dlg-conflict').close(); return; }
    if (act === 'auth-tab') { setAuthMode(d.m); return; }
    if (act === 'auth-google') { if (syncApi) syncApi.signInWithGoogle().then((r) => { if (!r.ok) { $('au-msg').textContent = r.message; } }); return; }
    if (act === 'wipe') { if (sbx.on) return toast('Önce simülasyondan çıkın.', { err: true }); askConfirm('Bu cihazdaki TÜM Kese verileriniz kalıcı olarak silinecek ve geri alınamaz. Önce “Yedek indir” ile yedek aldığınızdan emin olun.', 'Tüm verilerimi sil', 'Tüm veriler silinsin mi?').then((ok) => { if (ok) { clearLocalDevice(); } }); return; }
    if (act === 'refresh-rates') { el.disabled = true; el.textContent = 'Güncelleniyor…'; return loadRates(true); }
    if (act === 'import') { if (sbx.on) return toast('Simülasyon modundayken yedek yüklenemez. Önce simülasyondan çıkın.', { err: true }); return $('imp-file').click(); }
    if (act === 'export') {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
      a.download = `kesemden-yedek-${C.isoOf(now())}.json`; a.click(); URL.revokeObjectURL(a.href);
    }
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id === 'imp-file') {
      const f = t.files && t.files[0]; t.value = ''; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          if (rd.result.length > 8 * 1024 * 1024) throw new Error('Dosya çok büyük.');
          const nd = KeseStore.sanitize(JSON.parse(rd.result)).db;
          if (!nd || typeof nd !== 'object' || !Array.isArray(nd.krediler) || !Array.isArray(nd.kredi_kartlari) || !Array.isArray(nd.kmh_hesaplar)) throw new Error('Bu dosya bir Kese yedeği gibi görünmüyor.');
          const mr = KeseStore.merge(db, nd);       // mevcut kayıtlar silinmez; yalnızca dosyadaki yeni kayıtlar eklenir
          if (!mr.eklenen) { toast('Yedekte eklenecek yeni kayıt yok.'); return; }
          askConfirm(`Dosyadan ${mr.eklenen} yeni kayıt eklenecek${mr.atlanan ? `, ${mr.atlanan} kayıt zaten var olduğu için atlanacak` : ''}. Mevcut verileriniz silinmez.`, 'Kayıtları ekle', 'Yedekten kayıt ekle').then((ok) => {
            if (!ok) return;
            db = mr.db; ['ek_gelirler', 'sabit_giderler', 'tek_seferlik'].forEach((k) => { if (!Array.isArray(db[k])) db[k] = []; });
            save(`Dosyadan ${mr.eklenen} yeni kayıt eklendi.`).then(() => load()).then(render);
          });
        } catch (e) { toast('Yedek yüklenemedi: ' + e.message, { err: true }); }
      };
      rd.readAsText(f); return;
    }
    if (t.closest && t.closest('#dlg-kapat')) { onKapatChange(t); return; }
    if (t.dataset.act === 'pick') { if (t.checked) ui.picked.add(t.dataset.k); else ui.picked.delete(t.dataset.k); return; }
    if (t.dataset.giderpaid) { if (ui.ym) return; const g = db.sabit_giderler.find((x) => x.id === parseInt(t.dataset.giderpaid)); if (g) { C.toggleGiderPaid(g, C.ymOf(now()), t.checked); save(); } return; }
    if (t.dataset.spn) { ui.spN = parseInt(t.value) || 0; return render(); }
    if (t.dataset.takla) { ui.takla[t.dataset.takla] = t.value; ui.spOpen.taklaset = true; return render(); }
    if (t.dataset.plan) { ui.plan[t.dataset.plan] = t.value; ui.spOpen.plset = true; return render(); }
    if (t.dataset.set) {
      const v = num(t.value), [lo, hi] = SET_LIMITS[t.dataset.set] || [0, 1e9];
      if (Number.isFinite(v) && v >= lo && v <= hi) { S()[t.dataset.set] = v; save('Ayar kaydedildi.'); return; }
      toast(`Geçersiz değer. ${hi >= 1e9 ? `${lo} veya daha büyük bir sayı` : `${lo} ile ${hi} arasında bir sayı`} yazın; önceki değer korundu.`, { err: true }); render(); return;
    }
    if (t.dataset.elle) {
      const v = num(t.value);
      if (Number.isFinite(v) && v >= 0 && v <= 20) { S().elle_oranlar[t.dataset.elle] = v; save('Oran kaydedildi.'); return; }
      toast('Geçersiz oran. Aylık yüzdeyi 0 ile 20 arasında yazın; önceki değer korundu.', { err: true }); render(); return;
    }
  });
  document.addEventListener('input', (ev) => {
    const id = ev.target.id || '';
    if (ev.target.closest && ev.target.closest('#dlg-wiz')) {
      if (['wz-src', 'wz-stur', 'wz-bil', 'wz-loanAmount'].includes(id)) {
        wizSteps()[wiz.i].read(wiz.d, wizBody());
        renderWiz();
        $(id)?.focus();
      } else wizLive(ev.target);
      return;
    }
    if (ev.target.closest && ev.target.closest('#dlg-kapat')) { if (ev.target.dataset.kpT) { kp.tutar[ev.target.dataset.kpT] = num(ev.target.value); kapatLive(); } else if (id === 'kp-masraf') kapatLive(); return; }
    if (id.startsWith('har-')) {
      if (id === 'har-ilk') har.ilkManual = true;
      if (id === 'har-tarih' || id === 'har-odenen' || id === 'har-n') syncHarMonth();
      harLive(ev.target);
    } else if (id.startsWith('sig-')) {
      if (id === 'sig-ilk') sigState.ilkManual = true;
      if (id === 'sig-tarih' && !sigState.ilkManual) fillMonths($('sig-ilk'), sigDefaultFirst());
      sigLive();
    } else if (id.startsWith('gec-')) {
      if (id === 'gec-faiz') gecState.faizManual = true;
      if (id === 'gec-ana' && !gecState.faizManual) $('gec-faiz').value = gecDefaultFaiz($('gec-cat').value, num($('gec-ana').value) || 0);
      gecLive();
    } else if (id === 'kismi-tutar') {
      kismiLive();
    }
  });
  $('form-hesap').addEventListener('submit', submitHesap);
  $('form-auth').addEventListener('submit', submitAuth);
  $('form-newpass').addEventListener('submit', submitNewPass);
  $('form-har').addEventListener('submit', submitHar);
  $('form-gec').addEventListener('submit', submitGec);
  $('form-sig').addEventListener('submit', submitSig);
  $('form-kapat').addEventListener('submit', submitKapat);
  $('form-wiz').addEventListener('submit', wizNext);
  $('wiz-back').addEventListener('click', wizBack);
  if ($('wiz-skip')) $('wiz-skip').addEventListener('click', () => { if (wiz.def && typeof wiz.def.onSkip === 'function') wiz.def.onSkip(); });
  $('sig-urun').addEventListener('change', fillSigForm);
  $('sig-remove').addEventListener('click', () => { const [cat, idS] = $('sig-urun').value.split(':'), h = C.coverageHolder(db, cat, parseInt(idS)); if (!h) return; $('dlg-sig').close(); removeWithUndo(() => { delete h.sigorta_kapsam; }, 'Sigorta kapsamı kaldırıldı.'); });
  $('form-kismi').addEventListener('submit', submitKismi);
  $('kismi-full').addEventListener('click', () => {
    const it = findItem($('kismi-cat').value, parseInt($('kismi-pid').value), parseInt($('kismi-id').value));
    if (kismiNo()) { const { t } = diffInfo(it, kismiNo()); if (t) $('kismi-tutar').value = t.tutar; kismiLive(); return; }
    $('kismi-tutar').value = C.overdueInfo(it, now(), C.vergiFor(S())).toplam; kismiLive();
  });
  $('har-tur').addEventListener('change', () => onHarTur(true));

  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { render(); }, 150); });
  // Fare tekerleği ay çubuğunun üstündeyken yatay kaydırır
  document.addEventListener('wheel', (e) => { const r = e.target.closest && e.target.closest('#monthbar .mrow'); if (r && Math.abs(e.deltaY) > Math.abs(e.deltaX) && r.scrollWidth > r.clientWidth) { r.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  // Gün değişince ekranı yenile (THIS_YM bayatlamasın)
  setInterval(() => { const d = C.isoOf(now()); if (d !== lastDay) { lastDay = d; render(); } }, 60000);

  function showRecovery() {
    document.body.classList.add('recovering');
    $('view').innerHTML = `<section class="welcome"><h1>Kayıtlar açılamadı</h1><p class="lead">Geçerli bir Kese yedeğiniz varsa bu ekrandan yükleyebilirsiniz.</p>
      ${KeseStore.mode === 'local' ? `<label>Yedek dosyası<input id="recovery-file" type="file" accept=".json,application/json"></label><p role="status" id="recovery-note"></p>` : '<p>Masaüstü bağlantısını kontrol edip yeniden deneyin.</p>'}
      <button type="button" class="btn" id="retry-load">Yeniden dene</button></section>`;
    $('retry-load').onclick = () => location.reload();
    const input = $('recovery-file');
    if (!input) return;
    input.addEventListener('change', async () => {
      const file = input.files[0]; if (!file) return;
      input.disabled = true;
      try {
        if (file.size > 8 * 1024 * 1024) throw new Error('Dosya 8 MB sınırını aşıyor.');
        const recovered = KeseStore.sanitize(JSON.parse(await file.text())).db;
        await KeseStore.save(recovered);
        location.reload();
      } catch (e) { $('recovery-note').textContent = `Yedek yüklenemedi: ${e.message}`; }
      finally { input.value = ''; input.disabled = false; }
    });
  }

  (async function init() {
    try { await KeseStore.init(); await load(); } catch { showRecovery(); return; }
    window.KesePush?.init({db: () => db, calc: C, sim: () => sbx.on, save});
    document.body.classList.toggle('mode-local', KeseStore.mode === 'local');
    {
      const go = new URLSearchParams(location.search).get('go');
      const hashView = location.hash.replace(/^#/, '');
      const initial = VALID_VIEWS.includes(go) ? go : (VALID_VIEWS.includes(hashView) ? hashView : 'ozet');
      ui.view = initial;
    }
    render();
    const entry = new URL(location.href);
    if (entry.searchParams.has('reminder')) {
      const kind = entry.searchParams.get('reminder');
      entry.searchParams.delete('reminder');
      history.replaceState(history.state, '', entry);
      requestReminder(kind);
    } else showPendingReminder();
    loadRates(false);
    initSync().catch(() => { /* hesap özellikleri açılamazsa uygulama yerel çalışır */ });
    // Çevrimdışı çalışma ve "uygulama gibi yükle" için service worker (yalnız https veya localhost)
    if (!document.querySelector('meta[name="kese-preview"]') && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') && KeseStore.mode === 'local') {
      navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => window.KesePush?.reconcile()).catch(() => { /* kayıt başarısızsa uygulama yine çalışır */ });
    }
  })();
})();
