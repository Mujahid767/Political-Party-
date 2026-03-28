const fs = require('fs');
const amp = String.fromCharCode(38);
const content = [
  'DATABASE_URL="postgresql://neondb_owner:npg_1Cu0qDrvSMlN@ep-fragrant-lab-an52bvl4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require' + amp + 'channel_binding=require"',
  'JWT_SECRET="ppp-super-secret-jwt-2024-political-party-platform-secure"',
  'NEXTAUTH_URL="http://localhost:3000"',
  '',
].join('\n');
fs.writeFileSync('.env', content);
console.log('✓ .env created');
console.log(content);
