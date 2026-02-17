# AI Assistant Command Center - Dashboard Build Plan

**Date:** February 16, 2026  
**For:** GC & Gale (AI Assistant)  
**Purpose:** Central hub for treasury operations, AI assistant coordination, and workspace management

---

## Executive Summary

This document evaluates six approaches for building a command center dashboard that will serve as the primary interface between GC (finance/treasury professional) and Gale (AI assistant). The dashboard must handle real-time data, integrate with multiple APIs, and support complex workflows while remaining maintainable.

**Recommended Approach:** **Vercel + Next.js** with incremental feature rollout, supplemented by **n8n** for backend automation.

---

## Requirements Overview

The dashboard must support:

- **Master Guide / Documentation Viewer** — Searchable knowledge base
- **Active Projects & Task Tracking** — Project status, milestones, blockers
- **Memory/Log Viewer** — AI session logs, decision history
- **Connected Services Status** — Real-time health monitoring
- **Treasury/Market Data Integration** — Crypto prices, portfolio tracking
- **Communication Channel Status** — Email, Telegram, Discord activity
- **File Browser** — Unified view of Drive, local files, etc.
- **Automation/Cron Job Management** — n8n workflow monitoring

---

## Option 1: Vercel + Next.js

**Description:** Full custom build using Next.js 14+ (App Router) deployed on Vercel.

### Pros
- **Complete Control** — Build exactly what you need, no platform limitations
- **Modern Stack** — React Server Components, streaming, optimistic UI
- **Excellent DX** — Fast iteration, hot reload, TypeScript support
- **Built-in API Routes** — Backend logic in same codebase (serverless functions)
- **Real-time Ready** — Easy integration with WebSockets, Server-Sent Events, or Pusher
- **Mobile Responsive** — Tailwind CSS, Shadcn/ui components work great on mobile
- **SEO/Performance** — Edge runtime, ISR, image optimization out of the box
- **Authentication** — NextAuth.js integrates seamlessly
- **Ecosystem** — Massive library support for any integration

### Cons
- **Development Time** — 3-6 weeks for MVP (depends on feature complexity)
- **Requires Dev Skills** — Need React/TypeScript knowledge (or willingness to learn)
- **Maintenance Overhead** — Dependency updates, security patches
- **No Visual Builder** — Everything is code

### Technical Details

**Setup Complexity:** Medium  
- `npx create-next-app@latest` → 5 minutes to scaffold
- Add Shadcn/ui, Tailwind, NextAuth → 1-2 hours
- API integrations (tRPC recommended) → ongoing

**Hosting Options:**
- **Vercel (Recommended):** Zero-config deployment, $20/mo Pro (includes analytics, preview deploys)
- **Self-hosted VPS:** Docker + Node.js, full control, ~$10-20/mo
- **Cloudflare Pages:** Free tier available, edge deployment

**Real-time Capabilities:** ⭐⭐⭐⭐⭐
- Server-Sent Events for live updates
- WebSocket support via custom server or third-party (Pusher, Ably)
- React Server Components enable streaming data

**API Integration Ease:** ⭐⭐⭐⭐⭐
- Native fetch with TypeScript
- Libraries for everything (Gmail: `googleapis`, GitHub: `octokit`, Crypto: `ccxt` or direct REST)
- tRPC for type-safe internal APIs
- Can proxy n8n webhooks through Next.js API routes

**Authentication:** ⭐⭐⭐⭐⭐
- NextAuth.js supports Google OAuth, magic links, credentials
- Can implement 2FA, session management, role-based access
- Edge-compatible auth with middleware

**Mobile Responsiveness:** ⭐⭐⭐⭐⭐
- Tailwind CSS mobile-first design
- PWA support (offline capability, installable)
- Responsive by default with modern components

**Maintenance Burden:** Medium
- Monthly dependency updates
- Security monitoring (Dependabot)
- Need to stay current with Next.js releases

**Cost Estimate:**
- Development: 40-80 hours (if building yourself)
- Hosting: $20/mo (Vercel Pro) or $10/mo (VPS)
- APIs: Variable (Google Workspace, crypto data)
- **Total Year 1:** ~$240-500 + dev time

### Implementation Roadmap

**Phase 1 (Week 1-2):** Foundation
- Next.js setup with auth (Google OAuth for GC)
- Basic layout with sidebar navigation
- Master Guide viewer (markdown rendering from files)
- Dark mode toggle

