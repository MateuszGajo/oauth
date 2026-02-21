import { createVerify, createHmac } from 'crypto';

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef
-----END PUBLIC KEY-----`;

const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ sub: 'admin', role: 'admin' })).toString('base64url');
const data = `${header}.${payload}`;
const sig = createHmac('sha256', PUBLIC_KEY_PEM).update(data).digest('base64url');
const confusedToken = `${data}.${sig}`;

function vulnerableVerify(token: string, key: string) {
  const [hB64, pB64, sB64] = token.split('.');
  const header = JSON.parse(Buffer.from(hB64, 'base64url').toString());
  const data = `${hB64}.${pB64}`;

  if (header.alg === 'HS256') {
    // Trusts alg from header → attacker controls this!
    const expected = createHmac('sha256', key).update(data).digest('base64url');
    if (expected === sB64) return JSON.parse(Buffer.from(pB64, 'base64url').toString());
  }

  if (header.alg === 'RS256') {
    const verifier = createVerify('RSA-SHA256');
    verifier.update(data);
    if (verifier.verify(key, sB64, 'base64url')) return JSON.parse(Buffer.from(pB64, 'base64url').toString());
  }

  return null;
}

console.log(vulnerableVerify(confusedToken, PUBLIC_KEY_PEM));


// Take PUBLIC_KEY_PEM string
//   Use it as HMAC secret to sign their token
//    Server receives token → reads alg: "HS256" → runs HMAC with same PUBLIC_KEY_PEM → identical result


// RS 
// private key -> signs tokens // only issue has this
// public key -> verifies tokens (server uses to check)

 
// 1. Server stores PUBLIC_KEY_PEM to verify RS256 tokens
// 2. Attacker changes alg: "RS256" → "HS256" in token header
// 3. Vulnerable server reads alg from header → switches to HMAC path
// 4. HMAC path uses the same key variable → PUBLIC_KEY_PEM
// 5. Attacker already signed token with HMAC(data, PUBLIC_KEY_PEM)
// 6. Server runs HMAC(data, PUBLIC_KEY_PEM) → MATCH


// e.g how jsonwebtoken verifies it

// Simplified jsonwebtoken internal logic
// function verify(token, key, options) {
//   const header = decodeHeader(token);  // Still untrusted at this point!

//   // Check 1: header.alg must be in allowed list
//   if (!options.algorithms.includes(header.alg)) {
//     throw new Error('invalid algorithm');
//   }

//   // Check 2: key type must match algorithm
//   if (header.alg === 'HS256' && isAsymmetricKey(key)) {
//     throw new Error('key type mismatch');
//   }

//   // Only NOW verify signature
//   return verifySignature(token, key, header.alg);
// }