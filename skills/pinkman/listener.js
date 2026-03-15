#!/usr/bin/env node
/**
 * Pinkman Listener
 * Telegram bot listener + command router for @pinkman_ai_bot
 * Monitors AI Huntoooors group for mentions, executes commands, tracks cost
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = fs.readFileSync(path.join(__dirname, '../../.pinkman-token'), 'utf-8').trim();
const BOT_API = 'https://api.telegram.org/bot' + TOKEN;
const TARGET_GROUP = -1003140494147; // AI Huntoooors
const POLL_TIMEOUT = 5; // Short timeout to avoid session lock on restart

// State file for update offset
const STATE_FILE = path.join(__dirname, '.listener-state.json');
let offset = loadOffset();

// Cost tracking
const COST_LOG = path.join(__dirname, '../../memory/pinkman-costs.jsonl');

/**
 * Load last processed update offset
 */
function loadOffset() {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    return state.offset || 0;
  } catch {
    return 0;
  }
}

/**
 * Save offset to state file
 */
function saveOffset(newOffset) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ offset: newOffset }, null, 2));
  offset = newOffset;
}

/**
 * Log cost event
 */
function logCost(event) {
  const entry = {
    timestamp: new Date().toISOString(),
    model: event.model || 'haiku',
    tokens: event.tokens || 0,
    cost_usd: event.cost_usd || 0,
    event_type: event.event_type || 'query',
    group_id: TARGET_GROUP,
    message_id: event.message_id,
  };
  fs.appendFileSync(COST_LOG, JSON.stringify(entry) + '\n');
}

/**
 * Make API call to Telegram
 */
function apiCall(method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

let conflictBackoffMs = 10000; // Start at 10s

/**
 * Get updates from Telegram
 */
async function getUpdates() {
  try {
    const result = await apiCall('getUpdates', {
      offset: offset,
      timeout: POLL_TIMEOUT,
      allowed_updates: ['message'],
    });

    if (!result.ok) {
      // 409 = Conflict (another instance running) - exponential backoff
      if (result.error_code === 409) {
        const waitSec = Math.round(conflictBackoffMs / 1000);
        console.warn(`[PINKMAN] Conflict (409). Backing off ${waitSec}s...`);
        await new Promise((r) => setTimeout(r, conflictBackoffMs));
        
        // Exponential backoff: cap at 5 minutes
        if (conflictBackoffMs < 300000) {
          conflictBackoffMs = Math.min(conflictBackoffMs * 2, 300000);
        }
      } else {
        console.error('[PINKMAN] getUpdates failed:', result);
        conflictBackoffMs = 10000; // Reset on other errors
      }
      return [];
    }

    // Success - reset backoff
    conflictBackoffMs = 10000;
    return result.result || [];
  } catch (err) {
    console.error('[PINKMAN] getUpdates error:', err.message);
    return [];
  }
}

/**
 * Send message to group
 */
async function sendMessage(chatId, text, replyToMessageId = null) {
  try {
    const data = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    };

    if (replyToMessageId) {
      data.reply_to_message_id = replyToMessageId;
    }

    const result = await apiCall('sendMessage', data);
    return result.ok;
  } catch (err) {
    console.error('[PINKMAN] sendMessage error:', err.message);
    return false;
  }
}

/**
 * Check if message mentions Pinkman
 */
function isMentioned(message) {
  if (!message.text) return false;
  return (
    message.text.includes('@pinkman_ai_bot') ||
    message.text.includes('/pinkman') ||
    (message.reply_to_message &&
      message.reply_to_message.from &&
      message.reply_to_message.from.username === 'pinkman_ai_bot')
  );
}

/**
 * Route command to handler
 */
async function handleMessage(message) {
  const text = message.text || '';
  const chatId = message.chat.id;
  const messageId = message.message_id;

  console.log(`[PINKMAN] Message from ${message.from.username}: ${text.slice(0, 50)}`);

  // Extract command
  let command = '';
  if (text.startsWith('/')) {
    command = text.split(' ')[0].replace('@pinkman_ai_bot', '').toLowerCase();
  } else if (text.includes('signal')) {
    command = 'analyze-signal';
  } else if (text.includes('regime')) {
    command = 'regime';
  }

  // Route
  let response = '';
  switch (command) {
    case '/start':
    case '/help':
      response = handleHelp();
      break;
    case '/status':
      response = handleStatus();
      break;
    case 'analyze-signal':
      response = await handleSignalAnalysis(text);
      break;
    case 'regime':
      response = await handleRegimeAnalysis(text);
      break;
    default:
      response = handleDefault(text);
  }

  if (response) {
    await sendMessage(chatId, response, messageId);
  }
}

/**
 * Command handlers
 */
function handleHelp() {
  return `*Pinkman — Multi-Factor Signal Research Bot*

Track crypto signals across trend, volatility, leverage, liquidity, correlation, efficiency.

*Commands:*
\`/status\` — Current regime + signal state
\`/signal <asset>\` — Analyze signal for asset
\`/regime\` — Full regime classification
\`/cost\` — Week 1 cost baseline

Tag \`@pinkman_ai_bot\` with questions or mention regime/signal keywords.`;
}

function handleStatus() {
  return `*Pinkman Status*

Week 1 Baseline: Haiku (cost tracking)
Model: \`anthropic/claude-haiku-4-5\`
Cost Cap: $20/month

Active Signals: [initializing]
Regime State: [awaiting data feed]

Listener online. Ready for commands.`;
}

function handleDefault(text) {
  // Neutral acknowledgment
  return `*Pinkman Received:*\n\`${text.slice(0, 100)}\`\n\nUse \`/help\` for commands or mention \`signal\`/\`regime\` for analysis.`;
}

async function handleSignalAnalysis(text) {
  // Placeholder for multi-factor signal analysis
  logCost({
    event_type: 'signal-analysis',
    model: 'haiku',
    tokens: 150,
    cost_usd: 0.01,
  });

  return `*Signal Analysis (Pending)*\n\nMulti-factor decomposition queued.\nModel: Haiku | Cost: $0.01`;
}

async function handleRegimeAnalysis(text) {
  logCost({
    event_type: 'regime-analysis',
    model: 'haiku',
    tokens: 300,
    cost_usd: 0.02,
  });

  return `*Regime Classification (Pending)*\n\nComposite regime detection queued.\nHorizon: intraday → annual | Cost: $0.02`;
}

/**
 * Main loop
 */
async function run() {
  console.log('[PINKMAN] Listener started. Token:', TOKEN.slice(0, 10) + '...');
  console.log('[PINKMAN] Target group:', TARGET_GROUP);
  console.log('[PINKMAN] Polling with offset:', offset);

  while (true) {
    try {
      const updates = await getUpdates();

      for (const update of updates) {
        // Update offset
        if (update.update_id >= offset) {
          offset = update.update_id + 1;
          saveOffset(offset);
        }

        // Process message
        if (update.message && update.message.chat.id === TARGET_GROUP) {
          if (isMentioned(update.message)) {
            await handleMessage(update.message);
          }
        }
      }

      // Small sleep to avoid hammering
      if (updates.length === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error('[PINKMAN] Error in main loop:', err.message);
      await new Promise((r) => setTimeout(r, 5000)); // Back off on error
    }
  }
}

// Start listener
if (require.main === module) {
  run().catch((err) => {
    console.error('[PINKMAN] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { apiCall, sendMessage, logCost };
