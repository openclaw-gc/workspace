#!/usr/bin/env node

/**
 * Auto-commit hook - detects changes and commits automatically
 * Run this as a cron job or file watcher
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env.gale') });

const REPO_DIR = '/data/.openclaw/workspace-repo';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;

// Files to watch for auto-commit
const WATCH_PATTERNS = [
  'MEMORY.md',
  'memory/PROJECT-STATE.md',
  'memory/202*.md', // Daily logs
  'deliverables/*.md',
  'deliverables/*.html',
];

function exec(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', cwd: REPO_DIR, ...opts });
}

function hasChanges() {
  try {
    const status = exec('git status --porcelain');
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

function detectChangeType() {
  const status = exec('git status --porcelain');
  const lines = status.trim().split('\n');
  
  const changes = {
    memory: false,
    deliverables: false,
    skills: false,
    other: false,
  };
  
  for (const line of lines) {
    const file = line.substring(3);
    if (file.startsWith('MEMORY.md') || file.startsWith('memory/')) {
      changes.memory = true;
    } else if (file.startsWith('deliverables/')) {
      changes.deliverables = true;
    } else if (file.startsWith('skills/')) {
      changes.skills = true;
    } else {
      changes.other = true;
    }
  }
  
  return changes;
}

function generateCommitMessage(changes) {
  const parts = [];
  
  if (changes.memory) parts.push('memory updates');
  if (changes.deliverables) parts.push('new deliverables');
  if (changes.skills) parts.push('skill changes');
  if (changes.other) parts.push('workspace updates');
  
  const prefix = parts.length === 1 ? 'update:' : 'update:';
  return `${prefix} ${parts.join(', ')}`;
}

function autoCommit() {
  console.log('🔍 Checking for changes...');
  
  if (!hasChanges()) {
    console.log('✓ No changes detected');
    return false;
  }
  
  console.log('📝 Changes detected, committing...');
  
  const changes = detectChangeType();
  const message = generateCommitMessage(changes);
  
  // Configure git remote with token
  exec(`git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/openclaw-gc/workspace.git`);
  
  // Commit and push
  exec('git add .');
  exec(`git commit -m "${message}"`);
  exec('git push origin main');
  
  console.log(`✅ Committed: ${message}`);
  
  // Log the operation
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    changes,
  };
  
  const logPath = path.join('/data/.openclaw/workspace/memory', 'auto-commit-log.jsonl');
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  
  return true;
}

// Run if called directly
if (require.main === module) {
  try {
    autoCommit();
  } catch (err) {
    console.error('❌ Auto-commit failed:', err.message);
    process.exit(1);
  }
}

module.exports = { autoCommit, hasChanges };
