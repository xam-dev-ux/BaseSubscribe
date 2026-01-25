import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { usePlan } from '../hooks/useContract'
import { SubscribeModal } from '../components/SubscribeModal'
import { formatUSDC, formatPeriod, formatAddress } from '../utils/formatters'

export function PlanDetails() {
  const { planId } = useParams<{ planId: string }>()
  const { isConnected } = useAccount()
  const { data: plan, isLoading } = usePlan(planId ? BigInt(planId) : undefined)
  const [showSubscribe, setShowSubscribe] = useState(false)

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-base-blue border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  if (!plan || !plan.active) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
        <p className="text-gray-400">This plan doesn't exist or has been deactivated</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-8 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{plan.name}</h1>
            <p className="text-gray-400">by {formatAddress(plan.creator)}</p>
          </div>
          <span className="px-4 py-2 bg-base-blue/20 text-base-blue rounded-full">
            {formatPeriod(Number(plan.period))}
          </span>
        </div>

        <p className="text-gray-300 mb-8">{plan.description}</p>

        <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-800 rounded-lg">
          <div>
            <span className="text-gray-400 text-sm">Price</span>
            <div className="text-2xl font-bold">{formatUSDC(plan.price)}</div>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Subscribers</span>
            <div className="text-2xl font-bold">{plan.subscriberCount.toString()}</div>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={() => setShowSubscribe(true)}
            className="w-full py-4 bg-base-blue hover:bg-blue-600 rounded-xl text-lg font-bold transition"
          >
            Subscribe for {formatUSDC(plan.price)}/{formatPeriod(Number(plan.period)).toLowerCase()}
          </button>
        ) : (
          <div className="text-center py-4 bg-gray-800 rounded-xl text-gray-400">
            Connect your wallet to subscribe
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="font-medium mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-400">
            <li>1. Approve USDC spending (one-time)</li>
            <li>2. First payment is taken immediately</li>
            <li>3. Keepers execute recurring payments automatically</li>
            <li>4. Cancel anytime and receive pro-rata refund</li>
          </ol>
        </div>
      </div>

      {showSubscribe && <SubscribeModal plan={plan} onClose={() => setShowSubscribe(false)} />}
    </div>
  )
}
