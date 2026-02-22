# Model Router Fix - February 19, 2026

## The Problem

**Router was logging but never switching models.**

- Overnight damage: ~$80 in charges
- Root cause: Router analyzed messages, logged decisions, but never called `session_status(model=...)` to actually switch
- Gmail monitoring + heartbeats: All ran on expensive Sonnet instead of cheap Haiku
- 48 checks × 178k context × $3-15/M tokens = $76.50

## Immediate Fix (APPLIED)

**Config patch:** Changed default model from Sonnet → Haiku
```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "model": "anthropic/claude-haiku-4-5"  // was: claude-sonnet-4-5
      }
    ]
  }
}
```

**Result:** Gateway restarted with Haiku as default (12x cheaper than Sonnet)

## Permanent Fix (Architecture)

The router CAN'T automatically switch models because:
1. It's a Node.js script, not part of OpenClaw's core
2. `session_status()` is an agent tool, not a system command
3. OpenClaw doesn't have native pre-message hooks for model selection

### Solution: Behavioral Integration

**For complex operations (manual messages):**
- I (Gale) check router decision at start of conversation
- If high complexity detected: call `session_status(model=sonnet-4-5)` or `opus-4-6`
- Process message with upgraded model
- Return to Haiku when done

**For automated operations (heartbeats, cron):**
- Run on Haiku by default (via config)
- No manual switching needed
- Router validates this is optimal

### Cost Impact

**Before fix:**
- Default: Sonnet ($3 input, $15 output per 1M tokens)
- Heartbeats: 48/day × 178k context = 8.5M tokens
- Daily cost: ~$76.50

**After fix:**
- Default: Haiku ($0.25 input, $1.25 output per 1M tokens)
- Heartbeats: 48/day × 178k context = 8.5M tokens
- Daily cost: ~$6.40
- **Savings: 91.6%** ($70/day, ~$2100/month)

### Additional Optimizations Needed

1. **Context compaction:** 178k is massive for heartbeats
   - Target: <20k for simple operations
   - Method: Disable memory auto-injection for heartbeats
   
2. **Budget circuit breakers:**
   - Auto-pause cron if daily spend exceeds $10
   - Alert if approaching monthly budget
   
3. **Router validation:**
   - Continue logging all decisions
   - Weekly review: ensure tier classifications are accurate

## Files Modified

- `/data/.openclaw/openclaw.json` - Default model changed to Haiku
- `/skills/model-router/ROUTER-FIX.md` - This document
- `/skills/model-router/auto-route-wrapper.js` - (attempted automatic switching, not viable)

## Next Steps

1. ✅ Config patched (Haiku default)
2. ✅ Gmail monitoring disabled (preventing overnight burns)
3. ⏳ Context compaction strategy (reduce 178k → <20k for simple ops)
4. ⏳ Budget circuit breakers (auto-pause on overspend)
5. ⏳ Weekly router analytics review (validate tier accuracy)

## Testing

After gateway restart:
- Verify heartbeats run on Haiku
- Monitor token usage (should drop to <10k/heartbeat with compaction)
- Confirm Gmail checks stay disabled
- Review daily cost (target: <$10/day)

## Lessons Learned

- **Logging ≠ Enforcement:** Router logging decisions without acting on them is useless
- **Test with real costs:** Shadow mode missed the actual switching failure
- **Context matters:** 178k context for simple heartbeats is absurd
- **Circuit breakers:** Need automatic cost protection, not just alerts
- **Default to cheap:** Start with Haiku, upgrade when needed (not reverse)
