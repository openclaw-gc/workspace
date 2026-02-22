#!/usr/bin/env node
/**
 * OpenClaw Model Router Integration
 * Provides routing decisions for incoming messages
 */

const ModelRouter = require('./router');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const dataPath = path.join(__dirname, '.cost-data.json');
const logPath = path.join(__dirname, '.routing-log.jsonl');

const router = new ModelRouter(configPath, dataPath, logPath);

/**
 * Analyze an incoming message and return routing decision
 */
function analyzeMessage(message, currentModel, contextSize = 0) {
  const decision = router.route({
    message,
    contextSize,
    currentModel,
    recentMessages: []
  });

  return {
    shouldSwitch: decision.shouldSwitch,
    recommendedModel: decision.routing.selectedModel,
    currentModel,
    tier: decision.classification.tier,
    confidence: decision.classification.confidence,
    reasoning: decision.classification.reasoning,
    budgetStatus: decision.budgetStatus,
    mode: decision.mode
  };
}

/**
 * Record actual usage after message processing
 */
function recordUsage(model, inputTokens, outputTokens, tier) {
  return router.recordUsage({
    model,
    inputTokens,
    outputTokens,
    tier,
    timestamp: Date.now()
  });
}

/**
 * Get current budget status
 */
function getBudgetStatus() {
  return router.costTracker.getBudgetStatus();
}

/**
 * Get routing statistics
 */
function getStats(days = 7) {
  return router.getStats(days);
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'analyze') {
    const message = process.argv[3] || '';
    const currentModel = process.argv[4] || 'anthropic/claude-sonnet-4-5';
    const contextSize = parseInt(process.argv[5]) || 0;

    const result = analyzeMessage(message, currentModel, contextSize);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'record') {
    const model = process.argv[3];
    const inputTokens = parseInt(process.argv[4]);
    const outputTokens = parseInt(process.argv[5]);
    const tier = process.argv[6] || 'standard';

    const result = recordUsage(model, inputTokens, outputTokens, tier);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'budget') {
    const status = getBudgetStatus();
    console.log(JSON.stringify(status, null, 2));
  } else if (command === 'stats') {
    const days = parseInt(process.argv[3]) || 7;
    const stats = getStats(days);
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log('OpenClaw Model Router Integration');
    console.log('');
    console.log('Commands:');
    console.log('  analyze <message> <currentModel> <contextSize>  - Get routing decision');
    console.log('  record <model> <inputTokens> <outputTokens> <tier> - Record usage');
    console.log('  budget                                         - Get budget status');
    console.log('  stats <days>                                   - Get routing stats');
  }
}

module.exports = {
  analyzeMessage,
  recordUsage,
  getBudgetStatus,
  getStats
};
