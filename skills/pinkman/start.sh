#!/bin/bash
# Pinkman Listener Startup Script
# Manages daemon process, logging, PID tracking

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LISTENER="$SCRIPT_DIR/listener.js"
PID_FILE="$SCRIPT_DIR/.listener.pid"
LOG_FILE="$SCRIPT_DIR/../../memory/pinkman-listener.log"

action="${1:-start}"

case "$action" in
  start)
    if [ -f "$PID_FILE" ]; then
      OLD_PID=$(cat "$PID_FILE")
      if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "[PINKMAN] Listener already running (PID: $OLD_PID)"
        exit 0
      fi
    fi
    
    echo "[PINKMAN] Starting listener..."
    nohup node "$LISTENER" >> "$LOG_FILE" 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    echo "[PINKMAN] Listener started (PID: $NEW_PID)"
    echo "[PINKMAN] Logging to: $LOG_FILE"
    ;;

  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        rm "$PID_FILE"
        echo "[PINKMAN] Listener stopped (PID: $PID)"
      else
        echo "[PINKMAN] Process not running"
        rm "$PID_FILE"
      fi
    else
      echo "[PINKMAN] No PID file found"
    fi
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        echo "[PINKMAN] Listener running (PID: $PID)"
        exit 0
      else
        echo "[PINKMAN] PID file exists but process not running"
        exit 1
      fi
    else
      echo "[PINKMAN] Listener not running"
      exit 1
    fi
    ;;

  logs)
    tail -f "$LOG_FILE"
    ;;

  *)
    echo "Usage: $0 {start|stop|status|logs}"
    exit 1
    ;;
esac
