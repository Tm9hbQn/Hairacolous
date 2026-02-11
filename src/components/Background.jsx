import React from 'react';

const Background = ({ conditionId }) => {
  let gradientClass = '';
  switch (conditionId) {
    case 'PERFECT_DAY':
      gradientClass = 'from-cyan-300 via-blue-400 to-purple-400';
      break;
    case 'SAUNA_STORM':
      gradientClass = 'from-slate-800 via-indigo-900 to-purple-900';
      break;
    case 'SAUNA_CALM':
      gradientClass = 'from-orange-100 via-amber-100 to-emerald-100';
      break;
    default:
      gradientClass = 'from-gray-200 to-gray-400';
  }

  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 bg-gradient-to-br ${gradientClass} bg-[length:400%_400%] animate-gradient-mesh`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default Background;
