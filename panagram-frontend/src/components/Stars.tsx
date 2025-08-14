import { useMemo } from 'react';

const Stars = () => {
  const stars = useMemo(() => {
    const starArray = [];
    for (let i = 0; i < 100; i++) {
      starArray.push({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 5 + 5}s`,
        },
      });
    }
    return starArray;
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={star.style}
        />
      ))}
    </div>
  );
};

export default Stars;
