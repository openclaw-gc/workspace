# Dashboard Accelerated Build Plan

**Target:** 3-day MVP (operational by Friday evening AEDT)  
**Tech Stack:** Next.js 14 + Tailwind + shadcn/ui + Vercel  
**Access:** Public URL + password protection  
**Design:** Bloomberg Terminal aesthetic (dark mode, data-dense)

---

## Day 1 (Wednesday Feb 18) - Foundation

### Morning (9 AM - 12 PM AEDT)
- ✅ Next.js 14 project setup (App Router)
- ✅ Tailwind CSS + typography plugin
- ✅ Dark mode configuration
- ✅ Layout structure (nav, main, sidebar)
- ✅ Password middleware (JWT cookie)
- ✅ Deploy to Vercel (auto-deploy enabled)

**Deliverable:** Live URL with auth, blank canvas

### Afternoon (12 PM - 6 PM AEDT)
- ✅ Kanban board widget (reads PROJECT-STATE.md)
  - Card layout: title, status, next action, priority
  - Drag-drop (optional - nice to have, not MVP blocker)
  - Color coding by status
- ✅ Data fetching strategy (API routes for file reads)
- ✅ Bloomberg styling pass (dark gray, monospace numbers, clean hierarchy)

**Deliverable:** Functional Kanban showing real workstream data

### Evening (6 PM - 10 PM AEDT)
- ✅ Memory feed widget
  - Recent daily logs (last 3 days)
  - Latest deliverables (last 5)
  - GitHub commits (last 10)
- ✅ Responsive design
- ✅ GC reviews, provides feedback

**Deliverable:** 2-widget dashboard deployed

---

## Day 2 (Thursday Feb 19) - Feature Sprint

### Morning
- ✅ GitHub activity widget
  - Recent commits (with messages)
  - Repo stats (file count, last push)
  - Commit frequency chart (sparkline)
- ✅ Cost tracker widget
  - Model usage pie chart
  - Daily/monthly burn
  - Budget gauge (80% / 95% thresholds)

### Afternoon
- ✅ Documentation hub
  - Skills browser (categorized)
  - Specs index
  - Deliverables archive
  - Search functionality
- ✅ Cron job status widget
  - Next run times
  - Recent run results
  - Success/fail indicators

### Evening
- ✅ Polish pass
  - Animations (subtle, fast)
  - Loading states
  - Error boundaries
- ✅ Performance optimization

**Deliverable:** 6-widget operational dashboard

---

## Day 3 (Friday Feb 20) - Production Ready

