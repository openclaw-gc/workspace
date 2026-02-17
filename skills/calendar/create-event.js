#!/usr/bin/env node

/**
 * Create a calendar event
 */

const { getCalendarClient, parseDateTime, DEFAULT_TIMEZONE } = require('./helpers');

async function createEvent(options) {
  const {
    title,
    date,
    time,
    duration = 60, // minutes
    location,
    description,
    attendees = [],
    addMeet = false,
    timezone = DEFAULT_TIMEZONE,
    calendarId = 'primary',
  } = options;
  
  if (!title || !date) {
    throw new Error('Title and date are required');
  }
  
  try {
    const calendar = await getCalendarClient();
    
    // Parse start time
    const start = parseDateTime(date, time, timezone);
    
    // Calculate end time
    const endDate = new Date(start.dateTime);
    endDate.setMinutes(endDate.getMinutes() + duration);
    const end = {
      dateTime: endDate.toISOString(),
      timeZone: timezone,
    };
    
    // Build event object
    const event = {
      summary: title,
      start,
      end,
    };
    
    if (location) event.location = location;
    if (description) event.description = description;
    if (attendees.length > 0) {
      event.attendees = attendees.map(email => ({ email }));
    }
    if (addMeet) {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }
    
    console.log('📅 Creating event...');
    console.log(`   Title: ${title}`);
    console.log(`   Start: ${start.dateTime}`);
    console.log(`   Duration: ${duration} minutes`);
    if (location) console.log(`   Location: ${location}`);
    if (attendees.length > 0) console.log(`   Attendees: ${attendees.join(', ')}`);
    
    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      conferenceDataVersion: addMeet ? 1 : 0,
      sendUpdates: attendees.length > 0 ? 'all' : 'none',
    });
    
    console.log(`\n✅ Event created successfully!`);
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Link: ${response.data.htmlLink}`);
    if (response.data.hangoutLink) {
      console.log(`   Meet: ${response.data.hangoutLink}`);
    }
    
    return response.data;
    
  } catch (err) {
    console.error('❌ Failed to create event:', err.message);
    throw err;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : null;
  };
  
  const title = getArg('title');
  const date = getArg('date');
  const time = getArg('time');
  const duration = parseInt(getArg('duration') || '60');
  const location = getArg('location');
  const description = getArg('description');
  const attendeesStr = getArg('attendees');
  const attendees = attendeesStr ? attendeesStr.split(',') : [];
  const addMeet = args.includes('--meet');
  
  if (!title || !date) {
    console.error('Usage: node create-event.js --title="Title" --date="2026-02-20" [--time="14:00"] [--duration=60] [--location="Place"] [--attendees="email@example.com,other@example.com"] [--meet]');
    process.exit(1);
  }
  
  createEvent({
    title,
    date,
    time,
    duration,
    location,
    description,
    attendees,
    addMeet,
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createEvent };
