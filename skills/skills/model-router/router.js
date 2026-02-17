#!/usr/bin/env node
/**
 * Model Router
 * Main routing logic - determines which model to use based on classification
 */

const fs = require('fs');
const path = require('path');
const TaskClassifier = require('./classifier');
const CostTracker = require('./cost-tracker');

class ModelRouter {
  constructor(configPath, dataPath, logPath) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.classifier = new TaskClassifier(configPath);
    this.costTracker = new CostTracker(configPath, dataPath);
    this.logPath = logPath;
  }

  /**
   * Route a message to the appropriate model
   * @param {Object} input
   * @param {string} input.message - The message text
   * @param {number} input.contextSize - Current context size
   * @param {string} input.currentModel - Current session model
   * @param {Array} input.recentMessages - Recent conversation context
   * @returns {Object} routing decision
   */
  route({ message, contextSize = 0, currentModel = null, recentMessages = [] }) {
    const timestamp = Date.now();

    // 1. Classify the task
    const classification = this.classifier.classify({
      message,
      contextSize,
      recentMessages
    });

    // 2. Get tier configuration
    const tierConfig = this.config.tiers[classification.tier];
    
    // 3. Check budget constraints
    const budgetStatus = this.costTracker.getBudgetStatus();
    let selectedModel = tierConfig.model;
    let budgetOverride = false;

    // Budget enforcement
    if (this.config.mode !== 'shadow') {
      if (budgetStatus.daily.status === 'critical') {
        // Force to cheapest model
        selectedModel = this.config.tiers.simple.model;
        budgetOverride = true;
      } else if (budgetStatus.daily.status === 'warning') {
        // Downgrade complex to standard
        if (classification.tier === 'complex') {
          selectedModel = this.config.tiers.standard.model;
          budgetOverride = true;
        }
      }
    }

    // 4. Check context size limits
    if (contextSize > tierConfig.maxContextSize) {
      // Context too large for this tier, try to downgrade
      if (classification.tier === 'complex' && contextSize <= this.config.tiers.standard.maxContextSize) {
        selectedModel = this.config.tiers.standard.model;
      } else if (contextSize <= this.config.tiers.simple.maxContextSize) {
        selectedModel = this.config.tiers.simple.model;
      }
    }

    // 5. Build routing decision
    const decision = {
      timestamp,
      classification: {
        tier: classification.tier,
        confidence: classification.confidence,
        reasoning: classification.reasoning
      },
      routing: {
        selectedModel,
        tierModel: tierConfig.model,
        fallback: tierConfig.fallback,
        budgetOverride,
        contextSize
      },
      budgetStatus: {
        daily: budgetStatus.daily,
        monthly: budgetStatus.monthly
      },
      mode: this.config.mode,
      shouldSwitch: this.config.mode !== 'shadow' && selectedModel !== currentModel
    };

    // 6. Log the decision
    this.logDecision(decision, message);

    return decision;
  }

  /**
   * Record actual usage after model execution
   */
  recordUsage({ model, inputTokens, outputTokens, tier, timestamp = Date.now() }) {
    const result = this.costTracker.record({
      model,
      inputTokens,
      outputTokens,
      tier,
      timestamp
    });

    return result;
  }

  /**
   * Estimate cost before execution
   */
  estimateCost({ model, estimatedInputTokens = 1000, estimatedOutputTokens = 500 }) {
    const pricing = this.config.pricing[model] || { input: 0, output: 0 };
    
    const inputCost = (estimatedInputTokens / 1_000_000) * pricing.input;
    const outputCost = (estimatedOutputTokens / 1_000_000) * pricing.output;
    
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost,
      model
    };
  }

  logDecision(decision, message) {
    const logEntry = {
      timestamp: decision.timestamp,
      date: new Date(decision.timestamp).toISOString(),
      tier: decision.classification.tier,
      confidence: decision.classification.confidence,
      reasoning: decision.classification.reasoning,
      model: decision.routing.selectedModel,
      budgetOverride: decision.routing.budgetOverride,
      contextSize: decision.routing.contextSize,
      mode: decision.mode,
      messagePreview: message.substring(0, 100),
      budgetStatus: {
        daily: `${decision.budgetStatus.daily.percent.toFixed(2)}%`,
        monthly: `${decision.budgetStatus.monthly.percent.toFixed(2)}%`
      }
    };

    // Append to JSONL log
    fs.appendFileSync(
      this.logPath,
      JSON.stringify(logEntry) + '\n'
    );
  }

  /**
   * Get routing statistics
   */
  getStats(days = 7) {
    if (!fs.existsSync(this.logPath)) {
      return { error: 'No routing log found' };
    }

    const lines = fs.readFileSync(this.logPath, 'utf8').trim().split('\n');
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const recentEntries = lines
      .map(line => JSON.parse(line))
      .filter(entry => entry.timestamp > cutoff);

    const tierCounts = { simple: 0, standard: 0, complex: 0 };
    const modelCounts = {};
    let totalConfidence = 0;
    let budgetOverrideCount = 0;

    recentEntries.forEach(entry => {
      tierCounts[entry.tier] = (tierCounts[entry.tier] || 0) + 1;
      modelCounts[entry.model] = (modelCounts[entry.model] || 0) + 1;
      totalConfidence += entry.confidence;
      if (entry.budgetOverride) budgetOverrideCount++;
    });

    return {
      period: `Last ${days} days`,
      totalRoutings: recentEntries.length,
      tierDistribution: tierCounts,
      modelDistribution: modelCounts,
      avgConfidence: recentEntries.length > 0 ? totalConfidence / recentEntries.length : 0,
      budgetOverrides: budgetOverrideCount
    };
  }
}

// CLI interface
if (require.main === module) {
  const configPath = path.join(__dirname, 'config.json');
  const dataPath = path.join(__dirname, '.cost-data.json');
  const logPath = path.join(__dirname, '.routing-log.jsonl');
  
  const router = new ModelRouter(configPath, dataPath, logPath);

  const command = process.argv[2];

  if (command === 'route') {
    const message = process.argv[3] || 'test message';
    const contextSize = parseInt(process.argv[4]) || 0;
    
    const decision = router.route({ message, contextSize });
    console.log(JSON.stringify(decision, null, 2));
  } else if (command === 'stats') {
    const days = parseInt(process.argv[3]) || 7;
    const stats = router.getStats(days);
    console.log(JSON.stringify(stats, null, 2));
  } else if (command === 'estimate') {
    const model = process.argv[3] || 'anthropic/claude-sonnet-4-5';
    const cost = router.estimateCost({ model });
    console.log(JSON.stringify(cost, null, 2));
  } else {
    console.log('Usage: node router.js [route <message> <contextSize>|stats <days>|estimate <model>]');
  }
}

module.exports = ModelRouter;
