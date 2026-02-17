# Trading Skill - Agentic Trading System

## Overview
Automated trading system for digital assets. Currently in Phase 1 (testnet only).

## Status
🟡 **Phase 1** - Testnet experimentation (GREEN-LIT by GC)

## Phase Roadmap

**Phase 1** (Current): Testnet Foundation
- Coinbase CDP SDK integration
- Test wallet on Sepolia
- Momentum strategy implementation
- Trade execution + P&L tracking

**Phase 2**: Mainnet Prep
- Lit Protocol (MPC signing)
- Safe{Wallet} multisig
- Risk management framework

**Phase 3**: Production Deploy ($5K capital)

**Phase 4**: Scale to $50K

---

## Quick Start (Testnet)

### Setup Wallet
```bash
node /data/.openclaw/workspace/skills/trading/setup-wallet.js
```

### Request Test ETH
```bash
node /data/.openclaw/workspace/skills/trading/faucet.js
```

### Backtest Strategy
```bash
node /data/.openclaw/workspace/skills/trading/backtest.js \
  --strategy=momentum \
  --pair=ETH/USD \
  --start="2025-12-01" \
  --end="2026-02-01"
```

### Run Live (Testnet)
```bash
node /data/.openclaw/workspace/skills/trading/monitor.js \
  --strategy=momentum \
  --pair=ETH/USD \
  --capital=0.1
```

---

## Strategies

### Momentum (Phase 1)
- Signal: Price vs 20-period MA
- Position size: Fixed (0.01 ETH)
- Execution: Uniswap V3 testnet
- Risk: Basic (max position limit)

### Mean-Reversion (Phase 2+)
- Signal: Bollinger Band extremes
- Mean reversion to midpoint
- Statistical arbitrage

### Arbitrage (Phase 3+)
- Cross-exchange price differences
- DEX vs CEX
- Atomic execution

---

## Files

- `SKILL.md` - This documentation
- `setup-wallet.js` - Wallet creation
- `faucet.js` - Testnet ETH
- `strategy-momentum.js` - Momentum implementation
- `executor.js` - Trade execution
- `monitor.js` - Live trading loop
- `backtest.js` - Historical testing
- `lib/` - Shared utilities

---

## Credentials

**Testnet wallet:**
- Private key: `/data/.openclaw/workspace/.credentials/trading-testnet-key.enc` (encrypted)
- Address: Logged on first run
- Network: Ethereum Sepolia

**⚠️ NEVER use testnet keys on mainnet**
**⚠️ NEVER commit keys to GitHub**

---

## Safety

**Phase 1 (current):**
- Testnet only (no real value)
- Single key wallet (acceptable for testing)
- Small position sizes (0.01-0.1 ETH)

**Phase 2+ (mainnet):**
- MPC signing (Lit Protocol)
- Multisig (Safe{Wallet})
- Formal risk limits
- Australian regulatory compliance

---

## Next Steps

1. Complete Phase 1 testnet testing
2. Review results with GC
3. If successful: proceed to Phase 2 (mainnet prep)
4. If issues: iterate on testnet

**No mainnet deployment without explicit GC approval.**
