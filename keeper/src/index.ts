import cron from 'node-cron'
import { config, validateConfig } from './config'
import { SubscriptionExecutor } from './executor'

async function main() {
  console.log('='.repeat(60))
  console.log('BaseSubscribe Keeper Bot')
  console.log('='.repeat(60))

  // Validate configuration
  try {
    validateConfig()
  } catch (error: any) {
    console.error('Configuration error:', error.message)
    process.exit(1)
  }

  const executor = new SubscriptionExecutor()

  console.log(`Keeper address: ${await executor.getKeeperAddress()}`)
  console.log(`Contract: ${config.contractAddress}`)
  console.log(`RPC: ${config.rpcUrl}`)
  console.log(`Min profit: $${config.minProfitUsd}`)
  console.log(`Max gas: ${config.maxGasPriceGwei} gwei`)
  console.log(`Mode: ${config.mode}`)

  if (config.mode === 'manual') {
    console.log('\nRunning single execution...')
    await executor.run()
  } else {
    console.log(`\nStarting cron scheduler: ${config.cronSchedule}`)
    console.log('Press Ctrl+C to stop\n')

    // Run immediately on start
    await executor.run()

    // Schedule recurring runs
    cron.schedule(config.cronSchedule, async () => {
      await executor.run()
    })
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
