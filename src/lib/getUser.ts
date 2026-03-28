import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import type { JWTPayload } from './auth';

export async function getUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ppp_auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch { return null; }
}
