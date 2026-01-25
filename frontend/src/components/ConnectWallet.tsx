import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { formatAddress } from '../utils/formatters'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">{formatAddress(address)}</span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-4 py-2 bg-base-blue hover:bg-blue-600 rounded-lg font-medium transition disabled:opacity-50"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  )
}
