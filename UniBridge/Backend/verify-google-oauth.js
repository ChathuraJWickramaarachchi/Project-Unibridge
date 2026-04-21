#!/usr/bin/env node
// Google OAuth Configuration Verification Script

import dotenv from 'dotenv';
dotenv.config();

console.log('\n' + '='.repeat(60));
console.log('🔍 GOOGLE OAUTH CONFIGURATION VERIFICATION');
console.log('='.repeat(60) + '\n');

let hasError = false;

// 1. Check Environment Variables
console.log('📋 Step 1: Environment Variables');
console.log('-'.repeat(60));

if (!process.env.GOOGLE_CLIENT_ID) {
  console.log('❌ GOOGLE_CLIENT_ID: Missing');
  hasError = true;
} else {
  console.log('✅ GOOGLE_CLIENT_ID: Set');
  console.log(`   Value: ${process.env.GOOGLE_CLIENT_ID}`);
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.log('❌ GOOGLE_CLIENT_SECRET: Missing');
  hasError = true;
} else {
  console.log('✅ GOOGLE_CLIENT_SECRET: Set');
  console.log(`   Value: ${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
}

if (!process.env.BACKEND_URL) {
  console.log('⚠️  BACKEND_URL: Not set (using default)');
} else {
  console.log(`✅ BACKEND_URL: ${process.env.BACKEND_URL}`);
}

if (!process.env.FRONTEND_URL) {
  console.log('⚠️  FRONTEND_URL: Not set (using default)');
} else {
  console.log(`✅ FRONTEND_URL: ${process.env.FRONTEND_URL}`);
}

console.log(`✅ PORT: ${process.env.PORT || '5001 (default)'}`);
console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);

// 2. Verify Callback URL
console.log('\n📋 Step 2: Callback URL Configuration');
console.log('-'.repeat(60));

const baseURL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
const callbackURL = `${baseURL}/api/auth/google/callback`;

console.log(`Expected Callback URL:`);
console.log(`  ${callbackURL}`);
console.log('\n⚠️  IMPORTANT: Make sure this EXACT URL is added in Google Cloud Console:');
console.log('   APIs & Services > Credentials > OAuth 2.0 Client IDs');
console.log('   Under "Authorized redirect URIs"');

// 3. Check Required Files
console.log('\n📋 Step 3: Required Files');
console.log('-'.repeat(60));

import { existsSync } from 'fs';

const files = [
  'config/passport.js',
  'controllers/googleAuthController.js',
  'routes/auth.js',
  'server.js'
];

files.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    hasError = true;
  }
});

// 4. Google Cloud Console Checklist
console.log('\n📋 Step 4: Google Cloud Console Checklist');
console.log('-'.repeat(60));
console.log('Verify these are configured in Google Cloud Console:\n');
console.log('☐ 1. Google+ API is enabled');
console.log('☐ 2. OAuth consent screen is configured');
console.log('☐ 3. Your email is added as a test user');
console.log('☐ 4. OAuth Client ID is created (Web application)');
console.log('☐ 5. Authorized JavaScript origins include:');
console.log(`     - http://localhost:8080`);
console.log(`     - http://localhost:5001`);
console.log('☐ 6. Authorized redirect URIs include:');
console.log(`     - ${callbackURL}`);

// 5. Next Steps
console.log('\n📋 Step 5: Next Steps');
console.log('-'.repeat(60));

if (hasError) {
  console.log('\n❌ Configuration has errors. Please fix them before proceeding.\n');
} else {
  console.log('\n✅ Configuration looks good! Follow these steps:\n');
  console.log('1. Start backend server:');
  console.log('   npm start');
  console.log('\n2. Look for this message in console:');
  console.log('   ✅ Google OAuth strategy configured');
  console.log('\n3. Start frontend:');
  console.log('   cd ../Frontend && npm run dev');
  console.log('\n4. Test Google login:');
  console.log('   - Open http://localhost:8080/auth');
  console.log('   - Click "Sign in with Google"');
  console.log('   - Complete Google authentication');
  console.log('   - You should be redirected back and logged in\n');
}

console.log('='.repeat(60));
console.log('For detailed setup instructions, see:');
console.log('GOOGLE_OAUTH_COMPLETE_SETUP.md');
console.log('='.repeat(60) + '\n');
