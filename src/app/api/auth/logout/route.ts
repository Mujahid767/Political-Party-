import { NextResponse } from 'next/server';
import { logoutController } from '@/controllers/auth.controller';
export async function POST() {
  await logoutController();
  return NextResponse.json({ success:true });
}
