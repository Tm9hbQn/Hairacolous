import React from 'react';

const Background = ({ conditionId }) => {
  // Fixed gradient to ensure consistent readability and avoid drastic theme changes
  const gradientClass = 'from-slate-900 via-purple-950 to-slate-900';

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 bg-gradient-to-br ${gradientClass} bg-[length:400%_400%] animate-gradient-mesh`}>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default Background;
