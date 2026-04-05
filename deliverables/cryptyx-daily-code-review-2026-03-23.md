# CRYPTYX — Daily Code Review
**Monday, March 23, 2026** | 8:00 AM Melbourne (00:00 UTC+1)

---

## 📊 TL;DR

**No commits since yesterday (March 22).** Codebase remains at last active state (Feb 27, 2026). 

**Code health status:**
- ✅ **Functionality:** Stable. Recent feature work (Treasury, SalesDesk, FundManager UI wiring) complete and merged.
- ⚠️ **Type safety:** 10 TypeScript errors (mostly missing type declarations for Anthropic SDK)
- ⚠️ **Linting:** 2 errors + 30 warnings (prefer-const violations, console statements, React Hook deps)
- 🔴 **Security:** 13 vulnerabilities (1 critical, 6 high, 6 moderate). Majority in Next.js dependencies.
- ❌ **Test coverage:** Zero. No test suite exists.
- 🏗️ **Tech debt:** Missing SDK installations, outdated dependencies, no auth wiring in research API.

**Next day priorities:** Security patch (npm audit fix), install missing dependencies, type declaration resolution.

---

## 📋 Commits Since Yesterday

**Count:** 0 new commits (March 22-23, 2026)

**Last activity:** February 27, 2026 at 22:51 UTC+11
- Commit: `0ddf2ce` — "feat: enrich Treasury, SalesDesk, FundManager with live data wiring (#140)"
- 3 files changed, 133 insertions(+) across FundManager, SalesDesk, TreasuryManager components

**Status:** Codebase in holding pattern. No active development since end of February. Likely awaiting new phase or external dependencies.

---

## 🔍 Code Quality Analysis

### TypeScript Type Safety

**Status:** 10 errors detected via `tsc --noEmit`

```
Error Count Breakdown:
  ├─ Cannot find module declarations: 3 errors
  │  ├─ @anthropic-ai/sdk (routes.ts, analysis-service.ts, claude-client.ts)
  │  └─ jspdf (ReportPreview.tsx)
  └─ Implicit 'any' types: 7 errors
     ├─ app/api/research/chat/route.ts: 2 params (b, b)
     ├─ app/api/research/tools.ts: 1 param
     ├─ services/agent/analysis-service.ts: 1 param (c)
     └─ services/agent/discovery-service.ts: 1 param (c)
```

**Root causes:**
1. **@anthropic-ai/sdk missing:** Package in package.json (v0.78.0) but not installed (`npm install` needed)
2. **jspdf missing:** Listed in dependencies, not installed
3. **Type annotations:** 7 parameters lack explicit type declarations

**Fix:** `npm install && npm install -D @types/node@latest`

---

### ESLint Violations

**Status:** 2 errors + 30 warnings

#### Errors (require fix):
```
2 prefer-const violations:
  ├─ services/agent/agent-pipeline.ts:147 — 'proposalsAutoApplied' 
  └─ services/api.ts:87 — 'cleanAssets'
  
Fix: Automatic via `npx eslint . --fix`
```

#### Warnings (30 total):
```
Console Statements: 13
  └─ Across admin routes, backfill pipelines, error boundary, db setup
  └─ Legitimate for logging but indicates no structured logging framework

React Hook Deps: 3
  ├─ MetricSlicer.tsx:238 — 'metrics' logic expression in useMemo deps
  ├─ useShare.ts:60, 75 — 'htmlToImageOptions' missing from useCallback deps
  └─ useAnalytics.ts:224 — ref cleanup pattern issue

Image Optimization: 1
  └─ TokenIcon.tsx:29 — Using <img> instead of next/image

Config/Style: 13
  └─ Mostly non-critical (Tailwind, autoprefixer, etc.)
```

**Severity:** Low-to-medium. Warnings do not block deployment. Console statements should migrate to structured logging (Winston, Pino) for production.

---

## 🔒 Security Scan

### npm audit Results

**Status:** 13 vulnerabilities detected
```
├─ Critical: 1
├─ High: 6
└─ Moderate: 6
```

#### By Package:

