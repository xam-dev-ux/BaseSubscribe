import { Link } from 'react-router-dom'
import { formatUSDC, formatPeriod, formatAddress } from '../utils/formatters'

interface Plan {
  id: bigint
  creator: string
  price: bigint
  period: bigint
  name: string
  description: string
  active: boolean
  subscriberCount: bigint
}

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  if (!plan.active) return null

  return (
    <Link
      to={`/plan/${plan.id}`}
      className="block p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-base-blue transition"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <span className="px-3 py-1 bg-base-blue/20 text-base-blue rounded-full text-sm">
          {formatPeriod(Number(plan.period))}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">{formatUSDC(plan.price)}</span>
          <span className="text-gray-400 text-sm">/{formatPeriod(Number(plan.period)).toLowerCase()}</span>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>{plan.subscriberCount.toString()} subscribers</div>
          <div>by {formatAddress(plan.creator)}</div>
        </div>
      </div>
    </Link>
  )
}
