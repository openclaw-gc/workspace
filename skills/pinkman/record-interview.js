#!/usr/bin/env node
/**
 * Record Interview Notes
 * Saves structured research notes from interviews
 * Usage: node record-interview.js --member kailash --project "AI Agents" --problem "routing at scale"
 */

const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../../memory/pinkman-research');

// Ensure directory exists
if (!fs.existsSync(RESEARCH_DIR)) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i].replace(/^--/, '');
    const value = process.argv[i + 1];
    args[key] = value;
  }
  return args;
}

/**
 * Interactive interview recording
 */
async function recordInterview(member) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

  console.log(`\n=== Recording Interview: ${member} ===\n`);
  console.log('Follow the template. Press Enter to skip optional fields.');
  console.log('For arrays (tech stack, bottlenecks), enter comma-separated values.\n');

  const note = {
    id: `interview_${new Date().toISOString().slice(0, 10)}_${member}`,
    timestamp: new Date().toISOString(),
    note_type: 'interview',
    source: {
      member,
      channel: 'interview',
      interview_duration_min: parseInt(await question('Duration (minutes): ')) || 30,
    },
    content: {
      project_name: await question('Project name: '),
      problem_statement: await question('Problem statement: '),
      technical_stack: (await question('Tech stack (comma-separated): '))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bottlenecks: [],
      momentum_watch: (await question('Momentum watch (comma-separated): '))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      open_questions: (await question('Open questions (comma-separated): '))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      links: [],
      raw_transcript: await question('Notes/transcript: '),
    },
    synthesis: {
      primary_focus_oneliner: await question('One-liner summary: '),
      connections: [],
      broader_implications: await question('What does this tell us about the space?: '),
    },
    action_items: [],
    tags: (await question('Tags (comma-separated): '))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };

  // Record bottlenecks
  console.log('\n--- Bottlenecks (enter blank line to finish) ---');
  let bottleneckCount = 1;
  while (true) {
    const area = await question(`Bottleneck #${bottleneckCount} area (dev speed, scaling, etc.): `);
    if (!area) break;
    const desc = await question(`  Description: `);
    const priority = await question(`  Priority (critical/high/medium/low): `) || 'medium';
    note.content.bottlenecks.push({ area, description: desc, priority });
    bottleneckCount++;
  }

  // Record links
  console.log('\n--- Links (enter blank line to finish) ---');
  let linkCount = 1;
  while (true) {
    const url = await question(`Link #${linkCount} URL: `);
    if (!url) break;
    const description = await question(`  Description: `);
    const relevance = await question(`  Relevance to their work: `);
    note.content.links.push({ url, description, relevance });
    linkCount++;
  }

  rl.close();

  // Save note
  const filename = path.join(RESEARCH_DIR, `${note.id}.json`);
  fs.writeFileSync(filename, JSON.stringify(note, null, 2));

  console.log(`\n✅ Interview saved: ${filename}`);
  console.log(`\nNext: Run synthesis-engine.js to analyze across interviews.`);
}

/**
 * Validate required fields
 */
function validateNote(note) {
  const required = ['project_name', 'problem_statement'];
  const missing = required.filter((field) => !note.content[field]);

  if (missing.length > 0) {
    console.error(`❌ Missing required fields: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Main
 */
async function main() {
  const args = parseArgs();

  if (!args.member) {
    console.error('Usage: node record-interview.js --member <name> [other options]');
    process.exit(1);
  }

  await recordInterview(args.member);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
