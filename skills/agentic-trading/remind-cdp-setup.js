#!/usr/bin/env node
/**
 * CDP Account Setup Reminder
 * Fires every 8 hours until credentials provided
 * Sends Telegram notification to GC
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
  const message = `⏰ **CDP Account Setup Reminder**

Agentic trading Phase 1 is blocked waiting for Coinbase CDP credentials.

**To unblock:** Create CDP account and provide API keys.

Once done, testnet bot deploys in 48h.

**Synergy:** Cryptyx signals feed trading decisions.`;

  try {
    await sendTelegram(message);
    console.log('[CDP-REMINDER] Message sent to Telegram');
  } catch (err) {
    console.error('[CDP-REMINDER] Failed to send:', err.message);
  }
}

if (require.main === module) {
  sendReminder().catch(console.error);
}
