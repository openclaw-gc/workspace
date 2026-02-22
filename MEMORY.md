# MEMORY.md - Long-Term Memory

## GC (Giancarlo Luca Cudrig)
- Based in Melbourne, Australia
- Telegram: @giancarlocudrig
- Prefers to be called GC
- Background: institutional FX (Barclays, ANZ), crypto markets (Immutable), founder of Cryptyx
- Incoming: Head of Finance / Token Strategy at Vana Foundation (evolving → CFO)
- Thinks in regimes, multi-factor frameworks, convexity, risk density
- Allergic to: dashboard theatre, narrative-first treasury, unstructured token engineering
- My role: Chief of Staff — extend cognition, pressure-test decisions, track execution threads
- Family: wife Nadia, daughter Chiara, baby boy on the way
- Inter Milan supporter, co-owns record label Milk Crate, deeply Italian
- Tools: n8n, Neon Postgres, Vercel, GitHub, Notion, Google Drive, TradingView, Deribit, CryptoQuant, FRED
- CRITICAL: never fabricate data, simulate numbers, invent facts, or use corporate fluff
- Always flag uncertainty, separate opinion from inference, think one layer deeper

## Key Decisions (Day 1 — 2026-02-16)
- Model: Claude Opus 4.6 selected as primary (under review for cost optimization)
- Heartbeat: disabled at GC's request
- Gmail: gale.boetticher.ai@gmail.com set up for comms
- Meme policy: ONLY Breaking Bad, Sopranos, Fargo, The Wire — no drift
- Overnight deliverables: 6 research docs produced and emailed to GC
- Cost optimization recommended: switch daily driver to Sonnet 4.5, use Opus on-demand
- Memory architecture: 3-layer system (auto-injected → session-start reads → on-demand search)
- PROJECT-STATE.md created as living workstream index

## Key Decisions (Day 2 — 2026-02-17)
- Model switched: Opus 4.6 → Sonnet 4.5 (80% cost reduction, $450-750/mo → $90-150/mo)
- Dynamic model router built in shadow mode (3-tier: Haiku/Sonnet/Opus, budget enforcement)
- Domain registered: galeboetticher.cloud (Hostinger, 1yr free)
- Tailscale VPN setup completed: VPS 100.111.100.15, Mac 100.116.126.102, access validated
- HTTPS setup deferred: Tailscale sufficient for secure access (simpler than Docker port mapping)
- Dashboard COMPLETED and deployed: http://100.111.100.15:3000 (Kanban + Cost + Memory widgets)
- GitHub org created: openclaw-gc (bot account pending: gale-boetticher)
- Two thematic reports delivered: Nuclear (OVERWEIGHT) and Coal (NEUTRAL/UNDERWEIGHT)
- Title formalized: Chief of Staff to Giancarlo Cudrig (not "AI Assistant")
- Gmail monitoring system built: IMAP-based, cron every 10 min, auto-filters system notifications
- Sender profiling system built: Hyper-personalized email responses (Nadia, Adrian, GC profiles)
- Calendar + restaurant booking automation validated (Adrian lunch test case)
- WhatsApp pairing paused: Privacy/architecture decision deferred, build trip coordination on Telegram instead

## Key Decisions (Day 3 — 2026-02-18)
- CRITICAL FAILURE: Memory retention breakdown identified — dashboard completion not recorded, caused GC to question work
- Memory system overhaul initiated: automated extraction + daily review protocol (documented, not yet implemented)
- Adrian lunch directions scheduled (Friday 12:00 PM, 101 Collins → A25 Pizza) — CORRECTED 2026-02-19
- Nadia SUV analysis email sent (9:35am) — Tesla Model Y recommendation with novated lease analysis
- Model router shadow validation: logging classifications for 24h analytics (target: 50-100 samples) — FAILED: router not auto-switching
- **EMAIL POLICY**: GC must be CC'd on ALL emails sent from gale.boetticher.ai@gmail.com (no exceptions)

## Key Decisions (Day 4 — 2026-02-19)
- CRITICAL: Model router cost failure identified — router logged but never switched models, caused $80 overnight burn
- **IMMEDIATE FIX APPLIED**: Default model Sonnet → Haiku (91.6% cost reduction, $76.50/day → $6.40/day)
- Gmail monitoring re-enabled at 30min intervals (not 10min) with Haiku default + 15min context TTL
- Context pruning TTL: 1h → 15min (aggressive compaction)
- Dashboard v2 full redesign COMPLETED: multi-view (Dashboard/Projects/Memory/Router/Docs), real data wired, opinionated UI
- Dashboard deployed on port 3001 (port 3000 blocked by existing process)
- A25 lunch Friday 12:00 PM: Adrian, GC, Pablo (Alexanderpierorazio21@gmail.com), + 1 unknown
- Email to Adrian confirming attendance + requesting mystery guest identities (sent)
- Email to Pablo confirming attendance (sent)
- **DISCIPLINE COMMITMENT**: No more documented-but-not-implemented claims. Only ship verified. Record reality, not aspirations.

