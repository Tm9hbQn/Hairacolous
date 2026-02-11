import React, { useEffect, useState } from 'react';
import { Wind, Droplets, ThermometerSun, AlertTriangle } from 'lucide-react';

const MainStatusCard = ({ data, summaryText, uvAlert, conditionId }) => {
  // Determine ball color/style based on condition
  let ballClass = '';
  switch (conditionId) {
    case 'PERFECT_DAY':
      ballClass = 'from-cyan-300 via-blue-400 to-purple-400 shadow-[0_0_30px_rgba(103,232,249,0.6)]';
      break;
    case 'SAUNA_STORM':
      ballClass = 'from-slate-700 via-indigo-800 to-purple-900 shadow-[0_0_30px_rgba(99,102,241,0.6)] animate-pulse-fast';
      break;
    case 'SAUNA_CALM':
      ballClass = 'from-orange-200 via-amber-200 to-emerald-200 shadow-[0_0_30px_rgba(251,191,36,0.6)] opacity-80 blur-sm';
      break;
    default:
      ballClass = 'from-gray-300 to-white';
  }

  // Typewriter effect logic
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < summaryText.length) {
        setDisplayedText((prev) => prev + summaryText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Speed of typing
    return () => clearInterval(interval);
  }, [summaryText]);

  return (
    <div className="relative mx-4 mt-4 mb-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* UV Alert Badge - Left Corner */}
        {uvAlert && (uvAlert !== 'Low' && uvAlert !== 'null') && (
            <div className="absolute top-4 left-4 bg-orange-500/20 border border-orange-500/50 text-orange-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.4)] z-10">
                <AlertTriangle className="w-3 h-3" />
                UV HIGH
            </div>
        )}

        {/* Fluid Ball Animation */}
        <div className="flex justify-center items-center py-8 relative z-0">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${ballClass} animate-fluid transition-all duration-1000`}></div>

            {/* Wind Effect overlay if stormy */}
            {conditionId === 'SAUNA_STORM' && (
                <div className="absolute w-40 h-1 bg-white/30 blur-md rotate-12 animate-wind-gust top-1/2"></div>
            )}
        </div>

        {/* Weather Data */}
        <div className="flex justify-around items-center text-white/90 mb-6 relative z-10">
            <div className="flex flex-col items-center gap-1 group/item">
                <ThermometerSun className="w-6 h-6 text-yellow-300 drop-shadow-md group-hover/item:scale-110 transition-transform" />
                <span className="text-lg font-bold tracking-wider">{data.temp}</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/item">
                <Droplets className="w-6 h-6 text-blue-300 drop-shadow-md group-hover/item:scale-110 transition-transform" />
                <span className="text-lg font-bold tracking-wider">{data.humidity}</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/item">
                <Wind className="w-6 h-6 text-gray-300 drop-shadow-md group-hover/item:scale-110 transition-transform" />
                <span className="text-lg font-bold tracking-wider">{data.wind}</span>
            </div>
        </div>

        {/* Summary Text (Typewriter) */}
        <div className="min-h-[60px] text-center relative z-10 bg-black/10 rounded-xl p-3 border border-white/5">
            <p className="text-sm md:text-base text-white font-medium leading-relaxed drop-shadow-sm font-sans">
                {displayedText}<span className="animate-blink">|</span>
            </p>
        </div>
    </div>
  );
};

export default MainStatusCard;
