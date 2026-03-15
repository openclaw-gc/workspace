#!/usr/bin/env node
/**
 * Pinkman Weekly Summary Generator
 * Creates group-facing summaries of research findings, signals, and momentum
 */

const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../../memory/pinkman-research');
const SYNTHESIS_LOG = path.join(__dirname, '../../memory/pinkman-synthesis.jsonl');

/**
 * Load recent research notes (past 7 days)
 */
function loadRecentNotes(daysBack = 7) {
  if (!fs.existsSync(RESEARCH_DIR)) {
    return [];
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const files = fs.readdirSync(RESEARCH_DIR).filter((f) => f.endsWith('.json'));
  return files
    .map((file) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RESEARCH_DIR, file), 'utf-8'));
        const noteDate = new Date(data.timestamp);
        return noteDate > cutoff ? data : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Generate weekly summary markdown
 */
function generateWeeklySummary(notes) {
  if (notes.length === 0) {
    return `*Pinkman Weekly* — No interviews this week yet. Interviews in progress.`;
  }

  // Extract key data
  const interviews = notes.filter((n) => n.note_type === 'interview');
  const findings = notes.filter((n) => n.note_type === 'finding' || n.note_type === 'alert');
  
  const interviewMembers = [...new Set(interviews.map((n) => n.source.member))];
  
  // Compile tech stack mentions
  const techMentions = {};
  interviews.forEach((note) => {
    (note.content.technical_stack || []).forEach((tech) => {
      techMentions[tech] = (techMentions[tech] || 0) + 1;
    });
  });
  
  const topTechs = Object.entries(techMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tech]) => tech);

  // Compile bottleneck areas
  const bottleneckAreas = {};
  interviews.forEach((note) => {
    (note.content.bottlenecks || []).forEach((bn) => {
      bottleneckAreas[bn.area] = (bottleneckAreas[bn.area] || 0) + 1;
    });
  });
  
  const topBottlenecks = Object.entries(bottleneckAreas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area, count]) => `${area} (${count} people)`);

  // Compile momentum watches
  const momentumWatches = [];
  interviews.forEach((note) => {
    (note.content.momentum_watch || []).forEach((item) => {
      momentumWatches.push(item);
    });
  });
  
  const uniqueMomentum = [...new Set(momentumWatches)].slice(0, 5);

  // Build markdown
  const summary = `*Pinkman Weekly — Week of ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}*

*Interviews This Week*
${interviewMembers.length > 0 ? interviewMembers.map((m) => `• ${m}`).join('\n') : '(None yet)'}

*Top Technologies Being Evaluated*
${topTechs.map((t) => `• ${t}`).join('\n') || '(No stack data yet)'}

*Friction Points (Across Team)*
${topBottlenecks.length > 0 ? topBottlenecks.map((b) => `• ${b}`).join('\n') : '(Gathering data)'}

*What's Moving the Needle*
${uniqueMomentum.length > 0 ? uniqueMomentum.map((m) => `• ${m}`).join('\n') : '(Tracking...)'}

*Signal Status*
${findings.length > 0 ? `${findings.length} findings logged this week` : 'Signal gathering in progress'}

*Next Steps*
Continuing interviews with team members. Flagging cross-member insights as they emerge.

—— Pinkman`;

  return summary;
}

/**
 * Get synthesis stats for the week
 */
function getSynthesisStats(daysBack = 7) {
  if (!fs.existsSync(SYNTHESIS_LOG)) {
    return null;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const lines = fs.readFileSync(SYNTHESIS_LOG, 'utf-8').split('\n').filter(Boolean);
  const recentEntries = lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate > cutoff;
    });

  if (recentEntries.length === 0) return null;

  // Aggregate stats
  const latestEntry = recentEntries[recentEntries.length - 1];

  return {
    total_synthesis_runs: recentEntries.length,
    latest: {
      interviews_completed: latestEntry.interviews_completed,
      total_members: latestEntry.total_members,
      cross_signals: latestEntry.cross_signals_found,
      bottlenecks: latestEntry.common_bottlenecks,
    },
  };
}

/**
 * Format summary for Telegram (code block + markdown support)
 */
function formatForTelegram(summary) {
  // Escape special characters but keep markdown
  return summary;
}

/**
 * Main: Generate and print weekly summary
 */
function main() {
  console.log('[WEEKLY] Generating weekly summary...');
  
  const notes = loadRecentNotes(7);
  const stats = getSynthesisStats(7);

  const summary = generateWeeklySummary(notes);

  console.log('\n========== WEEKLY SUMMARY ==========\n');
  console.log(summary);
  
  if (stats) {
    console.log(`\n(Synthesis: ${stats.latest.interviews_completed}/${stats.latest.total_members} interviews, ${stats.latest.cross_signals} cross-signals)`);
  }

  console.log('\n========== READY TO POST ==========\n');
  console.log('Copy the above and post to group, or use --post flag to auto-post.');
  
  return summary;
}

module.exports = { generateWeeklySummary, getSynthesisStats, formatForTelegram };

if (require.main === module) {
  main();
}
