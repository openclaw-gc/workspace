#!/usr/bin/env node

/**
 * Google APIs First-Time Authorization
 * Runs OAuth flow to get refresh token
 */

const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-oauth-client.json');
const TOKEN_PATH = path.join(__dirname, '../../.credentials/google-tokens.json');

// Scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/contacts.readonly',
];

async function authorize() {
  console.log('🔐 Starting OAuth authorization flow...\n');
  
  // Check if credentials exist
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ OAuth client credentials not found!');
    console.error(`Expected at: ${CREDENTIALS_PATH}`);
    console.error('\nPlease complete GCP console setup and upload credentials.');
    process.exit(1);
  }
  
  // Check if we already have tokens
  if (fs.existsSync(TOKEN_PATH)) {
    console.log('ℹ️  Existing tokens found. Loading...');
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    
    const oauth2Client = new google.auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0]
    );
    
    oauth2Client.setCredentials(tokens);
    
    console.log('✅ Tokens loaded successfully!\n');
    return oauth2Client;
  }
  
  // Run OAuth flow
  console.log('🌐 Opening browser for authorization...');
  console.log('Please sign in and grant permissions.\n');
  
  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  
  // Save tokens
  const tokens = client.credentials;
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  fs.chmodSync(TOKEN_PATH, 0o600);
  
  console.log('\n✅ Authorization complete!');
  console.log(`Tokens saved to: ${TOKEN_PATH}`);
  
  return client;
}

// Run if called directly
if (require.main === module) {
  authorize()
    .then(() => {
      console.log('\n✅ All set! You can now use Google APIs.');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Authorization failed:', err.message);
      process.exit(1);
    });
}

module.exports = { authorize };
