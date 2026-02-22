#!/usr/bin/env node
/**
 * Quick Router - Simple routing for current message
 * Returns model recommendation in easy-to-use format
 */

const { analyzeMessage } = require('./integrate');

// Get message from args
const message = process.argv.slice(2).join(' ') || '';

if (!message) {
  console.log('Usage: node quick-route.js <message>');
  console.log('');
  console.log('Example:');
  console.log('  node quick-route.js "Design a comprehensive system"');
  process.exit(1);
}

// Analyze
const analysis = analyzeMessage(
  message,
  'anthropic/claude-sonnet-4-5', // assume Sonnet is current
  70000 // assume mid-large context
);

// Format output
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 ROUTER DECISION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Message: ${message.substring(0, 60)}${message.length > 60 ? '...' : ''}`);
console.log(`Tier: ${analysis.tier.toUpperCase()}`);
console.log(`Recommended: ${analysis.recommendedModel.split('/')[1]}`);
console.log(`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
console.log(`Reasoning: ${analysis.reasoning}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (analysis.shouldSwitch) {
  const modelAlias = {
    'anthropic/claude-haiku-4-5': 'haiku',
    'anthropic/claude-sonnet-4-5': 'sonnet',
    'anthropic/claude-opus-4-6': 'opus'
  }[analysis.recommendedModel] || analysis.recommendedModel;

  console.log('');
  console.log(`💡 Switch to: ${modelAlias}`);
  console.log(`   session_status(model="${analysis.recommendedModel}")`);
  console.log('');
} else {
  console.log('');
  console.log('✓ Current model is optimal');
  console.log('');
}

// Budget status
if (analysis.budgetStatus) {
  const daily = analysis.budgetStatus.daily;
  if (daily.percent > 50) {
    console.log(`⚠️  Daily budget: ${daily.percent.toFixed(0)}% used ($${daily.spent.toFixed(2)}/$${daily.budget})`);
    console.log('');
  }
}
