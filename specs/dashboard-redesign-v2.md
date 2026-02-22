# Dashboard Redesign V2 - UX & Polish Overhaul

**Date:** 2026-02-18  
**Owner:** Gale  
**Status:** Planning (for morning review)

## Current Problems (GC Feedback)

1. **Kanban not clickable** - items should link to project files with briefs/progress
2. **Memory feed hidden** - buried in sidebar, hard to see what's happening
3. **Poor layout** - big blank spaces, inefficient use of screen real estate
4. **Lack of polish** - feels unfinished, not production-ready
5. **Not useful** - doesn't actually help GC understand status at a glance

## Reference

- **Nate Herk's OpenClaw dashboard:** https://www.youtube.com/watch?v=rlJovzVhlIo&t=288s
- Need to analyze: layout, navigation, interaction patterns, visual hierarchy

## Core UX Principles (to apply)

1. **Click everything that looks clickable**
   - Kanban cards → project detail view
   - Memory entries → full memory file
   - Cost widgets → detailed breakdowns
   - Router stats → classification log

2. **Information hierarchy**
   - Most important info at top/center
   - Supporting details in sidebars
   - No wasted space

3. **Visual polish**
   - Consistent spacing
   - Smooth transitions
   - Loading states
   - Error states
   - Empty states

4. **Navigation clarity**
   - Always know where you are
   - Easy to get back
   - Breadcrumbs or context

## Proposed Redesign

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER: Status, Activity, Time, Navigation             │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│ LEFT SIDEBAR    │ MAIN CONTENT AREA                    │
│ (Navigation)    │ (Context-dependent)                  │
│                 │                                       │
│ • Dashboard     │ When Dashboard selected:             │
│ • Projects      │   - Active projects (cards)          │
│ • Memory        │   - Quick stats                      │
│ • Docs          │   - Recent activity feed             │
│ • Router        │                                       │
│ • Costs         │ When Projects selected:              │
│                 │   - Project list with status         │
│                 │   - Click → full project view        │
│                 │                                       │
│                 │ When Memory selected:                │
│                 │   - Timeline view                    │
│                 │   - Daily entries                    │
│                 │                                       │
│ (25% width)     │ (75% width)                          │
│                 │                                       │
└─────────────────┴───────────────────────────────────────┘
```

### Key Improvements

**1. Clickable Kanban → Project View**
- Each card shows: title, status, progress bar, last update
- Click → dedicated project page showing:
  - Brief/objective
  - Progress (checklist with timestamps)
  - Blockers
  - Next steps
  - Related files
  - Activity log

**2. Memory Prominence**
- Move to main content area when "Memory" selected
- Timeline view (like docs/timeline but bigger)
- Show context, not just file names
- Quick search/filter

**3. Dashboard Home (Overview)**
- Top row: Key metrics (router savings, active projects, today's progress)
- Middle: Active project cards (3-4 max, click to expand)
- Bottom: Recent activity feed (memory updates, completions, alerts)
- Right panel: Quick actions + current status

**4. Router Analytics**
- Dedicated page (click "Router" in sidebar)
- Large cost comparison chart
- Tier distribution pie chart
- Recent routing decisions table
- Budget status with runway projection

**5. Polish Elements**
- Hover states (cards lift slightly)
- Smooth page transitions
- Loading skeletons (not spinners)
- Consistent card shadows
- Color coding (green = good, amber = warning, red = critical)
- Typography hierarchy (clear h1/h2/body)

## Implementation Plan

### Phase 1: Structure (Day 1)
- [ ] New sidebar navigation component
- [ ] Main content area with routing
- [ ] Proper layout grid (no blank spaces)
- [ ] Responsive breakpoints

### Phase 2: Clickable Projects (Day 1-2)
- [ ] Project detail view component
- [ ] Link Kanban cards to project pages
- [ ] Project file reader (reads PROJECT-STATE.md sections)
- [ ] Activity log per project

### Phase 3: Memory Improvements (Day 2)
- [ ] Move Memory to main content area
- [ ] Larger timeline view
- [ ] Search/filter functionality
- [ ] Context preview on hover

### Phase 4: Router Page (Day 2-3)
- [ ] Dedicated router analytics page
- [ ] Charts (cost comparison, tier distribution)
- [ ] Routing decisions table (last 50)
- [ ] Budget projections

### Phase 5: Polish (Day 3)
- [ ] Hover states and transitions
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Consistent spacing
- [ ] Typography refinement

### Phase 6: Dashboard Home Redesign (Day 3-4)
- [ ] Key metrics row
- [ ] Active project cards
- [ ] Activity feed
- [ ] Quick actions panel

## Technical Stack

**Current:**
- Next.js 14 (App Router)
- React
- Tailwind CSS
- Dark theme (green accent)

**May need:**
- **Recharts** - for cost/router charts (pie, line, bar)
- **Framer Motion** - for smooth transitions
- **React Virtual** - for long lists (memory timeline)

**Claude Frontend Skill?**
- Check if it provides UI component generation
- Could speed up implementation
- Need to review skill capabilities

## Success Metrics

**Before review tomorrow:**
1. Visual mockups of new layout
2. Detailed component breakdown
3. Implementation timeline (realistic)
4. Decision on claude frontend skill

**After redesign complete:**
1. GC can click any Kanban item → see full project
2. Memory is prominent and searchable
3. No wasted space on screen
4. Feels polished and professional
5. GC finds it useful (subjective but critical)

## Next Steps (Tonight)

1. Review Nate Herk's video (if I can access it)
2. Check claude frontend skill capabilities
3. Create visual wireframes (ASCII art or simple diagrams)
4. Refine this plan
5. Have actionable roadmap ready for morning review

## Questions for GC Tomorrow

1. Priority order: Projects view vs Memory prominence vs Polish?
2. Should Dashboard be overview (current) or jump to most-used view?
3. Any specific Nate Herk features you want replicated?
4. Timeline expectation: 3-4 days realistic?

---

**Status:** Draft for morning review  
**Next:** Refine based on GC feedback, then execute

## ClawHub Skills (Discovered)

**Dashboard Skills:**
- `mission-control-dashboard` (v1.0.0) - highest relevance (3.388)
- `dashboard` (v1.0.1) - generic dashboard (3.347)
- `security-dashboard` (v1.2.1) - security-focused (3.341)
- `realtime-dashboard` (v1.0.0) - realtime updates (3.265)
- `aic-dashboard` (v1.8.0) - AI Commander Dashboard (3.223)
- `glitch-dashboard` (v2026.2.18) - recent release (3.149)

**UI/Design Skills:**
- `superdesign` (v1.0.0) - top UI skill (1.199)
- `shadcn-ui` (v1.0.0) - Shadcn components (1.134)
- `ui-ux-pro-max` (v0.1.0) - UI/UX focused (1.100)
- `frontend-design-ultimate` (v1.0.0) - comprehensive frontend (1.024)

**Recommendation for tomorrow:**
1. Review `mission-control-dashboard` and `superdesign` skills
2. Determine if they provide patterns/components we can adapt
3. Consider installing `shadcn-ui` for production-ready components
4. Evaluate if skills save time vs building custom

**Action:** Install and review top 2-3 skills before redesign work begins.