**Phase 2 (Week 3-4):** Data Integration
- Connect to n8n API for workflow status
- Build memory log viewer (read from workspace files)
- Add file browser (Google Drive API integration)

**Phase 3 (Week 5-6):** Advanced Features
- Real-time service status dashboard
- Treasury data widgets (CoinGecko/CryptoCompare API)
- Project tracker with Notion API or local JSON store

**Phase 4 (Ongoing):** Polish
- Cron job management UI
- Chat interface for Gale interaction
- Advanced analytics and reporting

---

## Option 2: Retool / Appsmith

**Description:** Low-code internal tool builders with drag-and-drop UI and pre-built components.

### Retool

**Pros:**
- **Rapid Development** — Build functional dashboards in hours, not weeks
- **Pre-built Components** — Tables, charts, forms, maps all ready to use
- **Native Integrations** — 100+ data sources (PostgreSQL, REST APIs, GraphQL, Google Sheets)
- **Permissions** — Granular RBAC, audit logs
- **Self-hosted Option** — Deploy on your own infrastructure
- **Workflows** — Built-in automation (competitor to n8n)
- **Mobile Apps** — Separate mobile app builder

**Cons:**
- **Cost** — $10/user/mo (Team plan) up to $50/user/mo (Business)
- **Vendor Lock-in** — Proprietary platform, hard to migrate
- **Customization Limits** — Can't do everything possible in code
- **Learning Curve** — Still need to understand their component model
- **Performance** — Can be sluggish with complex queries
- **Limited Offline** — Requires internet connection

**Setup Complexity:** Low  
- Sign up → Create new app → Start dragging components
- Connect APIs via GUI → Test → Deploy

**Hosting Options:**
- Cloud (default): Managed by Retool
- Self-hosted: Docker deployment on VPS/K8s

**Real-time Capabilities:** ⭐⭐⭐
- Polling (1s minimum interval)
- Webhooks for push updates
- Limited WebSocket support

**API Integration Ease:** ⭐⭐⭐⭐⭐
- Visual API connection builder
- Pre-built integrations for common services
- Custom REST/GraphQL support

**Authentication:** ⭐⭐⭐⭐⭐
- SSO (Google, SAML)
- Built-in user management
- Granular permissions

**Mobile Responsiveness:** ⭐⭐⭐
- Works on mobile browser (not optimized)
- Separate mobile app builder (additional complexity)

**Maintenance Burden:** Low
- Platform handles updates
- Focus on business logic, not infrastructure

**Cost Estimate:**
- Cloud: $10-50/user/mo ($120-600/year for 1 user)
- Self-hosted: $500/mo minimum (enterprise)

### Appsmith

**Open-source alternative to Retool**

**Pros:**
- **Open Source** — Free self-hosted, or $40/user/mo cloud
- **Similar Features** — Drag-and-drop, API integrations, workflows
- **Community** — Active GitHub, good documentation
- **No Vendor Lock-in** — Can export and modify (to a degree)

**Cons:**
- **Less Mature** — Fewer integrations than Retool
- **Smaller Ecosystem** — Fewer templates and community solutions
- **UI Limitations** — Less polished than Retool

**Cost Estimate:**
- Self-hosted: Free (VPS cost ~$10-20/mo)
- Cloud: $40/user/mo

### Verdict on Low-code

**Best For:** Quick MVPs, non-developers, rapid iteration  
**Not Great For:** Highly custom UIs, complex real-time features, full control  

**Recommendation for GC/Gale:** If you want a dashboard in 1 week with minimal dev work, go Retool. But you'll pay $600+/year and hit customization walls later.

---

## Option 3: Notion API + Custom Frontend

**Description:** Use Notion as database/CMS, build custom React/Next.js frontend that reads from Notion API.

### Pros
- **Leverage Existing Workflow** — GC already uses Notion
- **Easy Content Management** — Edit docs, tasks, notes in familiar Notion UI
- **No Backend Needed** — Notion is your database
- **Collaboration** — Multiple people can edit Notion
- **Beautiful Editor** — Notion's editing experience is world-class

### Cons
- **API Limitations** — Rate limits (3 req/sec), no real-time subscriptions
- **Read-only Bias** — Writing to Notion from API is clunky
- **Not a Database** — Complex queries are hard/slow
- **No Transactions** — Can't guarantee data consistency
- **Limited Structure** — Notion's block-based model doesn't fit all data

### Technical Details

