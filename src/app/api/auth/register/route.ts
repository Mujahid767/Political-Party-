import { NextRequest, NextResponse } from 'next/server';
import { registerController } from '@/controllers/auth.controller';
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email||!password||!name) return NextResponse.json({error:'All fields required'},{status:400});
    const user = await registerController(email, password, name);
    return NextResponse.json({ success:true, data:user });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
