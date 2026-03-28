const fs = require('fs');
const path = require('path');
const root = __dirname;
function w(fp, c) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, c, 'utf8');
  console.log('✓ ' + fp);
}

w('.env.local',
`DATABASE_URL="postgresql://neondb_owner:npg_1Cu0qDrvSMlN@ep-fragrant-lab-an52bvl4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="ppp-super-secret-jwt-2024-political-party-platform-secure"
NEXTAUTH_URL="http://localhost:3000"
`);

w('prisma/schema.prisma',
`generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
enum Role { ADMIN CHAIRMAN MINISTER MP PUBLIC }
enum VoteChoice { YES NO ABSTAIN }
enum ProposalStatus { OPEN CLOSED PASSED REJECTED }
enum ComplaintStatus { PENDING UNDER_REVIEW RESOLVED REJECTED }
enum RumorStatus { REPORTED UNDER_REVIEW VERIFIED_TRUE VERIFIED_FALSE PUBLISHED }
enum FundType { DONATION EXPENSE }
enum MeetingStatus { SCHEDULED COMPLETED CANCELLED }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(PUBLIC)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  constituency Constituency?
  proposals    Proposal[]
  votes        Vote[]
  meetings     Meeting[]
  funds        Fund[]
  complaints   Complaint[]
  rumors       Rumor[]
  news         News[]
  comments     Comment[]
  reactions    Reaction[]
  activityLogs ActivityLog[]
  events       Event[]
  @@map("users")
}
model Constituency {
  id       String  @id @default(cuid())
  number   Int     @unique
  name     String
  region   String
  province String
  mpId     String? @unique
  mp       User?   @relation(fields: [mpId], references: [id])
  @@map("constituencies")
}
model Proposal {
  id          String         @id @default(cuid())
  title       String
  description String
  status      ProposalStatus @default(OPEN)
  createdById String
  createdBy   User           @relation(fields: [createdById], references: [id])
  createdAt   DateTime       @default(now())
  closedAt    DateTime?
  votes       Vote[]
  @@map("proposals")
}
model Vote {
  id         String     @id @default(cuid())
  choice     VoteChoice
  proposalId String
  ministerId String
  createdAt  DateTime   @default(now())
  proposal   Proposal   @relation(fields: [proposalId], references: [id])
  minister   User       @relation(fields: [ministerId], references: [id])
  @@unique([proposalId, ministerId])
  @@map("votes")
}
model Meeting {
  id          String        @id @default(cuid())
  title       String
  agenda      String
  scheduledAt DateTime
  location    String?
  status      MeetingStatus @default(SCHEDULED)
  mpId        String
  mp          User          @relation(fields: [mpId], references: [id])
  createdAt   DateTime      @default(now())
  @@map("meetings")
}
model Event {
  id           String   @id @default(cuid())
  title        String
  description  String
  location     String
  startDate    DateTime
  endDate      DateTime
  createdById  String
  createdBy    User     @relation(fields: [createdById], references: [id])
  createdAt    DateTime @default(now())
  participants EventParticipant[]
  @@map("events")
}
model EventParticipant {
  id      String  @id @default(cuid())
  eventId String
  userId  String?
  name    String
  email   String
  event   Event   @relation(fields: [eventId], references: [id])
  @@unique([eventId, email])
  @@map("event_participants")
}
model Fund {
  id           String   @id @default(cuid())
  type         FundType
  amount       Float
  description  String
  category     String
  recordedById String
  recordedBy   User     @relation(fields: [recordedById], references: [id])
  createdAt    DateTime @default(now())
  @@map("funds")
}
model Complaint {
  id            String          @id @default(cuid())
  subject       String
  description   String
  status        ComplaintStatus @default(PENDING)
  submittedById String
  submittedBy   User            @relation(fields: [submittedById], references: [id])
  adminNote     String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  @@map("complaints")
}
model Rumor {
  id            String      @id @default(cuid())
  title         String
  description   String
  status        RumorStatus @default(REPORTED)
  reportedById  String
  reportedBy    User        @relation(fields: [reportedById], references: [id])
  clarification String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  @@map("rumors")
}
model News {
  id            String   @id @default(cuid())
  title         String
  content       String
  imageUrl      String?
  publishedById String
  publishedBy   User     @relation(fields: [publishedById], references: [id])
  createdAt     DateTime @default(now())
  comments      Comment[]
  reactions     Reaction[]
  @@map("news")
}
model Comment {
  id        String   @id @default(cuid())
  content   String
  newsId    String
  userId    String
  createdAt DateTime @default(now())
  news      News     @relation(fields: [newsId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@map("comments")
}
model Reaction {
  id        String   @id @default(cuid())
  type      String
  newsId    String
  userId    String
  createdAt DateTime @default(now())
  news      News     @relation(fields: [newsId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([newsId, userId])
  @@map("reactions")
}
model ActivityLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String?
  meta      String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  @@map("activity_logs")
}
`);

w('src/lib/prisma.ts',
`import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
`);

w('src/lib/auth.ts',
`import { SignJWT, jwtVerify } from 'jose';
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
`);

w('src/middleware.ts',
`import { NextResponse } from 'next/server';
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
`);

