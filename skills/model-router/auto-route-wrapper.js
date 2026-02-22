#!/usr/bin/env node
/**
 * Auto-Route Wrapper - ACTUAL model switching
 * 
 * This script:
 * 1. Analyzes incoming message
 * 2. Determines optimal model tier
 * 3. ACTUALLY switches model via session_status if needed
 * 4. Returns model to use
 * 
 * Usage: Call this at start of every message/heartbeat
 */

const { analyzeMessage } = require('./integrate');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Route message and ACTUALLY switch model
 */
async function routeAndSwitch(message, currentModel, contextSize = 0) {
  try {
    // Get routing decision
    const decision = analyzeMessage(message, currentModel, contextSize);
    
    console.error('[ROUTER] Decision:', JSON.stringify(decision, null, 2));
    
    if (decision.shouldSwitch) {
      console.error(`[ROUTER] Switching: ${currentModel} → ${decision.recommendedModel}`);
      
      // ACTUALLY SWITCH MODEL via session_status tool
      // This is the missing piece - the router was only logging, never switching
      const switchCommand = `openclaw session model ${decision.recommendedModel}`;
      
      try {
        const { stdout, stderr } = await execPromise(switchCommand);
        console.error('[ROUTER] Model switched successfully');
        console.error('[ROUTER] Output:', stdout);
        
        return {
          switched: true,
          from: currentModel,
          to: decision.recommendedModel,
          tier: decision.tier,
          confidence: decision.confidence
        };
      } catch (switchError) {
        console.error('[ROUTER] Failed to switch model:', switchError.message);
        // Continue with current model if switch fails
        return {
          switched: false,
          error: switchError.message,
          recommendedModel: decision.recommendedModel
        };
      }
    } else {
      console.error(`[ROUTER] Staying on ${currentModel} (optimal for tier: ${decision.tier})`);
      return {
        switched: false,
        model: currentModel,
        tier: decision.tier,
        confidence: decision.confidence
      };
    }
  } catch (error) {
    console.error('[ROUTER] Error in routeAndSwitch:', error.message);
    return {
      switched: false,
      error: error.message
    };
  }
}

// CLI interface
if (require.main === module) {
  const message = process.argv[2] || '';
  const currentModel = process.argv[3] || 'anthropic/claude-haiku-4-5';
  const contextSize = parseInt(process.argv[4]) || 0;

  routeAndSwitch(message, currentModel, contextSize)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.switched ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(2);
    });
}

module.exports = { routeAndSwitch };
