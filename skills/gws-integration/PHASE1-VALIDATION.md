# Phase 1: GWS Validation Checklist

**Status:** In Progress (awaiting OAuth setup from GC)

## Pre-Auth Tasks ✅

### 1.1: Installation
- [x] npm install -g @googleworkspace/cli
- [x] Version check: `gws --version`

### 1.2: CLI Validation
```bash
gws --help
gws calendar --help
gws gmail --help
gws drive --help
```

Test output:
- [ ] Calendar commands listed (list, create, delete, update)
- [ ] Gmail commands listed (list-messages, send, delete, labels)
- [ ] Drive commands listed (list, upload, download, delete)

---

## Post-Auth Tasks (Waiting for GC)

### 2.1: OAuth Setup
**GC to run on his machine:**
```bash
gws auth setup
```
- [ ] Browser login completes
- [ ] Config saved (check ~/.config/gws/ or similar)
- [ ] Provide config path or confirm ready

---

## Calendar Validation (Post-Auth)

### 2.2: List Events
```bash
gws calendar list --max-results 5 --time-zone "Australia/Melbourne"
```

Expected output:
- [ ] JSON with events (title, start, end, timezone)
- [ ] Timezone field present
- [ ] Google Meet link included (if applicable)
- [ ] Compare to current `list-events.js` output (format parity)

### 2.3: Create Event (Cross-Timezone Test)

**Test Case 1: Melbourne event**
```bash
gws calendar create \
  --title "Test Melbourne Event" \
  --start "2026-03-07T10:00:00" \
  --end "2026-03-07T11:00:00" \
  --time-zone "Australia/Melbourne" \
  --guests "test@example.com"
```

Verify:
- [ ] Event created with correct time
- [ ] Timezone: Australia/Melbourne
- [ ] In Google Calendar, event shows 10:00 AM Melbourne

**Test Case 2: DST Transition (cross-timezone)**

Melbourne goes back to AEDT from AEST. Create event on DST boundary:
```bash
gws calendar create \
  --title "DST Transition Test" \
  --start "2026-03-01T02:00:00" \
  --time-zone "Australia/Melbourne"
```

Verify:
- [ ] Correct time stored (no DST confusion)
- [ ] Show time in UTC and Australia/Melbourne

**Test Case 3: Cross-timezone invite**
```bash
gws calendar create \
  --title "Cross-TZ Meeting" \
  --start "2026-03-10T18:00:00Z"  # UTC explicit
  --time-zone "UTC" \
  --guests "london@example.com,sydney@example.com,tokyo@example.com"
```

Verify:
- [ ] Each attendee sees correct local time
- [ ] No double-conversion issues

### 2.4: Google Meet Auto-Inclusion
```bash
gws calendar create \
  --title "Meeting with Meet" \
  --start "2026-03-07T14:00:00" \
  --time-zone "Australia/Melbourne" \
  --add-meet-link
```

Verify:
- [ ] Event includes Google Meet link
- [ ] Link is functional

---

## Email Validation (Post-Auth)

### 3.1: List Messages
```bash
gws gmail list-messages --max-results 10
```

Expected:
- [ ] JSON output with messages (id, sender, subject, snippet)
- [ ] Matches current email-monitoring output format

### 3.2: List with Filters
```bash
gws gmail list-messages --query "from:giancarlo.cudrig@gmail.com"
```

Verify:
- [ ] Filters work
- [ ] Results are relevant

### 3.3: Send Email
```bash
gws gmail send \
  --to "giancarlo.cudrig@gmail.com" \
  --subject "Test from GWS" \
  --body "This is a test email from Google Workspace CLI"
```

Verify:
- [ ] Email arrives in inbox
- [ ] Subject and body correct
- [ ] CC policy wrapper needed (auto-CC giancarlo.cudrig@gmail.com)

### 3.4: Send with CC (Wrapper Requirement)
After send validation, note:
- [ ] gws send supports CC: `--cc "email@example.com"`
- [ ] Wrapper must auto-inject CC based on sender policy

---

## Drive Validation (Post-Auth)

### 4.1: List Files
```bash
gws drive list --max-results 10
```

Expected:
- [ ] JSON with file list (id, name, mime-type, size, modified)
- [ ] Folder structure visible

### 4.2: Upload File
```bash
gws drive upload \
  --file "/path/to/local/file.txt" \
  --parent "folder-id" \
  --name "uploaded-file.txt"
```

Verify:
- [ ] File appears in Google Drive
- [ ] Folder parent correct

### 4.3: Create Folder
```bash
gws drive create-folder \
  --name "pinkman-research" \
  --parent "root"
```

Verify:
- [ ] Folder created in Drive
- [ ] Can upload files to it

### 4.4: Incremental Backup Use Case
**Scenario:** Daily snapshot of workspace files (MEMORY.md, PROJECT-STATE.md, etc.)

```bash
# Would be run hourly (incremental)
gws drive list --parent "backup-folder-id" --fields "id,name,modified-time" --order-by "modified-time desc"
```

Verify:
- [ ] Can track modified files
- [ ] Timestamp metadata available
- [ ] Efficient query (not full list every time)

---

## Cross-Timezone Test Cases

### 5.1: Scenario A — Melbourne organizer, global attendees
- Organizer: GC in Melbourne (Australia/Melbourne)
- Attendees: London, Tokyo, San Francisco
- Event time: 10:00 AM Melbourne
- Expected: Each attendee sees correct local conversion

### 5.2: Scenario B — DST transition
- Event: March 1, 2026 (DST boundary in Australia)
- Melbourne: AEDT (UTC+11)
- Create event at 2:00 AM (falls in "missing hour")
- Expected: API handles gracefully (or errors with clear message)

### 5.3: Scenario C — UTC-based event
- Event scheduled in UTC explicitly
- Multiple timezones shown
- No ambiguity

---

## Comparison: Old vs New

| Operation | Old (Custom) | GWS | Notes |
|-----------|--------------|-----|-------|
| List events | list-events.js | `gws calendar list` | Format comparison needed |
| Create event | create-event.js | `gws calendar create` | Google Meet handling? |
| Send email | email-sender.py | `gws gmail send` | CC policy wrapper needed |
| List emails | IMAP polling | `gws gmail list-messages` | Filter support needed |
| Drive backup | Not yet built | `gws drive list/upload` | New capability |

---

## Success Criteria

✅ All gws commands work without errors  
✅ Calendar operations match old system (format parity)  
✅ Email send/receive matches old system  
✅ Drive operations work for backup use case  
✅ Cross-timezone calendar handling validated  
✅ No unexpected API limitations found  

---

## Blockers / Issues Found

(None yet — awaiting auth)

---

## Next Steps

1. **GC:** Run `gws auth setup` on your machine
2. **Gale:** Verify config, run validation tests
3. **Report:** Document findings, decision gate (proceed to Phase 2 or escalate issues)

---

**Updated:** 2026-03-06 09:55 AM KL (6:55 AM Melbourne)
