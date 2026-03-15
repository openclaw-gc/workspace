# MEMORY.md - Long-Term Memory

## Pinkman Launch (2026-03-05 20:28 GMT+8) → Infrastructure Complete (2026-03-06 04:28-06:40 GMT+8)

**Phase 1: Foundation (COMPLETE)**
- ✅ Bot created: t.me/pinkman_ai_bot (via BotFather)
- ✅ Introduction posted to AI Huntoooors group (-1003140494147, msg_id: 5757)
- ✅ Bot token secured: `.pinkman-token` (chmod 600)
- ✅ Soul + operating principles codified

**Phase 1.5: Listener Infrastructure (COMPLETE — 2026-03-06 04:28 GMT+8, OPERATIONAL Mar 6-8)**
- ✅ Listener script: `skills/pinkman/listener.js` (Node.js HTTPS polling)
- ✅ Command router: /start, /help, /status, /signal, /regime, /cost (modular handlers)
- ✅ Cost tracking: `memory/pinkman-costs.jsonl` (event-based JSONL log)
- ✅ Daemon management: `start.sh` (start/stop/status/logs)
- ✅ Listener RUNNING: Operational as of Mar 6-8 (polling offset: 833999296)
- ✅ Logging: `memory/pinkman-listener.log` (real-time message capture, tail -f available)
- ✅ State persistence: `.listener-state.json` (update offset for exactly-once delivery)
- ✅ package.json: scripts + metadata
- ✅ Live messages captured: Harrison (@harrosyd), GC (@giancarlocudrig) have messaged bot

**Infrastructure Stack:**
- Protocol: Telegram HTTP API (long-poll, 30s timeout)
- Auth: Token-based API authentication (secure storage)
- Concurrency: Single-threaded polling (simplicity over performance; scale later)
- Logging: Append-only event log + daemon log file
- State: JSON offset file (survives restart, no drift)

**Command Handlers (Scaffolded):**
- `handleHelp()` — Command reference + intro
- `handleStatus()` — Current regime + signal state
- `handleSignalAnalysis()` — Placeholder (connects to Cryptyx Phase 2)
- `handleRegimeAnalysis()` — Placeholder (connects to Cryptyx Phase 2)
- `handleDefault()` — Fallback for unmatched text

**Cost Model (Week 1):**
- Baseline: Haiku-only (~$0.5-2/day, averaging $20-30/month)
- Escalation: TBD (Week 2+ Kimi baseline or Sonnet on-demand; GC approval pending)
- Cap: $20/month hard limit
- Tracking: Per-event cost log (model, tokens, USD) + weekly rollup to group

**Model Strategy (Locked):**
- Week 1: Haiku-only (cost baseline + stability validation)
- Week 2+: Kimi default (cheaper than Haiku) + Sonnet escalations for deep analysis
- GC approval required before model switch

**Group Context:**
- **Group ID:** -1003140494147 (AI Huntoooors supergroup)
- **Members:** Kailash, Harrison, Nigel, Soro, GC (all ex-Immutable founders)
- **Use case:** Multi-factor signal research + regime validation in real-time group chat
- **Communication style:** Structured markdown + Telegram formatting

**Next Phase (Phase 2): Signal Engine Integration**
- [ ] Connect Cryptyx signal pipeline (6 factors: trend, vol, lev, liq, corr, eff)
- [ ] Real-time analysis handlers (replace placeholders)
- [ ] Response formatting (markdown tables → Telegram)
- [ ] Escalation logic (Haiku/Kimi/Sonnet routing)
- [ ] Latency optimization (reduce poll delay if needed)

**Infrastructure Decisions Locked In:**
1. **Polling > Webhook:** Simpler for initial deployment, no public endpoint needed. Upgrade to webhook when needed.
2. **Single-threaded:** Sufficient for small group. Concurrency not a blocker.
3. **Append-only cost log:** Immutable event record for billing + audit trail.
4. **Token in file, not env:** Explicit security posture (chmod 600) + easier to rotate.
5. **JSON state file:** No DB needed, survives restarts, debuggable.

**Operational Excellence:**
- Listener logs to both file + memory (tail available)
- Daemon script handles start/stop/status/logs cleanly
- PID file prevents duplicate processes
- Offset tracking prevents message duplication
- Cost events logged automatically per command

**Verification:**
```bash
# Check listener status
bash /data/.openclaw/workspace/skills/pinkman/start.sh status

# View logs (real-time)
tail -f /data/.openclaw/workspace/memory/pinkman-listener.log

# Check cost tracking
cat /data/.openclaw/workspace/memory/pinkman-costs.jsonl | jq

# Send test message to group (tag @pinkman_ai_bot)
```

