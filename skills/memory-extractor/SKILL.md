# Memory Extractor Skill

**Purpose:** Automatically scan recent session history for completions, deployments, and significant events that should be recorded in memory files.

## Problem It Solves

Memory retention failure: if completions aren't manually written to memory files, they're lost. This skill automates the extraction of completion signals from session history.

## Usage

### Manual Run (Review Mode)

```bash
cd /data/.openclaw/workspace/skills/memory-extractor
./run.sh
```

This will:
1. Fetch last 50 messages from current session
2. Scan for completion indicators
3. Output formatted memory snippets for review
4. Does NOT auto-commit (you review and manually add to MEMORY.md)

### What It Looks For

**Completion patterns:**
- Words: deployed, live, completed, shipped, done, finished, built, created, setup, configured
- Symbols: ✅
- Phrases: "is now", "now available", "successfully"

**Categories:**
- Infrastructure: URLs, credentials, ports, access details
- Decisions: policy changes, approvals, strategy shifts
- General: other completions

### Output Format

```
=== MEMORY SNIPPETS FOR REVIEW ===

## Infrastructure Updates:
- Dashboard deployed at http://100.111.100.15:3000 with password authentication
- Tailscale VPN configured: VPS 100.111.100.15, Mac 100.116.126.102

## Decisions Made:
- Model switched from Opus 4.6 to Sonnet 4.5 for 80% cost reduction
- Heartbeat disabled at GC's request

## General Completions:
- Gmail monitoring cron job created, runs every 10 minutes
- Two thematic reports delivered: Nuclear and Coal

=== END SNIPPETS ===
```

## Integration Options

### Option 1: Manual Daily Review
Run `./run.sh` at end of day, review output, manually update MEMORY.md

### Option 2: Automated Nightly Cron
Schedule a cron job to run extraction and send results for review:

```javascript
{
  "name": "Daily memory extraction",
  "schedule": {"kind": "cron", "expr": "0 23 * * *", "tz": "Australia/Melbourne"},
  "payload": {
    "kind": "agentTurn",
    "message": "Run /data/.openclaw/workspace/skills/memory-extractor/run.sh and review the output. Send me a summary of what should be added to MEMORY.md"
  },
  "sessionTarget": "isolated"
}
```

### Option 3: Heartbeat Integration
Add to HEARTBEAT.md for periodic checks (every few heartbeats, not every one)

## Future Enhancements

- Auto-detect URLs, credentials, cron job IDs
- Semantic similarity to avoid duplicates in MEMORY.md
- Direct MEMORY.md append with approval flow
- Integration with PROJECT-STATE.md for workstream updates

## Files

- `extract.js` - Core extraction logic
- `run.sh` - Wrapper script that calls sessions_history
- `SKILL.md` - This file

## Dependencies

- OpenClaw sessions_history tool
- Node.js (for extract.js)
