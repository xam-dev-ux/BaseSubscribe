import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { Attribution } from 'ox/erc8021'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

// Get your Builder Code from base.dev > Settings > Builder Codes
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_p2pdrw67'],
})

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