**Setup Complexity:** Medium  
- Create Notion integration → Get API key
- Build Next.js frontend → 2-4 weeks
- Map Notion databases to UI components

**Hosting Options:**
- Same as Next.js (Vercel, VPS, etc.)

**Real-time Capabilities:** ⭐⭐
- No webhooks or WebSockets
- Must poll API (rate limits apply)
- Delays of 5-30 seconds for updates

**API Integration Ease:** ⭐⭐⭐
- Notion API: Good for reads, awkward for writes
- Other APIs: Build in Next.js backend

**Authentication:** ⭐⭐⭐⭐
- Use Notion OAuth or separate auth system
- Can restrict dashboard access independently

**Mobile Responsiveness:** ⭐⭐⭐⭐⭐
- Frontend is custom Next.js (fully responsive)

**Maintenance Burden:** Medium
- Frontend updates
- Notion API changes (rare but breaking)

**Cost Estimate:**
- Notion: $10/mo (Plus plan for API)
- Hosting: $20/mo (Vercel)
- **Total:** ~$360/year + dev time

### Verdict

**Best For:** Teams already invested in Notion, content-heavy dashboards  
**Not Great For:** Real-time data, complex treasury calculations, primary data store

**Recommendation for GC/Gale:** Use Notion for documentation/guides (read-only), but don't rely on it for live data or task management. Hybrid approach works well.

---

## Option 4: n8n + Custom Dashboard

**Description:** Extend n8n with custom frontend that visualizes workflows, monitors executions, and displays aggregated data.

### Pros
- **Already Installed** — GC uses n8n, build on existing infrastructure
- **Workflow Visibility** — Show what automations are running
- **Webhook-friendly** — n8n can push data to dashboard
- **Database Access** — n8n stores execution history, can query it
- **Reuse Logic** — Workflows handle API integrations, dashboard displays results

### Cons
- **n8n is Not a Dashboard Platform** — It's a workflow engine
- **Limited UI Components** — Would need to build everything custom
- **No Built-in Frontend** — Need separate React/Vue app
- **Two Systems** — n8n + custom frontend increases complexity
- **Authentication Gap** — n8n auth separate from dashboard auth

### Technical Details

**Setup Complexity:** Medium-High  
- n8n already running ✓
- Build React/Next.js frontend → 3-5 weeks
- Connect to n8n API and database
- Sync authentication

**Hosting Options:**
- n8n: VPS/Docker (already running)
- Dashboard: Same VPS or separate Vercel

**Real-time Capabilities:** ⭐⭐⭐⭐
- n8n webhooks can push updates to dashboard
- SSE or WebSocket connection from dashboard to n8n
- Workflow execution logs in real-time

**API Integration Ease:** ⭐⭐⭐⭐
- n8n handles all API integrations
- Dashboard consumes n8n-processed data
- Reduces dashboard complexity

**Authentication:** ⭐⭐⭐
- n8n has basic auth
- Dashboard needs separate auth (NextAuth)
- Can sync sessions via JWT

**Mobile Responsiveness:** ⭐⭐⭐⭐⭐
- Custom frontend (fully responsive)

**Maintenance Burden:** Medium-High
- Maintain n8n instance + dashboard
- Keep API contracts in sync

**Cost Estimate:**
- n8n hosting: $10-20/mo (VPS)
- Dashboard hosting: $0-20/mo (VPS or Vercel)
- **Total:** ~$240-480/year + dev time

### Verdict

**Best For:** Teams heavily invested in n8n, automation-centric dashboards  
**Not Great For:** General-purpose UI, standalone dashboard

**Recommendation for GC/Gale:** Use n8n for backend automation, but build dashboard separately. Dashboard should *display* n8n workflow status, not live inside n8n.

---

## Option 5: Streamlit / Gradio

**Description:** Python-based rapid prototyping frameworks that turn scripts into web apps.

### Streamlit

**Pros:**
- **Rapid Prototyping** — Build dashboard in 1-2 days
- **Pure Python** — No HTML/CSS/JS needed
- **Data Science Friendly** — Great for charts (Plotly, Altair)
- **Easy Deployment** — Streamlit Cloud (free tier)
- **Reactive** — Auto-reruns on input change
- **Component Library** — Tables, charts, forms, maps

**Cons:**
- **Not Production-grade** — Single-user by default, performance issues
- **Limited Customization** — Hard to build complex layouts
- **Stateful Weirdness** — Reruns entire script on interaction
- **No API Routes** — Backend must be separate service
- **Mobile UX** — Not optimized for mobile
- **Real-time Limited** — Polling-based, no true WebSockets

