import 'dotenv/config'

export const config = {
  privateKey: process.env.KEEPER_PRIVATE_KEY || '',
  rpcUrl: process.env.RPC_URL || 'https://mainnet.base.org',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  minProfitUsd: parseFloat(process.env.MIN_PROFIT_USD || '0.10'),
  maxGasPriceGwei: parseFloat(process.env.MAX_GAS_PRICE_GWEI || '10'),
  mode: process.env.MODE || 'cron',
  cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *',

  // USDC on Base has 6 decimals
  usdcDecimals: 6,

  // Keeper fee is 0.5% = 50 bps
  keeperFeeBps: 50,
}

export function validateConfig(): void {
  if (!config.privateKey) {
    throw new Error('KEEPER_PRIVATE_KEY is required')
  }
  if (!config.contractAddress) {
    throw new Error('CONTRACT_ADDRESS is required')
  }
}
