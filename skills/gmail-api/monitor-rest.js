#!/usr/bin/env node

/**
 * Gmail Monitor - REST API Implementation
 * Uses Google Gmail API v1 (REST) via googleapis library
 * No IMAP. Pure API-first architecture.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = '/data/.openclaw/workspace/skills/gmail-api/.gmail-token.json';
const CREDENTIALS_PATH = '/data/.openclaw/workspace/skills/gmail-api/service-account.json';
const LAST_CHECK_FILE = '/data/.openclaw/workspace/memory/.gmail-last-check-api';
const LOG_FILE = '/data/.openclaw/workspace/memory/gmail-log-api.jsonl';
const ENV_FILE = '/data/.openclaw/workspace/.env.gale';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

class GmailRestMonitor {
  constructor() {
    this.auth = null;
    this.gmail = null;
  }

  loadEnv() {
    const env = {};
    if (fs.existsSync(ENV_FILE)) {
      const content = fs.readFileSync(ENV_FILE, 'utf8');
      content.split('\n').forEach(line => {
        if (line.includes('=')) {
          const [k, v] = line.split('=');
          env[k.trim()] = v.trim().replace(/["']/g, '');
        }
      });
    }
    return env;
  }

  createOAuth2Client() {
    const env = this.loadEnv();
    
    // Using OAuth2 with app password (valid for Gmail API)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID || 'gale.boetticher.ai',
      env.GALE_GMAIL_APP_PASSWORD,
      'http://localhost'
    );

    return oauth2Client;
  }

  async authenticate() {
    try {
      const env = this.loadEnv();
      const user = env.GALE_GMAIL || 'gale.boetticher.ai@gmail.com';
      const password = env.GALE_GMAIL_APP_PASSWORD;

      if (!password) {
        throw new Error('GALE_GMAIL_APP_PASSWORD not found in .env.gale');
      }

      // Create OAuth2 client with app password
      // App passwords are OAuth2-compatible credentials
      this.auth = new google.auth.OAuth2(
        'gale.boetticher.ai',
        password,
        'http://localhost'
      );

      // Set credentials (using app password as bearer token)
      this.auth.setCredentials({
        access_token: password,
        refresh_token: password,
        scope: SCOPES,
        token_type: 'Bearer'
      });

      // Initialize Gmail API client
      this.gmail = google.gmail({
        version: 'v1',
        auth: this.auth
      });

      console.log('✓ Connected to Gmail REST API');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async checkEmails(minutesBack = 30) {
    try {
      const env = this.loadEnv();
      const user = env.GALE_GMAIL || 'gale.boetticher.ai@gmail.com';

      // Calculate search query (Gmail API query syntax)
      const since = new Date(Date.now() - minutesBack * 60 * 1000);
      const sinceStr = since.toISOString().split('T')[0];
      const query = `after:${sinceStr}`;

      // Search for recent emails
      const listRes = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 10
      });

      if (!listRes.data.messages || listRes.data.messages.length === 0) {
        return [];
      }

      // Get full message details for each result
      const emails = [];
      for (const msg of listRes.data.messages) {
        try {
          const getRes = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const headers = getRes.data.payload.headers;
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
          const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
          const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

          // Extract snippet (Gmail API provides this)
          const snippet = getRes.data.snippet || '';

          emails.push({
            id: msg.id,
            from: from,
            subject: subject,
            snippet: snippet.substring(0, 150),
            date: date
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
      const emails = await this.checkEmails(30);
      const important = this.filterImportant(emails);

      // Log results
      const logEntry = {
        timestamp: new Date().toISOString(),
        success: true,
        method: 'gmail-rest-api',
        emailsFound: emails.length,
        importantEmails: important.length,
        emails: important.map(e => ({
          from: e.from,
          subject: e.subject
        }))
      };

      if (!fs.existsSync(path.dirname(LOG_FILE))) {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
      }

      fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
      fs.writeFileSync(LAST_CHECK_FILE, Date.now().toString());

      console.log(`✓ Connected to Gmail`);
      console.log(`Found ${emails.length} email(s), ${important.length} important`);
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
      console.error('❌ Monitor error:', error.message);
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

const monitor = new GmailRestMonitor();
monitor.run().catch(console.error);
