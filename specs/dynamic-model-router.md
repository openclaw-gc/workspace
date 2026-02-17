# Dynamic Model Router - Technical Specification

## Executive Summary

Build an intelligent routing layer that automatically selects the optimal model for each task based on complexity, context size, and cost constraints. Reduce API spend by 60-80% while maintaining quality where it matters.

---

## Problem Statement

Current state:
- Single model (Sonnet 4.5) handles all tasks
- Simple tasks overpay for capability
- Complex tasks could benefit from Opus when needed
- No cost visibility or budget controls
- Manual model switching via `/model` is reactive, not proactive

Target state:
- Automatic task classification and model routing
- Cost-optimized by default, quality-optimized on demand
- Real-time cost tracking and budget enforcement
- Dashboard visibility into routing decisions

---

## Architecture

### 1. Task Classifier

**Purpose:** Analyze incoming messages and determine complexity tier.

**Inputs:**
- Message text
- Conversation history (last 3-5 messages)
- Current context size
- Time of day / urgency signals
- Explicit user hints (e.g., "quick question" vs "help me design")

**Outputs:**
- Complexity tier: `simple` | `standard` | `complex`
- Confidence score (0-1)
- Reasoning (for logging/debugging)

**Classification Logic:**

```javascript
// Tier: SIMPLE (Haiku 4.5 or Gemini Flash)
const SIMPLE_SIGNALS = [
  'what time', 'what date', 'quick question',
  'simple lookup', 'format this', 'fix typo',
  'read file', 'list files', 'show me',
  message.length < 100 && !hasCodeBlock,
  message.trim().endsWith('?') && message.split(' ').length < 10
];

// Tier: COMPLEX (Opus 4.6 or GPT-5.2)
const COMPLEX_SIGNALS = [
  'design', 'architect', 'strategy', 'framework',
  'multi-step', 'think through', 'comprehensive',
  'detailed analysis', 'research and write',
  message.length > 500,
  hasCodeBlock && message.includes('bug'),
  conversationDepth > 5 && contextSize > 50000,
  explicitModelRequest // user said "use opus"
];

// Default: STANDARD (Sonnet 4.5)
```

**Implementation:**
- Lightweight heuristic-based classifier (no LLM call overhead)
- Fast pattern matching + keyword scoring
- Falls back to STANDARD if unclear
- Overrideable by user intent signals

---

### 2. Model Tier Mapping

| Tier | Primary Model | Fallback | Use Cases |
|------|---------------|----------|-----------|
| **Simple** | Claude Haiku 4.5 | Gemini 2.5 Flash | Quick facts, formatting, simple reads, acknowledgments |
| **Standard** | Claude Sonnet 4.5 | GPT-4.1 | Normal chat, research, writing, code, most daily work |
| **Complex** | Claude Opus 4.6 | GPT-5.2 | Architecture design, multi-step reasoning, critical deliverables |

**Cost per 1M tokens (approx):**
- Simple: $0.80-4 (input+output)
- Standard: $3-15
- Complex: $15-75

---

### 3. Cost Tracking & Budget Enforcement

**Track:**
- Tokens used per model per day/week/month
- Estimated cost per interaction
- Running total against budget
- Cost by task type (simple/standard/complex)

**Storage:**
```json
// /data/.openclaw/workspace/.cost-tracker.json
{
  "2026-02-17": {
    "haiku": { "input": 50000, "output": 20000, "cost": 0.28 },
    "sonnet": { "input": 200000, "output": 80000, "cost": 1.80 },
    "opus": { "input": 0, "output": 0, "cost": 0 },
    "total": 2.08
  },
  "budgets": {
    "daily": 10.00,
    "monthly": 200.00
  },
  "alerts": {
    "dailyThreshold": 0.8,
    "monthlyThreshold": 0.9
  }
}
```

**Budget enforcement:**
- If daily budget at 80% → downgrade complex tasks to standard
- If daily budget at 95% → force all tasks to simple tier
- Alert GC when thresholds crossed
- Reset counters daily (00:00 UTC)

---

### 4. Implementation Approach

**Recommended: Option A — OpenClaw Message Interceptor**

Build a custom plugin/skill that hooks into OpenClaw's message pipeline:

```
[Telegram] → [OpenClaw] → [Router] → [Model] → [Response]
                            ↓
                    [Cost Tracker]
                    [Dashboard Logger]
```

**Flow:**
1. Message arrives from Telegram
2. Router intercepts before agent processes
3. Classifier analyzes message → tier decision
4. Router sets `session.model` dynamically
5. Cost tracker logs decision + estimated cost
6. Agent processes with selected model
7. Actual cost logged post-response

**Files:**
```
/data/.openclaw/workspace/skills/model-router/
├── SKILL.md
├── classifier.js          # Task classification logic
├── router.js              # Main routing logic
├── cost-tracker.js        # Token/cost accounting
├── config.json            # Tier mappings, budgets
└── scripts/
    ├── analyze-costs.sh   # CLI tool to view spending
    └── override-model.sh  # Force model for next message
```

**Integration:**
- Add to OpenClaw config as a message hook
- Minimal changes to core setup
- Can be disabled/bypassed easily for testing

---

### 5. Dashboard Integration

**Real-time Cost Widget:**
```
┌─ Model Usage (Today) ───────────────────────┐
│ Budget: $2.34 / $10.00 (23%)                │
│                                              │
│ Haiku:  █████░░░░░  45 msgs  $0.28         │
│ Sonnet: ███████████ 12 msgs  $1.80         │
│ Opus:   ░░░░░░░░░░   0 msgs  $0.00         │
│                                              │
│ Avg cost/msg: $0.19                         │
│ Estimated month: $146 ✓                     │
└──────────────────────────────────────────────┘
```

