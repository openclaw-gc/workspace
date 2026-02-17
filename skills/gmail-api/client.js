/**
 * Gmail API Client Helper
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, '../../.credentials/google-tokens.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../.credentials/google-oauth-client.json');

async function getGmailClient() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('Google tokens not found. Run authorization first.');
  }
  
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Google OAuth credentials not found.');
  }
  
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  oauth2Client.setCredentials(tokens);
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

function parseMessage(message) {
  const headers = message.payload.headers;
  
  const getHeader = (name) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
  };
  
  let body = '';
  
  if (message.payload.body.data) {
    body = decodeBase64(message.payload.body.data);
  } else if (message.payload.parts) {
    // Multipart message
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = decodeBase64(part.body.data);
        break;
      }
    }
  }
  
  return {
    id: message.id,
    threadId: message.threadId,
    from: getHeader('From'),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    body: body.substring(0, 500), // Truncate for preview
    snippet: message.snippet,
    labelIds: message.labelIds || [],
  };
}

module.exports = {
  getGmailClient,
  parseMessage,
  decodeBase64,
};
