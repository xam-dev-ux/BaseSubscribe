import { ethers, Contract, Wallet, JsonRpcProvider } from 'ethers'
import { config } from './config'
import { GasMonitor } from './gasMonitor'
import { ProfitabilityCalculator, SubscriptionInfo } from './profitability'

const BASE_SUBSCRIBE_ABI = [
  'function getExecutableSubscriptions() view returns (uint256[])',
  'function getPlan(uint256 planId) view returns (tuple(uint256 id, address creator, uint256 price, uint256 period, string name, string description, bool active, uint256 subscriberCount))',
  'function getSubscription(uint256 subscriptionId) view returns (tuple(uint256 id, uint256 planId, address subscriber, uint256 startTime, uint256 lastPayment, uint256 nextPayment, bool active))',
  'function executeSubscription(uint256 subscriptionId)',
  'function executeSubscriptions(uint256[] subscriptionIds)',
  'event PaymentExecuted(uint256 indexed subscriptionId, address indexed keeper, uint256 amount)',
]

export class SubscriptionExecutor {
  private provider: JsonRpcProvider
  private wallet: Wallet
  private contract: Contract
  private gasMonitor: GasMonitor
  private profitability: ProfitabilityCalculator

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
    this.wallet = new Wallet(config.privateKey, this.provider)
    this.contract = new Contract(config.contractAddress, BASE_SUBSCRIBE_ABI, this.wallet)
    this.gasMonitor = new GasMonitor(this.provider)
    this.profitability = new ProfitabilityCalculator()
  }

  async getKeeperAddress(): Promise<string> {
    return this.wallet.address
  }

  async getKeeperBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address)
    return ethers.formatEther(balance)
  }

  async getExecutableSubscriptions(): Promise<bigint[]> {
    const subscriptionIds = await this.contract.getExecutableSubscriptions()
    return subscriptionIds.map((id: any) => BigInt(id))
  }

  async getSubscriptionInfo(subscriptionId: bigint): Promise<SubscriptionInfo | null> {
    try {
      const subscription = await this.contract.getSubscription(subscriptionId)
      const plan = await this.contract.getPlan(subscription.planId)

      return {
        id: subscriptionId,
        planPrice: BigInt(plan.price),
        keeperReward: this.profitability.calculateKeeperReward(BigInt(plan.price)),
      }
    } catch {
      return null
    }
  }

  async executeSubscription(subscriptionId: bigint): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log(`Executing subscription ${subscriptionId}...`)

      const tx = await this.contract.executeSubscription(subscriptionId)
      console.log(`Transaction submitted: ${tx.hash}`)

      const receipt = await tx.wait()
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`)

      return { success: true, txHash: tx.hash }
    } catch (error: any) {
      console.error(`Failed to execute subscription ${subscriptionId}:`, error.message)
      return { success: false, error: error.message }
    }
  }

  async executeBatch(subscriptionIds: bigint[]): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log(`Executing batch of ${subscriptionIds.length} subscriptions...`)

      const tx = await this.contract.executeSubscriptions(subscriptionIds)
      console.log(`Batch transaction submitted: ${tx.hash}`)

      const receipt = await tx.wait()
      console.log(`Batch transaction confirmed in block ${receipt.blockNumber}`)

      return { success: true, txHash: tx.hash }
    } catch (error: any) {
      console.error('Failed to execute batch:', error.message)
      return { success: false, error: error.message }
    }
  }

  async run(): Promise<void> {
    console.log('\n' + '='.repeat(60))
    console.log('BaseSubscribe Keeper - Execution Run')
    console.log('='.repeat(60))
    console.log(`Time: ${new Date().toISOString()}`)
    console.log(`Keeper: ${await this.getKeeperAddress()}`)
    console.log(`Balance: ${await this.getKeeperBalance()} ETH`)

    // Check gas price
    const gasPriceGwei = await this.gasMonitor.getGasPriceGwei()
    console.log(`\nCurrent gas price: ${gasPriceGwei.toFixed(2)} gwei`)

    if (!await this.gasMonitor.isGasPriceAcceptable()) {
      console.log(`Gas price too high (max: ${config.maxGasPriceGwei} gwei). Skipping execution.`)
      return
    }

    // Get executable subscriptions
    const executableIds = await this.getExecutableSubscriptions()
    console.log(`\nFound ${executableIds.length} executable subscriptions`)

    if (executableIds.length === 0) {
      console.log('No subscriptions to execute.')
      return
    }

    // Get info for each subscription
    const subscriptions: SubscriptionInfo[] = []
    for (const id of executableIds) {
      const info = await this.getSubscriptionInfo(id)
      if (info) {
        subscriptions.push(info)
        const rewardUsd = this.profitability.calculateKeeperRewardUsd(info.planPrice)
        console.log(`  Subscription ${id}: reward $${rewardUsd.toFixed(4)}`)
      }
    }

    // Estimate gas cost (assuming ETH price ~$3000 for Base)
    const ethPriceUsd = 3000
    const batchGas = this.profitability.estimateBatchExecutionGas(subscriptions.length)
    const gasCostUsd = await this.gasMonitor.estimateExecutionCostUsd(batchGas, ethPriceUsd)

    // Calculate profitability
    const { profitable, netProfitUsd, totalRewardUsd } =
      this.profitability.calculateBatchProfitability(subscriptions, gasCostUsd)

    console.log(`\nProfitability Analysis:`)
    console.log(`  Total reward: $${totalRewardUsd.toFixed(4)}`)
    console.log(`  Est. gas cost: $${gasCostUsd.toFixed(4)}`)
    console.log(`  Net profit: $${netProfitUsd.toFixed(4)}`)
    console.log(`  Profitable: ${profitable ? 'Yes' : 'No'}`)

    if (!profitable) {
      console.log(`\nSkipping execution - below minimum profit threshold ($${config.minProfitUsd})`)
      return
    }

    // Execute subscriptions
    if (subscriptions.length === 1) {
      const result = await this.executeSubscription(subscriptions[0].id)
      if (result.success) {
        console.log(`\nSuccess! TX: ${result.txHash}`)
      } else {
        console.log(`\nFailed: ${result.error}`)
      }
    } else {
      const ids = subscriptions.map(s => s.id)
      const result = await this.executeBatch(ids)
      if (result.success) {
        console.log(`\nBatch execution success! TX: ${result.txHash}`)
      } else {
        console.log(`\nBatch execution failed: ${result.error}`)

        // Fallback to individual execution
        console.log('\nFalling back to individual execution...')
        for (const sub of subscriptions) {
          await this.executeSubscription(sub.id)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
  }
}
