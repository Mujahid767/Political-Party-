const fs = require('fs');
const path = require('path');
const root = __dirname;
function w(fp, c) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, c, 'utf8');
  console.log('✓ ' + fp);
}

// ── AUTH CONTROLLER ──────────────────────────────────────────
w('src/controllers/auth.controller.ts',
`import { prisma } from '@/lib/prisma';
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
`);

// ── CONSTITUENCY CONTROLLER ───────────────────────────────────
w('src/controllers/constituency.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getConstituencies(search?: string, region?: string, province?: string, page = 1, limit = 20) {
  const where: Record<string,unknown> = {};
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { number: { equals: parseInt(search) || undefined } }];
  if (region) where.region = region;
  if (province) where.province = province;
  const [data, total] = await Promise.all([
    prisma.constituency.findMany({ where, include: { mp: { select: { id:true,name:true,email:true } } }, orderBy: { number:'asc' }, skip:(page-1)*limit, take:limit }),
    prisma.constituency.count({ where }),
  ]);
  return { data, total, page, pages: Math.ceil(total/limit) };
}

export async function assignMp(constituencyId: string, mpId: string | null) {
  return prisma.constituency.update({ where: { id: constituencyId }, data: { mpId } });
}

export async function getConstituencyRegions() {
  const rows = await prisma.constituency.groupBy({ by: ['region','province'], orderBy: { region:'asc' } });
  return rows;
}
`);

// ── PROPOSAL CONTROLLER ───────────────────────────────────────
w('src/controllers/proposal.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getProposals(status?: string) {
  return prisma.proposal.findMany({
    where: status ? { status: status as never } : undefined,
    include: { createdBy: { select:{name:true,role:true} }, votes: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProposal(title: string, description: string, userId: string) {
  return prisma.proposal.create({ data: { title, description, createdById: userId } });
}

export async function closeProposal(id: string) {
  const proposal = await prisma.proposal.findUnique({ where:{id}, include:{votes:true} });
  if (!proposal) throw new Error('Proposal not found');
  const yes = proposal.votes.filter(v=>v.choice==='YES').length;
  const no = proposal.votes.filter(v=>v.choice==='NO').length;
  const status = yes > no ? 'PASSED' : 'REJECTED';
  return prisma.proposal.update({ where:{id}, data:{ status, closedAt: new Date() } });
}
`);

// ── VOTE CONTROLLER ───────────────────────────────────────────
w('src/controllers/vote.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function castVote(proposalId: string, ministerId: string, choice: 'YES'|'NO'|'ABSTAIN') {
  const proposal = await prisma.proposal.findUnique({ where:{id:proposalId} });
  if (!proposal || proposal.status !== 'OPEN') throw new Error('Proposal is not open for voting');
  const existing = await prisma.vote.findUnique({ where:{ proposalId_ministerId:{proposalId,ministerId} } });
  if (existing) throw new Error('You have already voted on this proposal');
  const vote = await prisma.vote.create({ data:{ choice, proposalId, ministerId } });
  await prisma.activityLog.create({ data:{ action:'VOTE', entity:'Proposal', entityId:proposalId, meta:choice, userId:ministerId } });
  return vote;
}

export async function getVoteResults(proposalId: string) {
  const votes = await prisma.vote.findMany({ where:{proposalId}, include:{ minister:{select:{name:true}} } });
  const yes = votes.filter(v=>v.choice==='YES').length;
  const no = votes.filter(v=>v.choice==='NO').length;
  const abstain = votes.filter(v=>v.choice==='ABSTAIN').length;
  return { yes, no, abstain, total: votes.length, votes };
}
`);

// ── MEETING CONTROLLER ────────────────────────────────────────
w('src/controllers/meeting.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getMeetings(mpId?: string, status?: string) {
  return prisma.meeting.findMany({
    where: { ...(mpId?{mpId}:{}), ...(status?{status:status as never}:{}) },
    include: { mp: { select:{name:true} } },
    orderBy: { scheduledAt: 'desc' },
  });
}

export async function createMeeting(data: { title:string; agenda:string; scheduledAt:string; location?:string; mpId:string }) {
  return prisma.meeting.create({ data: { ...data, scheduledAt: new Date(data.scheduledAt) } });
}

export async function updateMeetingStatus(id: string, status: 'SCHEDULED'|'COMPLETED'|'CANCELLED') {
  return prisma.meeting.update({ where:{id}, data:{status} });
}
`);

// ── EVENT CONTROLLER ──────────────────────────────────────────
w('src/controllers/event.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getEvents() {
  return prisma.event.findMany({
    include: { createdBy:{select:{name:true}}, _count:{select:{participants:true}} },
    orderBy: { startDate: 'desc' },
  });
}

export async function createEvent(data: { title:string; description:string; location:string; startDate:string; endDate:string; createdById:string }) {
  return prisma.event.create({ data:{ ...data, startDate:new Date(data.startDate), endDate:new Date(data.endDate) } });
}

