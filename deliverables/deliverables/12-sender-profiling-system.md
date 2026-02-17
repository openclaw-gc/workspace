# Sender Profiling System - Hyper-Personalized Email Responses

**Status:** Built (Phase 1 complete)  
**Location:** `/data/.openclaw/workspace/skills/gmail-monitor/profiler.js`  
**Profiles:** `/data/.openclaw/workspace/memory/sender-profiles.json`

---

## What It Does

Adapts email response tone, length, and formality based on **who** you're writing to. Each sender gets a profile that learns from your approval patterns over time.

**Result:** Responses feel naturally different for Nadia (witty, brief) vs. Adrian (direct, efficient) vs. unknown contacts (professional, guarded).

---

## Current Profiles

### Nadia Randello
- **Tone:** Dry humor, Saul Goodman style
- **Length:** 3-4 sentences max
- **Pattern:** Witty but efficient
- **Example guidance:** "Use self-aware humor. Land the joke, then move on. No corporate fluff."

### Adrian Cudrig
- **Tone:** Direct, no filler
- **Length:** 2-3 sentences
- **Pattern:** Efficient
- **Example guidance:** "Cut all filler. Get to the point immediately."

### You (GC)
- **Tone:** Structured, analytical
- **Length:** Context-dependent
- **Pattern:** Clarity over charm
- **Example guidance:** "No hype. Flag uncertainty. Think one layer deeper."

---

## Profile Dimensions

**5 axes of personalization:**
1. **Relationship** (family, colleague, client, vendor, friend, unknown)
2. **Formality** (casual → executive)
3. **Tone** (warm, direct, witty, dry-humor, formal, guarded, analytical)
4. **Length** (brief, standard, detailed)
5. **Priority** (urgent, high, normal, low, await-approval)

---

## How It Works

**When new email arrives:**
1. Monitor identifies sender
2. Profiler loads their profile (or uses default for unknowns)
3. Generate response guidance with specific instructions
4. Draft response using guidance
5. Present to you for approval
6. Record approval/revision
7. **Learn:** Update profile based on what worked

**Example:**
- Email from Nadia → Profiler says "dry humor, 3-4 sentences, witty-but-efficient"
- Draft uses that guidance
- You approve → Profiler increases confidence score
- You revise → Profiler logs what didn't work, adjusts next time

---

## Learning System

**Tracks:**
- Approvals (increases confidence)
- Revisions (logs what didn't work)
- Patterns (e.g., "always revise length" → auto-adjust)

**Example learning data:**
```json
"learningData": {
  "approvals": 1,
  "revisions": 0,
  "lastInteraction": "2026-02-17T06:11:00Z"
}
```

---

## Defaults

### Unknown Professional
When someone new emails me:
- Professional distance
- Standard length (4-6 sentences)
- Always await your approval
- No personality until relationship established

### System Notifications
Google/GitHub/automated = ignore (low priority, no response needed)

---

## Usage

**Test a profile:**
```bash
node profiler.js get n.randello@easygo.io
```

**List all profiles:**
```bash
node profiler.js list
```

**Add new profile:**
Edit `memory/sender-profiles.json` directly or I can do it via conversation.

---

## Integration with Gmail Monitor

**Next step:** Wire this into `monitor.js` so every email I draft automatically uses the sender's profile.

**Flow:**
1. New email arrives
2. Monitor calls `profiler.getProfile(sender)`
3. Monitor generates draft using profile guidance
4. Draft presented to you for approval
5. Monitor calls `profiler.recordInteraction(sender, approved, revised)`
6. Profile learns and adapts

---

## What's Next

**Phase 1 (done):**
- ✅ Profile schema
- ✅ Profile storage
- ✅ Profile lookup
- ✅ Response guidance generation
- ⏳ Integration with monitor.js (next)

**Phase 2 (future):**
- Auto-create profiles for new senders
- Confidence scores
- Pattern detection (auto-adjust based on revision trends)
- Batch profile management CLI

**Phase 3 (advanced):**
- ML-based tone matching
- Context-aware length adjustment
- Relationship evolution tracking (colleague → friend over time)
- Dashboard integration (manage profiles in UI)

---

## Review Needed

1. **Profile accuracy:** Nadia, Adrian, and GC profiles match your expectations?
2. **Default behavior:** Unknown senders = professional + await approval = correct?
3. **Tone categories:** Missing any tones you use frequently?
4. **Integration priority:** Wire this into monitor.js next, or other priorities first?

---

**Files created:**
- `skills/gmail-monitor/profiler.js` (5.9KB)
- `skills/gmail-monitor/PROFILER.md` (4.8KB)
- `memory/sender-profiles.json` (3.1KB)
- `deliverables/12-sender-profiling-system.md` (this file)

**Status:** Ready for integration testing.
