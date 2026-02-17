# Memory Architecture Strategy

## Current State

### Files
| File | Purpose | Status |
|------|---------|--------|
| `MEMORY.md` | Long-term curated memory | ✅ Exists, sparse (~20 lines) |
| `memory/2026-02-16.md` | Daily log (day 1) | ✅ Exists, good detail |
| `memory/gc-insights-profile.md` | GC's Insights Discovery profile | ✅ Exists |
| `memory/security-audit-2026-02-16.md` | Security audit results | ✅ Exists |
| `memory/vana-jd.docx` | Vana JD (garbled) | ⚠️ Needs re-extraction |

### How Context Loads Today
Every session, the system injects:
1. `AGENTS.md` — operating instructions
2. `SOUL.md` — personality
3. `USER.md` — GC's profile
4. `HEARTBEAT.md` — periodic task list
5. `MEMORY.md` — long-term memory
6. `IDENTITY.md`, `TOOLS.md` — metadata

**Total injected workspace context**: ~8-10k tokens before any conversation happens.

### What's NOT Loaded Automatically
- `memory/*.md` daily files — must be read manually each session
- Deliverables — only loaded on demand
- Project-specific context

## Problems to Solve

1. **Continuity gap**: Daily files aren't auto-loaded. If I don't read them, I lose yesterday's context.
2. **MEMORY.md is too thin**: Only has GC's profile. Should contain decisions, project state, lessons learned.
3. **No project state tracking**: Where are we on each workstream? What's blocked? What's next?
4. **No structured retrieval**: `memory_search` exists but only works if content is written well.
5. **Token efficiency**: Loading full USER.md every session (~2k tokens) when most of it never changes.

## Architecture

### Layer 1: Auto-Injected (workspace context files)
These load every session automatically. Keep them **lean**.

- **MEMORY.md** — curated long-term memory. Key decisions, preferences, lessons, relationship context. Target: <2k tokens.
- **SOUL.md** — personality (stable, rarely changes)
- **USER.md** — GC profile (stable, rarely changes)
- **AGENTS.md** — operating instructions (stable)

### Layer 2: Session-Start Reads (I do this myself)
First thing every session, I read:

- `memory/YYYY-MM-DD.md` (today)
- `memory/YYYY-MM-DD.md` (yesterday)
- `memory/PROJECT-STATE.md` (new — see below)

### Layer 3: On-Demand Retrieval
Use `memory_search` + `memory_get` for:

- Historical daily logs
- Deliverable content
- Specific past decisions
- GC profile details (Insights, etc.)

### New File: `memory/PROJECT-STATE.md`

A living document tracking active workstreams. Updated at end of each working session.

```markdown
# PROJECT STATE

## Active Workstreams
### Vana Foundation Onboarding
- Status: Pre-start, researching
- Blocked: Awaiting GC decisions on 6 key items from overnight email
- Next: Begin Phase 1 access setup once decisions received
- Key files: deliverables/03-vana-research.md

### Dashboard MVP
- Status: Planning
- Blocked: Platform decision (Next.js recommended)
- Next: GC to confirm platform choice
- Key files: deliverables/04-dashboard-plan.md

### Infrastructure
- Status: Partially complete
- Open items: HTTPS setup (needs domain), OpenClaw update to v2026.2.15
- Key files: deliverables/02-access-action-plan.md

### Cryptyx
- Status: Dormant (Vana onboarding takes priority)
- Next: Revisit after Vana Phase 1 settled
```

### Memory Maintenance Protocol

**Daily** (end of each working session):
- Update `memory/YYYY-MM-DD.md` with day's events
- Update `memory/PROJECT-STATE.md` with any status changes

**Weekly** (during a heartbeat or quiet moment):
- Review past week's daily files
- Distill key learnings/decisions into `MEMORY.md`
- Archive or prune stale project state entries

**On significant events**:
- Major decisions → `MEMORY.md` immediately
- New project/workstream → add to `PROJECT-STATE.md`
- Lessons learned → `MEMORY.md`

## Speed Optimization

### Problem
Each interaction has latency from:
1. System prompt + workspace files injection (~10k tokens)
2. Conversation history
3. Tool calls (memory_search, file reads)

### Solutions
1. **Keep MEMORY.md lean** — curated, not comprehensive. Details live in daily files.
2. **PROJECT-STATE.md as index** — one file tells me where everything is, no searching.
3. **Use memory_search sparingly** — only for historical lookups, not routine context.
4. **Sub-agents for heavy work** — long research/writing tasks in isolated sessions keep main session context clean.
5. **Aggressive compaction** — current safeguard mode is fine; context pruning at 1h TTL helps.

## Immediate Actions

1. Create `memory/PROJECT-STATE.md` with current workstream status
2. Flesh out `MEMORY.md` with key decisions from Day 1
3. Establish the daily update habit starting today