export async function registerParticipant(eventId: string, name: string, email: string, userId?: string) {
  const existing = await prisma.eventParticipant.findUnique({ where:{eventId_email:{eventId,email}} });
  if (existing) throw new Error('Already registered');
  return prisma.eventParticipant.create({ data:{ eventId, name, email, userId } });
}
`);

// ── FUND CONTROLLER ───────────────────────────────────────────
w('src/controllers/fund.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getFunds(type?: string) {
  return prisma.fund.findMany({
    where: type ? { type: type as never } : undefined,
    include: { recordedBy:{select:{name:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFund(data: { type:'DONATION'|'EXPENSE'; amount:number; description:string; category:string; recordedById:string }) {
  return prisma.fund.create({ data });
}

export async function getFundSummary() {
  const [donations, expenses] = await Promise.all([
    prisma.fund.aggregate({ where:{type:'DONATION'}, _sum:{amount:true} }),
    prisma.fund.aggregate({ where:{type:'EXPENSE'}, _sum:{amount:true} }),
  ]);
  const totalIn = donations._sum.amount ?? 0;
  const totalOut = expenses._sum.amount ?? 0;
  return { totalIn, totalOut, balance: totalIn - totalOut };
}
`);

// ── COMPLAINT CONTROLLER ──────────────────────────────────────
w('src/controllers/complaint.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getComplaints(status?: string) {
  return prisma.complaint.findMany({
    where: status ? { status: status as never } : undefined,
    include: { submittedBy:{select:{name:true,email:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createComplaint(subject: string, description: string, userId: string) {
  return prisma.complaint.create({ data:{ subject, description, submittedById:userId } });
}

export async function updateComplaint(id: string, status: string, adminNote?: string) {
  return prisma.complaint.update({ where:{id}, data:{ status:status as never, adminNote } });
}
`);

// ── RUMOR CONTROLLER ──────────────────────────────────────────
w('src/controllers/rumor.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getRumors(status?: string) {
  return prisma.rumor.findMany({
    where: status ? { status: status as never } : undefined,
    include: { reportedBy:{select:{name:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createRumor(title: string, description: string, userId: string) {
  return prisma.rumor.create({ data:{ title, description, reportedById:userId } });
}

export async function verifyRumor(id: string, status: string, clarification?: string) {
  return prisma.rumor.update({ where:{id}, data:{ status:status as never, clarification } });
}
`);

// ── NEWS CONTROLLER ───────────────────────────────────────────
w('src/controllers/news.controller.ts',
`import { prisma } from '@/lib/prisma';

export async function getNews() {
  return prisma.news.findMany({
    include: { publishedBy:{select:{name:true}}, _count:{select:{comments:true,reactions:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createNews(title: string, content: string, userId: string, imageUrl?: string) {
  return prisma.news.create({ data:{ title, content, imageUrl, publishedById:userId } });
}

export async function addComment(newsId: string, content: string, userId: string) {
  return prisma.comment.create({ data:{ newsId, content, userId } });
}

export async function toggleReaction(newsId: string, userId: string, type: string) {
  const existing = await prisma.reaction.findUnique({ where:{newsId_userId:{newsId,userId}} });
  if (existing) { await prisma.reaction.delete({ where:{newsId_userId:{newsId,userId}} }); return null; }
  return prisma.reaction.create({ data:{ newsId, userId, type } });
}
`);

// ── API ROUTES ────────────────────────────────────────────────

w('src/app/api/auth/login/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { loginController } from '@/controllers/auth.controller';
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error:'Email and password required' },{status:400});
    const user = await loginController(email, password);
    return NextResponse.json({ success:true, data:user });
  } catch(e:unknown) { return NextResponse.json({ error:(e as Error).message },{status:401}); }
}
`);

w('src/app/api/auth/logout/route.ts',
`import { NextResponse } from 'next/server';
import { logoutController } from '@/controllers/auth.controller';
export async function POST() {
  await logoutController();
  return NextResponse.json({ success:true });
}
`);

w('src/app/api/auth/register/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { registerController } from '@/controllers/auth.controller';
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email||!password||!name) return NextResponse.json({error:'All fields required'},{status:400});
    const user = await registerController(email, password, name);
    return NextResponse.json({ success:true, data:user });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/auth/me/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const id = req.headers.get('x-user-id');
  if (!id) return NextResponse.json({error:'Unauthorized'},{status:401});
  const user = await prisma.user.findUnique({ where:{id}, select:{id:true,email:true,name:true,role:true,createdAt:true} });
  return NextResponse.json({ success:true, data:user });
}
`);

w('src/app/api/constituencies/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getConstituencies, getConstituencyRegions } from '@/controllers/constituency.controller';
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const result = await getConstituencies(s.get('search')??undefined, s.get('region')??undefined, s.get('province')??undefined, parseInt(s.get('page')||'1'), parseInt(s.get('limit')||'20'));
  return NextResponse.json({ success:true, ...result });
}
export async function GET_REGIONS() {
  const data = await getConstituencyRegions();
  return NextResponse.json({ success:true, data });
}
`);

w('src/app/api/constituencies/[id]/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { assignMp } from '@/controllers/constituency.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const { mpId } = await req.json();
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const data = await assignMp(id, mpId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/proposals/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getProposals, createProposal } from '@/controllers/proposal.controller';
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const data = await getProposals(status);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MINISTER' && role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { title, description } = await req.json();
    const data = await createProposal(title, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/proposals/[id]/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { closeProposal } from '@/controllers/proposal.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const data = await closeProposal(id);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/votes/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { castVote, getVoteResults } from '@/controllers/vote.controller';
export async function GET(req: NextRequest) {
  const proposalId = req.nextUrl.searchParams.get('proposalId');
  if (!proposalId) return NextResponse.json({error:'proposalId required'},{status:400});
  const data = await getVoteResults(proposalId);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MINISTER') return NextResponse.json({error:'Only ministers can vote'},{status:403});
    const { proposalId, choice } = await req.json();
    const data = await castVote(proposalId, userId, choice);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/meetings/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getMeetings, createMeeting } from '@/controllers/meeting.controller';
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!;
  const role = req.headers.get('x-user-role');
  const mpId = (role === 'MP') ? userId : req.nextUrl.searchParams.get('mpId') ?? undefined;
  const data = await getMeetings(mpId, req.nextUrl.searchParams.get('status') ?? undefined);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MP' && role !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const data = await createMeeting({ ...body, mpId: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/events/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/controllers/event.controller';
export async function GET() {
  const data = await getEvents();
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const data = await createEvent({ ...body, createdById: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/events/[id]/register/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { registerParticipant } from '@/controllers/event.controller';
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') ?? undefined;
    const { name, email } = await req.json();
    const data = await registerParticipant(id, name, email, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/funds/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getFunds, createFund, getFundSummary } from '@/controllers/fund.controller';
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? undefined;
  const summary = req.nextUrl.searchParams.get('summary') === 'true';
  if (summary) { const data = await getFundSummary(); return NextResponse.json({success:true,data}); }
  const data = await getFunds(type);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const data = await createFund({ ...body, recordedById: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/complaints/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, createComplaint } from '@/controllers/complaint.controller';
export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  const userId = req.headers.get('x-user-id')!;
  if (role !== 'ADMIN' && role !== 'CHAIRMAN') {
    const data = await getComplaints();
    const mine = (data as {submittedById:string}[]).filter(c=>c.submittedById===userId);
    return NextResponse.json({success:true,data:mine});
  }
  const data = await getComplaints(req.nextUrl.searchParams.get('status')??undefined);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { subject, description } = await req.json();
    const data = await createComplaint(subject, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/complaints/[id]/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { updateComplaint } from '@/controllers/complaint.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { status, adminNote } = await req.json();
    const data = await updateComplaint(id, status, adminNote);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/rumors/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getRumors, createRumor } from '@/controllers/rumor.controller';
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const data = await getRumors(status);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { title, description } = await req.json();
    const data = await createRumor(title, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/rumors/[id]/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { verifyRumor } from '@/controllers/rumor.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { status, clarification } = await req.json();
    const data = await verifyRumor(id, status, clarification);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/news/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { getNews, createNews } from '@/controllers/news.controller';
export async function GET() {
  const data = await getNews();
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({error:'Only admin can publish news'},{status:403});
    const { title, content, imageUrl } = await req.json();
    const data = await createNews(title, content, userId, imageUrl);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/news/[id]/comments/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/controllers/news.controller';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const data = await prisma.comment.findMany({ where:{newsId:id}, include:{user:{select:{name:true}}}, orderBy:{createdAt:'asc'} });
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id')!;
    const { content } = await req.json();
    const data = await addComment(id, content, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/news/[id]/reactions/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { toggleReaction } from '@/controllers/news.controller';
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id')!;
    const { type } = await req.json();
    const data = await toggleReaction(id, userId, type);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/users/route.ts',
`import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const data = await prisma.user.findMany({ select:{id:true,email:true,name:true,role:true,createdAt:true}, orderBy:{createdAt:'desc'} });
  return NextResponse.json({ success:true, data });
}
export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    const reqRole = req.headers.get('x-user-role');
    if (reqRole !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const data = await prisma.user.update({ where:{id}, data:{role} });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
`);

w('src/app/api/stats/route.ts',
`import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const [users, constituencies, proposals, complaints, rumors, news, funds] = await Promise.all([
    prisma.user.count(),
    prisma.constituency.count({ where:{ mpId:{not:null} } }),
    prisma.proposal.count({ where:{status:'OPEN'} }),
    prisma.complaint.count({ where:{status:'PENDING'} }),
    prisma.rumor.count({ where:{status:'UNDER_REVIEW'} }),
    prisma.news.count(),
    prisma.fund.aggregate({ _sum:{amount:true}, where:{type:'DONATION'} }),
  ]);
  return NextResponse.json({ success:true, data:{ users, assignedConstituencies:constituencies, openProposals:proposals, pendingComplaints:complaints, pendingRumors:rumors, newsCount:news, totalDonations:funds._sum.amount??0 } });
}
`);

console.log('\n✅ Backend files done!');
