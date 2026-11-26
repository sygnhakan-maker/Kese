/* Device-specific subscription credentials stay outside the financial backup. */
(() => {
  const KEY = 'kese.push.device.v1';
  const defaults = {daily:true, due:true, weekly:true, complete:true, private:true};
  const labels = {daily:'Günlük harcama kaydı · 21.00',due:'Yaklaşan ödeme · bir gün önce 10.00',weekly:'Haftalık disiplin özeti · pazar 20.00',complete:'Taksit planı tamamlandığında',private:'Kilit ekranında ayrıntıları gizle'};
  const dateAt = ms => new Date(ms + 10800000).toISOString().slice(0,10);
  const today = () => dateAt(Date.now());
  const base64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const from64 = str => Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
  let state = {}, context, busy = false, status = '', chain = Promise.resolve(), lastSynced = '';
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const prefs = () => ({...defaults,...state.prefs});
  const persist = () => localStorage.setItem(KEY,JSON.stringify(state));
  const refresh = () => { const node = document.querySelector('#push-settings'); if (node) node.outerHTML = panel(); };
  const supported = () => isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !document.querySelector('meta[name="kese-preview"]') && window.KeseStore?.mode !== 'server';
  const notes = () => {
    const days = context?.db()?.ayarlar?.harcamasiz_gunler;
    return Array.isArray(days) ? days : [];
  };
  const recorded = date => context && context.calc.recordedSpend(context.db(),date,date) > 0;
  function dayButton() {
    if (!context || !context.db() || context.sim()) return '';
    if (recorded(today())) return '<small>Bugünün harcaması kaydedildi.</small>';
    const marked = notes().includes(today());
    return '<button type="button" class="btn sm" data-push-action="day" aria-pressed="' + marked + '">' + (marked ? 'Harcamasız gün işaretini kaldır' : 'Bugün harcama yapmadım') + '</button>';
  }
  function panel() {
    const enabled = Boolean(state.subscription && !state.removing && state.registered);
    const unavailable = !supported();
    const denied = !unavailable && Notification.permission === 'denied';
    const disabled = busy || (!enabled && (denied || unavailable));
    const help = unavailable ? 'iPhone’da iOS 16.4 veya üstünde Safari’den Paylaş → Ana Ekrana Ekle’yi seç, ardından Kese’yi ana ekrandan aç.' : denied ? 'Bildirim izni kapalı. Cihaz ayarlarından Kese için bildirimlere izin verebilirsin.' : '';
    return '<section class="panel" id="push-settings"><header><div><h2>Bildirimler</h2><p>Saatler Türkiye saatidir. Seçtiğin bildirimler için cihaz aboneliği ve gerekli günler iletilir. Tutarlar, banka ve hesap adları cihazda kalır.</p></div></header><div class="pad"><fieldset ' + (busy?'disabled':'') + '><legend>Bu cihazdaki tercihler</legend>' +
      Object.entries(labels).map(([k,v])=>'<label style="display:flex;align-items:center;gap:.6rem;margin:.6rem 0"><input style="width:auto" type="checkbox" data-push-pref="'+k+'" '+(prefs()[k]?'checked':'')+'>'+v+'</label>').join('') + '</fieldset><p><button type="button" class="btn" data-push-action="'+(enabled?'disable':'enable')+'" '+(disabled?'disabled':'')+'>' +
      (enabled ? 'Bildirimleri kapat' : 'Bildirimleri aç') + '</button></p><p role="status">'+ (status || help || (enabled?'Bu cihazda bildirimler açık.':'Bu cihazda bildirimler kapalı.')) + '</p>' + dayButton() + '</div></section>';
  }

  function snapshot() {
    const db = context.db(), p = prefs(), days = [], due = new Set(), pending = [], closed = [];
    for (let offset = p.weekly ? 6 : 0; (p.daily || p.weekly) && offset >= 0; offset--) {
      const d = dateAt(Date.now()-offset*86400000);
      if (notes().includes(d) || recorded(d)) days.push(d);
    }
    for (const e of context.calc.items(db)) {
      const rows = context.calc.unpaid(e.item);
      if (p.due) for (const t of rows) if (t.vade_tarihi >= today()) due.add(t.vade_tarihi);
      if (p.complete && e.item.taksitler?.length > 1) {
        const id = [e.cat,e.parent?.id || '',e.item.id].join('/');
        if (rows.length) pending.push(id);
        else if (e.item.taksitler.every(t=>t.odendi || t.sigortaGecmis)) closed.push(id);
      }
    }
    if (state.pending && closed.some(id => state.pending.includes(id))) state.completionId = crypto.randomUUID();
    state.pending = pending;
    if (!p.complete) state.completionId = '';
    persist();
    return {...p,days,dates:[...due].sort().slice(0,4096),completionId:state.completionId || ''};
  }

  async function api(method,body) {
    const response = await fetch('/api/push/subscription',{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+state.token},
      cache:'no-store',signal:AbortSignal.timeout(10000),body:JSON.stringify(body)});
    if (!response.ok || !(await response.json()).ok) throw Error('push');
  }
  async function sync() {
    if (!state.subscription || !context) return;
    if (state.removing) {
      await api('DELETE',{endpoint:state.subscription.endpoint});
      state = {prefs:state.prefs}; persist(); lastSynced = ''; return;
    }
    if (context.sim()) return;
    const plan = snapshot(), serial = JSON.stringify([state.subscription.endpoint,plan]);
    if (serial !== lastSynced) { await api('PUT',{...state.subscription,plan}); lastSynced = serial; state.registered = true; persist(); }
  }
  function queued() {
    chain = chain.catch(()=>{}).then(sync);
    return chain;
  }
  function changed() {
    if (!state.subscription) return;
    queued().then(()=>{ status=''; refresh(); }).catch(()=>{ status='Sunucuya ulaşılamadı. Bağlantı geldiğinde tekrar eşitlenecek.'; refresh(); });
  }
  async function disable() {
    if (!state.subscription) return;
    state.removing = true; persist();
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      const sub = await reg?.pushManager?.getSubscription();
      await sub?.unsubscribe();
    } finally { await queued(); }
  }
  async function reset() {
    delete state.pending;
    delete state.completionId;
    delete state.prefs;
    if (state.subscription) await disable();
    localStorage.removeItem(KEY);
  }
  async function enable() {
    // iOS requires the permission request during the originating tap.
    if (await Notification.requestPermission() !== 'granted') { status='Bildirim izni verilmedi.'; return; }
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg?.active) { status='Kese kurulumu tamamlanınca tekrar dene.'; return; }
    const res = await fetch('/api/push/key',{cache:'no-store',signal:AbortSignal.timeout(10000)});
    if (!res.ok) throw Error('key');
    const {key} = await res.json();
    if (!/^[\w-]{87}$/.test(key)) throw Error('key');
    if (state.removing) await queued();
    state.token ||= base64(crypto.getRandomValues(new Uint8Array(32))); persist();
    let sub = await reg.pushManager.getSubscription();
    // A browser subscription without its original management token cannot be reclaimed.
    if (sub && (!state.subscription || base64(new Uint8Array(sub.options.applicationServerKey)) !== key)) {
      await sub.unsubscribe(); sub = null;
    }
    sub ||= await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:from64(key)});
    state.subscription = sub.toJSON(); persist();
    await queued();
  }
  async function reconcileDevice() {
    if (!state.subscription || !supported()) return;
    try {
      if (!state.removing) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg?.active) return;
        const actual = await reg.pushManager.getSubscription();
        if (actual?.endpoint !== state.subscription.endpoint) {
          const prior = state.subscription;
          await api('DELETE',{endpoint:prior.endpoint});
          state.subscription = actual?.toJSON(); state.pending = null; persist(); lastSynced = '';
        }
      }
      await sync(); status=''; refresh();
    } catch { status='Bildirim aboneliği doğrulanamadı.'; refresh(); }
  }
  function reconcile() {
    chain = chain.catch(()=>{}).then(reconcileDevice);
    return chain;
  }
  document.addEventListener('click', async ev => {
    const action = ev.target.closest?.('[data-push-action]')?.dataset.pushAction;
    if (!action || busy || !context || context.sim()) return;
    if (action === 'day') {
      const date = today(), settings = context.db().ayarlar;
      settings.harcamasiz_gunler = notes().includes(date) ? notes().filter(d=>d!==date) : [...notes(),date];
      const dialog = ev.target.closest('dialog');
      await context.save();
      if (dialog?.open) dialog.close();
      return;
    }
    busy = true; status=''; refresh();
    try { if (action === 'enable') await enable(); else await disable(); }
    catch { status='Bildirim hizmetine ulaşılamadı. Bağlantını kontrol edip tekrar dene.'; }
    finally { busy=false; refresh(); }
  });
  document.addEventListener('change', ev => {
    const k = ev.target.dataset.pushPref;
    if (!Object.hasOwn(defaults,k) || !context || context.sim()) return;
    state.prefs = {...prefs(),[k]:ev.target.checked}; persist(); changed();
  });
  window.KesePush = {panel, dayButton, changed, disable, reset, reconcile, init(ctx) { context=ctx; }};
  addEventListener('online',reconcile);
  document.addEventListener('visibilitychange',()=>{ if (document.visibilityState==='visible') reconcile(); });
})();
