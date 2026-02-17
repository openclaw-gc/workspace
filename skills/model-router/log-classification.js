#!/usr/bin/env node

/**
 * Log message classification (shadow mode)
 * Call this from OpenClaw hooks to track what the router would do
 */

const fs = require('fs');
const path = require('path');

// Import classifier
const classifyMessage = require('./classifier.js');

const LOG_PATH = path.join(__dirname, '.routing-log.jsonl');

function logClassification(message, userId = 'unknown') {
  try {
    const classification = classifyMessage(message);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      message: message.slice(0, 100), // Truncate for privacy
      tier: classification.tier,
      model: classification.model,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      shadowMode: true,
    };
    
    fs.appendFileSync(LOG_PATH, JSON.stringify(logEntry) + '\n');
    
    return classification;
  } catch (err) {
    console.error('Classification logging failed:', err.message);
    return null;
  }
}

// CLI usage
if (require.main === module) {
  const message = process.argv.slice(2).join(' ');
  if (!message) {
    console.error('Usage: node log-classification.js <message>');
    process.exit(1);
  }
  
  const result = logClassification(message);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = logClassification;
