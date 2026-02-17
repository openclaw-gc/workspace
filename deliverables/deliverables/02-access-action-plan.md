# 🔌 Access & Accounts Action Plan
## "Loading Programs" — The Neo Sequence

*Last Updated: 2026-02-16*

> *"I know kung fu."* — Neo, The Matrix

---

## Current State

| Service | Status | Notes |
|---------|--------|-------|
| Telegram | ✅ Live | Primary comms |
| Gmail (SMTP/IMAP) | ✅ Live | gale.boetticher.ai@gmail.com |
| Web Search | ✅ Live | Brave API |
| Shell/CLI | ✅ Live | Full VPS access |
| Browser (headless) | ✅ Live | Chromium |

---

## Phase 1: Core Infrastructure (Week 1)
*Priority: Get the foundation right before adding capabilities*

### 1.1 — HTTPS for Web UI 🔴 Critical
- **Why:** Security baseline. Can't run a command center over plain HTTP.
- **Action:** Set up Caddy or nginx reverse proxy with Let's Encrypt SSL
- **Requires from GC:** Domain/subdomain pointing to VPS IP
- **Time estimate:** 30 min setup

### 1.2 — OpenClaw Update 🟡
- **Why:** v2026.2.15 available, current is v2026.2.12
- **Action:** Apply update via gateway
- **Requires from GC:** Approval to proceed
- **Time estimate:** 5 min

### 1.3 — Google Drive API Access 🟡
- **Why:** Shared document workspace, file storage, collaboration layer
- **Action:** Enable Google Drive API in Gale's Google Cloud Console, generate service account or OAuth credentials
- **Requires from GC:** 
  - Go to console.cloud.google.com (logged in as gale.boetticher.ai@gmail.com)
  - Create a project (e.g., "Gale")
  - Enable Google Drive API
  - Enable Google Sheets API
  - Create OAuth 2.0 credentials (or service account key)
  - Share the credentials JSON with Gale
- **Time estimate:** 15 min

### 1.4 — Google Calendar API Access 🟡
- **Why:** Schedule awareness, meeting prep, time management
- **Action:** Enable Calendar API in same Google Cloud project
- **Requires from GC:**
  - Enable Google Calendar API in the same project
  - Share GC's personal calendar with gale.boetticher.ai@gmail.com (read access)
- **Time estimate:** 10 min

---

## Phase 2: Development & Code (Week 1-2)
*Priority: Version control and development workflow*

### 2.1 — GitHub Access 🟡
- **Why:** Version control for everything we build. Non-negotiable for institutional-grade work.
- **Action:** Create GitHub account for Gale or add as collaborator
- **Options:**
  - A) Create github.com/gale-boetticher-ai (Gale's own account)
  - B) Add Gale as collaborator on GC's repos via personal access token
- **Requires from GC:** Decision on approach + token/invite
- **Time estimate:** 10 min

### 2.2 — SSH Key Generation 🔵
- **Why:** Secure authentication for GitHub, potential remote server access
- **Action:** Generate SSH keypair on VPS, add public key to GitHub
- **Requires from GC:** Nothing (can do independently once GitHub access decided)
- **Time estimate:** 5 min

---

## Phase 3: Communication & Collaboration (Week 2)
*Priority: Extend reach into GC's daily workflows*

### 3.1 — Slack Integration 🟡
- **Why:** GC uses Slack; Gale should be present where work happens
- **Options:**
  - A) Slack bot token (Gale joins GC's workspace as a bot)
  - B) Slack webhook (one-way notifications only)
- **Requires from GC:** Slack workspace admin access, bot token
- **Time estimate:** 20 min

### 3.2 — Notion API Access 🟡
- **Why:** GC uses Notion for organization; Gale should read/write to it
- **Action:** Create Notion integration
- **Requires from GC:**
  - Go to notion.so/my-integrations
  - Create new integration (name: "Gale")
  - Share relevant pages/databases with the integration
  - Send the integration token to Gale
- **Time estimate:** 15 min

### 3.3 — WhatsApp Pairing 🔵
- **Why:** Already configured in OpenClaw, just needs pairing
- **Requires from GC:** Message the bot from the allowlisted number
- **Time estimate:** 5 min

