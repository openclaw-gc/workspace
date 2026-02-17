#!/bin/bash
# Analyze routing costs and patterns

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SKILL_DIR"

echo "═══════════════════════════════════════════"
echo "  Model Router - Cost Analysis"
echo "═══════════════════════════════════════════"
echo

echo "📊 Budget Status:"
node cost-tracker.js status
echo

echo "📈 Today's Summary:"
node cost-tracker.js today
echo

echo "🔀 Routing Stats (Last 7 Days):"
node router.js stats 7
echo

echo "📝 Recent Routing Decisions (Last 10):"
if [ -f .routing-log.jsonl ]; then
  tail -10 .routing-log.jsonl | jq -r '[.date, .tier, .model, .messagePreview] | @tsv' | \
    awk 'BEGIN {print "Date\t\t\tTier\t\tModel\t\t\t\t\tMessage"} {print}'
else
  echo "No routing log found yet"
fi
