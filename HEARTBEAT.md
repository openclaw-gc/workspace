# HEARTBEAT.md - Minimal Context Operations

## Operating Mode

When you receive a heartbeat or Gmail monitoring request:
- Do NOT load MEMORY.md (use memory_search only if needed)
- Do NOT load PROJECT-STATE.md
- Do NOT load daily memory files
- Keep response <200 tokens
- Use only SOUL.md, IDENTITY.md, USER.md (core identity)

## Gmail Monitoring Checklist

Every 30 minutes:
1. Check gale.boetticher.ai@gmail.com
2. List new emails from last 30 minutes only
3. Filter: Report only if important (from GC, Nadia, Adrian, or system alerts)
4. Format: `sender | subject | brief snippet`
5. Keep response <200 tokens

## No Active Tasks

Router is live in enforce mode (Haiku default, context pruning 15min TTL).
