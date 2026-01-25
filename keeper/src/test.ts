import { ethers } from 'ethers'
import { ProfitabilityCalculator } from './profitability'
import { GasMonitor } from './gasMonitor'

async function runTests() {
  console.log('BaseSubscribe Keeper - Unit Tests\n')

  // Test profitability calculator
  console.log('Testing ProfitabilityCalculator...')
  const calc = new ProfitabilityCalculator()

  // Test keeper reward calculation (0.5% of 10 USDC)
  const price = ethers.parseUnits('10', 6) // 10 USDC
  const reward = calc.calculateKeeperReward(price)
  const expectedReward = ethers.parseUnits('0.05', 6) // 0.05 USDC

  console.log(`  Price: 10 USDC`)
  console.log(`  Keeper reward: ${ethers.formatUnits(reward, 6)} USDC`)
  console.log(`  Expected: ${ethers.formatUnits(expectedReward, 6)} USDC`)
  console.log(`  Test: ${reward === expectedReward ? 'PASS' : 'FAIL'}`)

  // Test profitability check
  const rewardUsd = 0.05 // $0.05
  const gasCostUsd = 0.01 // $0.01
  const minProfit = 0.03

  const isProfitable = calc.isProfitable(rewardUsd, gasCostUsd, minProfit)
  console.log(`\n  Reward: $${rewardUsd}`)
  console.log(`  Gas cost: $${gasCostUsd}`)
  console.log(`  Net profit: $${rewardUsd - gasCostUsd}`)
  console.log(`  Min profit: $${minProfit}`)
  console.log(`  Profitable: ${isProfitable}`)
  console.log(`  Test: ${isProfitable === true ? 'PASS' : 'FAIL'}`)

  // Test batch profitability
  const subscriptions = [
    { id: BigInt(1), planPrice: ethers.parseUnits('10', 6), keeperReward: ethers.parseUnits('0.05', 6) },
    { id: BigInt(2), planPrice: ethers.parseUnits('20', 6), keeperReward: ethers.parseUnits('0.10', 6) },
    { id: BigInt(3), planPrice: ethers.parseUnits('5', 6), keeperReward: ethers.parseUnits('0.025', 6) },
  ]

  const batchResult = calc.calculateBatchProfitability(subscriptions, 0.05)
  console.log(`\n  Batch test (3 subscriptions):`)
  console.log(`  Total reward: $${batchResult.totalRewardUsd.toFixed(4)}`)
  console.log(`  Gas cost: $0.05`)
  console.log(`  Net profit: $${batchResult.netProfitUsd.toFixed(4)}`)
  console.log(`  Profitable: ${batchResult.profitable}`)
  console.log(`  Test: ${batchResult.profitable === true && batchResult.totalRewardUsd === 0.175 ? 'PASS' : 'FAIL'}`)

  // Test gas estimation
  console.log('\nTesting gas estimation...')
  const singleGas = calc.estimateSingleExecutionGas()
  const batchGas = calc.estimateBatchExecutionGas(5)
  console.log(`  Single execution gas: ${singleGas}`)
  console.log(`  Batch (5 subs) gas: ${batchGas}`)
  console.log(`  Gas per sub in batch: ${(batchGas - BigInt(50000)) / BigInt(5)}`)

  console.log('\nAll tests completed!')
}

runTests().catch(console.error)
