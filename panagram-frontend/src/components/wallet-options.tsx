import { useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex flex-col space-y-4">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="w-full px-6 py-3 text-lg font-bold text-black bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
