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
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  
  return {
    id: event.id,
    summary: event.summary || '(No title)',
    start,
    end,
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || [],
    hangoutLink: event.hangoutLink,
    htmlLink: event.htmlLink,
  };
}

module.exports = {
  getCalendarClient,
  parseDateTime,
  formatEvent,
  DEFAULT_TIMEZONE,
};
