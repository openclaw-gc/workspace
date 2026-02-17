# Google APIs Setup - Step-by-Step Instructions for GC

## Part 1: Google Cloud Console Setup (YOU DO THIS)

### Step 1: Create GCP Project

1. Go to: https://console.cloud.google.com/
2. Sign in with: **gale.boetticher.ai@gmail.com**
3. Click dropdown at top (next to "Google Cloud")
4. Click **"New Project"**
5. Project name: `gale-openclaw`
6. Click **"Create"**
7. Wait for project creation (30 seconds)
8. Select the new project from dropdown

### Step 2: Enable APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable each (click "Enable"):
   - **Gmail API**
   - **Google Calendar API**
   - **Google Drive API**
   - **Google Sheets API**
   - **Google Tasks API**
   - **People API**

(Takes ~2 minutes total, just search and click Enable for each)

### Step 3: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose **"External"** (unless you have Workspace)
3. Click **"Create"**
4. Fill in:
   - **App name**: Gale OpenClaw
   - **User support email**: gale.boetticher.ai@gmail.com
   - **Developer contact**: gale.boetticher.ai@gmail.com
5. Click **"Save and Continue"**
6. **Scopes** page: Click "Add or Remove Scopes"
   - Search and add:
     - `.../auth/gmail.modify`
     - `.../auth/gmail.send`
     - `.../auth/calendar`
     - `.../auth/drive.file`
     - `.../auth/spreadsheets`
     - `.../auth/tasks`
     - `.../auth/contacts.readonly`
   - Click **"Update"** → **"Save and Continue"**
7. **Test users** page: Add `gale.boetticher.ai@gmail.com`
8. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Desktop app"**
4. Name: `Gale OpenClaw Desktop`
5. Click **"Create"**
6. **Download JSON** (button on right)
7. Save file as: `google-oauth-client.json`
8. **Send me this file via OpenClaw web UI** (don't paste in Telegram)

### Step 5: Create Service Account (Optional but Recommended)

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"+ Create Service Account"**
3. Name: `gale-bot`
4. ID: `gale-bot@gale-openclaw.iam.gserviceaccount.com`
5. Click **"Create and Continue"**
6. Grant role: **"Editor"** (or just the APIs you enabled)
7. Click **"Continue"** → **"Done"**
8. Click on the service account email
9. Go to **"Keys"** tab
10. Click **"Add Key"** → **"Create new key"**
11. Choose **"JSON"**
12. Click **"Create"**
13. Save file as: `google-service-account.json`
14. **Send me this file via OpenClaw web UI**

---

## Part 2: I'll Handle the Rest (GALE DOES THIS)

Once you send me those 2 JSON files:

1. I'll store them securely in `/data/.openclaw/workspace/.credentials/`
2. Run OAuth authorization flow
3. Test all APIs
4. Migrate Gmail monitor from IMAP → Gmail API
5. Build Calendar skill
6. Build Sheets integration for dashboard
7. Document everything in SKILL.md

**Total time for you:** ~10 minutes  
**What I need:** The 2 JSON credential files (via web UI, not Telegram)

---

## Quick Reference Links

- GCP Console: https://console.cloud.google.com/
- API Library: https://console.cloud.google.com/apis/library
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent

---

**When ready:** Upload the JSON files to OpenClaw web UI and ping me.
