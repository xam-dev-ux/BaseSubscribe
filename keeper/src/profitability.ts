import { ethers } from 'ethers'
import { config } from './config'

export interface SubscriptionInfo {
  id: bigint
  planPrice: bigint
  keeperReward: bigint
}

export class ProfitabilityCalculator {
  // Estimated gas for single subscription execution
  private static readonly SINGLE_EXEC_GAS = BigInt(150000)

  // Estimated gas per subscription in batch
  private static readonly BATCH_EXEC_GAS_PER_SUB = BigInt(100000)

  // Base gas for batch transaction
  private static readonly BATCH_BASE_GAS = BigInt(50000)

  calculateKeeperReward(planPrice: bigint): bigint {
    return (planPrice * BigInt(config.keeperFeeBps)) / BigInt(10000)
  }

  calculateKeeperRewardUsd(planPrice: bigint): number {
    const reward = this.calculateKeeperReward(planPrice)
    return Number(ethers.formatUnits(reward, config.usdcDecimals))
  }

  estimateSingleExecutionGas(): bigint {
    return ProfitabilityCalculator.SINGLE_EXEC_GAS
  }

  estimateBatchExecutionGas(count: number): bigint {
    return ProfitabilityCalculator.BATCH_BASE_GAS +
           ProfitabilityCalculator.BATCH_EXEC_GAS_PER_SUB * BigInt(count)
  }

  isProfitable(
    rewardUsd: number,
    gasCostUsd: number,
    minProfitUsd: number = config.minProfitUsd
  ): boolean {
    const netProfit = rewardUsd - gasCostUsd
    return netProfit >= minProfitUsd
  }

  calculateBatchProfitability(
    subscriptions: SubscriptionInfo[],
    gasCostUsd: number
  ): { profitable: boolean; netProfitUsd: number; totalRewardUsd: number } {
    const totalReward = subscriptions.reduce(
      (sum, sub) => sum + sub.keeperReward,
      BigInt(0)
    )
    const totalRewardUsd = Number(ethers.formatUnits(totalReward, config.usdcDecimals))
    const netProfitUsd = totalRewardUsd - gasCostUsd

    return {
      profitable: netProfitUsd >= config.minProfitUsd,
      netProfitUsd,
      totalRewardUsd,
    }
  }
}
