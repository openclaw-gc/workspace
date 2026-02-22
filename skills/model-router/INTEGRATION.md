# Model Router OpenClaw Integration

## How It Works

### Message Flow

```
User Message
     ↓
[Router Intercept]  ← analyze message, get tier + model
     ↓
[Switch Model]      ← session_status(model=recommendedModel) if shouldSwitch
     ↓
[Process Message]   ← OpenClaw processes with selected model
     ↓
[Record Usage]      ← log actual tokens used + cost
```

### Integration Points

**1. Message Start (via exec)**
```bash
node /data/.openclaw/workspace/skills/model-router/integrate.js analyze "$MESSAGE" "$CURRENT_MODEL" $CONTEXT_SIZE
```

Returns JSON:
```json
{
  "shouldSwitch": true,
  "recommendedModel": "anthropic/claude-haiku-4-5",
  "tier": "simple",
  "reasoning": "..."
}
```

**2. Model Switch (via session_status)**
```
session_status(model="anthropic/claude-haiku-4-5")
```

**3. Usage Recording (after message)**
```bash
node /data/.openclaw/workspace/skills/model-router/integrate.js record "$MODEL" $INPUT_TOKENS $OUTPUT_TOKENS "$TIER"
```

## Manual Testing

### Test classification
```bash
cd /data/.openclaw/workspace/skills/model-router
node integrate.js analyze "what time is it?" "anthropic/claude-sonnet-4-5" 5000
node integrate.js analyze "Design a comprehensive treasury architecture" "anthropic/claude-sonnet-4-5" 50000
```

### Test usage recording
```bash
node integrate.js record "anthropic/claude-haiku-4-5" 5000 2000 "simple"
```

### Check budget
```bash
node integrate.js budget
```

### View stats
```bash
node integrate.js stats 7
```

## Automatic Integration (Future)

To make this fully automatic, OpenClaw would need to:
1. Call `integrate.js analyze` before processing each message
2. Switch model if `shouldSwitch: true`
3. Call `integrate.js record` after processing with actual token counts

This requires OpenClaw core modification or a middleware layer.

## Current Status

**Phase 1:** ✅ Integration script built
**Phase 2:** ⏳ Testing with real messages
**Phase 3:** ⏳ Classifier tuning
**Phase 4:** ⏳ Automatic interception (requires OpenClaw hooks)

## Classifier Tuning

If classifications seem wrong, edit `config.json`:
- Add keywords to `simpleKeywords` or `complexKeywords`
- Adjust `lengthThresholds`
- Add user hint patterns

## Cost Tracking

All usage is logged to `.cost-data.json` and `.routing-log.jsonl`.

View current spend:
```bash
node integrate.js budget
```

