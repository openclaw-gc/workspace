# Gmail API Skill - Native Gmail Integration

## Overview
Native Gmail API integration replacing IMAP. Faster, more reliable, better features.

## Status
✅ **Operational** - Gmail API enabled and authorized

## Advantages Over IMAP

**Performance:**
- Push notifications (vs polling)
- Batch operations
- Partial responses (less bandwidth)

**Features:**
- Thread context
- Label management
- Advanced search
- Message modification
- Better deliverability (API send vs SMTP)

**Reliability:**
- No connection timeouts
- Automatic token refresh
- Rate limits clearly defined

## Capabilities

### Read Operations
- List messages (with filters)
- Get message details
- Search messages
- Thread management
- Label operations

### Write Operations
- Send messages
- Modify labels
- Trash/untrash
- Mark read/unread
- Archive messages

### Advanced
- Batch operations
- Watch/push notifications
- Attachment handling
- Draft management

## Migration from IMAP

**Old (IMAP):**
```javascript
// Connection issues, timeouts, polling overhead
const imap = new Imap({ /* config */ });
imap.connect();
// Poll every 10 minutes
```

**New (Gmail API):**
```javascript
// Fast, reliable, efficient
const gmail = await getGmailClient();
const messages = await gmail.users.messages.list({ userId: 'me' });
// Optional: Set up push notifications
```

## Files

- `SKILL.md` - This documentation
- `client.js` - Gmail API client helper
- `list-messages.js` - List/search messages
- `get-message.js` - Get message details
- `send-message.js` - Send email via API
- `monitor.js` - Replacement for IMAP monitor

## Usage

### List Recent Messages
```bash
node /data/.openclaw/workspace/skills/gmail-api/list-messages.js --max=10
```

### Search Messages
```bash
node /data/.openclaw/workspace/skills/gmail-api/list-messages.js --query="from:nadia"
```

### Send Message
```bash
node /data/.openclaw/workspace/skills/gmail-api/send-message.js \
  --to="recipient@example.com" \
  --subject="Test" \
  --body="Message body"
```

### Monitor (Replace IMAP)
```bash
node /data/.openclaw/workspace/skills/gmail-api/monitor.js
```

## Credentials

Uses Google OAuth tokens from:
`/data/.openclaw/workspace/.credentials/google-tokens.json`

## Next Steps

1. ✅ Build core client wrapper
2. ✅ Message listing/searching
3. ✅ Send functionality
4. ✅ New monitor script
5. Replace IMAP monitor in cron
6. Set up push notifications (optional)
