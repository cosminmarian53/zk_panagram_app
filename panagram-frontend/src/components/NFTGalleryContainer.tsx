import NFTGallery from "./NFTGallery";

export default function NFTGalleryContainer({
  userAddress,
}: {
  userAddress: string;
}) {
  return (
    <div className="w-full">
      <h2 
        className="text-3xl font-bold text-center text-white mb-8"
        style={{ textShadow: '0 0 5px #00ff7f, 0 0 10px #00ff7f' }}
      >
        Your NFT Collection
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NFTGallery owner={userAddress} token_id={0} />
        <NFTGallery owner={userAddress} token_id={1} />
      </div>
    </div>
  );
}
