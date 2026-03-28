import { PrismaClient, Role } from '@prisma/client';
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
  console.log('\n🎉 Seeded!\nAdmin: admin@party.gov / Admin@123\nChairman: chairman@party.gov / Chairman@123\nMinister: minister@party.gov / Minister@123\nMP: mp@party.gov / Mp@123456\nPublic: public@example.com / Public@123');
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
