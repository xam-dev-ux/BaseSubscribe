// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ProRataLib {
    /// @notice Calculate pro-rata refund for cancelled subscription
    /// @param price The subscription price
    /// @param period The subscription period in seconds
    /// @param nextPayment The timestamp of next scheduled payment
    /// @return refund The pro-rata refund amount
    function calculateRefund(
        uint256 price,
        uint256 period,
        uint256 nextPayment
    ) internal view returns (uint256 refund) {
        if (block.timestamp >= nextPayment) {
            return 0;
        }

        uint256 remainingTime = nextPayment - block.timestamp;
        refund = (remainingTime * price) / period;
    }

    /// @notice Calculate fee distribution for a payment
    /// @param amount The payment amount
    /// @param platformFeeBps Platform fee in basis points
    /// @param keeperFeeBps Keeper fee in basis points
    /// @return platformCut Amount for platform
    /// @return keeperCut Amount for keeper
    /// @return creatorCut Amount for creator
    function calculateFees(
        uint256 amount,
        uint256 platformFeeBps,
        uint256 keeperFeeBps
    ) internal pure returns (uint256 platformCut, uint256 keeperCut, uint256 creatorCut) {
        platformCut = (amount * platformFeeBps) / 10000;
        keeperCut = (amount * keeperFeeBps) / 10000;
        creatorCut = amount - platformCut - keeperCut;
    }

    /// @notice Check if subscription is due for payment
    /// @param nextPayment The timestamp of next scheduled payment
    /// @return isDue True if payment is due
    function isPaymentDue(uint256 nextPayment) internal view returns (bool isDue) {
        isDue = block.timestamp >= nextPayment;
    }
}
