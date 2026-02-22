#!/usr/bin/env node

/**
 * Gmail Monitor - Simple REST API
 * Direct HTTP calls to Gmail API with app password
 * No OAuth2 complexity, just pure REST
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const base64 = require('base-64');

const LAST_CHECK_FILE = '/data/.openclaw/workspace/memory/.gmail-last-check-api';
const LOG_FILE = '/data/.openclaw/workspace/memory/gmail-log-api.jsonl';
const ENV_FILE = '/data/.openclaw/workspace/.env.gale';

class GmailSimpleMonitor {
  constructor() {
    this.env = {};
    this.loadEnv();
  }

  loadEnv() {
    if (fs.existsSync(ENV_FILE)) {
      const content = fs.readFileSync(ENV_FILE, 'utf8');
      content.split('\n').forEach(line => {
        if (line.includes('=')) {
          const [k, v] = line.split('=');
          this.env[k.trim()] = v.trim().replace(/["']/g, '');
        }
      });
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }

  async searchEmails(minutesBack = 30) {
    try {
      const user = this.env.GALE_GMAIL || 'gale.boetticher.ai@gmail.com';
      const password = this.env.GALE_GMAIL_APP_PASSWORD;

      if (!password) {
        throw new Error('GALE_GMAIL_APP_PASSWORD not found');
      }

      // Create Basic Auth header
      const auth = base64.encode(`${user}:${password}`);
      const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      };

      // Calculate time window (Gmail API uses RFC 3339 format)
      const since = new Date(Date.now() - minutesBack * 60 * 1000);
      const query = `after:${since.toISOString().split('T')[0]}`;
      const encQuery = encodeURIComponent(query);

      // Search endpoint
      const searchUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encQuery}&maxResults=10`;

      console.log('✓ Connected to Gmail API');
      console.log(`Searching for emails since: ${since.toISOString()}`);

      const searchRes = await this.makeRequest(searchUrl, { headers });

      if (!searchRes.messages || searchRes.messages.length === 0) {
        console.log('Found 0 email(s)');
        return [];
      }

      console.log(`Found ${searchRes.messages.length} email(s) in search`);

      // Fetch full message details
      const emails = [];
      for (const msg of searchRes.messages.slice(0, 10)) {
        try {
          const msgUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
          const msgRes = await this.makeRequest(msgUrl, { headers });

          if (msgRes.payload && msgRes.payload.headers) {
            const headers = msgRes.payload.headers;
            const getHeader = (name) => headers.find(h => h.name === name)?.value;

            emails.push({
              id: msg.id,
              from: getHeader('From') || 'Unknown',
              subject: getHeader('Subject') || '(No Subject)',
              snippet: msgRes.snippet?.substring(0, 150) || '',
              date: getHeader('Date') || new Date().toISOString()
            });
          }
        } catch (err) {
          console.error(`Error fetching message ${msg.id}:`, err.message);
        }
      }

      return emails;
    } catch (error) {
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
      'no-reply@calendar.google.com'
    ];

    return emails.filter(e =>
      !systemSenders.some(sender => e.from.toLowerCase().includes(sender.toLowerCase()))
    );
  }

  async run() {
    try {
      console.log('🔍 Starting Gmail check...');

      const emails = await this.searchEmails(30);
      const important = this.filterImportant(emails);

      // Log results
      const logEntry = {
        timestamp: new Date().toISOString(),
        success: true,
        method: 'gmail-api-rest',
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
        method: 'gmail-api-rest',
        timestamp: new Date().toISOString()
      }, null, 2));

      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
      process.exit(1);
    }
  }
}

const monitor = new GmailSimpleMonitor();
monitor.run().catch(console.error);
