#!/usr/bin/env node
/**
 * Pinkman Synthesis Engine
 * Connects findings across interviews, identifies patterns, flags cross-member insights
 */

const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../../memory/pinkman-research');
const SYNTHESIS_LOG = path.join(__dirname, '../../memory/pinkman-synthesis.jsonl');
const MEMBER_PROFILES = path.join(__dirname, 'member-profiles.json');

// Ensure research dir exists
if (!fs.existsSync(RESEARCH_DIR)) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
}

/**
 * Load all research notes
 */
function loadResearchNotes() {
  const files = fs.readdirSync(RESEARCH_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(RESEARCH_DIR, file), 'utf-8'));
    } catch (err) {
      console.error(`[SYNTHESIS] Failed to load ${file}:`, err.message);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Load member profiles
 */
function loadMemberProfiles() {
  try {
    return JSON.parse(fs.readFileSync(MEMBER_PROFILES, 'utf-8')).members;
  } catch (err) {
    console.error('[SYNTHESIS] Failed to load member profiles:', err.message);
    return {};
  }
}

/**
 * Extract technical stacks across all members
 */
function analyzeTechStacks(notes) {
  const stacks = {};
  
  notes.forEach((note) => {
    if (!note.content.technical_stack) return;
    
    const member = note.source.member;
    if (!stacks[member]) {
      stacks[member] = {};
    }
    
    note.content.technical_stack.forEach((tech) => {
      stacks[member][tech] = (stacks[member][tech] || 0) + 1;
    });
  });

  // Find shared technologies
  const allMembers = Object.keys(stacks);
  const sharedTechs = {};
  
  allMembers.forEach((member1) => {
    allMembers.forEach((member2) => {
      if (member1 >= member2) return; // Avoid duplicates
      
      const tech1 = Object.keys(stacks[member1]);
      const tech2 = Object.keys(stacks[member2]);
      const shared = tech1.filter((t) => tech2.includes(t));
      
      if (shared.length > 0) {
        const key = [member1, member2].sort().join('↔');
        sharedTechs[key] = shared;
      }
    });
  });

  return { stacks, sharedTechs };
}

/**
 * Extract bottleneck patterns
 */
function analyzeBottlenecks(notes) {
  const bottlenecks = {};
  const categories = {};

  notes.forEach((note) => {
    if (!note.content.bottlenecks) return;

    const member = note.source.member;
    if (!bottlenecks[member]) {
      bottlenecks[member] = [];
    }

    note.content.bottlenecks.forEach((bn) => {
      bottlenecks[member].push(bn);
      categories[bn.area] = (categories[bn.area] || 0) + 1;
    });
  });

  // Find common bottlenecks
  const commonBottlenecks = Object.entries(categories)
    .filter(([_, count]) => count >= 2)
    .map(([area, count]) => ({ area, members_affected: count }));

  return { bottlenecks, commonBottlenecks };
}

/**
 * Find cross-member signal opportunities
 */
function findCrossSignals(notes, memberProfiles) {
  const signals = [];

  // For each pair of members
  const members = Object.keys(memberProfiles);
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const m1 = members[i];
      const m2 = members[j];

      const note1 = notes.find((n) => n.source.member === m1);
      const note2 = notes.find((n) => n.source.member === m2);

      if (!note1 || !note2) continue;

      // Check for shared tech
      const tech1 = note1.content.technical_stack || [];
      const tech2 = note2.content.technical_stack || [];
      const sharedTech = tech1.filter((t) => tech2.includes(t));

      if (sharedTech.length > 0) {
        signals.push({
          type: 'shared_technology',
          members: [m1, m2],
          shared: sharedTech,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for similar problems
      const problem1 = (note1.content.problem_statement || '').toLowerCase();
      const problem2 = (note2.content.problem_statement || '').toLowerCase();

      const keywords = ['scale', 'latency', 'cost', 'agent', 'inference', 'async', 'routing'];
      keywords.forEach((kw) => {
        if (problem1.includes(kw) && problem2.includes(kw)) {
          signals.push({
            type: 'similar_problem',
            members: [m1, m2],
            problem_keyword: kw,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  }

  return signals;
}

/**
 * Generate synthesis report
 */
function generateSynthesisReport(notes) {
  const profiles = loadMemberProfiles();
  const { stacks, sharedTechs } = analyzeTechStacks(notes);
  const { bottlenecks, commonBottlenecks } = analyzeBottlenecks(notes);
  const crossSignals = findCrossSignals(notes, profiles);

  const report = {
    timestamp: new Date().toISOString(),
    total_interviews: notes.length,
    total_members: Object.keys(profiles).length,
    interviews_completed: notes.filter((n) => n.note_type === 'interview').length,
    
    analysis: {
      tech_adoption: stacks,
      shared_technologies: sharedTechs,
      bottleneck_summary: {
        by_member: bottlenecks,
        common_patterns: commonBottlenecks,
      },
      cross_member_signals: crossSignals,
    },

    insights: {
      highest_friction_areas: commonBottlenecks
        .sort((a, b) => b.members_affected - a.members_affected)
        .slice(0, 5),
      
      potential_collaborations: crossSignals
        .filter((s) => s.type === 'shared_technology' || s.type === 'similar_problem')
        .slice(0, 10),
    },

    recommendations: {
      follow_ups: notes
        .filter((n) => n.action_items && n.action_items.length > 0)
        .map((n) => ({
          member: n.source.member,
          pending_items: n.action_items.filter((a) => a.status === 'pending'),
        }))
        .filter((item) => item.pending_items.length > 0),

      alerts_to_send: crossSignals
        .filter((s) => {
          // Flag if both members hit similar bottlenecks
          const m1_bottlenecks = bottlenecks[s.members[0]] || [];
          const m2_bottlenecks = bottlenecks[s.members[1]] || [];
          return m1_bottlenecks.some((b1) =>
            m2_bottlenecks.some((b2) => b1.area === b2.area)
          );
        })
        .map((signal) => ({
          type: 'cross_member_friction',
          members: signal.members,
          message: `Both ${signal.members[0]} and ${signal.members[1]} are hitting friction on: ${signal.problem_keyword}`,
        })),
    },
  };

  return report;
}

/**
 * Log synthesis event
 */
function logSynthesis(report) {
  const entry = {
    timestamp: report.timestamp,
    interviews_completed: report.interviews_completed,
    total_members: report.total_members,
    cross_signals_found: report.analysis.cross_member_signals.length,
    common_bottlenecks: report.analysis.bottleneck_summary.common_patterns.length,
  };

  fs.appendFileSync(SYNTHESIS_LOG, JSON.stringify(entry) + '\n');
  console.log('[SYNTHESIS] Report logged');
}

/**
 * Main synthesis run
 */
function runSynthesis() {
  console.log('[SYNTHESIS] Loading research notes...');
  const notes = loadResearchNotes();

  if (notes.length === 0) {
    console.log('[SYNTHESIS] No research notes found yet. Run interviews first.');
    return null;
  }

  console.log(`[SYNTHESIS] Found ${notes.length} research notes. Analyzing...`);
  const report = generateSynthesisReport(notes);

  console.log('[SYNTHESIS] ==== SYNTHESIS REPORT ====');
  console.log(`Interviews completed: ${report.interviews_completed}/${report.total_members}`);
  console.log(`Cross-member signals: ${report.analysis.cross_member_signals.length}`);
  console.log(`Common bottlenecks: ${report.insights.highest_friction_areas.length}`);
  console.log(`Potential collaborations: ${report.insights.potential_collaborations.length}`);

  if (report.insights.highest_friction_areas.length > 0) {
    console.log('\nTop friction areas:');
    report.insights.highest_friction_areas.forEach((item) => {
      console.log(`  • ${item.area} (${item.members_affected} members)`);
    });
  }

  if (report.recommendations.alerts_to_send.length > 0) {
    console.log('\nAlerts to send:');
    report.recommendations.alerts_to_send.forEach((alert) => {
      console.log(`  • ${alert.members.join(' ↔ ')}: ${alert.message}`);
    });
  }

  logSynthesis(report);
  return report;
}

module.exports = { runSynthesis, generateSynthesisReport, loadResearchNotes };

if (require.main === module) {
  runSynthesis();
}
