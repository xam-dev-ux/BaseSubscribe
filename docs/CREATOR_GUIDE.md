# Creator Guide

Create subscription plans and earn recurring revenue from your supporters.

## Getting Started

### 1. Connect Your Wallet

Visit the BaseSubscribe app and connect your wallet. We support:
- MetaMask
- WalletConnect-compatible wallets
- Coinbase Wallet

### 2. Create a Plan

Navigate to the Creator Dashboard and fill out:

- **Plan Name**: A clear, descriptive name
- **Description**: What subscribers will receive
- **Price**: Amount in USDC (e.g., 10 for $10)
- **Billing Period**: Weekly, Monthly, or Yearly

### 3. Share Your Plan

Once created, share your plan link with your audience:

```
https://basesubscribe.app/plan/[planId]
```

## Pricing Strategy

### Recommended Pricing

| Tier | Weekly | Monthly | Yearly |
|------|--------|---------|--------|
| Basic | $2-5 | $5-15 | $50-120 |
| Premium | $5-15 | $15-50 | $150-400 |
| VIP | $15+ | $50+ | $400+ |

### Tips

- Start with monthly plans (most popular)
- Offer yearly at a discount (10-20% off)
- Price based on value, not just content volume

## Fee Structure

For every payment received:

| Fee | Amount | Note |
|-----|--------|------|
| Platform Fee | 2% | Supports platform development |
| Keeper Fee | 0.5% | Rewards payment executors |
| **You Receive** | **97.5%** | Direct to your wallet |

### Example

$10/month subscription:
- Platform receives: $0.20
- Keeper receives: $0.05
- You receive: $9.75

## Managing Subscriptions

### View Your Plans

The Creator Dashboard shows:
- All your active plans
- Subscriber counts
- Revenue generated

### Deactivate a Plan

You can deactivate plans to stop new subscriptions:
- Existing subscribers continue until they cancel
- No new subscribers can join

### Withdraw Earnings

Your earnings accumulate in the contract. Click "Withdraw" to transfer to your wallet.

## Subscriber Management

### How Payments Work

1. Subscriber approves USDC spending (one-time)
2. First payment is taken immediately
3. Keepers execute subsequent payments automatically
4. Subscribers can cancel anytime

### Cancellations

When subscribers cancel:
- They receive a pro-rata refund for unused time
- The refund comes from your accumulated balance
- They keep access until the current period ends

### Example Cancellation

- Monthly plan: $10
- Subscriber cancels after 15 days
- Refund: ~$5 (remaining 15 days)

## Best Practices

### Building Subscribers

1. **Clear Value Proposition** - Explain exactly what subscribers get
2. **Regular Content** - Maintain a consistent schedule
3. **Engage Your Community** - Respond to feedback
4. **Exclusive Benefits** - Offer something subscribers can't get elsewhere

### Technical

1. **Keep Your Wallet Secure** - Use a hardware wallet for large balances
2. **Withdraw Regularly** - Don't let large amounts accumulate
3. **Monitor Your Dashboard** - Track subscriber trends

## FAQ

**Q: When do I receive payments?**
A: Payments accumulate in the contract. Withdraw anytime.

**Q: Can I change the price of a plan?**
A: Create a new plan with the new price. Deactivate the old one.

**Q: What happens if a payment fails?**
A: The subscription remains active but payment due. Keepers will retry.

**Q: Can subscribers pause instead of cancel?**
A: Not currently. They must cancel and resubscribe.

**Q: How do I contact a subscriber?**
A: The platform is permissionless - you'll need to build your own community channels.
