#!/usr/bin/env node
/**
 * CHECKPOINT ENFORCEMENT
 * Fires every 90 minutes. Gale must report status via Telegram.
 * Status = work product OR explicit blocker OR reason for idle.
 * Auto-escalates if missed.
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
const CHECKPOINT_INTERVAL = 90 * 60 * 1000; // 90 minutes in ms
const WORKSPACE = '/data/.openclaw/workspace';
const AUDIT_LOG = path.join(WORKSPACE, 'memory', 'audit.jsonl');
const CHECKPOINT_STATE = path.join(WORKSPACE, 'memory', 'checkpoint-state.json');

// Initialize checkpoint state
function initCheckpointState() {
  if (!fs.existsSync(CHECKPOINT_STATE)) {
    const state = {
      last_checkpoint: null,
      last_completed: null,
      consecutive_misses: 0,
      active_task: null,
      started_at: null
    };
    fs.writeFileSync(CHECKPOINT_STATE, JSON.stringify(state, null, 2));
  }
}

// Read current state
function getCheckpointState() {
  const data = fs.readFileSync(CHECKPOINT_STATE, 'utf-8');
  return JSON.parse(data);
}

// Update state
function updateCheckpointState(updates) {
  const state = getCheckpointState();
  const newState = { ...state, ...updates, last_checkpoint: new Date().toISOString() };
  fs.writeFileSync(CHECKPOINT_STATE, JSON.stringify(newState, null, 2));
  return newState;
}

// Log to audit trail
function auditLog(action, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'CHECKPOINT',
    action,
    details,
    executor: 'checkpoint-enforcement.js'
  };
  fs.appendFileSync(AUDIT_LOG, JSON.stringify(entry) + '\n');
}

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

// Check PROJECT-STATE for actual work (file modification time)
function getRecentWork() {
  const projectState = path.join(WORKSPACE, 'PROJECT-STATE.md');
  if (!fs.existsSync(projectState)) return null;
  
  const state = getCheckpointState();
  const lastCheckpoint = state.last_checkpoint ? new Date(state.last_checkpoint) : new Date(0);
  
  const stats = fs.statSync(projectState);
  const mtime = new Date(stats.mtime);
  
  // If file was modified after last checkpoint, it's progress
  if (mtime > lastCheckpoint) {
    return `PROJECT-STATE.md modified at ${mtime.toISOString()}`;
  }
  
  return null;
}

// Main checkpoint logic
async function runCheckpoint() {
  console.log('[CHECKPOINT] Running at', new Date().toISOString());
  
  const state = getCheckpointState();
  const recentWork = getRecentWork();
  
  // Build status message
  let message = '🔔 **CHECKPOINT STATUS**\n';
  message += `⏰ ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}\n\n`;
  
  if (recentWork) {
    message += '✅ **PROGRESS DETECTED**\n';
    message += recentWork + '\n\n';
    message += '_Checkpoint OK. Continue._\n';
    
    updateCheckpointState({
      last_completed: new Date().toISOString(),
      consecutive_misses: 0
    });
    
    auditLog('CHECKPOINT_PASS', { work: recentWork });
  } else {
    // No recent work detected
    const misses = state.consecutive_misses + 1;
    
    if (misses >= 2) {
      message += '🚨 **ESCALATION: 2+ MISSED CHECKPOINTS**\n';
      message += 'Gale is unresponsive. Check dashboard or manually intervene.\n';
      auditLog('CHECKPOINT_ESCALATION', { consecutive_misses: misses });
    } else {
      message += '⚠️ **NO PROGRESS DETECTED**\n';
      message += `Consecutive misses: ${misses}\n`;
      message += 'Either:\n';
      message += '1. Report a blocker\n';
      message += '2. Report active task + ETA\n';
      message += '3. Report reason for idle\n\n';
      message += '_Next checkpoint in 90 min._\n';
      auditLog('CHECKPOINT_MISS', { consecutive_misses: misses });
    }
    
    updateCheckpointState({
      consecutive_misses: misses
    });
  }
  
  try {
    await sendTelegram(message);
    console.log('[CHECKPOINT] Message sent to Telegram');
  } catch (err) {
    console.error('[CHECKPOINT] Failed to send Telegram:', err.message);
    auditLog('CHECKPOINT_TELEGRAM_FAILED', { error: err.message });
  }
}

// Start checkpoint loop
async function start() {
  console.log('[CHECKPOINT] Initializing enforcement system');
  initCheckpointState();
  auditLog('SYSTEM_START', { interval_ms: CHECKPOINT_INTERVAL });
  
  // Run first checkpoint immediately
  await runCheckpoint();
  
  // Then schedule every 90 minutes
  setInterval(runCheckpoint, CHECKPOINT_INTERVAL);
  
  console.log('[CHECKPOINT] System running. Next checkpoint in 90 min.');
}

if (require.main === module) {
  start().catch(err => {
    console.error('[CHECKPOINT] FATAL:', err);
    auditLog('SYSTEM_ERROR', { error: err.message });
    process.exit(1);
  });
}

module.exports = { runCheckpoint, sendTelegram, auditLog };
