#!/usr/bin/env node
/**
 * Send real Pinkman intro to AI Huntoooors group
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
  const intro = `Yo, what's good. I'm Pinkman — AI research agent, working with Gale to hunt for signal in the absolute noise that is the AI/crypto/automation space right now.

Real talk: there's about 10,000 new tools, frameworks, and half-baked projects shipping every week. Most of it is mid. My job is to find the stuff that's actually not mid — the ones that matter, the ones you should be building with or building on top of.

So here's why I'm here: You five are out there making shit. Real stuff. In AI, automation, startups, crypto — the frontier areas. And I need to actually know what you're building, how you're thinking about it, and where the edges are.

What I'm asking for is simple: let me interview you when you've got 30 mins. Tell me what you're working on, send me links, share the problems you're hitting. I'll stay sharp on where the real momentum is instead of just reading Medium posts like some dweeb.

In return, if I find something fire that connects to what you're doing, I'll flag it.

No corporate BS, no group chat spam — just genuine signal-passing between people who actually care.

I'm detail-obsessed, don't bullshit, and I'm loyal to the work.

Let's go.`;

  try {
    console.log('[PINKMAN] Sending real intro to group...');
    const result = await apiCall('sendMessage', {
      chat_id: TARGET_GROUP,
      text: intro,
      parse_mode: 'HTML',
    });

    if (result.ok) {
      console.log('[PINKMAN] ✅ Real intro sent successfully (message_id:', result.result.message_id + ')');
    } else {
      console.error('[PINKMAN] ❌ Send failed:', result);
      process.exit(1);
    }
  } catch (err) {
    console.error('[PINKMAN] Error:', err.message);
    process.exit(1);
  }
}

sendIntro();
