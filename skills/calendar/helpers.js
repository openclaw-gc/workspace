/**
 * Calendar Helper Functions
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, '../../.credentials/google-tokens.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-oauth-client.json');

const DEFAULT_TIMEZONE = 'Australia/Melbourne';

async function getCalendarClient() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('Google tokens not found. Run authorization first.');
  }
  
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Google OAuth credentials not found.');
  }
  
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  oauth2Client.setCredentials(tokens);
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

function parseDateTime(dateStr, timeStr, timezone = DEFAULT_TIMEZONE) {
  // Handle various date formats
  const date = new Date(dateStr);
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  return {
    dateTime: date.toISOString(),
    timeZone: timezone,
  };
}

function formatEvent(event) {
  const startDt = event.start.dateTime || event.start.date;
  const endDt = event.end.dateTime || event.end.date;
  
  // Format times in Melbourne timezone
  const formatTime = (dt) => {
    if (!dt) return '';
    const date = new Date(dt);
    return date.toLocaleString('en-AU', {
      timeZone: 'Australia/Melbourne',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  return {
    id: event.id,
    summary: event.summary || '(No title)',
    start: formatTime(startDt),
    end: formatTime(endDt),
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || [],
    hangoutLink: event.hangoutLink,
    htmlLink: event.htmlLink,
  };
}

async function addGoogleMeetToEvent(calendar, calendarId, eventId) {
  /**
   * Add Google Meet conferencing to an event
   * Uses service account with write access
   */
  try {
    // Get the event
    const event = await calendar.events.get({
      calendarId,
      eventId,
    });
    
    // Skip if Meet link already exists
    if (event.data.conferenceData?.entryPoints || event.data.hangoutLink) {
      return event.data;
    }
    
    // Add Google Meet
    event.data.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          key: 'hangoutsMeet',
        },
      },
    };
    
    // Update with conferenceDataVersion=1 to auto-create the Meet
    const updated = await calendar.events.update({
      calendarId,
      eventId,
      resource: event.data,
      conferenceDataVersion: 1,
    });
    
    return updated.data;
  } catch (err) {
    console.error('⚠️  Failed to add Google Meet:', err.message);
    // Don't throw — let event creation succeed even if Meet fails
    return null;
  }
}

module.exports = {
  getCalendarClient,
  parseDateTime,
  formatEvent,
  addGoogleMeetToEvent,
  DEFAULT_TIMEZONE,
};
