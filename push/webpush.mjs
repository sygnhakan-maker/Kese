const bytes = new TextEncoder();
export const b64 = (value) => btoa(String.fromCharCode(...new Uint8Array(value))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
export const raw = (value) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
const concat = (...parts) => Uint8Array.from(parts.flatMap(p => [...new Uint8Array(p)]));
const curve = {name: 'ECDH', namedCurve: 'P-256'};

async function derive(secret, salt, info, bits) {
  const key = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  return crypto.subtle.deriveBits({name:'HKDF', hash:'SHA-256', salt, info}, key, bits);
}

// RFC 8291 single-record aes128gcm, with a fresh ephemeral key and salt per message.
export async function encrypt(keys, message, sender, salt = crypto.getRandomValues(new Uint8Array(16))) {
  sender ??= await crypto.subtle.generateKey(curve, true, ['deriveBits']);
  const receiver = raw(keys.p256dh);
  const pub = await crypto.subtle.exportKey('raw', sender.publicKey);
  const dest = await crypto.subtle.importKey('raw', receiver, curve, false, []);
  const shared = await crypto.subtle.deriveBits({name:'ECDH', public: dest}, sender.privateKey, 256);
  const ikm = await derive(shared, raw(keys.auth), concat(bytes.encode('WebPush: info\0'), receiver, pub), 256);
  const cek = await derive(ikm, salt, bytes.encode('Content-Encoding: aes128gcm\0'), 128);
  const nonce = await derive(ikm, salt, bytes.encode('Content-Encoding: nonce\0'), 96);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM', iv:nonce}, aes, concat(bytes.encode(message), [2]));
  return concat(salt, [0,0,16,0,65], pub, ciphertext);
}

export async function vapid(pair, audience, subject) {
  const jwt = [ {typ:'JWT', alg:'ES256'}, {aud:audience, exp:Math.floor(Date.now()/1000) + 3600, sub:subject} ]
    .map(value => b64(bytes.encode(JSON.stringify(value)))).join('.');
  const key = await crypto.subtle.importKey('jwk', pair.privateKey, {name:'ECDSA', namedCurve:'P-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign({name:'ECDSA', hash:'SHA-256'}, key, bytes.encode(jwt));
  return 'vapid t=' + jwt + '.' + b64(sig) + ', k=' + pair.publicKey;
}
