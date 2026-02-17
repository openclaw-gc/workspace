# GitHub Skill - Quick Reference

## Repository
**openclaw-gc/workspace**: https://github.com/openclaw-gc/workspace

## Quick Commands

### Sync & Commit
```bash
node /data/.openclaw/workspace/skills/github/sync-and-commit.js "commit message"
```

### Manual Operations
```bash
# Check status
cd /data/.openclaw/workspace-repo && git status

# View recent commits
cd /data/.openclaw/workspace-repo && git log --oneline -5

# Pull latest
cd /data/.openclaw/workspace-repo && git pull origin main
```

### API Operations
```bash
# View recent commits via API
. /data/.openclaw/workspace/.env.gale && \
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/openclaw-gc/workspace/commits?per_page=5 \
  | jq '.[] | {sha: .sha[0:7], message: .commit.message, date: .commit.author.date}'
```

## Automated Sync Rules

**Auto-commit triggers:**
- Memory updates (MEMORY.md, daily logs)
- New deliverables
- Skill modifications (when complete)
- Project state changes

**Excluded from sync:**
- `.env.gale` (credentials)
- `email-queue.json` (temp queue)
- `.gmail-*` files (temp IMAP state)
- `gmail-log.jsonl` (verbose logs)
- `node_modules/` (dependencies)

## Current Status
- ✅ Repository created and initialized
- ✅ Initial workspace committed (48 files)
- ✅ Automation script working
- ✅ Classic PAT configured with full permissions
- ✅ Git remote configured with token auth

## Next Steps
1. Set up auto-commit hooks for memory updates
2. Create release workflow for deliverables
3. Add GitHub Actions for automated testing
4. Integrate with PROJECT-STATE.md tracking