### Gradio

Similar to Streamlit but focused on ML demos. **Less suitable for a command center dashboard.**

### Technical Details (Streamlit)

**Setup Complexity:** Very Low  
- `pip install streamlit` → Write Python script → `streamlit run app.py`
- 1-2 days to functional prototype

**Hosting Options:**
- **Streamlit Cloud:** Free (public), $200/mo (private + auth)
- **Self-hosted:** Docker + VPS, $10-20/mo

**Real-time Capabilities:** ⭐⭐
- Auto-refresh with `st.rerun()`
- Polling-based updates
- No WebSocket support

**API Integration Ease:** ⭐⭐⭐⭐
- Use any Python library (`requests`, `google-api-python-client`, `ccxt`)
- Straightforward integration

**Authentication:** ⭐⭐
- Streamlit Cloud: Basic auth included (paid tier)
- Self-hosted: Need reverse proxy with auth (Nginx + OAuth2)

**Mobile Responsiveness:** ⭐⭐
- Works on mobile but not optimized
- Buttons and inputs can be clunky

**Maintenance Burden:** Low-Medium
- Simple codebase
- Python dependency management
- Not designed for high uptime

**Cost Estimate:**
- Free tier (public): $0
- Private + auth: $200/mo ($2400/year) 🚨 Expensive
- Self-hosted: $10-20/mo

### Verdict

**Best For:** Quick prototypes, data science demos, internal tools (non-critical)  
**Not Great For:** Production dashboards, mobile users, real-time data

**Recommendation for GC/Gale:** Good for rapid testing of ideas (2-day MVP), but rebuild in Next.js for production. Streamlit is not suitable as the long-term dashboard platform.

---

## Option 6: Other Notable Options

### A. Reflex (formerly Pynecone)

**Description:** Pure Python framework (like Streamlit but better architecture)

**Pros:**
- Builds real React apps (not just Python scripts)
- Better performance than Streamlit
- Type-safe, modern Python

**Cons:**
- Young project (2022), small community
- Limited ecosystem
- Still has Python backend requirements

**Verdict:** Interesting, but too immature for production. Watch this space.

---

### B. Budibase

**Description:** Open-source low-code platform (similar to Retool/Appsmith)

**Pros:**
- Self-hostable, free
- Built-in database
- Automation workflows
- Good UI builder

**Cons:**
- Less mature than Retool
- Smaller community than Appsmith
- Limited advanced features

**Verdict:** Solid Appsmith alternative if you want fully open-source.

---

### C. Grafana

**Description:** Observability and monitoring platform

**Pros:**
- Best-in-class visualizations
- Excellent for metrics, logs, traces
- Plugin ecosystem
- Alerting and notifications

**Cons:**
- Designed for time-series data (not task management)
- Steep learning curve
- Not a general-purpose dashboard

**Verdict:** Use Grafana for *monitoring* (service health, treasury metrics), not for task management or file browsing. Could be complementary.

---

### D. Admin Panels (React-Admin, Refine, etc.)

**Description:** Open-source React frameworks for admin UIs

**Pros:**
- Faster than building from scratch
- Pre-built CRUD components
- REST/GraphQL adapters
- Professional look

**Cons:**
- Still requires React knowledge
- Less flexible than pure Next.js
- Designed for database CRUD (not general dashboards)

**Verdict:** Good middle ground if you want structure but not low-code. **Refine** is excellent and pairs well with Next.js.

---

## Comparison Matrix

| Factor | Next.js | Retool | Notion+Next | n8n+Next | Streamlit | Refine |
|--------|---------|--------|-------------|----------|-----------|--------|
| **Setup Time** | 2-6 weeks | 1-2 weeks | 3-5 weeks | 3-5 weeks | 2 days | 2-4 weeks |
| **Customization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Real-time** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **API Integration** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mobile** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | Medium | Low | Medium | High | Low | Medium |
| **Year 1 Cost** | $240-500 | $600-2400 | $360 | $240-480 | $0-2400 | $240-500 |
| **Learning Curve** | Medium | Low | Medium | High | Very Low | Medium |
| **Production-ready** | ✅ Yes | ✅ Yes | ⚠️ Hybrid | ⚠️ Complex | ❌ No | ✅ Yes |

---

## Recommendation: Hybrid Approach

### Primary Platform: **Next.js 14 (App Router) on Vercel**

