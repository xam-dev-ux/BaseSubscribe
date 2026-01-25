import { base, baseSepolia } from 'wagmi/chains'

export const CONTRACT_ADDRESSES: Record<number, { baseSubscribe: `0x${string}`; usdc: `0x${string}` }> = {
  [base.id]: {
    baseSubscribe: '0x0af844f42dad1f76D8822A7862e7C977C90949C0',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  [baseSepolia.id]: {
    baseSubscribe: '0x0000000000000000000000000000000000000000', // Update after deployment
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
}

export const BASE_SUBSCRIBE_ABI = [
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'getPlan',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'period', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'active', type: 'bool' },
          { name: 'subscriberCount', type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'planId', type: 'uint256' },
          { name: 'subscriber', type: 'address' },
          { name: 'startTime', type: 'uint256' },
          { name: 'lastPayment', type: 'uint256' },
          { name: 'nextPayment', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getCreatorPlans',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserSubscriptions',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getCreatorBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllPlansCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'price', type: 'uint256' },
      { name: 'period', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
    ],
    name: 'createPlan',
    outputs: [{ name: 'planId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'planId', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    name: 'updatePlan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'subscribe',
    outputs: [{ name: 'subscriptionId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawCreatorEarnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
      { indexed: false, name: 'period', type: 'uint256' },
    ],
    name: 'PlanCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'subscriptionId', type: 'uint256' },
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: true, name: 'subscriber', type: 'address' },
    ],
    name: 'Subscribed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'subscriptionId', type: 'uint256' },
      { indexed: false, name: 'refundAmount', type: 'uint256' },
    ],
    name: 'SubscriptionCancelled',
    type: 'event',
  },
] as const

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
