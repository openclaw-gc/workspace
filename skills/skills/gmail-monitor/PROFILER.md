# Sender Profiler - Hyper-Personalized Email Responses

## Overview

The Sender Profiler enables hyper-personalized email responses by adapting tone, length, and formality based on who you're writing to. Each sender gets a profile that learns from your approval/revision patterns over time.

## Profile Dimensions

### Relationship
- **family** - Personal relationships (Nadia, Adrian)
- **colleague** - Work peers
- **client** - External clients/customers
- **vendor** - Service providers
- **friend** - Personal friends
- **unknown** - New/unrecognized contacts

### Formality
- **casual** - Very informal, conversational
- **casual-professional** - Friendly but competent (Nadia)
- **professional-casual** - Professional with warmth (Adrian)
- **professional** - Standard business tone
- **executive** - Formal, high-level

### Tone
- **warm** - Friendly and approachable
- **direct** - Efficient, no-nonsense (Adrian)
- **witty** - Humor-forward
- **dry-humor** - Self-aware, Saul Goodman style (Nadia)
- **formal** - Traditional business
- **polite-guarded** - Professional distance (unknowns)
- **structured-analytical** - Precision-focused (GC)

### Length
- **brief** - 2-4 sentences
- **standard** - 4-6 sentences
- **detailed** - Comprehensive, multi-paragraph

### Priority
- **urgent** - Respond immediately
- **high** - Respond within hours
- **normal** - Respond within 24h
- **low** - Can wait
- **await-approval** - Always require GC approval first

## Usage

### Check a Profile
```bash
node profiler.js get email@example.com
```

### List All Profiles
```bash
node profiler.js list
```

### Add New Profile
Edit `memory/sender-profiles.json` and add:
```json
"email@example.com": {
  "name": "Person Name",
  "relationship": "colleague",
  "role": "VP Engineering @ Company",
  "formality": "professional",
  "tone": "direct",
  "length": "brief",
  "sentences": "3-4",
  "priority": "normal",
  "responsePattern": "efficient-no-filler",
  "notes": "Technical background. Appreciates brevity and precision.",
  "learningData": {
    "approvals": 0,
    "revisions": 0,
    "lastInteraction": null
  }
}
```

## Current Profiles

### Nadia Randello (n.randello@easygo.io)
- **Relationship:** Family (wife)
- **Tone:** Dry humor, self-aware
- **Length:** Brief (3-4 sentences)
- **Pattern:** Witty but efficient
- **Notes:** Saul Goodman references work well. No corporate fluff.

### Adrian Cudrig (Adrian.Cudrig@morganstanley.com)
- **Relationship:** Family (brother)
- **Tone:** Direct
- **Length:** Brief (2-3 sentences)
- **Pattern:** Efficient, no filler
- **Notes:** Finance professional. Respects brevity.

### Giancarlo Cudrig (giancarlo.cudrig@gmail.com)
- **Relationship:** Principal (boss)
- **Tone:** Structured, analytical
- **Length:** Context-dependent
- **Pattern:** Clarity over charm
- **Notes:** No hype. Flag uncertainty. Think one layer deeper.

## Learning System

The profiler tracks your approval/revision patterns:
- **Approval** → Increases confidence score
- **Revision** → Logs what didn't work
- **Over time** → Adapts guidance based on patterns

Example:
```javascript
profiler.recordInteraction('email@example.com', approved=true, revised=false);
```

## Integration with Gmail Monitor

When processing emails:
1. Monitor identifies sender
2. Profiler loads their profile
3. Generate response guidance
4. Draft response using guidance
5. Present to GC for approval
6. Record approval/revision
7. Update profile learning data

## Response Guidance Format

```json
{
  "tone": "dry-humor",
  "length": "brief",
  "sentences": "3-4",
  "formality": "casual-professional",
  "pattern": "witty-but-efficient",
  "priority": "high",
  "instructions": [
    "Use dry, self-aware humor. Saul Goodman style.",
    "Keep it brief: 3-4 sentences max.",
    "Witty but efficient. Land the joke, then move on.",
    "Context: Appreciates self-aware humor. Keep it tight."
  ]
}
```

## Defaults

### Unknown Professional
- Formality: Professional
- Tone: Polite but guarded
- Length: Standard (4-6 sentences)
- Priority: Await approval
- Always requires GC approval before sending

### System Notifications
- Tone: Ignore
- Priority: Low
- No response needed (Google/GitHub/automated)

## Roadmap

### Phase 1 (Current)
- [x] Profile schema
- [x] Profile storage (JSON)
- [x] Profile lookup
- [x] Response guidance generation
- [ ] Integration with monitor.js
- [ ] Approval tracking

### Phase 2
- [ ] Automatic profile creation from new senders
- [ ] Confidence scores based on approval rate
- [ ] Pattern detection (e.g., "always revise length" → auto-adjust)
- [ ] Batch profile updates via CLI

### Phase 3
- [ ] ML-based tone matching
- [ ] Context-aware length adjustment
- [ ] Relationship evolution tracking (colleague → friend)
- [ ] Dashboard integration (profile management UI)
