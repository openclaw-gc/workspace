#!/usr/bin/env node
/**
 * CDP Account Setup Reminder Daemon
 * Runs continuously, fires every 8 hours
 * Stops when .cdp-setup-done marker exists
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.gale for credentials
const envPath = '/data/.openclaw/workspace/.env.gale';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    if (line.startsWith('TELEGRAM_BOT_TOKEN=')) {
      process.env.TELEGRAM_BOT_TOKEN = line.split('=')[1].trim();
    }
  });
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = 1434318999; // GC
const REMINDER_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours
const STOP_MARKER = '/data/.openclaw/workspace/.cdp-setup-done';

// Send Telegram message
function sendTelegram(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Telegram error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendReminder() {
  // Check if setup is done
  if (fs.existsSync(STOP_MARKER)) {
    console.log('[CDP-REMINDER] Setup complete. Exiting.');
    process.exit(0);
  }

  const message = `⏰ **Coinbase CDP Setup Reminder**

Agentic trading Phase 1 is blocked.

**To unblock:** 
1. Create Coinbase CDP account
2. Generate API credentials
3. Send them over

Once done → testnet bot deploys in 48h.

**Bonus:** Cryptyx signals feed trading logic.`;

  try {
    await sendTelegram(message);
    console.log(`[CDP-REMINDER] Reminder sent at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[CDP-REMINDER] Send failed:', err.message);
  }
}

async function start() {
  console.log('[CDP-REMINDER] Daemon started. Firing every 8 hours.');
  console.log(`[CDP-REMINDER] Stop marker: ${STOP_MARKER}`);
  
  // Send first reminder immediately
  await sendReminder();
  
  // Then every 8 hours
  setInterval(sendReminder, REMINDER_INTERVAL);
}

if (require.main === module) {
  start().catch(console.error);
}
