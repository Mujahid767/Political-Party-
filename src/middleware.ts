import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-dev-secret-min-32-char');
const ROLE_HOME: Record<string,string> = { ADMIN:'/dashboard/admin', CHAIRMAN:'/dashboard/chairman', MINISTER:'/dashboard/minister', MP:'/dashboard/mp', PUBLIC:'/dashboard/public' };
const PUBLIC = ['/login','/api/auth/login','/api/auth/register'];
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p)) || (!pathname.startsWith('/dashboard') && !pathname.startsWith('/api'))) return NextResponse.next();
  const token = req.cookies.get('ppp_auth_token')?.value;
  if (!token) return pathname.startsWith('/api') ? NextResponse.json({ error:'Unauthorized' },{status:401}) : NextResponse.redirect(new URL('/login',req.url));
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;
    const h = new Headers(req.headers);
    h.set('x-user-id', payload.sub as string);
    h.set('x-user-role', role);
    h.set('x-user-email', payload.email as string);
    h.set('x-user-name', payload.name as string);
    const adminOnly = ['/dashboard/admin','/api/users'];
    if (adminOnly.some(p=>pathname.startsWith(p)) && role!=='ADMIN' && role!=='CHAIRMAN') {
      return pathname.startsWith('/api') ? NextResponse.json({error:'Forbidden'},{status:403}) : NextResponse.redirect(new URL(ROLE_HOME[role]??'/login',req.url));
    }
    return NextResponse.next({ request: { headers: h } });
  } catch {
    const res = pathname.startsWith('/api') ? NextResponse.json({error:'Invalid token'},{status:401}) : NextResponse.redirect(new URL('/login',req.url));
    res.cookies.delete('ppp_auth_token');
    return res;
  }
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
