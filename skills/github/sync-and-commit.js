#!/usr/bin/env node

/**
 * GitHub Sync & Commit Automation
 * Syncs workspace files to git repo and commits/pushes changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: '/data/.openclaw/workspace/.env.gale' });

const WORKSPACE_DIR = '/data/.openclaw/workspace';
const REPO_DIR = '/data/.openclaw/workspace-repo';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: REPO_DIR, ...opts });
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`);
    console.error(err.stderr || err.message);
    throw err;
  }
}

function syncFiles() {
  console.log('📁 Syncing workspace files...');
  
  // Copy key files (root level)
  const rootFiles = [
    'AGENTS.md', 'SOUL.md', 'USER.md', 'IDENTITY.md', 'TOOLS.md', 
    'HEARTBEAT.md', 'MEMORY.md'
  ];
  
  for (const file of rootFiles) {
    const src = path.join(WORKSPACE_DIR, file);
    const dest = path.join(REPO_DIR, file);
    if (fs.existsSync(src)) {
      exec(`cp ${src} ${dest}`, { cwd: WORKSPACE_DIR });
    }
  }
  
  // Copy directories (remove dest first to avoid nesting)
  const dirsToSync = ['deliverables', 'skills', 'specs', 'memory'];
  
  for (const dir of dirsToSync) {
    const src = path.join(WORKSPACE_DIR, dir);
    const dest = path.join(REPO_DIR, dir);
    
    if (!fs.existsSync(src)) continue;
    
    // Remove dest and recreate
    exec(`rm -rf ${dest}`, { cwd: REPO_DIR });
    exec(`cp -r ${src} ${dest}`, { cwd: WORKSPACE_DIR });
  }
  
  // Remove temp files from repo
  const tempFiles = [
    'memory/.gmail-last-check',
    'memory/.gmail-processed-ids.json',
    'memory/email-queue.json',
    'memory/gmail-log.jsonl'
  ];
  
  for (const file of tempFiles) {
    const fullPath = path.join(REPO_DIR, file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  
  console.log('✓ Files synced');
}

function gitCommitAndPush(message) {
  console.log('🔄 Git operations...');
  
  // Configure remote with token
  exec(`git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/openclaw-gc/workspace.git`);
  
  // Check for changes
  const status = exec('git status --porcelain');
  if (!status.trim()) {
    console.log('ℹ️  No changes to commit');
    return false;
  }
  
  console.log('Changes detected:');
  console.log(status);
  
  // Add, commit, push
  exec('git add .');
  exec(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  exec('git push origin main');
  
  console.log('✓ Committed and pushed');
  return true;
}

function logOperation(message, success) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    success,
  };
  
  const logPath = path.join(WORKSPACE_DIR, 'memory', 'github-sync-log.jsonl');
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
}

// Main
const commitMessage = process.argv[2] || 'Update workspace files';

console.log(`🚀 GitHub sync starting: "${commitMessage}"`);

try {
  syncFiles();
  const hadChanges = gitCommitAndPush(commitMessage);
  logOperation(commitMessage, true);
  
  if (hadChanges) {
    console.log('✅ Sync complete - changes pushed to GitHub');
  } else {
    console.log('✅ Sync complete - no changes');
  }
  process.exit(0);
} catch (err) {
  console.error('❌ Sync failed:', err.message);
  logOperation(commitMessage, false);
  process.exit(1);
}
