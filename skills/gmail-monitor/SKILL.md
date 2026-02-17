# Gmail Monitor Skill

**Purpose:** Monitor gale.boetticher.ai@gmail.com inbox every 10 minutes, process forwarded emails from GC and direct external emails, auto-label, notify via Telegram, track approval workflow.

## Architecture

### Email Types

1. **Forwarded from GC** → Execute immediately
   - Subject hints: `[URGENT]`, `[DRAFT REPLY]`, `[RESEARCH]`, `[TRACK]`
   - Auto-labeled: `FROM-GC` + project labels (Vana, Cryptyx, etc.)
   
2. **External direct** → Await approval
   - Auto-labeled: `EXTERNAL` + `AWAITING-APPROVAL`
   - Notify GC via Telegram with preview + approval options
   - Track state in `memory/email-queue.json`

### Label System

- **URGENT** 🔴 - Flagged for immediate attention
- **AWAITING-APPROVAL** ⏳ - External emails needing GC's OK
- **APPROVED** ✅ - Ready to draft response
- **SENT** 📤 - Completed actions
- **FROM-GC** 📨 - Forwarded from GC
- **EXTERNAL** 📧 - Direct inbound from others
- **VANA** / **CRYPTYX** / **INFRASTRUCTURE** - Project labels
- **REFERENCE** 🗂️ - Keep for later
- **ARCHIVE** 🗑️ - Done, filed away

### Files

- `monitor.js` - Main monitoring script (Node.js)
- `memory/email-queue.json` - Approval tracking
- `memory/gmail-log.jsonl` - Activity log
- `memory/.gmail-last-check` - Timestamp of last successful check

### Approval Workflow

When external email arrives:
1. Parse sender, subject, body preview
2. Add to `pending` queue
3. Notify GC via Telegram:
   ```
   📧 New email to Gale
   From: sender@example.com
   Subject: Re: Your proposal
   
   Preview: [first 300 chars]
   
   Reply with:
   • APPROVE <id> - I'll draft a response
   • REVISE <id>: [instructions] - Custom response
   • IGNORE <id> - No action needed
   ```
4. Wait for GC's Telegram reply
5. On approval → draft response, notify GC for final review
6. On send → move to `SENT`, archive

## Usage

### Manual Run
```bash
cd /data/.openclaw/workspace/skills/gmail-monitor
node monitor.js
```

### Cron Job (Every 10 min)
```json
{
  "name": "Gmail Monitor",
  "schedule": {
    "kind": "every",
    "everyMs": 600000
  },
  "payload": {
    "kind": "systemEvent",
    "text": "Run Gmail monitor check"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

## Safety Rails

- Never auto-reply to external senders without GC approval
- Flag anything financial/legal/ambiguous for manual review
- Log all inbound to `gmail-log.jsonl`
- Keep approval state persistent across restarts

## Dependencies

```bash
npm install imap mailparser
```

## Integration Points

- **Telegram** - Notifications via OpenClaw's `message` tool
- **Gmail** - IMAP read-only access (app password in `.env.gale`)
- **Cron** - Scheduled via OpenClaw's cron system
- **Memory** - Queue + logs in `memory/` directory

## Roadmap

### Phase 1 (Current)
- [x] IMAP connection
- [x] Unread email detection
- [x] Forwarded vs external classification
- [x] Basic logging
- [ ] Label creation via Gmail API
- [ ] Telegram notifications (via cron job tool calls)
- [ ] Approval command parsing

### Phase 2
- [ ] Draft reply generation
- [ ] Auto-send on approval
- [ ] Smart project labeling (keyword detection)
- [ ] Email thread tracking
- [ ] Calendar invite extraction

### Phase 3
- [ ] Full Gmail API integration (labels, send)
- [ ] Attachment handling
- [ ] Multi-step workflows (research → draft → review → send)
- [ ] Integration with dashboard (pending approvals widget)
