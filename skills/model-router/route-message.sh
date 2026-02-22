#!/bin/bash
# Quick routing decision for current message
# Usage: route-message.sh "<message>" <context_size>

MESSAGE="$1"
CONTEXT_SIZE="${2:-50000}"
CURRENT_MODEL="${3:-anthropic/claude-sonnet-4-5}"

cd /data/.openclaw/workspace/skills/model-router

# Get routing decision
DECISION=$(node integrate.js analyze "$MESSAGE" "$CURRENT_MODEL" "$CONTEXT_SIZE")

# Extract key fields
SHOULD_SWITCH=$(echo "$DECISION" | jq -r '.shouldSwitch')
RECOMMENDED_MODEL=$(echo "$DECISION" | jq -r '.recommendedModel')
TIER=$(echo "$DECISION" | jq -r '.tier')
REASONING=$(echo "$DECISION" | jq -r '.reasoning')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 MODEL ROUTER DECISION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Message: ${MESSAGE:0:80}..."
echo "Tier: $TIER"
echo "Current: $CURRENT_MODEL"
echo "Recommended: $RECOMMENDED_MODEL"
echo "Switch: $SHOULD_SWITCH"
echo "Reasoning: $REASONING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$SHOULD_SWITCH" = "true" ]; then
    echo ""
    echo "💡 Call: session_status(model=\"$RECOMMENDED_MODEL\")"
    echo ""
fi

# Return JSON for programmatic use
echo "$DECISION"
