import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, BASE_SUBSCRIBE_ABI, ERC20_ABI } from '../utils/contracts'

export function useContractAddresses() {
  const chainId = useChainId()
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[84532] // Default to Base Sepolia
}

export function usePlan(planId: bigint | undefined) {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getPlan',
    args: planId ? [planId] : undefined,
    query: {
      enabled: !!planId,
    },
  })
}

export function useSubscription(subscriptionId: bigint | undefined) {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getSubscription',
    args: subscriptionId ? [subscriptionId] : undefined,
    query: {
      enabled: !!subscriptionId,
    },
  })
}

export function useCreatorPlans(creator: `0x${string}` | undefined) {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getCreatorPlans',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  })
}

export function useUserSubscriptions(user: `0x${string}` | undefined) {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getUserSubscriptions',
    args: user ? [user] : undefined,
    query: {
      enabled: !!user,
    },
  })
}

export function useCreatorBalance(creator: `0x${string}` | undefined) {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getCreatorBalance',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  })
}

export function usePlansCount() {
  const { baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: baseSubscribe,
    abi: BASE_SUBSCRIBE_ABI,
    functionName: 'getAllPlansCount',
  })
}

export function useUSDCBalance(address: `0x${string}` | undefined) {
  const { usdc } = useContractAddresses()

  return useReadContract({
    address: usdc,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

export function useUSDCAllowance(owner: `0x${string}` | undefined) {
  const { usdc, baseSubscribe } = useContractAddresses()

  return useReadContract({
    address: usdc,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, baseSubscribe] : undefined,
    query: {
      enabled: !!owner,
    },
  })
}

export function useCreatePlan() {
  const { baseSubscribe } = useContractAddresses()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createPlan = (price: bigint, period: bigint, name: string, description: string) => {
    writeContract({
      address: baseSubscribe,
      abi: BASE_SUBSCRIBE_ABI,
      functionName: 'createPlan',
      args: [price, period, name, description],
    })
  }

  return { createPlan, isPending, isConfirming, isSuccess, error, hash }
}

export function useSubscribe() {
  const { baseSubscribe } = useContractAddresses()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const subscribe = (planId: bigint) => {
    writeContract({
      address: baseSubscribe,
      abi: BASE_SUBSCRIBE_ABI,
      functionName: 'subscribe',
      args: [planId],
    })
  }

  return { subscribe, isPending, isConfirming, isSuccess, error, hash }
}

export function useCancelSubscription() {
  const { baseSubscribe } = useContractAddresses()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const cancelSubscription = (subscriptionId: bigint) => {
    writeContract({
      address: baseSubscribe,
      abi: BASE_SUBSCRIBE_ABI,
      functionName: 'cancelSubscription',
      args: [subscriptionId],
    })
  }

  return { cancelSubscription, isPending, isConfirming, isSuccess, error, hash }
}

export function useWithdrawEarnings() {
  const { baseSubscribe } = useContractAddresses()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawEarnings = () => {
    writeContract({
      address: baseSubscribe,
      abi: BASE_SUBSCRIBE_ABI,
      functionName: 'withdrawCreatorEarnings',
    })
  }

  return { withdrawEarnings, isPending, isConfirming, isSuccess, error, hash }
}

export function useApproveUSDC() {
  const { usdc, baseSubscribe } = useContractAddresses()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (amount: bigint) => {
    writeContract({
      address: usdc,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [baseSubscribe, amount],
    })
  }

  return { approve, isPending, isConfirming, isSuccess, error, hash }
}