**Next.js (v14.2.35) — HIGH priority**
- **CVE:** Unbounded next/image disk cache growth (DoS)
- **CVE:** HTTP request smuggling in rewrites
- **CVE:** Insecure React Server Components deserialization (DoS)
- **CVE:** Image Optimizer remotePatterns DoS
- **Fix available:** next@16.2.1 (breaking change, requires `npm audit fix --force`)
- **Risk:** Production self-hosted instances vulnerable to disk exhaustion and request-level attacks

**minimatch (via glob, typescript-eslint) — HIGH priority**
```
├─ ReDoS via repeated wildcards (3 separate patterns documented)
├─ Nested *() extglobs catastrophic backtracking
├─ matchOne() combinatorial backtracking with GLOBSTAR
└─ Affects: node_modules/minimatch, node_modules/glob/node_modules/minimatch, node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch
```
- **Fix available:** `npm audit fix` automatically updates to patched version
- **Risk:** DOS on pattern matching operations (low probability in typical usage)

**Missing dependency audit:**
```
⚠️ MISSING (not installed):
├─ @anthropic-ai/sdk (v0.78.0) — declared, not in node_modules
├─ jspdf (v4.2.0) — declared, not in node_modules  
└─ resend (v6.9.2) — declared, not in node_modules
```
- **Impact:** Type errors + runtime failures if routes hit
- **Fix:** `npm install`

#### Recommended Remediation Path:

**Immediate (today):**
```bash
npm install                              # Install missing dependencies
npm audit fix                            # Patch minimatch + low-hanging fixes
```

**Short-term (this week):**
```bash
npm audit fix --force                    # Upgrade to next@16.2.1 + breaking deps
npm ls                                   # Validate tree consistency
npm run build                            # Full test build
```

**Medium-term (next sprint):**
- Evaluate Next.js 16 compatibility with React Query + Recharts
- Deprecate console.log → structured logging (Winston/Pino)
- Audit @neondatabase/serverless + pg for latest security patches

---

## 📊 Test Coverage

**Status:** ❌ Zero. No test infrastructure.

**Details:**
```
Test files found: 0 (in /app, /components, /services, /hooks, /lib)
Test runner: None configured in package.json
Test frameworks: None installed (no Jest, Vitest, Testing Library)
CI/CD testing: Not integrated (no .github/workflows for test runs)
```

**Test coverage target:** 0%

**Impact Assessment:**
- **Critical components without coverage:**
  - Agent pipeline (`services/agent/agent-pipeline.ts`) — 300+ LOC
  - Analysis service (`services/agent/analysis-service.ts`) — 650+ LOC
  - API computation routes (metrics, signals, composites) — untested
  - React Query integration — no hook tests
  
- **Risk:** Refactoring blind spots. Regression detection relies on manual QA + production monitoring.

**Recommendation:** For institutional-grade platform (per CLAUDE.md), establish:
1. Unit test suite for core services (agent, analysis, metrics)
2. Integration tests for API routes (with test database fixtures)
3. Component snapshot tests for dashboard views
4. E2E test for critical user paths (dashboard → report → export)
5. Pre-commit hook to run tests (husky + lint-staged)

**Effort:** ~3-5 sprints depending on scope.

---

## 🏗️ Tech Debt Identified

### High Priority

| Item | File | Impact | Effort | Note |
|------|------|--------|--------|------|
| **Missing SDK installations** | package.json | Blocks research API, PDF export | 5 min | `npm install` |
| **Type declaration resolution** | 10 TS errors | Blocks strict type checking | 1-2 hrs | Add explicit types or `@types/*` packages |
| **Security patch backlog** | package.json | DoS vulnerabilities in prod | 30 min | `npm audit fix` + `npm audit fix --force` |
| **Console.log sprawl** | 13 routes/components | Production noise, no structured logging | 4 hrs | Migrate to Winston/Pino |

### Medium Priority

| Item | File | Impact | Effort | Note |
|------|------|--------|--------|------|
| **React Hook deps violations** | 3 files (MetricSlicer, useShare, useAnalytics) | Potential stale closures + infinite renders | 2 hrs | Fix deps arrays, consider useCallback memoization |
| **Missing auth wiring** | research/chat/route.ts:169 | userId hardcoded to 'anonymous' | 2 hrs | Wire session auth from Stytch |
| **Image optimization** | TokenIcon.tsx | LCP regression + bandwidth waste | 1 hr | Replace <img> with next/image |
| **Outdated dependency stack** | package.json | Tech debt accumulation | 8 hrs | React 19, Next 16, ESLint 10 (requires testing) |

