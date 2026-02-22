#!/usr/bin/env node
/**
 * Task Classifier
 * Analyzes message content and context to determine complexity tier
 */

const fs = require('fs');
const path = require('path');

class TaskClassifier {
  constructor(configPath) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Classify a message into simple/standard/complex
   * @param {Object} input
   * @param {string} input.message - The message text
   * @param {number} input.contextSize - Current context size in tokens
   * @param {Array} input.recentMessages - Last 3-5 messages for context
   * @returns {Object} { tier, confidence, reasoning }
   */
  classify({ message, contextSize = 0, recentMessages = [] }) {
    const signals = {
      simple: 0,
      standard: 0,
      complex: 0
    };

    // 1. Check for user hints/overrides
    const userHint = this.checkUserHints(message);
    if (userHint) {
      return {
        tier: userHint,
        confidence: 1.0,
        reasoning: 'User explicit hint detected'
      };
    }

    // 2. Message length analysis
    const msgLength = message.trim().length;
    if (msgLength < this.config.classification.lengthThresholds.simple) {
      signals.simple += 2;
    } else if (msgLength > this.config.classification.lengthThresholds.complex) {
      signals.complex += 2;
    } else {
      signals.standard += 1;
    }

    // 3. Keyword matching
    const lowerMsg = message.toLowerCase();
    
    this.config.classification.simpleKeywords.forEach(keyword => {
      if (lowerMsg.includes(keyword)) {
        signals.simple += 1;
      }
    });

    if (this.config.classification.standardKeywords) {
      this.config.classification.standardKeywords.forEach(keyword => {
        if (lowerMsg.includes(keyword)) {
          signals.standard += 2;
        }
      });
    }

    this.config.classification.complexKeywords.forEach(keyword => {
      if (lowerMsg.includes(keyword)) {
        signals.complex += 2;
      }
    });

    // 4. Question detection
    if (message.trim().endsWith('?') && message.split(' ').length < 10) {
      signals.simple += 1;
    }

    // 5. Code block detection
    if (message.includes('```')) {
      signals.complex += 1;
    }

    // 6. Context size analysis
    if (contextSize > this.config.classification.contextThresholds.complex) {
      signals.complex += 1;
    } else if (contextSize > this.config.classification.contextThresholds.standard) {
      signals.standard += 1;
    }

    // 7. Conversation depth (if we have recent messages)
    if (recentMessages.length > 5) {
      signals.standard += 1;
    }

    // 8. Multi-step indicators
    const multiStepPatterns = [
      'first', 'then', 'after that', 'finally',
      'step 1', 'step 2', '1.', '2.', '3.'
    ];
    const hasMultiStep = multiStepPatterns.some(pattern => 
      lowerMsg.includes(pattern)
    );
    if (hasMultiStep) {
      signals.complex += 2;
    }

    // Determine winning tier
    const maxSignal = Math.max(signals.simple, signals.standard, signals.complex);
    let tier = 'standard'; // default fallback
    
    if (signals.simple === maxSignal && signals.simple > 0) {
      tier = 'simple';
    } else if (signals.complex === maxSignal && signals.complex > 0) {
      tier = 'complex';
    }

    // Calculate confidence
    const totalSignals = signals.simple + signals.standard + signals.complex;
    const confidence = totalSignals > 0 ? maxSignal / totalSignals : 0.5;

    // Build reasoning
    const reasoning = this.buildReasoning(signals, msgLength, contextSize);

    return { tier, confidence, reasoning };
  }

  checkUserHints(message) {
    if (!this.config.overrides.userHints.enabled) return null;

    for (const [pattern, tier] of Object.entries(this.config.overrides.userHints.patterns)) {
      if (message.toLowerCase().includes(pattern)) {
        return tier;
      }
    }
    return null;
  }

  buildReasoning(signals, msgLength, contextSize) {
    const parts = [];
    
    if (signals.simple > 0) parts.push(`simple signals: ${signals.simple}`);
    if (signals.standard > 0) parts.push(`standard signals: ${signals.standard}`);
    if (signals.complex > 0) parts.push(`complex signals: ${signals.complex}`);
    
    parts.push(`length: ${msgLength} chars`);
    
    if (contextSize > 0) {
      parts.push(`context: ${Math.round(contextSize / 1000)}k tokens`);
    }

    return parts.join(', ');
  }
}

// CLI interface
if (require.main === module) {
  const configPath = path.join(__dirname, 'config.json');
  const classifier = new TaskClassifier(configPath);

  const input = {
    message: process.argv[2] || 'test message',
    contextSize: parseInt(process.argv[3]) || 0,
    recentMessages: []
  };

  const result = classifier.classify(input);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = TaskClassifier;
