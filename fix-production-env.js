#!/usr/bin/env node

// Script to ensure production environment is properly configured
import fs from 'fs';
import path from 'path';

const frontendEnvProd = path.join(process.cwd(), 'frontend', '.env.production');
const frontendEnvLocal = path.join(process.cwd(), 'frontend', '.env.local');

// Ensure production environment file exists
const prodEnvContent = 'VITE_API_URL=https://atsen.app/api\n';

if (!fs.existsSync(frontendEnvProd)) {
  fs.writeFileSync(frontendEnvProd, prodEnvContent);
  console.log('✅ Created .env.production file');
} else {
  console.log('✅ .env.production file already exists');
}

// Create .env.local for production override (this takes precedence)
fs.writeFileSync(frontendEnvLocal, prodEnvContent);
console.log('✅ Created .env.local file for production override');

console.log('🚀 Production environment configured successfully!');
console.log('📝 API URL set to: https://atsen.app/api');