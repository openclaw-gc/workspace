#!/usr/bin/env node

/**
 * Gmail API Monitor - Replacement for IMAP monitor
 * Faster, more reliable, better features
 */

const fs = require('fs');
const path = require('path');
const { getGmailClient, parseMessage } = require('./client');

const PROCESSED_IDS_FILE = path.join(__dirname, '../../memory/.gmail-api-processed-ids.json');
const QUEUE_FILE = path.join(__dirname, '../../memory/email-queue.json');
const SENDER_PROFILES_FILE = path.join(__dirname, '../../memory/sender-profiles.json');

function loadProcessedIds() {
  if (!fs.existsSync(PROCESSED_IDS_FILE)) {
    return new Set();
  }
  const data = JSON.parse(fs.readFileSync(PROCESSED_IDS_FILE, 'utf-8'));
  return new Set(data);
}

function saveProcessedIds(ids) {
  fs.writeFileSync(PROCESSED_IDS_FILE, JSON.stringify([...ids], null, 2));
}

function loadSenderProfiles() {
  if (!fs.existsSync(SENDER_PROFILES_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(SENDER_PROFILES_FILE, 'utf-8'));
}

function isSystemNotification(from, subject) {
  const systemPatterns = [
    /noreply@/i,
    /no-reply@/i,
    /notifications@/i,
    /calendar/i,
    /github/i,
    /delivery confirmation/i,
    /automatic reply/i,
  ];
  
  const lowerFrom = (from || '').toLowerCase();
  const lowerSubject = (subject || '').toLowerCase();
  
  return systemPatterns.some(pattern => 
    pattern.test(lowerFrom) || pattern.test(lowerSubject)
  );
}

async function monitor() {
  console.log('🔍 Starting Gmail API check...\n');
  
  try {
    const gmail = await getGmailClient();
    const processedIds = loadProcessedIds();
    const profiles = loadSenderProfiles();
    
    // Get unread messages from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const after = Math.floor(oneDayAgo.getTime() / 1000);
    
    const query = `after:${after}`;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    });
    
    const messages = response.data.messages || [];
    
    console.log(`✓ Found ${messages.length} messages in last 24h\n`);
    
    let newEmailsCount = 0;
    let pendingApprovalsCount = 0;
    
    for (const msgSummary of messages) {
      if (processedIds.has(msgSummary.id)) {
        console.log(`📭 Already processed: ${msgSummary.id}`);
        continue;
      }
      
      // Fetch full message
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msgSummary.id,
        format: 'full',
      });
      
      const parsed = parseMessage(fullMsg.data);
      
      // Mark as processed
      processedIds.add(msgSummary.id);
      
      console.log(`📧 New email: ${parsed.from} - ${parsed.subject}`);
      
      // Check if system notification
      if (isSystemNotification(parsed.from, parsed.subject)) {
        console.log(`   📭 System notification - no action needed\n`);
        continue;
      }
      
      // External email - needs attention
      newEmailsCount++;
      
      // Check sender profile
      const fromEmail = parsed.from.match(/<([^>]+)>/)?.[1] || parsed.from;
      const profile = profiles[fromEmail];
      
      if (profile) {
        console.log(`   👤 Profile: ${profile.name} (${profile.relationship})`);
        console.log(`   📋 Response guidance: ${profile.responseGuidance}\n`);
      } else {
        console.log(`   ⚠️  New sender - no profile\n`);
      }
      
      pendingApprovalsCount++;
    }
    
    saveProcessedIds(processedIds);
    
    console.log('✓ Check complete');
    console.log(`Result: {`);
    console.log(`  "success": true,`);
    console.log(`  "emailsProcessed": ${messages.length},`);
    console.log(`  "newEmails": ${newEmailsCount},`);
    console.log(`  "pendingApprovals": ${pendingApprovalsCount}`);
    console.log(`}\n`);
    
    return {
      success: true,
      emailsProcessed: messages.length,
      newEmails: newEmailsCount,
      pendingApprovals: pendingApprovalsCount,
    };
    
  } catch (err) {
    console.error('❌ Gmail API check failed:', err.message);
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  monitor()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { monitor };
