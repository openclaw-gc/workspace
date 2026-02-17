# Model Cost Optimization Strategy

## Current Setup

- **Main agent**: Claude Opus 4.6 (hardcoded in agent config)
- **Default model**: ChatGPT 5.2 (in `agents.defaults.model.primary` — but overridden by agent-level setting)
- **Context window**: 200k tokens
- **Compaction**: safeguard mode (compacts when context gets large)
- **Context pruning**: cache-ttl, 1h
- **Heartbeat**: disabled (good — zero idle burn)

## Approximate Pricing (per 1M tokens)

| Model | Input | Output | Relative Cost |
|-------|-------|--------|---------------|
| Claude Opus 4.6 | $15 | $75 | 🔴 **Very expensive** |
| Claude Sonnet 4.5 | $3 | $15 | 🟡 Mid-tier |
| Claude Haiku 4.5 | $0.80 | $4 | 🟢 Cheap |
| GPT-5.2 | ~$10 | ~$40 | 🔴 Expensive |
| GPT-5 Mini | ~$1.50 | ~$6 | 🟢 Cheap |
| GPT-4.1 | $2 | $8 | 🟢 Cheap |
| Gemini 2.5 Flash | $0.15 | $0.60 | 🟢 **Very cheap** |
| Gemini 2.5 Flash Lite | $0.075 | $0.30 | 🟢 **Cheapest** |

**Key insight**: Opus 4.6 output tokens cost ~125x more than Gemini Flash Lite. Most of our daily interactions don't need Opus-tier reasoning.

## Proposed Tiered Strategy

### Tier 1 — Daily Driver (switch main agent to this)
**Claude Sonnet 4.5**
- 80% of Opus quality for 80% less cost
- Strong at structured reasoning, writing, code
- Handles everything we do day-to-day: chat, research, deliverables, memory management
- **Recommendation: Make this the main agent model**

### Tier 2 — Quick Tasks & Sub-agents
**Gemini 2.5 Flash** or **Claude Haiku 4.5**
- Transcription follow-ups, simple lookups, formatting tasks
- Use for `sessions_spawn` sub-agents where possible
- ~95% cheaper than Opus

### Tier 3 — Heavy Lifting (on-demand only)
**Claude Opus 4.6** or **GPT-5.2**
- Complex multi-step reasoning, novel architecture design, critical deliverables
- Use via `/model` command to temporarily switch when needed
- Switch back after the task

## Concrete Config Change

Switch main agent from Opus 4.6 → Sonnet 4.5:

```json
"agents": {
  "list": [
    {
      "id": "main",
      "name": "main", 
      "model": "anthropic/claude-sonnet-4-5"
    }
  ]
}
```

Then use `/model Claude Opus 4.6` when you need the big gun for a specific task.

## Estimated Savings

Assuming ~500k tokens/day (input+output combined):
- **Opus 4.6**: ~$15-25/day → $450-750/month
- **Sonnet 4.5**: ~$3-5/day → $90-150/month
- **With tiered routing**: ~$2-4/day → $60-120/month

**~80% cost reduction** with minimal quality loss on daily operations.

## Additional Optimizations Already in Place
- ✅ Heartbeat disabled (no idle token burn)
- ✅ Context pruning with 1h TTL
- ✅ Compaction in safeguard mode
- ⚠️ `streamMode: "partial"` on Telegram — good for UX, no cost impact

## Additional Optimizations to Consider
- Enable **reasoning/thinking only when needed** (currently off — good)
- Keep deliverable-heavy work in **sub-agent sessions** (isolated context, smaller windows)
- Aggressive compaction summaries to keep main session context lean
