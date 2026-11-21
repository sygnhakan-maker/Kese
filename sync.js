/* Kese bulut eşitleme (isteğe bağlı üyelik). Yerel veri HER ZAMAN asıl kaynaktır; bulut yedek/eşitleme katmanıdır.
 * Saf mantık + enjekte edilen istemci: Node'da sahte istemciyle test edilir (tests/test_sync.js).
 * Güvenlik: service_role anahtarı burada ASLA bulunmaz; yetkilendirme sunucuda RLS ile yapılır. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeseSync = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const META_KEY = 'kese_sync_v1', PREBACKUP_KEY = 'kese_pre_sync_backup_v1';
  const DEBOUNCE_MS = 2000, MIN_PASSWORD = 10, MAX_BYTES = 1900000;

  /** Veri boş mu? (hiç kayıt yok: ilk açılış) */
  function isEmptyDb(db) {
    if (!db || typeof db !== 'object') return true;
    return ['ek_gelirler', 'kmh_hesaplar', 'kredi_kartlari', 'krediler', 'sabit_giderler', 'tek_seferlik'].every((k) => !Array.isArray(db[k]) || db[k].length === 0);
  }
  const RUNTIME_KEYS = new Set(['sigortaOder', 'sigortaGecmis']);
  /** İki veri aynı mı? (ayarlar dahil, anahtar sırası ve çalışma zamanı bayrakları önemsiz) */
  function sameDb(a, b) {
    const norm = (o) => JSON.stringify(o, (k, v) => {
      if (RUNTIME_KEYS.has(k)) return undefined;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return Object.keys(v).sort().reduce((r, x) => {
          if (!RUNTIME_KEYS.has(x)) r[x] = v[x];
          return r;
        }, {});
      }
      return v;
    });
    return norm(a) === norm(b);
  }
  /** Giriş hatalarını sade Türkçeye çevirir. */
  function authMessage(err) {
    const m = String((err && (err.message || err.error_description || err)) || '').toLowerCase();
    if (!m) return 'Bir sorun oluştu. Lütfen tekrar deneyin.';
    if (m.includes('invalid login')) return 'E-posta veya şifre hatalı.';
    if (m.includes('not confirmed')) return 'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzdaki bağlantıya tıklayın.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin.';
    if (m.includes('password') && (m.includes('weak') || m.includes('least') || m.includes('short'))) return 'Şifre çok zayıf. En az 10 karakter, harf ve rakam kullanın.';
    if (m.includes('network') || m.includes('failed to fetch') || m.includes('offline')) return 'İnternet bağlantısı yok ya da sunucuya ulaşılamıyor.';
    if (m.includes('email') && m.includes('invalid')) return 'Geçerli bir e-posta adresi girin.';
    return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.';
  }
  const validEmail = (e) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(String(e || '').trim());

  /**
   * deps: { client, storage {getItem,setItem,removeItem}, getDb(), setDb(db), sanitize(db), persist(db) (yerele yaz),
   *         onStatus(s, info), onConflict(info), online(), clientId, setTimeoutFn, clearTimeoutFn }
   */
  function create(deps) {
    const st = deps.storage, setT = deps.setTimeoutFn || setTimeout, clrT = deps.clearTimeoutFn || clearTimeout;
    let timer = null, busy = false, session = null, pending = null, destroyed = false;
    let localRevision = 0;

    const readMeta = () => { try { return JSON.parse(st.getItem(META_KEY)) || {}; } catch (e) { return {}; } };
    const writeMeta = (m) => { try { st.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* depolama dolu: eşitleme yine çalışır */ } };
    const status = (s, info) => { if (deps.onStatus) deps.onStatus(s, info || {}); };
    const online = () => (deps.online ? deps.online() : true);
    const uid = () => (session && session.user ? session.user.id : null);

    async function refreshSession() {
      const { data } = await deps.client.auth.getSession();
      session = (data && data.session) || null;
      return session;
    }
    async function fetchCloud() {
      const { data, error } = await deps.client.from('kese_documents').select('data,version,updated_at').maybeSingle();
      if (error) throw error;
      return data || null;
    }
    async function pushDoc(db, expected) {
      const text = JSON.stringify(db);
      if (text.length > MAX_BYTES) { const e = new Error('Veri eşitleme için çok büyük'); e.kese = 'big'; throw e; }
      const { data, error } = await deps.client.rpc('kese_kaydet', { p_data: db, p_beklenen: expected, p_client: deps.clientId || null });
      if (error) throw error;
      const r = Array.isArray(data) ? data[0] : data;
      return r || { r_durum: 'error' };
    }
    async function acceptCloud(cloud) {
      const clean = deps.sanitize(cloud.data);
      const db = clean && clean.db ? clean.db : clean;
      try { st.setItem(PREBACKUP_KEY, JSON.stringify(deps.getDb())); } catch (e) { /* yedek yazılamadı */ }
      if (deps.persist) {
        let revision = localRevision;
        await deps.persist(db);
        if (revision !== localRevision) {
          // Yazma devam ederken yapılan en yeni düzenlemeyi diskte de koru.
          do {
            revision = localRevision;
            await deps.persist(deps.getDb());
          } while (revision !== localRevision);
          status('conflict', { reason: 'both' });
          if (deps.onConflict) deps.onConflict({ reason: 'both', local: deps.getDb(), cloud });
          return 'conflict';
        }
      }
      deps.setDb(db);
      const m = readMeta(); m.userId = uid(); m.lastVersion = cloud.version; m.dirty = false; m.lastSyncAt = Date.now(); writeMeta(m);
      status('synced', { lastSyncAt: m.lastSyncAt, pulled: true });
      return 'synced';
    }
    function markSynced(version, revision = localRevision) {
      const m = readMeta();
      m.userId = uid(); m.lastVersion = version; m.dirty = revision !== localRevision; m.lastSyncAt = Date.now();
      writeMeta(m);
      status(m.dirty ? 'syncing' : 'synced', { lastSyncAt: m.lastSyncAt });
      return 'synced';
    }

    /** Tek eşitleme turu. Dönüş: 'synced' | 'conflict' | 'out' | 'offline' | 'error' */
    async function syncNow() {
      if (destroyed) return 'out';
      if (busy) { pending = true; return 'busy'; }
      busy = true;
      try {
        if (!(await refreshSession()) || !uid()) { status('out'); return 'out'; }
        if (!online()) { status('offline'); return 'offline'; }
        status('syncing');
        const cloud = await fetchCloud();
        const meta = readMeta(), local = deps.getDb(), revision = localRevision;
        const known = meta.userId === uid() && meta.lastVersion > 0;
        if (!cloud) {
          if (isEmptyDb(local)) return markSynced(0);
          const r = await pushDoc(local, 0);
          if (r.r_durum === 'ok') return markSynced(r.r_version, revision);
          status('error', { message: 'Bulut kaydı oluşturulamadı' }); return 'error';
        }
        if (!known) {   // bu cihaz bu hesapla ilk kez eşitleniyor
          if (isEmptyDb(local)) return await acceptCloud(cloud);
          if (sameDb(local, cloud.data)) return markSynced(cloud.version);
          status('conflict', { reason: 'first' }); if (deps.onConflict) deps.onConflict({ reason: 'first', local, cloud }); return 'conflict';
        }
        if (cloud.version === meta.lastVersion) {
          if (!meta.dirty) { status('synced', { lastSyncAt: meta.lastSyncAt }); return 'synced'; }
          const r = await pushDoc(local, meta.lastVersion);
          if (r.r_durum === 'ok') return markSynced(r.r_version, revision);
          if (r.r_durum === 'conflict') {
            status('conflict', { reason: 'edited' });
            if (deps.onConflict) deps.onConflict({ reason: 'edited', local: deps.getDb(), cloud: { data: r.r_data, version: r.r_version } });
            return 'conflict';
          }
          status('error', { message: 'Bulut kaydı güncellenemedi' }); return 'error';
        }
        // bulut daha yeni
        if (!meta.dirty) return await acceptCloud(cloud);
        status('conflict', { reason: 'both' }); if (deps.onConflict) deps.onConflict({ reason: 'both', local, cloud }); return 'conflict';
      } catch (e) {
        if (e && e.kese === 'big') { status('error', { message: e.message }); return 'error'; }
        if (!online() || /failed to fetch|network/i.test(String(e && e.message))) { status('offline'); return 'offline'; }
        status('error', { message: authMessage(e) }); return 'error';
      } finally { finishSync(); }
    }
    function schedule(ms) { if (destroyed) return; clrT(timer); timer = setT(() => { timer = null; syncNow(); }, ms == null ? DEBOUNCE_MS : ms); }
    function finishSync() { busy = false; if (pending) { pending = false; schedule(); } }

    /** Yerel veri değişti: işaretle, kısa gecikmeyle gönder. (Simülasyonda çağrılmaz.) */
    function markDirty() { if (!uid()) return; localRevision++; const m = readMeta(); m.dirty = true; writeMeta(m); schedule(); }

    /** Çakışma çözümü: 'cloud' (bulutu al), 'local' (bu cihazı yükle). */
    async function resolve(choice, info) {
      if (busy) return 'busy';
      busy = true;
      try {
        const cloud = info.cloud;
        if (choice === 'cloud') return await acceptCloud(cloud);
        if (choice === 'local') {
          const revision = localRevision;
          const r = await pushDoc(deps.getDb(), cloud.version);
          if (r.r_durum === 'ok') return markSynced(r.r_version, revision);
          if (r.r_durum === 'conflict') {
            status('conflict', { reason: 'again' });
            if (deps.onConflict) deps.onConflict({ reason: 'again', local: deps.getDb(), cloud: { data: r.r_data, version: r.r_version } });
            return 'conflict';
          }
          status('error', { message: 'Bulut kaydı güncellenemedi' }); return 'error';
        }
        throw new Error('Bilinmeyen seçim');
      } finally { finishSync(); }
    }

    // ---- Kimlik doğrulama ----
    async function signUp(email, password) {
      email = String(email || '').trim();
      if (!validEmail(email)) return { ok: false, message: 'Geçerli bir e-posta adresi girin.' };
      if (String(password || '').length < MIN_PASSWORD) return { ok: false, message: `Şifre en az ${MIN_PASSWORD} karakter olmalı.` };
      const { data, error } = await deps.client.auth.signUp({ email, password, options: { emailRedirectTo: deps.redirectTo } });
      if (error) return { ok: false, message: authMessage(error) };
      // E-posta doğrulaması açıkken oturum hemen açılmaz.
      const needsConfirm = !(data && data.session);
      if (!needsConfirm) { await refreshSession(); schedule(0); }
      return { ok: true, needsConfirm };
    }
    async function signIn(email, password) {
      email = String(email || '').trim();
      if (!validEmail(email) || !password) return { ok: false, message: 'E-posta ve şifrenizi girin.' };
      const { error } = await deps.client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, message: authMessage(error) };
      await refreshSession(); schedule(0);
      return { ok: true };
    }
    async function signInWithGoogle() {
      const { error } = await deps.client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: deps.redirectTo } });
      return error ? { ok: false, message: authMessage(error) } : { ok: true };
    }
    async function resetPassword(email) {
      email = String(email || '').trim();
      if (!validEmail(email)) return { ok: false, message: 'Geçerli bir e-posta adresi girin.' };
      try {
        const { error } = await deps.client.auth.resetPasswordForEmail(email, { redirectTo: deps.redirectTo });
        if (error) {
          const msg = String(error.message || error.error_description || error);
          // E-postanın kayıtlı olup olmadığını sızdırmamak için yalnızca "bulunamadı" hatasını gizle.
          if (/user not found|no user/i.test(msg)) return { ok: true };
          return { ok: false, message: authMessage(error) };
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, message: authMessage(e) };
      }
    }
    async function updatePassword(password) {
      if (String(password || '').length < MIN_PASSWORD) return { ok: false, message: `Şifre en az ${MIN_PASSWORD} karakter olmalı.` };
      const { error } = await deps.client.auth.updateUser({ password });
      return error ? { ok: false, message: authMessage(error) } : { ok: true };
    }
    async function signOut(opts) {
      clrT(timer); timer = null;
      await deps.client.auth.signOut();
      session = null;
      try { st.removeItem(META_KEY); } catch (e) { /* yok say */ }
      if (opts && opts.wipeLocal && deps.wipeLocal) deps.wipeLocal();
      status('out');
    }
    async function deleteAccount() {
      const { error } = await deps.client.functions.invoke('delete-account', { method: 'POST' });
      if (error) return { ok: false, message: 'Hesap silinemedi. Lütfen tekrar deneyin.' };
      await signOut(); return { ok: true };
    }
    async function init() {
      await refreshSession();
      deps.client.auth.onAuthStateChange((event, s) => {
        session = s || null;
        if (event === 'PASSWORD_RECOVERY' && deps.onRecovery) deps.onRecovery();
        if (event === 'SIGNED_IN') schedule(0);
        if (event === 'SIGNED_OUT') status('out');
      });
      if (session) { status('syncing'); await syncNow(); } else status('out');
      return session;
    }
    return { init, syncNow, markDirty, resolve, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword, deleteAccount, getSession: () => session, getMeta: readMeta, destroy() { destroyed = true; clrT(timer); } };
  }

  return { create, isEmptyDb, sameDb, authMessage, validEmail, META_KEY, PREBACKUP_KEY, MIN_PASSWORD };
});
