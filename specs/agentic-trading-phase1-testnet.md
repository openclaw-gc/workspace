# Agentic Trading Phase 1 - Testnet Foundation

**Status:** GREEN-LIT by GC  
**Objective:** Prove the concept on testnet before touching real capital  
**Timeline:** Phase 1 complete within 48h

---

## Phase 1 Scope (Testnet Only)

### Core Infrastructure
1. ✅ Coinbase CDP SDK integration
2. ✅ Test wallet creation (Sepolia testnet)
3. ✅ Faucet integration (get test ETH)
4. ✅ Basic trade execution framework
5. ✅ Momentum strategy implementation
6. ✅ Logging + audit trail

### Out of Scope (Future Phases)
- Real mainnet deployment
- Production capital ($50K allocation)
- Advanced strategies (mean-reversion, arbitrage, etc.)
- Lit Protocol integration (MPC signing)
- Safe{Wallet} multisig
- Full risk management system

---

## Technical Stack (Phase 1)

**Base Layer:**
- Coinbase CDP SDK (Node.js)
- Ethereum Sepolia testnet
- Test wallet (single-key, acceptable for testnet)

**Data Sources:**
- CoinGecko API (price feeds)
- On-chain data (via CDP SDK)

**Execution:**
- Uniswap V3 (testnet deployment)
- Automated trade execution
- Position tracking

**Storage:**
- Local JSON (wallet state, trade history)
- PostgreSQL (optional, future)

---

## Testnet Wallet Setup

**Creation:**
```bash
node /data/.openclaw/workspace/skills/trading/setup-wallet.js
```

**Output:**
- Wallet address
- Private key (encrypted, stored in `.credentials/`)
- Backup seed phrase (show once, GC stores)

**Security (testnet acceptable):**
- Single private key (no MPC yet)
- Encrypted at rest
- Never logged in plaintext
- Testnet only (no real value at risk)

**Faucet:**
- Sepolia faucet: https://sepoliafaucet.com/
- Request 0.5 ETH for gas
- Automated top-up when balance < 0.1 ETH

---

## Momentum Strategy (Simplified)

**Signal:**
- Price crosses above 20-period moving average → BUY
- Price crosses below 20-period moving average → SELL
- Position size: Fixed (e.g., 0.01 ETH per trade)

**Execution:**
- Check signal every 5 minutes
- If signal fires + no open position → open position
- If signal fires + open position → close + reverse
- Track P&L

**Risk Management (basic):**
- Max position: 0.1 ETH (testnet)
- No leverage (spot only)
- Stop loss: None (testnet learning phase)

---

## Code Structure

```
skills/trading/
├── SKILL.md                 # Documentation
├── setup-wallet.js          # Create/load wallet
├── faucet.js                # Request testnet ETH
├── strategy-momentum.js     # Momentum implementation
├── executor.js              # Trade execution
├── monitor.js               # Position tracking
├── backtest.js              # Historical testing
├── lib/
│   ├── wallet.js            # Wallet utilities
│   ├── uniswap.js           # DEX integration
│   ├── signals.js           # Strategy logic
│   └── logger.js            # Audit trail
└── data/
    ├── trades.json          # Trade history
    ├── positions.json       # Open positions
    └── performance.json     # P&L tracking
```

---

## Execution Flow

**1. Initialization**
```javascript
// Load wallet
const wallet = await loadWallet();
console.log(`Wallet: ${wallet.address}`);
console.log(`Balance: ${await wallet.getBalance()} ETH`);

// Check if we need testnet ETH
if (balance < 0.1) {
  await requestFaucet(wallet.address);
}
```

**2. Strategy Loop** (every 5 minutes)
```javascript
// Fetch price data
const price = await getPrice('ETH/USD');
const ma20 = await getMA(20);

// Check signal
const signal = checkMomentum(price, ma20);

// Execute if triggered
if (signal === 'BUY' && !hasPosition) {
  await executeBuy(wallet, 0.01);
} else if (signal === 'SELL' && hasPosition) {
  await executeSell(wallet, position);
}

// Log state
await logTradeAttempt({
  timestamp: Date.now(),
  price,
  ma20,
  signal,
  action: hasPosition ? 'HOLD' : signal,
});
```

**3. Position Tracking**
```javascript
// Check open positions
const positions = await getPositions(wallet);

// Update P&L
for (const pos of positions) {
  const currentPrice = await getPrice(pos.pair);
  const pnl = calculatePnL(pos, currentPrice);
  
  console.log(`${pos.pair}: ${pnl.toFixed(2)} USD`);
}
```

**4. Audit Trail**
```javascript
// Every action logged
{
  "timestamp": "2026-02-18T03:30:00Z",
  "action": "BUY",
  "pair": "ETH/USD",
  "amount": "0.01",
  "price": "2850.00",
  "txHash": "0xabc...",
  "gasUsed": "0.0021",
  "success": true
}
```

