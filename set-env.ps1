$dbUrl = "postgresql://neondb_owner:npg_1Cu0qDrvSMlN@ep-fragrant-lab-an52bvl4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$jwtSecret = "ppp-super-secret-jwt-2024-political-party-platform-secure"

Write-Host "Adding DATABASE_URL..."
[System.Text.Encoding]::UTF8.GetBytes($dbUrl) | cmd /c "vercel env add DATABASE_URL production --yes"

Write-Host "Adding JWT_SECRET..."
[System.Text.Encoding]::UTF8.GetBytes($jwtSecret) | cmd /c "vercel env add JWT_SECRET production --yes"

Write-Host "Done!"
