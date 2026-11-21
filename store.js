/* Kese veri katmanı: yerel sunucu (masaüstü) ya da tarayıcı depolaması (web/Android).
 * Veri bu cihazdan çıkmaz. Yüklenen her veri (yedek dosyası dahil) önce doğrulanıp temizlenir. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseStore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'kese_data_v1', KEY_PREV = 'kese_data_prev_v1', KEY_RATES = 'kese_rates_v1';
  const MAX_DEPTH = 10, MAX_ARRAY = 20000, MAX_STR = 400, MAX_BYTES = 8 * 1024 * 1024;
  const YM = /^\d{4}-(0[1-9]|1[0-2])$/, ISO = /^\d{4}-\d{2}-\d{2}$/;
  const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const INT_KEYS = new Set(['id', 'no', 'pid', 'iid', 'bagli_id', 'kesim_gunu', 'son_odeme_gunu', 'hesap_kesim_gunu', 'gun', 'sure', 'toplam_taksit', 'adet', 'surum']);
  const REQUIRED_LISTS = ['ek_gelirler', 'kmh_hesaplar', 'kredi_kartlari', 'krediler'];
  const OPTIONAL_RECORD_LISTS = ['sabit_giderler', 'tek_seferlik', 'sigortalar', 'hareketler', 'taksitler'];
  const RECORD_LISTS = new Set([...REQUIRED_LISTS, ...OPTIONAL_RECORD_LISTS]);
  const OPTIONAL_LISTS = new Set([...OPTIONAL_RECORD_LISTS, 'odendi_aylar']);

  /** Sunucu/arayüz için güvenli olmayan her şeyi ayıklar: yanlış tipler, aşırı uzun metinler, tehlikeli anahtarlar. */
  function sanitize(input) {
    let removed = 0;
    const walk = (v, key, depth) => {
      if (depth > MAX_DEPTH) { removed++; return undefined; }
      if (v === null) return null;
      if (Array.isArray(v)) {
        if (v.length > MAX_ARRAY) { removed++; v = v.slice(0, MAX_ARRAY); }
        if (RECORD_LISTS.has(key)) {
          const valid = v.filter(item => item !== null && typeof item === 'object' && !Array.isArray(item));
          removed += v.length - valid.length;
          v = valid;
        }
        return v.map((x) => walk(x, key, depth + 1)).filter((x) => x !== undefined);
      }
      switch (typeof v) {
        case 'number': return Number.isFinite(v) ? v : (removed++, 0);
        case 'boolean': return v;
        case 'string': {
          let s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
          if (s.length > MAX_STR) { s = s.slice(0, MAX_STR); removed++; }
          if (key && (key === 'ym' || key.endsWith('_ym'))) { if (s !== '' && !YM.test(s)) { removed++; return ''; } }
          else if (key && (key === 'tarih' || key.endsWith('_tarihi') || key.endsWith('_tarih'))) { if (s !== '' && !ISO.test(s)) { removed++; return ''; } }
          return s;
        }
        case 'object': {
          const o = {};
          Object.keys(v).forEach((k) => {
            if (BAD_KEYS.has(k) || k.length > 80) { removed++; return; }
            if (OPTIONAL_LISTS.has(k) && !Array.isArray(v[k])) { removed++; o[k] = []; return; }
            let x = walk(v[k], k, depth + 1);
            if (x === undefined) return;
            if (INT_KEYS.has(k) && typeof x === 'string') { x = parseInt(x, 10); if (!Number.isFinite(x)) { removed++; x = 0; } }
            o[k] = x;
          });
          return o;
        }
        default: removed++; return undefined;
      }
    };
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Veri bir nesne olmalı');
    const out = walk(input, '', 0);
    REQUIRED_LISTS.forEach((k) => { if (!Array.isArray(out[k])) throw new Error(`'${k}' listesi eksik veya geçersiz`); });
    return { db: out, removed };
  }

  const EMPTY = () => ({ surum: 2, ek_gelirler: [], kmh_hesaplar: [], kredi_kartlari: [], krediler: [], sabit_giderler: [], tek_seferlik: [], ayarlar: {} });
  const ls = () => { try { return window.localStorage; } catch (e) { return null; } };
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('zaman aşımı')), ms))]);

  // ---- Yedek dosyasını mevcut verilerle BİRLEŞTİRME (hiçbir mevcut kayıt silinmez ya da değişmez) ----
  const stable = (v) => (Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}' : JSON.stringify(v));
  const pick = (o, keys) => stable(keys.map((k) => (o[k] == null ? null : o[k])));
  const withoutId = (o) => { const c = Object.assign({}, o); delete c.id; delete c.bagli_id; return stable(c); };
  const IDENT = {
    krediler: (o) => pick(o, ['banka', 'kredi_adi', 'kredi_turu', 'ana_para', 'ilk_taksit_ym', 'toplam_taksit']),
    kredi_kartlari: (o) => pick(o, ['banka', 'kart_adi']),
    kmh_hesaplar: (o) => pick(o, ['banka', 'hesap_adi']),
    sabit_giderler: (o) => pick({ ...o, baslangic_ym: o.baslangic_ym || null, sure: Number(o.sure) || 0 }, ['ad', 'kategori', 'tutar', 'gun', 'baslangic_ym', 'sure']),
    ek_gelirler: (o) => pick(o, ['aciklama', 'tutar', 'baslangic_ym', 'sure']),
  };
  const HAREKET = (o) => pick(o, ['tur', 'aciklama', 'tarih', 'ana_para', 'toplam_taksit', 'ilk_taksit_ym']);
  const maxId = (list) => list.reduce((m, x) => Math.max(m, parseInt(x && x.id) || 0), 0);
  /** cur: mevcut veri, inc: dosyadaki (temizlenmiş) veri. Dönüş: { db, eklenen, atlanan } — yeni bir nesne, cur değişmez. */
  function merge(cur, inc) {
    const db = JSON.parse(JSON.stringify(cur || EMPTY()));
    const res = { db, eklenen: 0, atlanan: 0 };
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const idMap = {}, existingInsuranceCount = (db.sigortalar || []).length;
    Object.keys(inc || {}).forEach((k) => {
      if (!Array.isArray(inc[k])) return;
      if (!Array.isArray(db[k])) db[k] = [];
      const ident = IDENT[k] || withoutId, map = (idMap[k] = {});
      inc[k].forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const key = ident(item), same = db[k].find((x) => ident(x) === key);
        if (same) {
          map[item.id] = same.id;
          if (k === 'kredi_kartlari' || k === 'kmh_hesaplar') {            // aynı hesap: yalnızca yeni hareketleri ekle
            if (!Array.isArray(same.hareketler)) same.hareketler = [];
            (item.hareketler || []).forEach((h) => {
              if (same.hareketler.some((x) => HAREKET(x) === HAREKET(h))) { res.atlanan++; return; }
              const c = clone(h); if (same.hareketler.some((x) => x.id === c.id)) c.id = maxId(same.hareketler) + 1;
              same.hareketler.push(c); res.eklenen++;
            });
          } else res.atlanan++;
          return;
        }
        const c = clone(item);
        if (c.id != null && db[k].some((x) => x.id === c.id)) c.id = maxId(db[k]) + 1;
        map[item.id] = c.id; db[k].push(c); res.eklenen++;
      });
    });
    (db.sigortalar || []).slice(existingInsuranceCount).forEach((sg) => {
      const list = { KREDI: 'krediler', KART: 'kredi_kartlari', KMH: 'kmh_hesaplar' }[sg.bagli_cat];
      const id = idMap[list]?.[sg.bagli_id];
      if (id != null) sg.bagli_id = id;
    });
    if (inc && inc.ayarlar && typeof inc.ayarlar === 'object' && !Array.isArray(inc.ayarlar)) {
      if (!db.ayarlar || typeof db.ayarlar !== 'object' || Array.isArray(db.ayarlar)) db.ayarlar = {};
      Object.keys(inc.ayarlar).forEach((k) => {
        if (k === 'elle_oranlar' && inc.ayarlar.elle_oranlar && typeof inc.ayarlar.elle_oranlar === 'object' && !Array.isArray(inc.ayarlar.elle_oranlar)) {
          if (!db.ayarlar.elle_oranlar || typeof db.ayarlar.elle_oranlar !== 'object' || Array.isArray(db.ayarlar.elle_oranlar)) db.ayarlar.elle_oranlar = {};
          Object.keys(inc.ayarlar.elle_oranlar).forEach((q) => {
            if (db.ayarlar.elle_oranlar[q] === undefined) db.ayarlar.elle_oranlar[q] = clone(inc.ayarlar.elle_oranlar[q]);
          });
        } else if (db.ayarlar[k] === undefined) {
          db.ayarlar[k] = clone(inc.ayarlar[k]);
        }
      });
    }
    return res;
  }
  const store = {
    mode: 'local',
    sanitize,
    merge,
    /** Yerel sunucu varsa onu, yoksa tarayıcı depolamasını kullanır. */
    async init() {
      try {
        const res = await withTimeout(fetch('/api/data', { cache: 'no-store' }), 1500);
        const type = res.headers.get('content-type') || '';
        if (res.ok && type.includes('application/json')) { const d = await res.clone().json(); if (d && Array.isArray(d.ek_gelirler)) { this.mode = 'server'; return; } }
      } catch (e) { /* sunucu yok: yerel mod */ }
      this.mode = 'local';
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* desteklenmiyor */ }
    },
    async load() {
      if (this.mode === 'server') {
        const res = await fetch('/api/data', { cache: 'no-store' });
        if (!res.ok) throw new Error('Veri okunamadı');
        return sanitize(await res.json()).db;
      }
      const st = ls(), raw = st ? st.getItem(KEY) : null;
      if (!raw) return EMPTY();
      try { return sanitize(JSON.parse(raw)).db; } catch (e) {
        const prev = st.getItem(KEY_PREV);
        if (prev) { try { return sanitize(JSON.parse(prev)).db; } catch (e2) { /* ikisi de bozuk */ } }
        throw new Error('Kayıtlı veri okunamadı. Yedek dosyanız varsa Ayarlar > Yedekten geri yükle ile yükleyin.');
      }
    },
    async save(db) {
      const clean = sanitize(db).db, text = JSON.stringify(clean);
      if (text.length > MAX_BYTES) throw new Error('Veri çok büyük');
      if (this.mode === 'server') {
        const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Kese': '1' }, body: text });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).hata || 'Sunucu hatası');
        return;
      }
      const st = ls(); if (!st) throw new Error('Tarayıcı depolaması kapalı (gizli sekme olabilir)');
      try {
        const old = st.getItem(KEY); if (old) st.setItem(KEY_PREV, old);
        st.setItem(KEY, text);
      } catch (e) { throw new Error('Depolama dolu ya da engelli'); }
    },
    /** Faiz oranları: sunucu varsa canlı; yoksa rates.json (günlük güncellenir) ve son başarılı kopya. */
    async rates(force) {
      if (this.mode === 'server') {
        const res = await fetch('/api/rates' + (force ? '/refresh' : ''), force ? { method: 'POST', headers: { 'X-Kese': '1' } } : {});
        return res.json();
      }
      const st = ls();
      try {
        const res = await withTimeout(fetch('rates.json', { cache: force ? 'reload' : 'default' }), 6000);
        if (!res.ok) throw new Error('rates.json yok');
        const r = await res.json();
        if (r && r.oranlar && r.oranlar.nakit_kmh) { if (st) st.setItem(KEY_RATES, JSON.stringify(r)); return r; }
        throw new Error('rates.json geçersiz');
      } catch (e) {
        const cached = st && st.getItem(KEY_RATES);
        if (cached) { try { const r = JSON.parse(cached); r.durum = 'eski'; return r; } catch (e2) { /* yok say */ } }
        return { durum: 'yok', oranlar: null, cekildi: null, hata: e.message };
      }
    },
    resetLocal() { const st = ls(); if (st) { st.removeItem(KEY); st.removeItem(KEY_PREV); st.removeItem(KEY_RATES); } },
  };
  return store;
});
