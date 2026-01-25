# Keeper Guide

Keepers are responsible for executing subscription payments and earn 0.5% of each payment as a reward.

## How It Works

1. Keepers monitor the contract for due subscriptions
2. When a subscription's `nextPayment` timestamp passes, it becomes executable
3. Keepers call `executeSubscription()` or `executeSubscriptions()` (batch)
4. The keeper receives 0.5% of the payment amount

## Requirements

- ETH on Base for gas fees
- Node.js 18+
- Private key with funded wallet

## Setup

### 1. Clone and Install

```bash
cd keeper
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
KEEPER_PRIVATE_KEY=your_private_key_without_0x
RPC_URL=https://mainnet.base.org
CONTRACT_ADDRESS=0x...
MIN_PROFIT_USD=0.10
MAX_GAS_PRICE_GWEI=1
MODE=cron
CRON_SCHEDULE=0 * * * *
```

### 3. Run the Bot

```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start
```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `KEEPER_PRIVATE_KEY` | Wallet private key (no 0x) | Required |
| `RPC_URL` | Base RPC endpoint | mainnet.base.org |
| `CONTRACT_ADDRESS` | BaseSubscribe contract | Required |
| `MIN_PROFIT_USD` | Minimum profit to execute | 0.10 |
| `MAX_GAS_PRICE_GWEI` | Skip if gas higher | 10 |
| `MODE` | `cron` or `manual` | cron |
| `CRON_SCHEDULE` | Cron expression | 0 * * * * (hourly) |

## Profitability

The bot calculates profitability before executing:

```
Keeper Reward = Payment Amount × 0.5%
Net Profit = Keeper Reward - Gas Cost
```

Execution only proceeds if `Net Profit >= MIN_PROFIT_USD`.

### Example

- Subscription payment: $10 USDC
- Keeper reward: $0.05 (0.5%)
- Estimated gas cost: $0.01
- Net profit: $0.04

If `MIN_PROFIT_USD=0.03`, the bot will execute.

## Batch Execution

For multiple due subscriptions, batch execution is more gas-efficient:

- Single: ~150,000 gas
- Batch: ~50,000 base + ~100,000 per subscription

## Monitoring

The bot logs:

- Executable subscriptions found
- Reward calculations
- Gas estimates
- Profitability analysis
- Transaction hashes

## Best Practices

1. **Monitor your wallet balance** - Keep enough ETH for gas
2. **Adjust MIN_PROFIT_USD** - Higher values = fewer executions but better profit margins
3. **Watch gas prices** - Base typically has low gas, but spikes happen
4. **Run multiple instances** - Consider redundancy for reliability
5. **Use a dedicated wallet** - Don't use your main wallet for keeper operations

## Troubleshooting

### "No subscriptions to execute"
- Normal when no payments are due
- Check if subscribers have approved USDC

### "Gas price too high"
- Increase `MAX_GAS_PRICE_GWEI` or wait for lower gas

### "Payment failed"
- Subscriber may have insufficient USDC balance
- Subscriber may have revoked USDC approval

### Transaction reverts
- Plan may have been deactivated
- Subscription may have been cancelled
