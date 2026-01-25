import { useAccount } from 'wagmi'
import { useUserSubscriptions, useSubscription } from '../hooks/useContract'
import { SubscriptionCard } from '../components/SubscriptionCard'

export function Subscriber() {
  const { address, isConnected } = useAccount()
  const { data: subscriptionIds } = useUserSubscriptions(address)

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">My Subscriptions</h1>
        <p className="text-gray-400">Connect your wallet to view your subscriptions</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Subscriptions</h1>

      {subscriptionIds && subscriptionIds.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {subscriptionIds.map((subId) => (
            <SubscriptionItem key={subId.toString()} subscriptionId={subId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <p className="text-gray-400 text-lg mb-4">You don't have any subscriptions yet</p>
          <p className="text-gray-500">Browse plans and subscribe to support your favorite creators!</p>
        </div>
      )}
    </div>
  )
}

function SubscriptionItem({ subscriptionId }: { subscriptionId: bigint }) {
  const { data: subscription } = useSubscription(subscriptionId)

  if (!subscription) return null

  return <SubscriptionCard subscription={subscription} />
}
