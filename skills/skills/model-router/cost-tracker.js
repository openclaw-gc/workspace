#!/usr/bin/env node
/**
 * Cost Tracker
 * Tracks token usage and estimated costs per model
 */

const fs = require('fs');
const path = require('path');

class CostTracker {
  constructor(configPath, dataPath) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.dataPath = dataPath;
    this.data = this.loadData();
  }

  loadData() {
    if (fs.existsSync(this.dataPath)) {
      return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    }
    return {
      daily: {},
      monthly: {},
      budgets: this.config.budgets
    };
  }

  saveData() {
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  /**
   * Record a model usage event
   * @param {Object} event
   * @param {string} event.model - Model identifier
   * @param {number} event.inputTokens - Input tokens used
   * @param {number} event.outputTokens - Output tokens used
   * @param {string} event.tier - Complexity tier
   * @param {number} event.timestamp - Unix timestamp
   */
  record({ model, inputTokens, outputTokens, tier, timestamp = Date.now() }) {
    const date = this.getDateKey(timestamp);
    const month = this.getMonthKey(timestamp);

    // Initialize day if needed
    if (!this.data.daily[date]) {
      this.data.daily[date] = {
        models: {},
        total: 0,
        messageCount: 0
      };
    }

    // Initialize month if needed
    if (!this.data.monthly[month]) {
      this.data.monthly[month] = {
        models: {},
        total: 0,
        messageCount: 0
      };
    }

    // Get pricing for this model
    const pricing = this.config.pricing[model] || { input: 0, output: 0 };
    
    // Calculate cost (pricing is per 1M tokens)
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const totalCost = inputCost + outputCost;

    // Update daily stats
    if (!this.data.daily[date].models[model]) {
      this.data.daily[date].models[model] = {
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        count: 0,
        tiers: { simple: 0, standard: 0, complex: 0 }
      };
    }

    const dayModel = this.data.daily[date].models[model];
    dayModel.inputTokens += inputTokens;
    dayModel.outputTokens += outputTokens;
    dayModel.cost += totalCost;
    dayModel.count += 1;
    dayModel.tiers[tier] = (dayModel.tiers[tier] || 0) + 1;

    this.data.daily[date].total += totalCost;
    this.data.daily[date].messageCount += 1;

    // Update monthly stats (same structure)
    if (!this.data.monthly[month].models[model]) {
      this.data.monthly[month].models[model] = {
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        count: 0,
        tiers: { simple: 0, standard: 0, complex: 0 }
      };
    }

    const monthModel = this.data.monthly[month].models[model];
    monthModel.inputTokens += inputTokens;
    monthModel.outputTokens += outputTokens;
    monthModel.cost += totalCost;
    monthModel.count += 1;
    monthModel.tiers[tier] = (monthModel.tiers[tier] || 0) + 1;

    this.data.monthly[month].total += totalCost;
    this.data.monthly[month].messageCount += 1;

    this.saveData();

    return {
      date,
      month,
      cost: totalCost,
      dailyTotal: this.data.daily[date].total,
      monthlyTotal: this.data.monthly[month].total
    };
  }

  /**
   * Get current budget status
   */
  getBudgetStatus() {
    const today = this.getDateKey(Date.now());
    const thisMonth = this.getMonthKey(Date.now());

    const dailySpent = this.data.daily[today]?.total || 0;
    const monthlySpent = this.data.monthly[thisMonth]?.total || 0;

    const dailyBudget = this.data.budgets.daily;
    const monthlyBudget = this.data.budgets.monthly;

    const dailyPercent = dailyBudget > 0 ? dailySpent / dailyBudget : 0;
    const monthlyPercent = monthlyBudget > 0 ? monthlySpent / monthlyBudget : 0;

    return {
      daily: {
        spent: dailySpent,
        budget: dailyBudget,
        remaining: Math.max(0, dailyBudget - dailySpent),
        percent: dailyPercent,
        status: this.getBudgetTier(dailyPercent)
      },
      monthly: {
        spent: monthlySpent,
        budget: monthlyBudget,
        remaining: Math.max(0, monthlyBudget - monthlySpent),
        percent: monthlyPercent,
        status: this.getBudgetTier(monthlyPercent)
      }
    };
  }

  getBudgetTier(percent) {
    const thresholds = this.data.budgets.alertThresholds;
    if (percent >= thresholds.critical) return 'critical';
    if (percent >= thresholds.warning) return 'warning';
    return 'ok';
  }

  /**
   * Get summary for today
   */
  getTodaySummary() {
    const today = this.getDateKey(Date.now());
    const data = this.data.daily[today];

    if (!data) {
      return {
        date: today,
        total: 0,
        messageCount: 0,
        models: {}
      };
    }

    return {
      date: today,
      total: data.total,
      messageCount: data.messageCount,
      avgCostPerMessage: data.messageCount > 0 ? data.total / data.messageCount : 0,
      models: data.models
    };
  }

  getDateKey(timestamp) {
    const d = new Date(timestamp);
    return d.toISOString().split('T')[0];
  }

  getMonthKey(timestamp) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

// CLI interface
if (require.main === module) {
  const configPath = path.join(__dirname, 'config.json');
  const dataPath = path.join(__dirname, '.cost-data.json');
  const tracker = new CostTracker(configPath, dataPath);

  const command = process.argv[2];

  if (command === 'status') {
    const status = tracker.getBudgetStatus();
    console.log('Budget Status:');
    console.log(`Daily: $${status.daily.spent.toFixed(2)} / $${status.daily.budget.toFixed(2)} (${(status.daily.percent * 100).toFixed(1)}%) - ${status.daily.status}`);
    console.log(`Monthly: $${status.monthly.spent.toFixed(2)} / $${status.monthly.budget.toFixed(2)} (${(status.monthly.percent * 100).toFixed(1)}%) - ${status.monthly.status}`);
  } else if (command === 'today') {
    const summary = tracker.getTodaySummary();
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('Usage: node cost-tracker.js [status|today]');
  }
}

module.exports = CostTracker;
