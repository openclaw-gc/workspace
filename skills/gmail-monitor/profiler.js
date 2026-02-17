#!/usr/bin/env node

/**
 * Sender Profiler - Hyper-personalized email response generation
 * Adapts tone, length, formality based on sender profile
 */

const fs = require('fs');
const path = require('path');

const PROFILES_FILE = '/data/.openclaw/workspace/memory/sender-profiles.json';

class SenderProfiler {
  constructor() {
    this.profiles = this.loadProfiles();
  }

  loadProfiles() {
    try {
      if (fs.existsSync(PROFILES_FILE)) {
        return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
    }
    return { profiles: {}, defaults: {} };
  }

  saveProfiles() {
    this.profiles.metadata = this.profiles.metadata || {};
    this.profiles.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(this.profiles, null, 2));
  }

  getProfile(email) {
    const normalized = email.toLowerCase().trim();
    
    // Check exact match
    if (this.profiles.profiles[normalized]) {
      return {
        ...this.profiles.profiles[normalized],
        email: normalized,
        source: 'profile'
      };
    }

    // Check domain patterns
    if (normalized.includes('no-reply') || normalized.includes('noreply')) {
      return {
        ...this.profiles.defaults['system-notification'],
        email: normalized,
        source: 'default-system'
      };
    }

    // Unknown sender - use professional default
    return {
      ...this.profiles.defaults['unknown-professional'],
      email: normalized,
      name: email,
      source: 'default-unknown'
    };
  }

  recordInteraction(email, approved, revised = false) {
    const normalized = email.toLowerCase().trim();
    
    if (!this.profiles.profiles[normalized]) {
      console.log(`No profile for ${normalized} - skipping learning`);
      return;
    }

    const profile = this.profiles.profiles[normalized];
    profile.learningData = profile.learningData || { approvals: 0, revisions: 0 };
    
    if (approved) {
      profile.learningData.approvals++;
    }
    if (revised) {
      profile.learningData.revisions++;
    }
    
    profile.learningData.lastInteraction = new Date().toISOString();
    
    this.saveProfiles();
    console.log(`✓ Learning recorded for ${normalized}`);
  }

  generateResponseGuidance(profile) {
    const guidance = {
      tone: profile.tone || 'professional',
      length: profile.length || 'standard',
      sentences: profile.sentences || '4-6',
      formality: profile.formality || 'professional',
      pattern: profile.responsePattern || 'standard',
      notes: profile.notes || '',
      priority: profile.priority || 'normal'
    };

    // Generate specific instructions
    const instructions = [];
    
    // Tone guidance
    switch (guidance.tone) {
      case 'dry-humor':
        instructions.push('Use dry, self-aware humor. Saul Goodman style.');
        break;
      case 'direct':
        instructions.push('Be direct and efficient. No filler.');
        break;
      case 'warm':
        instructions.push('Warm and friendly tone.');
        break;
      case 'structured-analytical':
        instructions.push('Structured, analytical. Flag uncertainty. No hype.');
        break;
      case 'polite-guarded':
        instructions.push('Polite but maintain professional distance.');
        break;
    }

    // Length guidance
    switch (guidance.length) {
      case 'brief':
        instructions.push(`Keep it brief: ${guidance.sentences} sentences max.`);
        break;
      case 'detailed':
        instructions.push('Provide detailed context and reasoning.');
        break;
      default:
        instructions.push('Standard length: 4-6 sentences.');
    }

    // Pattern-specific guidance
    if (guidance.pattern === 'witty-but-efficient') {
      instructions.push('Witty but efficient. Land the joke, then move on.');
    } else if (guidance.pattern === 'efficient-no-filler') {
      instructions.push('Cut all filler. Get to the point immediately.');
    } else if (guidance.pattern === 'clarity-over-charm') {
      instructions.push('Prioritize clarity and precision over charm.');
    }

    // Add profile notes
    if (guidance.notes) {
      instructions.push(`Context: ${guidance.notes}`);
    }

    guidance.instructions = instructions;
    return guidance;
  }

  createProfile(email, data) {
    const normalized = email.toLowerCase().trim();
    
    const profile = {
      name: data.name || email,
      relationship: data.relationship || 'unknown',
      role: data.role || '',
      formality: data.formality || 'professional',
      tone: data.tone || 'polite-guarded',
      length: data.length || 'standard',
      sentences: data.sentences || '4-6',
      priority: data.priority || 'normal',
      responsePattern: data.responsePattern || 'standard',
      notes: data.notes || '',
      learningData: {
        approvals: 0,
        revisions: 0,
        lastInteraction: new Date().toISOString()
      }
    };

    this.profiles.profiles[normalized] = profile;
    this.profiles.metadata.totalProfiles = Object.keys(this.profiles.profiles).length;
    this.saveProfiles();

    console.log(`✓ Profile created for ${normalized}`);
    return profile;
  }
}

// Export for use in monitor.js
module.exports = SenderProfiler;

// CLI usage
if (require.main === module) {
  const profiler = new SenderProfiler();
  const action = process.argv[2];
  const email = process.argv[3];

  if (action === 'get' && email) {
    const profile = profiler.getProfile(email);
    const guidance = profiler.generateResponseGuidance(profile);
    console.log(JSON.stringify({ profile, guidance }, null, 2));
  } else if (action === 'list') {
    console.log(JSON.stringify(profiler.profiles, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node profiler.js get email@example.com');
    console.log('  node profiler.js list');
  }
}
