// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBaseSubscribe {
    struct Plan {
        uint256 id;
        address creator;
        uint256 price;
        uint256 period;
        string name;
        string description;
        bool active;
        uint256 subscriberCount;
    }

    struct Subscription {
        uint256 id;
        uint256 planId;
        address subscriber;
        uint256 startTime;
        uint256 lastPayment;
        uint256 nextPayment;
        bool active;
    }

    event PlanCreated(uint256 indexed planId, address indexed creator, uint256 price, uint256 period);
    event PlanUpdated(uint256 indexed planId, bool active);
    event Subscribed(uint256 indexed subscriptionId, uint256 indexed planId, address indexed subscriber);
    event SubscriptionCancelled(uint256 indexed subscriptionId, uint256 refundAmount);
    event PaymentExecuted(uint256 indexed subscriptionId, address indexed keeper, uint256 amount);
    event CreatorWithdrawal(address indexed creator, uint256 amount);

    function createPlan(uint256 price, uint256 period, string calldata name, string calldata description) external returns (uint256);
    function updatePlan(uint256 planId, bool active) external;
    function subscribe(uint256 planId) external returns (uint256);
    function cancelSubscription(uint256 subscriptionId) external;
    function executeSubscription(uint256 subscriptionId) external;
    function executeSubscriptions(uint256[] calldata subscriptionIds) external;
    function withdrawCreatorEarnings() external;

    function getPlan(uint256 planId) external view returns (Plan memory);
    function getSubscription(uint256 subscriptionId) external view returns (Subscription memory);
    function getExecutableSubscriptions() external view returns (uint256[] memory);
    function getCreatorPlans(address creator) external view returns (uint256[] memory);
    function getUserSubscriptions(address user) external view returns (uint256[] memory);
    function getCreatorBalance(address creator) external view returns (uint256);
}
