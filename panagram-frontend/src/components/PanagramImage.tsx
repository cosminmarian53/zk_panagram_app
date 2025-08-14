import { useState, useEffect } from 'react';
import { getWordData } from "../constant";

function PanagramImage() {
  const [anagram, setAnagram] = useState('');

  useEffect(() => {
    getWordData().then(data => {
      setAnagram(data.anagram);
    });
  }, []);

  if (!anagram) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const word = anagram;
  const middleIndex = Math.floor(word.length / 2);
  const letters = word.split("");
  const middleLetter = letters[middleIndex];
  letters.splice(middleIndex, 1);
  const scrambledLetters = letters.sort(() => Math.random() - 0.5);
  scrambledLetters.splice(middleIndex, 0, middleLetter);

  return (
    <div className="flex items-center justify-center my-8">
      <div className="relative w-72 h-72">
        {scrambledLetters.map((letter, index) => {
          const isMiddle = index === middleIndex;
          const angle = (360 / (scrambledLetters.length - 1)) * (index < middleIndex ? index : index - 1);
          const x = 50 + 40 * Math.cos((angle * Math.PI) / 180);
          const y = 50 + 40 * Math.sin((angle * Math.PI) / 180);

          const style = isMiddle
            ? { left: "50%", top: "50%" }
            : { left: `${x}%`, top: `${y}%` };

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
                rounded-full w-16 h-16 text-2xl font-bold transition-all duration-300
                ${isMiddle
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                  : "bg-white/10 text-white/80 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/50"
                }`}
              style={style}
            >
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PanagramImage;
