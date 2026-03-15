# Pinkman Research Infrastructure

**Purpose:** Interview-driven research across the AI Huntoooors group. Understand what each member is building, identify cross-team signals, and flag emerging patterns.

---

## Architecture

```
Interview → Research Note → Synthesis → Weekly Summary → Group Notification
```

### Components

1. **Interview Template** (`interview-template.md`)
   - Conversational framework (30 min)
   - Structured but not rigid
   - Covers: project, problems, tech stack, bottlenecks, momentum watch

2. **Record Interview** (`record-interview.js`)
   - Interactive CLI for capturing interview notes
   - Saves structured JSON in `memory/pinkman-research/`
   - Exactly-once recording (idempotent)

3. **Member Profiles** (`member-profiles.json`)
   - Team context (name, focus areas, current work)
   - Interview status tracking
   - Connection mapping

4. **Research Schema** (`research-schema.json`)
   - JSON schema for all note types
   - Ensures consistency across interviews
   - Types: interview, finding, alert, synthesis

5. **Synthesis Engine** (`synthesis-engine.js`)
   - Analyzes all research notes
   - Finds cross-member patterns
   - Identifies shared tech, similar problems, bottlenecks
   - Generates alerts for signal-passing

6. **Weekly Summary** (`weekly-summary.js`)
   - Group-facing markdown summary
   - Tech adoption trends
   - Top friction areas
   - Momentum signals

7. **Listener Integration**
   - Pinkman listens for group mentions
   - Routes interview requests
   - Publishes weekly summaries

---

## Workflow

### Step 1: Conduct Interview

**In Person or via DM:** Use `interview-template.md` as your guide.

Key areas:
- What are you building? (5 min)
- What problems are you solving? (5 min)
- What's the technical edge case? (5 min)
- What are you watching in the space? (5 min)
- What tools would unlock 10x? (5 min)

**Record notes yourself** or ask them to share links/findings.

### Step 2: Save Interview Notes

```bash
node skills/pinkman/record-interview.js --member kailash
```

