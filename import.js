/* Kese · Dosyadan (ekran görüntüsü / PDF) veri okuma.
   Her şey cihazda çalışır: PDF metni pdf.js ile, resimler Tesseract (OCR) ile okunur; hiçbir dosya dışarı gönderilmez.
   parse() saf bir fonksiyondur (tarayıcı ve testlerde aynı çalışır); readFiles() yalnızca tarayıcıda çalışır. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseImport = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- Metin yardımcıları ----------
  const fold = (s) => String(s == null ? '' : s)
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const AMT_SRC = '(?:\\d{1,3}(?:\\.\\d{3})+,\\d{2}|\\d{1,3}(?:,\\d{3})+\\.\\d{2}|\\d+,\\d{2}|\\d+\\.\\d{2})(?!\\d)';
  const DATE_RE = /(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4})/g;
  const MONTHS = { oca: 1, sub: 2, mar: 3, nis: 4, may: 5, haz: 6, tem: 7, agu: 8, eyl: 9, eki: 10, kas: 11, ara: 12 };
  const pad = (n) => String(n).padStart(2, '0');

  const loose = (src) => src.split('\\s+').join('\\s*');
  const addMonths = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const t = y * 12 + (m - 1) + n; const ny = Math.floor(t / 12), nm = ((t % 12) + 12) % 12 + 1; return `${ny}-${pad(nm)}-${pad(Math.min(d, new Date(ny, nm, 0).getDate()))}`; };
  const addMonth = (iso) => { const [y, m, d] = iso.split('-').map(Number); const t = y * 12 + m; const ny = Math.floor(t / 12), nm = (t % 12) + 1; return `${ny}-${pad(nm)}-${pad(Math.min(d, new Date(ny, nm, 0).getDate()))}`; };
  /** OCR küçük puntolu tablolarda nokta/virgülleri düşürür: "14112026", "11.022026", "05.04 2026", "1524491", "19.064 64", "213.428.74".
      Tarihler ve (tarih içeren tablo satırlarında) tutarlar onarılır. */
  const validDM = (d, m) => +d >= 1 && +d <= 31 && +m >= 1 && +m <= 12;
  function repairLine(line) {
    let l = line;
    l = l.replace(/(?<![\d.,\/])(\d{2})[.\s]?(\d{2})[.\s]?(20\d{2})(?!\d)/g, (m, d, mo, y) => (validDM(d, mo) ? `${d}.${mo}.${y}` : m));
    l = l.replace(/(\d{1,3}(?:\.\d{3})+)\.(\d{2})(?![\d.,])/g, '$1,$2');
    if (/\d{2}\.\d{2}\.20\d{2}/.test(l)) {
      l = l.replace(/(\d{1,3}(?:\.\d{3})+)\s(\d{2})(?![\d.,])/g, '$1,$2');
      l = l.replace(/(?<!\d)(\d{1,3})\s(\d{3}),(\d{2})(?!\d)/g, '$1.$2,$3');
      l = l.replace(/(?<!\d)(\d{1,3})\s(\d{3})\.(\d{2})(?![\d.,])/g, '$1.$2,$3');
      l = l.replace(/(?<![\d.,\/])(\d{3,7})(\d{2})(?![\d.,\/])/g, '$1,$2');
    }
    return l;
  }
  function toNum(s) {
    const t = String(s).replace(/\s/g, '');
    if (/,\d{2}$/.test(t)) return parseFloat(t.replace(/\./g, '').replace(',', '.'));
    return parseFloat(t.replace(/,/g, ''));
  }
  function datesIn(line) {
    const out = []; let m; DATE_RE.lastIndex = 0;
    while ((m = DATE_RE.exec(line))) {
      const d = +m[1], mo = +m[2], y = +m[3];
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 2000 && y <= 2100) out.push(`${y}-${pad(mo)}-${pad(d)}`);
    }
    return out;
  }
  function amountsIn(line) {
    const clean = line.replace(DATE_RE, ' ');
    const re = new RegExp(AMT_SRC, 'g'); const out = []; let m;
    while ((m = re.exec(clean))) { const v = toNum(m[0]); if (Number.isFinite(v)) out.push(v); }
    return out;
  }
  /** "15 Ara", "02 Kasım 2026" gibi gün-ay(-yıl) yazımlarını ISO'ya çevirir; yıl yoksa en yakın gelecek tarih alınır. */
  function dayMonthIso(day, monName, year, now) {
    const mo = MONTHS[fold(monName).slice(0, 3)]; const d = +day;
    if (!mo || !(d >= 1 && d <= 31)) return '';
    if (year) return `${year}-${pad(mo)}-${pad(d)}`;
    const base = now || new Date(); let y = base.getFullYear();
    const cand = new Date(y, mo - 1, d); const lim = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1);
    if (cand < lim) y += 1;
    return `${y}-${pad(mo)}-${pad(d)}`;
  }
  function firstDateAfter(f, labelSrc, now) {
    const m = new RegExp('(?:' + loose(labelSrc) + ')[\\s:=-]*(?:(\\d{1,2})\\s*[./-]\\s*(\\d{1,2})\\s*[./-]\\s*(\\d{4})|(\\d{1,2})\\s+([a-z]{3,9})(?:\\s+(\\d{4}))?)', 'i').exec(f);
    if (!m) return '';
    if (m[3]) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
    return dayMonthIso(m[4], m[5], m[6], now);
  }
  function grab(f, labelSrc, valSrc) {
    const m = new RegExp('(?:' + loose(labelSrc) + ')[\\s:=%()*.\\-]*(' + valSrc + ')', 'i').exec(f);
    return m ? m[1] : null;
  }
  /** Büyük puntolu tutarlarda kuruş kısmı küçük yazıldığı için OCR'da bozulur ("10.521 so TL", "1.854 3171"). Tam kısım güvenle alınır;
      kuruş iki rakam olarak okunabildiyse eklenir, okunamadıysa tutar "yaklaşık" işaretlenir. */
  function grabLoose(f, labelSrc) {
    const m = new RegExp('(?:' + loose(labelSrc) + ')[\\s:=%()*.\\-]*(\\d{1,3}(?:\\.\\d{3})+)(?:[\\s,.]*(\\d{2})\\d{0,2}(?!\\d))?', 'i').exec(f);
    if (!m) return null;
    const ip = parseFloat(m[1].replace(/\./g, ''));
    return m[2] ? { v: ip + parseInt(m[2], 10) / 100, yaklasik: false } : { v: ip, yaklasik: true };
  }
  function modeAmount(list) {
    const c = new Map(); list.forEach((v) => c.set(v, (c.get(v) || 0) + 1));
    let best = null, n = 0; c.forEach((k, v) => { if (k > n) { n = k; best = v; } });
    return best;
  }

  // ---------- Banka ----------
  // [banka, [[kalıp, ağırlık]...]]: banka adı/alan adı/unvan güçlü (3-4), kart/ürün markası zayıf (1-2) ipucudur. En yüksek puanlı banka seçilir.
  const BANK_HINTS = [
    ['Türkiye İş Bankası', [[/turkiye\s*is\s*bankasi|\bis\s*bankasi|isbank|turkiye\s*is\b/, 3], [/maximum|maximiles/, 1], [/taksitli\s*ek\s*hesap/, 1], [/kredinizin\s*odeme\s*plani\s*asagidaki|odeme\s*plani\s*bilgilerim|sube\s*kodu\s*-\s*hesap\s*no/, 3]]],
    ['Garanti BBVA', [[/garanti|bbva/, 3], [/\bbonus\b/, 1], [/avans\s*hesap/, 1], [/kredi\s*hesabinizin\s*odeme\s*plani|bugunku\s*kredi\s*borcu/, 3]]],
    ['Ziraat Katılım', [[/ziraat\s*katilim/, 4]]],
    ['Ziraat Dinamik Banka', [[/ziraat\s*dinamik/, 4]]],
    ['Ziraat Bankası', [[/ziraat/, 3], [/bankkart/, 1]]],
    ['Vakıf Katılım', [[/vakif\s*katilim/, 4]]],
    ['VakıfBank', [[/vakifbank|vakiflar\s*bankasi|vakif\s*bank\b/, 3]]],
    ['Halkbank', [[/halkbank|halk\s*bankasi|turkiye\s*halk/, 3], [/\bparaf\b/, 1]]],
    ['Yapı Kredi', [[/yapi\s*(ve\s*)?kredi|yapikredi/, 3], [/world\s*card|\bworld\b|adios/, 1]]],
    ['Akbank', [[/akbank/, 3], [/arti\s*para/, 2], [/axess|\bwings\b/, 1], [/ekstre\s*tl\s*borcu|asgari\s*odeme\s*tl\s*tutari/, 2]]],
    ['QNB Türkiye', [[/\bqnb\b|finansbank/, 3], [/cardfinans/, 1]]],
    ['Enpara Bank', [[/enpara/, 4], [/hesaba\s*yatacak\s*net\s*tutar/, 3]]],
    ['DenizBank', [[/denizbank|deniz\s*bank/, 3]]],
    ['TEB (Türk Ekonomi Bankası)', [[/\bteb\b|turk\s*ekonomi\s*bankasi/, 3]]],
    ['ING', [[/\bing\s*bank|\bing\.com|\bing\b/, 2]]],
    ['HSBC', [[/hsbc/, 3]]],
    ['Şekerbank', [[/sekerbank|seker\s*bank/, 3]]],
    ['Fibabanka', [[/fibabanka|fiba\s*banka/, 3]]],
    ['Odeabank', [[/odeabank|\bodea\b/, 3]]],
    ['Kuveyt Türk Katılım', [[/kuveyt\s*turk/, 3]]],
    ['Albaraka Türk Katılım', [[/albaraka/, 3]]],
    ['Türkiye Finans Katılım', [[/turkiye\s*finans/, 3]]],
    ['Anadolubank', [[/anadolu\s*bank/, 3]]],
    ['Burgan Bank', [[/burgan/, 3]]],
    ['Alternatif Bank', [[/alternatif\s*bank/, 3]]],
    ['ICBC Turkey', [[/icbc/, 3]]],
    ['Colendi Bank', [[/colendi/, 3]]],
    ['Emlak Katılım', [[/emlak\s*katilim/, 3]]],
    ['Dünya Katılım', [[/dunya\s*katilim/, 3]]],
    ['Hayat Finans Katılım', [[/hayat\s*finans/, 3]]],
    ['FUPS Bank', [[/\bfups\b/, 3]]],
  ];
  function detectBank(f, list) {
    let best = '', bs = 0;
    for (const [name, hints] of BANK_HINTS) {
      if (list && !list.includes(name)) continue;
      let sc = 0; hints.forEach(([re, w]) => { if (re.test(f)) sc += w; });
      if (sc > bs) { bs = sc; best = name; }
    }
    return best;
  }

  // ---------- Logo metni için bulanık eşleştirme ----------
  /** Damerau-Levenshtein (bitişik iki harfin yer değiştirmesi tek hata sayılır). */
  const lev = (a, b) => {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[m][n];
  };
  /** Kelime, anahtar kelimeye yeterince yakın mı? Kısa kelimelerde birebir, 5-7 harflide 1 hata, 8+ harflide 2 hata payı (belge sözcükleriyle karışmasın: "anapara" ≠ "enpara"). */
  const near = (tok, key) => { if (key.length <= 4) return tok === key; return lev(tok, key) <= (key.length >= 8 ? 2 : 1); };  const FUZZY_KEYS = [['Garanti BBVA', ['garanti', 'bbva']], ['Akbank', ['akbank']], ['Ziraat Bankası', ['ziraat']], ['VakıfBank', ['vakifbank']], ['Halkbank', ['halkbank']],
    ['QNB Türkiye', ['qnb', 'finansbank']], ['DenizBank', ['denizbank']], ['Enpara Bank', ['enpara']], ['Şekerbank', ['sekerbank']], ['HSBC', ['hsbc']], ['TEB (Türk Ekonomi Bankası)', ['teb']]];
  /** OCR'ın bozduğu logo yazılarında ("TURKIYE Gi anası" gibi) banka adını tahmin eder. */
  function fuzzyBank(f) {
    const toks = f.split(/[^a-z0-9]+/).filter((x) => x.length >= 2);
    for (const [name, keys] of FUZZY_KEYS) if (keys.some((k) => toks.some((t) => near(t, k)))) return name;
    // "TÜRKİYE İŞ BANKASI": "turkiye" + en çok 3 harfli kısa bir sözcük (İŞ'in bozuk hali) + "bankası"ya benzer sözcük
    const all = f.split(/[^a-z0-9]+/).filter(Boolean);      // tek harfli bozuk okumalar da sayılır (İŞ -> "e")
    for (let i = 0; i < all.length; i++) {
      if (!near(all[i], 'turkiye')) continue;
      const nx = all.slice(i + 1, i + 4); if (!nx.length) continue;
      const kisa = nx[0].length <= 3, banka = nx.some((t) => t.length >= 4 && (lev(t, 'bankasi') <= 3 || /asi$|ası$|anas|nkas/.test(t)));
      if (kisa && (banka || nx.length === 1)) return 'Türkiye İş Bankası';
    }
    return '';
  }

  // ---------- Taksit satırları ----------
  /** Tablo biçimi (PDF ödeme planı): bir satırda tarih + en az 3 tutar. Aynı satırda ikinci tarih ya da "Ödendi" varsa ödenmiştir. */
  function tableRows(lines) {
    const raw = [];
    lines.forEach((line, idx) => {
      const ds = datesIn(line); if (!ds.length) return;
      const am = amountsIn(line); if (am.length < 3) return;
      raw.push({ idx, ds, am, f: fold(line), no: (/^\s*(\d{1,3})\s+\d{2}\.\d{2}\.20\d{2}/.exec(line) || [])[1] });
    });
    if (!raw.length) return [];
    // Bankalara göre sütun sırası değişir (İş/Garanti: taksit tarihten sonraki ilk tutar; Enpara: önce "Kalan anapara", sonra "Taksit tutarı").
    // Başlık satırlarındaki sütun adlarının sırasından "Taksit tutarı" sütununun kaçıncı tutar olduğu bulunur.
    const VOC = new Set(['sira', 'no', 'taksit', 'tarih', 'tarihi', 'tutari', 'kalan', 'anapara', 'faiz', 'kkdf', 'bsmv', 'fon', 'vergi', 'odeme', 'detayi', 'sirasi', 'ana', 'para', 'tl']);
    const isHeaderLine = (l) => { if (/\d/.test(l)) return false; const w = fold(l).split(/[^a-z]+/).filter(Boolean); return w.length > 0 && w.filter((x) => VOC.has(x)).length / w.length >= 0.7; };
    const headLines = []; for (let i = raw[0].idx - 1; i >= 0 && headLines.length < 6 && isHeaderLine(lines[i]); i--) headLines.unshift(lines[i]);
    const head = fold(headLines.join(' '));
    const seq = []; const re = /kalan\s*anapara|taksit\s*tutari|anapara|faiz|kkdf|bsmv|fon\b|vergi|odeme\s*tutari/g; let m;
    while ((m = re.exec(head))) seq.push(m[0]);
    const col = Math.max(0, seq.findIndex((x) => /taksit\s*tutari/.test(x)));
    return raw.map((x) => ({ date: x.ds[0], amt: x.am[col] != null ? x.am[col] : x.am[0], paid: /\bodendi\b/.test(x.f) || x.ds.length >= 2, no: x.no ? +x.no : 0 }));
  }
  /** Etiketli biçim (mobil uygulama): "Taksit Vadesi/Tarihi", "Ödeme Tarihi", "Taksit Tutarı", "Durum" satırları. */
  function labelRows(lines) {
    const rows = []; let cur = null;
    for (const line of lines) {
      const f = fold(line);
      if (/taksit\s*(vadesi|tarihi)/.test(f)) { if (cur) rows.push(cur); cur = { date: datesIn(line)[0] || '', amt: null, paid: false }; continue; }
      if (!cur) continue;
      if (/odeme\s*tarihi/.test(f)) cur.paid = datesIn(line).length > 0;
      else if (/taksit\s*tutari/.test(f)) { const a = amountsIn(line); if (a.length) cur.amt = a[0]; }
      else if (/durum/.test(f)) cur.paid = /\bodendi\b/.test(f);
    }
    if (cur) rows.push(cur);
    return rows.filter((r) => r.date);
  }

  // ---------- Ana ayrıştırıcı ----------
  function parseOne(text, opt) {
    opt = opt || {};
    const now = opt.now || new Date();
    // OCR bazen binlik ayracı yerine boşluk okur ("213 428.74"); tablo satırı olmayan satırlarda birleştir.
    const fixSpaced = (l) => (datesIn(l).length || amountsIn(l).length >= 4 ? l : l.replace(/(\d{1,3})[  ](\d{3}[.,]\d{2})(?!\d)/g, '$1$2'));
    const lines = String(text || '').split(/\r?\n/).map((l) => repairLine(fixSpaced(l.trim()))).filter(Boolean);
    const f = fold(lines.join('\n'));
    const r = { kind: 'bilinmiyor', banka: '', tur: '', notes: [], bulunan: [], borclar: [] };
    if (f.length < 15) { r.notes.push('Dosyadan okunabilir bir metin çıkmadı.'); return r; }

    r.banka = detectBank(f, opt.bankalar);
    // Faiz: OCR "%" işaretini rakam okuyabilir; ondalıklı ve makul (≤ 20) değer aranır, dipnottaki "aylık 2,99" önceliklidir.
    const FAIZ = '\\d{1,3}[.,]\\d{1,4}';
    const faizOk = (x) => { if (x == null) return NaN; let t = String(x), v = parseFloat(t.replace(',', '.')); while (v > 20 && t.length > 4) { t = t.slice(1); v = parseFloat(t.replace(',', '.')); } return v > 0 && v <= 20 ? v : NaN; };
    const fz = [grab(f, 'faiz\\s+orani\\s+aylik', FAIZ), grab(f, 'akdi\\s+faiz\\s+orani|aylik\\s+faiz\\s+orani|faiz\\s+orani', FAIZ)].map(faizOk).find((v) => !Number.isNaN(v));
    if (fz != null) r.faiz = fz;
    if (/konut\s+kredi/.test(f)) r.tur = 'Konut Kredisi'; else if (/tasit\s+kredi/.test(f)) r.tur = 'Taşıt Kredisi';

    // 1) Etiketli değerler (başlık / özet kutuları)
    const rowStart = f.search(/(?:^|\n)\s*1\s*\.?\s*taksit\b/), headF = rowStart > 0 ? f.slice(0, rowStart) : f;   // satırlardan önceki özet bölümü: ilk taksit yalnızca faiz olabilir, düzenli taksit özette yazar
    const aylikHead = new RegExp('taksit\\s+tutari[^\\d]{0,40}(' + AMT_SRC + ')', 'i').exec(headF);
    const aylikL = (aylikHead && aylikHead[1]) || grab(f, 'taksit\\s+tutari', AMT_SRC);
    const kalanL = grab(f, 'kalan\\s+taksit\\s+sayisi', '\\d{1,3}\\b');
    const toplamN = grab(f, 'toplam\\s+taksit(?:\\s+sayisi)?|(?<!kalan\\s)(?<!odenen\\s)(?<!toplam\\s)taksit\\s+sayisi', '\\d{1,3}\\b'); if (toplamN) r.toplam = +toplamN;
    const odenenL = grab(f, 'odenen\\s+taksit(?:\\s+sayisi)?', '\\d{1,3}\\b'); if (odenenL) { r.odenen = +odenenL; r.odenenSrc = 'etiket'; }
    const ana = grab(f, 'toplam\\s+anapara|kredi\\s+tutari|cekilen\\s+tutar', AMT_SRC) || grab(f, '(?<!geri\\s+odenecek\\s)toplam\\s+tutar', AMT_SRC);
    if (ana) r.ana = toNum(ana);
    const borc = grab(f, 'kalan\\s+toplam\\s+borc|kalan\\s+taksitler\\s+toplami|kalan\\s+kredi\\s+borc(?:u)?|kalan\\s+borc(?:u)?', AMT_SRC); if (borc) r.kalanBorc = toNum(borc);

    // 2) Taksit tablosu / satırları
    let rows = tableRows(lines);
    const fromTable = rows.length >= 2;
    const anchors = fromTable ? rows.filter((x) => x.no > 0).map((x) => ({ no: x.no, date: x.date })) : [];
    if (rows.length < 2) rows = labelRows(lines);
    const startsAtOne = /(?:^|\n)\s*1\s*\.?\s*taksit\b|(?:^|\n)\s*1\s+taksit\s*(?:vadesi|tarihi)/.test(f);
    { const lp = rows.map((x) => x.paid).lastIndexOf(true); if (lp > 0) rows.forEach((x, i) => { if (i < lp) x.paid = true; }); }
    if (rows.length >= 2) {
      const unpaid = rows.filter((x) => !x.paid), paid = rows.length - unpaid.length;
      let kalan = unpaid.length;
      // Liste baştan başlıyor, ödenenler başta toplanmış ve toplam taksit biliniyorsa (ekran kesik olabilir): kalan = toplam - ödenen
      if (r.toplam != null && startsAtOne && rows.length <= r.toplam && !rows.slice(paid).some((x) => x.paid)) kalan = r.toplam - paid;
      if (kalan >= 1) {
        r.kalan = kalan;
        if (unpaid.length) { r.sonraki = unpaid[0].date; r.aylik = modeAmount(unpaid.map((x) => x.amt).filter((x) => x > 0)) || undefined; }
        else r.sonraki = addMonth(rows[rows.length - 1].date);       // görünen hepsi ödenmiş, liste kesik: sıradaki bir sonraki ay
      } else if (r.toplam == null || rows.length < r.toplam) {         // görünen satırların hepsi ödenmiş ama liste kesik
        const son = rows[rows.length - 1]; r.sonraki = addMonth(son.date); r.kesik = true; if (son.amt > 0) r.aylik = son.amt;   // ilk satır yalnızca faiz olabilir; son satır tipik taksit
        r.notes.push('Ekranda yalnızca ödenmiş taksitler görünüyor; kalan taksit sayısını siz girin.');
      } else r.notes.push('Tüm taksitler ödenmiş görünüyor.');
    }
    if (anchors.length) r.anchors = anchors;
    if (r.kalan == null && kalanL) r.kalan = +kalanL;
    if (r.aylik == null && aylikL) r.aylik = toNum(aylikL);
    if (aylikL && fromTable && r.aylik) { const hv = toNum(aylikL); if (hv > 0 && Math.abs(r.aylik - hv) / hv > 0.01) r.aylik = hv; }
    if (r.aylik == null && !aylikL) { const lz = grabLoose(f, 'taksit\\s+tutari'); if (lz) { r.aylik = lz.v; if (lz.yaklasik) r.yaklasik = true; } }
    const nm = /taksit\s*(\d{1,3})\s*\/\s*(\d{1,3})/.exec(f);        // "Taksit 2/3": 2. taksit sırada
    if (nm && r.kalan == null) { const cur = +nm[1], tot = +nm[2]; if (cur >= 1 && cur <= tot) { r.kalan = tot - cur + 1; r.toplam = tot; r.odenen = cur - 1; r.odenenSrc = 'taksit-no'; } }
    if (!r.sonraki) r.sonraki = firstDateAfter(f, 'son\\s+odeme(?:\\s+tarihi)?|ilk\\s+taksit\\s+tarihi|taksit\\s+tarihi|taksit\\s+vadesi|vade\\s+tarihi', now) || undefined;
    // Ödenen taksit okunamadıysa: kalan borç, toplam taksit ve "TOPLAM" (tüm taksitlerin toplamı) satırından tahmin edilir.
    // Kalan borç = kalan taksit × taksit olmalı ve ilk taksit (faiz günü farkı) taksitten çok farklı olmamalı; tek çözüm varsa kullanılır.
    if (r.kalan == null && r.odenen == null && r.toplam >= 2 && r.kalanBorc > 0) {
      const tl = lines.find((l) => /^\s*toplam\b[\s:]*\d/.test(fold(l)) && amountsIn(l).length >= 3);
      const T = tl ? amountsIn(tl)[0] : 0, N = r.toplam, cents = Math.round(r.kalanBorc * 100), cand = [];
      if (T > 0) {
        if (Math.abs(T - r.kalanBorc) < 0.02) cand.push({ o: 0, p: r.kalanBorc / N });
        for (let o = 1; o < N; o++) { const k = N - o; if (cents % k) continue; const pp = cents / k / 100, F = T - (N - 1) * pp; if (F > 0.5 * pp && F < 2 * pp) cand.push({ o, p: pp }); }
      }
      if (cand.length === 1) { r.odenen = cand[0].o; r.odenenSrc = 'tahmin'; r.kalan = N - cand[0].o; if (r.aylik == null) r.aylik = Math.round(cand[0].p * 100) / 100; r.notes.push('Ödenen taksit sayısı tutarlardan tahmin edildi; lütfen kontrol edin.'); }
    }
    // Tablo okunamadıysa (küçük yazı) başlıktaki özetten türet: kalan = toplam - ödenen, taksit = kalan borç / kalan taksit
    if (r.kalan == null && r.toplam != null && r.odenen != null && r.toplam > r.odenen) r.kalan = r.toplam - r.odenen;
    if (r.aylik == null && r.kalanBorc > 0 && r.kalan >= 1) { r.aylik = Math.round(r.kalanBorc / r.kalan * 100) / 100; r.notes.push('Aylık taksit, kalan toplam borç ÷ kalan taksit olarak hesaplandı.'); }
    if ((r.kalan >= 1 && (r.aylik > 0 || r.sonraki || r.ana)) || (r.kesik && r.aylik > 0) || (r.toplam >= 1 && r.ana > 0 && r.kalanBorc > 0)) r.kind = 'kredi';
    r.bugun = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if ((f.match(/kalan\s*taksit\s*sayisi/g) || []).length > 1 || (f.match(/taksit\s*\d{1,3}\s*\/\s*\d{1,3}/g) || []).length > 1)
      r.notes.push('Ekranda birden fazla borç var; ilki okundu. Diğerleri için dosyayı ayrı ayrı ekleyin.');
    if (r.toplam != null && r.kalan != null && r.toplam < r.kalan) delete r.toplam;
    if (r.toplam != null && r.odenen == null && r.kalan != null) r.odenen = r.toplam - r.kalan;
    if (r.toplam == null && startsAtOne && rows.length >= 2 && r.kalanBorc > 0) {      // eksiksiz liste: ödenmemiş satırların toplamı "Kalan taksitler toplamı" ile aynıysa satır sayısı toplam taksittir
      const un = rows.filter((x) => !x.paid), top = Math.round(un.reduce((t, x) => t + (x.amt || 0) * 100, 0)) / 100;
      if (un.length && Math.abs(top - r.kalanBorc) < 0.05) { r.toplam = rows.length; r.odenen = rows.length - un.length; r.odenenSrc = r.odenenSrc || 'liste'; }
    }

    // 3) Kart / KMH
    if (r.kind !== 'kredi') {
      // Borç tutarı adayları (öncelik sırasıyla); kullanıcı hangisini kullanacağını seçer
      [['Kalan ekstre borcu', 'kalan\\s+ekstre\\s+(?:tl\\s+)?borcu'], ['Ekstre borcu', '(?<!kalan\\s+)(?:son\\s+)?ekstre\\s+(?:tl\\s+)?borcu'], ['Güncel borç', 'guncel\\s+borc'],
        ['Avans hesap borcu', 'avans\\s+hesap\\s+borcu'], ['Toplam borç', '(?<!kalan\\s+)toplam\\s+borc'], ['Anapara borcu', 'anapara\\s+borcu'],
        ['Bu döneme yansıyacak taksitler', 'bu\\s+doneme\\s+yansiyacak\\s+taksitler'], ['Gelecek dönem taksitleri', 'gelecek\\s+donem\\s+taksitleri']].forEach(([ad, src]) => {
        const v = grab(f, src, AMT_SRC); const t = v ? toNum(v) : 0; if (t > 0) r.borclar.push({ ad, tutar: t });
      });
      const lim = grab(f, 'toplam\\s+(?:kart\\s+)?limit(?:i)?|avans\\s+hesap\\s+limiti|ek\\s+hesap\\s+limit(?:i)?', AMT_SRC);
      const kesim = firstDateAfter(f, 'ekstre\\s+kesim\\s+tarihi|hesap\\s+kesim\\s+tarihi|kesim\\s+tarihi|kesim\\s+gunu', now);
      const son = firstDateAfter(f, 'son\\s+odeme\\s+tarihi|son\\s+odeme\\s+gunu', now);
      const kul = lim ? null : grab(f, '(?<!ek\\s+hesap\\s)kullanilabilir\\s+limit(?:i)?', AMT_SRC);     // yalnızca kullanılabilir limit yazan ekranlar
      if (lim || kul || kesim || son || r.borclar.length) {
        r.kind = 'kart';
        if (lim) r.limit = toNum(lim);
        else if (kul) {
          const kv = toNum(kul), eb = r.borclar.find((b) => b.ad === 'Kalan ekstre borcu' || b.ad === 'Ekstre borcu');
          r.limit = Math.round((kv + (eb ? eb.tutar : 0)) * 100) / 100; r.limitTahmin = true;
          r.notes.push('Ekranda toplam limit yok, yalnızca kullanılabilir limit (' + kv.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺) var; toplam limit' + (eb ? ' kullanılabilir limit + ekstre borcu' : '') + ' olarak tahmin edildi. Lütfen gerçek limitinizi kontrol edin.');
        }
        if (kesim) r.kesim = +kesim.slice(8);
        if (son) r.son = +son.slice(8);
        if (/henuz\s+kesilmemistir/.test(f) && r.borclar.some((b) => b.ad === 'Ekstre borcu')) r.notes.push('Yeni ekstre henüz kesilmemiş; görünen "Son ekstre borcu" bir önceki dönemindir. Ödediyseniz bu borcu eklemeyin.');
        if (/avans\s*hesap\s*taksitli\s*avans\s*hesap/.test(f)) r.notes.push('Ekranda "Taksitli Avans Hesap" sekmesi de var; oradaki planlar için o sekmenin ekran görüntüsünü ayrıca ekleyin.');
      }
    }

    return summarize(r);
  }

  /** Okunanların kullanıcıya gösterilecek özeti ve eksik alanlar (birleştirmeden sonra da çağrılır). */
  function summarize(r) {
    r.bulunan = []; r.eksik = undefined;
    // Toplam taksit ve ödenen taksit biliniyorsa kalan taksit kesindir; satır numaraları (sıra no) varsa sıradaki taksit tarihi de bulunur (eksik okunan satırlara karşı).
    if (r.kind === 'kredi' && r.toplam >= 2 && r.odenenSrc && r.odenen != null && r.odenen >= 0 && r.odenen < r.toplam) {
      r.kalan = r.toplam - r.odenen;
      if (r.anchors && r.anchors.length) {
        const cnt = {}; r.anchors.forEach((a) => { if (a.no <= r.toplam) { const c = addMonths(a.date, r.odenen + 1 - a.no); cnt[c] = (cnt[c] || 0) + 1; } });
        const best = Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x])[0]; if (best) r.sonraki = best;
      }
    }
    r.notes = (r.notes || []).filter((n) => !/kuruş kısmı|geçmişte görünüyor/.test(n));
    if (r.kind === 'kredi' && r.sonraki && r.bugun && r.sonraki < r.bugun) r.notes.push(`Sıradaki taksit tarihi geçmişte görünüyor (${r.sonraki.split('-').reverse().join('.')}); ödeme tarihi sütunu okunamamış olabilir, tarihi kontrol edin.`);
    if (r.yaklasik && r.aylik > 0) r.notes.push('Taksit tutarının kuruş kısmı okunamadı; lütfen kontrol edin.');
    if (r.kind === 'kredi') { r.eksik = []; if (!(r.aylik > 0)) r.eksik.push('Aylık taksit tutarı'); if (!(r.kalan >= 1)) r.eksik.push('Kalan taksit sayısı'); if (!r.sonraki) r.eksik.push('Sıradaki taksit tarihi'); }
    const para = (v) => Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
    const tr = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
    if (r.banka) r.bulunan.push(`Banka: ${r.banka}`);
    if (r.kind === 'kredi') {
      if (r.aylik > 0) r.bulunan.push(`Aylık taksit: ${para(r.aylik)}`);
      if (r.kalan >= 1) r.bulunan.push(`Kalan taksit: ${r.kalan}`);
      if (r.sonraki) r.bulunan.push(`Sıradaki taksit: ${tr(r.sonraki)}`);
      if (r.toplam) r.bulunan.push(`Toplam taksit: ${r.toplam}`);
      if (r.ana) r.bulunan.push(`Çekilen tutar: ${para(r.ana)}`);
    } else if (r.kind === 'kart') {
      if (r.limit) r.bulunan.push(`${r.limitTahmin ? 'Tahmini toplam limit' : 'Toplam limit'}: ${para(r.limit)}`);
      if (r.kesim) r.bulunan.push(`Kesim günü: ${r.kesim}`);
      if (r.son) r.bulunan.push(`Son ödeme günü: ${r.son}`);
      r.borclar.forEach((b) => r.bulunan.push(`${b.ad}: ${para(b.tutar)}`));
    }
    if (r.faiz != null && r.kind !== 'bilinmiyor') r.bulunan.push(`Aylık faiz: %${String(r.faiz).replace('.', ',')}`);
    if (r.kind === 'bilinmiyor' && !r.notes.length) r.notes.push('Taksit, limit ya da tarih bilgisi bulunamadı.');
    return r;
  }

  const BORC_SIRA = ['Kalan ekstre borcu', 'Ekstre borcu', 'Güncel borç', 'Avans hesap borcu', 'Toplam borç', 'Anapara borcu', 'Bu döneme yansıyacak taksitler', 'Gelecek dönem taksitleri'];
  const BIRLESTIR = ['banka', 'tur', 'aylik', 'kalan', 'toplam', 'odenen', 'sonraki', 'faiz', 'ana', 'kalanBorc', 'limit', 'kesim', 'son'];
  /** Aynı görüntünün farklı ölçeklerdeki okumalarını birleştirir: bozuk okunan tutar boş kaldığı için eksikler diğer okumadan tamamlanır. */
  function mergeResults(rs) {
    const score = (r) => (r.kind !== 'bilinmiyor' ? 100 : 0) + r.bulunan.length;
    const sorted = rs.map((r, i) => ({ r, i })).sort((x, y) => score(y.r) - score(x.r) || x.i - y.i).map((x) => x.r);
    const m = Object.assign({}, sorted[0]); m.notes = []; m.borclar = [];
    sorted.forEach((r) => {
      if (r.kind !== m.kind && r.kind !== 'bilinmiyor' && m.kind !== 'bilinmiyor') return;   // farklı türde okuma karışmasın
      if (m.yaklasik && r.aylik > 0 && !r.yaklasik) { m.aylik = r.aylik; m.yaklasik = false; }
      BIRLESTIR.forEach((k) => { if ((m[k] == null || m[k] === '' || m[k] === 0) && r[k] != null && r[k] !== '') m[k] = r[k]; });
      r.borclar.forEach((x) => { if (!m.borclar.some((y) => y.ad === x.ad)) m.borclar.push(x); });
      r.notes.forEach((n) => { if (!m.notes.includes(n)) m.notes.push(n); });
    });
    m.borclar.sort((x, y) => BORC_SIRA.indexOf(x.ad) - BORC_SIRA.indexOf(y.ad));
    if (m.kind !== 'bilinmiyor') m.notes = m.notes.filter((n) => !/bulunamadı|metin çıkmadı/.test(n));   // başarılı okumada diğer geçişlerin "bulunamadı" notu anlamsız
    return summarize(m);
  }
  /** Metin tek okuma ya da "\f" ile ayrılmış birden çok okuma (aynı dosyanın farklı ölçekleri) olabilir. */
  function parse(text, opt) {
    const passes = String(text || '').split('\f').filter((x) => x.trim());
    if (passes.length <= 1) return parseOne(passes[0] || '', opt);
    return mergeResults(passes.map((x) => parseOne(x, opt)));
  }

  // ---------- Çok kayıtlı ekranlar ----------
  // Bir ekran görüntüsünde birden çok borç (iki Artı Para kartı, kart + KMH...) olabilir: ürün başlıklarına göre bölümlenir,
  // taksit kartları "Taksit 2/3" / "Kalan taksit sayısı" işaretlerinden ayrılır, her biri ayrı kayıt olarak döner.
  const KMH_RE = /avans\s*hesap|\bkmh\b|eksi\s*hesap|kredili\s*mevduat|ek\s*hesap\s*(?:limit|bilgi|anapara|toplam|kullanilabilir)/;
  const KART_RE = /kredi\s*kart|kart\s*detay|kart\s*bilgi|\bekstre\b|kart\s*limit/;
  const KREDI_RE = /arti\s*para|ek\s*hesap|odeme\s*plani|kredi\s*(?:numarasi|hesabi|tutari)|taksit\s*(?:tutari|vadesi|tarihi)|kalan\s*taksit|toplam\s*taksit/;
  const classifyLine = (line) => { const f = fold(line); return KMH_RE.test(f) ? 'KMH' : KART_RE.test(f) ? 'KART' : KREDI_RE.test(f) ? 'KREDI' : ''; };
  function sectionsOf(lines) {
    const out = []; let cur = null;
    for (const line of lines) {
      const k = classifyLine(line);
      if (k && (!cur || cur.kind !== k)) {
        if (cur && !cur.kind) { cur.kind = k; } else { cur = { kind: k, lines: [] }; out.push(cur); }
      }
      if (!cur) { cur = { kind: '', lines: [] }; out.push(cur); }
      cur.lines.push(line);
    }
    return out;
  }
  const BLOCK_END_RE = /taksit\s*\d{1,3}\s*\/\s*\d{1,3}|kalan\s*taksit\s*sayisi/;
  function loanBlocks(lines) {
    const blocks = []; let cur = [];
    for (let i = 0; i < lines.length; i++) {
      cur.push(lines[i]);
      if (BLOCK_END_RE.test(fold(lines[i]))) {
        if (i + 1 < lines.length && /^\s*\d{1,3}\s*$/.test(lines[i + 1]) && !/\d/.test(lines[i].replace(/.*sayisi/i, ''))) { cur.push(lines[++i]); }
        while (i + 1 < lines.length && /sonraki\s*taksit|taksit\s*(?:vadesi|tarihi)|vade\s*tarihi/.test(fold(lines[i + 1])) && !BLOCK_END_RE.test(fold(lines[i + 1]))) cur.push(lines[++i]);
        blocks.push(cur); cur = [];
      }
    }
    if (cur.length) { if (blocks.length) blocks[blocks.length - 1] = blocks[blocks.length - 1].concat(cur); else blocks.push(cur); }
    return blocks.length >= 2 ? blocks : [lines];
  }
  const titleTr = (s) => s.toLocaleLowerCase('tr').replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('tr'));
  /** Kart başlığı: ilk satırlardaki rakamsız, kart/marka sözcüğü içeren satır ("MAXIMUM KART VISA", "BONUS PLATINUM TRINK") + maskeli numaranın son 4 hanesi. */
  function cardTitle(lines) {
    const head = lines.slice(0, 8);
    const t = head.find((l) => { const f = fold(l); return !/\d/.test(l) && l.length >= 6 && l.length <= 40 && /kart|card|bonus|maximum|maximiles|world|axess|wings|bankkart|paraf|platinum|trink/.test(f) && !/limit|detay|ekstre|kullan|odeme|borc|bilgi|ozellig|yapabilirsiniz/.test(f); });
    if (!t) return '';
    const m = /(\d{4})\s*\*{4}\s*\*{4}\s*(\d{4})/.exec(lines.join('\n'));
    const brand = t.replace(/\s+/g, ' ').trim().replace(/İ/g, 'i').toLowerCase().replace(/(^|\s)(\p{L})/gu, (x, a, b) => a + b.toLocaleUpperCase('en'));   // marka adı: büyük I -> i (Türkçe kuralı ı yapar)
    return brand + (m ? ` (…${m[2]})` : '');
  }
  /** Ek hesap taksit planlarında hesap numarası ("2208 - 1005094") ada eklenir: aynı şubedeki birden çok ek hesap karışmasın. */
  function refineName(r, lines) {
    if (r.urun === 'KMH' && r.taksitli) {
      const txt = fold(lines.join(' ')), no = /(\d{4})\s*-\s*(\d{6,8})/.exec(lines.join('\n'));
      const generic = !r.ad || r.ad === 'Kredi' || /^taksitli\s*ek\s*hesap$/i.test(fold(r.ad));
      if (generic && (/ek\s*hesap/.test(txt) || no || /sube\s*kodu/.test(txt))) r.ad = 'Taksitli Ek Hesap';
      if (no && /^taksitli ek hesap$/i.test(r.ad)) r.ad += ` ${no[1]}-${no[2]}`;
    }
    return r;
  }
  function itemName(urun, lines) {
    if (urun === 'KART') return cardTitle(lines) || 'Kredi kartı';
    if (urun === 'KMH') return 'KMH (eksi hesap)';
    for (const l of lines) {
      const f = fold(l);
      if (/arti\s*para|ek\s*hesap|ihtiyac|tasit|konut/.test(f) && !/odeme\s*plani|numarasi|tutari|kullan/.test(f)) {
        const c = l.replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
        if (c.length >= 4 && c.length <= 40) return titleTr(c);
      }
    }
    return 'Kredi';
  }
  const KMH_TAKSIT_RE = /arti\s*para|ek\s*hesap|taksitli\s*(?:avans|kmh)/;
  /** Taksit bilgisi okunmuş bir kaydın aslında eksi hesap (KMH) taksit planı olup olmadığını anlar (Artı Para, Taksitli Ek Hesap, Taksitli Avans). */
  const asKmhTaksit = (r, textLines) => { if (r.kind === 'kredi' && KMH_TAKSIT_RE.test(fold(textLines.join(' ')))) { r.urun = 'KMH'; r.taksitli = true; } return r; };
  function parseItems(text, opt) {
    const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const whole = parseOne(text, opt), items = [];
    sectionsOf(lines).forEach((sec) => {
      if (sec.kind === 'KREDI') {
        loanBlocks(sec.lines).forEach((b) => { const r = parseOne(b.join('\n'), opt); if (r.kind === 'kredi') items.push(refineName(asKmhTaksit(Object.assign(r, { urun: 'KREDI', ad: itemName('KREDI', b) }), b.concat(sec.lines.slice(0, 4))), b)); });
      } else if (sec.kind === 'KART' || sec.kind === 'KMH') {
        const r = parseOne(sec.lines.join('\n'), opt);
        if (r.kind === 'kart') items.push(Object.assign(r, { urun: sec.kind, ad: itemName(sec.kind, sec.lines) }));
        else if (r.kind === 'kredi' && sec.kind === 'KMH') items.push(Object.assign(r, { urun: 'KMH', taksitli: true, ad: itemName('KREDI', sec.lines) }));
      }
    });
    if (!items.length && whole.kind !== 'bilinmiyor') {
      const f = fold(lines.join('\n'));
      if (whole.kind === 'kredi') items.push(refineName(asKmhTaksit(Object.assign(whole, { urun: 'KREDI', ad: itemName('KREDI', lines) }), lines), lines));
      else { const u = KMH_RE.test(f) ? 'KMH' : 'KART'; items.push(Object.assign(whole, { urun: u, ad: itemName(u, lines), belirsiz: !KMH_RE.test(f) && !KART_RE.test(f) })); }
    }
    items.forEach((it) => { if (!it.banka && whole.banka) { it.banka = whole.banka; summarize(it); } });
    return { items, whole };
  }
  function mergeInto(m, r) {
    if (r.odenenSrc && !m.odenenSrc && r.odenen != null) { m.odenen = r.odenen; m.odenenSrc = r.odenenSrc; }   // başlıktan okunan/tahmin edilen ödenen taksit, satırlardan hesaplananın önüne geçer
    if (m.yaklasik && r.aylik > 0 && !r.yaklasik) { m.aylik = r.aylik; m.yaklasik = false; }
    BIRLESTIR.forEach((k) => { if ((m[k] == null || m[k] === '' || m[k] === 0) && r[k] != null && r[k] !== '') m[k] = r[k]; });
    if (r.anchors) { m.anchors = (m.anchors || []).slice(); r.anchors.forEach((a) => { if (!m.anchors.some((y) => y.no === a.no && y.date === a.date)) m.anchors.push(a); }); }
    r.borclar.forEach((x) => { if (!m.borclar.some((y) => y.ad === x.ad)) m.borclar.push(x); });
    r.notes.forEach((n) => { if (!m.notes.includes(n)) m.notes.push(n); });
    m.borclar.sort((x, y) => BORC_SIRA.indexOf(x.ad) - BORC_SIRA.indexOf(y.ad));
  }
  /** Her belge kendi OCR geçişleriyle okunur, farklı belgelerin kayıtları ayrı kalır. */
  function parseAll(text, opt) {
    if (!Array.isArray(text)) return parseDocument(text, opt);
    const result = { items: [], notes: [] };
    for (const doc of text) {
      const { items, notes } = parseDocument(doc, opt);
      result.items.push(...items);
      result.notes.push(...notes);
    }
    return result;
  }

  function parseDocument(text, opt) {
    const passes = String(text || '').split('\f').filter((x) => x.trim());
    if (!passes.length) return { items: [], notes: ['Dosyadan okunabilir bir metin çıkmadı.'] };
    const per = passes.map((p) => parseItems(p, opt));
    const order = per.map((x, i) => ({ x, i, n: x.items.length, sc: x.items.reduce((a, r) => a + r.bulunan.length, 0) })).sort((a, b) => b.n - a.n || b.sc - a.sc || a.i - b.i);
    const items = order[0].x.items.map((it) => Object.assign({}, it, { notes: it.notes.slice(), borclar: it.borclar.slice() }));
    items.forEach((it, j) => {
      const ord = items.slice(0, j).filter((y) => y.urun === it.urun).length;
      order.slice(1).forEach(({ x }) => { const o = x.items.filter((y) => y.urun === it.urun)[ord]; if (o) mergeInto(it, o); });
      if (it.kind !== 'bilinmiyor') it.notes = it.notes.filter((n) => !/bulunamadı|metin çıkmadı/.test(n));
      summarize(it);
    });
    const notes = items.length ? [] : (order[0].x.whole.notes || []);
    return { items, notes };
  }

  // ---------- Tarayıcı: dosyadan metin ----------
  const MAX_BYTES = 20 * 1024 * 1024, MAX_FILES = 6;
  const loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    return (loaded[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Okuma bileşeni yüklenemedi: ' + src));
      document.head.appendChild(s);
    }));
  }
  const abs = (p) => new URL(p, document.baseURI).href;
  let worker = null;
  async function getWorker(onStatus) {
    if (worker) return worker;
    await loadScript('vendor/ocr/tesseract.min.js');
    worker = await self.Tesseract.createWorker('tur', 1, {
      workerPath: abs('vendor/ocr/worker.min.js'), corePath: abs('vendor/ocr/'), langPath: abs('vendor/ocr/'),
      gzip: false, workerBlobURL: false, cacheMethod: 'none',
      logger: (m) => { if (m && m.status === 'recognizing text' && onStatus) onStatus(`Yazı okunuyor… %${Math.round((m.progress || 0) * 100)}`); },
    });
    return worker;
  }
  async function endWorker() { if (worker) { try { await worker.terminate(); } catch (e) { /* yok say */ } worker = null; } }

  /** OCR için görüntü hazırlama.
      'global': tüm görüntü gri tonlama; koyu zeminli (telefon koyu tema) ekranlarda ters çevirir.
      'tile'  : bölge bazlı kontrast germe ve kutupluluk — açık renkli/ince yazılı tablolar, karışık (koyu çerçeve + beyaz sayfa) görüntüler için. */
  function prepCanvas(src, w, h, scale, mode, crop) {
    const cw = crop ? crop[2] : w, chh = crop ? crop[3] : h;
    const c = document.createElement('canvas'); c.width = Math.round(cw * scale); c.height = Math.round(chh * scale);
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingQuality = 'high';
    if (crop) g.drawImage(src, crop[0], crop[1], crop[2], crop[3], 0, 0, c.width, c.height); else g.drawImage(src, 0, 0, c.width, c.height);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data, W = c.width, H = c.height;
    const lum = new Uint8ClampedArray(W * H);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) lum[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (mode === 'tile') {
      const T = Math.max(32, Math.round(36 * scale));
      for (let ty = 0; ty < H; ty += T) {
        for (let tx = 0; tx < W; tx += T) {
          const x1 = Math.min(W, tx + T), y1 = Math.min(H, ty + T), hist = new Uint32Array(256); let n = 0;
          for (let y = ty; y < y1; y++) for (let x = tx; x < x1; x++) { hist[lum[y * W + x]]++; n++; }
          const pct = (q) => { let acc = 0; const t = n * q; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= t) return v; } return 255; };
          const lo0 = pct(0.02), hi0 = pct(0.98), med = pct(0.5);
          if (hi0 - lo0 < 28) { for (let y = ty; y < y1; y++) for (let x = tx; x < x1; x++) lum[y * W + x] = 255; continue; }   // düz alan: boş say
          const inv = med < 110;
          const lo = inv ? 255 - hi0 : lo0, hi = inv ? 255 - lo0 : hi0;
          for (let y = ty; y < y1; y++) for (let x = tx; x < x1; x++) {
            let v = lum[y * W + x]; if (inv) v = 255 - v;
            let t = (v - lo) / (hi - lo); t = t < 0 ? 0 : t > 1 ? 1 : t;
            lum[y * W + x] = Math.pow(t, 1.4) * 255;
          }
        }
      }
    } else {
      let sum = 0, cnt = 0; for (let i = 0; i < lum.length; i += 4) { sum += lum[i]; cnt++; }
      if (sum / cnt < 110) for (let i = 0; i < lum.length; i++) lum[i] = 255 - lum[i];
    }
    for (let i = 0, j = 0; i < d.length; i += 4, j++) { d[i] = d[i + 1] = d[i + 2] = lum[j]; }
    g.putImageData(img, 0, 0);
    return c;
  }
  async function ocrSource(src, w, h, onStatus, scale, mode) {
    const c = prepCanvas(src, w, h, scale, mode || 'global');
    const wk = await getWorker(onStatus);
    const { data } = await wk.recognize(c);
    return data.text || '';
  }
  /** Logo/başlık bölgesinden banka adı: görüntünün üst %40'ı, logo yazıları küçük ve stilize olduğundan 4-5 kat büyütülüp seyrek-metin kipiyle de okunur. */
  async function logoBank(src, w, h, onStatus) {
    const sc = Math.min(5, Math.max(1.2, 3300 / w)), crop = [0, 0, w, Math.round(h * 0.4)];
    const passes = [[sc, 'tile', '11'], [sc * 0.7, 'global', '3'], [sc * 1.25, 'tile', '3']];
    const wk = await getWorker(onStatus); let found = '';
    try {
      for (const [k, mode, psm] of passes) {
        const c = prepCanvas(src, w, h, k, mode, crop);
        await wk.setParameters({ tessedit_pageseg_mode: psm });
        const { data } = await wk.recognize(c);
        const ft = fold(data.text || ''), nm = detectBank(ft, null) || fuzzyBank(ft);
        if (nm) { found = nm; break; }
      }
    } finally { await wk.setParameters({ tessedit_pageseg_mode: '3' }); }
    return found;
  }
  /** Aynı görüntüyü farklı ölçek/ön işlemeyle birkaç kez okur (iri puntolu tutarlarda virgül, açık renkli tablolarda satırlar bazı ayarlarda kaybolur);
      sonuç bir metin dizisidir ve parse() bunları birleştirir. */
  async function imageTexts(file, onStatus) {
    const bmp = await createImageBitmap(file), out = [];
    const passes = bmp.width < 1400 ? [[2, 'tile'], [2, 'global'], [1, 'global'], [3, 'global']] : [[1, 'tile'], [0.6, 'global'], [1.5, 'tile']];
    try {
      for (let i = 0; i < passes.length; i++) out.push(await ocrSource(bmp, bmp.width, bmp.height, (m) => onStatus && onStatus(`${m} · ${i + 1}/${passes.length}`), passes[i][0], passes[i][1]));
      onStatus && onStatus('Logo okunuyor…');
      const nm = await logoBank(bmp, bmp.width, bmp.height, onStatus);
      out.logo = nm ? `Logo: ${nm}` : '';
    } finally { if (bmp.close) bmp.close(); }
    return out;
  }
  async function pdfText(file, onStatus) {
    await loadScript('vendor/pdfjs/pdf.min.js');
    const pdfjs = self.pdfjsLib; pdfjs.GlobalWorkerOptions.workerSrc = abs('vendor/pdfjs/pdf.worker.min.js');
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let all = '';
    for (let p = 1; p <= Math.min(doc.numPages, 10); p++) {
      onStatus && onStatus(`PDF okunuyor… sayfa ${p}/${Math.min(doc.numPages, 10)}`);
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const items = tc.items.filter((it) => it.str && it.str.trim()).map((it) => ({ s: it.str, x: it.transform[4], y: it.transform[5] }));
      items.sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = []; let cur = null;
      for (const it of items) { if (cur && Math.abs(cur.y - it.y) <= 3) cur.parts.push(it); else { cur = { y: it.y, parts: [it] }; lines.push(cur); } }
      let txt = lines.map((l) => l.parts.sort((a, b) => a.x - b.x).map((x) => x.s).join(' ')).join('\n');
      if (txt.replace(/\s/g, '').length < 20) {            // taranmış PDF: sayfayı resme çevirip OCR yap
        const vp = page.getViewport({ scale: 2 });
        const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
        await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
        txt = await ocrSource(cv, cv.width, cv.height, onStatus, 1);
      }
      all += txt + '\n';
    }
    if (!detectBank(fold(all), null)) {      // metinde banka adı yoksa ilk sayfanın üst bölgesindeki logoyu oku
      try {
        const page = await doc.getPage(1), vp = page.getViewport({ scale: 2 });
        const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
        await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
        onStatus && onStatus('Logo okunuyor…');
        const nm = await logoBank(cv, cv.width, cv.height, onStatus); if (nm) all += `Logo: ${nm}\n`;
      } catch (e) { /* logo okunamadı */ }
    }
    return all;
  }
  /** Dosyalardan metin çıkarır. onStatus(mesaj) ile ilerleme bildirir. */
  async function readFiles(files, onStatus, { separateDocuments = false } = {}) {
    const list = Array.from(files || []);
    if (!list.length) throw new Error('Dosya seçilmedi.');
    if (list.length > MAX_FILES) throw new Error(`En fazla ${MAX_FILES} dosya seçebilirsiniz.`);
    const texts = [];   // texts[i]: i. ölçekteki okumaların tüm dosyalar için birleşimi
    const documents = [];
    try {
      for (let i = 0; i < list.length; i++) {
        const fl = list[i], isPdf = fl.type === 'application/pdf' || /\.pdf$/i.test(fl.name);
        if (fl.size > MAX_BYTES) throw new Error(`"${fl.name}" çok büyük (en fazla 20 MB).`);
        if (!isPdf && !/^image\//.test(fl.type)) throw new Error(`"${fl.name}" desteklenmiyor. Resim ya da PDF seçin.`);
        const pre = list.length > 1 ? `(${i + 1}/${list.length}) ` : '';
        onStatus && onStatus(pre + 'Dosya okunuyor…');
        const res = isPdf ? [await pdfText(fl, (m) => onStatus && onStatus(pre + m))] : await imageTexts(fl, (m) => onStatus && onStatus(pre + m));
        const logo = res.logo ? `\n${res.logo}\n` : '\n';
        if (separateDocuments) {
          documents.push(res.map(pass => pass + logo).join('\f'));
          continue;
        }
        const n = Math.max(texts.length, res.length);
        for (let k = 0; k < n; k++) texts[k] = (texts[k] || '') + (res[k] ?? res[0]) + logo;
      }
    } finally { await endWorker(); }
    return separateDocuments ? documents : texts.join('\f');
  }

  return { parse, parseAll, readFiles, fold, detectBank, fuzzyBank };
}));
