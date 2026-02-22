#!/usr/bin/env node

/**
 * Add Google Meet links to all calendar events that don't have them
 * Run periodically or on-demand
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { addGoogleMeetToEvent } = require('./helpers');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../.credentials/google-service-account.json');

async function addMeetToAllEvents(options = {}) {
  const {
    calendarId = 'giancarlo.cudrig@gmail.com',
    days = 30,
    dryRun = false,
  } = options;
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    // Fetch all events in the range
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    let updated = 0;
    let skipped = 0;
    
    console.log(`📅 Scanning ${events.length} events for the next ${days} days...\n`);
    
    for (const event of events) {
      // Skip all-day events and events without a title
      if (event.start.date && !event.start.dateTime) {
        skipped++;
        continue;
      }
      
      // Skip if already has Meet
      if (event.conferenceData?.entryPoints || event.hangoutLink) {
        skipped++;
        continue;
      }
      
      if (dryRun) {
        console.log(`[DRY RUN] Would add Meet to: ${event.summary}`);
        updated++;
      } else {
        await addGoogleMeetToEvent(calendar, calendarId, event.id);
        console.log(`✅ Added Meet to: ${event.summary}`);
        updated++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${skipped} (all-day events or already have Meet)`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const days = args.find(a => a.startsWith('--days='))?.split('=')[1] || 30;
  
  addMeetToAllEvents({
    days: parseInt(days),
    dryRun,
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addMeetToAllEvents };
