/* Kese · Yapay Zeka İstemcisi, Gizlilik Maskeleme ve Sohbet Katmanı.
 * Son kullanıcı hiçbir API anahtarı girmez; tüm istekler uygulamanın kendi /api/ai servisine gider.
 * UMD: tarayıcıda window.KeseAI, Node testlerinde module.exports.
 * Kurallar: yeşil renk yok, sabit hex yok (yalnız CSS belirteçleri), reduced-motion tam uyumlu. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseAI = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const API_ENDPOINT = '/api/ai';
  const STATUS_ENDPOINT = '/api/ai/status';
  const MAX_FILE_BYTES = 6 * 1024 * 1024; // 6 MB
  const MAX_HISTORY = 12;
  const FETCH_TIMEOUT_MS = 35000;

  const QUICK_CHIPS = [
    '💡 Bu ay en akıllı hamlem ne?',
    '🔥 Hangi borcu önce kapatayım?',
    '💰 Elime 10.000 ₺ geçse ne yapayım?',
    '📊 Faiz yükümü nasıl düşürürüm?',
  ];

  // Kese'nin standart banka listesi ve eşleştirme kalıpları
  const BANK_NORM = [
    ['Türkiye İş Bankası', /turkiye\s*is\s*bankasi|\bis\s*bankasi|isbank|\bisbankasi\b|maximum|maximiles/],
    ['Garanti BBVA', /garanti|bbva|\bbonus\b/],
    ['Ziraat Katılım', /ziraat\s*katilim/],
    ['Ziraat Dinamik Banka', /ziraat\s*dinamik/],
    ['Ziraat Bankası', /ziraat|bankkart/],
    ['Vakıf Katılım', /vakif\s*katilim/],
    ['VakıfBank', /vakif\s*bank|vakiflar/],
    ['Halkbank', /halk\s*bank|\bparaf\b/],
    ['Yapı Kredi', /yapi\s*(?:ve\s*)?kredi|yapikredi|\bworld\b/],
    ['Akbank', /akbank|axess|\bwings\b|arti\s*para/],
    ['QNB Türkiye', /\bqnb\b|finansbank|cardfinans/],
    ['Enpara Bank', /enpara/],
    ['DenizBank', /deniz\s*bank/],
    ['TEB (Türk Ekonomi Bankası)', /\bteb\b|turk\s*ekonomi\s*bankasi/],
    ['T.O.M. Katılım Bankası', /t\.?\s*o\.?\s*m\.?\s*katilim|tom\s*bank/],
    ['ING', /\bing\b/],
    ['HSBC', /hsbc/],
    ['Şekerbank', /seker\s*bank/],
    ['Fibabanka', /fiba\s*bank/],
    ['Odeabank', /odea\s*bank|\bodea\b/],
    ['Kuveyt Türk Katılım', /kuveyt\s*turk/],
    ['Albaraka Türk Katılım', /albaraka/],
    ['Türkiye Finans Katılım', /turkiye\s*finans/],
    ['Anadolubank', /anadolu\s*bank/],
    ['Burgan Bank', /burgan/],
    ['Alternatif Bank', /alternatif\s*bank/],
    ['ICBC Turkey', /icbc/],
    ['Colendi Bank', /colendi/],
    ['Emlak Katılım', /emlak\s*katilim/],
    ['Dünya Katılım', /dunya\s*katilim/],
    ['Hayat Finans Katılım', /hayat\s*finans/],
    ['FUPS Bank', /\bfups\b/],
  ];

  // ---------- Metin ve Sayı Yardımcıları ----------
  const pad = (n) => String(n).padStart(2, '0');
  const r2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

  function foldTr(s) {
    return String(s == null ? '' : s)
      .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtMoneyTr(v) {
    return Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  function toNumber(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (v == null) return null;
    const s = String(v).trim().replace(/[₺\s%]/g, '');
    if (!s) return null;
    let norm = s;
    if (/^\d{1,3}(?:\.\d{3})+,\d+$/.test(norm)) norm = norm.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(?:,\d{3})+\.\d+$/.test(norm)) norm = norm.replace(/,/g, '');
    else if (/^\d+,\d+$/.test(norm)) norm = norm.replace(',', '.');
    else if (/^\d{1,3}(?:\.\d{3})+$/.test(norm)) norm = norm.replace(/\./g, '');
    const n = Number(norm);
    return Number.isFinite(n) ? n : null;
  }

  function toPosInt(v) {
    const n = toNumber(v);
    if (n == null || n < 0) return null;
    const i = Math.round(n);
    return i >= 0 ? i : null;
  }

  function normalizeBank(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (!s) return '';
    const f = foldTr(s);
    for (let i = 0; i < BANK_NORM.length; i++) {
      if (BANK_NORM[i][1].test(f)) return BANK_NORM[i][0];
    }
    return s;
  }

  function normalizeDateIso(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (!s) return '';
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (y >= 2000 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        return `${y}-${pad(mo)}-${pad(d)}`;
      }
    }
    m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(s);
    if (m) {
      const d = +m[1], mo = +m[2], y = +m[3];
      if (y >= 2000 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        return `${y}-${pad(mo)}-${pad(d)}`;
      }
    }
    return '';
  }

  function isoToTr(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }

  // ---------- 1. Gizlilik Maskelemesi ----------
  /**
   * 10+ haneli sayıları (TC kimlik no, hesap/kart/telefon no), TR IBAN kalıplarını
   * ve e-posta adreslerini otomatik [gizli] olarak maskeler.
   * Normal borç tutarları (örn. "12.500 ₺", "1.250.000,50 ₺") ve tarihler bozulmaz.
   */
  function maskSensitive(text) {
    if (text == null) return '';
    let s = String(text);
    // 1. E-posta adresleri
    s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[gizli]');
    // 2. Türk IBAN kalıpları (boşluklu, tireli veya bitişik TR + 24 hane; en az 12 haneli TR...)
    s = s.replace(/\bTR\d{2}(?:[\s-]?\d){10,30}\b/gi, '[gizli]');
    // 3. 16 haneli (4-4-4-4) veya 15 haneli (4-6-5) boşluklu/tireli kart numaraları
    s = s.replace(/(?<!\d)(?<!\d[.,])\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}(?!\d)(?![.,]\d)/g, '[gizli]');
    s = s.replace(/(?<!\d)(?<!\d[.,])\d{4}[\s-]\d{6}[\s-]\d{5}(?!\d)(?![.,]\d)/g, '[gizli]');
    // 4. 10+ haneli bitişik sayılar (TC 11 hane, 16 haneli bitişik kart no, uzun hesap no, telefon)
    s = s.replace(/(?<!\d)(?<!\d[.,])\d{10,}(?!\d)(?![.,]\d)/g, '[gizli]');
    return s;
  }

  // ---------- 2. Kompakt, Anonimleştirilmiş Bağlam Oluşturucu ----------
  function fallbackYmOf(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }

  function fallbackIsoOf(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function buildContext(db, calc, now, settings) {
    db = db || {};
    settings = settings || {};
    const dt = now instanceof Date ? now : (now ? new Date(now) : new Date());
    const C = calc || (typeof window !== 'undefined' && window.KeseCalc) || null;
    const today = C && C.isoOf ? C.isoOf(dt) : fallbackIsoOf(dt);
    const thisYm = C && C.ymOf ? C.ymOf(dt) : fallbackYmOf(dt);

    let ozet;
    if (C && typeof C.summarize === 'function') {
      const s = C.summarize(db, dt, settings);
      ozet = {
        toplamKalanBorc: r2(s.kalanBorc || 0),
        buAyToplam: r2(s.buAyToplam || 0),
        buAyKalan: r2(s.buAy || 0),
        buAyOdenen: r2(s.buAyOdenen || 0),
        gelecekAy: r2(s.gelecekAy || 0),
        gecikmisTutar: r2(s.gecikmis || 0),
        aylikGelir: r2(s.gelir || 0),
        aylikSabitGider: r2(s.yasamGideri || 0),
        aylikNetKalan: r2(s.kalanSonrasi || 0),
        sonBitisTarihi: s.sonVade || null,
        kategoriDagilimi: {
          KREDI: r2((s.byCat && s.byCat.KREDI) || 0),
          KART: r2((s.byCat && s.byCat.KART) || 0),
          KMH: r2((s.byCat && s.byCat.KMH) || 0),
        },
      };
    } else {
      // calc verilmezse temel manuel özet
      let kalanBorc = 0, buAy = 0, buAyOdenen = 0, gecikmis = 0, sonVade = null;
      const byCat = { KREDI: 0, KART: 0, KMH: 0 };
      const scan = (cat, item) => {
        (item.taksitler || []).forEach((t) => {
          if (t.sigortaOder || t.sigortaGecmis) return;
          const v = Number(t.tutar) || 0;
          if (t.odendi) {
            if (!t.kapatildi && t.ym === thisYm) buAyOdenen += v;
            return;
          }
          kalanBorc += v;
          byCat[cat] += v;
          if (t.vade_tarihi && t.vade_tarihi < today) gecikmis += v;
          if (t.ym && t.ym <= thisYm) buAy += v;
          if (t.vade_tarihi && (!sonVade || t.vade_tarihi > sonVade)) sonVade = t.vade_tarihi;
        });
      };
      (db.krediler || []).forEach((kr) => scan('KREDI', kr));
      (db.kredi_kartlari || []).forEach((k) => (k.hareketler || []).forEach((h) => scan('KART', h)));
      (db.kmh_hesaplar || []).forEach((k) => (k.hareketler || []).forEach((h) => scan('KMH', h)));
      const gelir = (db.ek_gelirler || []).reduce((a, g) => a + (Number(g.tutar) || 0), 0);
      const sabit = Array.isArray(db.sabit_giderler)
        ? db.sabit_giderler.reduce((a, g) => a + (Number(g.tutar) || 0), 0)
        : (Number(settings.aylik_yasam_gideri) || 0);
      ozet = {
        toplamKalanBorc: r2(kalanBorc),
        buAyToplam: r2(buAy + buAyOdenen),
        buAyKalan: r2(buAy),
        buAyOdenen: r2(buAyOdenen),
        gelecekAy: 0,
        gecikmisTutar: r2(gecikmis),
        aylikGelir: r2(gelir),
        aylikSabitGider: r2(sabit),
        aylikNetKalan: r2(gelir - sabit - buAy - buAyOdenen),
        sonBitisTarihi: sonVade,
        kategoriDagilimi: { KREDI: r2(byCat.KREDI), KART: r2(byCat.KART), KMH: r2(byCat.KMH) },
      };
    }

    // Borç kalemlerini derle (kişisel kimlik bilgisi olmadan, tüm metinler maskeli)
    const rawItems = C && typeof C.items === 'function'
      ? C.items(db)
      : [].concat(
          (db.kmh_hesaplar || []).flatMap((h) => (h.hareketler || []).map((x) => ({ cat: 'KMH', parent: h, item: x, banka: h.banka, hesap: h.hesap_adi }))),
          (db.kredi_kartlari || []).flatMap((k) => (k.hareketler || []).map((x) => ({ cat: 'KART', parent: k, item: x, banka: k.banka, hesap: k.kart_adi }))),
          (db.krediler || []).map((kr) => ({ cat: 'KREDI', parent: null, item: kr, banka: kr.banka, hesap: kr.kredi_adi }))
        );

    const borclar = [];
    rawItems.forEach((e) => {
      const open = C && typeof C.unpaid === 'function'
        ? C.unpaid(e.item)
        : (e.item.taksitler || []).filter((t) => !t.odendi && !t.sigortaOder && !t.sigortaGecmis);
      if (!open.length) return;

      const kalanTutar = r2(open.reduce((acc, t) => acc + (Number(t.tutar) || 0), 0));
      if (!(kalanTutar > 0.005)) return;

      const gecikmisTutar = r2(
        open.filter((t) => t.vade_tarihi && t.vade_tarihi < today).reduce((acc, t) => acc + (Number(t.tutar) || 0), 0)
      );
      const aylikTaksit = r2(Number(open[0].tutar) || 0);
      const bitis = open.reduce((mx, t) => ((t.vade_tarihi || t.ym || '') > mx ? (t.vade_tarihi || t.ym || '') : mx), '');
      const faizRaw = e.item.faiz_orani != null ? e.item.faiz_orani : (e.parent && e.parent.faiz_orani != null ? e.parent.faiz_orani : null);
      const faiz = faizRaw != null && Number.isFinite(Number(faizRaw)) ? r2(Number(faizRaw)) : null;

      const hamAd = e.cat === 'KREDI'
        ? (e.item.kredi_adi || e.item.kredi_turu || 'Kredi')
        : (e.item.aciklama || e.hesap || (e.cat === 'KMH' ? 'KMH borcu' : 'Kart borcu'));

      const entry = {
        tur: e.cat,
        banka: maskSensitive(e.banka || ''),
        ad: maskSensitive(hamAd),
        kalanTutar,
        aylikTaksit,
        kalanTaksit: open.length,
        faiz,
        bitis: bitis || null,
      };
      if (gecikmisTutar > 0) entry.gecikmis = gecikmisTutar;
      borclar.push(entry);
    });

    // Kalan tutara göre büyükten küçüğe sırala, en fazla 30 kalem gönder (kompakt bağlam)
    borclar.sort((a, b) => (b.gecikmis || 0) - (a.gecikmis || 0) || b.kalanTutar - a.kalanTutar);
    const trimmedBorclar = borclar.slice(0, 30);

    // Kalan tutarlı elden borçlar (varsa)
    const eldenBorclar = (db.sabit_giderler || [])
      .filter((g) => g && g.kalan != null && g.kalan !== '' && Number(g.kalan) > 0.005)
      .map((g) => ({
        ad: maskSensitive(g.ad || 'Elden borç'),
        aylik: r2(Number(g.tutar) || 0),
        kalan: r2(Number(g.kalan) || 0),
      }));

    ozet.borcSayisi = borclar.length + eldenBorclar.length;

    const ctx = {
      tarih: today,
      ay: thisYm,
      ozet,
      borclar: trimmedBorclar,
    };
    if (eldenBorclar.length) ctx.eldenBorclar = eldenBorclar;
    return ctx;
  }

  // ---------- 3. Güvenli Markdown-Lite HTML Dönüştürücü ----------
  function formatInline(escapedLine) {
    // Yalnız escape edilmiş güvenli metin üzerinde çalışır
    let s = escapedLine;
    // **kalın**
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    // *italik* (boşlukla çevrili tek yıldızları etkilemez)
    s = s.replace(/(^|[^*])\*([^*\s][^*\n]*?[^*\s]|[^*\s])\*(?!\*)/g, '$1<em>$2</em>');
    // `satır içi kod`
    s = s.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
    return s;
  }

  /**
   * Önce tüm HTML karakterlerini escape eder (XSS sıfır), sonra **kalın**,
   * madde listeleri (- / *), numaralı listeler ve paragrafları temiz HTML'e çevirir.
   */
  function renderSafeMd(text) {
    if (text == null) return '';
    const raw = String(text).replace(/\r\n?/g, '\n').trim();
    if (!raw) return '';

    const escaped = escapeHtml(raw);
    const lines = escaped.split('\n');
    const out = [];
    let pBuf = [];
    let listType = null; // 'ul' | 'ol'
    let listItems = [];

    const flushPara = () => {
      if (!pBuf.length) return;
      out.push('<p>' + pBuf.map(formatInline).join('<br>') + '</p>');
      pBuf = [];
    };
    const flushList = () => {
      if (!listItems.length) return;
      out.push(`<${listType}>` + listItems.map((it) => `<li>${formatInline(it)}</li>`).join('') + `</${listType}>`);
      listItems = [];
      listType = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushPara();
        flushList();
        continue;
      }

      // Başlık (#, ##, ###)
      const heading = /^#{1,4}\s+(.+)$/.exec(line);
      if (heading) {
        flushPara();
        flushList();
        out.push(`<p><strong>${formatInline(heading[1])}</strong></p>`);
        continue;
      }

      // Madde listesi (- , * , • )
      const bullet = /^(?:[-*•])\s+(.+)$/.exec(line);
      if (bullet) {
        flushPara();
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(bullet[1]);
        continue;
      }

      // Numaralı liste (1. , 2) )
      const ordered = /^\d+[.)]\s+(.+)$/.exec(line);
      if (ordered) {
        flushPara();
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(ordered[1]);
        continue;
      }

      // Normal metin satırı
      flushList();
      pBuf.push(line);
    }

    flushPara();
    flushList();
    return out.join('');
  }

  // ---------- 4. AI Çıktısını KeseImport Adaylarına Dönüştürme ----------
  function normalizeTur(rawTur) {
    const f = foldTr(rawTur || '');
    if (/kmh|eksi|avans\s*hesap|ek\s*hesap|kredili\s*mevduat|arti\s*para/.test(f)) return 'KMH';
    if (/kart|card|ekstre/.test(f)) return 'KART';
    if (/kredi|loan|taksit/.test(f)) return 'KREDI';
    return 'KREDI';
  }

  /**
   * Worker'dan dönen items listesini app.js'in openImportWiz akışının birebir beklediği
   * aday yapısına dönüştürür.
   */
  function toImportCandidates(aiResult) {
    const rawItems = Array.isArray(aiResult)
      ? aiResult
      : (aiResult && Array.isArray(aiResult.items)
        ? aiResult.items
        : (aiResult && aiResult.result && Array.isArray(aiResult.result.items)
          ? aiResult.result.items
          : (aiResult && aiResult.data && Array.isArray(aiResult.data.items) ? aiResult.data.items : [])));

    const out = [];
    for (let i = 0; i < rawItems.length; i++) {
      const src = rawItems[i];
      if (!src || typeof src !== 'object') continue;

      const tur = normalizeTur(src.tur || src.urun || src.type || src.kind);
      const banka = normalizeBank(src.banka || src.bank || '');
      const defaultAd = tur === 'KART' ? 'Kredi kartı' : (tur === 'KMH' ? 'Avans Hesap' : 'Kredi');
      const ad = maskSensitive(String(src.ad || src.name || src.aciklama || '').trim()) || defaultAd;

      const aylik = toNumber(src.aylikTaksit != null ? src.aylikTaksit : src.aylik);
      let kalan = toPosInt(src.kalanTaksit != null ? src.kalanTaksit : src.kalan);
      let toplam = toPosInt(src.toplamTaksit != null ? src.toplamTaksit : src.toplam);
      let odenen = toPosInt(src.odenenTaksit != null ? src.odenenTaksit : src.odenen);
      const kalanBorc = toNumber(src.kalanBorc != null ? src.kalanBorc : (src.borc != null ? src.borc : src.debt));
      const ana = toNumber(src.anaPara != null ? src.anaPara : (src.ana != null ? src.ana : src.cekilenTutar));
      const limit = toNumber(src.limit);
      const faiz = toNumber(src.faiz != null ? src.faiz : src.faizOrani);
      const kesim = toPosInt(src.kesimGunu != null ? src.kesimGunu : src.kesim);
      const son = toPosInt(src.sonOdemeGunu != null ? src.sonOdemeGunu : src.son);
      const sonrakiIso = normalizeDateIso(src.sonrakiTarih || src.sonraki || src.vadeTarihi || src.nextDate);
      const sonrakiTr = isoToTr(sonrakiIso);

      // Taksit sayıları tutarlılık tamamlaması
      if (toplam != null && odenen != null && kalan == null && toplam >= odenen) kalan = toplam - odenen;
      if (toplam != null && kalan != null && odenen == null && toplam >= kalan) odenen = toplam - kalan;
      if (kalan != null && odenen != null && toplam == null) toplam = kalan + odenen;

      const rawNotes = Array.isArray(src.notlar)
        ? src.notlar
        : (Array.isArray(src.notes)
          ? src.notes
          : (typeof src.notlar === 'string' && src.notlar.trim()
            ? [src.notlar.trim()]
            : (typeof src.note === 'string' && src.note.trim() ? [src.note.trim()] : [])));
      const notlar = rawNotes.map((n) => maskSensitive(String(n).trim())).filter(Boolean);

      const taksitliKmh = tur === 'KMH' && ((aylik != null && aylik > 0) || (kalan != null && kalan >= 2));
      const isLoanLike = tur === 'KREDI' || taksitliKmh;

      const borcAdaylari = [];
      const borclar = [];
      if ((tur === 'KART' || tur === 'KMH') && kalanBorc != null && kalanBorc > 0) {
        borcAdaylari.push({ etiket: 'Güncel borç (Yapay Zeka)', tutar: r2(kalanBorc) });
        borclar.push({ ad: 'Güncel borç (Yapay Zeka)', tutar: r2(kalanBorc) });
      }

      // app.js openImportWiz -> impSummary / impNoteHtml için bulunan ve eksik özetleri
      const bulunan = [];
      if (banka) bulunan.push(`Banka: ${banka}`);
      if (isLoanLike) {
        if (aylik != null && aylik > 0) bulunan.push(`Aylık taksit: ${fmtMoneyTr(aylik)}`);
        if (kalan != null && kalan >= 1) bulunan.push(`Kalan taksit: ${kalan}`);
        if (sonrakiTr) bulunan.push(`Sıradaki taksit: ${sonrakiTr}`);
        if (toplam != null && toplam >= 1) bulunan.push(`Toplam taksit: ${toplam}`);
        if (kalanBorc != null && kalanBorc > 0) bulunan.push(`Kalan borç: ${fmtMoneyTr(kalanBorc)}`);
      } else {
        if (kalanBorc != null && kalanBorc > 0) bulunan.push(`Güncel borç: ${fmtMoneyTr(kalanBorc)}`);
        if (limit != null && limit > 0) bulunan.push(`Toplam limit: ${fmtMoneyTr(limit)}`);
        if (kesim != null && kesim >= 1 && kesim <= 31) bulunan.push(`Kesim günü: ${kesim}`);
        if (son != null && son >= 1 && son <= 31) bulunan.push(`Son ödeme günü: ${son}`);
      }
      if (faiz != null && faiz >= 0) bulunan.push(`Aylık faiz: %${String(faiz).replace('.', ',')}`);

      const eksik = [];
      if (isLoanLike) {
        if (!(aylik != null && aylik > 0)) eksik.push('Aylık taksit tutarı');
        if (!(kalan != null && kalan >= 1)) eksik.push('Kalan taksit sayısı');
        if (!sonrakiIso) eksik.push('Sıradaki taksit tarihi');
      }

      const cand = {
        tur,
        urun: tur,
        kind: isLoanLike ? 'kredi' : 'kart',
        banka,
        ad,
        aiParsed: true,
        bulunan,
        notlar,
        notes: notlar.slice(),
        borclar,
        borcAdaylari,
      };

      if (taksitliKmh) cand.taksitli = true;
      if (aylik != null && aylik > 0) { cand.aylik = r2(aylik); cand.aylikTaksit = r2(aylik); }
      if (kalan != null && kalan >= 1) { cand.kalan = kalan; cand.kalanTaksit = kalan; }
      if (toplam != null && toplam >= 1) { cand.toplam = toplam; cand.toplamTaksit = toplam; }
      if (odenen != null && odenen >= 0) { cand.odenen = odenen; cand.odenenTaksit = odenen; }
      if (kalanBorc != null && kalanBorc > 0) { cand.kalanBorc = r2(kalanBorc); cand.borc = r2(kalanBorc); }
      if (ana != null && ana > 0) { cand.ana = r2(ana); }
      if (limit != null && limit > 0) { cand.limit = r2(limit); }
      if (faiz != null && faiz >= 0) { cand.faiz = r2(faiz); }
      if (kesim != null && kesim >= 1 && kesim <= 31) { cand.kesim = kesim; cand.kesimGunu = kesim; }
      if (son != null && son >= 1 && son <= 31) { cand.son = son; cand.sonOdemeGunu = son; }
      if (sonrakiIso) {
        cand.sonraki = sonrakiIso;
        cand.sonrakiTarih = sonrakiIso;
        cand.sonrakiTarihTr = sonrakiTr;
      }
      if (eksik.length) cand.eksik = eksik;

      out.push(cand);
    }
    return out;
  }

  // ---------- 5. API İstemcisi ----------
  let statusCache = null;

  async function fetchJson(url, opts) {
    if (typeof fetch !== 'function') {
      return { ok: false, status: 0, code: 'NO_FETCH', data: null };
    }
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS) : null;
    try {
      const res = await fetch(url, Object.assign({}, opts || {}, ctrl ? { signal: ctrl.signal } : {}));
      let data = null;
      const ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
      if (ct.includes('application/json')) {
        try { data = await res.json(); } catch (e) { data = null; }
      } else {
        try {
          const txt = await res.text();
          if (txt && txt.trim().startsWith('{')) data = JSON.parse(txt);
        } catch (e) { data = null; }
      }
      if (!res.ok) {
        const code = (data && (data.code || data.errorCode)) || (res.status === 404 || res.status === 503 ? 'NOT_CONFIGURED' : `HTTP_${res.status}`);
        return { ok: false, status: res.status, code, message: (data && (data.message || data.error)) || '', data };
      }
      return { ok: true, status: res.status, code: null, data };
    } catch (err) {
      const isAbort = err && err.name === 'AbortError';
      return { ok: false, status: 0, code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR', message: '', data: null };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * GET /api/ai/status sonucunu önbellekler.
   * Yerel önizleme (404) veya ağ hatasında asla hata fırlatmaz; { ok: false, available: false } döner.
   */
  async function checkStatus(force) {
    if (!force && statusCache) return statusCache;
    const res = await fetchJson(STATUS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!res.ok || !res.data) {
      statusCache = { ok: false, available: false, code: res.code || 'UNAVAILABLE' };
      return statusCache;
    }
    const d = res.data;
    const available = Boolean(d.available !== undefined ? d.available : (d.configured !== undefined ? d.configured : d.ok));
    statusCache = {
      ok: Boolean(d.ok !== undefined ? d.ok : available),
      available,
      provider: d.provider || null,
      model: d.model || null,
      code: d.code || (available ? null : 'NOT_CONFIGURED'),
    };
    return statusCache;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (typeof FileReader !== 'undefined') {
        const fr = new FileReader();
        fr.onload = () => {
          const res = String(fr.result || '');
          const idx = res.indexOf(',');
          resolve(idx >= 0 ? res.slice(idx + 1) : res);
        };
        fr.onerror = () => reject(new Error('READ_FAILED'));
        fr.readAsDataURL(file);
        return;
      }
      if (file && typeof file.arrayBuffer === 'function') {
        file.arrayBuffer().then((buf) => {
          if (typeof Buffer !== 'undefined') {
            resolve(Buffer.from(buf).toString('base64'));
          } else {
            const bytes = new Uint8Array(buf);
            let bin = '';
            for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
            resolve(btoa(bin));
          }
        }, reject);
        return;
      }
      reject(new Error('NO_FILE_READER'));
    });
  }

  /**
   * Görsel (image/*) veya PDF (application/pdf, max 6 MB) dosyasını /api/ai (mode: 'parse') ile çözer.
   * Başarısız veya servis kapalıysa { ok: false, fallback: true, reason } döner; app.js sessizce yerel OCR'a geçer.
   */
  async function parseFile(file) {
    if (!file) return { ok: false, fallback: true, reason: 'NO_FILE' };
    const name = String(file.name || '');
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(name);
    const isImg = /^image\//i.test(file.type || '') || /\.(?:png|jpe?g|webp|heic|heif)$/i.test(name);
    if (!isPdf && !isImg) return { ok: false, fallback: true, reason: 'UNSUPPORTED_TYPE' };
    if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
      return { ok: false, fallback: true, reason: 'FILE_TOO_LARGE' };
    }

    let base64;
    try {
      base64 = await fileToBase64(file);
    } catch (e) {
      return { ok: false, fallback: true, reason: 'READ_FAILED' };
    }
    if (!base64) return { ok: false, fallback: true, reason: 'EMPTY_FILE' };

    const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');
    const res = await fetchJson(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        mode: 'parse',
        mimeType,
        data: base64,
        fileName: maskSensitive(name),
      }),
    });

    if (!res.ok || !res.data || res.data.ok === false) {
      return {
        ok: false,
        fallback: true,
        reason: (res.data && (res.data.code || res.data.error)) || res.code || 'PARSE_FAILED',
      };
    }

    const items = toImportCandidates(res.data);
    if (!items.length) {
      return {
        ok: false,
        fallback: true,
        reason: 'NO_ITEMS_FOUND',
      };
    }

    return {
      ok: true,
      items,
      raw: res.data,
      notes: Array.isArray(res.data.notes) ? res.data.notes.map(maskSensitive) : [],
    };
  }

  /** POST /api/ai (mode: 'chat') */
  async function askChat(messages, ctx) {
    const clean = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-MAX_HISTORY)
      .map((m) => {
        const t = m.role === 'user' ? maskSensitive(m.content.trim()) : m.content.trim();
        return { role: m.role, text: t, content: t };
      });

    if (!clean.length) return { ok: false, code: 'EMPTY_MESSAGE', message: 'Lütfen bir soru yazın.' };

    const res = await fetchJson(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        mode: 'chat',
        messages: clean,
        context: ctx || {},
      }),
    });

    if (!res.ok || !res.data || res.data.ok === false) {
      return {
        ok: false,
        code: (res.data && (res.data.code || res.data.errorCode)) || res.code || 'CHAT_FAILED',
        message: (res.data && (res.data.message || res.data.error)) || res.message || '',
      };
    }

    const d = res.data;
    const reply = String(d.reply || d.text || d.message || d.answer || '').trim();
    if (!reply) return { ok: false, code: 'EMPTY_REPLY', message: 'Kese Asistan şu an yanıt üretemedi.' };
    return { ok: true, reply, data: d };
  }

  /** POST /api/ai (mode: 'advice') — Bu ayın 3 adımlık planı */
  async function getAdvice(ctx) {
    const res = await fetchJson(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        mode: 'advice',
        context: ctx || {},
      }),
    });

    if (!res.ok || !res.data || res.data.ok === false) {
      return {
        ok: false,
        code: (res.data && (res.data.code || res.data.errorCode)) || res.code || 'ADVICE_FAILED',
        message: (res.data && (res.data.message || res.data.error)) || res.message || '',
      };
    }

    const d = res.data;
    const rawSteps = d.steps || d.actions || d.plan || d.adimlar || (d.data && d.data.steps) || [];
    const steps = Array.isArray(rawSteps)
      ? rawSteps.slice(0, 5).map((st, idx) => {
          if (typeof st === 'string') return { no: idx + 1, title: `Adım ${idx + 1}`, detail: st, impact: '' };
          return {
            no: idx + 1,
            title: String(st.title || st.baslik || st.heading || `Adım ${idx + 1}`).trim(),
            detail: String(st.detail || st.aciklama || st.description || st.body || st.text || '').trim(),
            impact: String(st.impact || st.etki || st.kazanc || st.tag || '').trim(),
          };
        }).filter((st) => st.title || st.detail)
      : [];

    return {
      ok: true,
      summary: String(d.summary || d.ozet || '').trim(),
      steps,
      reply: String(d.reply || d.text || '').trim(),
      data: d,
    };
  }

  // ---------- 6. Sohbet & Akıllı Plan Penceresi (#dlg-ai) ----------
  const modalState = {
    mounted: false,
    busy: false,
    opts: null,
    messages: [], // { role: 'user'|'assistant', content: string }
    entries: [],  // UI kayıtları: { type: 'welcome'|'user'|'bot'|'plan'|'notice'|'error', ... }
  };

  function playSfx(name) {
    try {
      if (typeof window !== 'undefined' && window.KeseLive && window.KeseLive.sfx && typeof window.KeseLive.sfx.play === 'function') {
        window.KeseLive.sfx.play(name);
      }
    } catch (e) { /* sessiz geç */ }
  }

  function isReducedMotion() {
    try {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function getLiveContext() {
    const o = modalState.opts || {};
    const db = typeof o.getDb === 'function' ? o.getDb() : (o.db || {});
    const calc = typeof o.getCalc === 'function' ? o.getCalc() : (o.calc || (typeof window !== 'undefined' && window.KeseCalc) || null);
    const now = typeof o.getNow === 'function' ? o.getNow() : (o.now || new Date());
    const settings = typeof o.getSettings === 'function' ? o.getSettings() : (o.settings || {});
    return buildContext(db, calc, now, settings);
  }

  function isUnavailableCode(code) {
    return code === 'NOT_CONFIGURED' || code === 'NO_API_KEY' || code === 'UNAVAILABLE' || code === 'HTTP_404' || code === 'HTTP_503';
  }

  function ensureDialog() {
    if (typeof document === 'undefined') return null;
    let dlg = document.getElementById('dlg-ai');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'dlg-ai';
      dlg.setAttribute('aria-labelledby', 'ai-title');
      document.body.appendChild(dlg);
    }
    dlg.classList.add('ai-dlg');

    if (!dlg.dataset.aiReady) {
      dlg.innerHTML = [
        '<div class="ai-shell">',
        '  <header class="ai-head">',
        '    <div class="ai-head-left ai-brand">',
        '      <img class="ai-mascot" src="icons/mascot-96.png" alt="" width="36" height="36" decoding="async">',
        '      <div class="ai-head-copy ai-titles">',
        '        <h2 id="ai-title">Kese Asistan</h2>',
        '        <p class="sub ai-sub">Verilerin maskelenir · Kişisel borç koçun</p>',
        '      </div>',
        '    </div>',
        '    <div class="ai-head-acts">',
        '      <button type="button" class="btn ghost sm ai-clear" data-ai-act="clear" aria-label="Sohbeti temizle">Temizle</button>',
        '      <button type="button" class="x ai-close" data-close data-ai-act="close" aria-label="Kapat">✕</button>',
        '    </div>',
        '  </header>',
        '  <div class="ai-feed" id="ai-feed" role="log" aria-live="polite" aria-relevant="additions"></div>',
        '  <form class="ai-composer" id="ai-composer" novalidate>',
        '    <textarea id="ai-input" class="ai-input" rows="1" maxlength="1000" placeholder="Borçlarınla ilgili bir şey sor…" aria-label="Sorunuzu yazın"></textarea>',
        '    <button type="submit" class="btn primary ai-send" id="ai-send" aria-label="Gönder">Gönder</button>',
        '  </form>',
        '</div>',
      ].join('\n');

      // Olay bağlamaları (tek sefer)
      dlg.addEventListener('click', (ev) => {
        if (ev.target === dlg) {
          closeModal(dlg);
          return;
        }
        const actEl = ev.target.closest('[data-ai-act]');
        if (!actEl) return;
        const act = actEl.getAttribute('data-ai-act');
        if (act === 'close') {
          closeModal(dlg);
        } else if (act === 'clear') {
          playSfx('tap');
          resetConversation();
          renderFeed(dlg);
        } else if (act === 'chip') {
          const prompt = actEl.getAttribute('data-prompt') || '';
          if (prompt) sendUserMessage(dlg, prompt);
        } else if (act === 'advice') {
          requestAdvicePlan(dlg);
        }
      });

      const form = dlg.querySelector('#ai-composer');
      const input = dlg.querySelector('#ai-input');
      if (form) {
        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (!input) return;
          const text = input.value.trim();
          if (!text) return;
          input.value = '';
          autoSizeInput(input);
          sendUserMessage(dlg, text);
        });
      }
      if (input) {
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
            ev.preventDefault();
            if (form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        });
        input.addEventListener('input', () => autoSizeInput(input));
      }

      dlg.dataset.aiReady = '1';
      modalState.mounted = true;
    }

    return dlg;
  }

  function autoSizeInput(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function closeModal(dlg) {
    if (!dlg) return;
    try {
      if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      else dlg.removeAttribute('open');
    } catch (e) {
      dlg.removeAttribute('open');
    }
  }

  function resetConversation() {
    modalState.messages = [];
    modalState.entries = [{ type: 'welcome' }];
  }

  function renderWelcomeHtml() {
    const chipsHtml = QUICK_CHIPS.map((q) => (
      `<button type="button" class="ai-chip" data-ai-act="chip" data-prompt="${escapeHtml(q)}">${escapeHtml(q)}</button>`
    )).join('');

    return [
      '<div class="ai-msg is-bot ai-bot ai-welcome">',
      '  <p>Merhaba! Borçlarını, aylık bütçeni ve faiz yükünü birlikte netleştirebiliriz. Kimlik, IBAN ya da kart numaran otomatik maskelenir.</p>',
      '  <p class="ai-welcome-hint">Aşağıdan tek dokunuşla bir soru seçebilir ya da kendi sorunu yazabilirsin:</p>',
      '</div>',
      `<div class="ai-chips" role="group" aria-label="Hazır sorular">${chipsHtml}</div>`,
      '<div class="ai-plan-cta">',
      '  <button type="button" class="btn primary ai-plan-btn" data-ai-act="advice">✨ Bu Ayın 3 Adımlık Planı</button>',
      '</div>',
    ].join('');
  }

  function renderPlanHtml(entry) {
    const summaryHtml = entry.summary ? `<div class="ai-plan-sum">${renderSafeMd(entry.summary)}</div>` : '';
    if (entry.steps && entry.steps.length) {
      const cards = entry.steps.map((st, idx) => (
        '<article class="ai-plan-card">'
        + `<div class="ai-plan-card-head"><span class="ai-plan-no">${st.no || idx + 1}</span><h3>${escapeHtml(st.title)}</h3></div>`
        + (st.detail ? `<div class="ai-plan-detail">${renderSafeMd(st.detail)}</div>` : '')
        + (st.impact ? `<div class="ai-plan-impact">${escapeHtml(st.impact)}</div>` : '')
        + '</article>'
      )).join('');
      return (
        '<div class="ai-msg is-bot ai-bot ai-plan-wrap">'
        + '<div class="ai-plan-title">✨ Bu Ayın 3 Adımlık Planı</div>'
        + summaryHtml
        + `<div class="ai-plan-cards">${cards}</div>`
        + '</div>'
      );
    }
    return `<div class="ai-msg is-bot ai-bot">${renderSafeMd(entry.reply || entry.summary || 'Plan hazırlandı.')}</div>`;
  }

  function renderNoticeHtml(entry) {
    const ctx = entry.ctx;
    let miniStats = '';
    if (ctx && ctx.ozet && (ctx.ozet.toplamKalanBorc > 0 || ctx.ozet.buAyToplam > 0)) {
      miniStats = '<div class="ai-notice-stats">'
        + `<span>Kalan borç: <strong>${escapeHtml(fmtMoneyTr(ctx.ozet.toplamKalanBorc))}</strong></span>`
        + `<span>Bu ayki yük: <strong>${escapeHtml(fmtMoneyTr(ctx.ozet.buAyToplam))}</strong></span>`
        + '</div>';
    }
    return (
      '<div class="ai-msg is-note ai-notice" role="status">'
      + '<div class="ai-notice-title">Kese Asistan şu an dinleniyor</div>'
      + '<p>Yapay zeka servisi bu ortamda henüz etkin değil. Canlı yayında otomatik açılır; bu arada tüm borç takibin, simülasyon ve ödeme planın cihazında eksiksiz çalışmaya devam ediyor.</p>'
      + miniStats
      + '</div>'
    );
  }

  function renderFeed(dlg) {
    const feed = dlg.querySelector('#ai-feed');
    if (!feed) return;

    const parts = modalState.entries.map((entry) => {
      if (entry.type === 'welcome') return renderWelcomeHtml();
      if (entry.type === 'user') {
        return `<div class="ai-msg is-user ai-user"><p>${escapeHtml(entry.content).replace(/\n/g, '<br>')}</p></div>`;
      }
      if (entry.type === 'bot') {
        return `<div class="ai-msg is-bot ai-bot">${renderSafeMd(entry.content)}</div>`;
      }
      if (entry.type === 'plan') return renderPlanHtml(entry);
      if (entry.type === 'notice') return renderNoticeHtml(entry);
      if (entry.type === 'error') {
        return `<div class="ai-msg is-bot is-err ai-err"><p>${escapeHtml(entry.content)}</p></div>`;
      }
      return '';
    });

    if (modalState.busy) {
      parts.push(
        '<div class="ai-typing" aria-label="Kese Asistan yazıyor"><span></span><span></span><span></span></div>'
      );
    }

    feed.innerHTML = parts.join('');
    setBusyControls(dlg, modalState.busy);

    // En alta kaydır
    try {
      feed.scrollTo({ top: feed.scrollHeight, behavior: isReducedMotion() ? 'auto' : 'smooth' });
    } catch (e) {
      feed.scrollTop = feed.scrollHeight;
    }
  }

  function setBusyControls(dlg, busy) {
    const sendBtn = dlg.querySelector('#ai-send');
    const input = dlg.querySelector('#ai-input');
    if (sendBtn) sendBtn.disabled = !!busy;
    if (input) input.disabled = !!busy;
    dlg.querySelectorAll('.ai-chip, .ai-plan-btn').forEach((btn) => { btn.disabled = !!busy; });
  }

  async function sendUserMessage(dlg, rawText) {
    if (modalState.busy) return;
    const text = String(rawText || '').trim();
    if (!text) return;

    playSfx('tap');
    const safeText = maskSensitive(text);
    modalState.messages.push({ role: 'user', content: safeText });
    modalState.entries.push({ type: 'user', content: safeText });
    modalState.busy = true;
    renderFeed(dlg);

    const ctx = getLiveContext();
    const res = await askChat(modalState.messages, ctx);
    modalState.busy = false;

    if (res.ok) {
      modalState.messages.push({ role: 'assistant', content: res.reply });
      modalState.entries.push({ type: 'bot', content: res.reply });
      playSfx('add');
    } else if (isUnavailableCode(res.code)) {
      modalState.entries.push({ type: 'notice', ctx });
    } else {
      const msg = res.code === 'TIMEOUT'
        ? 'Yanıt biraz uzun sürdü, lütfen birkaç saniye sonra tekrar dene.'
        : (res.message || 'Şu an yanıt alınamadı. Bağlantını kontrol edip tekrar deneyebilirsin.');
      modalState.entries.push({ type: 'error', content: msg });
    }

    renderFeed(dlg);
    const input = dlg.querySelector('#ai-input');
    if (input && dlg.open) input.focus();
  }

  async function requestAdvicePlan(dlg) {
    if (modalState.busy) return;
    playSfx('tap');
    modalState.entries.push({ type: 'user', content: '✨ Bu ayın 3 adımlık planını çıkarır mısın?' });
    modalState.busy = true;
    renderFeed(dlg);

    const ctx = getLiveContext();
    const res = await getAdvice(ctx);
    modalState.busy = false;

    if (res.ok) {
      modalState.entries.push({ type: 'plan', summary: res.summary, steps: res.steps, reply: res.reply });
      playSfx('add');
    } else if (isUnavailableCode(res.code)) {
      modalState.entries.push({ type: 'notice', ctx });
    } else {
      const msg = res.code === 'TIMEOUT'
        ? 'Plan hazırlanırken süre doldu, lütfen tekrar dene.'
        : (res.message || 'Plan şu an oluşturulamadı, birazdan tekrar deneyebilirsin.');
      modalState.entries.push({ type: 'error', content: msg });
    }

    renderFeed(dlg);
  }

  /**
   * Sohbet ve Akıllı Plan penceresini açar (#dlg-ai).
   * opts: { getDb, getCalc, getNow, getSettings, initialPrompt, autoAdvice }
   */
  function openModal(opts) {
    modalState.opts = opts || modalState.opts || {};
    const dlg = ensureDialog();
    if (!dlg) return null;

    if (!modalState.entries.length) resetConversation();
    renderFeed(dlg);

    try {
      if (!dlg.open) {
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
      }
    } catch (e) {
      dlg.setAttribute('open', '');
    }

    playSfx('tap');

    // Arka planda durum kontrolü (kullanıcıyı bekletmeden)
    checkStatus(false).then((st) => {
      if (!st.available && modalState.entries.length === 1 && modalState.entries[0].type === 'welcome' && !opts?.initialPrompt && !opts?.autoAdvice) {
        modalState.entries.push({ type: 'notice', ctx: getLiveContext() });
        renderFeed(dlg);
      }
    });

    if (opts && opts.autoAdvice) {
      setTimeout(() => requestAdvicePlan(dlg), 40);
    } else if (opts && opts.initialPrompt) {
      setTimeout(() => sendUserMessage(dlg, opts.initialPrompt), 40);
    } else {
      const input = dlg.querySelector('#ai-input');
      if (input) setTimeout(() => { try { input.focus(); } catch (e) { /* yok say */ } }, 60);
    }

    return dlg;
  }

  return {
    QUICK_CHIPS,
    maskSensitive,
    buildContext,
    renderSafeMd,
    toImportCandidates,
    checkStatus,
    parseFile,
    askChat,
    getAdvice,
    openModal,
    // Test / iç kullanım için önbellek sıfırlama
    _resetStatusCache: () => { statusCache = null; },
  };
}));
