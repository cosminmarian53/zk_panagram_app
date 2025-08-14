import { useState, useEffect, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { abi } from "../abi/abi.ts";
import { PANAGRAM_CONTRACT_ADDRESS, getWordData } from "../constant.ts";
import { generateProof } from "../utils/generateProof.ts";
import { keccak256, toUtf8Bytes } from "ethers";

const FIELD_MODULUS = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

export function uint8ArrayToHex(buffer: Uint8Array): string {
  const hex: string[] = [];
  buffer.forEach(function (i) {
    let h = i.toString(16);
    if (h.length % 2) {
      h = "0" + h;
    }
    hex.push(h);
  });
  return hex.join("");
}

export default function Input() {
  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const [logs, setLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [results, setResults] = useState("");
  const { address } = useAccount();

  useEffect(() => {
    getWordData().then(data => {
      console.log("Secret word:", data.word);
    });
  }, []);

  const showLog = useCallback((content: string) => {
    setLogs((prevLogs) => [...prevLogs, content]);
  }, []);

  useEffect(() => {
    if (logs.length > 1) {
      const timer = setTimeout(() => {
        setCurrentLogIndex((prevIndex) => (prevIndex + 1) % logs.length);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [logs, currentLogIndex]);

  if (!address) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogs([]);
    setCurrentLogIndex(0);
    setResults("");

    try {
      const guessInput = (document.getElementById("guess") as HTMLInputElement).value;
      const guessHex = keccak256(toUtf8Bytes(guessInput));
      const reducedGuess = BigInt(guessHex) % FIELD_MODULUS;
      const guessHash = "0x" + reducedGuess.toString(16).padStart(64, "0");
      const { proof } = await generateProof(guessHash, address, showLog);
      await writeContract({
        address: PANAGRAM_CONTRACT_ADDRESS,
        abi: abi,
        functionName: "makeGuess",
        args: [`0x${uint8ArrayToHex(proof)}`],
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isPending) showLog("Transaction is processing... ⏳");
    if (error) {
      showLog("Oh no! Something went wrong. 😞");
      setResults("Transaction failed.");
    }
    if (isConfirming) showLog("Transaction in progress... ⏳");
    if (isConfirmed) {
      showLog("You got it right! ✅");
      setResults("Transaction succeeded!");
    }
  }, [isPending, error, isConfirming, isConfirmed, showLog]);

  return (
    <div className="w-full max-w-md">
      <p className="text-center text-emerald-400/70 mb-6">
        Can you guess the secret word?
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          type="text"
          id="guess"
          maxLength={9}
          placeholder="Type your guess"
          className="w-full px-6 py-4 text-lg text-center text-white bg-black/30 rounded-lg border border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
        />
        <button
          type="submit"
          id="submit"
          className="w-full px-6 py-4 text-lg font-bold text-black bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          disabled={isPending || isConfirming}
        >
          {isPending || isConfirming ? "Submitting..." : "Submit Guess"}
        </button>
      </form>

      <div className="mt-8 p-4 bg-black/30 rounded-lg min-h-[100px] overflow-hidden relative">
        <h3 className="font-bold text-emerald-400/80 mb-2">Logs:</h3>
        <div className="relative h-8">
          {logs.map((log, index) => (
            <div
              key={index}
              className="absolute w-full transition-all duration-500"
              style={{
                transform: `translateY(${(index - currentLogIndex) * 100}%)`,
                opacity: index === currentLogIndex ? 1 : 0,
              }}
            >
              {log}
            </div>
          ))}
        </div>
        {results && (
          <div id="results" className="mt-4 text-white font-semibold">
            {results}
          </div>
        )}
      </div>
    </div>
  );
}