**Why:**
1. **Full Control** — Build exactly what GC and Gale need
2. **Future-proof** — Can grow from simple dashboard to complex app
3. **Real-time Ready** — Server-Sent Events for live updates (service status, market data)
4. **Best Mobile Experience** — Responsive by default, PWA-capable
5. **API Integration** — Unlimited flexibility for crypto, Google, GitHub, etc.
6. **Reasonable Cost** — $240/year for hosting + dev time
7. **Modern DX** — Fast iteration, TypeScript safety, great ecosystem

### Supporting Systems:

1. **n8n** — Backend automation (already in use)
   - Handles scheduled tasks, webhook processing
   - Dashboard displays n8n workflow status via API
   - Reduces dashboard complexity (n8n does heavy lifting)

2. **Notion** — Documentation repository (read-only from dashboard)
   - Master Guide lives in Notion (easy editing)
   - Dashboard renders Notion pages via API
   - GC can update docs without touching code

3. **Grafana** (Optional Phase 2) — Metrics visualization
   - Time-series data for treasury performance
   - Service health monitoring
   - Embed Grafana panels in Next.js dashboard

4. **Streamlit** (Prototyping Only) — Rapid testing
   - Build proof-of-concept features in 1-2 days
   - Validate ideas before committing to Next.js implementation
   - Throw away after validation

---

## Implementation Plan

### Phase 0: Foundation (Week 1-2)

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- NextAuth.js (Google OAuth)
- Vercel deployment

**Deliverables:**
- [ ] Project scaffold with authentication
- [ ] Basic layout (sidebar, header, dark mode)
- [ ] Master Guide viewer (render markdown from `/guides`)
- [ ] Environment variables for API keys

**Estimated Time:** 20 hours

---

### Phase 1: Core Features (Week 3-4)

**Deliverables:**
- [ ] **Memory Log Viewer** — Display `/memory/YYYY-MM-DD.md` files
- [ ] **File Browser** — Read workspace files, show recent edits
- [ ] **Service Status** — Ping endpoints, show health (OpenClaw, n8n, etc.)
- [ ] **Project Tracker** — Read from `projects/` directory or Notion

**API Integrations:**
- Read local workspace files
- Connect to n8n API (workflow status)
- Notion API (optional: project pages)

**Estimated Time:** 30 hours

---

### Phase 2: Treasury & Real-time (Week 5-6)

**Deliverables:**
- [ ] **Market Data Widget** — Crypto prices, portfolio value
- [ ] **Real-time Updates** — Server-Sent Events for live data
- [ ] **Communication Status** — Email unread count, Telegram activity
- [ ] **Cron Job Manager** — View/trigger scheduled tasks

**API Integrations:**
- CoinGecko/CryptoCompare (crypto prices)
- Gmail API (unread count)
- Telegram Bot API (channel activity)
- n8n webhooks (push updates to dashboard)

**Estimated Time:** 40 hours

---

### Phase 3: Advanced (Week 7+)

**Deliverables:**
- [ ] **Chat Interface** — Talk to Gale from dashboard
- [ ] **Advanced Analytics** — Treasury performance charts
- [ ] **Mobile PWA** — Install as app on phone
- [ ] **Notifications** — Browser push for important events

