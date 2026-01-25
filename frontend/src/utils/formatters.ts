import { formatUnits } from 'viem'

export function formatUSDC(amount: bigint): string {
  return `$${formatUnits(amount, 6)}`
}

export function formatPeriod(seconds: number): string {
  const days = seconds / 86400
  if (days === 7) return 'Weekly'
  if (days === 30) return 'Monthly'
  if (days === 365) return 'Yearly'
  return `${days} days`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function parseUSDC(amount: string): bigint {
  const [whole, decimal = ''] = amount.split('.')
  const paddedDecimal = decimal.padEnd(6, '0').slice(0, 6)
  return BigInt(whole + paddedDecimal)
}
