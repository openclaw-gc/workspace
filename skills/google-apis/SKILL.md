# Google APIs Skill - Comprehensive Integration

## Overview
Full Google Workspace API integration: Gmail, Calendar, Drive, Sheets, Tasks, Contacts.

## Status
⏳ **Setup in progress** — awaiting GCP credentials from GC

**Setup steps:**
1. ✅ npm packages installed
2. ✅ Directory structure created
3. ✅ Authorization scripts written
4. ✅ Test scripts prepared
5. ⏳ GCP project setup (GC doing now)
6. ⏳ OAuth credentials upload
7. ⏳ Initial authorization
8. ⏳ API testing

## Credentials Location
- **OAuth client**: `/data/.openclaw/workspace/.credentials/google-oauth-client.json`
- **Service account**: `/data/.openclaw/workspace/.credentials/google-service-account.json`
- **User tokens**: `/data/.openclaw/workspace/.credentials/google-tokens.json`

All files: `chmod 600`, gitignored

## Usage (Once Set Up)

### Authorization (First Time)
```bash
node /data/.openclaw/workspace/skills/google-apis/authorize.js
```

### Test APIs
```bash
# Test Gmail
node /data/.openclaw/workspace/skills/google-apis/test-gmail.js

# Test Calendar
node /data/.openclaw/workspace/skills/google-apis/test-calendar.js

# Test Sheets
node /data/.openclaw/workspace/skills/google-apis/test-sheets.js
```

### Use in Scripts
```javascript
const { authorize } = require('./skills/google-apis/authorize');
const { google } = require('googleapis');

async function example() {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Use Gmail API
  const messages = await gmail.users.messages.list({ userId: 'me' });
}
```

## Enabled APIs

**Gmail API:**
- Read messages, threads, labels
- Send emails
- Modify labels, archive, trash
- Create filters, auto-responders

**Calendar API:**
- Create/read/update/delete events
- Manage attendees, reminders
- Recurring events
- Multiple calendars

**Drive API:**
- Upload/download files
- Create folders
- Share permissions
- Search files

**Sheets API:**
- Read/write cells
- Create sheets
- Format cells
- Charts, formulas

**Tasks API:**
- Create/read/update/delete tasks
- Task lists
- Due dates, notes

**People API (Contacts):**
- Read contacts
- Search contacts

## Scopes

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/contacts.readonly',
];
```

## Migration Plan

Once operational:

1. **Gmail Monitor** → migrate from IMAP to Gmail API
   - Better performance (push notifications)
   - Thread context
   - Label management
   - Send via API (better deliverability)

2. **Calendar Automation** → use Calendar API
   - Replace nodemailer .ics attachments
   - Native event management
   - Attendee RSVP tracking
   - Recurring events

3. **Dashboard Data** → Sheets integration
   - Live-updating cost tracker
   - Project state backup
   - Shareable data views

4. **Document Management** → Drive integration
   - Deliverables storage
   - Automated backups
   - Shared folders

5. **Task Management** → Tasks API
   - Sync PROJECT-STATE.md with Google Tasks
   - Mobile task access
   - Calendar integration

## Security

- OAuth tokens refresh automatically
- Service account for server-to-server
- All credentials encrypted at rest
- API quotas monitored
- Rotate tokens quarterly

## Quotas (Free Tier)

- Gmail API: 1 billion quota units/day (1 read = 5 units, 1 send = 100 units)
- Calendar API: 1 million requests/day
- Drive API: 1 billion queries/day
- Sheets API: 300 read requests/min, 60 write requests/min

We're well within limits for personal use.

## References

- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Calendar API Docs](https://developers.google.com/calendar)
- [Drive API Docs](https://developers.google.com/drive)
- [Sheets API Docs](https://developers.google.com/sheets)
- [Tasks API Docs](https://developers.google.com/tasks)