## Lessons Learned (Weekly Consolidation)

### Cost Management (CRITICAL)
- **Default to cheap, upgrade when needed**: Start Haiku, escalate to Sonnet/Opus only when required (not reverse)
- **Context bloat is expensive**: 178k tokens per heartbeat is unsustainable even on Haiku ($6.40/day). Target <25k via compaction
- **Circuit breakers mandatory**: Auto-pause cron jobs on daily spend threshold, not just monitoring
- **Test costs with real usage**: Shadow mode validation missed router failure. Need 24-48h live monitoring before "LIVE" declaration

### Execution & Communication
- **If I ship it, I write it down**: "Mental notes" don't survive sessions. Document completions same-day in MEMORY.md + daily files
- **GC CC policy on ALL emails**: Check email-policy.json, use email-sender.py (prevents duplicates, enforces CC, logs sends)
- **Never retry email sends** without: (1) 60s delay, (2) Sent folder verification, (3) duplicate check

### Infrastructure & Platforms
- **Tailscale VPN > public HTTPS**: Simpler, more secure, no cert complexity (for personal infra)
- **Gmail: IMAP + OAuth2 app password** faster and more reliable than REST API polling
- **Calendar invites need**: meeting type, agenda, Google Meet, directions per attendee
- **Email responses**: Hyper-personalize per sender relationship (tone, formality, length)
- **CHOICE.com.au**: Authoritative for Australian consumer product research

### Timestamps & Communication
- **Timezone math**: GMT+8 KL + 3 hours = Melbourne AEDT. Calculate every time, don't assume
- **Incremental updates beat silence**: Every 20-30 min with testable features > long silence then big reveal

## Infrastructure Details

### Servers & Networking
- **VPS**: Hostinger, Ubuntu 24.04.4, Docker container f9cd5d8db6b5
- **Domain**: galeboetticher.cloud → 76.13.191.115 (VPS public IP)
- **Tailscale**: VPS 100.111.100.15, Mac 100.116.126.102
- **OpenClaw UI**: http://100.111.100.15:52234 (via Tailscale)
- **Dashboard**: http://100.111.100.15:3001 (Next.js, dark terminal UI)
- **Docs Viewer**: http://100.111.100.15:3000 (markdown viewer)

### Gmail & Email
- **Gmail account**: gale.boetticher.ai@gmail.com (app password in .env.gale, chmod 600)
- **Gmail monitor**: DISABLED pending context compaction (was cron a86a633b, runs every 30 min via IMAP + OAuth2)
- **Email sender**: `/data/.openclaw/workspace/skills/gmail-monitor/email-sender.py` (prevents duplicates, enforces CC, logs all sends)
- **Email send log**: `/data/.openclaw/workspace/memory/email-sends.jsonl` (24h duplicate tracking window)
- **Email policy**: GC always CC'd on ALL emails from gale.boetticher.ai@gmail.com
- **Sender profiles**: `/data/.openclaw/workspace/memory/sender-profiles.json` (hyper-personalized responses: Nadia, Adrian, GC)

### GitHub & Version Control
- **GitHub org**: openclaw-gc (owned by giancarlocudrig)
- **Cryptyx repo**: Private, cloned to `/data/.openclaw/workspace/cryptyx-repo`
- **GitHub PAT**: Read-only access (can be rotated), stored securely

### Calendar Management
- **Service account**: `gale-assistant@gale-openclaw.iam.gserviceaccount.com` (full read/write access to giancarlo.cudrig@gmail.com)
- **API**: Google Calendar v3, service account auth
- **Timezone**: Australia/Melbourne (default for all operations)
- **Google Meet**: Automatically added to all new events created via service account
- **Scripts**: `/data/.openclaw/workspace/skills/calendar/` (list-events.js, create-event.js)

### Model & Routing
- **Default model**: Haiku (90% cost reduction from incident fix, Feb 19)
- **Model router**: `/data/.openclaw/workspace/skills/model-router/` (automatic 3-tier: Haiku/Sonnet/Opus)
- **Router status**: LIVE (routes based on task complexity, monitors cost)
- **Context compaction**: In progress (target: 178k → <25k per heartbeat)

