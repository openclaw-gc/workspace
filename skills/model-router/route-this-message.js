#!/usr/bin/env node

/**
 * Route This Message - Analyze and determine optimal model tier
 * Returns model to use, then agent switches and responds
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = '/data/.openclaw/workspace/skills/model-router/config.json';

class MessageRouter {
  constructor() {
    this.config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }

  classifyMessage(messageText) {
    const text = messageText.toLowerCase();
    const length = messageText.length;

    // Check for complex keywords
    const complexKeywords = this.config.classification.complexKeywords;
    const complexMatch = complexKeywords.filter(kw => text.includes(kw)).length;

    // Check for standard keywords
    const standardKeywords = this.config.classification.standardKeywords;
    const standardMatch = standardKeywords.filter(kw => text.includes(kw)).length;

    // Check for simple keywords
    const simpleKeywords = this.config.classification.simpleKeywords;
    const simpleMatch = simpleKeywords.filter(kw => text.includes(kw)).length;

    // Scoring: complex > standard > simple
    let tier = 'simple';
    let confidence = 0;

    if (complexMatch > 0) {
      tier = 'complex';
      confidence = Math.min(complexMatch * 0.2, 0.95);
    } else if (standardMatch > 0) {
      tier = 'standard';
      confidence = Math.min(standardMatch * 0.15, 0.85);
    } else if (simpleMatch > 0 || length < this.config.classification.lengthThresholds.simple) {
      tier = 'simple';
      confidence = Math.min(0.8, 0.5 + (simpleMatch * 0.1));
    } else if (length > this.config.classification.lengthThresholds.complex) {
      tier = 'complex';
      confidence = 0.7;
    } else {
      tier = 'standard';
      confidence = 0.6;
    }

    return {
      tier,
      confidence,
      model: this.config.tiers[tier].model,
      keywords: {
        complex: complexMatch,
        standard: standardMatch,
        simple: simpleMatch
      },
      messageLength: length
    };
  }

  logRouting(decision, message) {
    const logPath = '/data/.openclaw/workspace/skills/model-router/.routing-log.jsonl';
    const entry = {
      timestamp: new Date().toISOString(),
      tier: decision.tier,
      model: decision.model,
      confidence: decision.confidence,
      messageLength: decision.messageLength,
      keywords: decision.keywords,
      messagePreview: message.substring(0, 100)
    };

    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
  }

  route(messageText) {
    const decision = this.classifyMessage(messageText);
    this.logRouting(decision, messageText);
    return decision;
  }
}

// CLI interface
if (require.main === module) {
  const message = process.argv[2] || '';
  
  if (!message) {
    console.error('Usage: node route-this-message.js "<message text>"');
    process.exit(1);
  }

  const router = new MessageRouter();
  const decision = router.route(message);

  console.log(JSON.stringify({
    recommendedModel: decision.model,
    tier: decision.tier,
    confidence: (decision.confidence * 100).toFixed(1) + '%',
    action: decision.tier === 'simple' ? 'proceed-as-is' : `call session_status(model='${decision.model}')`,
    reasoning: {
      complexKeywords: decision.keywords.complex,
      standardKeywords: decision.keywords.standard,
      simpleKeywords: decision.keywords.simple,
      messageLength: decision.messageLength
    }
  }, null, 2));
}

module.exports = { MessageRouter };