Interactive CLI will walk you through:
- Project name
- Problem statement
- Technical stack (comma-separated)
- Bottlenecks (one per line)
- Momentum watch (what they're tracking)
- Links (repos, docs, tools)
- One-liner summary
- Tags

Notes auto-save to: `memory/pinkman-research/interview_YYYYMMDD_<member>.json`

### Step 3: Analyze & Synthesize

```bash
node skills/pinkman/synthesis-engine.js
```

Outputs:
- **Tech adoption trends** (which tools people are using)
- **Shared technologies** (where teams overlap)
- **Common bottlenecks** (friction points affecting 2+ people)
- **Cross-member signals** (collaboration opportunities)
- **Alerts to send** (critical overlap to flag)

Log saved to: `memory/pinkman-synthesis.jsonl`

### Step 4: Generate Weekly Summary

```bash
node skills/pinkman/weekly-summary.js
```

Produces markdown for posting to group:
- Interviews completed this week
- Top technologies
- Friction points
- Momentum watch
- Cross-team signals

### Step 5: Post to Group

Either:
1. **Manual:** Copy markdown and paste into AI Huntoooors
2. **Automated:** Add to Pinkman listener cron (weekly trigger)

---

## Research Data Structure

All notes stored in: `memory/pinkman-research/`

Format: `interview_YYYYMMDD_<member>.json`

Example:

```json
{
  "id": "interview_2026-03-06_kailash",
  "timestamp": "2026-03-06T04:40:00Z",
  "note_type": "interview",
  "source": {
    "member": "kailash",
    "channel": "interview",
    "interview_duration_min": 30
  },
  "content": {
    "project_name": "Agentic Routing Framework",
    "problem_statement": "Scale agent inference requests across multiple models without latency bleed",
    "technical_stack": ["Node.js", "Redis", "Claude API", "Next.js"],
    "bottlenecks": [
      {
        "area": "dev speed",
        "description": "Debugging concurrent request state is painful",
        "priority": "high"
      }
    ],
    "momentum_watch": ["Anthropic routing docs", "vLLM", "LM Studio"],
    "open_questions": [
      "How to batch inference across multiple models?",
      "Best practices for routing fallbacks?"
    ],
    "raw_transcript": "Kailash talked about..."
  },
  "synthesis": {
    "primary_focus_oneliner": "Building intelligent request router for multi-model inference",
    "connections": [
      {
        "member": "giancarlocudrig",
        "relevance": "Both using Claude API at scale, routing constraints similar",
        "signal_to_flag": true
      }
    ],
    "broader_implications": "Routing efficiency is becoming a core infrastructure problem"
  },
  "tags": ["infrastructure", "AI", "agents", "scaling"]
}
```

---

## Cross-Member Signals

Synthesis engine identifies:

### Shared Technologies
- Both X and Y are using Redis → potential collaboration
- Both using Claude API at scale → shared constraints

### Similar Problems
- Multiple people hitting "scaling agent inference" bottleneck
- Multiple people using similar tech stacks

### Collaboration Opportunities
- Person A built tool that solves Person B's bottleneck
- Person A's tech stack would help Person B scale

### Alerts
- Flag when 2+ people hit same friction point
- "Hey, both Kailash and GC are struggling with concurrent request debugging"

---

## Running on Schedule

### Weekly Summary (Automated)

Add to cron or scheduler:

```bash
# Every Monday at 9 AM Melbourne time
node skills/pinkman/weekly-summary.js | post-to-telegram
```

### Synthesis (On-demand)

Run after each new interview:

```bash
node skills/pinkman/synthesis-engine.js
```

Or set up cron for daily synthesis:

```bash
# Every day at 8 AM Melbourne time
node skills/pinkman/synthesis-engine.js
```

---

## Cost Tracking

Pinkman logs research operations to: `memory/pinkman-costs.jsonl`

Format:
```json
{
  "timestamp": "2026-03-06T04:40:00Z",
  "event_type": "interview-synthesis",
  "model": "haiku",
  "tokens": 2500,
  "cost_usd": 0.15
}
```

Track weekly cost roll-ups and stay under $20/month hard cap.

---

## Member Interview Status

Tracked in: `member-profiles.json`

Update as you go:
- `interview_status`: pending → in-progress → done
- `last_interview`: date
- `next_interview`: scheduled date

```json
{
  "members": {
    "giancarlocudrig": {
      "interview_status": "done",
      "last_interview": "2026-03-05T20:00:00Z",
      "next_interview": "2026-03-12T20:00:00Z"
    }
  }
}
```

---

## Tips

### Interview Tips
- **Don't read questions verbatim.** Conversational, not interrogation.
- **Let them define scope.** Don't assume their focus areas.
- **Dig on technical edges.** That's where the real signal is.
- **Get links.** Repos, docs, tweets, tools they're using.
- **One-liner first.** Get them to distill it before diving deep.

### Synthesis Tips
- **Run after every interview.** Incremental synthesis, not batch.
- **Look for patterns early.** Cross-signals are most valuable with 3+ interviews.
- **Flag overlaps immediately.** Don't wait for weekly summary to notify.
- **Re-interview.** Follow up on open questions or after they ship.

### Group Communication Tips
- **Weekly summaries are high-level.** Tech trends, friction points, momentum.
- **Alerts are urgent.** Only send if 2+ people affected or major signal.
- **Don't oversell.** Let the data speak.
- **Attribute findings.** "Kailash + GC both struggling with X"

---

## Success Metrics

1. **Interview Coverage:** 5/5 members interviewed within first 2 weeks
2. **Cross-Signal Quality:** 3+ actionable collaborations flagged per month
3. **Friction Visibility:** Common bottlenecks identified and surfaced
4. **Group Engagement:** Members respond to flagged signals / collaborations
5. **Cost Control:** Stay under $20/month (Haiku baseline + synthesis runs)

---

## Next Steps

1. **Conduct first interview** (Giancarlo?) — test workflow
2. **Record and save notes**
3. **Run synthesis** (even with 1 interview)
4. **Generate weekly summary** and post
5. **Schedule regular interviews** (weekly or bi-weekly cadence)
6. **Update member profiles** as you learn more

---

## Files Reference

| File | Purpose |
|------|---------|
| `interview-template.md` | Conversation guide (use this when interviewing) |
| `record-interview.js` | CLI to save structured notes |
| `member-profiles.json` | Team context + interview tracking |
| `research-schema.json` | JSON schema for all note types |
| `synthesis-engine.js` | Analyze interviews, find patterns |
| `weekly-summary.js` | Generate group-facing summary |
| `listener.js` | Bot that listens to group, posts summaries |
| `memory/pinkman-research/` | Interview notes (JSON) |
| `memory/pinkman-synthesis.jsonl` | Synthesis run logs |
| `memory/pinkman-costs.jsonl` | Cost tracking |

---

## Support

All infrastructure is in place. Start with Step 1: Schedule first interview (recommend GC first, then rotate through Kailash, Harrison, Nigel, Soro).

Ready to hunt signal. 🔍
