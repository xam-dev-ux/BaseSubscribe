import { usePlansCount, usePlan } from '../hooks/useContract'
import { PlanCard } from '../components/PlanCard'

export function Home() {
  const { data: plansCount } = usePlansCount()

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Decentralized Subscriptions</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Support your favorite creators with recurring payments on Base.
          No middlemen, no platform lock-in, just direct crypto subscriptions.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">Browse Plans</h2>

      {plansCount && plansCount > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: Number(plansCount) }, (_, i) => (
            <PlanItem key={i + 1} planId={BigInt(i + 1)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <p className="text-gray-400 text-lg mb-4">No plans available yet</p>
          <p className="text-gray-500">Be the first creator to launch a subscription plan!</p>
        </div>
      )}
    </div>
  )
}

function PlanItem({ planId }: { planId: bigint }) {
  const { data: plan } = usePlan(planId)

  if (!plan || !plan.active) return null

  return <PlanCard plan={plan} />
}
