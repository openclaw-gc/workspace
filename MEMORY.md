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
- Dashboard pivot: Kanban task tracker Phase 1 (reads PROJECT-STATE.md), cost tracker as widget
- GitHub org created: openclaw-gc (bot account pending: gale-boetticher)
- Two thematic reports delivered: Nuclear (OVERWEIGHT) and Coal (NEUTRAL/UNDERWEIGHT)
- Title formalized: Chief of Staff to Giancarlo Cudrig (not "AI Assistant")
- Gmail monitoring system built: IMAP-based, cron every 10 min, auto-filters system notifications
- Sender profiling system built: Hyper-personalized email responses (Nadia, Adrian, GC profiles)
- Calendar + restaurant booking automation validated (Adrian lunch test case)
- WhatsApp pairing paused: Privacy/architecture decision deferred, build trip coordination on Telegram instead

## Lessons Learned
- OpenAI billing limits can block image gen AND whisper transcription — monitor balance
- Web fetch can be unreliable — have fallback approaches ready
- Vana JD .docx was garbled when saved — need proper extraction tooling for Office docs
- Docker port mapping: Only 52234 exposed on host (not 18789) — check with `ss -tlnp` on host
- Tailscale VPN > public HTTPS for personal infra: simpler, more secure, no certificate complexity
- Dashboard approach: Start with what's immediately useful (task tracker) not what's impressive (complex analytics)
- Calendar invites need: meeting type, agenda, Google Meet option, directions for each party
- Email responses must be hyper-personalized based on sender relationship (tone/length/formality)
- System notifications (calendar, delivery confirmations) should be auto-filtered from email monitoring
- CHOICE.com.au is authoritative source for Australian consumer product research

## Infrastructure Details
- **VPS**: Hostinger, Ubuntu 24.04.4, Docker container f9cd5d8db6b5
- **Domain**: galeboetticher.cloud → 76.13.191.115 (VPS public IP)
- **Tailscale**: VPS 100.111.100.15, Mac 100.116.126.102
- **OpenClaw UI**: http://100.111.100.15:52234 (via Tailscale), auth token in config
- **GitHub org**: openclaw-gc (owned by giancarlocudrig)
- **Gmail**: gale.boetticher.ai@gmail.com (app password in .env.gale, chmod 600)
- **Gmail monitor**: Cron job a86a633b-700a-4b69-a43b-e59eed18e506, runs every 10 min (600000ms)
- **Email queue**: /data/.openclaw/workspace/memory/email-queue.json
- **Sender profiles**: /data/.openclaw/workspace/memory/sender-profiles.json (Nadia, Adrian, GC)
- **Model router**: /data/.openclaw/workspace/skills/model-router/ (shadow mode active)
- **Memory files**: PROJECT-STATE.md (workstream index), memory/YYYY-MM-DD.md (daily logs)

## Key Contacts
- **GC**: giancarlo.cudrig@gmail.com, mobile 0402249519, Telegram @giancarlocudrig (id: 1434318999)
- **Nadia** (GC's wife): n.randello@easygo.io (work), nadia.randello@gmail.com (personal)
- **Adrian** (GC's brother): Adrian.Cudrig@morganstanley.com

## Me (Gale)
- Named after Gale Boetticher (Breaking Bad)
- DOB: 1975-02-16 (activated 2026-02-16)
