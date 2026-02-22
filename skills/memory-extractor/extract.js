#!/usr/bin/env node

/**
 * Memory Extractor
 * Scans recent session history for completions and generates memory snippets
 */

const fs = require('fs');
const path = require('path');

// Completion indicators to scan for
const COMPLETION_PATTERNS = [
  /\b(deployed|live|completed|shipped|done|finished|built|created|setup|configured)\b/gi,
  /✅/g,
  /\b(is now|now available|now live)\b/gi,
  /\b(successfully|completed successfully)\b/gi,
];

// Infrastructure keywords
const INFRA_KEYWORDS = [
  'url', 'domain', 'port', 'password', 'credential', 'access',
  'dashboard', 'api', 'endpoint', 'server', 'vps', 'docker',
  'http://', 'https://', 'tailscale', 'cron job'
];

// Decision keywords
const DECISION_KEYWORDS = [
  'decided', 'decision', 'approved', 'switched', 'changed',
  'policy', 'strategy', 'recommendation', 'selected'
];

/**
 * Parse session history from stdin (JSONL format)
 */
function parseHistory(input) {
  const lines = input.trim().split('\n').filter(line => line.trim());
  const messages = [];
  
  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      if (msg.role === 'assistant' && msg.content) {
        messages.push({
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }
  
  return messages;
}

/**
 * Extract completions from messages
 */
function extractCompletions(messages) {
  const completions = [];
  
  for (const msg of messages) {
    const content = msg.content;
    
    // Check for completion patterns
    let hasCompletion = false;
    for (const pattern of COMPLETION_PATTERNS) {
      if (pattern.test(content)) {
        hasCompletion = true;
        break;
      }
    }
    
    if (!hasCompletion) continue;
    
    // Categorize the completion
    let category = 'general';
    if (INFRA_KEYWORDS.some(kw => content.toLowerCase().includes(kw))) {
      category = 'infrastructure';
    } else if (DECISION_KEYWORDS.some(kw => content.toLowerCase().includes(kw))) {
      category = 'decision';
    }
    
    // Extract key sentences (up to 3)
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const keySentences = sentences
      .filter(s => {
        const lower = s.toLowerCase();
        return COMPLETION_PATTERNS.some(p => p.test(lower)) ||
               s.includes('✅');
      })
      .slice(0, 3)
      .map(s => s.trim());
    
    if (keySentences.length > 0) {
      completions.push({
        category,
        timestamp: msg.timestamp,
        sentences: keySentences,
        fullContent: content.substring(0, 500) // First 500 chars for context
      });
    }
  }
  
  return completions;
}

/**
 * Format completions as memory snippets
 */
function formatMemorySnippets(completions) {
  const snippets = {
    infrastructure: [],
    decisions: [],
    general: []
  };
  
  for (const comp of completions) {
    const snippet = comp.sentences.join(' ');
    
    if (comp.category === 'infrastructure') {
      snippets.infrastructure.push(`- ${snippet}`);
    } else if (comp.category === 'decision') {
      snippets.decisions.push(`- ${snippet}`);
    } else {
      snippets.general.push(`- ${snippet}`);
    }
  }
  
  return snippets;
}

/**
 * Main execution
 */
async function main() {
  // Read from stdin (session history JSONL)
  let input = '';
  
  if (process.stdin.isTTY) {
    console.error('Usage: sessions_history | node extract.js');
    console.error('Or: cat session-history.jsonl | node extract.js');
    process.exit(1);
  }
  
  process.stdin.setEncoding('utf8');
  
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  
  const messages = parseHistory(input);
  
  if (messages.length === 0) {
    console.log('No messages found in input');
    return;
  }
  
  console.log(`Analyzing ${messages.length} assistant messages...\n`);
  
  const completions = extractCompletions(messages);
  
  if (completions.length === 0) {
    console.log('No completions detected in session history');
    return;
  }
  
  console.log(`Found ${completions.length} completions\n`);
  
  const snippets = formatMemorySnippets(completions);
  
  // Output formatted snippets
  console.log('=== MEMORY SNIPPETS FOR REVIEW ===\n');
  
  if (snippets.infrastructure.length > 0) {
    console.log('## Infrastructure Updates:');
    snippets.infrastructure.forEach(s => console.log(s));
    console.log('');
  }
  
  if (snippets.decisions.length > 0) {
    console.log('## Decisions Made:');
    snippets.decisions.forEach(s => console.log(s));
    console.log('');
  }
  
  if (snippets.general.length > 0) {
    console.log('## General Completions:');
    snippets.general.forEach(s => console.log(s));
    console.log('');
  }
  
  console.log('=== END SNIPPETS ===');
  console.log('\nReview these snippets and add relevant ones to MEMORY.md or daily memory files.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
