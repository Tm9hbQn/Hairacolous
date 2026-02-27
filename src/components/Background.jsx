import React from 'react';
import { getGradientClass } from '../utils';

// Fix #5: accepts conditionId prop and maps it to the correct gradient
const Background = ({ conditionId }) => {
  const gradientClass = getGradientClass(conditionId);

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 bg-gradient-to-br ${gradientClass} bg-[length:400%_400%] animate-gradient-mesh`}>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default Background;
