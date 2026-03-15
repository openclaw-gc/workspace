#!/usr/bin/env node
/**
 * GUARDRAILS VALIDATOR
 * Checks responses/actions against guardrails.json rules
 * Runs pre-output and pre-execute validation
 */

const fs = require('fs');
const path = require('path');

const GUARDRAILS_PATH = '/data/.openclaw/workspace/memory/guardrails.json';
const AUDIT_LOG = '/data/.openclaw/workspace/memory/audit.jsonl';

// Load guardrails
function loadGuardrails() {
  const content = fs.readFileSync(GUARDRAILS_PATH, 'utf-8');
  return JSON.parse(content);
}

// Validate timezone calculation
function validateTimezoneCalculation(text) {
  const guardrails = loadGuardrails();
  const tzRule = guardrails.rules.find(r => r.id === 'tz-calculation');
  
  const triggers = tzRule.trigger;
  const hasTimeTrigger = triggers.some(t => 
    new RegExp(t, 'gi').test(text)
  );
  
  if (!hasTimeTrigger) {
    return { valid: true, rule: 'tz-calculation' };
  }
  
  // Check for timezone context
  const tzPattern = /GMT\+8|Melbourne|AEDT|KL|Kuala Lumpur|Asia\/Kuala_Lumpur|Australia\/Melbourne/gi;
  const hasTzContext = tzPattern.test(text);
  
  if (!hasTzContext) {
    return {
      valid: false,
      rule: 'tz-calculation',
      severity: tzRule.severity,
      message: tzRule.validation.message,
      violation: `Time statement detected (${triggers.filter(t => new RegExp(t, 'gi').test(text)).join(', ')}) but no timezone context`
    };
  }
  
  return { valid: true, rule: 'tz-calculation' };
}

// Validate no fabrication
function validateNoFabrication(text) {
  const guardrails = loadGuardrails();
  const fabRule = guardrails.rules.find(r => r.id === 'no-fabrication');
  
  // Simple heuristics (can be expanded)
  const fabricationPatterns = [
    /exactly \d+%/i,
    /precisely \d+\.\d+%/i,
    /estimated at \$[\d,]+/i,
    /approximately [\d,]+ users/i
  ];
  
  const hasFabrication = fabricationPatterns.some(p => p.test(text));
  
  if (hasFabrication) {
    // Check if data is sourced or explicitly stated as estimate
    const isSourced = /according to|data shows|metrics indicate|report indicates/i.test(text);
    const isExplicitEstimate = /estimate|approximate|roughly|approximately|around/i.test(text);
    
    if (!isSourced && !isExplicitEstimate) {
      return {
        valid: false,
        rule: 'no-fabrication',
        severity: fabRule.severity,
        message: fabRule.validation.message,
        violation: 'Specific numbers without explicit source or "estimate" qualifier'
      };
    }
  }
  
  return { valid: true, rule: 'no-fabrication' };
}

// Validate uncertainty flagging
function validateUncertaintyFlagging(text) {
  const guardrails = loadGuardrails();
  const uncRule = guardrails.rules.find(r => r.id === 'flag-uncertainty');
  
  // Check if text contains analysis/opinion/inference
  const analysisIndicators = [
    /i (think|believe|suspect|assume|infer)/i,
    /this (suggests|indicates|implies|might)/i,
    /likely|probably|possibly|may|could|should/i,
    /analysis|recommendation|insight|assessment/i
  ];
  
  const hasAnalysis = analysisIndicators.some(p => p.test(text));
  
  if (!hasAnalysis) {
    return { valid: true, rule: 'flag-uncertainty' };
  }
  
  // Check if uncertainty is flagged
  const uncertaintyFlags = [
    /uncertain|confidence|soft logic|assumption|caveat/i,
    /\(confidence: \d+%\)/i,
    /needs validation|should verify|test this/i
  ];
  
  const hasUncertaintyFlag = uncertaintyFlags.some(p => p.test(text));
  
  if (!hasUncertaintyFlag) {
    return {
      valid: false,
      rule: 'flag-uncertainty',
      severity: uncRule.severity,
      message: uncRule.validation.message,
      violation: 'Analysis/opinion provided without flagging confidence or caveats'
    };
  }
  
  return { valid: true, rule: 'flag-uncertainty' };
}

// Run pre-output validation
function validatePreOutput(text) {
  const rules = [
    validateTimezoneCalculation(text),
    validateNoFabrication(text),
    validateUncertaintyFlagging(text)
  ];
  
  const failures = rules.filter(r => !r.valid);
  
  return {
    valid: failures.length === 0,
    failures,
    passed: rules.filter(r => r.valid).length,
    total: rules.length
  };
}

// Audit violation
function auditViolation(rule, violation) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'GUARDRAIL_VIOLATION',
    rule: rule.rule,
    severity: rule.severity,
    violation: rule.violation,
    message: rule.message
  };
  fs.appendFileSync(AUDIT_LOG, JSON.stringify(entry) + '\n');
}

// Export for use in response pipeline
module.exports = {
  loadGuardrails,
  validateTimezoneCalculation,
  validateNoFabrication,
  validateUncertaintyFlagging,
  validatePreOutput,
  auditViolation
};

// CLI usage
if (require.main === module) {
  const testText = process.argv[2] || 'Test text with time tomorrow at 5:35 AM';
  console.log('Testing:', testText);
  const result = validatePreOutput(testText);
  console.log(JSON.stringify(result, null, 2));
}
