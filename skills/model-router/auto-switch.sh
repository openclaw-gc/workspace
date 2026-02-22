#!/bin/bash
# Automatic Model Router - Call at start of each message
# Returns: model to use (or "no-switch" if current is optimal)

MESSAGE="$1"
CURRENT_MODEL="${2:-anthropic/claude-sonnet-4-5}"
CONTEXT_SIZE="${3:-80000}"

cd /data/.openclaw/workspace/skills/model-router

# Get routing decision
DECISION=$(node integrate.js analyze "$MESSAGE" "$CURRENT_MODEL" "$CONTEXT_SIZE" 2>/dev/null)

SHOULD_SWITCH=$(echo "$DECISION" | jq -r '.shouldSwitch')
RECOMMENDED=$(echo "$DECISION" | jq -r '.recommendedModel')
TIER=$(echo "$DECISION" | jq -r '.tier')

if [ "$SHOULD_SWITCH" = "true" ]; then
    echo "$RECOMMENDED"
else
    echo "no-switch"
fi