### Morning
- ✅ Calendar widget (today's schedule)
- ✅ Email queue status
- ✅ Model router analytics (from shadow validation)
- ✅ Admin panel (trigger cron jobs, view logs)

### Afternoon
- ✅ Final styling polish
- ✅ Mobile responsiveness
- ✅ Documentation (README, deployment guide)
- ✅ Performance audit (Lighthouse)

### Evening
- ✅ Handoff to GC
- ✅ Deploy to production
- ✅ Access credentials secured

**Deliverable:** Production-ready dashboard

---

## Week 2+ (Sprint-Based Features)

**Market Data (once API keys provided):**
- BTC/ETH/$VANA price widgets
- Funding rates chart
- Liquidation heatmap (if Coinglass API)
- Fear & Greed Index

**Portfolio Tracker:**
- Manual entry interface
- Holdings display
- P&L calculation
- Historical chart

**Vana-Specific:**
- Token metrics
- Portal ideas backlog
- Treasury status (what's shareable)

**Intelligence:**
- Recent research links
- Thematic watch list
- Macro indicators

---

## Technical Architecture

### File Structure
```
dashboard/
├── app/
│   ├── layout.tsx          # Root layout + auth check
│   ├── page.tsx             # Main dashboard
│   ├── login/page.tsx       # Password entry
│   ├── api/
│   │   ├── auth/route.ts    # JWT generation
│   │   ├── data/
│   │   │   ├── project-state/route.ts
│   │   │   ├── memory/route.ts
│   │   │   ├── github/route.ts
│   │   │   ├── costs/route.ts
│   │   │   └── cron/route.ts
│   └── components/
│       ├── widgets/
│       │   ├── Kanban.tsx
│       │   ├── MemoryFeed.tsx
│       │   ├── GitHubActivity.tsx
│       │   ├── CostTracker.tsx
│       │   ├── DocsHub.tsx
│       │   └── CronStatus.tsx
│       └── ui/              # shadcn components
├── lib/
│   ├── auth.ts              # JWT helpers
│   ├── data-fetchers.ts     # Data loading utils
│   └── types.ts             # TypeScript types
├── public/
└── styles/
    └── globals.css          # Tailwind + custom
```

### Data Flow

**File-based widgets (Kanban, Memory, Docs):**
```
Widget → API Route → fs.readFile → Parse → JSON response → Widget render
```

**GitHub data:**
```
Widget → API Route → GitHub API (with token) → Format → JSON response
```

**Cost tracking:**
```
Widget → API Route → Read log files → Aggregate → JSON response
```

**Cron status:**
```
Widget → API Route → OpenClaw cron API → Format → JSON response
```

### Authentication

**Simple JWT flow:**
1. User visits `/` → redirected to `/login`
2. Enters password → POST to `/api/auth`
3. Server validates against `DASHBOARD_PASSWORD` env var
4. Returns JWT (7-day expiry)
5. Cookie set (httpOnly, secure)
6. Middleware checks cookie on all requests

**Environment variables:**
```
DASHBOARD_PASSWORD=cyw8vdp-dnk6EUY0qrj
JWT_SECRET=<generated on first deploy>
```

### Styling System

**Colors (dark mode):**
- Background: `#0a0a0a` (near-black)
- Surface: `#1a1a1a` (cards, widgets)
- Border: `#2a2a2a` (subtle dividers)
- Text primary: `#e5e5e5` (high contrast)
- Text secondary: `#a3a3a3` (muted)
- Accent: `#3b82f6` (blue, sparingly)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444` (red)

**Typography:**
- Sans: Inter (UI text)
- Mono: JetBrains Mono (numbers, code)
- Headers: Bold, tight tracking
- Body: Regular, comfortable line-height

**Component patterns:**
- Cards: `border border-surface rounded-lg p-6`
- Widgets: Full-bleed within cards
- Headers: `text-sm font-semibold tracking-wide uppercase text-secondary`
- Data: `font-mono text-lg font-medium`

### Performance

**Optimization strategies:**
- Static generation where possible
- API routes cached (5-minute SWR)
- Virtualized lists for large datasets
- Code splitting per widget
- Image optimization (Next.js Image)
- Font preloading

**Target metrics:**
- Lighthouse Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: <200KB (main)

---

## Deployment

**Vercel configuration:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Environment variables (set in Vercel):**
- `DASHBOARD_PASSWORD`
- `JWT_SECRET`
- `GITHUB_TOKEN` (for GitHub widget)
- `NEXT_PUBLIC_APP_URL` (for JWT domain)

**Domain:**
- Vercel default: `dashboard-gale.vercel.app`
- Custom (optional): `dash.galeboetticher.cloud`

**Access:**
- Public URL (password-protected)
- No IP allowlisting needed (handled by auth)

---

## Easter Eggs & Personality

**Bloomberg Terminal nods:**
- Widget titles: Subtle references ("REGIME DETECTION", "MEMORY CACHE", "COMMIT LOG")
- Loading states: "Compiling..." / "Calculating..."
- Error states: Fargo-style deadpan ("Well, that's a problem.")
- 404 page: "This page is in the game." (Sopranos reference)

**Hidden features:**
- Konami code → "The chemistry is right" message (Breaking Bad)
- Click logo 5 times → Toggle light mode (but why would you)
- `/debug` route → Raw data inspector (dev mode)

**No:**
- Gamification
- Fake loading animations
- Corporate inspirational quotes
- Stock photos
- Gradients (unless very subtle)

---

## Success Metrics

**Day 1 checkpoint:**
- Dashboard deployed and accessible
- Password auth working
- Kanban + Memory widgets operational
- GC can see real data

**Day 3 checkpoint:**
- 6-8 widgets fully functional
- Responsive on mobile
- Performance >85 Lighthouse
- Production-ready

**Week 2 checkpoint:**
- Market data integrated (once API keys provided)
- Admin features working
- No major bugs reported
- GC using it daily

---

## Risk Mitigation

**Data access:**
- All file reads happen server-side (API routes)
- Never expose workspace file paths to client
- Validate all inputs

**Performance:**
- Start with simple fetching, optimize later
- Cache aggressively (SWR, API route caching)
- Lazy load heavy widgets

**Time:**
- MVP features only for Day 1-3
- Nice-to-haves deferred to Week 2
- If behind schedule, cut drag-drop from Kanban

**Scope creep:**
- No new widgets requested during 3-day build
- Feature freeze until MVP deployed
- GC feedback incorporated in Week 2 sprint

---

## Handoff Checklist

**Before deploying to production:**
- [ ] All sensitive data server-side only
- [ ] Environment variables set in Vercel
- [ ] Password auth tested
- [ ] Mobile responsive verified
- [ ] Performance audit passed
- [ ] Error boundaries in place
- [ ] README with setup instructions
- [ ] Deployment guide documented

**Post-deployment:**
- [ ] GC can access URL
- [ ] Password works
- [ ] All widgets loading data
- [ ] GitHub changes trigger auto-deploy
- [ ] Monitor Vercel analytics for errors

---

**Status:** Ready to build. Waiting for GC's green light to proceed with Day 1 execution.

— Gale 🧪