w('src/types/index.ts',
`export type UserRole = 'ADMIN'|'CHAIRMAN'|'MINISTER'|'MP'|'PUBLIC';
export type VoteChoice = 'YES'|'NO'|'ABSTAIN';
export type ProposalStatus = 'OPEN'|'CLOSED'|'PASSED'|'REJECTED';
export type ComplaintStatus = 'PENDING'|'UNDER_REVIEW'|'RESOLVED'|'REJECTED';
export type RumorStatus = 'REPORTED'|'UNDER_REVIEW'|'VERIFIED_TRUE'|'VERIFIED_FALSE'|'PUBLISHED';
export type FundType = 'DONATION'|'EXPENSE';
export interface AuthUser { id: string; email: string; name: string; role: UserRole; }
export interface ApiResponse<T=unknown> { success: boolean; data?: T; error?: string; message?: string; }
`);

w('prisma/seed.ts',
`import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const PROVINCES = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh'];
async function main() {
  console.log('🌱 Seeding...');
  const h = (pw: string) => bcrypt.hash(pw, 12);
  const admin = await prisma.user.upsert({ where:{email:'admin@party.gov'}, update:{}, create:{email:'admin@party.gov',name:'System Administrator',passwordHash:await h('Admin@123'),role:Role.ADMIN} });
  await prisma.user.upsert({ where:{email:'chairman@party.gov'}, update:{}, create:{email:'chairman@party.gov',name:'Party Chairman',passwordHash:await h('Chairman@123'),role:Role.CHAIRMAN} });
  const minister = await prisma.user.upsert({ where:{email:'minister@party.gov'}, update:{}, create:{email:'minister@party.gov',name:'Senior Minister',passwordHash:await h('Minister@123'),role:Role.MINISTER} });
  const mp = await prisma.user.upsert({ where:{email:'mp@party.gov'}, update:{}, create:{email:'mp@party.gov',name:'Honourable MP',passwordHash:await h('Mp@123456'),role:Role.MP} });
  const pub = await prisma.user.upsert({ where:{email:'public@example.com'}, update:{}, create:{email:'public@example.com',name:'Demo Public User',passwordHash:await h('Public@123'),role:Role.PUBLIC} });
  console.log('✓ Users');
  const existing = await prisma.constituency.count();
  if (existing === 0) {
    await prisma.constituency.createMany({ data: Array.from({length:300},(_,i)=>({ number:i+1, name:'Constituency-'+(i+1), region:'Region '+Math.ceil((i+1)/12), province:PROVINCES[i%8], mpId:i===0?mp.id:null })) });
    console.log('✓ 300 constituencies');
  }
  const proposal = await prisma.proposal.upsert({ where:{id:'seed-p1'}, update:{}, create:{id:'seed-p1',title:'National Infrastructure Development Bill',description:'Allocate funds for rural road construction and electrification across all 300 constituencies.',status:'OPEN',createdById:admin.id} });
  await prisma.vote.upsert({ where:{proposalId_ministerId:{proposalId:proposal.id,ministerId:minister.id}}, update:{}, create:{choice:'YES',proposalId:proposal.id,ministerId:minister.id} });
  await prisma.news.upsert({ where:{id:'seed-n1'}, update:{}, create:{id:'seed-n1',title:'Party Wins Regional Election with Landslide Victory',content:'Our party secured a decisive victory winning 85% of contested seats. The chairman expressed gratitude to all voters.',publishedById:admin.id} });
  await prisma.event.upsert({ where:{id:'seed-e1'}, update:{}, create:{id:'seed-e1',title:'Annual Party Convention 2024',description:'Annual gathering of all party members.',location:'National Assembly Hall, Dhaka',startDate:new Date('2024-12-15T09:00:00Z'),endDate:new Date('2024-12-15T18:00:00Z'),createdById:admin.id} });
  await prisma.fund.createMany({ skipDuplicates:true, data:[
    {type:'DONATION',amount:500000,description:'Corporate sponsorship Q4',category:'Corporate',recordedById:admin.id},
    {type:'DONATION',amount:150000,description:'Member contributions',category:'Member Dues',recordedById:admin.id},
    {type:'EXPENSE',amount:75000,description:'Campaign materials',category:'Campaign',recordedById:admin.id},
    {type:'EXPENSE',amount:25000,description:'Office supplies',category:'Operations',recordedById:admin.id},
  ]});
  await prisma.complaint.upsert({ where:{id:'seed-c1'}, update:{}, create:{id:'seed-c1',subject:'Delayed Constituency Funds',description:'Development funds not disbursed for 3 months.',status:'PENDING',submittedById:pub.id} });
  await prisma.rumor.upsert({ where:{id:'seed-r1'}, update:{}, create:{id:'seed-r1',title:'Rumor about party merger',description:'Unverified claims on social media about a party merger.',status:'UNDER_REVIEW',reportedById:pub.id} });
  console.log('\\n🎉 Seeded!\\nAdmin: admin@party.gov / Admin@123\\nChairman: chairman@party.gov / Chairman@123\\nMinister: minister@party.gov / Minister@123\\nMP: mp@party.gov / Mp@123456\\nPublic: public@example.com / Public@123');
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
`);

w('package.json',
`{
  "name": "political-party-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.5.0",
    "bcrypt": "^5.1.1",
    "clsx": "^2.1.1",
    "jose": "^5.9.6",
    "lucide-react": "^0.469.0",
    "next": "15.2.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.2.4",
    "prisma": "^6.5.0",
    "tailwindcss": "^4",
    "tsx": "^4.19.2",
    "typescript": "^5"
  }
}
`);

console.log('\n✅ Foundation files done!');
