#!/usr/bin/env node

/**
 * List upcoming calendar events
 */

const { getCalendarClient, formatEvent } = require('./helpers');

async function listEvents(options = {}) {
  const {
    days = 7,
    maxResults = 10,
    calendarId = 'primary',
  } = options;
  
  try {
    const calendar = await getCalendarClient();
    
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    
    if (events.length === 0) {
      console.log(`📅 No events found in the next ${days} days`);
      return [];
    }
    
    console.log(`📅 Upcoming events (next ${days} days):\n`);
    
    events.forEach(event => {
      const formatted = formatEvent(event);
      console.log(`📌 ${formatted.summary}`);
      console.log(`   ${formatted.start}`);
      if (formatted.location) {
        console.log(`   📍 ${formatted.location}`);
      }
      if (formatted.attendees.length > 0) {
        console.log(`   👥 ${formatted.attendees.join(', ')}`);
      }
      console.log();
    });
    
    return events.map(formatEvent);
    
  } catch (err) {
    console.error('❌ Failed to list events:', err.message);
    throw err;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const days = args.find(a => a.startsWith('--days='))?.split('=')[1] || 7;
  const maxResults = args.find(a => a.startsWith('--max='))?.split('=')[1] || 10;
  
  listEvents({
    days: parseInt(days),
    maxResults: parseInt(maxResults),
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { listEvents };