**Routing Log:**
```
Time     Tier      Model        Reason                    Cost
────────────────────────────────────────────────────────────
04:12    Simple    Haiku        "quick question"          $0.01
04:15    Standard  Sonnet       Default chat              $0.12
04:20    Complex   Opus         "design architecture"     $1.45
04:22    Standard  Sonnet       Context < 50k             $0.08
```

**Charts:**
- Cost trend (daily/weekly/monthly)
- Model distribution pie chart
- Tier accuracy (manual feedback loop)

---

### 6. Configuration & Tuning

**User-editable config** (`skills/model-router/config.json`):

```json
{
  "enabled": true,
  "mode": "auto",  // auto | manual | hybrid
  "tiers": {
    "simple": {
      "model": "anthropic/claude-haiku-4-5",
      "fallback": "google/gemini-2.5-flash",
      "maxContextSize": 20000
    },
    "standard": {
      "model": "anthropic/claude-sonnet-4-5",
      "fallback": "openai/gpt-4.1",
      "maxContextSize": 100000
    },
    "complex": {
      "model": "anthropic/claude-opus-4-6",
      "fallback": "openai/gpt-5.2",
      "maxContextSize": 200000
    }
  },
  "budgets": {
    "daily": 10.00,
    "monthly": 200.00,
    "alertThresholds": {
      "warning": 0.8,
      "critical": 0.95
    }
  },
  "classification": {
    "simpleKeywords": ["quick", "what time", "list", "show"],
    "complexKeywords": ["design", "architect", "strategy", "comprehensive"],
    "lengthThresholds": {
      "simple": 100,
      "complex": 500
    }
  },
  "overrides": {
    "timeOfDay": {
      "enabled": false,
      "nightMode": { "start": "23:00", "end": "08:00", "maxTier": "simple" }
    },
    "userHints": {
      "enabled": true,
      "patterns": {
        "/opus": "complex",
        "/quick": "simple"
      }
    }
  }
}
```

**Tuning workflow:**
1. Run in shadow mode (log decisions but don't enforce) for 1 week
2. Review dashboard → identify misclassifications
3. Adjust keyword weights and thresholds
4. Enable enforcement
5. Monitor for 1 week → iterate

---

### 7. Fallback & Safety

**Fallback scenarios:**
- If primary model fails (rate limit, API error) → use fallback model from tier
- If fallback fails → escalate to next tier up
- If all models fail → queue message and alert GC

**Safety overrides:**
- `/model opus` — force Opus for next message (bypass router)
- `/router off` — disable router temporarily
- `/router status` — show current tier + cost summary
- Emergency kill switch in config

**Logging:**
- All routing decisions logged to `memory/routing-log-YYYY-MM-DD.jsonl`
- Includes: timestamp, message preview, tier, model, cost estimate, actual cost
- Retention: 30 days

---

### 8. Rollout Plan

**Phase 1: Foundation (Week 1)**
- Build classifier logic (heuristic-based)
- Build cost tracker
- Build router core
- Shadow mode: log decisions, don't enforce
- Manual review of 100+ classifications

**Phase 2: Enforcement (Week 2)**
- Enable routing in live mode
- Set conservative budgets ($15/day)
- Monitor closely, tune thresholds
- Dashboard integration (basic widget)

**Phase 3: Intelligence (Week 3+)**
- Add conversation-aware classification (use last N messages)
- Add user preference learning (track manual overrides)
- Add predictive budgeting (forecast month-end spend)
- Full dashboard integration (charts, logs, analytics)

**Phase 4: Optimization (Ongoing)**
- A/B test different tier mappings
- Train lightweight ML classifier (optional, if heuristics plateau)
- Add model performance tracking (quality scores per tier)
- Integrate with broader system observability

---

## Success Metrics

**Cost efficiency:**
- Baseline (all Sonnet): ~$5-10/day
- Target (with router): ~$2-4/day (60-80% reduction)

**Quality maintenance:**
- User satisfaction: no perceived quality drop
- Manual override rate: <5% (if higher, classifier needs tuning)
- Tier escalation rate: track how often simple → standard → complex

**Operational:**
- Router latency: <50ms (classification + routing)
- Uptime: 99.9%
- False positive rate (wrong tier): <10%

---

## Open Questions

1. **Should sub-agents (sessions_spawn) also route dynamically?**
   - Probably yes — spawn on Haiku by default unless task explicitly complex

2. **Should we cache classification results for similar messages?**
   - Could reduce overhead, but risks stale routing

3. **Should we integrate with OpenClaw's native thinking/reasoning toggle?**
   - E.g., complex tier → enable extended thinking

4. **Should we track quality feedback?**
   - Post-response prompt: "Was this answer good? [👍👎]"
   - Use to tune classifier over time

---

## Dependencies

- OpenClaw 2026.2.12+ (current version OK)
- Node.js for router logic
- Dashboard platform (Next.js preferred)
- Cost data access (via OpenClaw session logs + API response headers)

---

## Next Steps

1. **GC approval** on architecture
2. **Create skill scaffold** (`skills/model-router/`)
3. **Build classifier** (heuristic v1)
4. **Build cost tracker** (JSON-based)
5. **Shadow mode testing** (1 week)
6. **Dashboard widget** (basic)
7. **Live rollout** (phased)

---

**Estimated effort:** 2-3 weeks for MVP, ongoing tuning

**ROI:** $150-300/month saved after initial build cost
