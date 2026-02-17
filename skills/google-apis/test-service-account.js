#!/usr/bin/env node

/**
 * Test Service Account Access
 */

const { google } = require('googleapis');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../.credentials/google-service-account.json');

async function testServiceAccount() {
  console.log('🔐 Testing service account...\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Service account loaded successfully');
    console.log(`   Email: ${authClient.email}\n`);
    
    // Try to access Gmail (will fail without domain-wide delegation or user grant)
    console.log('Testing Gmail API access...');
    const gmail = google.gmail({ version: 'v1', auth: authClient });
    
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('✅ Gmail access working!');
      console.log(`   Email: ${profile.data.emailAddress}\n`);
    } catch (err) {
      if (err.code === 403) {
        console.log('⚠️  Gmail access denied (expected for service account)');
        console.log('   Service accounts need domain-wide delegation or user OAuth\n');
      } else {
        throw err;
      }
    }
    
    console.log('📋 Service account can be used for:');
    console.log('   - Sheets (if shared with service account email)');
    console.log('   - Drive (if folders shared with service account)');
    console.log('   - Calendar (if calendar shared with service account)\n');
    
    console.log('📋 For Gmail/Calendar user data, we need:');
    console.log('   - OAuth 2.0 credentials (user authorization flow)');
    console.log('   - Run: node authorize.js\n');
    
  } catch (err) {
    console.error('❌ Service account test failed:', err.message);
  }
}

testServiceAccount();
