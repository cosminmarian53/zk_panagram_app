import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { metaMask, safe} from "wagmi/connectors";
import { vMainnet } from "./tenderly.config";

const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL!;
const tenderlyRpcUrl = import.meta.env.VITE_TENDERLY_RPC_URL!;
export const config = createConfig({
  chains: [vMainnet, sepolia],
  connectors: [metaMask(), safe()],
  transports: {
    [vMainnet.id]: http(tenderlyRpcUrl),
    [sepolia.id]: http(rpcUrl),
  },
});
