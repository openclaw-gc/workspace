#!/usr/bin/env node

/**
 * Manual OAuth Authorization (for headless environments)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-oauth-client.json');
const TOKEN_PATH = path.join(__dirname, '../../.credentials/google-tokens.json');

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
  console.log('🔐 Manual OAuth Authorization\n');
  
  // Load credentials
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('📋 Step 1: Visit this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n📋 Step 2: Sign in and authorize access');
  console.log('📋 Step 3: You\'ll see a code or be redirected to localhost');
  console.log('📋 Step 4: Copy the authorization code and paste it below\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Enter the authorization code: ', async (code) => {
    rl.close();
    
    try {
      console.log('\n🔄 Exchanging code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      // Save tokens
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      fs.chmodSync(TOKEN_PATH, 0o600);
      
      console.log('✅ Authorization complete!');
      console.log(`   Tokens saved to: ${TOKEN_PATH}\n`);
      console.log('🎉 Google APIs are now ready to use!\n');
      
    } catch (err) {
      console.error('❌ Failed to get tokens:', err.message);
      process.exit(1);
    }
  });
}

authorize();
