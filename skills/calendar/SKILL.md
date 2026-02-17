# Calendar Skill - Google Calendar Management

## Overview
Native Google Calendar integration for event management, scheduling, and coordination.

## Status
✅ **Operational** - Google Calendar API enabled and authorized

## Capabilities

### Read Operations
- List upcoming events
- Search events by keyword/date
- Get event details
- Check calendar availability

### Write Operations
- Create events (single, recurring)
- Update existing events
- Delete events
- Manage attendees (add, remove)

### Advanced
- Multiple calendar support
- Timezone handling (Australia/Melbourne default)
- Recurring event patterns
- Reminder management
- Google Meet integration

## Usage

### Create Event
```bash
node /data/.openclaw/workspace/skills/calendar/create-event.js \
  --title "Meeting with Adrian" \
  --date "2026-02-20" \
  --time "12:00" \
  --duration "90" \
  --location "A25 Pizzeria Centro, 397 Little Collins St, Melbourne" \
  --attendees "Adrian.Cudrig@morganstanley.com"
```

### List Upcoming Events
```bash
node /data/.openclaw/workspace/skills/calendar/list-events.js --days 7
```

### Check Availability
```bash
node /data/.openclaw/workspace/skills/calendar/check-availability.js \
  --date "2026-02-20" \
  --start "09:00" \
  --end "17:00"
```

## Integration with Workflows

**Email coordination → Calendar:**
- Parse meeting requests from email
- Check availability
- Create event
- Send calendar invite

**Proactive reminders:**
- Check upcoming events at heartbeat
- Alert GC 2h before important meetings
- Provide location/directions if needed

**Automated scheduling:**
- Find open slots
- Propose meeting times
- Handle RSVPs

## Files

- `SKILL.md` - This documentation
- `create-event.js` - Create calendar events
- `list-events.js` - List upcoming events
- `update-event.js` - Update existing events
- `delete-event.js` - Delete events
- `check-availability.js` - Check free/busy
- `helpers.js` - Shared utilities

## Credentials

Uses Google OAuth tokens from:
`/data/.openclaw/workspace/.credentials/google-tokens.json`

## Next Steps

1. Build core scripts (create, list, update, delete)
2. Add availability checking
3. Integrate with Gmail monitor (auto-parse meeting invites)
4. Add to heartbeat (upcoming event alerts)
5. Dashboard widget (today's schedule)