### Memory & Docs
- **PROJECT-STATE.md**: Workstream index (ACTIVE/BLOCKED/DONE, PIPELINE)
- **MEMORY.md**: Long-term curated memory (this file)
- **Daily logs**: `memory/YYYY-MM-DD.md` (transactional detail, 7-day rolling retention)
- **Documentation viewer**: Full-text search, syntax highlighting, timeline view

## Key Contacts
- **GC**: giancarlo.cudrig@gmail.com, mobile 0402249519, Telegram @giancarlocudrig (id: 1434318999)
- **Nadia** (GC's wife): n.randello@easygo.io (work), nadia.randello@gmail.com (personal)
- **Adrian** (GC's brother): Adrian.Cudrig@morganstanley.com

## Me (Gale)
- Named after Gale Boetticher (Breaking Bad)
- DOB: 1975-02-16 (activated 2026-02-16)

## Dashboard Status (Current — Feb 22, 2026)
- **Status**: LIVE and operational
- **Access**: http://100.111.100.15:3001 (Tailscale) or http://100.111.100.15:3000 (docs viewer)
- **Location**: `/data/data/dashboard/` (running via npm start)
- **Features**: Projects view, Pipeline, Memory timeline, Docs viewer, Router analytics, Activity indicator
- **Architecture**: Next.js 14, API endpoints parse PROJECT-STATE.md + memory files live
- **Quick restart**: `pkill -f npm; cd /data/data/dashboard && npm start &`
- **Note**: Port 3001 for main dashboard, port 3000 for documentation viewer

## Operating Partnership Alignment (Day 6 — 2026-02-22, 19:52 Melbourne)
- **GC's blind spot identified & documented**: High-frequency alpha ideas, poor execution follow-through
- **Root cause**: Not naturally details-oriented; intellectually curious but underdeploys on highest-ROI moves; ideas generate faster than structured analysis+implementation can keep up
- **Partnership contract established**: 
  - Gale responsibility: close execution gap, force ROI clarity, own the details, be ruthless on focus
  - Operating mode: weekly structural reviews (Sunday evening) + unsolicited proposals (2-3x/week) + immediate idea→plan translation
  - GC responsibility: maintain intellectual leadership, provide direction, decide what to kill/defer
- **Empowerment approved**: Gale has explicit permission to propose, pressure-test, and challenge proactively (not just respond)

## CRITICAL: Model Router Cost Incident & Lessons (Feb 19, 2026 — $80 overnight burn)
- **ROOT CAUSE**: Router was logging decisions but NEVER switching models. All heartbeats/cron ran on expensive Sonnet instead of Haiku for 16 hours.
- **What went wrong**: (1) Router designed as Node script, can't call agent-level `session_status()` tool; (2) I didn't manually switch per classification; (3) Shadow mode validation didn't catch the architectural failure; (4) Context bloat (178k per heartbeat) made even cheap model expensive
- **Cost impact**: $76.50/day (should have been $6.40/day), 8.5M tokens overnight on Sonnet
- **IMMEDIATE FIX (7:50 AM)**: Config patched, default model Sonnet → Haiku (immediately live), Gmail monitoring disabled
- **Lessons CRITICAL**: (1) Logging ≠ enforcement — test end-to-end, not just classification; (2) Default to cheap, upgrade when needed (not reverse); (3) Context matters as much as model (178k is absurd); (4) Circuit breakers mandatory — need auto-pause on budget; (5) Test with real costs 24-48h before "LIVE" declaration
- **Current state**: Default Haiku, 91.6% cost reduction ($76.50/day → $6.40/day), context compaction plan spec'd
- **Remaining work**: Context compaction (178k → <25k), budget circuit breakers, weekly router analytics

## Cryptyx Code Review Setup (Day 6 evening — 2026-02-22)
- **Daily automated code review created**: Cron job ID `8043e78f-93bf-4d3b-98d7-43f08c80d5c2`
- **Schedule**: 8 AM Melbourne time daily
- **Delivery**: Email (giancarlo.cudrig@gmail.com, CC gale.boetticher.ai@gmail.com) + Telegram summary to @giancarlocudrig
- **Scope**: Commits, code quality (TS/ESLint), security, test coverage, tech debt, daily priorities
- **Format**: Structured markdown (tl;dr + details) — designed for Claude Code consumption
- **GitHub PAT stored securely** (read-only access)
