// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./interfaces/IBaseSubscribe.sol";
import "./libraries/ProRataLib.sol";

/// @title BaseSubscribe
/// @notice Decentralized subscription platform on Base
/// @dev Supports recurring USDC payments with keeper execution and pro-rata refunds
contract BaseSubscribe is IBaseSubscribe {
    using ProRataLib for uint256;

    IERC20 public immutable usdc;
    address public platformWallet;
    address public owner;

    uint256 public platformFeeBps = 200; // 2%
    uint256 public keeperFeeBps = 50;    // 0.5%

    uint256 private _planCounter;
    uint256 private _subscriptionCounter;

    mapping(uint256 => Plan) private _plans;
    mapping(uint256 => Subscription) private _subscriptions;
    mapping(address => uint256[]) private _userSubscriptions;
    mapping(address => uint256[]) private _creatorPlans;
    mapping(address => uint256) private _creatorBalances;

    uint256[] private _allSubscriptions;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyPlanCreator(uint256 planId) {
        require(_plans[planId].creator == msg.sender, "Not plan creator");
        _;
    }

    modifier onlySubscriber(uint256 subscriptionId) {
        require(_subscriptions[subscriptionId].subscriber == msg.sender, "Not subscriber");
        _;
    }

    constructor(address _usdc, address _platformWallet) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_platformWallet != address(0), "Invalid platform wallet");

        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
        owner = msg.sender;
    }

    // ============ Creator Functions ============

    /// @notice Create a new subscription plan
    /// @param price Price in USDC (6 decimals)
    /// @param period Subscription period in seconds
    /// @param name Plan name
    /// @param description Plan description
    /// @return planId The ID of the created plan
    function createPlan(
        uint256 price,
        uint256 period,
        string calldata name,
        string calldata description
    ) external returns (uint256 planId) {
        require(price > 0, "Price must be > 0");
        require(period >= 1 days, "Period must be >= 1 day");
        require(bytes(name).length > 0, "Name required");

        planId = ++_planCounter;

        _plans[planId] = Plan({
            id: planId,
            creator: msg.sender,
            price: price,
            period: period,
            name: name,
            description: description,
            active: true,
            subscriberCount: 0
        });

        _creatorPlans[msg.sender].push(planId);

        emit PlanCreated(planId, msg.sender, price, period);
    }

    /// @notice Update plan active status
    /// @param planId The plan ID
    /// @param active New active status
    function updatePlan(uint256 planId, bool active) external onlyPlanCreator(planId) {
        _plans[planId].active = active;
        emit PlanUpdated(planId, active);
    }

    /// @notice Withdraw accumulated earnings
    function withdrawCreatorEarnings() external {
        uint256 balance = _creatorBalances[msg.sender];
        require(balance > 0, "No balance");

        _creatorBalances[msg.sender] = 0;

        require(usdc.transfer(msg.sender, balance), "Transfer failed");

        emit CreatorWithdrawal(msg.sender, balance);
    }

    // ============ Subscriber Functions ============

    /// @notice Subscribe to a plan
    /// @param planId The plan ID to subscribe to
    /// @return subscriptionId The ID of the created subscription
    function subscribe(uint256 planId) external returns (uint256 subscriptionId) {
        Plan storage plan = _plans[planId];
        require(plan.id != 0, "Plan does not exist");
        require(plan.active, "Plan not active");

        // Check for existing active subscription to same plan
        uint256[] storage userSubs = _userSubscriptions[msg.sender];
        for (uint256 i = 0; i < userSubs.length; i++) {
            Subscription storage existingSub = _subscriptions[userSubs[i]];
            if (existingSub.planId == planId && existingSub.active) {
                revert("Already subscribed to this plan");
            }
        }

        // Transfer first payment
        require(
            usdc.transferFrom(msg.sender, address(this), plan.price),
            "Payment failed"
        );

        subscriptionId = ++_subscriptionCounter;

        _subscriptions[subscriptionId] = Subscription({
            id: subscriptionId,
            planId: planId,
            subscriber: msg.sender,
            startTime: block.timestamp,
            lastPayment: block.timestamp,
            nextPayment: block.timestamp + plan.period,
            active: true
        });

        _userSubscriptions[msg.sender].push(subscriptionId);
        _allSubscriptions.push(subscriptionId);
        plan.subscriberCount++;

        // Distribute first payment (no keeper fee for direct subscription)
        uint256 platformCut = (plan.price * platformFeeBps) / 10000;
        uint256 creatorCut = plan.price - platformCut;

        _creatorBalances[plan.creator] += creatorCut;
        require(usdc.transfer(platformWallet, platformCut), "Platform transfer failed");

        emit Subscribed(subscriptionId, planId, msg.sender);
    }

    /// @notice Cancel subscription with pro-rata refund
    /// @param subscriptionId The subscription ID to cancel
    function cancelSubscription(uint256 subscriptionId) external onlySubscriber(subscriptionId) {
        Subscription storage sub = _subscriptions[subscriptionId];
        require(sub.active, "Subscription not active");

        Plan storage plan = _plans[sub.planId];

        sub.active = false;
        plan.subscriberCount--;

        // Calculate and send pro-rata refund
        uint256 refund = ProRataLib.calculateRefund(plan.price, plan.period, sub.nextPayment);

        if (refund > 0) {
            // Deduct refund from creator balance if possible
            if (_creatorBalances[plan.creator] >= refund) {
                _creatorBalances[plan.creator] -= refund;
                require(usdc.transfer(msg.sender, refund), "Refund failed");
            }
        }

        emit SubscriptionCancelled(subscriptionId, refund);
    }

    // ============ Keeper Functions ============

    /// @notice Execute a single subscription payment
    /// @param subscriptionId The subscription ID to execute
    function executeSubscription(uint256 subscriptionId) external {
        _executePayment(subscriptionId, msg.sender);
    }

    /// @notice Execute multiple subscription payments
    /// @param subscriptionIds Array of subscription IDs to execute
    function executeSubscriptions(uint256[] calldata subscriptionIds) external {
        for (uint256 i = 0; i < subscriptionIds.length; i++) {
            // Try-catch to continue on failed executions
            try this.executeSubscriptionInternal(subscriptionIds[i], msg.sender) {
            } catch {
                // Skip failed executions
            }
        }
    }

    /// @notice Internal function for batch execution try-catch
    function executeSubscriptionInternal(uint256 subscriptionId, address keeper) external {
        require(msg.sender == address(this), "Internal only");
        _executePayment(subscriptionId, keeper);
    }

    function _executePayment(uint256 subscriptionId, address keeper) internal {
        Subscription storage sub = _subscriptions[subscriptionId];
        require(sub.active, "Subscription not active");
        require(block.timestamp >= sub.nextPayment, "Payment not due");

        Plan storage plan = _plans[sub.planId];
        require(plan.active, "Plan not active");

        // Transfer payment from subscriber
        require(
            usdc.transferFrom(sub.subscriber, address(this), plan.price),
            "Payment failed"
        );

        // Calculate fee distribution
        (uint256 platformCut, uint256 keeperCut, uint256 creatorCut) =
            ProRataLib.calculateFees(plan.price, platformFeeBps, keeperFeeBps);

        // Update subscription
        sub.lastPayment = block.timestamp;
        sub.nextPayment = block.timestamp + plan.period;

        // Distribute payments
        _creatorBalances[plan.creator] += creatorCut;
        require(usdc.transfer(platformWallet, platformCut), "Platform transfer failed");
        require(usdc.transfer(keeper, keeperCut), "Keeper transfer failed");

        emit PaymentExecuted(subscriptionId, keeper, plan.price);
    }

    /// @notice Get all subscriptions that are due for payment
    /// @return subscriptionIds Array of executable subscription IDs
    function getExecutableSubscriptions() external view returns (uint256[] memory) {
        uint256 count = 0;

        // First pass: count executable subscriptions
        for (uint256 i = 0; i < _allSubscriptions.length; i++) {
            uint256 subId = _allSubscriptions[i];
            Subscription storage sub = _subscriptions[subId];

            if (sub.active &&
                block.timestamp >= sub.nextPayment &&
                _plans[sub.planId].active &&
                usdc.balanceOf(sub.subscriber) >= _plans[sub.planId].price &&
                usdc.allowance(sub.subscriber, address(this)) >= _plans[sub.planId].price) {
                count++;
            }
        }

        // Second pass: collect executable subscription IDs
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < _allSubscriptions.length; i++) {
            uint256 subId = _allSubscriptions[i];
            Subscription storage sub = _subscriptions[subId];

            if (sub.active &&
                block.timestamp >= sub.nextPayment &&
                _plans[sub.planId].active &&
                usdc.balanceOf(sub.subscriber) >= _plans[sub.planId].price &&
                usdc.allowance(sub.subscriber, address(this)) >= _plans[sub.planId].price) {
                result[index++] = subId;
            }
        }

        return result;
    }

    // ============ View Functions ============

    function getPlan(uint256 planId) external view returns (Plan memory) {
        return _plans[planId];
    }

    function getSubscription(uint256 subscriptionId) external view returns (Subscription memory) {
        return _subscriptions[subscriptionId];
    }

    function getCreatorPlans(address creator) external view returns (uint256[] memory) {
        return _creatorPlans[creator];
    }

    function getUserSubscriptions(address user) external view returns (uint256[] memory) {
        return _userSubscriptions[user];
    }

    function getCreatorBalance(address creator) external view returns (uint256) {
        return _creatorBalances[creator];
    }

    function getAllPlansCount() external view returns (uint256) {
        return _planCounter;
    }

    function getAllSubscriptionsCount() external view returns (uint256) {
        return _subscriptionCounter;
    }

    // ============ Admin Functions ============

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
    }

    function setKeeperFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high"); // Max 5%
        keeperFeeBps = newFeeBps;
    }

    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