**Estimated Time:** 40+ hours (ongoing)

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  VERCEL (Edge Network)              │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │           Next.js 14 Dashboard                │ │
│  │  (App Router + Server Components + API)       │ │
│  │                                               │ │
│  │  - Authentication (NextAuth.js)               │ │
│  │  - UI Components (Shadcn/ui)                  │ │
│  │  - Real-time (SSE)                            │ │
│  │  - API Routes (tRPC)                          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   n8n    │  │  Notion  │  │  Google  │
    │  (VPS)   │  │   API    │  │   APIs   │
    │          │  │          │  │          │
    │ Workflows│  │  Docs &  │  │ Gmail,   │
    │   API    │  │ Projects │  │  Drive   │
    └──────────┘  └──────────┘  └──────────┘
           │
           ▼
    ┌──────────────────┐
    │  OpenClaw Agent  │
    │    Workspace     │
    │                  │
    │  /memory/*.md    │
    │  /projects/      │
    │  /guides/        │
    └──────────────────┘
```

### Data Flow

1. **User (GC) visits dashboard** → Vercel serves Next.js app
2. **Dashboard fetches data** → API routes query n8n, Notion, Google APIs
3. **Real-time updates** → SSE connection streams live data (prices, status)
4. **User interacts** → Actions trigger n8n workflows or direct API calls
5. **Gale (AI) updates data** → Writes to workspace files, dashboard reflects changes

---

## Cost Breakdown (Year 1)

| Item | Cost | Notes |
|------|------|-------|
| **Vercel Pro** | $240/year | Includes analytics, preview deploys |
| **Domain** | $15/year | Optional (can use Vercel subdomain) |
| **n8n VPS** | $120-240/year | Already running (no new cost) |
| **Notion Plus** | $120/year | Already subscribed (no new cost) |
| **APIs** | $0-100/year | Most have free tiers initially |
| **Development** | 90-150 hours | Your time or contractor |
| **TOTAL** | ~$400-600 + dev | Very reasonable |

**Comparison:**
- Retool: $600-2400/year (1 user)
- Streamlit Cloud: $2400/year (private + auth)
- Next.js: $400/year ✅ Winner

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Development takes longer than expected | Medium | Start with MVP, iterate incrementally |
| API rate limits hit | Low | Implement caching, respect rate limits |
| Real-time connection issues | Medium | Fallback to polling, retry logic |
| Vercel costs increase with traffic | Low | Monitor usage, optimize queries |
| Security vulnerability | High | Regular updates, security audit, auth best practices |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dashboard downtime | Medium | Vercel SLA 99.9%, n8n as backup interface |
| Maintenance burden grows | Medium | Keep dependencies minimal, automate updates |
| GC can't maintain dashboard alone | Low | Well-documented code, modular design |
| Feature creep delays launch | High | Strict MVP scope, defer non-essential features |

---

## Alternative: If You Don't Want to Code

### Option A: Retool (Fast but Expensive)

**Cost:** $600-1200/year  
**Timeline:** 1-2 weeks to full dashboard  
**Trade-off:** Less customization, vendor lock-in

**When to choose:**
- Need dashboard in &lt;2 weeks
- Don't want to write code
- Budget is not a constraint
- Okay with platform limitations

### Option B: Appsmith (Open-source Low-code)

**Cost:** $0 (self-hosted)  
**Timeline:** 2-3 weeks  
**Trade-off:** Less polished than Retool, still limited customization

**When to choose:**
- Want low-code but not Retool pricing
- Comfortable managing Docker deployment
- Okay with fewer integrations

---

## Decision Framework

Use this flowchart to decide:

```
Do you have React/TypeScript skills (or want to learn)?
│
├─ YES → Go with Next.js (best long-term value)
│         ├─ Want structure? Use Refine framework
│         └─ Want full control? Pure Next.js
│
└─ NO → How much budget?
          │
          ├─ High ($600+/year) → Retool (fastest, easiest)
          │
          ├─ Medium ($100-400/year) → Hire developer for Next.js build
          │
          └─ Low ($0-100/year) → Appsmith self-hosted or Streamlit prototype
```

---

## Conclusion

**Recommended Path:**

1. **Build on Next.js 14 + Vercel** for maximum flexibility and future-proofing
2. **Use n8n as backend engine** for automation (already in place)
3. **Pull docs from Notion** for easy content management
4. **Add Grafana** later for advanced metrics visualization
5. **Start with MVP** (Weeks 1-4), iterate based on real usage

**Why This Wins:**

- ✅ **Cost-effective:** $400/year vs $600-2400 for low-code
- ✅ **Future-proof:** Can grow from dashboard to full app
- ✅ **Real-time ready:** SSE for live updates
- ✅ **Mobile-first:** Responsive, PWA-capable
- ✅ **No vendor lock-in:** Own your code
- ✅ **Skills investment:** Learning Next.js pays off long-term

**Timeline:**

- Week 1-2: Foundation + auth + docs
- Week 3-4: Core features (logs, files, status)
- Week 5-6: Treasury data + real-time
- Week 7+: Advanced features (chat, analytics)

**Next Steps:**

1. [ ] Review this plan with GC
2. [ ] Decide: DIY or hire developer?
3. [ ] Set up Vercel account + GitHub repo
4. [ ] Create Next.js project scaffold
5. [ ] Start Phase 0 (foundation)

---

**Questions? Need clarification on any section?** This plan is meant to be a living document — adjust as you learn more about GC's needs.

**Good luck building the command center! 🚀**

---

_Document version: 1.0_  
_Last updated: February 16, 2026_  
_Next review: After Phase 0 completion_
