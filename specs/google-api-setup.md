# Google APIs Comprehensive Setup

## Overview
Full Google Workspace API integration for Gale - calendar, email, drive, sheets, tasks.

## Prerequisites
- Google account: gale.boetticher.ai@gmail.com
- Google Cloud Platform project (creating now)

## Setup Checklist

### 1. Google Cloud Platform Project
- [ ] Create project: `gale-openclaw`
- [ ] Enable billing (if needed for quotas)
- [ ] Set up OAuth consent screen

### 2. Enable APIs
- [ ] Gmail API
- [ ] Google Calendar API
- [ ] Google Drive API
- [ ] Google Sheets API
- [ ] Google Tasks API
- [ ] People API (Contacts)

### 3. Create Credentials

**Service Account** (for server-to-server):
- [ ] Create service account: `gale-bot@gale-openclaw.iam.gserviceaccount.com`
- [ ] Download JSON key
- [ ] Grant domain-wide delegation (if using Workspace)

**OAuth 2.0 Client** (for user-authorized actions):
- [ ] Create OAuth 2.0 client ID (Web application)
- [ ] Set redirect URIs: `http://localhost:3000/api/auth/callback/google`
- [ ] Download client secret JSON

### 4. Configure Permissions

**Gmail API scopes:**
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/gmail.labels`

**Calendar API scopes:**
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

**Drive API scopes:**
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.file`

**Sheets API scopes:**
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/spreadsheets.readonly`

**Tasks API scopes:**
- `https://www.googleapis.com/auth/tasks`

**People API scopes:**
- `https://www.googleapis.com/auth/contacts.readonly`

### 5. Install Client Libraries

```bash
cd /data/.openclaw/workspace/skills/google-apis
npm init -y
npm install googleapis @google-cloud/local-auth dotenv
```

### 6. Store Credentials

**Service Account Key:**
`/data/.openclaw/workspace/.credentials/google-service-account.json`

**OAuth Client Secret:**
`/data/.openclaw/workspace/.credentials/google-oauth-client.json`

**User Tokens:**
`/data/.openclaw/workspace/.credentials/google-tokens.json`

### 7. Initial OAuth Flow

Run first-time authorization to get refresh token:
```bash
node /data/.openclaw/workspace/skills/google-apis/authorize.js
```

### 8. Test Integration

```bash
# Test Gmail API
node /data/.openclaw/workspace/skills/google-apis/test-gmail.js

# Test Calendar API
node /data/.openclaw/workspace/skills/google-apis/test-calendar.js

# Test Sheets API
node /data/.openclaw/workspace/skills/google-apis/test-sheets.js
```

## Security

- All credential files: `chmod 600`
- Never commit to GitHub (gitignored)
- Rotate tokens quarterly
- Monitor API usage in GCP console

## Integration Points

**Gmail:**
- Replace IMAP monitor with Gmail API (better performance, labels, threads)
- Send emails via API (better deliverability than SMTP)

**Calendar:**
- Create/read/update/delete events programmatically
- Manage attendees, reminders, recurring events
- Two-way sync with local data

**Sheets:**
- Dashboard data source (live-updating spreadsheets)
- Cost tracking export
- Project state backup

**Drive:**
- Document storage for deliverables
- Automated backups
- Shared folder management

**Tasks:**
- Integrate with PROJECT-STATE.md
- Create tasks from Telegram
- Sync with calendar

## Next Steps

1. Complete GCP project setup (manual in console)
2. Download credentials
3. Run OAuth flow
4. Test each API
5. Migrate Gmail monitor to API
6. Build Calendar skill
7. Build Sheets integration for dashboard
