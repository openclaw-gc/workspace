#!/usr/bin/env node

/**
 * Gmail Monitor - Checks gale.boetticher.ai@gmail.com every 10 minutes
 * Handles forwarded emails from GC and direct external emails
 * Auto-labels, notifies via Telegram, tracks approval state
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const SenderProfiler = require('./profiler.js');

const CONFIG = {
  gmail: {
    user: 'gale.boetticher.ai@gmail.com',
    password: 'vmzzfacfdozzmsbl',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  },
  workspace: '/data/.openclaw/workspace',
  queueFile: '/data/.openclaw/workspace/memory/email-queue.json',
  logFile: '/data/.openclaw/workspace/memory/gmail-log.jsonl',
  lastCheckFile: '/data/.openclaw/workspace/memory/.gmail-last-check',
  processedIdsFile: '/data/.openclaw/workspace/memory/.gmail-processed-ids.json',
  gcEmail: 'giancarlo.cudrig@gmail.com',
  telegramChatId: '1434318999',
  
  // System senders - auto-ignore (no response needed)
  systemSenders: [
    'no-reply@accounts.google.com',
    'googlecloud@google.com',
    'noreply@github.com',
    'calendar-notification@google.com',
    'drive-shares-noreply@google.com',
    'no-reply@calendar.google.com',
    'notifications.google.com'
  ]
};

class GmailMonitor {
  constructor() {
    this.imap = null;
    this.queue = this.loadQueue();
    this.lastCheck = this.loadLastCheck();
    this.profiler = new SenderProfiler();
    this.processedIds = this.loadProcessedIds();
    
    // Dedupe queue on load
    this.dedupeQueue();
  }

  loadQueue() {
    try {
      if (fs.existsSync(CONFIG.queueFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.queueFile, 'utf8'));
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
    return { pending: [], approved: [], sent: [] };
  }
  
  dedupeQueue() {
    // Remove duplicate entries based on message ID
    const seenIds = new Set();
    const deduped = {
      pending: [],
      approved: this.queue.approved || [],
      sent: this.queue.sent || []
    };
    
    for (const item of this.queue.pending || []) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        
        // Also filter out system notifications
        if (!this.isSystemSender(item.from)) {
          deduped.pending.push(item);
        }
      }
    }
    
    const removed = (this.queue.pending?.length || 0) - deduped.pending.length;
    if (removed > 0) {
      console.log(`🧹 Deduped queue: removed ${removed} duplicate/system entries`);
      this.queue = deduped;
      this.saveQueue();
    }
  }

  saveQueue() {
    fs.writeFileSync(CONFIG.queueFile, JSON.stringify(this.queue, null, 2));
  }

  loadLastCheck() {
    try {
      if (fs.existsSync(CONFIG.lastCheckFile)) {
        return new Date(fs.readFileSync(CONFIG.lastCheckFile, 'utf8').trim());
      }
    } catch (err) {
      console.error('Error loading last check:', err);
    }
    // Default to 1 hour ago
    return new Date(Date.now() - 3600000);
  }

  loadProcessedIds() {
    try {
      if (fs.existsSync(CONFIG.processedIdsFile)) {
        const data = JSON.parse(fs.readFileSync(CONFIG.processedIdsFile, 'utf8'));
        // Keep only IDs from last 7 days
        const cutoff = Date.now() - (7 * 24 * 3600000);
        const filtered = Object.entries(data)
          .filter(([id, timestamp]) => timestamp > cutoff)
          .reduce((acc, [id, timestamp]) => {
            acc[id] = timestamp;
            return acc;
          }, {});
        
        // Save cleaned version
        fs.writeFileSync(CONFIG.processedIdsFile, JSON.stringify(filtered, null, 2));
        
        return new Set(Object.keys(filtered));
      }
    } catch (err) {
      console.error('Error loading processed IDs:', err);
    }
    return new Set();
  }

  saveProcessedIds() {
    try {
      const data = {};
      for (const id of this.processedIds) {
        data[id] = Date.now();
      }
      fs.writeFileSync(CONFIG.processedIdsFile, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error saving processed IDs:', err);
    }
  }

  saveLastCheck() {
    fs.writeFileSync(CONFIG.lastCheckFile, new Date().toISOString());
  }

  log(entry) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
  }
  
  isSystemSender(email) {
    if (!email) return false;
    const normalized = email.toLowerCase();
    return CONFIG.systemSenders.some(sender => 
      normalized.includes(sender.toLowerCase())
    );
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.imap = new Imap(CONFIG.gmail);
      
      this.imap.once('ready', () => {
        console.log('✓ Connected to Gmail');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('✗ IMAP error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('Connection ended');
      });

      this.imap.connect();
    });
  }

  async checkInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for emails since last check
        const since = new Date(this.lastCheck);
        const searchCriteria = [['SINCE', since]];
        
        console.log(`Searching for emails since: ${since.toISOString()}`);
        
        this.imap.search(searchCriteria, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            console.log('No new emails');
            resolve([]);
            return;
          }

          console.log(`Found ${results.length} email(s) since last check`);
          
          const fetch = this.imap.fetch(results, { bodies: '' });
          const emails = [];

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Parse error:', err);
                  return;
                }
                emails.push(parsed);
              });
            });
          });

          fetch.once('error', reject);
          fetch.once('end', () => {
            resolve(emails);
          });
        });
      });
    });
  }

  async processEmails(emails) {
    let newCount = 0;
    let dupCount = 0;
    let sysCount = 0;
    
    for (const email of emails) {
      try {
        const result = await this.processEmail(email);
        if (result === 'new') newCount++;
        else if (result === 'duplicate') dupCount++;
        else if (result === 'system') sysCount++;
      } catch (err) {
        console.error('Error processing email:', err);
        this.log({
          type: 'error',
          error: err.message,
          email: {
            from: email.from?.text,
            subject: email.subject
          }
        });
      }
    }
    
    console.log(`📊 Processed: ${newCount} new, ${dupCount} duplicates, ${sysCount} system`);
    
    // Save processed IDs after batch
    this.saveProcessedIds();
    
    return { new: newCount, duplicates: dupCount, system: sysCount };
  }

  async processEmail(email) {
    const from = email.from?.value?.[0]?.address || email.from?.text;
    const subject = email.subject || '(no subject)';
    const body = email.text || email.html || '';
    const messageId = email.messageId;

    if (!messageId) {
      console.log('⚠️ Email has no message ID, skipping');
      return 'skipped';
    }

    // Skip if already processed
    if (this.processedIds.has(messageId)) {
      return 'duplicate';
    }

    // Skip system senders
    if (this.isSystemSender(from)) {
      this.processedIds.add(messageId);
      return 'system';
    }

    this.log({
      type: 'received',
      from,
      subject,
      messageId
    });

    // Mark as processed
    this.processedIds.add(messageId);

    // Detect if forwarded from GC
    const isFromGC = from.includes(CONFIG.gcEmail) || 
                     body.includes('---------- Forwarded message ---------') ||
                     body.includes('From: ' + CONFIG.gcEmail);

    if (isFromGC) {
      await this.handleForwardedEmail(email, from, subject, body);
    } else {
      await this.handleExternalEmail(email, from, subject, body);
    }
    
    return 'new';
  }

  async handleForwardedEmail(email, from, subject, body) {
    console.log('📩 Forwarded from GC:', subject);
    
    // Extract hints from subject
    const isUrgent = subject.includes('[URGENT]');
    const isDraftReply = subject.includes('[DRAFT REPLY]');
    const isResearch = subject.includes('[RESEARCH]');
    const isTrack = subject.includes('[TRACK]');

    // Parse original message if forwarded
    let originalSubject = subject;
    let originalFrom = from;
    
    const fwdMatch = body.match(/Subject: (.+)/);
    if (fwdMatch) {
      originalSubject = fwdMatch[1].trim();
    }
    
    const fromMatch = body.match(/From: (.+?)[\r\n]/);
    if (fromMatch) {
      originalFrom = fromMatch[1].trim();
    }

    this.log({
      type: 'forwarded_processed',
      from,
      subject: originalSubject,
      originalFrom,
      urgent: isUrgent,
      action: isDraftReply ? 'draft_reply' : isResearch ? 'research' : isTrack ? 'track' : 'general'
    });

    // Get profile for original sender if drafting a reply
    let profileInfo = '';
    if (isDraftReply && originalFrom && originalFrom !== from) {
      const profile = this.profiler.getProfile(originalFrom);
      const guidance = this.profiler.generateResponseGuidance(profile);
      profileInfo = `\n**Profile:** ${profile.name || originalFrom}\n**Guidance:** ${guidance.tone}, ${guidance.length}\n`;
    }

    // TODO: Implement actual task execution
    await this.notifyTelegram(`📩 Forwarded: ${originalSubject}\n\nAction: ${isDraftReply ? 'Draft reply' : isResearch ? 'Research' : 'General'}${profileInfo}`);
  }

  async handleExternalEmail(email, from, subject, body) {
    console.log('📧 External email:', from, '-', subject);
    
    // Get sender profile and response guidance
    const profile = this.profiler.getProfile(from);
    const guidance = this.profiler.generateResponseGuidance(profile);
    
    // Add to pending approval queue
    const queueItem = {
      id: email.messageId || Date.now().toString(),
      from,
      subject,
      body: body.substring(0, 500),
      receivedAt: new Date().toISOString(),
      status: 'pending',
      profile: {
        name: profile.name,
        relationship: profile.relationship,
        tone: guidance.tone,
        length: guidance.length,
        priority: guidance.priority
      }
    };

    this.queue.pending.push(queueItem);
    this.saveQueue();

    this.log({
      type: 'external_received',
      from,
      subject,
      queueId: queueItem.id,
      profile: profile.source
    });

    // Build notification
    const profileInfo = profile.source === 'profile' 
      ? `\n**Profile:** ${profile.name} (${profile.relationship})\n**Guidance:** ${guidance.tone}, ${guidance.length}\n`
      : `\n**Profile:** Unknown (professional default)\n`;

    const message = `📧 **New email**\n\n` +
      `**From:** ${from}\n` +
      `**Subject:** ${subject}\n` +
      profileInfo +
      `**Preview:** ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}\n\n` +
      `Actions: APPROVE, REVISE, IGNORE`;

    await this.notifyTelegram(message);
  }

  async notifyTelegram(message) {
    console.log('📱 Notification:', message);
    // TODO: Integrate with OpenClaw Telegram
  }

  async disconnect() {
    if (this.imap) {
      this.imap.end();
    }
  }

  async run() {
    try {
      console.log('🔍 Starting Gmail check...');
      await this.connect();
      const emails = await this.checkInbox();
      
      let stats = { new: 0, duplicates: 0, system: 0 };
      if (emails.length > 0) {
        stats = await this.processEmails(emails);
      }
      
      this.saveLastCheck();
      await this.disconnect();
      
      console.log('✓ Check complete');
      return {
        success: true,
        emailsChecked: emails.length,
        newEmails: stats.new,
        duplicates: stats.duplicates,
        systemFiltered: stats.system,
        pendingApprovals: this.queue.pending.length
      };
    } catch (err) {
      console.error('✗ Monitor error:', err);
      this.log({
        type: 'error',
        error: err.message,
        stack: err.stack
      });
      
      if (this.imap) {
        await this.disconnect();
      }
      
      return {
        success: false,
        error: err.message
      };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new GmailMonitor();
  monitor.run().then(result => {
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = GmailMonitor;
