import { prisma } from '@/lib/prisma';

export async function getConstituencies(search?: string, region?: string, province?: string, page = 1, limit = 20) {
  const where: Record<string,unknown> = {};
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { nameBn: { contains: search } }, { number: { equals: parseInt(search) || undefined } }];
  if (region) where.region = region;
  if (province) where.province = province;
  const [data, total] = await Promise.all([
    prisma.constituency.findMany({ where, include: { mp: { select: { id:true,name:true,email:true,partyName:true,mpImageUrl:true } } }, orderBy: { number:'asc' }, skip:(page-1)*limit, take:limit }),
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
