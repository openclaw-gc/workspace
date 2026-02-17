# Model Router - Shadow Mode Integration

**Date**: 2026-02-17  
**Status**: Integration in progress  
**Target**: 24h validation → enforcement decision tomorrow evening

## What We're Doing

**Phase 1 (Tonight):** Wire classifier into message flow  
**Phase 2 (Tomorrow):** Collect real classification data  
**Phase 3 (Tomorrow evening):** Review analytics, decide on enforcement

## Integration Approach

Since OpenClaw's core message processing isn't easily hooked without modifying system files, taking a pragmatic approach:

### Method 1: Manual Logging (Immediate)
- Call `log-classification.js` at the start of complex responses
- Accumulate data throughout tomorrow's work
- Honest: gives us real data on real messages
- Limitation: Not every message gets logged (only ones where I manually call it)

### Method 2: Heartbeat Analysis (Automated)
- Add to HEARTBEAT.md: analyze last 10 messages from session history
- Run classifications retroactively every 30 minutes
- Gives us consistent data even when I forget Method 1
- Limitation: Analyzes past messages, not real-time routing decisions

### Method 3: Response Wrapper (Hybrid)
- Create internal prompt reminder to classify before responding
- Log every classification
- Most complete data
- Limitation: Relies on self-discipline

**Decision:** Use all three. Method 1 for high-value messages, Method 2 for consistency, Method 3 as habit-forming.

## Integration Steps (Overnight)

1. ✅ Create `log-classification.js` wrapper
2. ⏳ Add heartbeat task for retroactive analysis
3. ⏳ Update AGENTS.md with classification reminder
4. ⏳ Test on 10 sample messages
5. ⏳ Verify log accumulation
6. ⏳ Document analytics review process for tomorrow evening

## Expected Data (After 24h)

- 50-100 message classifications
- Tier distribution (simple/standard/complex %)
- Confidence scores
- Edge cases flagged
- Cost projection vs. actual Sonnet usage

## Decision Criteria (Tomorrow Evening)

**Enable enforcement IF:**
- Classifier accuracy >90% on manual spot-check
- No critical misclassifications (complex → simple)
- Cost savings projection matches expectations (60-80%)
- Confidence scores consistently high (>0.7)

**Tune thresholds IF:**
- Accuracy 80-90%
- Some misclassifications but correctable
- Confidence scores indicate uncertainty

**Delay enforcement IF:**
- Accuracy <80%
- Critical misclassifications detected
- Unexpected edge cases require rethinking

## Enforcement Plan (If Approved)

1. Update router to use classification results (not shadow mode)
2. Enable budget tracking
3. Set up alerts for budget thresholds (80%, 95%)
4. Monitor first 24h closely
5. Adjust if needed

## Rollback Plan

If enforcement causes issues:
- Immediate: Switch back to Sonnet 4.5 for all messages
- Analyze: Review failed classifications
- Fix: Tune classifier, add edge case handling
- Re-test: Another 24h shadow validation

## Analytics Dashboard Integration

Once enforcement is live:
- Real-time model distribution widget
- Cost savings vs. baseline (Sonnet-only)
- Classification confidence trends
- Budget utilization gauge

---

**The chemistry:** Build it right, test it thoroughly, deploy with confidence. No half measures.

**Status tonight:** Integration wiring in progress.  
**Review tomorrow:** 7 PM AEDT (tomorrow evening, your time).
