import { createHmac } from 'crypto';

//version <9
import jwt from 'jsonwebtoken';


function b64urlEncode(data: Buffer | string): string {
  let input = typeof data === 'string' ? Buffer.from(data) : data;
  return input.toString('base64url');
}

function generateHS256Token(payload: Record<string, any>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = b64urlEncode(JSON.stringify(header));
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  
  const data = `${headerB64}.${payloadB64}`;
  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  const signature = b64urlEncode(hmac.digest());
  
  return `${data}.${signature}`;
}

const secret = 'my-super-secret-key!!';
const payload = { sub: 'user123', name: 'John Doe', role: 'user' };

const token = generateHS256Token(payload, secret);

const verifyValidToken = jwt.verify(token, secret);
console.log("is it okay?", verifyValidToken)


const invalidToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.';
const verifyInvalidSignatureToken = jwt.verify(invalidToken, undefined as any);

