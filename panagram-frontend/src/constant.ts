import { keccak256, toUtf8Bytes } from "ethers";

export const PANAGRAM_CONTRACT_ADDRESS = "0x0bDDc40Ffd579A308283Cde884d9Db786F572bc5";

const FIELD_MODULUS = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

const WORD_API_URL = "https://random-word-api.herokuapp.com/word";
const WORD_EXPIRATION_SECONDS = 10800;

export interface WordData {
  word: string;
  hash: string;
  anagram: string;
  timestamp: number;
}

function shuffle(word: string): string {
  const a = word.split(""),
    n = a.length;

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  
  const shuffledWord = a.join("");
  if (shuffledWord === word) {
    return shuffle(word);
  }
  return shuffledWord;
}

async function fetchNewWord(): Promise<string> {
  try {
    const response = await fetch(WORD_API_URL);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return data[0];
    }
    throw new Error("Invalid data format from API");
  } catch (error) {
    console.error("Failed to fetch new word:", error);
    return "default";
  }
}

export function calculateHash(word: string): string {
  const wordHex = keccak256(toUtf8Bytes(word));
  const reducedWord = BigInt(wordHex) % FIELD_MODULUS;
  return "0x" + reducedWord.toString(16).padStart(64, "0");
}

export async function getWordData(): Promise<WordData> {
  const storedData = localStorage.getItem("wordData");
  const now = Date.now();

  if (storedData) {
    const data: WordData = JSON.parse(storedData);
    if (now - data.timestamp < WORD_EXPIRATION_SECONDS * 1000) {
      return data;
    }
  }

  const word = await fetchNewWord();
  const hash = calculateHash(word);
  const anagram = shuffle(word.toUpperCase());
  const newWordData: WordData = {
    word,
    hash,
    anagram,
    timestamp: now,
  };

  localStorage.setItem("wordData", JSON.stringify(newWordData));

  return newWordData;
}
