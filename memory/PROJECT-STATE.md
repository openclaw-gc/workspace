# PROJECT STATE
*Last updated: 2026-02-17*

## Active Workstreams

### Vana Foundation Onboarding
- **Status:** Pre-start, research complete
- **Blocked:** Awaiting GC decisions on 6 key items (domain, GitHub, dashboard platform, Vana portal priorities, assistant network, agentic trading)
- **Next:** Begin Phase 1 access setup once decisions received
- **Key files:** `deliverables/03-vana-research.md`

### Dashboard MVP
- **Status:** Planning
- **Blocked:** Platform decision (Next.js 14 + Vercel recommended)
- **Next:** GC to confirm platform choice
- **Key files:** `deliverables/04-dashboard-plan.md`

### Infrastructure (OpenClaw/VPS)
- **Status:** Operational, partially hardened
- **Open:**
  - HTTPS setup — needs domain from GC → then reverse proxy + SSL
  - OpenClaw update v2026.2.12 → v2026.2.15 — needs GC approval
  - `allowInsecureAuth: true` — temporary, remove after HTTPS
  - OpenAI billing limit reached — GC topping up
- **Key files:** `deliverables/02-access-action-plan.md`, `memory/security-audit-2026-02-16.md`

### Agentic Trading Architecture
- **Status:** Research complete, awaiting green-light
- **Key files:** `deliverables/06-agentic-trading-plan.md`

### AI Assistant Networking
- **Status:** Research complete, awaiting decision
- **Key files:** `deliverables/05-ai-assistant-networking.md`

### Cryptyx
- **Status:** Dormant (Vana onboarding priority)
- **Next:** Revisit after Vana Phase 1 settled

### Model Cost Optimization
- **Status:** ✅ Phase 1 complete (switched to Sonnet 4.5)
- **Status:** ✅ Phase 2 complete (dynamic router built, shadow mode ready)
- **Next:** Shadow testing → tuning → enforcement
- **Key files:** `deliverables/07-model-cost-optimization.md`, `specs/dynamic-model-router.md`, `skills/model-router/`

### Gmail Monitoring & Sender Profiling
- **Status:** ✅ Phase 1 complete (monitoring + cron), ✅ Profiling system built
- **Operational:** Gmail monitor running every 10 min (cron job active)
- **Next:** Integrate profiler into monitor.js for hyper-personalized responses
- **Key files:** 
  - `skills/gmail-monitor/monitor.js` (IMAP monitoring)
  - `skills/gmail-monitor/profiler.js` (sender profiling)
  - `memory/sender-profiles.json` (Nadia, Adrian, GC profiles)
  - `deliverables/12-sender-profiling-system.md`

### Thematic Research (Ad-Hoc)
- **Nuclear Energy Report:** ✅ Complete — OVERWEIGHT recommendation, emailed to GC
- **Coal Energy Report:** ✅ Complete — NEUTRAL/UNDERWEIGHT, contrarian met coal angle, emailed to GC

## Pending GC Decisions
1. Domain/subdomain for HTTPS
2. GitHub approach (new org vs existing)
3. Dashboard platform confirmation
4. Vana portal MVP priorities
5. Assistant network — when to start
6. Agentic trading — green-light
7. ~~Model switch to Sonnet 4.5~~ ✅ DONE
