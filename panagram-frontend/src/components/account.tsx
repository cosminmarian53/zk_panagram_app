import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div className="flex items-center gap-4">
      {ensAvatar && (
        <img alt="ENS Avatar" src={ensAvatar} className="w-12 h-12 rounded-full border-2 border-emerald-500" />
      )}
      <div className="flex flex-col">
        <span className="font-bold text-white">
          {ensName ? `${ensName} (${address?.slice(0, 6)}...${address?.slice(-4)})` : address}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-emerald-400/70 hover:text-emerald-400"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
