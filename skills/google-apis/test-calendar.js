#!/usr/bin/env node

/**
 * Test Google Calendar API Integration
 */

const { authorize } = require('./authorize');
const { google } = require('googleapis');

async function testCalendar() {
  console.log('📅 Testing Google Calendar API...\n');
  
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });
  
  // List calendars
  console.log('1. Fetching calendar list...');
  const calendarList = await calendar.calendarList.list();
  console.log(`   ✅ Found ${calendarList.data.items?.length || 0} calendars\n`);
  
  calendarList.data.items?.forEach(cal => {
    console.log(`   📆 ${cal.summary}`);
    console.log(`      ID: ${cal.id}`);
    console.log(`      Primary: ${cal.primary || false}\n`);
  });
  
  // Get upcoming events
  console.log('2. Fetching upcoming events...');
  const now = new Date().toISOString();
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  console.log(`   ✅ Found ${events.data.items?.length || 0} upcoming events\n`);
  
  if (events.data.items) {
    events.data.items.slice(0, 5).forEach(event => {
      const start = event.start.dateTime || event.start.date;
      console.log(`   📌 ${event.summary || '(no title)'}`);
      console.log(`      ${start}`);
      if (event.description) {
        console.log(`      ${event.description.slice(0, 50)}...`);
      }
      console.log();
    });
  }
  
  // Test event creation (dry run - commented out)
  /*
  console.log('3. Creating test event...');
  const testEvent = {
    summary: 'Test Event from Gale',
    description: 'API integration test',
    start: {
      dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      timeZone: 'Australia/Melbourne',
    },
    end: {
      dateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      timeZone: 'Australia/Melbourne',
    },
  };
  
  const created = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: testEvent,
  });
  
  console.log(`   ✅ Event created: ${created.data.htmlLink}\n`);
  */
  
  console.log('✅ Calendar API test complete!\n');
}

if (require.main === module) {
  testCalendar()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Calendar test failed:', err.message);
      process.exit(1);
    });
}

module.exports = { testCalendar };
