/* Kese hesap çekirdeği: saf fonksiyonlar, arayüzden bağımsız (Node ile test edilir). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const AYLAR = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const MAX_AY = 600;

  // ---------- Tarih ve para yardımcıları ----------
  const pad = (n) => String(n).padStart(2, '0');
  const r2 = (x) => Math.round((Number(x) + Number.EPSILON) * 100) / 100;
  const sum = (arr, f) => arr.reduce((s, x) => s + Math.round((f ? f(x) : x) * 100), 0) / 100;
  const ymOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function ymAdd(ym, n) {
    const [y, m] = ym.split('-').map(Number);
    const t = y * 12 + (m - 1) + n;
    return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`;
  }
  function monthsBetween(a, b) {
    const [ya, ma] = a.split('-').map(Number);
    const [yb, mb] = b.split('-').map(Number);
    return (yb - ya) * 12 + (mb - ma);
  }
  function fmtYM(ym) {
    if (!ym) return '-';
    const [y, m] = ym.split('-').map(Number);
    return `${AYLAR[m]} ${y}`;
  }
  function shortYm(ym) { const [y, m] = ym.split('-').map(Number); return `${AYLAR[m].slice(0, 3)} ${String(y).slice(2)}`; }
  function fmtDate(iso) {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-').map(Number);
    return `${pad(d)} ${AYLAR[m]} ${y}`;
  }
  function fmtMoney(v) {
    return Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }
  function pc(v) { return Number(v || 0).toFixed(2).replace('.', ','); }
  function daysInMonth(ym) {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }
  function dueDate(ym, day) {
    return `${ym}-${pad(Math.min(day, daysInMonth(ym)))}`;
  }

  // ---------- Faiz ve taksit ----------
  function monthlyRate(faizPct, vergi) {
    return (Number(faizPct) || 0) / 100 * (vergi || 1);
  }
  function vergiFor(settings, kredi_turu) {
    const s = settings || {};
    return kredi_turu === 'Konut Kredisi' ? (s.vergi_carpani_konut ?? 1) : (s.vergi_carpani ?? 1.3);
  }
  function annuityPayment(p, faizPct, n, vergi) {
    if (!(p > 0) || !(n > 0)) return 0;
    const r = monthlyRate(faizPct, vergi);
    if (r <= 0) return p / n;
    return p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }
  function annuityTotal(p, faizPct, n, vergi) {
    return r2(annuityPayment(p, faizPct, n, vergi) * n);
  }
  /** Aylık taksit, faiz ve vadeden çekilen tutarı (ana para) bulur; annuityPayment'ın tersi. */
  function annuityPrincipal(pmt, faizPct, n, vergi) {
    if (!(pmt > 0) || !(n > 0)) return 0;
    const r = monthlyRate(faizPct, vergi);
    if (r <= 0) return pmt * n;
    const f = Math.pow(1 + r, n);
    return pmt * (f - 1) / (r * f);
  }
  // ---------- Kredi bilgilerinin tutarlılık denetimi ----------
  /** Çekilen tutar, taksit sayısı ve taksit tutarından örtük (yazılı, vergisiz) aylık faiz yüzdesini bulur. Bulunamazsa null. */
  function impliedRate(ana, aylik, n, vergi) {
    if (!(ana > 0) || !(aylik > 0) || !(n >= 1)) return null;
    if (aylik * n <= ana) return 0;
    const pay = (r) => { const p = Math.pow(1 + r, n); return Number.isFinite(p) ? ana * r * p / (p - 1) : ana * r; };
    let lo = 0, hi = 5;
    if (pay(hi) < aylik) return hi * 100 / (vergi || 1);
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (pay(mid) < aylik) lo = mid; else hi = mid; }
    return ((lo + hi) / 2) / (vergi || 1) * 100;
  }
  /** Faiz ve aylık taksitten vade (taksit sayısı) bulur; tam sayıya yakın ve taksidi %1 içinde tutturan sayı yoksa null. */
  function installmentCount(ana, aylik, faizPct, n0, vergi) {
    if (!(ana > 0) || !(aylik > 0)) return null;
    const r = monthlyRate(faizPct, vergi);
    let x;
    if (r <= 0) x = ana / aylik;
    else { if (aylik <= ana * r) return null; x = -Math.log(1 - ana * r / aylik) / Math.log(1 + r); }
    const m = Math.round(x);
    if (!(m >= 1 && m <= 360)) return null;
    return Math.abs(annuityPayment(ana, faizPct, m, vergi) - aylik) / aylik <= 0.01 ? m : null;
  }
  /** Çekilen tutar, aylık taksit, toplam taksit sayısı ve aylık faizden eksik olanı türetir (kullanıcının yazdığı değerler verilir; boş/otomatik olanlar null).
      o: { ana, aylik, n, faiz, faizDefault, vergi }. Dönüş: yalnızca türetilebilen alanlar { ana?, aylik?, n?, faiz? }. */
  function deriveLoan(o) {
    const pos = (v) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
    const vergi = o.vergi || 1.3, ana = pos(o.ana), aylik = pos(o.aylik), n = Math.trunc(pos(o.n));
    const has = (v) => v != null && String(v).trim() !== '' && Number.isFinite(Number(v));
    const fGiven = has(o.faiz) ? Number(o.faiz) : null;
    const fAssume = fGiven != null ? fGiven : (has(o.faizDefault) ? Number(o.faizDefault) : null);
    const out = {};
    if (ana > 0 && aylik > 0) {
      if (n >= 1) {
        if (fGiven == null && aylik * n >= ana * 0.99) { const imp = impliedRate(ana, aylik, n, vergi); if (imp != null && imp >= 0 && imp <= 8) out.faiz = r2(imp); }
      } else if (fGiven != null) { const m = installmentCount(ana, aylik, fGiven, 0, vergi); if (m) out.n = m; }      // vade yalnızca yazılmış faizle bulunur; varsayılan faizle tahmin yanıltır
    } else if (n >= 1 && fAssume != null) {
      if (ana > 0) out.aylik = r2(annuityPayment(ana, fAssume, n, vergi));
      else if (aylik > 0) out.ana = r2(annuityPrincipal(aylik, fAssume, n, vergi));
    }
    return out;
  }  /** Kredi bilgileri birbiriyle tutarlı mı? Dönen liste: { seviye: 'hata' | 'uyari', alanlar: [...], mesaj, oneri }.
      o: { aylik, kalan, toplam, ana, faiz, faizBilinen, vergi, faizOneri } */
  function checkLoan(o) {
    const out = [];
    const aylik = Number(o.aylik) || 0, kalan = parseInt(o.kalan) || 0, toplam = parseInt(o.toplam) || 0, ana = Number(o.ana) || 0;
    const faiz = o.faiz == null || o.faiz === '' || Number.isNaN(Number(o.faiz)) ? null : Number(o.faiz);
    const vergi = o.vergi || 1.3, faizBilinen = !!o.faizBilinen && faiz != null, faizOneri = o.faizOneri != null ? Number(o.faizOneri) : 3.89;
    const add = (seviye, alanlar, mesaj, oneri) => out.push({ seviye, alanlar, mesaj, oneri: oneri || null });
    if (faizBilinen) {
      if (faiz < 0 || faiz > 15) add('hata', ['faiz'], `Aylık faiz %${pc(faiz)} gerçekçi değil (krediler genelde aylık %1,5 ile %5 arasındadır).`);
      else if (faiz > 8) add('uyari', ['faiz'], `Aylık faiz %${pc(faiz)} çok yüksek görünüyor. Yıllık değil, aylık oranı yazdığınızdan emin olun.`);
    }
    if (kalan && toplam && kalan > toplam) add('hata', ['kalan', 'toplam'], `Kalan taksit sayısı (${kalan}) toplam taksit sayısından (${toplam}) büyük olamaz.`);
    if (!(aylik > 0)) return out;
    if (ana > 0 && aylik > ana && (toplam > 1 || kalan > 1)) add('hata', ['aylik', 'ana'], `Aylık taksit (${fmtMoney(aylik)}) çektiğiniz tutardan (${fmtMoney(ana)}) büyük olamaz.`);
    else if (ana > 0 && toplam >= 1) {
      const top = aylik * toplam;
      if (top < ana * 0.97) add('hata', ['aylik', 'toplam', 'ana'], `${toplam} taksit × ${fmtMoney(aylik)} = ${fmtMoney(top)} eder; ${fmtMoney(ana)} çekip bundan daha az geri ödemek mümkün değil.`);
      else {
        const imp = impliedRate(ana, aylik, toplam, vergi), f = faizBilinen ? faiz : faizOneri;
        const beklenen = annuityPayment(ana, f, toplam, vergi), oneri = beklenen > 0 ? Math.round(beklenen * 100) / 100 : null;
        if (imp != null && imp > 8) add('hata', ['aylik', 'toplam', 'ana'], `${fmtMoney(ana)} çekip ${toplam} ayda ödüyorsanız aylık taksit yaklaşık ${fmtMoney(beklenen)} olmalı (%${pc(f)} faizle). Yazdığınız ${fmtMoney(aylik)}, yaklaşık %${pc(imp)} aylık faiz demek; bu gerçekçi değil.`, oneri);
        else if (imp != null && imp > 6) add('uyari', ['aylik', 'toplam', 'ana'], `Bu taksit yaklaşık %${pc(imp)} aylık faiz anlamına geliyor, oldukça yüksek. Beklenen taksit yaklaşık ${fmtMoney(beklenen)}.`, oneri);
        else if (faizBilinen && faiz > 0 && beklenen > 0) {
          const dev = Math.abs(aylik - beklenen) / beklenen;
          if (dev > 0.30) add('hata', ['aylik', 'faiz'], `%${pc(faiz)} faizle ${fmtMoney(ana)} için ${toplam} aylık taksit yaklaşık ${fmtMoney(beklenen)} olmalı; siz ${fmtMoney(aylik)} yazdınız.`, oneri);
          else if (dev > 0.10) add('uyari', ['aylik', 'faiz'], `%${pc(faiz)} faizle beklenen taksit yaklaşık ${fmtMoney(beklenen)}; siz ${fmtMoney(aylik)} yazdınız. Sigorta ya da masraf farkı olabilir.`, oneri);
        } else if (faizBilinen && faiz === 0 && top > ana * 1.02) add('uyari', ['faiz', 'aylik'], `Faizsiz yazdınız ama toplam ödeme (${fmtMoney(top)}) çektiğiniz tutardan (${fmtMoney(ana)}) fazla.`);
      }
    } else if (ana > 0 && kalan >= 1 && !toplam) {
      // Toplam taksit bilinmiyorsa: kalan taksitlerin bugünkü değeri, çekilen tutarı aşamaz
      const f = faizBilinen ? faiz : faizOneri, pv = annuityPrincipal(aylik, f, kalan, vergi);
      if (pv > ana * 1.10) add('hata', ['aylik', 'kalan', 'ana'], `Kalan ${kalan} taksit × ${fmtMoney(aylik)} (%${pc(f)} faizle) yaklaşık ${fmtMoney(pv)} anapara eder; bu, çektiğiniz ${fmtMoney(ana)} tutarından fazla olamaz.`);
    }
    return out;
  }

  /** Eşit taksitli plan üretir; mevcut ödeme durumlarını (odendiFlags) korur. */
  function buildSchedule(o) {
    const n = Math.max(1, o.n | 0);
    const toplam = o.toplam;
    const aylik = r2(toplam / n);
    const out = [];
    for (let i = 0; i < n; i++) {
      const ym = ymAdd(o.ilkYm, i);
      const tutar = i === n - 1 ? r2(toplam - aylik * (n - 1)) : aylik;
      let odendi;
      if (Array.isArray(o.odendiFlags) && o.odendiFlags[i] !== undefined) odendi = !!o.odendiFlags[i];
      else odendi = i < (o.odenenSayisi || 0);
      out.push({ no: i + 1, ym, vade_tarihi: dueDate(ym, o.gun), tutar, odendi });
    }
    return out;
  }

  // ---------- Kart ekstre / KMH / kredi ilk vade ----------
  /** Harcama tarihine ve kesim/son ödeme gününe göre ilk ödeme ayı. */
  function cardFirstYm(isoDate, kesimGunu, sonOdemeGunu) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const ymHarcama = `${y}-${pad(m)}`;
    const ekstreYm = d <= kesimGunu ? ymHarcama : ymAdd(ymHarcama, 1);
    return sonOdemeGunu < kesimGunu ? ymAdd(ekstreYm, 1) : ekstreYm;
  }
  function kmhFirstYm(isoDate, kesimGunu, taksitli) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const ym = `${y}-${pad(m)}`;
    if (taksitli) return ymAdd(ym, 1);
    return d <= kesimGunu ? ym : ymAdd(ym, 1);
  }
  function loanFirstYm(isoDate) {
    const [y, m] = isoDate.split('-').map(Number);
    return ymAdd(`${y}-${pad(m)}`, 1);
  }

  // ---------- Durum ----------
  function installmentStatus(t, now) {
    if (t.odendi) return 'odendi';
    if (t.sigortaGecmis) return 'sigorta_odedi';
    if (t.sigortaOder) return 'sigorta';
    if (t.vade_tarihi < isoOf(now)) return 'gecikmis';
    if (t.ym <= ymOf(now)) return 'bu_ay';
    return 'bekliyor';
  }

  /** Veritabanını tek düz listeye çevirir (kalem = bir harcama veya bir kredi). */
  function items(db) {
    const out = [];
    (db.kmh_hesaplar || []).forEach((h) => (h.hareketler || []).forEach((x) =>
      out.push({ cat: 'KMH', parent: h, item: x, banka: h.banka, hesap: h.hesap_adi })));
    (db.kredi_kartlari || []).forEach((k) => (k.hareketler || []).forEach((x) =>
      out.push({ cat: 'KART', parent: k, item: x, banka: k.banka, hesap: k.kart_adi })));
    (db.krediler || []).forEach((kr) =>
      out.push({ cat: 'KREDI', parent: null, item: kr, banka: kr.banka, hesap: kr.kredi_adi }));
    return out;
  }
  /** Bizim ödememiz gereken taksitler: ödenmemiş ve sigortanın üstlenmediği. */
  function unpaid(item) { return (item.taksitler || []).filter((t) => !t.odendi && !t.sigortaOder && !t.sigortaGecmis); }
  /** Limiti hâlâ dolduran taksitler: sigortanın bu aya kadar ödediği taksitler hariç. */
  function unpaidAll(item) { return (item.taksitler || []).filter((t) => !t.odendi && !t.sigortaGecmis); }
  function installmentPaidAmount(t) {
    return t.odendi ? t.tutar : Math.min(t.tutar, Number(t.ekstre_kismi_odeme) || 0);
  }
  function installmentBalance(t) { return r2(Math.max(0, t.tutar - installmentPaidAmount(t))); }
  function remainingTotal(item) { return sum(unpaid(item), installmentBalance); }

  /** Kalan ana para (limitten düşülen kısım): ana para x (kalan / toplam geri ödeme). */
  function remainingPrincipal(item) {
    if (item.gecikmis) return unpaidAll(item).length ? r2(item.ana_para) : 0;
    const toplam = Number(item.toplam_geri_odeme) || sum(item.taksitler || [], (t) => t.tutar);
    if (!(toplam > 0)) return 0;
    return r2(Number(item.ana_para || 0) * Math.min(1, sum(unpaidAll(item), installmentBalance) / toplam));
  }

  // ---------- Sabit giderler (kira, fatura, market, elden borç …) ----------
  const GIDER_KATEGORILERI = [
    ['Kira', 'home'], ['Fatura', 'bulb'], ['Market / Gıda', 'cart'], ['Ulaşım', 'bus'], ['Eğitim', 'cap'],
    ['Sağlık', 'med'], ['Sigorta', 'shield'], ['Abonelik', 'tv'], ['Elden borç', 'swap'], ['Diğer', 'box'],
  ];
  const giderIkon = (k) => (GIDER_KATEGORILERI.find((x) => x[0] === k) || [0, 'box'])[1];
  const giderPaid = (g, ym) => (g.odendi_aylar || []).includes(ym);
  const giderKalanli = (g) => g.kalan != null && g.kalan !== '';
  function giderTutar(g, ym, kalan = g.kalan) {
    const tutar = Number(g.tutar) || 0;
    if (!giderKalanli(g)) return tutar;
    if (giderPaid(g, ym)) return Number(g.odeme_tutarlari?.[ym] ?? tutar);
    return Math.min(tutar, Number(kalan));
  }
  function giderTahminiKalan(g, buAy, hedefAy) {
    const baslangic = g.baslangic_ym > buAy ? g.baslangic_ym : buAy;
    const odenen = new Set((g.odendi_aylar || []).filter((ay) => ay >= baslangic && ay < hedefAy));
    const onceki = Math.max(0, monthsBetween(baslangic, hedefAy) - odenen.size);
    return r2(Math.max(0, Number(g.kalan) - (Number(g.tutar) || 0) * onceki));
  }
  /** Gider o ay geçerli mi? Elden borçta kalan tutar bitene, diğerlerinde süre dolana kadar. */
  function giderAktif(g, ym) {
    if (g.baslangic_ym && ym < g.baslangic_ym && !giderPaid(g, ym)) return false;   // henüz başlamadı
    if (giderKalanli(g)) return Number(g.kalan) > 0.005 || giderPaid(g, ym);
    if (!(g.sure > 0) || !g.baslangic_ym) return true;
    const d = monthsBetween(g.baslangic_ym, ym);
    return (d >= 0 && d < g.sure) || giderPaid(g, ym);
  }
  /** Gelir o ay geçerli mi? baslangic_ym boşsa hemen, sure boşsa/0 ise sürekli. */
  function gelirAktif(g, ym) {
    if (g.baslangic_ym && ym < g.baslangic_ym) return false;
    if (g.sure > 0 && g.baslangic_ym) return monthsBetween(g.baslangic_ym, ym) < g.sure;
    return true;
  }
  function incomeMonthly(db, ym) {
    return r2(sum((db.ek_gelirler || []).filter((g) => gelirAktif(g, ym)), (g) => g.tutar));
  }
  function fixedMonthly(db, ym) {
    return r2(sum((db.sabit_giderler || []).filter((g) => giderAktif(g, ym)), (g) => giderTutar(g, ym)));
  }
  /** Bu ayın giderleri: toplam, kategori kırılımı, ödenmemişler ve elden borç kalanı. */
  function fixedSummary(db, now) {
    const ym = ymOf(now), today = isoOf(now);
    const list = (db.sabit_giderler || []).filter((g) => giderAktif(g, ym)).map((g) => ({
      id: g.id, ad: g.ad, kategori: g.kategori, tutar: giderTutar(g, ym), gun: g.gun || 0, odendi: giderPaid(g, ym),
      vade: dueDate(ym, g.gun || 1), kalan: giderKalanli(g) ? Number(g.kalan) : null,
    }));
    list.forEach((g) => { g.gecti = !g.odendi && g.gun > 0 && g.vade < today; });
    const byCat = {};
    list.forEach((g) => { byCat[g.kategori] = r2((byCat[g.kategori] || 0) + g.tutar); });
    const kategoriler = Object.keys(byCat).map((k) => ({ kategori: k, tutar: byCat[k] })).sort((a, b) => b.tutar - a.tutar);
    return {
      list, toplam: r2(sum(list, (g) => g.tutar)), odenmemis: r2(sum(list.filter((g) => !g.odendi), (g) => g.tutar)),
      kategoriler, eldenKalan: r2(sum(list.filter((g) => g.kategori === 'Elden borç' && g.kalan != null), (g) => g.kalan)),
    };
  }
  /** Gideri bu ay için ödendi / ödenmedi yapar; elden borçta kalan tutarı düşer ya da geri ekler. */
  function toggleGiderPaid(g, ym, paid) {
    g.odendi_aylar = g.odendi_aylar || [];
    const has = g.odendi_aylar.includes(ym);
    if (paid && !has) {
      if (giderKalanli(g)) {
        const tutar = giderTutar(g, ym);
        g.odeme_tutarlari = g.odeme_tutarlari || {};
        g.odeme_tutarlari[ym] = tutar;
        g.kalan = r2(Math.max(0, Number(g.kalan) - tutar));
      }
      g.odendi_aylar.push(ym);
    } else if (!paid && has) {
      if (giderKalanli(g)) g.kalan = r2(Number(g.kalan) + giderTutar(g, ym));
      g.odendi_aylar = g.odendi_aylar.filter((x) => x !== ym);
      if (g.odeme_tutarlari) delete g.odeme_tutarlari[ym];
    }
  }

  /**
   * Gelecek n ayın tahmini: gelir sabit varsayılır; sabit giderler süre/kalan borca göre, borç ödemeleri
   * mevcut taksit takviminden gelir. Yeni harcama veya borç eklenmeyeceği varsayılır.
   */
  function forecast(db, now, settings, n) {
    const thisYm = ymOf(now);
    const its = items(db);
    const rows = [];
    let kum = 0;
    for (let k = 1; k <= n; k++) {
      const ym = ymAdd(thisYm, k);
      const gelir = incomeMonthly(db, ym);
      let borc = 0, adet = 0, sonra = 0, sigorta = 0;
      const bitenler = [];
      its.forEach((e) => {
        const u = unpaid(e.item), all = (e.item.taksitler || []).filter((t) => !t.odendi);
        if (!all.length && !(e.item.taksitler || []).some((t) => t.ym === ym)) return;
        const m = (e.item.taksitler || []).filter((t) => t.ym === ym && !t.sigortaOder && !t.sigortaGecmis && !t.kapatildi);   // ödenmiş olsa da o ayın yükü
        if (m.length) { borc += sum(m, (t) => t.tutar); adet += m.length; }
        const sg = all.filter((t) => t.sigortaOder && t.ym === ym);
        if (sg.length) sigorta += sum(sg, (t) => t.tutar);
        sonra += sum(u.filter((t) => t.ym > ym), installmentBalance);
        if (all.reduce((mx, t) => (t.ym > mx ? t.ym : mx), '0000-00') === ym) {
          bitenler.push(`${e.banka} · ${e.cat === 'KREDI' ? e.item.kredi_adi : e.item.aciklama} biter`);
        }
      });
      let sabit = 0;
      (db.sabit_giderler || []).forEach((g) => {
        const tutar = Number(g.tutar) || 0;
        if (g.baslangic_ym && ym < g.baslangic_ym) return;
        if (giderKalanli(g)) {
          const kalan = giderTahminiKalan(g, thisYm, ym);
          const ayTutari = giderTutar(g, ym, kalan);
          sabit += ayTutari;
          if (ayTutari > 0.005 && !giderPaid(g, ym) && kalan - ayTutari <= 0.005) bitenler.push(`${g.ad} borcu biter`);
        } else if (giderAktif(g, ym)) {
          sabit += tutar;
          if (g.sure > 0 && g.baslangic_ym && monthsBetween(g.baslangic_ym, ym) === g.sure - 1) bitenler.push(`${g.ad} gideri biter`);
        }
      });
      const tek = oneOffMonthly(db, ym);
      const kmhFaiz = r2(sum(db.kmh_hesaplar || [], (a) => hesapAylikFaiz(a, settings)));   // eksi bakiyeli vadesiz hesapların tahmini faizi
      sabit += kmhFaiz;
      const kalan = r2(gelir - sabit - borc - tek);
      kum = r2(kum + kalan);
      rows.push({ ym, gelir, sabit: r2(sabit), borc: r2(borc), tek, adet, kalan, kum, borcSonrasi: r2(sonra), sigorta: r2(sigorta), bitenler });
    }
    return rows;
  }

  /**
   * Seçili ay görünümü için veritabanı kopyası: o aydan önce vadesi gelen tüm ödemeler yapılmış sayılır,
   * elden borç kalanları buna göre düşer. Gerçek veri değişmez.
   */
  function projectDb(db, ym, now) {
    const copy = JSON.parse(JSON.stringify(db));
    items(copy).forEach((e) => (e.item.taksitler || []).forEach((t) => { if (!t.odendi && t.ym < ym) t.odendi = true; }));
    const thisYm = ymOf(now), d = monthsBetween(thisYm, ym);
    (copy.sabit_giderler || []).forEach((g) => {
      if (giderKalanli(g) && d > 0) g.kalan = giderTahminiKalan(g, thisYm, ym);
    });
    // O aya gelindiğinde bitmiş ya da kapatılmış kalemler (hiç ödenmemiş taksiti ve o ay veya sonrasında taksiti kalmayanlar) görünümden çıkar.
    const aktif = (it) => (it.taksitler || []).some((t) => !t.odendi || (t.ym >= ym && !t.kapatildi));
    (copy.kmh_hesaplar || []).concat(copy.kredi_kartlari || []).forEach((h) => { h.hareketler = (h.hareketler || []).filter(aktif); });
    copy.krediler = (copy.krediler || []).filter(aktif);
    const [yy, mm] = ym.split('-').map(Number);
    markCoverage(copy, new Date(yy, mm - 1, 1));
    return copy;
  }

  function summarize(db, now, settings) {
    const thisYm = ymOf(now);
    const nextYm = ymAdd(thisYm, 1);
    const gelir = incomeMonthly(db, thisYm);
    let kalanBorc = 0, gecikmis = 0, buAy = 0, gelecekAy = 0, buAyOdenen = 0;
    let taksitSayisi = 0, sonVade = null;
    const byCat = { KMH: 0, KART: 0, KREDI: 0 };
    let sigortaKarsilanan = 0;
    const monthMap = {};
    const upcoming = [];
    items(db).forEach((e) => {
      unpaid(e.item).forEach((t) => {
        const st = installmentStatus(t, now);
        const kalan = installmentBalance(t);
        kalanBorc += kalan;
        byCat[e.cat] += kalan;
        if (st === 'gecikmis') gecikmis += kalan;
        if (t.ym <= thisYm) buAy += kalan;
        if (t.ym === nextYm) gelecekAy += kalan;
        taksitSayisi++;
        if (!sonVade || t.vade_tarihi > sonVade) sonVade = t.vade_tarihi;
        const m = (monthMap[t.ym] = monthMap[t.ym] || { ym: t.ym, tutar: 0, adet: 0 });
        m.tutar = r2(m.tutar + kalan); m.adet++;
        upcoming.push({ vade: t.vade_tarihi, ym: t.ym, durum: st, banka: e.banka, cat: e.cat, hesap: e.hesap,
          aciklama: e.cat === 'KREDI' ? (e.item.kredi_adi || e.item.kredi_turu) : e.item.aciklama,
          taksitNo: t.no, toplamTaksit: e.item.toplam_taksit, tutar: kalan, parentId: e.parent ? e.parent.id : null, itemId: e.item.id });
      });
      // Gecikmiş borçta ödeme gerçekten yapıldığı aya, diğer taksitlerde kayıtlı vade ayına yazılır.
      const odemeler = e.item.gecikmis && Array.isArray(e.item.odemeler)
        ? e.item.odemeler.filter((o) => typeof o?.tarih === 'string' && Number.isFinite(Number(o.tutar)) && Number(o.tutar) > 0)
        : [];
      if (odemeler.length) buAyOdenen += sum(odemeler.filter((o) => o.tarih.slice(0, 7) === thisYm), (o) => o.tutar);
      else (e.item.taksitler || []).forEach((t) => { if (!t.kapatildi && t.ym === thisYm) buAyOdenen += installmentPaidAmount(t); });
      (e.item.taksitler || []).filter((t) => t.sigortaOder).forEach((t) => {
        sigortaKarsilanan += t.tutar;
        upcoming.push({ vade: t.vade_tarihi, ym: t.ym, durum: 'sigorta', banka: e.banka, cat: e.cat, hesap: e.hesap,
          aciklama: e.cat === 'KREDI' ? (e.item.kredi_adi || e.item.kredi_turu) : e.item.aciklama,
          taksitNo: t.no, toplamTaksit: e.item.toplam_taksit, tutar: t.tutar, parentId: e.parent ? e.parent.id : null, itemId: e.item.id });
      });
    });
    upcoming.sort((a, b) => a.vade.localeCompare(b.vade));
    const yasam = Array.isArray(db.sabit_giderler) ? fixedMonthly(db, thisYm) : (Number((settings || {}).aylik_yasam_gideri) || 0);
    return {
      gelir: r2(gelir), kalanBorc: r2(kalanBorc), gecikmis: r2(gecikmis), buAy: r2(buAy), buAyOdenen: r2(buAyOdenen), buAyToplam: r2(buAy + buAyOdenen), gelecekAy: r2(gelecekAy),
      tekSeferlik: oneOffMonthly(db, thisYm), kmhFaiz: r2(sum(db.kmh_hesaplar || [], (a) => hesapAylikFaiz(a, settings))),
      kalanSonrasi: r2(gelir - yasam - buAy - buAyOdenen - oneOffMonthly(db, thisYm) - sum(db.kmh_hesaplar || [], (a) => hesapAylikFaiz(a, settings))), yasamGideri: yasam, taksitSayisi, sonVade,
      byCat: { KMH: r2(byCat.KMH), KART: r2(byCat.KART), KREDI: r2(byCat.KREDI) }, sigortaKarsilanan: r2(sigortaKarsilanan),
      months: Object.values(monthMap).sort((a, b) => a.ym.localeCompare(b.ym)), upcoming, thisYm, nextYm,
    };
  }

  // ---------- Asgari ödeme ----------
  function minPaymentRate(limit, settings) {
    const s = settings || {};
    return (Number(limit) <= (s.asgari_limit_esigi ?? 100000) ? (s.asgari_oran_alt ?? 20) : (s.asgari_oran_ust ?? 40)) / 100;
  }
  /** Kartın bu dönem borcu = vadesi bu aya kadar gelmiş ödenmemiş taksitler. */
  function cardStatementDebt(kart, now) {
    return cardStatementDue(kart, ymOf(now)).toplam;
  }
  function cardMinPayment(kart, now, settings) {
    const ym = ymOf(now), p = cardPayPreview(kart, ym, 0, settings);
    const closed = sum((kart.hareketler || []).filter((h) => !h.gecikmis), (h) =>
      sum((h.taksitler || []).filter((t) => t.odendi && !t.ekstre_kismi_odeme && !t.kapatildi && t.ym === ym), (t) => t.tutar));
    const odenen = r2(p.oncekiOdeme + closed);
    return { donemBorcu: p.toplam, toplam: r2(p.toplam + odenen), odenen, oran: p.oran,
      asgari: r2(p.asgariToplam + closed * p.oran), kalanAsgari: r2(Math.max(0, p.asgariToplam + closed * p.oran - odenen)) };
  }
  /** Yalnızca asgari ödeme yapılırsa borcun kaç ayda ve ne maliyetle biteceği. */
  function minPaymentTrap(borc, faizPct, vergi, oran, extraMonthly) {
    let b = Number(borc), toplam = 0, ay = 0;
    const r = monthlyRate(faizPct, vergi);
    const ekstra = Number(extraMonthly) || 0;
    while (b > 1 && ay < MAX_AY) {
      b = b * (1 + r);
      const odeme = Math.min(b, Math.max(b * oran, 0) + ekstra);
      b -= odeme; toplam += odeme; ay++;
    }
    return { ay, toplamOdeme: r2(toplam), toplamFaiz: r2(toplam - borc), bitmedi: b > 1 };
  }

  // ---------- Borç modeli ve senaryo motoru ----------
  /** Kalan taksitlerden senaryo için borç listesi çıkarır. */
  function debtModels(db, now, settings) {
    const thisYm = ymOf(now);
    const list = [];
    items(db).forEach((e) => {
      const u = unpaid(e.item).slice().sort((a, b) => a.ym.localeCompare(b.ym));
      if (!u.length) return;
      const vergi = vergiFor(settings, e.item.kredi_turu);
      const r = e.item.gecikmis ? 0 : monthlyRate(e.item.faiz_orani, vergi);
      // Sigorta bir aralığı üstleniyorsa kalem, kesintisiz parçalara bölünür.
      const segs = [];
      u.forEach((t) => {
        const last = segs[segs.length - 1];
        if (last && monthsBetween(last[last.length - 1].ym, t.ym) === 1) last.push(t); else segs.push([t]);
      });
      segs.forEach((seg, si) => {
        const P = r2(sum(seg, (t) => t.tutar) / seg.length), n = seg.length;
        const start = Math.max(0, monthsBetween(thisYm, seg[0].ym));
        const B = r > 0 ? P * (1 - Math.pow(1 + r, -n)) / r : P * n;
        const baseAd = e.cat === 'KREDI' ? `${e.item.kredi_adi}` : `${e.item.aciklama}`;
        list.push({
          key: `${e.cat}-${e.parent ? e.parent.id : 0}-${e.item.id}${si ? '#' + si : ''}`, cat: e.cat, banka: e.banka,
          ad: segs.length > 1 ? `${baseAd} (${shortYm(seg[0].ym)}–${shortYm(seg[seg.length - 1].ym)})` : baseAd, hesap: e.hesap,
          r, faiz: Number(e.item.faiz_orani) || 0, P, n, start, B: r2(B), gecikmis: seg.some((t) => t.vade_tarihi < isoOf(now)),
        });
      });
    });
    return list;
  }

  /**
   * Aylık simülasyon. strateji: 'mevcut' (yalnız sözleşme taksitleri), 'cig' (en yüksek faiz önce),
   * 'kartopu' (en küçük bakiye önce). butce: aylık borçlara ayrılabilecek toplam tutar.
   */
  function simulate(debts, now, opt) {
    const strateji = (opt && opt.strateji) || 'mevcut';
    const butce = Number(opt && opt.butce) || 0;
    const state = debts.map((d) => ({ d, b: d.B }));
    const baslangic = r2(sum(debts, (d) => d.B));
    const thisYm = ymOf(now);
    const aylar = [];
    let toplamOdeme = 0, ay = 0, acikAylar = 0;
    for (; ay < MAX_AY; ay++) {
      if (!state.some((s) => s.b > 0.005)) break;
      let odenen = 0;
      const kal = {};
      state.forEach((s) => {
        if (ay < s.d.start || s.b <= 0.005) return;
        const faiz = s.b * s.d.r;
        const pay = Math.min(s.d.P, s.b + faiz);
        s.b = r2(s.b + faiz - pay);
        odenen += pay; kal[s.d.key] = (kal[s.d.key] || 0) + pay;
      });
      const sozlesme = odenen;
      if (strateji !== 'mevcut' && butce > odenen) {
        let ekstra = butce - odenen;
        const aktif = state.filter((s) => ay >= s.d.start && s.b > 0.005);
        aktif.sort(strateji === 'cig' ? (a, b) => b.d.r - a.d.r || a.b - b.b : (a, b) => a.b - b.b);
        for (const s of aktif) {
          if (ekstra <= 0.005) break;
          const x = Math.min(ekstra, s.b);
          s.b = r2(s.b - x); ekstra -= x; odenen += x; kal[s.d.key] = (kal[s.d.key] || 0) + x;
        }
      }
      if (butce > 0 && sozlesme > butce + 0.005) acikAylar++;
      toplamOdeme += odenen;
      aylar.push({ ay, ym: ymAdd(thisYm, ay), odeme: r2(odenen), sozlesme: r2(sozlesme), kalan: r2(sum(state, (s) => s.b)), kalem: Object.keys(kal).reduce((o, k) => { o[k] = r2(kal[k]); return o; }, {}) });
    }
    const bitti = !state.some((s) => s.b > 0.005);
    return {
      strateji, aySayisi: ay, bitisYm: bitti && aylar.length ? aylar[aylar.length - 1].ym : null, bitti,
      toplamOdeme: r2(toplamOdeme), toplamFaiz: r2(toplamOdeme - baslangic), baslangicBorc: baslangic, aylar, acikAylar,
    };
  }

  // ---------- Sigorta kapsamı: sigorta, belirli aylarda borç taksitlerini bizim yerimize öder ----------
  /** Kapsamın tanımlı olduğu nesne: kredinin kendisi ya da kart / KMH hesabı. */
  function coverageHolder(db, cat, id) {
    if (cat === 'KREDI') return (db.krediler || []).find((x) => x.id === id);
    if (cat === 'KART') return (db.kredi_kartlari || []).find((x) => x.id === id);
    if (cat === 'KMH') return (db.kmh_hesaplar || []).find((x) => x.id === id);
    return null;
  }
  /** Taksitlere sigortaOder (bu ay ve sonrası) / sigortaGecmis (geçmiş aylar) işaretlerini koyar. */
  function markCoverage(db, now) {
    const thisYm = ymOf(now);
    const mark = (item, cov) => (item.taksitler || []).forEach((t) => {
      const inWin = !!(cov && cov.ilk_ym && cov.ay > 0 && t.ym >= cov.ilk_ym && t.ym < ymAdd(cov.ilk_ym, cov.ay));
      const c = inWin && !t.odendi;
      t.sigortaOder = !!(c && t.ym >= thisYm); t.sigortaGecmis = !!(c && t.ym < thisYm);
    });
    (db.krediler || []).forEach((kr) => mark(kr, kr.sigorta_kapsam));
    (db.kredi_kartlari || []).forEach((k) => (k.hareketler || []).forEach((h) => mark(h, k.sigorta_kapsam)));
    (db.kmh_hesaplar || []).forEach((a) => (a.hareketler || []).forEach((h) => mark(h, a.sigorta_kapsam)));
  }
  /** Form için ürün listesi (kredi, kart, KMH hesabı) ve mevcut kapsam bilgisi. */
  function coverageProducts(db) {
    const mk = (cat, x, ad) => ({ cat, id: x.id, banka: x.banka, ad, kapsam: x.sigorta_kapsam || null });
    return []
      .concat((db.krediler || []).map((x) => mk('KREDI', x, x.kredi_adi)))
      .concat((db.kredi_kartlari || []).map((x) => mk('KART', x, x.kart_adi)))
      .concat((db.kmh_hesaplar || []).map((x) => mk('KMH', x, x.hesap_adi)));
  }
  /** Kapsamın etkilediği ödenmemiş taksitler: adet, toplam tutar, ilk ve son ay. */
  function coverageInfo(db, cat, id, cov) {
    const holder = coverageHolder(db, cat, id);
    const lists = !holder ? [] : cat === 'KREDI' ? [holder] : (holder.hareketler || []);
    cov = cov || (holder && holder.sigorta_kapsam);
    if (!cov || !cov.ilk_ym || !(cov.ay > 0)) return { adet: 0, tutar: 0, ilk: null, son: null };
    const son = ymAdd(cov.ilk_ym, cov.ay - 1);
    const ts = [];
    lists.forEach((h) => (h.taksitler || []).forEach((t) => { if (!t.odendi && t.ym >= cov.ilk_ym && t.ym <= son) ts.push(t); }));
    return { adet: ts.length, tutar: r2(sum(ts, (t) => t.tutar)), ilk: cov.ilk_ym, son };
  }
  /** "Şu tarihten sonraki aylarda": seçilen tarihten sonraki ay ilk kapsam ayıdır. */
  function coverageFirstYm(isoDate) { return ymAdd(isoDate.slice(0, 7), 1); }

  // ---------- Gecikmiş borç (kart / KMH) ----------
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  }
  /** Gecikme faizi: kalan asıl borç x (aylık oran x vergi) x gün/30 (basit faiz) + önceki ödemelerden artan faiz. */
  function overdueInfo(item, now, vergi) {
    const days = Math.max(0, daysBetween(item.gecikme_baslangic, isoOf(now)));
    const r = monthlyRate(item.gecikme_faiz, vergi);
    const faiz = r2(item.ana_para * r * days / 30 + (Number(item.birikmis_faiz) || 0));
    return { days, faiz, toplam: r2(item.ana_para + faiz), gunluk: r2(item.ana_para * r / 30), aylik: r2(item.ana_para * r) };
  }

  function refreshOverdueInstallment(item, taksit, toplam) {
    const vade = item.tarih || taksit.vade_tarihi || item.gecikme_baslangic;
    taksit.tutar = toplam;
    taksit.vade_tarihi = vade;
    taksit.ym = vade.slice(0, 7);
    item.toplam_geri_odeme = toplam;
  }
  /** Gecikmiş kalemlerin güncel tutarını bugüne göre yeniler (taksit tutarı = anapara + işlemiş faiz). */
  function refreshOverdue(db, now, settings) {
    items(db).forEach((e) => {
      const it = e.item;
      if (!it.gecikmis) return;
      const t = it.taksitler && it.taksitler[0];
      if (!t || t.odendi) return;
      const o = overdueInfo(it, now, vergiFor(settings));
      refreshOverdueInstallment(it, t, o.toplam);
    });
  }
  function newOverdueItem(o, now, settings) {
    const info = overdueInfo({ ana_para: o.ana, gecikme_baslangic: o.baslangic, gecikme_faiz: o.faiz, birikmis_faiz: 0 }, now, vergiFor(settings));
    return {
      id: o.id, tur: 'Gecikmiş Borç', aciklama: o.aciklama, tarih: o.baslangic, ilk_taksit_ym: o.baslangic.slice(0, 7),
      ana_para: o.ana, faiz_orani: o.faiz, toplam_geri_odeme: info.toplam, toplam_taksit: 1,
      gecikmis: true, gecikme_baslangic: o.baslangic, gecikme_faiz: o.faiz, birikmis_faiz: 0, odemeler: [], odenen_faiz: 0, odenen_ana: 0,
      taksitler: [{ no: 1, ym: o.baslangic.slice(0, 7), vade_tarihi: o.baslangic, tutar: info.toplam, odendi: false }],
    };
  }
  /** Kısmi ödeme: önce işlemiş faizi kapatır, kalan kısım ana paradan düşer. */
  function applyPartialPayment(item, amount, now, settings) {
    const o = overdueInfo(item, now, vergiFor(settings));
    const x = Math.min(Number(amount), o.toplam);
    const faize = r2(Math.min(x, o.faiz));
    const anaya = r2(Math.min(item.ana_para, x - faize));
    item.birikmis_faiz = r2(o.faiz - faize);
    item.ana_para = r2(item.ana_para - anaya);
    item.gecikme_baslangic = isoOf(now);
    item.odenen_faiz = r2((item.odenen_faiz || 0) + faize);
    item.odenen_ana = r2((item.odenen_ana || 0) + anaya);
    (item.odemeler = item.odemeler || []).push({ tarih: isoOf(now), tutar: r2(x), faize, anaya });
    if (item.ana_para <= 0.005 && item.birikmis_faiz <= 0.005) item.taksitler[0].odendi = true;
    const t = item.taksitler[0];
    if (!t.odendi) {
      const n = overdueInfo(item, now, vergiFor(settings));
      refreshOverdueInstallment(item, t, n.toplam);
    }
    return { odenen: r2(x), faize, anaya };
  }

  /** Normal taksitte "farklı tutar": ödenebilecek en çok tutar = bu taksit + ödenmemiş sonraki taksitler (sigortanın ödediği hariç). */
  function installmentDiffInfo(taksitler, no) {
    const t = (taksitler || []).find((y) => y.no === no);
    const later = (taksitler || []).filter((y) => y.no > no && !y.odendi && !y.sigortaOder && !y.sigortaGecmis);
    return { t, later, max: t ? r2(t.tutar + sum(later, (y) => y.tutar)) : 0 };
  }
  /** Eksik ödeme farkı sonraki taksite eklenir, fazla ödeme sonraki taksitlerden düşülür. Hata varsa hiçbir şeyi değiştirmez. */
  function applyInstallmentAmount(taksitler, no, amount) {
    const x = Number(amount), { t, later, max } = installmentDiffInfo(taksitler, no);
    if (!t || t.odendi) return { ok: false, err: 'yok' };
    if (!(x > 0)) return { ok: false, err: 'tutar' };
    if (!later.length && Math.abs(x - t.tutar) > 0.005) return { ok: false, err: 'son', max };
    if (x > max + 0.005) return { ok: false, err: 'ust', max };
    const diff = r2(x - t.tutar);
    if (t.planli_tutar == null) t.planli_tutar = t.tutar;
    t.tutar = r2(x); t.odendi = true;
    if (diff < 0 && later.length) later[0].tutar = r2(later[0].tutar - diff);
    else if (diff > 0) {
      let rest = diff;
      for (const n of later) {
        const cut = Math.min(rest, n.tutar);
        n.tutar = r2(n.tutar - cut); rest = r2(rest - cut);
        if (n.tutar <= 0.005) { n.tutar = 0; n.odendi = true; }
        if (rest <= 0.005) break;
      }
    }
    return { ok: true, diff };
  }

  // ---------- Ana para / faiz yükü ----------
  /** Her taksiti ana para ve faiz payına ayırır (eşit taksit amortismanı, toplam faize ölçeklenir). */
  function costBreakdown(item, vergi) {
    const T = item.taksitler || [];
    const total = sum(T, (t) => t.tutar);
    if (item.gecikmis) {
      const t = T[0]; if (!t) return [];
      // Kısmi/tam ödeme geçmişi kapanan tutarı zaten ana para ve faiz olarak kaydeder.
      if (t.odendi && Number(item.ana_para) === 0 && !(item.birikmis_faiz > 0) && (item.odenen_ana > 0 || item.odenen_faiz > 0)) return [{ ana: 0, faiz: 0 }];
      const ana = Math.min(t.tutar, Number(item.ana_para) || 0);
      return [{ ana: r2(ana), faiz: r2(t.tutar - ana) }];
    }
    const ana = Number(item.ana_para) || 0;
    const I = Math.max(0, r2(total - ana));
    const r = monthlyRate(item.faiz_orani, vergi);
    const w = [];
    if (I > 0 && r > 0) { let B = ana; T.forEach((t) => { const f = B * r; w.push(f); B = Math.max(0, B + f - t.tutar); }); }
    const ws = w.reduce((a, b) => a + b, 0);
    return T.map((t, i) => {
      const f = I <= 0 ? 0 : ws > 0 ? I * w[i] / ws : I * t.tutar / (total || 1);
      return { ana: r2(t.tutar - f), faiz: r2(f) };
    });
  }
  function costSummary(db, settings) {
    const zero = () => ({ anaToplam: 0, faizToplam: 0, anaOdenen: 0, faizOdenen: 0, anaKalan: 0, faizKalan: 0, anaSigorta: 0, faizSigorta: 0 });
    const total = zero(), banks = {}, rows = [];
    items(db).forEach((e) => {
      const it = e.item, v = vergiFor(settings, it.kredi_turu), cb = costBreakdown(it, v), z = zero();
      (it.taksitler || []).forEach((t, i) => {
        const c = cb[i] || { ana: 0, faiz: 0 };
        if (t.kapatildi) { z.anaToplam += c.ana; z.anaOdenen += c.ana; return; }   // erken kapatıldı: faizi hiç ödenmez
        z.anaToplam += c.ana; z.faizToplam += c.faiz;
        if (t.odendi) { z.anaOdenen += c.ana; z.faizOdenen += c.faiz; }
        else if (t.sigortaOder || t.sigortaGecmis) { z.anaSigorta += c.ana; z.faizSigorta += c.faiz; }   // sigorta öder / ödedi
        else { z.anaKalan += c.ana; z.faizKalan += c.faiz; }
      });
      if (it.gecikmis) {   // önceki kısmi ödemeler
        z.anaToplam += it.odenen_ana || 0; z.anaOdenen += it.odenen_ana || 0;
        z.faizToplam += it.odenen_faiz || 0; z.faizOdenen += it.odenen_faiz || 0;
      }
      Object.keys(z).forEach((k) => { z[k] = r2(z[k]); });
      const b = (banks[e.banka] = banks[e.banka] || zero());
      Object.keys(z).forEach((k) => { total[k] += z[k]; b[k] += z[k]; });
      rows.push(Object.assign({ key: `${e.cat}:${e.parent ? e.parent.id : 0}:${it.id}`, cat: e.cat, banka: e.banka, hesap: e.hesap,
        ad: e.cat === 'KREDI' ? it.kredi_adi : it.aciklama, gecikmis: !!it.gecikmis }, z));
    });
    Object.keys(total).forEach((k) => { total[k] = r2(total[k]); });
    Object.keys(banks).forEach((n) => Object.keys(banks[n]).forEach((k) => { banks[n][k] = r2(banks[n][k]); }));
    return { total, banks, rows };
  }

  // ---------- Ödeme yükünü azaltma simülasyonları ("ya şöyle yaparsam?") ----------
  function accountLimitLeft(acc) {
    return r2((Number(acc.limit) || 0) - sum(acc.hareketler || [], (h) => remainingPrincipal(h)));
  }
  /**
   * Hareketleri sırayla uygular: yeni kredi / KMH / kart avansı / yapılandırma / tek seferlik nakit / aylık ek gelir.
   * Gelen nakit, seçilen borçları kapatmak için kullanılır; artan nakit "cash0" olarak ay 0'da elde kalır.
   */
  function buildScenario(debts, moves, settings, ctx) {
    ctx = ctx || {};
    const work = debts.map((d) => Object.assign({}, d));
    let cash = 0;
    const uyari = [], yeni = [], ekGelir = [], kapananlar = [];
    const vergiKredi = vergiFor(settings, 'İhtiyaç Kredisi');
    const vergiKart = (settings && settings.vergi_carpani) ?? 1.3;
    (moves || []).forEach((m, i) => {
      const tur = m.tur;
      const ad = m.ad || ({ kredi: 'Yeni kredi', kmh: 'KMH kullanımı', avans: 'Kart nakit avansı', yapilandir: 'Yapılandırılmış borç' }[tur] || 'Hareket');
      if (tur === 'ek_gelir') { if (Number(m.tutar) > 0) ekGelir.push({ tutar: Number(m.tutar), sure: Math.max(0, parseInt(m.sure) || 0) }); return; }
      if (tur === 'tek_nakit') cash += Math.max(0, Number(m.tutar) || 0);
      const k = (Number(m.kapatmaMasrafi) || 0) / 100;
      const set = work.filter((d) => (m.kapat || []).includes(d.key) && d.B > 0.005);
      const payoff = sum(set, (d) => d.B * (1 + k));
      const rOld = set.length ? set.reduce((a, d) => a + d.B * d.r, 0) / sum(set, (d) => d.B) : 0;
      if (tur === 'kredi' || tur === 'kmh' || tur === 'avans' || tur === 'yapilandir') {
        const masraf = Math.min(0.9, (Number(m.masraf) || 0) / 100);
        const auto = tur === 'yapilandir' || m.otomatik === true;
        const L = auto ? (payoff > 0 ? payoff / (1 - masraf) : 0) : Math.max(0, Number(m.tutar) || 0);
        const n = Math.max(1, parseInt(m.vade) || 12);
        const vergi = tur === 'kredi' || tur === 'yapilandir' ? vergiKredi : vergiKart;
        const faiz = Number(m.faiz) || 0;
        cash += L - L * masraf;
        if (L > 0.005) {
          const r = monthlyRate(faiz, vergi);
          const nd = { key: `YENI-${i}`, cat: 'YENI', banka: 'Yeni', ad, hesap: '', r, faiz, P: r2(annuityPayment(L, faiz, n, vergi)), n, start: 0, B: r2(L), gecikmis: false, yeni: true };
          work.push(nd); yeni.push(nd);
          if (set.length && r > rOld + 1e-9 && tur !== 'yapilandir') {
            uyari.push(`${ad}: kapattığınız borçların ortalama aylık maliyeti %${(rOld * 100).toFixed(2).replace('.', ',')}, yeni borç %${(r * 100).toFixed(2).replace('.', ',')}. Faiz yükü artar.`);
          }
          if (m.hesapId && ctx.hesaplar) {
            const acc = ctx.hesaplar.find((a) => String(a.id) === String(m.hesapId));
            if (acc) { const left = accountLimitLeft(acc); if (L > left + 0.005) uyari.push(`${ad}: ${fmtMoney(L)} gerekiyor ama seçilen hesapta kalan limit ${fmtMoney(left)}.`); }
          }
        }
        if (auto && !set.length) uyari.push(`${ad}: kapatılacak borç seçmediniz; tutar otomatik hesaplanamadı.`);
      }
      if (set.length) {
        let avail = cash;
        set.forEach((d) => {
          const need = d.B * (1 + k);
          if (avail >= need - 0.005) { avail -= need; kapananlar.push(`${d.banka} · ${d.ad}`); d.B = 0; }
          else if (avail > 0.005) { const f = avail / need; avail = 0; d.B = r2(d.B * (1 - f)); d.P = r2(d.P * (1 - f)); uyari.push(`${d.banka} · ${d.ad}: nakit yetmediği için yalnızca %${Math.round(f * 100)} kapatılabildi.`); }
          else uyari.push(`${d.banka} · ${d.ad}: kapatmak için nakit kalmadı.`);
        });
        cash = avail;
      }
    });
    return { debts: work.filter((d) => d.B > 0.005), cash0: r2(Math.max(0, cash)), ekGelir, uyari, yeni, kapananlar };
  }
  function scenarioMetrics(sim, o) {
    const A = sim.aylar;
    const ay0 = A.length ? A[0].odeme : 0;
    const ort12 = sum(A.slice(0, 12), (a) => a.odeme) / 12;
    let tepe = 0, tepeYm = null, acikAy = 0, acikToplam = 0;
    A.forEach((a, k) => {
      if (a.odeme > tepe) { tepe = a.odeme; tepeYm = a.ym; }
      const gap = a.odeme - o.gelirNet(k) - (k === 0 ? o.cash0 : 0);
      if (gap > 0.005) { acikAy++; acikToplam += gap; }
    });
    return { ay0: r2(ay0), ort12: r2(ort12), tepe: r2(tepe), tepeYm, acikAy, acikToplam: r2(acikToplam), net0: r2(o.gelirNet(0) + o.cash0 - ay0),
      aySayisi: sim.aySayisi, bitisYm: sim.bitisYm, bitti: sim.bitti, toplamOdeme: sim.toplamOdeme };
  }
  /** Mevcut durum ile hareketler uygulanmış durumu aynı ölçülerle karşılaştırır. */
  function compareScenario(debts, moves, now, settings, o) {
    o = o || {};
    const gelirNet0 = (Number(o.gelir) || 0) - (Number(o.yasam) || 0);
    const base = simulate(debts, now, { strateji: 'mevcut' });
    const sc = buildScenario(debts, moves, settings, o);
    const sim = simulate(sc.debts, now, { strateji: 'mevcut' });
    const ekGelirAy = (k) => sc.ekGelir.reduce((s, e) => s + (e.sure === 0 || k < e.sure ? e.tutar : 0), 0);
    const mb = scenarioMetrics(base, { gelirNet: () => gelirNet0, cash0: 0 });
    const ms = scenarioMetrics(sim, { gelirNet: (k) => gelirNet0 + ekGelirAy(k), cash0: sc.cash0 });
    ms.netMaliyet = r2(sim.toplamOdeme - sc.cash0);
    mb.netMaliyet = base.toplamOdeme;
    return {
      baseline: { sim: base, m: mb }, scenario: { sim, m: ms, cash0: sc.cash0, uyari: sc.uyari, yeni: sc.yeni, kapananlar: sc.kapananlar, ekGelirAy },
      fark: { ay0: r2(ms.ay0 - mb.ay0), ort12: r2(ms.ort12 - mb.ort12), tepe: r2(ms.tepe - mb.tepe), maliyet: r2(ms.netMaliyet - mb.netMaliyet),
        ay: (ms.aySayisi || 0) - (mb.aySayisi || 0), acikAy: ms.acikAy - mb.acikAy },
    };
  }

  /** Kalem x ay matrisi: her borç kaleminin mevcut durumda ve simülasyonda ay ay ödemesi. */
  function kalemMatrix(baseDebts, cmp, N) {
    const bAy = cmp.baseline.sim.aylar, sAy = cmp.scenario.sim.aylar;
    const len = Math.min(N || 24, Math.max(bAy.length, sAy.length));
    const labels = {};
    baseDebts.forEach((d) => { labels[d.key] = { ad: d.ad, banka: d.banka }; });
    cmp.scenario.yeni.forEach((d) => { labels[d.key] = { ad: d.ad, banka: 'Yeni' }; });
    const keys = Object.keys(labels);
    const rows = keys.map((key) => {
      const base = [], sc = [];
      for (let k = 0; k < len; k++) { base.push((bAy[k] && bAy[k].kalem[key]) || 0); sc.push((sAy[k] && sAy[k].kalem[key]) || 0); }
      const tb = sum(bAy, (a) => a.kalem[key] || 0), ts = sum(sAy, (a) => a.kalem[key] || 0);
      let durum = 'ayni';
      if (key.startsWith('YENI-')) durum = 'yeni';
      else if (tb > 0.5 && ts < 0.5) durum = 'kapanir';
      else if (Math.abs(tb - ts) > 0.5 || base.some((v, i) => Math.abs(v - sc[i]) > 0.5)) durum = 'degisir';
      return { key, ad: labels[key].ad, banka: labels[key].banka, durum, base, sc, toplamBase: r2(tb), toplamSc: r2(ts) };
    });
    const sira = { kapanir: 0, yeni: 1, degisir: 2, ayni: 3 };
    rows.sort((a, b) => sira[a.durum] - sira[b.durum]);
    const aylar = [];
    for (let k = 0; k < len; k++) aylar.push({ ym: (bAy[k] || sAy[k]).ym, base: bAy[k] ? bAy[k].odeme : 0, sc: sAy[k] ? sAy[k].odeme : 0, balBase: bAy[k] ? bAy[k].kalan : 0, balSc: sAy[k] ? sAy[k].kalan : 0 });
    return { rows, aylar, len };
  }

  // ---------- Tek seferlik ödemeler ve erken borç kapatma ----------
  /** O ay nakitten çıkacak tek seferlik ödemeler (birikimden ödenenler hariç). */
  function oneOffMonthly(db, ym) {
    return r2(sum((db.tek_seferlik || []).filter((x) => x.ym === ym && !x.birikim), (x) => x.tutar));
  }
  const annuityPV = (P, n, r) => (r > 0 ? P * (1 - Math.pow(1 + r, -n)) / r : P * n);
  function findDebt(db, cat, pid, iid) {
    return items(db).find((x) => x.cat === cat && (x.parent ? x.parent.id : 0) === pid && x.item.id === iid) || null;
  }
  /** Bir borcu `ym` ayında kapatmanın bedeli: kalan taksitlerin o günkü değeri (gecikmişte işlemiş faiz dahil). */
  function payoffQuote(db, cat, pid, iid, ym, settings, now) {
    const e = findDebt(db, cat, pid, iid); if (!e) return null;
    const it = e.item, u = unpaid(it).filter((t) => t.ym >= ym);
    if (!u.length) return null;
    const nominal = sum(u, installmentBalance);
    let ana;
    if (it.gecikmis) ana = overdueInfo(it, now || new Date(), vergiFor(settings)).toplam;
    else ana = r2(annuityPV(nominal / u.length, u.length, monthlyRate(it.faiz_orani, vergiFor(settings, it.kredi_turu))));
    return { cat, pid, iid, banka: e.banka, ad: cat === 'KREDI' ? it.kredi_adi : it.aciklama, hesap: e.hesap, adet: u.length, aylik: r2(nominal / u.length), nominal, ana, faizKazanc: r2(Math.max(0, nominal - ana)), gecikmis: !!it.gecikmis,
      oran: r2(monthlyRate(it.faiz_orani, vergiFor(settings, it.kredi_turu)) * 100) };   // oran: vergili aylık faiz (%)
  }
  /**
   * Kapatma planı: "hangi ay hangi borcu kapatayım?" sorusunun cevabı.
   * Her ay cebinizde kalan para (gelir − gider − taksit) birikir; yeterli olunca en pahalı borç kapatılır.
   * Kapatılan borcun taksiti kalkınca sonraki aylarda daha çok para artar ve bir sonraki borca geçilir.
   * opt: { nakit: şu an elde duran para, tampon: her ay kenarda tutulacak para, masraf: kapatma masrafı %, ay: ufuk }
   */
  function payoffPlan(db, now, settings, opt) {
    opt = opt || {};
    const horizon = Math.min(120, Math.max(6, parseInt(opt.ay) || 48));
    const thisYm = ymOf(now);
    const w = JSON.parse(JSON.stringify(db));
    markCoverage(w, now);
    const nakit = Math.max(0, Number(opt.nakit) || 0), tampon = Math.max(0, Number(opt.tampon) || 0), masraf = Math.max(0, Number(opt.masraf) || 0);
    const seri = () => {
      const sc = summarize(w, now, settings), F = fixedSummary(w, now);
      return [r2(sc.gelir - F.toplam - sc.buAyToplam - sc.tekSeferlik)].concat(forecast(w, now, settings, horizon).map((r) => r.kalan));
    };
    // Faizi olmayan ya da kazancı ihmal edilebilir borçlar kapatılmaz: kendi vadesinde bitsin.
    // Son taksidi gelmiş (1 taksit kalmış) borç kapatma önerisi olmaz; gecikmişler hariç.
    const uygun = (q) => q.gecikmis || (q.adet >= 2 && q.faizKazanc >= Math.max(25, q.ana * 0.01));
    const oncelik = (a, b) => (b.gecikmis - a.gecikmis) || (b.oran - a.oran) || (a.ana - b.ana);
    const adimlar = [], acik = [];
    let havuz = nakit, bitti = false, ilkKalan = null, toplamBirikim = 0;
    for (let k = 0; k <= horizon; k++) {
      const ym = ymAdd(thisYm, k);
      for (let guard = 0; guard < 60; guard++) {
        const adaylar = closableDebts(w, ym, settings, now).filter(uygun).sort(oncelik);
        if (!adaylar.length) { bitti = true; break; }
        const q = adaylar[0];
        if (r2(q.ana * (1 + masraf / 100)) > havuz + 0.005) break;     // para yetmiyor: bu ay beklenir
        const rec = closeDebt(w, q.cat, q.pid, q.iid, { ym, masrafOran: masraf, birikim: true, settings, now });
        if (!rec) break;
        havuz = r2(havuz - rec.tutar);
        adimlar.push({ ym, k, cat: q.cat, pid: q.pid, iid: q.iid, banka: q.banka, ad: q.ad, odeme: rec.tutar, masraf: rec.masraf, faizKazanc: rec.faizKazanc, adet: rec.adet,
          aylik: rec.aylik, gecikmis: q.gecikmis, oran: q.oran, havuzKalan: havuz });
      }
      if (bitti) break;
      const kalan = seri()[k];
      if (ilkKalan === null) ilkKalan = kalan;
      toplamBirikim = r2(toplamBirikim + kalan - tampon);
      havuz = r2(havuz + kalan - tampon);
      if (havuz < 0) { acik.push({ ym, eksik: r2(-havuz) }); havuz = 0; }
    }
    const kalanlar = closableDebts(w, thisYm, settings, now).filter(uygun).sort(oncelik);
    const siradaki = kalanlar.length ? (() => { const q = kalanlar[0], gerek = r2(q.ana * (1 + masraf / 100)); return { ad: `${q.banka} · ${q.ad}`, gerek, eksik: r2(Math.max(0, gerek - havuz)), oran: q.oran }; })() : null;
    const ozet = {
      adet: adimlar.length, toplamOdeme: r2(sum(adimlar, (a) => a.odeme)), faizKazanc: r2(sum(adimlar, (a) => a.faizKazanc)),
      aylikRahatlama: r2(sum(adimlar, (a) => a.aylik)), taksit: sum(adimlar, (a) => a.adet),
      ilkYm: adimlar.length ? adimlar[0].ym : null, sonYm: adimlar.length ? adimlar[adimlar.length - 1].ym : null,
    };
    // İki yol: önerilen borçlar kapatılmazsa / kapatılırsa (aynı ufukta, aynı ölçülerle)
    const sonTaksitYm = (d) => items(d).reduce((mx, e) => (e.item.taksitler || []).reduce((m2, t) => (!t.odendi && t.ym > m2 ? t.ym : m2), mx), '0000-00');
    const dA = JSON.parse(JSON.stringify(db)); markCoverage(dA, now);
    const sonA = sonTaksitYm(dA), H = Math.min(120, Math.max(6, sonA > '0000-00' ? monthsBetween(thisYm, sonA) : 6));
    const odemeSeri = []; adimlar.forEach((a) => { if (a.k <= H) odemeSeri[a.k] = r2((odemeSeri[a.k] || 0) + a.odeme); });
    const yol = (d, odemeler) => {
      const sc = summarize(d, now, settings), F = fixedSummary(d, now), fc = forecast(d, now, settings, H);
      const kal = [r2(sc.gelir - F.toplam - sc.buAyToplam - sc.tekSeferlik)].concat(fc.map((r) => r.kalan));
      let kum = nakit; const aylar = kal.map((kv, i) => { kum = r2(kum + kv - (odemeler[i] || 0)); return { ym: ymAdd(thisYm, i), kalan: kv, odeme: odemeler[i] || 0, nakit: kum }; });
      const son = sonTaksitYm(d), toplamKapatma = r2(sum(odemeler.filter((x) => x), (x) => x));
      return { aylar, bitisYm: son > '0000-00' ? son : null, kalanBorc: sc.kalanBorc, faizKalan: costSummary(d, settings).total.faizKalan, ilkAyTaksit: fc.length ? fc[0].borc : 0, kapatmaOdemesi: toplamKapatma, toplamOdeme: r2(sc.kalanBorc + toplamKapatma), nakitSonu: kum };
    };
    const kiyas = { ay: H, kapatilmazsa: yol(dA, []), kapatilirsa: yol(w, odemeSeri) };
    return { kiyas, adimlar, ozet, siradaki, kalanAdet: kalanlar.length, acik, nakit, tampon, masraf, ufuk: horizon, ilkKalan: ilkKalan || 0, birikimToplam: toplamBirikim, havuzSon: havuz,
      hicParaYok: !adimlar.length && nakit <= 0.005 && toplamBirikim <= 0.005, bitti: !kalanlar.length };
  }
  // ---------- Asgari ödeme ve borç döndürme ("takla") ----------
  /** Aylık gelir / sabit gider / tek seferlik dizileri (0. eleman bu ay, i. eleman i ay sonrası). */
  function cashSeries(db, now, settings, n) {
    const sc = summarize(db, now, settings), F = fixedSummary(db, now), fc = forecast(db, now, settings, n);
    return { gelir: [sc.gelir].concat(fc.map((r) => r.gelir)), sabit: [F.toplam].concat(fc.map((r) => r.sabit)), tek: [sc.tekSeferlik || 0].concat(fc.map((r) => r.tek)) };
  }
  /**
   * Taksitleri kart / diğer diye ayırır. Kart taksitleri dönem borcuna girer (asgari ödenebilir);
   * kredi, KMH ve gecikmiş kalemler sabit taksittir, tam ödenmesi gerekir.
   */
  function dueParts(db, now, n, outstandingCards = false) {
    const thisYm = ymOf(now);
    const take = (h, i, ym) => sum((h.taksitler || []).filter((t) => !t.sigortaOder && !t.sigortaGecmis && !t.kapatildi && (i === 0 ? (t.ym <= thisYm && (!t.odendi || t.ym === thisYm)) : t.ym === ym)), (t) => t.tutar);
    const anaKalan = (h, ym) => {
      if (h.gecikmis) return (h.taksitler || []).some((t) => !t.odendi && !t.sigortaGecmis) ? Number(h.ana_para) || 0 : 0;
      const top = Number(h.toplam_geri_odeme) || sum(h.taksitler || [], (t) => t.tutar);
      return top > 0 ? (Number(h.ana_para) || 0) * Math.min(1, sum((h.taksitler || []).filter((t) => !t.odendi && !t.sigortaGecmis && t.ym > ym), (t) => t.tutar) / top) : 0;
    };
    const diger = Array(n + 1).fill(0);
    const kartlar = (db.kredi_kartlari || []).map((k) => {
      const c = { k, taksit: Array(n + 1).fill(0), kul: Array(n + 1).fill(0), last: -1 };
      for (let i = 0; i <= n; i++) {
        const ym = ymAdd(thisYm, i);
        (k.hareketler || []).forEach((h) => { if (h.gecikmis) { diger[i] += take(h, i, ym); } else if (outstandingCards) c.taksit[i] += sum(unpaid(h).filter((t) => !t.kapatildi && (i === 0 ? t.ym <= ym : t.ym === ym)), installmentBalance);
          else c.taksit[i] += take(h, i, ym);
          c.kul[i] += anaKalan(h, ym); });
        if (c.taksit[i] > 0.005) c.last = i;
      }
      return c;
    });
    for (let i = 0; i <= n; i++) {
      const ym = ymAdd(thisYm, i);
      (db.kmh_hesaplar || []).forEach((h) => (h.hareketler || []).forEach((x) => { diger[i] += take(x, i, ym); }));
      (db.krediler || []).forEach((x) => { diger[i] += take(x, i, ym); });
    }
    return { kartlar, diger: diger.map(r2) };
  }
  /**
   * Yalnızca asgari ödenirse: her kart için dönem borcu = o ayın taksitleri + devreden borç;
   * asgari = dönem borcu x oran; kalan, akdi faizle bir sonraki döneme devreder. Kredi/KMH taksitleri tam ödenir.
   */
  function minPayPlan(db, now, settings, n) {
    n = Math.min(120, Math.max(6, parseInt(n) || 36));
    const thisYm = ymOf(now), cs = cashSeries(db, now, settings, n), parts = dueParts(db, now, n, true);
    const st = parts.kartlar.map((c) => ({ c, oran: minPaymentRate(c.k.limit, settings), r: monthlyRate(c.k.faiz_orani, vergiFor(settings)), carry: 0, faiz: 0, odeme: 0, bitis: null, pik: 0, ilk: null, ilkYuk: 0 }));
    const aylar = [];
    for (let i = 0; i <= n; i++) {
      const ym = ymAdd(thisYm, i);
      let kartAsgari = 0, kartTam = 0, devir = 0;
      st.forEach((s) => {
        const tak = s.c.taksit[i], S = tak + s.carry;
        const firstMinimum = i === 0 && tak > 0.005 ? cardPayPreview(s.c.k, ym, 0, settings).asgari : null;
        const asg = firstMinimum ?? (S > 0.005 ? r2(S * s.oran) : 0);
        const kalan = S - asg, f = kalan * s.r;
        s.carry = kalan + f < 1 ? 0 : r2(kalan + f); s.faiz += f; s.odeme += asg; s.pik = Math.max(s.pik, s.carry);
        if (s.ilk === null && S > 0.005) { s.ilk = asg; s.ilkYuk = S; }
        if (s.bitis === null && i >= s.c.last && s.carry < 1) s.bitis = i;
        kartAsgari += asg; kartTam += tak; devir += s.carry;
      });
      const diger = parts.diger[i], toplam = r2(kartAsgari + diger), tam = r2(kartTam + diger);
      aylar.push({ ym, i, gelir: cs.gelir[i], sabit: cs.sabit[i], tek: cs.tek[i], kartAsgari: r2(kartAsgari), diger, toplam, tam, devir: r2(devir),
        kalan: r2(cs.gelir[i] - cs.sabit[i] - toplam - cs.tek[i]), kalanTam: r2(cs.gelir[i] - cs.sabit[i] - tam - cs.tek[i]) });
    }
    const ilk = (key) => { const m = aylar.find((a) => a[key] < -0.005); return m ? { ym: m.ym, i: m.i, eksik: r2(-m[key]) } : null; };
    const kartlar = st.map((s) => ({ id: s.c.k.id, ad: `${s.c.k.banka} · ${s.c.k.kart_adi}`, limit: s.c.k.limit, oran: s.oran, faizAylik: s.r * 100, ilkAsgari: r2(s.ilk || 0), donemBorcu: r2(s.ilkYuk),
      bitisAy: s.bitis, bitisYm: s.bitis == null ? null : ymAdd(thisYm, s.bitis), toplamFaiz: r2(s.faiz), toplamOdeme: r2(s.odeme), pik: r2(s.pik), kalanDevir: r2(s.carry), taksitVar: s.c.last >= 0 }));
    return { n, aylar, kartlar, ilkAcik: ilk('kalan'), ilkAcikTam: ilk('kalanTam'), toplamFaiz: r2(sum(kartlar, (k) => k.toplamFaiz)) };
  }
  /**
   * Borç döndürme ("takla"): her ay asgariyi öde, gelirin yetmediği kısmı kartların nakit avansından çek,
   * artan para olursa önce avansı kapat. Döner mi: avans limitleri bitmeden borçlar sonlanıyor mu?
   * opt: { avansFaiz: aylık %, avansOran: nakit avans limiti (kart limitinin %'si), fazlaOde }
   */
  function rolloverSim(db, now, settings, opt) {
    opt = opt || {};
    const H = 120, thisYm = ymOf(now), cs = cashSeries(db, now, settings, H), parts = dueParts(db, now, H);
    const avFaiz = Number(opt.avansFaiz) > 0 ? Number(opt.avansFaiz) : 4.25;
    const avOran = Math.min(100, Math.max(0, opt.avansOran === '' || opt.avansOran == null || !Number.isFinite(Number(opt.avansOran)) ? 25 : Number(opt.avansOran))) / 100;
    const rAv = monthlyRate(avFaiz, vergiFor(settings));
    const st = parts.kartlar.map((c) => ({ c, limit: Number(c.k.limit) || 0, oran: minPaymentRate(c.k.limit, settings), r: monthlyRate(c.k.faiz_orani, vergiFor(settings)), carry: 0, avans: 0 }));
    const lastTak = Math.max(-1, ...st.map((s) => s.c.last), ...parts.diger.map((v, i) => (v > 0.005 ? i : -1)));
    const rows = []; let kirilma = null, toplamAvans = 0, toplamFaiz = 0, ilkAvansYm = null, pik = 0, bitisYm = null;
    const limToplam = sum(st, (s) => s.limit);
    for (let i = 0; i <= H; i++) {
      const ym = ymAdd(thisYm, i);
      let odeme = 0;
      st.forEach((s) => {
        const S = s.c.taksit[i] + s.carry, asg = S > 0.005 ? S * s.oran : 0;
        s.avans = S > 0.005 ? Math.max(0, s.avans - asg * (s.avans / S)) : 0;
        s.carry = S - asg; odeme += asg;
      });
      const net = cs.gelir[i] - cs.sabit[i] - cs.tek[i] - parts.diger[i] - odeme;
      let cekilen = 0, kirildi = false;
      if (net < -0.005) {
        let need = -net;
        st.map((s) => ({ s, room: Math.max(0, Math.min(avOran * s.limit - s.avans, s.limit - s.c.kul[i] - s.carry)) })).sort((a, b) => b.room - a.room)
          .forEach((x) => { const d = Math.min(x.room, need); if (d > 0) { x.s.carry += d; x.s.avans += d; need -= d; cekilen += d; } });
        if (need > 0.5) { kirilma = { ym, i, eksik: r2(need) }; kirildi = true; }
      } else if (net > 0.005 && opt.fazlaOde !== false) {
        let x = net;
        [(s) => s.avans, (s) => s.carry].forEach((pick, pass) => st.forEach((s) => { const d = Math.min(x, pick(s)); if (d > 0) { s.carry -= d; if (pass === 0) s.avans -= d; else s.avans = Math.min(s.avans, s.carry); x -= d; } }));
      }
      if (cekilen > 0.005 && ilkAvansYm === null) ilkAvansYm = ym;
      toplamAvans += cekilen;
      st.forEach((s) => { const f = Math.max(0, s.carry - s.avans) * s.r + s.avans * rAv; s.carry += f; toplamFaiz += f; if (s.carry < 1) { s.carry = 0; s.avans = 0; } });
      const kartBorcu = sum(st, (s) => s.carry), avansBakiye = sum(st, (s) => s.avans), kul = sum(st, (s) => s.c.kul[i] + s.carry);
      pik = Math.max(pik, kartBorcu);
      rows.push({ ym, i, gelir: cs.gelir[i], sabit: cs.sabit[i], diger: parts.diger[i], asgari: r2(odeme), net: r2(net), cekilen: r2(cekilen), avansBakiye: r2(avansBakiye), kartBorcu: r2(kartBorcu), doluluk: limToplam > 0 ? kul / limToplam : 0, kirildi });
      if (kirildi) break;
      if (i >= lastTak && kartBorcu < 1) { bitisYm = ym; break; }
    }
    const durum = kirilma ? 'donmez' : toplamAvans < 0.5 ? 'gerekmez' : bitisYm ? 'doner_biter' : 'devam';
    return { durum, kirilma, toplamAvans: r2(toplamAvans), toplamFaiz: r2(toplamFaiz), pik: r2(pik), ilkAvansYm, bitisYm, ay: rows.length, rows, avFaiz, avOran: avOran * 100, kartAdet: st.length };
  }
  /** Kapatılabilir tüm borçlar ve bedelleri (sihirbaz listesi). */
  function closableDebts(db, ym, settings, now) {
    const out = [];
    items(db).forEach((e) => { const q = payoffQuote(db, e.cat, e.parent ? e.parent.id : 0, e.item.id, ym, settings, now); if (q) out.push(q); });
    return out.sort((a, b) => b.ana - a.ana);
  }
  /** Borcu kapatır: ym ve sonrasındaki taksitler silinir, bedel tek seferlik ödeme olarak kaydedilir. */
  function closeDebt(db, cat, pid, iid, o) {
    const q = payoffQuote(db, cat, pid, iid, o.ym, o.settings, o.now); if (!q) return null;
    const ana = Number(o.tutar) > 0 ? r2(Number(o.tutar)) : q.ana;
    const masraf = r2(ana * (Number(o.masrafOran) || 0) / 100);
    db.tek_seferlik = db.tek_seferlik || [];
    const id = db.tek_seferlik.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    findDebt(db, cat, pid, iid).item.taksitler.forEach((t) => {
      if (!t.odendi && !t.sigortaOder && !t.sigortaGecmis && t.ym >= o.ym) { t.odendi = true; t.kapatildi = true; t.kapatmaId = id; }
    });
    const rec = { id, tur: 'kapatma', ad: `${q.banka} · ${q.ad} kapatma`, ym: o.ym, tutar: r2(ana + masraf), ana, masraf, birikim: !!o.birikim, ref: { cat, pid, iid },
      adet: q.adet, aylik: q.aylik, nominal: q.nominal, faizKazanc: r2(Math.max(0, q.nominal - ana)) };
    db.tek_seferlik.push(rec);
    return rec;
  }
  function reopenDebt(db, id) {
    items(db).forEach((e) => (e.item.taksitler || []).forEach((t) => { if (t.kapatmaId === id) { t.odendi = false; delete t.kapatildi; delete t.kapatmaId; } }));
    db.tek_seferlik = (db.tek_seferlik || []).filter((x) => x.id !== id);
  }

  // ---------- Simülasyon: yapılan değişiklikler ve etki raporu ----------
  const sameNum = (a, b) => Math.abs((Number(a) || 0) - (Number(b) || 0)) < 0.005;
  const paidCount = (it) => (it.taksitler || []).filter((t) => t.odendi && !t.kapatildi).length;
  const fmtOpt = (v) => (v == null || v === '' ? '—' : v);
  const ymFmt = (v) => (v ? fmtYM(v) : 'hemen');
  function itemLine(it) {
    const n = it.toplam_taksit || 1;
    const aylik = r2((it.toplam_geri_odeme || it.ana_para || 0) / n);
    return `${fmtMoney(it.ana_para)} · ${n} taksit × ${fmtMoney(aylik)}${Number(it.faiz_orani) > 0 ? ` · aylık faiz %${pc(it.faiz_orani)}` : ''}${it.ilk_taksit_ym ? ` · ilk ödeme ${fmtYM(it.ilk_taksit_ym)}` : ''}`;
  }
  function coverageLine(k) {
    return k ? `${fmtYM(k.ilk_ym)} – ${fmtYM(ymAdd(k.ilk_ym, k.ay - 1))} taksitleri sigorta öder (${k.ay} ay)` : 'yok';
  }
  /** İki veri kopyası arasındaki farkları okunur biçimde listeler: [{tur, kat, baslik, ayrinti[]}] */
  function diffDb(a, b) {
    const out = [];
    const push = (tur, kat, baslik, ayrinti) => out.push({ tur, kat, baslik, ayrinti: ayrinti || [] });
    const idmap = (arr) => new Map((arr || []).map((x) => [x.id, x]));
    const fd = (x, y, fields) => {
      const det = [];
      fields.forEach(([key, label, f]) => {
        const same = typeof x[key] === 'number' || typeof y[key] === 'number' ? sameNum(x[key], y[key]) : (x[key] ?? '') === (y[key] ?? '');
        if (!same) det.push(`${label}: ${(f || fmtOpt)(x[key])} → ${(f || fmtOpt)(y[key])}`);
      });
      return det;
    };
    const cmp = (A, B, kat, nameFn, addFn, fields, extra) => {
      const ma = idmap(A), mb = idmap(B);
      mb.forEach((y, id) => { if (!ma.has(id)) push('ekle', kat, nameFn(y), addFn(y)); });
      ma.forEach((x, id) => { if (!mb.has(id)) push('sil', kat, nameFn(x), []); });
      mb.forEach((y, id) => {
        const x = ma.get(id); if (!x) return;
        const det = fd(x, y, fields).concat(extra ? extra(x, y) : []);
        if (det.length) push('degis', kat, nameFn(y), det);
      });
    };
    const paidDelta = (x, y) => { const d = paidCount(y) - paidCount(x); return d ? [`${Math.abs(d)} taksit ${d > 0 ? 'ödendi' : 'ödenmedi'} olarak işaretlendi`] : []; };
    const covDelta = (x, y) => (JSON.stringify(x.sigorta_kapsam || null) !== JSON.stringify(y.sigorta_kapsam || null) ? [`Sigorta kapsamı: ${coverageLine(x.sigorta_kapsam)} → ${coverageLine(y.sigorta_kapsam)}`] : []);
    const startPeriod = (g) => {
      if (!g.baslangic_ym) return g.sure > 0 ? `hemen başlar, ${g.sure} ay` : 'hemen başlar, sürekli';
      return g.sure > 0 ? `${fmtYM(g.baslangic_ym)} itibarıyla ${g.sure} ay` : `${fmtYM(g.baslangic_ym)} itibarıyla sürekli`;
    };
    // Gelir ve giderler
    cmp(a.ek_gelirler, b.ek_gelirler, 'Gelir', (g) => g.aciklama,
      (g) => [`Aylık ${fmtMoney(g.tutar)}`, startPeriod(g)],
      [['tutar', 'Aylık tutar', fmtMoney], ['baslangic_ym', 'Başlangıç', ymFmt], ['sure', 'Süre (ay)']]);
    cmp(a.sabit_giderler, b.sabit_giderler, 'Gider', (g) => `${g.ad} (${g.kategori})`,
      (g) => [`Aylık ${fmtMoney(g.tutar)}${g.gun ? `, ayın ${g.gun}. günü` : ''}`, `${startPeriod(g)}${g.kalan != null && g.kalan !== '' ? ` · kalan borç ${fmtMoney(g.kalan)}` : ''}`],
      [['tutar', 'Aylık tutar', fmtMoney], ['gun', 'Ödeme günü'], ['kategori', 'Kategori'], ['baslangic_ym', 'Başlangıç', ymFmt], ['sure', 'Süre (ay)'], ['kalan', 'Kalan borç', fmtMoney]]);
    // Krediler
    const kFields = [['ana_para', 'Çekilen tutar', fmtMoney], ['faiz_orani', 'Aylık faiz (%)'], ['toplam_taksit', 'Taksit sayısı'], ['toplam_geri_odeme', 'Toplam geri ödeme', fmtMoney], ['ilk_taksit_ym', 'İlk taksit', ymFmt]];
    cmp(a.krediler, b.krediler, 'Kredi', (k) => `${k.banka} · ${k.kredi_adi}`, (k) => [itemLine(k)], kFields, (x, y) => paidDelta(x, y).concat(covDelta(x, y)));
    // Kartlar ve KMH: hesap + harcamalar
    const accs = (A, B, kat, nameFn, fields) => {
      cmp(A, B, kat, nameFn, (c) => [`Limit ${fmtMoney(c.limit)} · aylık faiz %${pc(c.faiz_orani)}${(c.hareketler || []).length ? ` · ${c.hareketler.length} kayıt` : ''}`], fields, covDelta);
      const ma = idmap(A);
      (B || []).forEach((y) => {
        const x = ma.get(y.id); if (!x) return;
        cmp(x.hareketler, y.hareketler, 'Harcama', (h) => `${nameFn(y)} › ${h.aciklama}`, (h) => [itemLine(h)],
          [['ana_para', 'Tutar', fmtMoney], ['toplam_taksit', 'Taksit sayısı'], ['faiz_orani', 'Aylık faiz (%)'], ['toplam_geri_odeme', 'Toplam geri ödeme', fmtMoney], ['ilk_taksit_ym', 'İlk ödeme', ymFmt]], paidDelta);
      });
    };
    accs(a.kredi_kartlari, b.kredi_kartlari, 'Kart', (c) => `${c.banka} · ${c.kart_adi}`, [['limit', 'Limit', fmtMoney], ['faiz_orani', 'Aylık faiz (%)'], ['kesim_gunu', 'Kesim günü'], ['son_odeme_gunu', 'Son ödeme günü']]);
    accs(a.kmh_hesaplar, b.kmh_hesaplar, 'KMH', (c) => `${c.banka} · ${c.hesap_adi}`, [['limit', 'Limit', fmtMoney], ['faiz_orani', 'Aylık faiz (%)'], ['hesap_kesim_gunu', 'Kesim günü']]);
    // Tek seferlik ödemeler / borç kapatma
    cmp(a.tek_seferlik, b.tek_seferlik, 'Borç kapatma', (x) => x.ad,
      (x) => [`${fmtMoney(x.tutar)} · ${fmtYM(x.ym)}${x.birikim ? ' · birikimden ödenir' : ''}`,
        ...(x.tur === 'kapatma' ? [`${x.adet} taksit kapanır (aylık ${fmtMoney(x.aylik)} rahatlama), ${fmtMoney(x.faizKazanc)} faiz kazancı${x.masraf > 0 ? `, ${fmtMoney(x.masraf)} kapatma masrafı` : ''}`] : [])],
      [['tutar', 'Ödeme', fmtMoney], ['ym', 'Ay', ymFmt]]);
    // Ayarlar
    const AYAR_ETIKET = {
      vergi_carpani: 'Vergi çarpanı (KKDF + BSMV)',
      vergi_carpani_konut: 'Konut kredisi vergi çarpanı',
      asgari_limit_esigi: 'Asgari ödeme limit eşiği',
      asgari_oran_alt: 'Alt limit asgari oranı (%)',
      asgari_oran_ust: 'Üst limit asgari oranı (%)',
      aylik_yasam_gideri: 'Aylık yaşam gideri',
      aylik_borc_butcesi: 'Aylık borç bütçesi',
      ihtiyac_kredisi: 'İhtiyaç kredisi faizi (%)',
      konut_kredisi: 'Konut kredisi faizi (%)',
      tasit_kredisi: 'Taşıt kredisi faizi (%)',
      nakit_kmh: 'Nakit avans / KMH faizi (%)',
      kart_akdi: 'Kart akdi faizi (%)',
      kart_gecikme: 'Kart gecikme faizi (%)',
      kart_30bin_alti: 'Kart faizi (30 bin altı, %)',
      kart_30_180bin: 'Kart faizi (30-180 bin, %)',
      kart_180bin_ustu: 'Kart faizi (180 bin üstü, %)',
    };
    const ayarLabel = (k) => AYAR_ETIKET[k] || k.replace(/_/g, ' ');
    const sa = a.ayarlar || {}, sb2 = b.ayarlar || {}, setDet = [];
    Object.keys(Object.assign({}, sa, sb2)).forEach((k) => {
      if (k === 'elle_oranlar') { Object.keys(Object.assign({}, sa[k], sb2[k])).forEach((q) => { if (!sameNum((sa[k] || {})[q], (sb2[k] || {})[q])) setDet.push(`${ayarLabel(q)}: ${fmtOpt((sa[k] || {})[q])} → ${fmtOpt((sb2[k] || {})[q])}`); }); }
      else if (!sameNum(sa[k], sb2[k]) && typeof (sb2[k] ?? sa[k]) === 'number') setDet.push(`${ayarLabel(k)}: ${fmtOpt(sa[k])} → ${fmtOpt(sb2[k])}`);
    });
    if (setDet.length) push('degis', 'Ayar', 'Hesaplama ayarları', setDet);
    return out;
  }

  const accountUsed = (acc) => r2(sum(acc.hareketler || [], (h) => remainingPrincipal(h)));

  /**
   * Simülasyon raporu: gerçek veri (base) ile simülasyon verisi (cur) aynı ölçülerle karşılaştırılır.
   * Dönüş: {changes, metrics, months, ayrisim, verdict, warnings, genel}
   */
  function simulationReport(base, cur, now, settings, opt) {
    const thisYm = ymOf(now);
    // Ufuk: verilmezse son taksit bitene kadar (en az 3, en çok 120 ay)
    const lastYm = (d) => items(d).reduce((mx, e) => (e.item.taksitler || []).reduce((m2, t) => (!t.odendi && t.ym > m2 ? t.ym : m2), mx), '0000-00');
    let N = opt && opt.ay;
    if (!N) { const mx = [lastYm(base), lastYm(cur)].sort().pop(); N = mx > '0000-00' ? Math.min(120, Math.max(3, monthsBetween(thisYm, mx))) : 12; }
    const changes = diffDb(base, cur);
    const sb = summarize(base, now, settings), sc = summarize(cur, now, settings);
    const Fb = fixedSummary(base, now), Fc = fixedSummary(cur, now);
    const kb = r2(sb.gelir - Fb.toplam - sb.buAyToplam - sb.tekSeferlik), kc = r2(sc.gelir - Fc.toplam - sc.buAyToplam - sc.tekSeferlik);
    const fb = forecast(base, now, settings, N), fc = forecast(cur, now, settings, N);
    const cb = costSummary(base, settings).total, cc = costSummary(cur, settings).total;
    const months = [{ ym: thisYm, bu: true, gelirOnce: sb.gelir, gelirSonra: sc.gelir, giderOnce: Fb.toplam, giderSonra: Fc.toplam, borcOnce: sb.buAyToplam, borcSonra: sc.buAyToplam, tekOnce: sb.tekSeferlik, tekSonra: sc.tekSeferlik, once: kb, sonra: kc }]
      .concat(fb.map((r, i) => ({ ym: r.ym, gelirOnce: r.gelir, gelirSonra: fc[i].gelir, giderOnce: r.sabit, giderSonra: fc[i].sabit, borcOnce: r.borc, borcSonra: fc[i].borc, tekOnce: r.tek, tekSonra: fc[i].tek, once: r.kalan, sonra: fc[i].kalan })));
    months.forEach((m) => { m.fark = r2(m.sonra - m.once); });
    // kümülatif fark
    let cum = 0;
    months.forEach((m) => { cum = r2(cum + m.fark); m.kum = cum; });
    const ayrisim = {
      gelir: r2(sum(months, (m) => m.gelirSonra - m.gelirOnce)), gider: r2(-sum(months, (m) => m.giderSonra - m.giderOnce)),
      borc: r2(-sum(months, (m) => m.borcSonra - m.borcOnce)), tek: r2(-sum(months, (m) => m.tekSonra - m.tekOnce)), net: r2(sum(months, (m) => m.fark)),
    };
    // Sade özet: değişikliğin getirdiği ek taksit / gelir / gider ve cebe net etkisi (aylık)
    const seri = (f) => {
      const nz = months.map((m) => ({ ym: m.ym, v: r2(f(m)) })).filter((x) => Math.abs(x.v) > 0.5);
      if (!nz.length) return null;
      const toplam = r2(sum(nz, (x) => x.v)), sabit = nz.every((x) => Math.abs(x.v - nz[0].v) < 1);
      return { ilk: nz[0].ym, son: nz[nz.length - 1].ym, ay: nz.length, deger: sabit ? nz[0].v : r2(toplam / nz.length), sabit, toplam,
        kesik: nz[nz.length - 1].ym === months[months.length - 1].ym };
    };
    // Aynı farkın sürdüğü dönemler: "Aralık-Mart ayda −50.000, Nisan'dan sonra ayda −14.000"
    const fazlar = [];
    months.forEach((m) => {
      if (Math.abs(m.fark) < 0.5 && !fazlar.length) return;
      const son = fazlar[fazlar.length - 1];
      if (son && Math.abs(son.deger - m.fark) < 1) { son.son = m.ym; son.ay++; } else fazlar.push({ ilk: m.ym, son: m.ym, ay: 1, deger: m.fark });
    });
    const enAgir = months.reduce((a, b) => (b.fark < a.fark ? b : a), months[0]);
    const eskiIds = new Set((base.tek_seferlik || []).map((x) => x.id));
    const yeniKap = (cur.tek_seferlik || []).filter((x) => x.tur === 'kapatma' && !eskiIds.has(x.id));
    const kapatma = yeniKap.length ? {
      adet: yeniKap.length, taksit: sum(yeniKap, (x) => x.adet), toplamOdeme: r2(sum(yeniKap, (x) => x.tutar)), birikim: r2(sum(yeniKap.filter((x) => x.birikim), (x) => x.tutar)),
      aylikKurtulan: r2(sum(yeniKap, (x) => x.aylik)), faizKazanc: r2(sum(yeniKap, (x) => x.faizKazanc)), masraf: r2(sum(yeniKap, (x) => x.masraf || 0)), ilkYm: yeniKap.map((x) => x.ym).sort()[0],
    } : null;
    const ozet = {
      kapatma, taksit: seri((m) => m.borcSonra - m.borcOnce), gelir: seri((m) => m.gelirSonra - m.gelirOnce), gider: seri((m) => m.giderSonra - m.giderOnce),
      fazlar, ortNet: r2(ayrisim.net / months.length), toplamNet: ayrisim.net, enAgir: enAgir.fark < -0.5 ? { ym: enAgir.ym, fark: enAgir.fark } : null,
      kalanOnce: r2(sum(months, (m) => m.once) / months.length), kalanSonra: r2(sum(months, (m) => m.sonra) / months.length),
    };
    const fut = months.slice(1);
    const avgBorc = (rows, key) => r2(sum(rows, (m) => m[key]) / Math.max(1, rows.length));
    const endYm = (s) => (s.months.length ? s.months[s.months.length - 1].ym : null);
    const eb = endYm(sb), ec = endYm(sc);
    const endDiff = eb && ec ? monthsBetween(eb, ec) : (ec ? 1 : eb ? -1 : 0);
    const mk = (id, ad, once, sonra, yon, tur) => {
      const fark = tur === 'metin' ? 0 : r2(sonra - once);
      return { id, ad, once, sonra, fark, yon, tur: tur || 'para', iyi: Math.abs(fark) < 0.005 ? null : (fark > 0) === (yon > 0) };
    };
    const metrics = [
      mk('gelir', 'Aylık gelir (bu ay)', sb.gelir, sc.gelir, 1),
      mk('gider', 'Sabit giderler (bu ay)', Fb.toplam, Fc.toplam, -1),
      mk('borc0', 'Bu ayki borç ödemesi', sb.buAyToplam, sc.buAyToplam, -1),
      mk('kalan0', 'Bu ay sonu kalan', kb, kc, 1),
      mk('ort', `Gelecek ${N} ay ort. borç ödemesi`, avgBorc(fut, 'borcOnce'), avgBorc(fut, 'borcSonra'), -1),
      mk('tepe', 'En yüksek aylık borç ödemesi', Math.max(0, ...months.map((m) => m.borcOnce)), Math.max(0, ...months.map((m) => m.borcSonra)), -1),
      mk('nakit', `Gelecek ${N} ay toplam nakit akışı`, r2(sum(fut, (m) => m.once)), r2(sum(fut, (m) => m.sonra)), 1),
      mk('enkotu', 'En kötü ayın kalanı', Math.min(...months.map((m) => m.once)), Math.min(...months.map((m) => m.sonra)), 1),
      mk('acik', `Bütçe açığı veren ay (${N + 1} ay)`, months.filter((m) => m.once < 0).length, months.filter((m) => m.sonra < 0).length, -1, 'sayi'),
      mk('borcTop', 'Toplam kalan borç', sb.kalanBorc, sc.kalanBorc, -1),
      mk('faiz', 'Toplam faiz yükü', cb.faizToplam, cc.faizToplam, -1),
      mk('faizKalan', 'Bundan sonra ödenecek faiz', cb.faizKalan, cc.faizKalan, -1),
      Object.assign(mk('bitis', 'Borçların bitişi', endDiff, 0, -1, 'metin'), { once: eb ? fmtYM(eb) : 'borç yok', sonra: ec ? fmtYM(ec) : 'borç yok', fark: endDiff, iyi: endDiff === 0 ? null : endDiff < 0 }),
    ];
    // Kart ve KMH limit kullanımı
    const limits = [];
    const lim = (A, B, kat, ad) => (B || []).forEach((y) => {
      const x = (A || []).find((q) => q.id === y.id), once = x ? accountUsed(x) : 0, sonra = accountUsed(y);
      if (Math.abs(sonra - once) > 0.5) limits.push({ ad: ad(y), kat, limit: y.limit, once, sonra, asildi: sonra > y.limit + 0.005, oran: y.limit > 0 ? sonra / y.limit : 0 });
    });
    lim(base.kredi_kartlari, cur.kredi_kartlari, 'Kart', (c) => `${c.banka} · ${c.kart_adi}`);
    lim(base.kmh_hesaplar, cur.kmh_hesaplar, 'KMH', (c) => `${c.banka} · ${c.hesap_adi}`);
    // Hüküm cümleleri
    const verdict = [], warnings = [];
    const pm = (v, art, azal) => `${fmtMoney(Math.abs(v))} ${v < 0 ? azal : art}`;
    const M_ = (id) => metrics.find((x) => x.id === id);
    if (changes.length) {
      const nk = M_('nakit');
      verdict.push({ iyi: nk.iyi, t: `Gelecek ${N} ayda toplam nakit akışınız ${pm(nk.fark, 'artar', 'azalır')}.` });
      const o = M_('ort');
      if (o.iyi !== null) verdict.push({ iyi: o.iyi, t: `Aylık borç ödemeniz ortalama ${pm(o.fark, 'artar', 'azalır')} (${fmtMoney(o.once)} → ${fmtMoney(o.sonra)}).` });
      const f = M_('faiz');
      if (f.iyi !== null) verdict.push({ iyi: f.iyi, t: `Toplam faiz yükünüz ${pm(f.fark, 'artar', 'azalır')}; bundan sonra ödenecek faiz ${pm(M_('faizKalan').fark, 'artar', 'azalır')}.` });
      const bt = M_('bitis');
      if (bt.iyi !== null) verdict.push({ iyi: bt.iyi, t: `Borçlarınız ${Math.abs(endDiff)} ay ${endDiff > 0 ? 'daha geç' : 'daha erken'} biter (${bt.once} → ${bt.sonra}).` });
      const ac = M_('acik');
      if (ac.iyi !== null) verdict.push({ iyi: ac.iyi, t: `Bütçenin yetmediği ay sayısı ${ac.once} → ${ac.sonra}.` });
      const ek = M_('enkotu');
      if (ek.iyi !== null) verdict.push({ iyi: ek.iyi, t: `En kötü ayınızdaki kalan ${fmtMoney(ek.once)} → ${fmtMoney(ek.sonra)}.` });
      if (kapatma) verdict.push({ iyi: kapatma.faizKazanc - kapatma.masraf > 0, t: `Borç kapatma: ${fmtMoney(kapatma.toplamOdeme)} tek seferlik ödeyip ${kapatma.taksit} taksitten kurtulursunuz (aylık ${fmtMoney(kapatma.aylikKurtulan)} rahatlama); ${fmtMoney(kapatma.faizKazanc)} faiz kazanırsınız${kapatma.masraf > 0 ? `, ${fmtMoney(kapatma.masraf)} kapatma masrafı ödersiniz` : ''}${kapatma.birikim > 0 ? `. ${fmtMoney(kapatma.birikim)} birikimden çıkar` : ''}.` });
      const pos = months.find((m, i) => i > 0 && m.kum >= 0 && months.slice(0, i).some((q) => q.kum < -0.5));
      const minKum = Math.min(...months.map((m) => m.kum));
      if (pos) verdict.push({ iyi: true, t: `Maliyet ${fmtYM(pos.ym)} ayında telafi edilir (kümülatif fark artıya geçer).` });
      else if (minKum < -0.5) verdict.push({ iyi: false, t: `Başlangıçtaki ${fmtMoney(-minKum)} nakit kaybı ${N + 1} ay içinde telafi edilmiyor.` });
    }
    limits.filter((l) => l.asildi).forEach((l) => warnings.push(`${l.ad}: limit aşılıyor (${fmtMoney(l.sonra)} / ${fmtMoney(l.limit)}). Bu harcama bankada reddedilebilir.`));
    limits.filter((l) => !l.asildi && l.oran > 0.9).forEach((l) => warnings.push(`${l.ad}: limit %${Math.round(l.oran * 100)} dolacak; kalan limit ${fmtMoney(l.limit - l.sonra)}.`));
    const yeniAcik = months.filter((m) => m.sonra < 0 && m.once >= 0).map((m) => fmtYM(m.ym));
    if (yeniAcik.length) warnings.push(`Şu aylarda yeni nakit açığı oluşur: ${yeniAcik.slice(0, 4).join(', ')}${yeniAcik.length > 4 ? ` (+${yeniAcik.length - 4})` : ''}.`);
    if (sc.gecikmis > sb.gecikmis + 0.5) warnings.push(`Gecikmiş ödeme tutarı ${fmtMoney(sb.gecikmis)} → ${fmtMoney(sc.gecikmis)}.`);
    const iyi = metrics.filter((m) => ['nakit', 'ort', 'faiz', 'acik', 'enkotu', 'bitis'].includes(m.id) && m.iyi === true).length;
    const kotu = metrics.filter((m) => ['nakit', 'ort', 'faiz', 'acik', 'enkotu', 'bitis'].includes(m.id) && m.iyi === false).length;
    const genel = !changes.length ? 'yok' : iyi > 0 && kotu === 0 ? 'olumlu' : kotu > 0 && iyi === 0 ? 'olumsuz' : iyi === 0 && kotu === 0 ? 'nötr' : 'karisik';
    return { changes, metrics, months, ayrisim, ozet, limits, verdict, warnings, genel, ay: N, kapatmalar: yeniKap };
  }

  /**
   * Vadesi geçmiş ama ödenmemiş normal taksitler için tahmini gecikme faizi.
   * Kart/KMH: TCMB azami gecikme oranı; kredi: akdi faiz x 1,5; hepsi vergi çarpanıyla.
   */
  function overdueInterestEstimate(db, now, settings, rates) {
    const today = isoOf(now), kalemler = [];
    let toplam = 0, gunluk = 0;
    items(db).forEach((e) => {
      if (e.item.gecikmis) return;                       // gecikmiş borç kalemleri kendi faizini zaten taşır
      unpaid(e.item).forEach((t) => {
        if (t.vade_tarihi >= today) return;
        const gun = daysBetween(t.vade_tarihi, today), akdi = Number(e.item.faiz_orani) || 0;
        let aylik;
        if (e.cat === 'KMH') aylik = rates && rates.nakit_kmh ? rates.nakit_kmh.gecikme : akdi * 1.1;
        else if (e.cat === 'KART') aylik = rates ? (t.tutar < 30000 ? rates.kart_30bin_alti : t.tutar < 180000 ? rates.kart_30_180bin : rates.kart_180bin_ustu).gecikme : akdi * 1.1;
        else aylik = akdi * 1.5;
        const g = t.tutar * monthlyRate(aylik, vergiFor(settings, e.item.kredi_turu)) / 30;
        toplam += g * gun; gunluk += g;
        kalemler.push({ ad: `${e.banka} · ${e.cat === 'KREDI' ? e.item.kredi_adi : e.item.aciklama}`, gun, faiz: r2(g * gun), gunluk: r2(g), tutar: t.tutar });
      });
    });
    kalemler.sort((a, b) => b.gunluk - a.gunluk);
    return { toplam: r2(toplam), gunluk: r2(gunluk), kalemler };
  }

  // ---------- Öneriler ----------
  function tcmbCap(rates, e) {
    if (!rates) return null;
    if (e.cat === 'KMH' || (e.cat === 'KART' && /Nakit/.test(e.item.tur || ''))) return rates.nakit_kmh ? rates.nakit_kmh.akdi : null;
    if (e.cat === 'KART') return rates.kart_180bin_ustu ? rates.kart_180bin_ustu.akdi : null;
    return null;
  }

  /** Kural tabanlı öneriler. Her biri rakam ve varsayım içerir; yatırım tavsiyesi değildir. */
  function recommendations(db, now, settings, rates, ayAdi) {
    const AY = ayAdi || 'Bu ay';
    const out = [];
    const gelirKayitli = (db.ek_gelirler || []).length > 0;
    const S = summarize(db, now, settings);
    const debts = debtModels(db, now, settings);
    const butce = Number((settings || {}).aylik_borc_butcesi) || Math.max(0, S.gelir - S.yasamGideri);
    const push = (seviye, baslik, aciklama) => out.push({ seviye, baslik, aciklama });

    if (!debts.length) {
      push('bilgi', 'Aktif borcunuz görünmüyor', 'Kayıtlı ödenmemiş taksit yok. Harcama veya kredi ekledikçe öneriler burada oluşur.');
      return out;
    }
    const gecikenler = items(db).filter((e) => e.item.gecikmis && unpaid(e.item).length)
      .map((e) => ({ e, o: overdueInfo(e.item, now, vergiFor(settings)) })).sort((a, b) => b.o.gunluk - a.o.gunluk);
    if (gecikenler.length) {
      const gunluk = r2(sum(gecikenler, (x) => x.o.gunluk));
      const ilk = gecikenler[0];
      push('kritik', `Gecikmiş borçlarınız her gün ${fmtMoney(gunluk)} büyüyor`,
        `${gecikenler.length} gecikmiş borç için işlemiş gecikme faizi toplam ${fmtMoney(sum(gecikenler, (x) => x.o.faiz))}. Elinizdeki parayı önce en pahalı olana yatırın: ${ilk.e.banka} · ${ilk.e.item.aciklama} (günde ${fmtMoney(ilk.o.gunluk)}). Kısmi ödeme önce faizi kapatır, ana para ancak ondan sonra düşer; bankayla yapılandırma da isteyebilirsiniz.`);
    }
    if (S.gecikmis > 0) {
      push('kritik', `${fmtMoney(S.gecikmis)} gecikmiş ödemeniz var`,
        'Gecikme faizi normal faizden yüksektir (TCMB azami gecikme oranları daha yüksektir) ve kredi notunuzu etkiler. Önce bu tutarı kapatın; bütçe yetmiyorsa ilgili bankayı arayıp yapılandırma veya erteleme talep edin.');
    }
    const est = overdueInterestEstimate(db, now, settings, rates);
    if (est.toplam > 0.5) {
      push('kritik', `Vadesi geçen taksitlerde tahmini ${fmtMoney(est.toplam)} gecikme faizi işledi (günde +${fmtMoney(est.gunluk)})`,
        `En pahalısı: ${est.kalemler[0].ad} (${est.kalemler[0].gun} gün, günde +${fmtMoney(est.kalemler[0].gunluk)}). Hesap: gecikme günü × aylık gecikme faizi × vergi; kart ve KMH için TCMB azami gecikme oranı, kredi için akdi faiz × 1,5 varsayıldı. Gerçek tutar için bankanızdan güncel borç dökümü alın.`);
    }
    // Süreli gelirlerin bitişi: sonrasında aylık durum
    const fc36 = forecast(db, now, settings, 36), byBitis = {};
    (db.ek_gelirler || []).filter((g) => g.sure > 0 && g.baslangic_ym).forEach((g) => {
      const bitis = ymAdd(g.baslangic_ym, g.sure);
      if (bitis <= ymOf(now)) return;
      (byBitis[bitis] = byBitis[bitis] || []).push(g.aciklama || 'Süreli gelir');
    });
    Object.keys(byBitis).sort().forEach((bitis) => {
      const row = fc36.find((r) => r.ym === bitis); if (!row) return;
      const adlar = byBitis[bitis];
      const onceki = incomeMonthly(db, ymAdd(bitis, -1));
      const adStr = adlar.length === 1 ? adlar[0] : adlar.length === 2 ? `${adlar[0]} ve ${adlar[1]}` : `${adlar.slice(0, -1).join(', ')} ve ${adlar[adlar.length - 1]}`;
      const baslik = adlar.length === 1
        ? `${adStr} geliri ${fmtYM(ymAdd(bitis, -1))} ayında bitiyor`
        : `${adStr} gelirleri ${fmtYM(ymAdd(bitis, -1))} ayında bitiyor`;
      push(row.kalan < 0 ? 'kritik' : 'uyari', baslik,
        `${fmtYM(bitis)} ayından itibaren aylık gelir ${fmtMoney(onceki)} → ${fmtMoney(row.gelir)} olur. O ay ${fmtMoney(row.sabit)} sabit gider ve ${fmtMoney(row.borc)} taksit ödenecek; ay sonu ${row.kalan < 0 ? `${fmtMoney(-row.kalan)} açık` : `${fmtMoney(row.kalan)} kalır`}. Bu tarihten önce yeni gelir kaynağı bulmayı veya giderleri/taksitleri azaltmayı planlayın (Simülasyon modunda deneyebilirsiniz).`);
    });
    const cashLeft = S.gelir - S.yasamGideri - S.buAyToplam - (S.tekSeferlik || 0);
    if (!gelirKayitli) {
      push('bilgi', 'Aylık gelirinizi ekleyin', 'Ödemelerden sonra ne kadar paranız kalacağını hesaplamak için Gelir ve giderler bölümüne gelirinizi yazın.');
    } else if (cashLeft < 0) {
      push('kritik', `${AY} ${fmtMoney(-cashLeft)} açık veriyorsunuz`,
        'Gelir, yaşam gideri ve bu ayki taksitleri karşılamıyor. Sırasıyla: (1) en yüksek faizli borcu belirleyip bankayla vade uzatma/yapılandırma görüşmesi yapın, (2) ek gelir kalemi ekleyin, (3) zorunlu olmayan taksitli harcamayı durdurun, (4) yeni borçla eski borcu kapatmadan önce Senaryolar sekmesinde maliyetini görün.');
    }
    if (S.gelir > 0) {
      const oran = S.buAyToplam / S.gelir;
      if (oran > 0.7) push('kritik', `Gelirinizin %${Math.round(oran * 100)} kadarı borca gidiyor`, 'Gelirin borca giden payı %70 üzerinde. Bu seviye sürdürülebilir değil; taksit yükünü vade uzatarak düşürmek veya borçları birleştirmek değerlendirilmeli.');
      else if (oran > 0.5) push('uyari', `Gelirinizin %${Math.round(oran * 100)} kadarı borca gidiyor`, 'Gelirin borca giden payı %50 üzerinde. Yeni taksitli harcamadan kaçının.');
    }
    // Faiz doğrulaması
    items(db).forEach((e) => {
      const cap = tcmbCap(rates, e);
      if (cap && unpaid(e.item).length && Number(e.item.faiz_orani) > cap + 0.001) {
        const gecerlilik = rates && rates.gecerlilik ? ` (${fmtDate(rates.gecerlilik)})` : '';
        push('uyari', `${e.banka} · ${e.cat === 'KREDI' ? e.item.kredi_adi : e.item.aciklama}: faiz oranı yüksek görünüyor`,
          `Kayıtlı oran %${pc(e.item.faiz_orani)}, TCMB azami akdi oranı %${pc(cap)}${gecerlilik}. Oranı sözleşmenizden kontrol edin; yanlışsa kaydı düzeltin.`);
      }
    });
    // Limit doluluğu
    (db.kredi_kartlari || []).forEach((k) => {
      const kul = sum(k.hareketler || [], (h) => remainingPrincipal(h));
      if (k.limit > 0 && kul / k.limit > 0.8) push('uyari', `${k.banka} ${k.kart_adi}: limit %${Math.round(kul / k.limit * 100)} dolu`, 'Yüksek limit doluluğu nakit akışını sıkıştırır ve kredi notunu olumsuz etkiler.');
    });
    // Pahalı borcu ucuz kredi ile kapatma
    const elle = (settings && settings.elle_oranlar) || {};
    const yeniFaiz = Number(elle.ihtiyac_kredisi) || 0;
    if (yeniFaiz > 0) {
      const vergi = vergiFor(settings, 'İhtiyaç Kredisi');
      debts.filter((d) => d.n >= 2 && d.B > 5000).forEach((d) => {
        const yeniP = annuityPayment(d.B, yeniFaiz, d.n, vergi);
        const eskiToplam = d.P * d.n, yeniToplam = yeniP * d.n;
        if (eskiToplam - yeniToplam > Math.max(1000, d.B * 0.03)) {
          push('bilgi', `${d.banka} · ${d.ad}: daha düşük faizli krediyle kapatmak maliyeti düşürebilir`,
            `Kalan ${d.n} taksit için toplam ${fmtMoney(eskiToplam)} ödeyeceksiniz. Aynı süre için %${pc(yeniFaiz)} aylık faizli yeni bir ihtiyaç kredisiyle yaklaşık ${fmtMoney(yeniToplam)} (aylık ${fmtMoney(yeniP)}). Fark yaklaşık ${fmtMoney(eskiToplam - yeniToplam)}. Varsayım: tahsis ücreti, sigorta ve erken kapama bedeli dahil değildir; teklif alıp karşılaştırın.`);
        }
      });
    }
    // Ekstra bütçe etkisi
    const baz = simulate(debts, now, { strateji: 'mevcut' });
    const toplamSozlesme = sum(debts.filter((d) => d.start === 0), (d) => d.P);
    if (butce > toplamSozlesme + 100) {
      const cig = simulate(debts, now, { strateji: 'cig', butce });
      if (cig.bitti && baz.bitti && cig.aySayisi < baz.aySayisi) {
        push('bilgi', `Aylık ${fmtMoney(butce)} ayırırsanız borç ${baz.aySayisi - cig.aySayisi} ay erken biter`,
          `Sözleşme taksitlerine ek ödemeyi en yüksek faizli borca yönlendirirseniz (çığ yöntemi) yaklaşık ${fmtMoney(baz.toplamOdeme - cig.toplamOdeme)} toplam ödeme tasarrufu olur. Bitiş: ${fmtYM(cig.bitisYm)}.`);
      }
    }
    // Ek gelir etkisi
    if (gelirKayitli && baz.bitti && baz.aySayisi > 3) {
      const ekGelir = 5000;
      const ek = simulate(debts, now, { strateji: 'cig', butce: Math.max(butce, toplamSozlesme) + ekGelir });
      if (ek.bitti && ek.aySayisi < baz.aySayisi) {
        push('bilgi', `Her ay ${fmtMoney(ekGelir)} ek gelir: ${baz.aySayisi - ek.aySayisi} ay erken kurtulursunuz`,
          `Ek gelirin tamamı borca giderse bitiş ${fmtYM(baz.bitisYm)} yerine ${fmtYM(ek.bitisYm)} olur; toplam ödeme yaklaşık ${fmtMoney(baz.toplamOdeme - ek.toplamOdeme)} azalır.`);
      }
    }
    // Asgari ödeme tuzağı
    (db.kredi_kartlari || []).forEach((k) => {
      if (!(Number(k.limit) > 0)) return;
      const m = cardMinPayment(k, now, settings);
      if (m.donemBorcu > 0 && m.kalanAsgari > 0) {
        const faiz = Number(k.faiz_orani) || 0;
        const t = minPaymentTrap(m.donemBorcu, faiz, vergiFor(settings), m.oran, 0);
        if (faiz > 0 && t.toplamFaiz > m.donemBorcu * 0.1) {
          const asgYazi = m.odenen > 0 ? `kalan asgari (${fmtMoney(m.kalanAsgari)})` : `asgari (${fmtMoney(m.asgari)})`;
          push('uyari', `${k.banka} ${k.kart_adi}: yalnız asgari ödeme pahalıya gelir`,
            `Kalan dönem borcu ${fmtMoney(m.donemBorcu)} için sadece ${asgYazi} öderseniz yaklaşık ${t.ay} ayda ${fmtMoney(t.toplamFaiz)} faiz ödersiniz (varsayım: yeni harcama yok).`);
        }
      }
    });
    if (gelirKayitli && !out.some((o) => o.seviye !== 'bilgi')) {
      push('bilgi', 'Nakit akışınız dengede görünüyor', 'Mevcut plana devam edin; ekstra ödemeyi en yüksek faizli borca yönlendirmek maliyeti azaltır.');
    }
    const sira = { kritik: 0, uyari: 1, bilgi: 2 };
    return out.sort((a, b) => sira[a.seviye] - sira[b.seviye]);
  }

  // ---------- Motivasyon ve ilerleme özetleri ----------
  /** Bu ay son taksiti olan (veya bu ay kapanan) tüm kalemler: kredi, kart/KMH hareketleri ve elden borçlar. */
  function closingThisMonth(db, now) {
    db = db || {};
    now = now || new Date();
    const thisYm = ymOf(now);
    const list = [];
    const earlyClosed = new Map();
    (db.tek_seferlik || []).forEach((x) => {
      if (x && x.tur === 'kapatma' && x.ym === thisYm && x.ref) {
        earlyClosed.set(`${x.ref.cat}:${x.ref.pid || 0}:${x.ref.iid}`, x);
      }
    });
    items(db).forEach((e) => {
      const ad = e.cat === 'KREDI' ? (e.item.kredi_adi || e.item.kredi_turu || '') : (e.item.aciklama || '');
      const key = `${e.cat}:${e.parent ? e.parent.id : 0}:${e.item.id}`;
      const kap = earlyClosed.get(key);
      if (kap) {
        list.push({ ad, banka: e.banka || '', cat: e.cat, aylik: r2(kap.aylik || 0), odendi: true });
        return;
      }
      const allTs = e.item.taksitler || [];
      if (!allTs.length) return;
      const allMaxYm = allTs.reduce((mx, t) => (t.ym > mx ? t.ym : mx), '');
      if (allMaxYm !== thisYm) return;
      const buAyTs = allTs.filter((t) => !t.kapatildi && t.ym === thisYm && !t.sigortaOder && !t.sigortaGecmis);
      if (!buAyTs.length) return;
      list.push({
        ad, banka: e.banka || '', cat: e.cat,
        aylik: r2(sum(buAyTs, (t) => t.tutar)),
        odendi: unpaid(e.item).length === 0,
      });
    });
    (db.sabit_giderler || []).forEach((g) => {
      if (!giderKalanli(g)) return;
      const paid = giderPaid(g, thisYm);
      const kalan = Number(g.kalan) || 0;
      const tutar = Number(g.tutar) || 0;
      if (paid && kalan <= 0.005) {
        const ayTutar = r2(giderTutar(g, thisYm));
        if (ayTutar > 0.005) list.push({ ad: g.ad || 'Elden borç', banka: 'Elden borç', cat: 'ELDEN', aylik: ayTutar, odendi: true });
      } else if (!paid && giderAktif(g, thisYm) && kalan > 0.005 && tutar > 0 && kalan <= tutar + 0.005) {
        list.push({ ad: g.ad || 'Elden borç', banka: 'Elden borç', cat: 'ELDEN', aylik: r2(giderTutar(g, thisYm)), odendi: false });
      }
    });
    return {
      items: list,
      aylikRahatlama: r2(sum(list, (x) => x.aylik)),
      closedCount: list.filter((x) => x.odendi).length,
      totalCount: list.length,
    };
  }

  /** Kalan ödenmemiş taksiti > 0 olan (sigorta hariç) aktif borçlardan kalan taksit sayısı en az, eşitlikte kalan tutarı en küçük olan. */
  function nextPayoffTarget(db, now) {
    db = db || {};
    now = now || new Date();
    const thisYm = ymOf(now);
    const candidates = [];
    items(db).forEach((e) => {
      const u = unpaid(e.item);
      if (!u.length) return;
      const kalanTutar = r2(sum(u, (t) => t.tutar));
      if (!(kalanTutar > 0.005)) return;
      const bitisYm = u.reduce((mx, t) => (t.ym > mx ? t.ym : mx), '');
      const ad = e.cat === 'KREDI' ? (e.item.kredi_adi || e.item.kredi_turu || '') : (e.item.aciklama || '');
      candidates.push({ ad, banka: e.banka || '', cat: e.cat, kalanTaksit: u.length, kalanTutar, bitisYm });
    });
    (db.sabit_giderler || []).forEach((g) => {
      if (!giderKalanli(g)) return;
      const kalan = r2(Number(g.kalan) || 0);
      if (!(kalan > 0.005)) return;
      const tutar = Number(g.tutar) || 0;
      const kalanTaksit = tutar > 0 ? Math.max(1, Math.ceil((kalan - 0.005) / tutar)) : 1;
      const baseYm = g.baslangic_ym && g.baslangic_ym > thisYm ? g.baslangic_ym : thisYm;
      const firstUnpaidYm = baseYm === thisYm && giderPaid(g, thisYm) ? ymAdd(thisYm, 1) : baseYm;
      const bitisYm = ymAdd(firstUnpaidYm, kalanTaksit - 1);
      candidates.push({ ad: g.ad || 'Elden borç', banka: 'Elden borç', cat: 'ELDEN', kalanTaksit, kalanTutar: kalan, bitisYm });
    });
    if (!candidates.length) return null;
    candidates.sort((a, b) => (a.kalanTaksit - b.kalanTaksit) || (a.kalanTutar - b.kalanTutar));
    return candidates[0];
  }

  /** Borçsuzluk tarihine kaç ay kaldığı ve aylık yükün bu aya göre en az %25 düştüğü ilk ay. */
  function freedomTimeline(db, now) {
    const s = summarize(db || {}, now || new Date());
    const sonVade = s.sonVade || null;
    const ayKaldi = sonVade ? Math.max(0, monthsBetween(s.thisYm, sonVade.slice(0, 7))) : 0;
    let rahatlamaAyi = null, rahatlamaOran = 0, rahatlamaTutar = 0;
    const bazYuk = s.buAyToplam > 0.005 ? s.buAyToplam : (s.months.length ? s.months[0].tutar : 0);
    const bazYm = s.buAyToplam > 0.005 ? s.thisYm : (s.months.length ? s.months[0].ym : s.thisYm);
    if (bazYuk > 0.005) {
      const hit = s.months.find((m) => m.ym > bazYm && (bazYuk - m.tutar) / bazYuk >= 0.25 - 1e-9);
      if (hit) {
        rahatlamaAyi = hit.ym;
        rahatlamaTutar = r2(bazYuk - hit.tutar);
        rahatlamaOran = Math.round(((bazYuk - hit.tutar) / bazYuk) * 100);
      }
    }
    return { ayKaldi, sonVade, rahatlamaAyi, rahatlamaOran, rahatlamaTutar };
  }

  /** Erken kapatmalardan faiz kazancı ve kurtarılan taksit + sigorta kapsamından karşılanan tutar. */
  function savedSummary(db, settings) {
    db = db || {};
    const kapatmalar = (db.tek_seferlik || []).filter((x) => x && x.tur === 'kapatma');
    const faizKazanc = r2(sum(kapatmalar, (x) => Math.max(0, Number(x.faizKazanc) || 0)));
    const kurtarilanTaksit = kapatmalar.reduce((s, x) => s + (parseInt(x.adet, 10) || 0), 0);
    let sigortaTutar = 0;
    items(db).forEach((e) => {
      const cov = e.cat === 'KREDI' ? e.item.sigorta_kapsam : (e.parent && e.parent.sigorta_kapsam);
      (e.item.taksitler || []).forEach((t) => {
        const covered = !!(t.sigortaOder || t.sigortaGecmis || (!t.odendi && !t.kapatildi && cov && cov.ilk_ym && cov.ay > 0 && t.ym >= cov.ilk_ym && t.ym < ymAdd(cov.ilk_ym, cov.ay)));
        if (covered) sigortaTutar += Number(t.tutar) || 0;
      });
    });
    sigortaTutar = r2(sigortaTutar);
    return { faizKazanc, kurtarilanTaksit, sigortaTutar, toplamKazanc: r2(faizKazanc + sigortaTutar) };
  }

  /**
   * Bir ayın nakit durumu. Bu ay için gerçek ödeme kayıtları kullanılır; ileri aylar için tahmin (forecast).
   * Dönüş: { ym, gelir, borc, gider, tek, aySonu, buAy, [bu ay için:] borcOdenen, borcKalan, giderOdenen, giderKalan, elde }
   *  - elde: gelir − bu ay şimdiye kadar ödenen borç taksitleri − ödenen giderler (şu an elinde kalması gereken para)
   *  - aySonu: gelir − ayın tüm borç ödemeleri − tüm giderler − tek seferlik ödemeler (ay sonunda kalacak para)
   */
  function monthCash(db, now, ym, settings) {
    const thisYm = ymOf(now);
    ym = ym || thisYm;
    if (ym === thisYm) {
      const s = summarize(db, now, settings), F = fixedSummary(db, now);
      const giderOdenen = r2(F.toplam - F.odenmemis);
      return {
        ym, buAy: true, gelir: s.gelir, borc: r2(s.buAy + s.buAyOdenen), gider: F.toplam, tek: s.tekSeferlik,
        borcOdenen: s.buAyOdenen, borcKalan: s.buAy, giderOdenen, giderKalan: F.odenmemis,
        elde: r2(s.gelir - s.buAyOdenen - giderOdenen),
        aySonu: r2(s.gelir - s.buAy - s.buAyOdenen - F.toplam - s.tekSeferlik),
      };
    }
    if (ym < thisYm) return null;
    const row = forecast(db, now, settings, monthsBetween(thisYm, ym)).find((x) => x.ym === ym);
    if (!row) return null;
    return { ym, buAy: false, gelir: row.gelir, borc: row.borc, gider: row.sabit, tek: row.tek, aySonu: row.kalan };
  }

  /**
   * Taksitli kredi formu hesabı. Kullanıcının bildiği alanlardan eksikleri bulur.
   * o: { aylik, n (toplam taksit), kalan, faiz (boş olabilir), ana (boş olabilir), faizDefault, vergi, konut }
   * Faiz ve çekilen tutardan biri yazılırsa diğeri hesaplanır; ikisi de boşsa varsayılan faizle tahmin edilir.
   */
  function loanPlan(o) {
    const pos = (v) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
    const has = (v) => v != null && String(v).trim() !== '' && Number.isFinite(Number(v));
    const aylik = pos(o.aylik), kalan = Math.max(0, Math.trunc(pos(o.kalan)));
    const n = Math.max(kalan, Math.trunc(pos(o.n)) || kalan), vergi = o.vergi || 1.3;
    const out = { aylik, n, kalan, odenen: Math.max(0, n - kalan), vergi, faiz: null, ana: null, faizSrc: null, anaSrc: null, hata: '' };
    if (!(aylik > 0) || !(kalan >= 1)) return out;
    const fGiven = has(o.faiz) && Number(o.faiz) >= 0, aGiven = pos(o.ana) > 0;
    if (fGiven) { out.faiz = Number(o.faiz); out.faizSrc = 'girdi'; }
    if (aGiven) { out.ana = pos(o.ana); out.anaSrc = 'girdi'; }
    if (fGiven && !aGiven) { out.ana = r2(annuityPrincipal(aylik, out.faiz, n, vergi)); out.anaSrc = 'hesap'; }
    else if (!fGiven && aGiven) {
      if (aylik * n < out.ana * 0.995) { out.hata = `${n} taksit × ${fmtMoney(aylik)} = ${fmtMoney(aylik * n)}; çekilen tutardan (${fmtMoney(out.ana)}) az olamaz.`; out.faiz = 0; }
      else { const imp = impliedRate(out.ana, aylik, n, vergi); out.faiz = imp == null ? 0 : r2(imp); }
      out.faizSrc = 'hesap';
    } else if (!fGiven && !aGiven) {
      out.faiz = has(o.faizDefault) ? Number(o.faizDefault) : 0; out.faizSrc = 'varsayilan';
      out.ana = r2(annuityPrincipal(aylik, out.faiz, n, vergi)); out.anaSrc = 'tahmin';
    }
    out.toplamOdeme = r2(aylik * n);
    out.toplamFaiz = r2(Math.max(0, out.toplamOdeme - out.ana));
    out.kalanBorc = r2(aylik * kalan);
    // Bugün kapatılsa ödenecek yaklaşık anapara: kalan taksitlerin bugünkü değeri (faiz + BSMV/KKDF ayıklanmış)
    out.kalanAnapara = r2(Math.min(out.kalanBorc, annuityPrincipal(aylik, out.faiz, kalan, vergi)));
    // 6502 s. Kanun m.37 / Tüketici Kredisi Sözleşmeleri Yönetmeliği: sabit faizli kredide erken ödeme tazminatı
    // kalan vade 12 aydan azsa en çok %0,5, fazlaysa en çok %1; konut finansmanında en çok %2.
    out.tazminatOran = o.konut ? 2 : (kalan > 12 ? 1 : 0.5);
    out.tazminat = r2(out.kalanAnapara * out.tazminatOran / 100);
    if (!out.hata && out.faizSrc === 'hesap' && out.faiz > 8) out.hata = `Bu rakamlar aylık %${pc(out.faiz)} faiz demek; gerçekçi değil. Taksit sayısını ve çekilen tutarı kontrol edin.`;
    if (!out.hata && out.faizSrc === 'girdi' && out.faiz > 15) out.hata = `Aylık faiz %${pc(out.faiz)} olamaz; yıllık değil aylık oranı yazın.`;
    return out;
  }

  // ---------- Vadesiz hesap (artı para / KMH) ----------
  // kmh_hesaplar kaydı artık bir vadesiz hesaptır: bakiye (eksi olabilir), isteğe bağlı artı para limiti (limit) ve faizi.
  // Eski "hareketler" (taksitli KMH planları) aynen çalışmaya devam eder.
  const hesapBakiye = (a) => r2(Number(a && a.bakiye) || 0);
  /** Artı paradan kullanılan: eksi bakiye + eski/taksitli KMH kalemlerinin kalan ana parası. */
  function hesapKullanilan(a) {
    return r2(Math.max(0, -hesapBakiye(a)) + sum(a.hareketler || [], (h) => remainingPrincipal(h)));
  }
  /** Eksi bakiyeye bir ayda işleyecek tahmini faiz (BSMV + KKDF dahil). */
  function hesapAylikFaiz(a, settings) {
    const eksi = Math.max(0, -hesapBakiye(a));
    return r2(eksi * (Number(a.faiz_orani) || 0) / 100 * vergiFor(settings));
  }
  /** Vadesiz hesaptan harcama / para girişi: bakiyeyi günceller ve işlem geçmişine yazar. */
  function hesapIslem(a, o) {
    a.islemler = Array.isArray(a.islemler) ? a.islemler : [];
    const id = a.islemler.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    const tutar = r2(Math.abs(Number(o.tutar) || 0)), yon = o.yon === 'giris' ? 1 : -1;
    a.bakiye = r2(hesapBakiye(a) + yon * tutar);
    a.islemler.push({ id, tarih: o.tarih, tutar, yon: yon > 0 ? 'giris' : 'cikis', aciklama: String(o.aciklama || '').slice(0, 80) });
    if (a.islemler.length > 500) a.islemler = a.islemler.slice(-500);
    return id;
  }
  function hesapIslemSil(a, id) {
    const x = (a.islemler || []).find((y) => y.id === id); if (!x) return false;
    a.bakiye = r2(hesapBakiye(a) - (x.yon === 'giris' ? 1 : -1) * x.tutar);
    a.islemler = a.islemler.filter((y) => y.id !== id);
    return true;
  }

  // ---------- Kredi kartı ekstresi ----------
  /** Harcama tarihine göre ekstre: kesim günü dahil o ayın kesimine, sonrası bir sonraki ayın kesimine girer.
      Son ödeme tarihi ekstre kesiminden sonraki ilk "son ödeme günü"dür (kesim + ~10 gün; günü kesimden küçükse ertesi ay). */
  function cardStatementOf(isoDate, kesimGunu, sonOdemeGunu) {
    const [y, m, d] = isoDate.split('-').map(Number), ym = `${y}-${pad(m)}`;
    const kesim = Math.min(kesimGunu || 15, daysInMonth(ym));
    const ekstreYm = d <= kesim ? ym : ymAdd(ym, 1);
    const kesimIso = dueDate(ekstreYm, kesimGunu || 15);
    const odemeYm = (sonOdemeGunu || 25) <= (kesimGunu || 15) ? ymAdd(ekstreYm, 1) : ekstreYm;
    return { ekstreYm, kesimIso, odemeYm, sonOdemeIso: dueDate(odemeYm, sonOdemeGunu || 25) };
  }
  /** Kartın bir ödeme ayındaki ekstresi: o aya düşen taksitler. */
  function cardStatement(kart, ym) {
    const rows = [];
    (kart.hareketler || []).forEach((h) => (h.taksitler || []).forEach((t) => { if (t.ym === ym && !t.kapatildi && !t.sigortaGecmis) rows.push({ h, t }); }));
    const toplam = r2(sum(rows.filter((x) => !x.t.sigortaOder), (x) => x.t.tutar));
    const odenen = r2(sum(rows.filter((x) => !x.t.sigortaOder), (x) => installmentPaidAmount(x.t)));
    return { ym, rows, toplam, odenen, kalan: r2(toplam - odenen) };
  }
  /** Açık ekstre kalemleri ve şimdiye kadar kaydedilen kısmi ödemeler. */
  function cardStatementDue(kart, ym) {
    const rows = [];
    (kart.hareketler || []).forEach((h) => {
      if (!h.gecikmis) unpaid(h).forEach((t) => { if (t.ym <= ym) rows.push({ h, t }); });
    });
    return { rows, toplam: sum(rows, ({ t }) => installmentBalance(t)), oncekiOdeme: sum(rows, ({ t }) => installmentPaidAmount(t)) };
  }
  function cardRateTier(borc, rates) {
    if (!rates) return null;
    return borc <= 30000 ? rates.kart_30bin_alti : borc <= 180000 ? rates.kart_30_180bin : rates.kart_180bin_ustu;
  }
  function cardPayPreview(kart, ym, tutar, settings, rates) {
    const st = cardStatementDue(kart, ym), toplam = st.toplam;
    const oran = minPaymentRate(Number(kart.limit) || 0, settings);
    const settled = [];
    (kart.hareketler || []).forEach((h) => (h.taksitler || []).forEach((t) => {
      if (t.odendi && t.ekstre_odeme === ym && !t.kapatildi && t.ekstre_kismi_odeme > 0) settled.push({ h, t });
    }));
    const rows = st.rows.concat(settled);
    const oncekiOdeme = r2(st.oncekiOdeme + sum(settled, ({ t }) => installmentPaidAmount(t)));
    const tamBorc = r2(toplam + oncekiOdeme);
    const bankMinimum = sum(rows.filter(({ h }) => h.ekstre_baslangic), ({ h }) => h.ekstre_asgari || 0);
    const calculatedMinimum = r2(sum(rows.filter(({ h }) => !h.ekstre_baslangic), ({ t }) => t.tutar) * oran);
    const asgariToplam = r2(bankMinimum + calculatedMinimum);
    const asgari = r2(Math.min(toplam, Math.max(0, asgariToplam - oncekiOdeme)));
    const odenen = r2(Math.min(Math.max(0, Number(tutar) || 0), toplam)), kalan = r2(toplam - odenen);
    const tier = cardRateTier(tamBorc, rates), v = vergiFor(settings);
    // TCMB azami oranları aşılamaz: akdi = kart faizi (tavanla sınırlı), gecikme = dilimin azami gecikme faizi
    const kf = Number(kart.faiz_orani) || 0;
    const explicitRate = kart.faiz_otomatik === false ? kf : !kart.faiz_otomatik && kf > 0 ? kf : null;
    const akdi = tier ? (explicitRate == null ? tier.akdi : Math.min(explicitRate, tier.akdi)) : (explicitRate ?? (kf || 4.25));
    const gecikme = tier ? tier.gecikme : akdi + 0.3;
    const asgariEksik = r2(Math.max(0, asgari - odenen));
    const faiz = kalan > 0.005 ? r2((kalan - asgariEksik) * akdi / 100 * v + asgariEksik * gecikme / 100 * v) : 0;
    return { ym, rows: st.rows, toplam, oncekiOdeme, asgari, asgariToplam, oran, odenen, kalan, asgariEksik, akdi, gecikme, faiz, devreden: r2(kalan + faiz) };
  }
  function payCardStatement(kart, ym, o) {
    const p = cardPayPreview(kart, ym, o.tutar, o.settings, o.rates);
    if (!(p.odenen > 0)) return null;
    let kalanOdeme = p.odenen;
    const refs = [];
    p.rows.sort((a, b) => a.t.vade_tarihi.localeCompare(b.t.vade_tarihi)).forEach(({ h, t }) => {
      const tutar = Math.min(kalanOdeme, installmentBalance(t));
      if (!(tutar > 0)) return;
      refs.push({ hid: h.id, no: t.no, tutar });
      t.ekstre_kismi_odeme = r2(installmentPaidAmount(t) + tutar);
      if (t.ekstre_kismi_odeme >= t.tutar) { t.odendi = true; t.ekstre_odeme = ym; }
      kalanOdeme = r2(kalanOdeme - tutar);
    });
    kart.ekstre_odemeleri = Array.isArray(kart.ekstre_odemeleri) ? kart.ekstre_odemeleri : [];
    const pid = kart.ekstre_odemeleri.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    kart.ekstre_odemeleri.push({ id: pid, ym, tarih: o.tarih, tutar: p.odenen, toplam: p.toplam, asgari: p.asgari, kalan: p.kalan, refs });
    return Object.assign({ id: pid }, p);
  }
  function undoCardPayment(kart, id) {
    const x = (kart.ekstre_odemeleri || []).find((y) => y.id === id); if (!x) return false;
    (x.refs || []).forEach((r) => {
      const h = (kart.hareketler || []).find((y) => y.id === r.hid);
      const t = h && (h.taksitler || []).find((y) => y.no === r.no);
      if (!t) return;
      if (r.tutar != null) {
        t.ekstre_kismi_odeme = r2(Math.max(0, (t.ekstre_kismi_odeme || 0) - r.tutar));
        if (!t.ekstre_kismi_odeme) delete t.ekstre_kismi_odeme;
      }
      t.odendi = false;
      delete t.ekstre_odeme;
    });
    if (x.devreden_id) kart.hareketler = kart.hareketler.filter((h) => h.id !== x.devreden_id);
    kart.ekstre_odemeleri = kart.ekstre_odemeleri.filter((y) => y.id !== id);
    return true;
  }
  /** Kart limitinden kullanılan: ödenmemiş tüm taksitler (gelecek ekstreler dahil). afterYm verilirse o aya kadarki ekstreler ödenmiş sayılır. */
  function cardUsed(kart, afterYm) {
    return r2(sum(kart.hareketler || [], (h) => sum(unpaidAll(h).filter((t) => !afterYm || t.ym > afterYm), installmentBalance)));
  }

  /**
   * Bir ayın tablosu (geçmiş, bu ay veya gelecek): ödemeler, gelir, ödemelerden sonra kalan ve limitler.
   * - borc: o ayın borç taksitleri (kredi, kart ekstresi, taksitli KMH); bu ay için önceki aylardan kalan ödenmemişler dahil
   * - gider: o ayın sabit giderleri; faiz: eksi bakiyeli hesapların tahmini aylık faizi (geçmiş aylarda yok)
   * - kalan: gelir − borc − gider − faiz − tek seferlik
   * - limit: kart limitleri + artı para limitleri; kullanilan: bu ay için şu an, gelecek aylar için o ayın ödemeleri yapılınca
   */
  function monthView(db, now, ym, settings) {
    const thisYm = ymOf(now), past = ym < thisYm, cur = ym === thisYm;
    let borc = 0, odenen = 0, adet = 0, odenenAdet = 0;
    items(db).forEach((e) => (e.item.taksitler || []).forEach((t) => {
      if (t.kapatildi || t.sigortaOder || t.sigortaGecmis) return;
      const inMonth = t.ym === ym || (cur && !t.odendi && t.ym < ym);
      if (!inMonth) return;
      borc += t.tutar; adet++;
      odenen += installmentPaidAmount(t);
      if (t.odendi) odenenAdet++;
    }));
    const gelir = incomeMonthly(db, ym);
    let gider = 0, giderOdenen = 0;
    (db.sabit_giderler || []).forEach((g) => {
      if (!giderAktif(g, ym)) return;
      const tt = past ? (giderPaid(g, ym) ? giderTutar(g, ym) : 0) : (cur ? giderTutar(g, ym) : giderTutar(g, ym, giderTahminiKalan(g, thisYm, ym)));
      gider += tt; if (giderPaid(g, ym)) giderOdenen += tt;
    });
    const faiz = past ? 0 : r2(sum(db.kmh_hesaplar || [], (a) => hesapAylikFaiz(a, settings)));
    const tek = oneOffMonthly(db, ym);
    const kartlar = db.kredi_kartlari || [], hesaplar = db.kmh_hesaplar || [];
    const limit = r2(sum(kartlar, (k) => Number(k.limit) || 0) + sum(hesaplar, (a) => Number(a.limit) || 0));
    const kartKul = r2(sum(kartlar, (k) => cardUsed(k, cur || past ? null : ym)));
    const hesKul = r2(sum(hesaplar, (a) => Math.max(0, -hesapBakiye(a)) + sum(a.hareketler || [], (h) => sum(unpaidAll(h).filter((t) => cur || past || t.ym > ym), (t) => t.tutar))));
    const kullanilan = r2(kartKul + hesKul);
    const toplamOdeme = r2(borc + gider + faiz + tek);
    return {
      ym, past, cur, gelir, borc: r2(borc), odenen: r2(odenen), adet, odenenAdet, gider: r2(gider), giderOdenen: r2(giderOdenen), faiz, tek,
      toplamOdeme, odenenToplam: r2(odenen + giderOdenen), kalanOdeme: r2(Math.max(0, toplamOdeme - odenen - giderOdenen)),
      kalan: r2(gelir - toplamOdeme), elde: r2(gelir - odenen - giderOdenen),
      limit, kullanilan, kartKul, hesKul, bos: r2(Math.max(0, limit - kullanilan)),
      bakiye: r2(sum(hesaplar, (a) => Math.max(0, hesapBakiye(a)))),
    };
  }
  /** Ana ekrandaki ay oklarının sınırı: en son taksidin ayı (en az bu ay + 1). */
  function lastPlanYm(db, now) {
    let m = ymAdd(ymOf(now), 1);
    items(db).forEach((e) => (e.item.taksitler || []).forEach((t) => { if (!t.odendi && t.ym > m) m = t.ym; }));
    return m;
  }

  function recordedSpend(db, from, through) {
    const inPeriod = (entry) => entry.tarih >= from && entry.tarih <= through;
    const cardSpend = sum(db.kredi_kartlari || [], (card) => sum((card.hareketler || []).filter((entry) =>
      inPeriod(entry) && ['Tek Çekim Harcama', 'Taksitli Alışveriş'].includes(entry.tur)
      && !(entry.aciklama === 'Mevcut kart borcu')), (entry) => Number(entry.ana_para) || 0));
    const accountSpend = sum(db.kmh_hesaplar || [], (account) => sum((account.islemler || []).filter((entry) =>
      inPeriod(entry) && entry.yon === 'cikis'), (entry) => Number(entry.tutar) || 0));
    return r2(cardSpend + accountSpend);
  }

  // Varsayılan ad başka kayıtta varsa "Ad 2", "Ad 3" ... ile ayırt eder (büyük/küçük harf ve boşluk fark etmez).
  function uniqueName(base, existing) {
    const norm = (x) => String(x == null ? '' : x).trim().toLocaleLowerCase('tr');
    const taken = new Set((existing || []).map(norm));
    if (!taken.has(norm(base))) return base;
    let n = 2;
    while (taken.has(norm(`${base} ${n}`))) n++;
    return `${base} ${n}`;
  }

  return {
    recordedSpend, uniqueName, installmentBalance, monthCash, loanPlan, cardStatementDue, cardPayPreview, payCardStatement, undoCardPayment, hesapBakiye, hesapKullanilan, hesapAylikFaiz, hesapIslem, hesapIslemSil, cardStatementOf, cardStatement, cardUsed, monthView, lastPlanYm, giderAktif, giderTutar, AYLAR, r2, sum, ymOf, isoOf, ymAdd, monthsBetween, fmtYM, fmtDate, fmtMoney, daysInMonth, dueDate,
    monthlyRate, vergiFor, annuityPayment, annuityTotal, annuityPrincipal, impliedRate, installmentCount, deriveLoan, checkLoan, buildSchedule,
    cardFirstYm, kmhFirstYm, loanFirstYm, installmentStatus, items, unpaid, remainingTotal, remainingPrincipal,
    summarize, minPaymentRate, cardStatementDebt, cardMinPayment, minPaymentTrap,
    coverageHolder, markCoverage, coverageProducts, coverageInfo, coverageFirstYm, unpaidAll, shortYm,
    oneOffMonthly, payoffQuote, payoffPlan, minPayPlan, rolloverSim, closableDebts, closeDebt, reopenDebt, diffDb, simulationReport, accountUsed, projectDb, forecast, gelirAktif, incomeMonthly, GIDER_KATEGORILERI, giderIkon, giderAktif, fixedMonthly, fixedSummary, toggleGiderPaid,
    kalemMatrix, accountLimitLeft, buildScenario, scenarioMetrics, compareScenario,
    overdueInterestEstimate, daysBetween, overdueInfo, refreshOverdue, newOverdueItem, applyPartialPayment, installmentDiffInfo, applyInstallmentAmount, costBreakdown, costSummary,
    debtModels, simulate, recommendations,
    closingThisMonth, nextPayoffTarget, freedomTimeline, savedSummary,
  };
});
