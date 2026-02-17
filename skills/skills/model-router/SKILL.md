# Model Router Skill

**Dynamic model selection based on task complexity and budget constraints.**

## Overview

Automatically routes messages to the optimal model (Haiku/Sonnet/Opus) based on:
- Task complexity (simple/standard/complex)
- Context size
- Budget constraints
- User hints

**Status:** Shadow mode (logs decisions but doesn't enforce yet)

## Quick Start

### Check routing decision for a message

```bash
node /data/.openclaw/workspace/skills/model-router/router.js route "Design a treasury architecture" 50000
```

### View cost tracker status

```bash
node /data/.openclaw/workspace/skills/model-router/cost-tracker.js status
```

### View routing statistics

```bash
node /data/.openclaw/workspace/skills/model-router/router.js stats 7
```

## Configuration

Edit `config.json` to tune:
- **Tier mappings** — which models to use for each complexity tier
- **Budgets** — daily/monthly spending limits
- **Classification** — keywords and thresholds for tier detection
- **Mode** — `shadow` (log only) or `enforce` (actually switch models)

## Modes

- **shadow**: Log routing decisions but don't change model (testing/tuning)
- **enforce**: Actually switch models based on routing decisions

**Current mode:** `shadow` (change in config.json)

## Architecture

```
Message → Classifier → Router → Cost Tracker → Model
              ↓           ↓           ↓
         Tier (S/M/C)  Decision    Budget Check
```

### Files

- `classifier.js` — Task complexity detection
- `cost-tracker.js` — Token usage and cost accounting
- `router.js` — Main routing logic
- `config.json` — Configuration
- `.cost-data.json` — Cost tracking data (auto-generated)
- `.routing-log.jsonl` — Routing decision log (auto-generated)

## Tiers

| Tier | Model | Use Case |
|------|-------|----------|
| **Simple** | Haiku 4.5 | Quick facts, formatting, simple reads |
| **Standard** | Sonnet 4.5 | Normal chat, research, writing, code |
| **Complex** | Opus 4.6 | Architecture design, multi-step reasoning |

## Budget Enforcement

When daily budget reaches:
- **80%** (warning): Downgrade complex → standard
- **95%** (critical): Force all to simple tier

## Testing Classifier

```bash
# Test various messages
node classifier.js "what time is it" 0
node classifier.js "Design a multi-factor crypto intelligence engine" 0
node classifier.js "Quick question - can you read MEMORY.md?" 0
```

## Recording Usage

After a model execution:

```bash
node router.js record haiku 5000 2000 simple
```

(This would normally be called programmatically from OpenClaw integration)

## Integration Status

**Phase 1:** ✅ Core components built (shadow mode)
**Phase 2:** ⏳ OpenClaw integration (hook into message pipeline)
**Phase 3:** ⏳ Dashboard widgets
**Phase 4:** ⏳ ML-based classification (optional)

## Next Steps

1. **Test in shadow mode** — let it log decisions for 1 week
2. **Review routing-log.jsonl** — check tier accuracy
3. **Tune config.json** — adjust keywords/thresholds based on logs
4. **Enable enforce mode** — switch to live routing
5. **Build OpenClaw integration** — automatic message interception
6. **Dashboard** — visualize costs and routing decisions

## CLI Reference

### Router

```bash
node router.js route "<message>" <contextSize>    # Get routing decision
node router.js stats <days>                       # View routing stats
node router.js estimate <model>                   # Estimate cost
```

### Cost Tracker

```bash
node cost-tracker.js status    # Budget status
node cost-tracker.js today     # Today's summary
```

### Classifier

```bash
node classifier.js "<message>" <contextSize>    # Classify message
```

## Data Files

- `.cost-data.json` — Cost tracking database
- `.routing-log.jsonl` — Routing decision log (JSONL format)

Both files are git-ignored and persist locally.

## Safety

- User overrides always respected (`/opus`, `/quick`)
- Fallback models configured for each tier
- Budget enforcement only in `enforce` mode
- Shadow mode default (safe testing)

---

**Ready to test.** Run the commands above to verify it works, then let it shadow-log for a week before enforcing.
