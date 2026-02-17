# Memory Consolidation Cron - Technical Spec

## Overview
Automated weekly job to consolidate daily memory logs into long-term curated memory (MEMORY.md).

## Trigger
**Schedule**: Every Monday, 8:00 AM AEDT (Sunday 11:00 PM GMT+8)  
**Cron expression**: `0 23 * * 0` (Sunday 11 PM server time = Monday 8 AM Melbourne)

## Payload
```json
{
  "kind": "agentTurn",
  "message": "Weekly memory consolidation:\n\n1. Read daily logs from past 7 days (memory/YYYY-MM-DD.md)\n2. Extract: key decisions, lessons learned, significant events, relationship insights\n3. Update MEMORY.md (append new learnings, remove outdated entries)\n4. Update PROJECT-STATE.md if needed (mark completed items, prune stale workstreams)\n5. Commit changes to GitHub\n6. Summary: bullet list of what was consolidated",
  "timeoutSeconds": 300
}
```

## Session Target
`isolated` — runs in background, delivers summary via announcement

## Delivery
```json
{
  "mode": "announce",
  "bestEffort": true
}
```

## Job Schema
```json
{
  "name": "Weekly Memory Consolidation",
  "schedule": {
    "kind": "cron",
    "expr": "0 23 * * 0",
    "tz": "Asia/Kuala_Lumpur"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Weekly memory consolidation:\n\n1. Read daily logs from past 7 days (memory/YYYY-MM-DD.md)\n2. Extract: key decisions, lessons learned, significant events, relationship insights\n3. Update MEMORY.md (append new learnings, remove outdated entries)\n4. Update PROJECT-STATE.md if needed (mark completed items, prune stale workstreams)\n5. Commit changes to GitHub\n6. Summary: bullet list of what was consolidated",
    "timeoutSeconds": 300
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "announce",
    "bestEffort": true
  },
  "enabled": true
}
```

## Consolidation Rules

### What Goes Into MEMORY.md
- ✅ Key decisions (model switches, infrastructure choices, policy changes)
- ✅ Lessons learned (what worked, what failed, why)
- ✅ Relationship insights (preferences, communication patterns, family context)
- ✅ Project milestones (deliverable completions, major achievements)
- ✅ Infrastructure state changes (new services, credentials, endpoints)

### What Stays in Daily Logs
- ❌ Routine operations (email checks, heartbeats)
- ❌ Transactional details (commit messages, API calls)
- ❌ Temporary state (pending approvals, in-flight tasks)
- ❌ Verbose logs (full outputs, debug traces)

### What Gets Pruned from MEMORY.md
- Outdated infrastructure details (replaced services, old credentials)
- Completed one-off tasks (no longer relevant)
- Superseded decisions (new policy replaces old)

## Success Criteria
- MEMORY.md stays under 3k tokens
- New learnings from past week incorporated
- Stale entries removed
- PROJECT-STATE.md reflects current reality
- GitHub commit pushed with changes
- Announcement delivered to GC with summary

## Error Handling
- If consolidation fails: log error, retry next week
- If GitHub push fails: save changes locally, flag for manual review
- If timeout: truncate summary, deliver partial results

## Monitoring
Log each consolidation run to `memory/consolidation-log.jsonl`:
```json
{
  "timestamp": "2026-02-24T08:00:00+11:00",
  "weekStart": "2026-02-17",
  "weekEnd": "2026-02-23",
  "filesProcessed": 7,
  "memoryUpdates": 5,
  "projectStateUpdates": 2,
  "githubCommit": "abc1234",
  "success": true
}
```
