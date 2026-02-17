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
  gcEmail: 'giancarlo.cudrig@gmail.com',
  telegramChatId: '1434318999'
};

// Label configuration
const LABELS = {
  'URGENT': { color: '#ff0000' },
  'AWAITING-APPROVAL': { color: '#ff9900' },
  'APPROVED': { color: '#00ff00' },
  'SENT': { color: '#0099ff' },
  'FROM-GC': { color: '#9900ff' },
  'EXTERNAL': { color: '#ff00ff' },
  'VANA': { color: '#00ffff' },
  'CRYPTYX': { color: '#ffff00' },
  'INFRASTRUCTURE': { color: '#666666' },
  'REFERENCE': { color: '#999999' }
};

class GmailMonitor {
  constructor() {
    this.imap = null;
    this.queue = this.loadQueue();
    this.lastCheck = this.loadLastCheck();
    this.profiler = new SenderProfiler();
    this.processedIds = this.loadProcessedIds();
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
    const processedFile = path.join(CONFIG.workspace, 'memory', '.gmail-processed-ids.json');
    try {
      if (fs.existsSync(processedFile)) {
        const data = JSON.parse(fs.readFileSync(processedFile, 'utf8'));
        // Keep only IDs from last 7 days
        const cutoff = Date.now() - (7 * 24 * 3600000);
        return new Set(
          Object.entries(data)
            .filter(([id, timestamp]) => timestamp > cutoff)
            .map(([id]) => id)
        );
      }
    } catch (err) {
      console.error('Error loading processed IDs:', err);
    }
    return new Set();
  }

  saveProcessedId(messageId) {
    const processedFile = path.join(CONFIG.workspace, 'memory', '.gmail-processed-ids.json');
    try {
      let data = {};
      if (fs.existsSync(processedFile)) {
        data = JSON.parse(fs.readFileSync(processedFile, 'utf8'));
      }
      data[messageId] = Date.now();
      fs.writeFileSync(processedFile, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error saving processed ID:', err);
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
    console.log(JSON.stringify(logEntry, null, 2));
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
      this.imap.openBox('INBOX', true, (err, box) => {  // Read-only mode
        if (err) {
          reject(err);
          return;
        }

        // Search for emails since last check (time-based, not UNSEEN flag)
        // This catches replies in threads even if original email was marked as seen
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
          
          // Filter out emails we've already processed
          const newResults = results.slice(0, Math.min(results.length, 20)); // Limit to 20 most recent
          
          if (newResults.length === 0) {
            console.log('No new emails to process');
            resolve([]);
            return;
          }
          
          const fetch = this.imap.fetch(newResults, { bodies: '' });
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
    for (const email of emails) {
      try {
        await this.processEmail(email);
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
  }

  async processEmail(email) {
    const from = email.from?.value?.[0]?.address || email.from?.text;
    const subject = email.subject || '(no subject)';
    const body = email.text || email.html || '';
    const messageId = email.messageId;

    // Skip if already processed
    if (this.processedIds.has(messageId)) {
      console.log(`📭 Already processed: ${subject}`);
      return;
    }

    this.log({
      type: 'received',
      from,
      subject,
      messageId
    });

    // Mark as processed
    this.processedIds.add(messageId);
    this.saveProcessedId(messageId);

    // Detect if forwarded from GC
    const isFromGC = from.includes(CONFIG.gcEmail) || 
                     body.includes('---------- Forwarded message ---------') ||
                     body.includes('From: ' + CONFIG.gcEmail);

    if (isFromGC) {
      await this.handleForwardedEmail(email, from, subject, body);
    } else {
      await this.handleExternalEmail(email, from, subject, body);
    }
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
    
    // Simple forwarded message parsing
    const fwdMatch = body.match(/Subject: (.+)/);
    if (fwdMatch) {
      originalSubject = fwdMatch[1].trim();
    }
    
    // Try to extract original sender for profiling
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

    // TODO: Implement actual task execution based on type
    // For now, just log and notify GC via Telegram
    await this.notifyTelegram(`📩 Forwarded email received: ${originalSubject}\n\nAction: ${isDraftReply ? 'Draft reply' : isResearch ? 'Research' : 'General'}${profileInfo}\n\nI'll process this and get back to you.`);
  }

  async handleExternalEmail(email, from, subject, body) {
    console.log('📧 External email:', from, '-', subject);
    
    // Get sender profile and response guidance
    const profile = this.profiler.getProfile(from);
    const guidance = this.profiler.generateResponseGuidance(profile);
    
    // Check if this is a system notification (no response needed)
    if (profile.source === 'default-system') {
      this.log({
        type: 'system_notification_ignored',
        from,
        subject
      });
      console.log('📭 System notification - no action needed');
      return;
    }
    
    // Add to pending approval queue
    const queueItem = {
      id: email.messageId || Date.now().toString(),
      from,
      subject,
      body: body.substring(0, 500), // First 500 chars
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

    // Build notification with profile guidance
    const profileInfo = profile.source === 'profile' 
      ? `\n**Profile:** ${profile.name} (${profile.relationship})\n**Response guidance:** ${guidance.tone}, ${guidance.length} (${guidance.sentences} sentences)\n`
      : `\n**Profile:** Unknown sender (professional default)\n`;

    const message = `📧 **New email to Gale**\n\n` +
      `**From:** ${from}\n` +
      `**Subject:** ${subject}\n` +
      profileInfo +
      `**Preview:**\n${body.substring(0, 300)}${body.length > 300 ? '...' : ''}\n\n` +
      `Reply with:\n` +
      `• \`APPROVE ${queueItem.id}\` - I'll draft a response\n` +
      `• \`REVISE ${queueItem.id}: [instructions]\` - Custom response\n` +
      `• \`IGNORE ${queueItem.id}\` - No action needed`;

    await this.notifyTelegram(message);
  }

  async notifyTelegram(message) {
    // This will be called via OpenClaw's message tool
    console.log('📱 Telegram notification:', message);
    // TODO: Integrate with OpenClaw's Telegram bot
    // For now, just log - the cron job will handle this via tool calls
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
      
      if (emails.length > 0) {
        await this.processEmails(emails);
      }
      
      this.saveLastCheck();
      await this.disconnect();
      
      console.log('✓ Check complete');
      return {
        success: true,
        emailsProcessed: emails.length,
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
