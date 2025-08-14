import Input from "./Input.tsx";
import PanagramImage from "./PanagramImage.tsx";
import ConnectWallet from "./ConnectWallet.tsx";
import NFTGalleryContainer from "./NFTGalleryContainer.tsx";
import Stars from "./Stars.tsx";
import { useAccount } from "wagmi";

function Panagram() {
  const { isConnected, address: userAddress } = useAccount();

  return (
    <>
      <Stars />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl p-8 bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/20">
          <h1 
            className="text-6xl font-extrabold text-center text-white mb-2 tracking-widest"
            style={{ textShadow: '0 0 10px #00ff7f, 0 0 20px #00ff7f, 0 0 30px #00ff7f' }}
          >
            PANAGRAM
          </h1>
          <p className="text-center text-emerald-400/70 mb-8 text-lg">
            The ZK Word Guessing Game
          </p>

          <div className="w-full flex justify-center mb-6">
            <ConnectWallet />
          </div>

          {isConnected ? (
            <>
              <div className="flex flex-col lg:flex-row gap-8 justify-center">
                <div className="w-full lg:w-1/2 flex flex-col items-center p-6 bg-black/30 rounded-xl border border-emerald-500/10">
                  <PanagramImage />
                  <Input />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col items-center p-6 bg-black/30 rounded-xl border border-emerald-500/10">
                  {userAddress ? (
                    <NFTGalleryContainer userAddress={userAddress} />
                  ) : (
                    <p className="text-center text-white/70">
                      No address available.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-white/70 text-xl">
              Please connect your wallet to play.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Panagram;
