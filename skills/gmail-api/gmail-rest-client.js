#!/usr/bin/env node

/**
 * Gmail REST API Client
 * Uses Google Cloud service account for authentication
 * Proper OAuth2 implementation with googleapis library
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = '/data/.openclaw/workspace/.google-credentials.json';
const LAST_CHECK_FILE = '/data/.openclaw/workspace/memory/.gmail-last-check-rest';
const LOG_FILE = '/data/.openclaw/workspace/memory/gmail-log-rest.jsonl';

class GmailRESTClient {
  constructor() {
    this.auth = null;
    this.gmail = null;
  }

  async authenticate() {
    try {
      if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Credentials file not found: ${CREDENTIALS_PATH}`);
      }

      const credentials = JSON.parse(
        fs.readFileSync(CREDENTIALS_PATH, 'utf8')
      );

      // Create JWT client from service account
      this.auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/gmail.readonly']
      });

      // Initialize Gmail API client
      this.gmail = google.gmail({
        version: 'v1',
        auth: this.auth
      });

      console.log('✓ Authenticated with Gmail REST API');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async getRecentEmails(minutesBack = 30) {
    try {
      // Calculate search query (Gmail API query syntax)
      const since = new Date(Date.now() - minutesBack * 60 * 1000);
      const sinceStr = since.toISOString().split('T')[0];
      const query = `after:${sinceStr}`;

      console.log(`Searching for emails since: ${since.toISOString()}`);

      // Search for recent emails
      const listRes = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 10
      });

      if (!listRes.data.messages || listRes.data.messages.length === 0) {
        console.log('Found 0 email(s)');
        return [];
      }

      console.log(`Found ${listRes.data.messages.length} email(s)`);

      // Get full message details for each result
      const emails = [];
      for (const msg of listRes.data.messages) {
        try {
          const getRes = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const headers = getRes.data.payload.headers || [];
          const getHeader = (name) => headers.find(h => h.name === name)?.value;

          emails.push({
            id: msg.id,
            from: getHeader('From') || 'Unknown',
            subject: getHeader('Subject') || '(No Subject)',
            snippet: getRes.data.snippet || '',
            date: getHeader('Date') || new Date().toISOString()
          });
        } catch (err) {
          console.error(`Error fetching message ${msg.id}:`, err.message);
        }
      }

      return emails;
    } catch (error) {
      console.error('❌ Error checking emails:', error.message);
      throw error;
    }
  }

  filterImportant(emails) {
    const systemSenders = [
      'no-reply@accounts.google.com',
      'googlecloud@google.com',
      'noreply@github.com',
      'calendar-notification@google.com',
      'drive-shares-noreply@google.com',
      'no-reply@calendar.google.com',
      'notifications.google.com'
    ];

    return emails.filter(e =>
      !systemSenders.some(sender => e.from.toLowerCase().includes(sender.toLowerCase()))
    );
  }

  async run() {
    try {
      console.log('🔍 Starting Gmail REST API check...');

      await this.authenticate();
      const emails = await this.getRecentEmails(30);
      const important = this.filterImportant(emails);

      // Log results
      const logEntry = {
        timestamp: new Date().toISOString(),
        success: true,
        method: 'gmail-rest-api',
        emailsFound: emails.length,
        importantEmails: important.length,
        emails: important.slice(0, 5).map(e => ({
          from: e.from,
          subject: e.subject
        }))
      };

      const logDir = path.dirname(LOG_FILE);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
      fs.writeFileSync(LAST_CHECK_FILE, Date.now().toString());

      console.log('✓ Check complete');
      console.log(JSON.stringify({
        success: true,
        emailsFound: emails.length,
        newEmails: important.length,
        method: 'gmail-rest-api',
        timestamp: new Date().toISOString()
      }, null, 2));

      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log(JSON.stringify({
        success: false,
        error: error.message,
        method: 'gmail-rest-api',
        timestamp: new Date().toISOString()
      }, null, 2));
      process.exit(1);
    }
  }
}

const client = new GmailRESTClient();
client.run().catch(console.error);
