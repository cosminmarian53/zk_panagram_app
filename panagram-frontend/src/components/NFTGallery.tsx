import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { abi } from "../abi/abi";
import { PANAGRAM_CONTRACT_ADDRESS } from "../constant";

const GATEWAY = import.meta.env.VITE_PINATA_GATEWAY!;

const convertToReliableGateway = (url: string) => {
  if (url.startsWith("https://ipfs.io/ipfs/")) {
    return `${GATEWAY}${url.split("https://ipfs.io/ipfs/")[1]}`;
  }
  return url.startsWith("ipfs://") ? url.replace("ipfs://", GATEWAY) : url;
};

const fetchMetadata = async (uri: string, token_id: number) => {
  const resolvedURI = uri.replace(/{id}/g, token_id.toString());
  const reliableUrl = convertToReliableGateway(resolvedURI);

  try {
    const response = await fetch(reliableUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const metadata = await response.json();
    return {
      metadata,
      imageUrl: metadata.image
        ? convertToReliableGateway(metadata.image)
        : null,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return { metadata: null, imageUrl: null };
  }
};

export default function NFTGallery({
  owner,
  token_id,
}: {
  owner: string;
  token_id: number;
}) {
  const [nftData, setNftData] = useState<{
    metadata: any;
    imageUrl: string | null;
  }>({
    metadata: null,
    imageUrl: null,
  });

  const balanceResult = useReadContract({
    address: PANAGRAM_CONTRACT_ADDRESS,
    abi,
    functionName: "balanceOf",
    args: [owner as `0x${string}`, BigInt(token_id)],
  });

  const uriResult = useReadContract({
    address: PANAGRAM_CONTRACT_ADDRESS,
    abi,
    functionName: "uri",
    args: [BigInt(token_id)],
  });

  useEffect(() => {
    if (!uriResult.data) return;
    fetchMetadata(uriResult.data as string, token_id).then(setNftData);
  }, [uriResult.data, token_id]);

  if (balanceResult.isLoading || uriResult.isLoading) return <div className="text-center text-white/70">Loading...</div>;
  if (balanceResult.isError || uriResult.isError)
    return <div className="text-center text-red-500">Error fetching NFT data</div>;

  const balance = balanceResult.data ? Number(balanceResult.data) : 0;

  return (
    <div className="bg-black/30 p-6 rounded-lg shadow-lg text-center border border-emerald-500/10">
      <h3 className="text-xl font-bold text-emerald-400 mb-2">
        {token_id === 0 ? "Times Won" : "Times Correct (Not Won)"}
      </h3>
      {balance > 0 ? (
        <NFTCard
          tokenId={token_id}
          balance={balance}
          imageUrl={nftData.imageUrl}
          metadata={nftData.metadata}
        />
      ) : (
        <p className="text-white/70">No tokens owned.</p>
      )}
    </div>
  );
}

function NFTCard({
  tokenId,
  balance,
  imageUrl,
  metadata,
}: {
  tokenId: number;
  balance: number;
  imageUrl: string | null;
  metadata: any;
}) {
  return (
    <div className="transform hover:scale-105 transition-all duration-300">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`NFT ${tokenId}`}
          className="w-full h-auto rounded-lg shadow-lg mb-4 border-2 border-emerald-500/50"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-full h-48 bg-black/20 rounded-lg flex items-center justify-center mb-4 border-2 border-emerald-500/20">
          <p className="text-white/70">No image available</p>
        </div>
      )}
      <h4 className="text-lg font-bold text-white">{metadata?.name || `Token ID: ${tokenId}`}</h4>
      <p className="text-white/70">Balance: {balance}</p>
    </div>
  );
}
