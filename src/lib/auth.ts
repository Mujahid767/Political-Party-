import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret-min-32-char');
export interface JWTPayload { sub: string; email: string; name: string; role: string; }
export async function signToken(p: JWTPayload) {
  return new SignJWT({ ...p }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(SECRET);
}
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as unknown as JWTPayload;
}
export async function hashPassword(pw: string) { return bcrypt.hash(pw, 12); }
export async function comparePassword(pw: string, hash: string) { return bcrypt.compare(pw, hash); }
export const COOKIE_NAME = 'ppp_auth_token';
export const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 604800, path: '/' };
