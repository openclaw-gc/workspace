#!/usr/bin/env node

/**
 * Test Gmail API Integration
 */

const { authorize } = require('./authorize');
const { google } = require('googleapis');

async function testGmail() {
  console.log('📧 Testing Gmail API...\n');
  
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Get user profile
  console.log('1. Fetching Gmail profile...');
  const profile = await gmail.users.getProfile({ userId: 'me' });
  console.log(`   ✅ Email: ${profile.data.emailAddress}`);
  console.log(`   ✅ Total messages: ${profile.data.messagesTotal}`);
  console.log(`   ✅ Threads: ${profile.data.threadsTotal}\n`);
  
  // List recent messages
  console.log('2. Fetching recent messages...');
  const messages = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5,
  });
  
  console.log(`   ✅ Found ${messages.data.messages?.length || 0} messages\n`);
  
  if (messages.data.messages) {
    for (const msg of messages.data.messages.slice(0, 3)) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });
      
      const headers = detail.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      
      console.log(`   📬 ${from}`);
      console.log(`      ${subject}\n`);
    }
  }
  
  // List labels
  console.log('3. Fetching labels...');
  const labels = await gmail.users.labels.list({ userId: 'me' });
  console.log(`   ✅ Total labels: ${labels.data.labels?.length || 0}`);
  console.log(`   📋 Labels: ${labels.data.labels?.map(l => l.name).slice(0, 10).join(', ')}\n`);
  
  console.log('✅ Gmail API test complete!\n');
}

if (require.main === module) {
  testGmail()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Gmail test failed:', err.message);
      process.exit(1);
    });
}

module.exports = { testGmail };
