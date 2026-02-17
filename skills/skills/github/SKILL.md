# GitHub Skill - Automated Workspace Management

## Overview
Automate Git operations for the openclaw-gc/workspace repository: commits, pushes, releases, and status checks.

## Credentials
Stored in `/data/.openclaw/workspace/.env.gale`:
- `GITHUB_TOKEN` - Classic PAT with repo + workflow + admin:org scopes
- `GITHUB_USER` - gale-boetticher
- `GITHUB_ORG` - openclaw-gc

## Repository Structure
- **openclaw-gc/workspace**: Main workspace repo (identity, memory, skills, deliverables)
- **Local clone**: `/data/.openclaw/workspace-repo/` (synced with workspace)

## Common Operations

### 1. Commit and Push Changes
```bash
. /data/.openclaw/workspace/.env.gale

cd /data/.openclaw/workspace-repo

# Sync latest workspace files
rsync -av --exclude='.env.gale' --exclude='node_modules' --exclude='.gmail-*' \
  /data/.openclaw/workspace/ /data/.openclaw/workspace-repo/

git add .
git commit -m "Update: [description]"
git push origin main
```

### 2. Check Status
```bash
. /data/.openclaw/workspace/.env.gale
cd /data/.openclaw/workspace-repo
git status
git log --oneline -5
```

### 3. Create Release
```bash
. /data/.openclaw/workspace/.env.gale

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/openclaw-gc/workspace/releases \
  -d '{
    "tag_name": "v1.0.0",
    "name": "Release v1.0.0",
    "body": "Release notes here",
    "draft": false,
    "prerelease": false
  }'
```

### 4. List Recent Commits
```bash
. /data/.openclaw/workspace/.env.gale

curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/openclaw-gc/workspace/commits \
  | jq '.[] | {sha: .sha[0:7], message: .commit.message, author: .commit.author.name, date: .commit.author.date}'
```

## Auto-Commit Rules

**Commit immediately:**
- Changes to MEMORY.md, PROJECT-STATE.md
- New deliverables
- Skill updates (when ready for backup)
- Daily logs at end of day

**Commit message format:**
```
<type>: <description>

<optional body>
```

Types: `update`, `add`, `fix`, `refactor`, `docs`

Examples:
- `update: daily memory log 2026-02-17`
- `add: nuclear energy thematic report`
- `fix: gmail monitor error handling`

## Security
- Never commit `.env.gale` (gitignored)
- Never commit sensitive credentials or tokens
- Never commit `.gmail-processed-ids.json` or temp files

## Integration
When making significant changes to workspace files, run:
```bash
node /data/.openclaw/workspace/skills/github/sync-and-commit.js "commit message"
```

This will:
1. Sync workspace → workspace-repo
2. Git add, commit, push
3. Log the operation