### Low Priority (Monitor)

- **Prefer-const violations:** Auto-fixable, not critical
- **Unused branches in .git:** WIP branches taking space (`git branch -D b657e79`, `git branch -D b5eba21`)

---

## 📈 Dependency Health

### Outdated Packages (26 with upgrades available)

**Major version jumps available:**
```
├─ React: 18.3.1 → 19.2.4 (breaking change)
├─ React-DOM: 18.3.1 → 19.2.4 (breaking change)
├─ Next.js: 14.2.35 → 16.2.1 (breaking change + security fix)
├─ ESLint: 8.57.1 → 10.1.0 (major, rule changes likely)
├─ TypeScript: 5.3.3 → 5.8.0+ (check for compatibility)
├─ Recharts: 2.15.4 → 3.8.0 (significant refactor)
└─ Framer Motion: 11.18.2 → 12.38.0 (new API patterns)
```

**Minor/patch upgrades available:**
```
├─ @anthropic-ai/sdk: 0.78.0 → 0.80.0 (missing install first)
├─ @google/genai: 1.32.0 → 1.46.0
├─ @tanstack/react-query: 5.90.12 → 5.95.0
├─ drizzle-orm: 0.45.0 → 0.45.1
└─ pg: 8.16.3 → 8.20.0 (security + performance improvements)
```

**Recommendation:** Lock Next.js update for security (high). Defer React 19 / ESLint 10 upgrades to planned refactor sprint.

---

## 🎯 Priorities for Next Day

### Critical (Must do)
1. **Install missing dependencies:** `npm install`
   - Unblocks research API, PDF export, type checking
   - Time: 5 min
   
2. **Patch security vulnerabilities:**
   ```bash
   npm audit fix                 # minimatch + critical
   npm audit fix --force         # Next.js 16 upgrade (test build thoroughly)
   ```
   - Time: 30 min (audit fix) + 2 hrs (testing, rollback if needed)

3. **Fix TypeScript strict mode:**
   - Add explicit parameter types for 7 implicit-any errors
   - Verify @anthropic-ai/sdk and jspdf type packages installed
   - Time: 2 hrs

### High Priority (Should do)
4. **Fix ESLint errors:**
   ```bash
   npx eslint . --fix
   ```
   - Time: 5 min (auto), 30 min (review)

5. **Resolve React Hook dependency warnings (3 files):**
   - MetricSlicer, useShare, useAnalytics
   - Time: 2 hrs

### Nice to Have
6. **Establish test infrastructure baseline:** Decide on Jest/Vitest + structure for Phase 5
7. **Migrate console.log → structured logging:** Define Winston/Pino config
8. **Document API_ROUTES:** Update CLAUDE.md with v16.2.1-compatible patterns

---

## 📝 Last Commits (for context)

```
0ddf2ce (Feb 27, 22:51) feat: enrich Treasury, SalesDesk, FundManager with live data wiring (#140)
edff758 (Feb 27, 22:26) feat: polish Nowcasting, SignalForge, ResearchLab — labels, tooltips, dynamic stats (#139)
90f38e0 (Feb 27, 22:13) feat: ComparativeAnalysis — wire real correlation matrix, dynamic divergence, add CORR factor (#138)
6e6d17f (Feb 27, 22:07) feat: AssetScope overhaul — factor overlays, secondary regimes, enriched AI (#136)
29f5bca (Feb 27, 22:06) feat: signal rehabilitation — extend metric methodology to signals (Phase L) (#137)
```

**Pattern:** Feature-rich UI/UX work in Phase L. Next phase should focus on ops hardening, test coverage, and security baseline.

---

## ✅ Sign-Off

**Code review conducted:** 2026-03-23 05:00 UTC+8  
**Reviewer:** Gale (Chief of Staff)  
**Next review:** 2026-03-24 05:00 UTC+8 (or on-demand if commits detected)

**Status:** Safe to ship current state. Critical path is security patching and missing dependency installation. No deployment blockers beyond those two items.

---

**For:** Giancarlo Luca Cudrig  
**Email:** giancarlo.cudrig@gmail.com  
**CC:** gale.boetticher.ai@gmail.com  
**Telegram:** @giancarlocudrig
