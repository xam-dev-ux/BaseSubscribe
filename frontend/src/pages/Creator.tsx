import { useAccount } from 'wagmi'
import { useCreatorPlans, useCreatorBalance, usePlan, useWithdrawEarnings } from '../hooks/useContract'
import { CreatePlanForm } from '../components/CreatePlanForm'
import { formatUSDC, formatPeriod } from '../utils/formatters'

export function Creator() {
  const { address, isConnected } = useAccount()
  const { data: planIds } = useCreatorPlans(address)
  const { data: balance } = useCreatorBalance(address)
  const { withdrawEarnings, isPending, isConfirming } = useWithdrawEarnings()

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
        <p className="text-gray-400">Connect your wallet to manage your subscription plans</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Creator Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Create New Plan</h2>
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <CreatePlanForm />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Your Plans</h2>
            {planIds && planIds.length > 0 ? (
              <div className="space-y-4">
                {planIds.map((planId) => (
                  <CreatorPlanItem key={planId.toString()} planId={planId} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl text-center text-gray-400">
                You haven't created any plans yet
              </div>
            )}
          </section>
        </div>

        <div>
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl sticky top-8">
            <h2 className="text-xl font-bold mb-4">Earnings</h2>
            <div className="text-3xl font-bold mb-4">
              {balance ? formatUSDC(balance) : '$0.00'}
            </div>
            <p className="text-sm text-gray-400 mb-4">Available to withdraw</p>
            <button
              onClick={() => withdrawEarnings()}
              disabled={!balance || balance === BigInt(0) || isPending || isConfirming}
              className="w-full py-3 bg-base-blue hover:bg-blue-600 rounded-lg font-medium transition disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Withdrawing...' : 'Withdraw'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="font-medium mb-2">Fee Structure</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Platform fee</span>
                  <span>2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Keeper fee</span>
                  <span>0.5%</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>You receive</span>
                  <span>97.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatorPlanItem({ planId }: { planId: bigint }) {
  const { data: plan } = usePlan(planId)

  if (!plan) return null

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            plan.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {plan.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
      <div className="flex justify-between text-sm">
        <span>
          {formatUSDC(plan.price)} / {formatPeriod(Number(plan.period)).toLowerCase()}
        </span>
        <span className="text-gray-400">{plan.subscriberCount.toString()} subscribers</span>
      </div>
    </div>
  )
}