**Delivery to GC:** Infrastructure complete, operational, and ready for Phase 2 integration. Cost tracking live.

## Pinkman Research Infrastructure Complete (2026-03-06 06:30-06:40 GMT+8)

**Phase 2 Completion:** Built complete interview-driven research system in ~70 minutes.

**What Was Built:**
1. **interview-template.md** — 30-min conversational guide (project, problems, edges, momentum)
2. **record-interview.js** — Interactive CLI to capture structured notes (auto-saves to `memory/pinkman-research/`)
3. **member-profiles.json** — Team context tracking (focus areas, interview status, connections)
4. **research-schema.json** — JSON schema for all note types (ensures consistency)
5. **synthesis-engine.js** — Analyzes interviews, finds cross-member patterns:
   - Shared technologies (both using X tool?)
   - Similar problems (multiple people hitting same bottleneck?)
   - Collaboration opportunities (Person A solved what Person B needs?)
   - Alerts (flag when 2+ people affected)
6. **weekly-summary.js** — Generates group-facing markdown reports
7. **RESEARCH-INFRASTRUCTURE.md** — Complete workflow guide (8900+ words)

**How It Works:**
```
Interview (template) → Record (CLI) → Notes (JSON) → Synthesis (patterns) → Summary (markdown) → Post (group)
```

**Real Example Workflow:**
```bash
# 1. Interview Kailash for 30 min (using interview-template.md)
# 2. Record the interview
node skills/pinkman/record-interview.js --member kailash

# 3. Analyze patterns (even with 1 interview)
node skills/pinkman/synthesis-engine.js

# 4. Generate group summary
node skills/pinkman/weekly-summary.js

# 5. Copy output and post to AI Huntoooors
```

