import { formatUSDC, formatPeriod, formatDate } from '../utils/formatters'
import { usePlan, useCancelSubscription } from '../hooks/useContract'

interface Subscription {
  id: bigint
  planId: bigint
  subscriber: string
  startTime: bigint
  lastPayment: bigint
  nextPayment: bigint
  active: boolean
}

interface SubscriptionCardProps {
  subscription: Subscription
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { data: plan } = usePlan(subscription.planId)
  const { cancelSubscription, isPending, isConfirming } = useCancelSubscription()

  if (!plan) return null

  const isExpired = Number(subscription.nextPayment) * 1000 < Date.now()

  return (
    <div className={`p-6 bg-gray-900 border rounded-xl ${subscription.active ? 'border-gray-800' : 'border-red-900/50'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="text-sm text-gray-400">by {plan.creator.slice(0, 10)}...</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            subscription.active
              ? isExpired
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {subscription.active ? (isExpired ? 'Payment Due' : 'Active') : 'Cancelled'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Price</span>
          <div className="font-medium">
            {formatUSDC(plan.price)} / {formatPeriod(Number(plan.period)).toLowerCase()}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Started</span>
          <div className="font-medium">{formatDate(Number(subscription.startTime))}</div>
        </div>
        <div>
          <span className="text-gray-400">Last Payment</span>
          <div className="font-medium">{formatDate(Number(subscription.lastPayment))}</div>
        </div>
        <div>
          <span className="text-gray-400">Next Payment</span>
          <div className="font-medium">{formatDate(Number(subscription.nextPayment))}</div>
        </div>
      </div>

      {subscription.active && (
        <button
          onClick={() => cancelSubscription(subscription.id)}
          disabled={isPending || isConfirming}
          className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
        >
          {isPending || isConfirming ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      )}
    </div>
  )
}
