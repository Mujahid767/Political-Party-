import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, signToken, COOKIE_NAME, cookieOpts } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function loginController(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');
  const token = await signToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, cookieOpts);
  await prisma.activityLog.create({ data: { action: 'LOGIN', entity: 'User', entityId: user.id, userId: user.id } });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function registerController(email: string, password: string, name: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email already registered');
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, name, passwordHash, role: 'PUBLIC' } });
  const token = await signToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, cookieOpts);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function logoutController() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
