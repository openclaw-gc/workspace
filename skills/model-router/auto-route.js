#!/usr/bin/env node
/**
 * Automatic Model Router for OpenClaw
 * Monitors incoming messages and switches models automatically
 */

const fs = require('fs');
const path = require('path');
const { analyzeMessage, recordUsage } = require('./integrate');

const STATE_FILE = path.join(__dirname, '.auto-route-state.json');
const MESSAGE_LOG = '/data/.openclaw/workspace/memory/incoming-messages.jsonl';

/**
 * Load state
 */
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      lastProcessedTimestamp: Date.now(),
      currentModel: 'anthropic/claude-sonnet-4-5',
      sessionKey: 'main'
    };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

/**
 * Save state
 */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Get incoming messages since last check
 */
function getNewMessages(since) {
  if (!fs.existsSync(MESSAGE_LOG)) {
    return [];
  }

  const lines = fs.readFileSync(MESSAGE_LOG, 'utf8').trim().split('\n');
  return lines
    .map(line => JSON.parse(line))
    .filter(msg => msg.timestamp > since);
}

/**
 * Process a message through router
 */
function processMessage(message, state) {
  const analysis = analyzeMessage(
    message.text,
    state.currentModel,
    message.contextSize || 0
  );

  console.log(JSON.stringify({
    timestamp: Date.now(),
    message: message.text.substring(0, 100),
    tier: analysis.tier,
    currentModel: state.currentModel,
    recommendedModel: analysis.recommendedModel,
    shouldSwitch: analysis.shouldSwitch,
    reasoning: analysis.reasoning
  }, null, 2));

  if (analysis.shouldSwitch && analysis.mode === 'enforce') {
    // Model switch would happen here via OpenClaw API
    console.log(`[SWITCH] ${state.currentModel} → ${analysis.recommendedModel}`);
    state.currentModel = analysis.recommendedModel;
  }

  return analysis;
}

/**
 * Main monitor loop
 */
function monitor() {
  const state = loadState();
  const newMessages = getNewMessages(state.lastProcessedTimestamp);

  if (newMessages.length > 0) {
    console.log(`[ROUTER] Processing ${newMessages.length} new messages`);
    
    newMessages.forEach(msg => {
      processMessage(msg, state);
    });

    state.lastProcessedTimestamp = Date.now();
    saveState(state);
  }
}

// CLI
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'monitor') {
    monitor();
  } else if (command === 'daemon') {
    console.log('[ROUTER DAEMON] Starting...');
    setInterval(() => {
      try {
        monitor();
      } catch (error) {
        console.error('[ERROR]', error.message);
      }
    }, 5000); // Check every 5s
  } else if (command === 'reset') {
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
    console.log('[ROUTER] State reset');
  } else {
    console.log('Usage:');
    console.log('  node auto-route.js monitor    - Check for new messages once');
    console.log('  node auto-route.js daemon     - Monitor continuously');
    console.log('  node auto-route.js reset      - Reset state');
  }
}

module.exports = { monitor, processMessage };