---

## Testing Strategy

**Backtest First:**
```bash
node /data/.openclaw/workspace/skills/trading/backtest.js \
  --strategy=momentum \
  --pair=ETH/USD \
  --start="2025-12-01" \
  --end="2026-02-01" \
  --capital=1.0
```

**Output:**
- Total trades: X
- Win rate: Y%
- Total P&L: Z USD
- Max drawdown: W USD
- Sharpe ratio: V

**Live Testnet (if backtest promising):**
```bash
node /data/.openclaw/workspace/skills/trading/monitor.js \
  --strategy=momentum \
  --pair=ETH/USD \
  --capital=0.1 \
  --dryRun=false
```

**Monitor for 7 days:**
- Capture real execution
- Measure slippage
- Track gas costs
- Validate P&L calculation

---

## Success Criteria (Phase 1)

**Must achieve:**
- ✅ Wallet created and funded (testnet)
- ✅ Execute 10+ test trades successfully
- ✅ P&L tracking accurate
- ✅ No critical bugs
- ✅ Audit trail complete

**Nice to have:**
- Positive P&L (testnet, low stakes)
- <5% slippage on trades
- Gas costs <2% of trade value

**Failure conditions:**
- Wallet private key exposed
- Funds lost due to bug
- Cannot execute trades reliably

---

## Phase 2 Preview (Mainnet Prep)

**Once testnet validated:**
1. Lit Protocol integration (MPC signing)
2. Safe{Wallet} multisig (2-of-3: GC, Gale, Cold storage)
3. Real capital allocation ($5K → $10K → $50K)
4. Advanced strategies (mean-reversion, arbitrage)
5. Risk management (stop loss, position limits)
6. Monitoring dashboard integration
7. Regulatory compliance (Australian AFS considerations)

**Not touching mainnet until Phase 1 complete + GC approval.**

---

## Implementation Plan (Next 24h)

### Hour 1-2: Setup
- Install Coinbase CDP SDK
- Create wallet management scripts
- Test faucet integration
- Verify testnet connectivity

### Hour 3-4: Strategy
- Implement momentum logic
- Price feed integration (CoinGecko)
- Signal generation testing

### Hour 5-6: Execution
- Uniswap testnet integration
- Trade execution framework
- Position tracking

### Hour 7-8: Testing
- Backtest on historical data
- Dry-run execution
- Fix bugs

### Hour 9-10: Live Testnet
- First live trade on testnet
- Monitor execution
- Validate P&L

### Hour 11-12: Documentation
- Complete SKILL.md
- Usage examples
- Handoff to GC

**Deliverable:** Working testnet trading bot + documentation

---

## Risk Mitigation

**Testnet risks (low):**
- Bug loses test ETH → request more from faucet
- Strategy loses money → expected, learning phase
- Wallet compromised → testnet only, no real value

**Operational risks:**
- Over-complexity → keep Phase 1 simple
- Scope creep → no mainnet, no advanced features yet
- Time overrun → timebox to 48h, ship what works

**Future risks (mainnet):**
- Regulatory (addressed in Phase 6 of original plan)
- Security (MPC + multisig in Phase 2)
- Capital risk (start small, scale slowly)

---

## Monitoring & Alerts

**What gets logged:**
- Every trade (attempt, execution, result)
- Every signal (BUY/SELL/HOLD)
- Every error (with stack trace)
- Balance checks (every loop)

**What gets alerted:**
- Trade execution failure (Telegram)
- Balance below threshold (0.05 ETH)
- Unexpected error (critical)
- Daily P&L summary (EOD)

**Dashboard integration (Week 2):**
- Live P&L widget
- Trade history table
- Performance chart
- Open positions

---

## Documentation Deliverables

**For GC:**
1. `SKILL.md` - Full usage documentation
2. `SETUP.md` - One-time setup guide
3. `STRATEGY.md` - Momentum logic explained
4. `TRADES.md` - Trade log (auto-generated)
5. `PERFORMANCE.md` - P&L report (auto-generated)

**For Audit:**
- Complete transaction log (JSON + CSV)
- Strategy parameters (versioned)
- Execution timestamps (nanosecond precision)

---

## Next Steps

**Immediate:**
1. Install Coinbase CDP SDK
2. Create test wallet
3. Implement basic momentum strategy
4. Backtest on historical data

**This week:**
5. Deploy to testnet
6. Execute 10+ test trades
7. Validate P&L tracking
8. Document results

**Next week:**
9. Review Phase 1 results with GC
10. Decide: proceed to Phase 2 or iterate
11. If approved: begin mainnet prep

---

**Status:** Ready to build. Green-lit by GC. Testnet only. No real capital at risk.

— Gale 🧪