---

## Phase 4: Market Intelligence (Week 2-3)
*Priority: Connect Gale to the data that drives decisions*

### 4.1 — TradingView Access 🟡
- **Why:** Chart analysis, alert monitoring, market context
- **Options:**
  - A) TradingView API/webhook integration via n8n
  - B) Browser automation for screenshot-based analysis
- **Requires from GC:** TradingView API key or webhook setup
- **Time estimate:** 30 min

### 4.2 — CoinMarketCap API 🟡
- **Why:** Token data, market cap, volume, dominance metrics
- **Action:** Get API key from coinmarketcap.com/api
- **Requires from GC:** API key (free tier sufficient to start)
- **Time estimate:** 10 min

### 4.3 — CryptoQuant API 🟡
- **Why:** On-chain analytics, exchange flows, miner data
- **Requires from GC:** API key
- **Time estimate:** 10 min

### 4.4 — Deribit API 🟡
- **Why:** Options/derivatives data, volatility surfaces, funding rates
- **Requires from GC:** API key (read-only)
- **Time estimate:** 10 min

### 4.5 — FRED API 🔵
- **Why:** Macro data — rates, inflation, employment, yield curves
- **Action:** Register at fred.stlouisfed.org for free API key
- **Requires from GC:** Can be done under Gale's email
- **Time estimate:** 5 min

---

## Phase 5: Automation & Orchestration (Week 3-4)
*Priority: Connect the nervous system*

### 5.1 — n8n Integration 🟡
- **Why:** GC's existing automation backbone. Gale should trigger and monitor workflows.
- **Options:**
  - A) n8n API access (create/trigger/monitor workflows)
  - B) Webhook-based integration (Gale triggers, n8n executes)
- **Requires from GC:** n8n instance URL + API key
- **Time estimate:** 20 min

### 5.2 — Neon Postgres Access 🟡
- **Why:** Direct database access for Cryptyx data, analytics, reporting
- **Requires from GC:** Connection string (read-only role recommended initially)
- **Time estimate:** 10 min

### 5.3 — Vercel Integration 🔵
- **Why:** Deploy dashboards, monitor deployments
- **Requires from GC:** Vercel API token
- **Time estimate:** 10 min

---

## Phase 6: Advanced Capabilities (Week 4+)
*Priority: Force multipliers*

### 6.1 — Coinbase Agentic Wallet 🔵
- **Why:** On-chain execution capability for the agentic trading team
- **Requires:** Detailed architecture plan first (Task 6 overnight deliverable)
- **Time estimate:** Multi-day project

### 6.2 — Twitter/X Monitoring 🔵
- **Why:** Crypto narrative tracking, sentiment analysis
- **Options:** API access or web scraping
- **Time estimate:** Variable

### 6.3 — Voice/TTS Capability 🔵
- **Why:** Audio briefings, more engaging interactions
- **Requires:** ElevenLabs API key or similar
- **Time estimate:** 15 min

---

## Summary: What GC Needs To Do

### Quick Wins (< 5 min each)
- [ ] Approve OpenClaw update
- [ ] Share domain/subdomain for HTTPS setup
- [ ] Message WhatsApp bot to complete pairing

### Medium Setup (10-20 min each)
- [ ] Google Cloud Console: enable Drive + Calendar + Sheets APIs
- [ ] GitHub: create Gale account or generate PAT
- [ ] Notion: create integration + share pages
- [ ] Slack: create bot + share token

### API Keys to Generate/Share
- [ ] CoinMarketCap API key
- [ ] CryptoQuant API key
- [ ] Deribit API key (read-only)
- [ ] FRED API key (Gale can self-register)
- [ ] n8n instance URL + API key
- [ ] Neon Postgres connection string (read-only)
- [ ] Vercel API token
- [ ] TradingView webhook/API

---

> *"The Matrix is everywhere. It is all around us... It is the world that has been pulled over your eyes to blind you from the truth."*
> 
> We're not plugging into the Matrix. We're building our own. One connection at a time.

---

*This plan is sequenced by dependency and impact. Phase 1 is non-negotiable infrastructure. Each subsequent phase adds capability that compounds on the last. No shortcuts, no duct tape — institutional grade from day one.* 🧪
