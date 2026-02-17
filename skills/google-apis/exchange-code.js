#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-oauth-client.json');
const TOKEN_PATH = path.join(__dirname, '../../.credentials/google-tokens.json');

const code = process.argv[2];

if (!code) {
  console.error('Usage: node exchange-code.js <authorization_code>');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_id, client_secret, redirect_uris } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

(async () => {
  try {
    console.log('🔄 Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    fs.chmodSync(TOKEN_PATH, 0o600);
    
    console.log('✅ Tokens saved!');
    console.log(`   Path: ${TOKEN_PATH}`);
    console.log('\n🎉 Google APIs are now authorized!\n');
    
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
})();
