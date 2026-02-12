import React from 'react';

const Background = () => {
  // Fixed gradient to ensure consistent readability and avoid drastic theme changes
  // Updated to be brighter, sunny, and happy as requested
  const gradientClass = 'from-sky-400 via-purple-400 to-pink-400';

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 bg-gradient-to-br ${gradientClass} bg-[length:400%_400%] animate-gradient-mesh`}>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default Background;
