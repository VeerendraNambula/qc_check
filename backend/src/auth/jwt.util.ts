import * as crypto from 'node:crypto';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
}

export function signAccessToken(
  user: { id: string; username: string; role: string; tokenVersion?: number },
  now = Math.floor(Date.now() / 1000),
): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    iat: now,
    exp: now + 60 * 60,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = header + '.' + body;
  const signature = crypto.createHmac('sha256', getSecret()).update(unsigned).digest('base64url');
  return unsigned + '.' + signature;
}

export function verifyAccessToken(token: string, now = Math.floor(Date.now() / 1000)): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerPart, payloadPart, signaturePart] = parts;
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    const unsigned = headerPart + '.' + payloadPart;
    const expected = crypto.createHmac('sha256', getSecret()).update(unsigned).digest();
    const actual = Buffer.from(signaturePart, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as JwtPayload;
    if (
      !payload.sub ||
      !payload.username ||
      !payload.role ||
      !Number.isInteger(payload.tokenVersion) ||
      payload.tokenVersion < 0 ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= now
    ) return null;
    return payload;
  } catch {
    return null;
  }
}
