# Email Sending Protocol

**Critical Rule:** GC must be CC'd on ALL emails. No exceptions.

## Using email-sender.py

This script prevents duplicate sends by tracking all emails in `email-sends.jsonl`.

### Basic Usage

```python
from email_sender import send_email

result = send_email(
    to='recipient@example.com, another@example.com',
    cc='optional@example.com',  # GC automatically added
    subject='Email Subject',
    body='Email body text'
)

if result['status'] == 'sent':
    print('✅ Sent successfully')
elif result['status'] == 'duplicate':
    print('⚠️ Already sent:', result['message'])
else:
    print('❌ Error:', result['message'])
```

### Duplicate Prevention

- Emails are hashed by (to + subject)
- Duplicate check: 24-hour window
- If found: returns 'duplicate' status with previous send timestamp
- Override with `force=True` (use cautiously)

### Send Log

Location: `/data/.openclaw/workspace/memory/email-sends.jsonl`

Format:
```json
{
  "timestamp": "2026-02-18T09:35:00+08:00",
  "to": "recipient@example.com",
  "cc": "giancarlo.cudrig@gmail.com",
  "subject": "Email Subject",
  "hash": "abc123...",
  "from": "gale.boetticher.ai@gmail.com"
}
```

### Policy Enforcement

1. **Always CC GC**: Script automatically adds giancarlo.cudrig@gmail.com
2. **Check before send**: Queries log for duplicates
3. **Log after send**: Records successful sends only
4. **24h duplicate window**: Prevents accidental resends same day

### Error Handling

If send fails:
- Check credentials in `/data/.openclaw/workspace/.env.gale`
- Verify SMTP connection (smtp.gmail.com:587)
- Review error message in result dict
- **Do not retry immediately** - wait 60s, check Sent folder first

## Migration from Old Methods

**DEPRECATED:**
- Direct Python SMTP calls without logging
- Multiple retry attempts without duplicate checks
- Manual Sent folder saving

**USE INSTEAD:**
- `email-sender.py` for all sends
- Single send attempt with status check
- Trust Gmail to save to Sent folder (auto-saves within 1-2 min)

## Lessons Learned (2026-02-18)

**Incident:** 4 duplicate emails sent to Nadia (SUV analysis)

**Root cause:** 
- No duplicate tracking
- Immediate retries without verification
- No centralized send log

**Prevention:** This system implemented.
