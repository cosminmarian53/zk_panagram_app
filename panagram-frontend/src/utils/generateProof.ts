import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "../../../circuit/target/zk_panagram_app.json";
import { Noir } from "@noir-lang/noir_js";
import type { CompiledCircuit } from "@noir-lang/types";
import { getWordData } from "../constant";
import { solidityPackedKeccak256, zeroPadValue } from "ethers";

const FIELD_MODULUS = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

function calculateDoubleHash(singleHash: string): string {
  const doubleHash = solidityPackedKeccak256(['bytes32'], [singleHash]);
  const reducedDoubleHash = BigInt(doubleHash) % FIELD_MODULUS;
  return "0x" + reducedDoubleHash.toString(16).padStart(64, "0");
}

export async function generateProof(
  guess_hash: string,
  address: string,
  showLog: (content: string) => void
): Promise<{ proof: Uint8Array; publicInputs: string[] }> {
  try {
    const { hash: answerHash } = await getWordData();
    const doubleAnswerHash = calculateDoubleHash(answerHash);

    const formattedAddress = zeroPadValue(address, 32);

    const noir = new Noir(circuit as CompiledCircuit);
    const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });
    const inputs = {
      guess_hash: guess_hash,
      address: formattedAddress,
      answer_double_hash: doubleAnswerHash,
    };

    showLog("Generating witness... ⏳");
    const { witness } = await noir.execute(inputs);
    showLog("Generated witness... ✅");

    showLog("Generating proof... ⏳");
    const { proof, publicInputs } = await honk.generateProof(witness, {
      keccak: true,
    });
    const offChainProof = await honk.generateProof(witness);
    showLog("Generated proof... ✅");
    showLog("Verifying proof... ⏳");
    const isValid = await honk.verifyProof(offChainProof);
    showLog(`Proof is valid: ${isValid} ✅`);

    return { proof, publicInputs };
  } catch (error) {
    console.log(error);
    throw error;
  }
}