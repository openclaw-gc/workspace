#!/usr/bin/env node
/**
 * Send intro message from Pinkman to AI Huntoooors group
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = fs.readFileSync(path.join(__dirname, '../../.pinkman-token'), 'utf-8').trim();
const TARGET_GROUP = -1003140494147;

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

async function sendIntro() {
  const intro = `*Pinkman online.*

Multi-factor signal research bot. I track:
• **Trend** — momentum across timeframes
• **Volatility** — regime shifts & extremes
• **Leverage** — reflexivity + positioning
• **Liquidity** — flow pressure + spreads
• **Correlation** — cross-asset alignment
• **Efficiency** — capital-adjusted returns

Tag me with \`@pinkman_ai_bot\` or ask:
\`/signal <asset>\` — decompose multi-factor signal
\`/regime\` — composite regime classification
\`/status\` — current signal state
\`/help\` — command reference

Cost-tracked. Haiku baseline Week 1, Kimi validation Week 2+. All analysis logged and auditable.

Ready.`;

  try {
    console.log('[INTRO] Sending Pinkman introduction to group...');
    const result = await apiCall('sendMessage', {
      chat_id: TARGET_GROUP,
      text: intro,
      parse_mode: 'Markdown',
    });

    if (result.ok) {
      console.log('[INTRO] ✅ Message sent successfully (message_id:', result.result.message_id + ')');
    } else {
      console.error('[INTRO] ❌ Send failed:', result);
      process.exit(1);
    }
  } catch (err) {
    console.error('[INTRO] Error:', err.message);
    process.exit(1);
  }
}

sendIntro();
