import {b64, raw, encrypt, vapid} from './webpush.mjs';
import {dayAt, nextEvent, notification} from './schedule.mjs';

const json = (data,status=200) => Response.json(data,{status, headers:{'Cache-Control':'no-store'}});
const keyStore = env => env.PUSH.get(env.PUSH.idFromName('application-signing-key'));
const digest = async value => b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));

export function safeEndpoint(value) {
  try {
    const u = new URL(value);
    const host = u.hostname;
    return typeof value === 'string' && value.length <= 2048 && u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.hash &&
      (host === 'web.push.apple.com' || host.endsWith('.push.apple.com') || host === 'fcm.googleapis.com' ||
       host === 'push.services.mozilla.com' || host.endsWith('.push.services.mozilla.com') || host.endsWith('.notify.windows.com')) && u.pathname.length > 1;
  } catch { return false; }
}

function validDates(list, limit) {
  return Array.isArray(list) && list.length <= limit && list.every(d => typeof d === 'string' && /^\d{4}-\d\d-\d\d$/.test(d) &&
    Number.isFinite(Date.parse(d)) && new Date(d).toISOString().startsWith(d));
}

export function cleanPlan(input) {
  if (!input || !['daily','weekly','due','complete','private'].every(k => typeof input[k] === 'boolean') ||
      !validDates(input.days,8) || !validDates(input.dates,4096) ||
      (input.completionId && !/^[a-f0-9-]{36}$/.test(input.completionId))) throw Error();
  const {daily,weekly,due,complete} = input;
  return {daily,weekly,due,complete,private:input.private,
    days:daily || weekly ? [...new Set(input.days)].sort() : [],
    dates:due ? [...new Set(input.dates)].sort() : [],
    completionId:complete ? input.completionId || '' : ''};
}

async function limitedJSON(req) {
  const reader = req.body?.getReader();
  if (!reader) throw Error();
  let length = 0, chunks = [];
  for (;;) {
    const {done,value} = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 65000) { await reader.cancel(); throw Error(); }
    chunks.push(value);
  }
  return JSON.parse(await new Blob(chunks).text());
}

export default {
  async fetch(req,env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/push/')) return env.ASSETS.fetch(req);
    if (url.pathname === '/api/push/key' && req.method === 'GET') return keyStore(env).fetch('https://internal/key');
    if (url.pathname !== '/api/push/subscription' || !['PUT','DELETE'].includes(req.method)) return json({},404);
    if (req.headers.get('Origin') !== url.origin || !req.headers.get('Content-Type')?.startsWith('application/json')) return json({},403);
    if (env.PUSH_LIMIT && !(await env.PUSH_LIMIT.limit({key:req.headers.get('CF-Connecting-IP') || 'local'})).success) return json({},429);
    const token = req.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) return json({},401);
    try {
      const data = await limitedJSON(req);
      if (!safeEndpoint(data.endpoint)) return json({},400);
      const payload = {owner:await digest(token)};
      if (req.method === 'PUT') {
        if (!/^[A-Za-z0-9_-]{87}$/.test(data.keys?.p256dh) || !/^[A-Za-z0-9_-]{22}$/.test(data.keys?.auth)) return json({},400);
        await crypto.subtle.importKey('raw',raw(data.keys.p256dh),{name:'ECDH',namedCurve:'P-256'},false,[]);
        Object.assign(payload,{subscription:{endpoint:data.endpoint,keys:{p256dh:data.keys.p256dh,auth:data.keys.auth}},plan:cleanPlan(data.plan)});
      }
      const id = env.PUSH.idFromName('subscription:' + await digest(data.endpoint));
      return env.PUSH.get(id).fetch('https://internal/device',{method:req.method, body:JSON.stringify(payload)});
    } catch { return json({},400); }
  }
};

export class PushDevice {
  constructor(ctx,env) { this.ctx=ctx; this.store=ctx.storage; this.env=env; }
  async fetch(req) {
    return this.ctx.blockConcurrencyWhile(async () => {
      const path = new URL(req.url).pathname;
      if (path === '/key' || path === '/sign') {
        let pair = await this.store.get('key');
        if (!pair) {
          const k = await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
          pair = {publicKey:b64(await crypto.subtle.exportKey('raw',k.publicKey)), privateKey:await crypto.subtle.exportKey('jwk',k.privateKey)};
          await this.store.put('key',pair);
        }
        if (path === '/key') return json({key:pair.publicKey});
        const audience = await req.text();
        return json({header:await vapid(pair,audience,this.env.VAPID_SUBJECT)});
      }
      const data = await req.json(), old = await this.store.get('device');
      if (old && old.owner !== data.owner) return json({},403);
      if (req.method === 'DELETE') { await this.remove(); return json({ok:true}); }
      const {plan} = data, now = Date.now();
      if (plan.complete && plan.completionId && plan.completionId !== old?.plan.completionId) plan.finished = now + 1000;
      else plan.finished = plan.complete ? old?.plan.finished || 0 : 0;
      // Preserve a due alarm across edits while still applying the latest preferences.
      const cursor = old?.event && old.event.time <= now ? old.event.time - 1 : now;
      await this.schedule(data,cursor);
      return json({ok:true});
    });
  }
  async remove() { await this.store.deleteAlarm(); await this.store.deleteAll(); }
  async schedule(device,cursor) {
    device.event = nextEvent(device.plan,cursor) || null;
    await this.store.put('device',device);
    if (device.event) await this.store.setAlarm(Math.max(Date.now()+1,device.event.time));
    else await this.store.deleteAlarm();
  }
  async alarm() {
    return this.ctx.blockConcurrencyWhile(async () => {
      const device = await this.store.get('device');
      if (!device?.event) return;
      const {event,plan,subscription} = device, now = Date.now();
      if (event.time > now) { await this.store.setAlarm(event.time); return; }
      // Avoid stale alerts on wake-up after a service interruption.
      if (now-event.time < 3600000 && event.day === dayAt(now)) {
        try {
          const body = await encrypt(subscription.keys,JSON.stringify(notification(plan,event)));
          const auth = await keyStore(this.env).fetch('https://internal/sign',{method:'POST',body:new URL(subscription.endpoint).origin});
          const {header} = await auth.json();
          const response = await fetch(subscription.endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),
            headers:{Authorization:header,TTL:'3600',Urgency:'normal','Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream'},body});
          if ([404,410].includes(response.status)) { await this.remove(); return; }
          if (!response.ok) throw Error('Push service ' + response.status);
        } catch { await this.store.setAlarm(now+300000); return; }
      }
      if (event.kind === 'complete') plan.finished = 0;
      await this.schedule(device,event.time);
    });
  }
}