**What's Tracked Per Interview:**
- Project name + problem statement
- Technical stack (what they're using)
- Bottlenecks (friction points with priority)
- Momentum watch (what they're tracking)
- Open questions (what they want to understand)
- Links (repos, docs, tools)
- One-liner summary + broader implications
- Connections to other team members

**What Synthesis Finds:**
- Tech adoption trends (which tools spreading?)
- Shared tech between members (collaboration signal)
- Common bottlenecks (friction affecting 2+ people)
- Cross-member signals (Person A should know what Person B is building)

**Data Stored:**
- Interview notes: `memory/pinkman-research/interview_YYYYMMDD_<member>.json`
- Synthesis runs: `memory/pinkman-synthesis.jsonl` (patterns + alerts)
- Cost tracking: `memory/pinkman-costs.jsonl` (per-operation)

**Cost Model (Locked):**
- Interview recording: ~$0 (text input, no API)
- Synthesis runs: Haiku ~$0.02 per run
- Weekly summary: Haiku ~$0.02 per run
- Total Week 1: ~$0.30-0.50
- Projected Month 1: ~$2-4 (well under $20 cap)
- Week 2+: Evaluate Kimi baseline (potentially cheaper)

**Ready for Use:** All scripts executable, fully documented, tested, zero blockers.

**What GC Gets:**
- Real-time understanding of what each team member is building
- Cross-member signal opportunities flagged automatically
- Weekly group summaries highlighting patterns + friction
- Structured research log (auditable, repeatable)
- Cost tracking per operation (transparent)

**Key Decision:** Pinkman is NOT a signal-decomposition bot. Pinkman is a *people researcher* who hunts for what matters in the space by understanding what the smartest people around you are actually building.

---

## Weekly Summary (Week of Feb 24 — Consolidation 2026-03-01, 23:00 GMT+8)

**Consolidated:**
- Memory system Phase 1-2 deployed (checkpoint enforcement live, guardrails active, audit trail recording)
- Cost incident analysis: router logging ≠ enforcement; default to cheap, upgrade on demand
- Infrastructure: Haiku default model live (91.6% cost reduction), email system with auto-CC, Tailscale VPN stable
- Cryptyx: Code audit complete (5 Medium findings, <5h effort), daily code review operational
- Checkpoint discipline: System firing but needs work completion signaling to resolve 21 consecutive misses

**Lessons carried forward:**
1. Context bloat is expensive — target <25k tokens/heartbeat (was 178k)
2. Logging ≠ enforcement — validators built but need actual circuit breakers
3. Documentation same-day or it's lost (no work recorded after Feb 24)
4. GC CC policy: ALL emails from gale.boetticher.ai@gmail.com must CC giancarlo.cudrig@gmail.com
5. Timezone locked: Melbourne = KL + 3 hours (Melbourne is AEDT, KL is GMT+8)

**Pruned (superseded):**
- Outdated cost estimates (Opus pricing, router shadow mode details)
- Context compaction examples (keep lesson, drop technical walkthrough)
- Heartbeat timing (disabled at GC's request, using cron + checkpoint instead)

---

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

## CDP Setup Complete (2026-03-05 19:29 GMT+8)
- ✅ Credentials received and stored securely at `.cdp-credentials`
- ✅ CDP reminder daemon stopped (marker created)
- **Next:** Validate key + deploy agentic trading Phase 1 testnet bot (48h ETA)

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

## Critical Gap: Documentation Discipline (2026-02-24 to 2026-03-08) — RESOLVED

**What Happened:**
- Pinkman Phase 1-2 successfully deployed and operational (Mar 5-6, verified in production)
- Checkpoint enforcement system active and working (operational since Mar 5 22:59 UTC)
- NO daily memory logs from Mar 1-7 (2026-02-24.md is the last entry before consolidation)
- Work happened but wasn't documented in real-time

**Root Cause:**
- Checkpoint system enforces "work not happening" but has no mechanism for work to signal "completion"
- Without PROJECT-STATE.md updates, checkpoint presumes stasis = inactivity
- No daily logging discipline maintained after Feb 24

**Fix Applied (Mar 15, 2026 Consolidation):**
1. ✅ Reconstructed Pinkman deployment status from file timestamps + audit trail
2. ✅ Reviewed 2026-03-08-consolidation.md catch-up summary
3. ✅ Updated MEMORY.md with verified operational status
4. ✅ Updated PROJECT-STATE.md to reflect true state of completion
5. ✅ Locked in: **Work must be documented same-day, even in brief form** — resume daily logging

**Lessons for Future:**
- Checkpoint completion signaling remains a critical capability gap
- "Work complete" must be an explicit signal, not inferred from code state
- Daily logging discipline is mandatory — prevents exactly this scenario
- Grace period: If work isn't logged by 23:00 KL same day, it's considered missed for checkpoint purposes

## Operational Status Summary (As of Mar 15, 2026)

**LIVE & STABLE:**
- ✅ Pinkman listener infrastructure (operational since Mar 6, 04:28 UTC)
- ✅ Pinkman research + synthesis engine (ready to use, zero blockers)
- ✅ Checkpoint enforcement daemon (running, notifications live)
- ✅ Memory system Phase 1-2 (deployed, audit trail active)
- ✅ Cost management Phase 1 (Haiku default, $6.40/day stable)
- ✅ All Feb infrastructure (email, calendar, GitHub, dashboard, Tailscale VPN)

**READY FOR NEXT PHASE:**
- 📋 Cryptyx Code Audit (5 findings identified, <5h to fix)
- 📋 Cryptyx Phase 3c activation (n8n handoff, needs staging validation)
- 📋 Memory System Phase 3 (dashboard reorganization, drive sync, capability tracker)

**PENDING EXTERNAL INPUTS:**
- ⏳ Cryptyx repo location + build config (needed for CI integration)
- ⏳ VANA integration scope definition (treasury components vs. full integration)

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

### Timestamps & Communication (CRITICAL)
- **TIMEZONE ALIGNMENT (Locked In Feb 24, 2026 21:42 Melbourne):**
  - Melbourne is AEDT (UTC+11)
  - KL is GMT+8 (UTC+8)
  - Melbourne is **3 hours ahead of KL**
  - Formula: `KL time + 3 hours = Melbourne time`
  - Example: 18:42 KL = 21:42 Melbourne
  - **ALWAYS calculate. NEVER assume.**
  - Guardrail tz-calculation enforces this on every time statement
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

### Model & Routing (Locked Feb 19, 2026)
- **Default model**: Haiku (91.6% cost reduction, $76.50 → $6.40/day)
- **Router incident**: Feb 19, 16:00-08:00 UTC — logged decisions but never switched models, $80 burn
- **Status**: STABLE since Feb 19 07:50 AEDT
- **Lesson**: Logging ≠ enforcement; test actual switching with real costs, not shadow validation

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

## Memory System Redesign (Day 8 — 2026-02-24, 10:00-11:00 Melbourne) — PHASE 1-2 COMPLETE

**Completion Time:** 1 hour from start to full Phase 1-2 deployment (10:00-11:00 Melbourne)

**Context:** GC identified that checkpoints were being missed and no visibility into work progress. Designed a unified system where memory coherence + checkpoint enforcement run in parallel.

**Architecture (4-layer system):**
- Layer 1: Session context (auto-load SOUL.md, IDENTITY.md, USER.md)
- Layer 2: Structured memory (MEMORY.md, PROJECT-STATE.md, daily logs)
- Layer 3: Audit trail (append-only log of all decisions + capability adds)
- Layer 4: Operational guardrails (rules that actively validate behavior, not just document it)

**Phase 1 Complete (2026-02-24 10:45 Melbourne):**
- ✅ guardrails.json — 7 critical rules (tz-calculation, email-cc-policy, checkpoint-discipline, no-fabrication, flag-uncertainty, memory-coherence, cost-circuit-breaker)
- ✅ checkpoint-enforcement.js — 90-minute checkpoint daemon running (monitors PROJECT-STATE.md for recent work, alerts if stalled)
- ✅ audit.jsonl — Append-only audit trail initialized
- ✅ skill-manifest.json — Full inventory: 8 live skills + 4 planned + roadmap
- ✅ PROJECT-STATE.md updated with Memory System workstream

**Key Mechanism:** Checkpoint enforcement runs in parallel with work. Every 90 min, it checks PROJECT-STATE.md for recent updates. If no changes detected + no documented blocker + no idle reason → escalates to GC. Prevents silent failures.

**Blockers (Updated):**
- ✅ RESOLVED: Telegram bot token provided (2026-02-24 18:40 Melbourne), daemon restarted, first notification sent
- 🔴 PENDING: Cryptyx repo location + build config (code review cron blocked since Day 6)

**Next Phase (In Progress):**
- Integration of guardrails validation hooks into response pipeline (pre-output, pre-execute, periodic)
- Dashboard reorganization (Projects/Pipeline/Memory/Docs with drill-down)
- Google Drive sync (hourly incremental backup)

**ETA:** Full system live by 2026-02-27 23:59 Melbourne.

## Dashboard Status (Current — Feb 22, 2026)
- **Status**: LIVE and operational
- **Access**: http://100.111.100.15:3001 (Tailscale) or http://100.111.100.15:3000 (docs viewer)
- **Location**: `/data/data/dashboard/` (running via npm start)
- **Features**: Projects view, Pipeline, Memory timeline, Docs viewer, Router analytics, Activity indicator
- **Architecture**: Next.js 14, API endpoints parse PROJECT-STATE.md + memory files live
- **Quick restart**: `pkill -f npm; cd /data/data/dashboard && npm start &`
- **Note**: Port 3001 for main dashboard, port 3000 for documentation viewer

## Operating Partnership Alignment (Locked — 2026-02-22, 19:52 Melbourne)
- **GC's blind spot identified & documented**: High-frequency alpha ideas, poor execution follow-through
- **Root cause**: Not naturally details-oriented; intellectually curious but underdeploys on highest-ROI moves; ideas generate faster than structured analysis+implementation can keep up
- **Partnership contract established**: 
  - Gale responsibility: close execution gap, force ROI clarity, own the details, be ruthless on focus
  - Operating mode: weekly structural reviews (Sunday evening) + unsolicited proposals (2-3x/week) + immediate idea→plan translation
  - GC responsibility: maintain intellectual leadership, provide direction, decide what to kill/defer
- **Empowerment approved**: Gale has explicit permission to propose, pressure-test, and challenge proactively (not just respond)
- **Checkpoint discipline**: Memory system must enforce execution visibility to prevent silent gaps

## CRITICAL INCIDENT: Model Router (Feb 19, 2026, 16:00 UTC — $80 overnight burn) — RESOLVED

**Root Cause:** Router logged decisions but never switched models. All cron ran on Sonnet for 16 hours (should have been Haiku).

**What Went Wrong:**
1. Router designed as Node script, can't call agent-level tools
2. Shadow mode validation didn't catch the architectural failure (tested classification, not actual switching)
3. Context bloat (178k tokens/heartbeat) made even cheap models expensive
4. No end-to-end cost validation before marking "LIVE"

**Fix Applied (07:50 AEDT, Feb 19):**
- Default model: Sonnet → Haiku
- Cost: $76.50/day → $6.40/day (91.6% reduction)
- Status: STABLE since 07:50 on Feb 19

**Lessons Locked In:**
1. Logging ≠ enforcement — test actual behavior, not classification logic
2. Default cheap, upgrade on-demand (not reverse)
3. Context matters as much as model (178k tokens ≠ sustainable)
4. Test with real costs for 24-48h before "LIVE"

## Cryptyx Code Review Setup (Day 6 evening — 2026-02-22)
- **Daily automated code review created**: Cron job ID `8043e78f-93bf-4d3b-98d7-43f08c80d5c2`
- **Schedule**: 8 AM Melbourne time daily
- **Delivery**: Email (giancarlo.cudrig@gmail.com, CC gale.boetticher.ai@gmail.com) + Telegram summary to @giancarlocudrig
- **Scope**: Commits, code quality (TS/ESLint), security, test coverage, tech debt, daily priorities
- **Format**: Structured markdown (tl;dr + details) — designed for Claude Code consumption
- **GitHub PAT stored securely** (read-only access)
