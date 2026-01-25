# API Reference

## Smart Contract: BaseSubscribe

### State Variables

| Name | Type | Description |
|------|------|-------------|
| `usdc` | `IERC20` | USDC token contract |
| `platformWallet` | `address` | Platform fee recipient |
| `owner` | `address` | Contract owner |
| `platformFeeBps` | `uint256` | Platform fee (200 = 2%) |
| `keeperFeeBps` | `uint256` | Keeper fee (50 = 0.5%) |

### Structs

#### Plan

```solidity
struct Plan {
    uint256 id;
    address creator;
    uint256 price;           // in USDC (6 decimals)
    uint256 period;          // in seconds
    string name;
    string description;
    bool active;
    uint256 subscriberCount;
}
```

#### Subscription

```solidity
struct Subscription {
    uint256 id;
    uint256 planId;
    address subscriber;
    uint256 startTime;
    uint256 lastPayment;
    uint256 nextPayment;
    bool active;
}
```

### Creator Functions

#### createPlan

Creates a new subscription plan.

```solidity
function createPlan(
    uint256 price,
    uint256 period,
    string calldata name,
    string calldata description
) external returns (uint256 planId)
```

**Parameters:**
- `price`: Price in USDC (6 decimals). E.g., 10000000 = $10
- `period`: Billing period in seconds. 2592000 = 30 days
- `name`: Plan name (required)
- `description`: Plan description

**Returns:** The created plan's ID

**Events:** `PlanCreated(planId, creator, price, period)`

---

#### updatePlan

Activates or deactivates a plan.

```solidity
function updatePlan(uint256 planId, bool active) external
```

**Requirements:** Caller must be the plan creator

**Events:** `PlanUpdated(planId, active)`

---

#### withdrawCreatorEarnings

Withdraws accumulated creator earnings.

```solidity
function withdrawCreatorEarnings() external
```

**Events:** `CreatorWithdrawal(creator, amount)`

### Subscriber Functions

#### subscribe

Subscribes to a plan. Requires prior USDC approval.

```solidity
function subscribe(uint256 planId) external returns (uint256 subscriptionId)
```

**Requirements:**
- Plan must exist and be active
- Subscriber must have approved USDC
- Subscriber must have sufficient USDC balance
- Cannot already be subscribed to the same plan

**Events:** `Subscribed(subscriptionId, planId, subscriber)`

---

#### cancelSubscription

Cancels a subscription with pro-rata refund.

```solidity
function cancelSubscription(uint256 subscriptionId) external
```

**Requirements:** Caller must be the subscriber

**Refund Calculation:**
```
remainingTime = nextPayment - currentTime
refundAmount = (remainingTime × price) / period
```

**Events:** `SubscriptionCancelled(subscriptionId, refundAmount)`

### Keeper Functions

#### executeSubscription

Executes a single subscription payment.

```solidity
function executeSubscription(uint256 subscriptionId) external
```

**Requirements:**
- Subscription must be active
- Payment must be due (currentTime >= nextPayment)
- Subscriber must have sufficient USDC balance and approval

**Fee Distribution:**
```
platformCut = amount × 2%
keeperCut = amount × 0.5%
creatorCut = amount - platformCut - keeperCut
```

**Events:** `PaymentExecuted(subscriptionId, keeper, amount)`

---

#### executeSubscriptions

Batch executes multiple subscription payments.

```solidity
function executeSubscriptions(uint256[] calldata subscriptionIds) external
```

Failed executions are skipped (no revert).

---

#### getExecutableSubscriptions

Returns all subscriptions ready for execution.

```solidity
function getExecutableSubscriptions() external view returns (uint256[] memory)
```

A subscription is executable when:
- `active == true`
- `currentTime >= nextPayment`
- Plan is active
- Subscriber has sufficient USDC balance
- Subscriber has sufficient USDC approval

### View Functions

#### getPlan

```solidity
function getPlan(uint256 planId) external view returns (Plan memory)
```

#### getSubscription

```solidity
function getSubscription(uint256 subscriptionId) external view returns (Subscription memory)
```

#### getCreatorPlans

```solidity
function getCreatorPlans(address creator) external view returns (uint256[] memory)
```

#### getUserSubscriptions

```solidity
function getUserSubscriptions(address user) external view returns (uint256[] memory)
```

#### getCreatorBalance

```solidity
function getCreatorBalance(address creator) external view returns (uint256)
```

#### getAllPlansCount

```solidity
function getAllPlansCount() external view returns (uint256)
```

#### getAllSubscriptionsCount

```solidity
function getAllSubscriptionsCount() external view returns (uint256)
```

### Admin Functions

#### setPlatformFee

```solidity
function setPlatformFee(uint256 newFeeBps) external
```

Max: 1000 (10%)

#### setKeeperFee

```solidity
function setKeeperFee(uint256 newFeeBps) external
```

Max: 500 (5%)

#### setPlatformWallet

```solidity
function setPlatformWallet(address newWallet) external
```

#### transferOwnership

```solidity
function transferOwnership(address newOwner) external
```

### Events

```solidity
event PlanCreated(uint256 indexed planId, address indexed creator, uint256 price, uint256 period);
event PlanUpdated(uint256 indexed planId, bool active);
event Subscribed(uint256 indexed subscriptionId, uint256 indexed planId, address indexed subscriber);
event SubscriptionCancelled(uint256 indexed subscriptionId, uint256 refundAmount);
event PaymentExecuted(uint256 indexed subscriptionId, address indexed keeper, uint256 amount);
event CreatorWithdrawal(address indexed creator, uint256 amount);
```

### Error Messages

| Error | Cause |
|-------|-------|
| "Not owner" | Caller is not contract owner |
| "Not plan creator" | Caller is not the plan's creator |
| "Not subscriber" | Caller is not the subscription's subscriber |
| "Price must be > 0" | Plan price is zero |
| "Period must be >= 1 day" | Plan period is less than 86400 seconds |
| "Name required" | Plan name is empty |
| "Plan does not exist" | Plan ID is invalid |
| "Plan not active" | Plan has been deactivated |
| "Already subscribed to this plan" | User already has active subscription |
| "Payment failed" | USDC transfer failed |
| "Subscription not active" | Subscription has been cancelled |
| "Payment not due" | Current time is before nextPayment |
| "No balance" | Creator has no withdrawable balance |
| "Fee too high" | Fee exceeds maximum allowed |
| "Invalid address" | Address is zero address |
