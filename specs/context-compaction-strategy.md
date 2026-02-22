# Context Compaction Strategy

## Problem

Current context size: **178k tokens** for simple heartbeat operations  
Target for simple ops: **<20k tokens**  
**Problem:** Burning 8-9x more tokens than necessary

## Root Causes

1. **Auto-injected files:** AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md, MEMORY.md, PROJECT-STATE.md
2. **Full conversation history:** Every message in session stays in context
3. **No message-type segmentation:** Heartbeats get same context as complex work

## Current Context Breakdown (estimated)

- Auto-injected files: ~40k tokens
- Conversation history (50+ messages): ~80k tokens
- System prompts + skills: ~30k tokens
- Agent context: ~28k tokens
- **Total: ~178k tokens**

## Compaction Strategy

### Phase 1: Heartbeat Isolation (IMMEDIATE)

**Change heartbeats from `systemEvent` → `agentTurn` with isolated session:**

```json
{
  "schedule": { "kind": "every", "everyMs": 1800000 },
  "sessionTarget": "isolated",  // NEW - separate session
  "payload": {
    "kind": "agentTurn",  // NEW - isolated run
    "message": "Read HEARTBEAT.md. Check only what's listed. Reply HEARTBEAT_OK if nothing needs attention.",
    "timeoutSeconds": 60
  },
  "delivery": { "mode": "announce" }
}
```

**Impact:**
- Fresh session each heartbeat: no history accumulation
- Only HEARTBEAT.md loaded: ~500 tokens vs 40k
- **Estimated reduction: 178k → 15-20k (89% savings)**

### Phase 2: Context Pruning (24 HOURS)

**Enable aggressive context pruning for main session:**

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "contextPruning": {
          "mode": "aggressive",
          "maxMessages": 20,    // Keep only 20 most recent
          "compactAfter": 10    // Compact after 10 exchanges
        }
      }
    ]
  }
}
```

**Impact:**
- Conversation history: 80k → 20k
- Total context: 178k → 118k (34% reduction)

### Phase 3: Selective Memory Loading (48 HOURS)

**Make memory files opt-in rather than auto-inject:**

Move heavy files to on-demand loading:
- MEMORY.md (15k tokens): Only load when memory_search used
- PROJECT-STATE.md (10k tokens): Only load when project work happens
- Daily logs: Never auto-inject, always on-demand

**Implementation:**
- Remove from auto-inject list in workspace setup
- Document in AGENTS.md: "Read MEMORY.md at session start if in main session"
- Update skills to explicitly read when needed

**Impact:**
- Auto-inject: 40k → 15k (USER.md, SOUL.md, IDENTITY.md, TOOLS.md only)
- Total context: 118k → 93k (21% reduction from Phase 2)

### Phase 4: History Compaction (1 WEEK)

**Implement smart message summarization:**

After N messages (configurable), compress history:
- Simple exchanges (Q&A, status checks): Drop entirely
- Complex work: Keep structured summary
- Critical decisions: Keep verbatim

**Example compaction:**
```
BEFORE (12 messages, 15k tokens):
User: "How's the weather?"
Gale: "Checking... It's sunny, 24°C."
User: "Thanks."
Gale: "You're welcome."
[... 8 more simple exchanges ...]

AFTER (1 summary, 200 tokens):
[Compacted: Simple Q&A exchanges (weather check, quick status updates) - no critical context]
```

**Impact:**
- History: 20k → 5k (75% reduction from Phase 2)
- Total context: 93k → 78k (16% reduction from Phase 3)

## Timeline

| Phase | Action | Timeline | Context Reduction | Implementation |
|-------|--------|----------|-------------------|----------------|
| 1 | Heartbeat isolation | Immediate | 178k → 20k (89%) | Change cron config |
| 2 | Context pruning | 24h | 178k → 118k (34%) | Update agent config |
| 3 | Selective memory | 48h | 118k → 93k (21%) | Remove auto-inject |
| 4 | History compaction | 1 week | 93k → 78k (16%) | Build compaction logic |

**Total reduction: 178k → 78k (56% reduction in 1 week)**

## Cost Impact

**Current (Haiku, 178k context):**
- Heartbeats: 48/day × 178k = 8.5M tokens
- Daily cost: $6.40
- Monthly: $192

**After Phase 1 (Haiku, 20k context):**
- Heartbeats: 48/day × 20k = 960k tokens
- Daily cost: $0.72
- Monthly: $21.60
- **Savings: 89% ($170/month)**

**After all phases (Haiku, 78k context for main session, 20k for heartbeats):**
- Heartbeats: $0.72/day (unchanged from Phase 1)
- Main session: ~50% reduction in per-message cost
- **Total estimated monthly: $60-80** (vs $192 current, 58-69% savings)

## Monitoring

Track these metrics weekly:
1. Average context size per message type (heartbeat, manual, cron)
2. Daily token consumption
3. Cost per message type
4. Context growth rate over time

**Alert thresholds:**
- Heartbeat context >25k: Investigate memory leak
- Main session context >120k: Force compaction
- Daily cost >$10: Review and optimize

## Implementation Priority

**DO NOW:**
1. ✅ Switch to Haiku default (DONE - config patched)
2. ✅ Disable Gmail monitoring (DONE - cron disabled)
3. ⏳ Implement Phase 1 (heartbeat isolation) - 15 min work

**DO TODAY:**
4. Phase 2 (context pruning) - update agent config
5. Test heartbeat isolation - verify <25k context
6. Monitor cost impact for 24h

**DO THIS WEEK:**
7. Phase 3 (selective memory) - update workspace files
8. Phase 4 design (history compaction logic)
9. Build budget circuit breakers

## Success Criteria

- ✅ Heartbeat context: <25k tokens (from 178k)
- ✅ Main session context: <120k tokens (from 178k)
- ✅ Daily cost: <$10 (from $76.50)
- ✅ Monthly cost: <$150 budget
- ✅ No functionality loss (all features work)

## Notes

- This is architectural debt from initial build - quick iteration → context bloat
- Fix is straightforward but requires systematic execution
- Cost savings compound: cheaper model + smaller context = 95%+ reduction
- Monitor for 1 week, then review and tune
