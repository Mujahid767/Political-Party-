import { NextRequest, NextResponse } from 'next/server';
import { loginController } from '@/controllers/auth.controller';
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error:'Email and password required' },{status:400});
    const user = await loginController(email, password);
    return NextResponse.json({ success:true, data:user });
  } catch(e:unknown) { return NextResponse.json({ error:(e as Error).message },{status:401}); }
}
