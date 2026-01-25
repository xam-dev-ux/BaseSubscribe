import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSubscribe, useApproveUSDC, useUSDCAllowance, useUSDCBalance } from '../hooks/useContract'
import { formatUSDC, formatPeriod } from '../utils/formatters'

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

interface SubscribeModalProps {
  plan: Plan
  onClose: () => void
}

export function SubscribeModal({ plan, onClose }: SubscribeModalProps) {
  const { address } = useAccount()
  const [step, setStep] = useState<'approve' | 'subscribe'>('approve')

  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance(address)
  const { data: balance } = useUSDCBalance(address)
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: isApproveSuccess } = useApproveUSDC()
  const { subscribe, isPending: isSubscribing, isConfirming: isSubscribeConfirming, isSuccess: isSubscribeSuccess } = useSubscribe()

  const hasEnoughAllowance = allowance && allowance >= plan.price
  const hasEnoughBalance = balance && balance >= plan.price

  useEffect(() => {
    if (hasEnoughAllowance) {
      setStep('subscribe')
    }
  }, [hasEnoughAllowance])

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance()
    }
  }, [isApproveSuccess, refetchAllowance])

  useEffect(() => {
    if (isSubscribeSuccess) {
      setTimeout(onClose, 2000)
    }
  }, [isSubscribeSuccess, onClose])

  const handleApprove = () => {
    // Approve max uint256 for convenience
    approve(BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))
  }

  const handleSubscribe = () => {
    subscribe(plan.id)
  }

  if (isSubscribeSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Subscribed!</h2>
          <p className="text-gray-400">You are now subscribed to {plan.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Subscribe to {plan.name}</h2>

        <div className="p-4 bg-gray-800 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Price</span>
            <span className="font-bold">{formatUSDC(plan.price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Billing</span>
            <span>{formatPeriod(Number(plan.period))}</span>
          </div>
        </div>

        {!hasEnoughBalance && (
          <div className="p-3 mb-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            Insufficient USDC balance. You have {balance ? formatUSDC(balance) : '$0'}
          </div>
        )}

        <div className="space-y-3">
          {step === 'approve' && !hasEnoughAllowance && (
            <button
              onClick={handleApprove}
              disabled={isApproving || isApproveConfirming || !hasEnoughBalance}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
            >
              {isApproving || isApproveConfirming ? 'Approving...' : '1. Approve USDC'}
            </button>
          )}

          <button
            onClick={handleSubscribe}
            disabled={!hasEnoughAllowance || isSubscribing || isSubscribeConfirming || !hasEnoughBalance}
            className="w-full py-3 bg-base-blue hover:bg-blue-600 rounded-lg font-medium transition disabled:opacity-50"
          >
            {isSubscribing || isSubscribeConfirming ? 'Subscribing...' : hasEnoughAllowance ? 'Subscribe' : '2. Subscribe'}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-2 mt-4 text-gray-400 hover:text-white transition">
          Cancel
        </button>
      </div>
    </div>
  )
}
