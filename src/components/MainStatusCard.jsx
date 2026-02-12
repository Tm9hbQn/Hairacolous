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
      ballClass = 'from-slate-500 via-gray-600 to-slate-700 shadow-[0_0_20px_rgba(100,116,139,0.6)]';
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
      if (index <= summaryText.length) {
        setDisplayedText(summaryText.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Speed of typing
    return () => clearInterval(interval);
  }, [summaryText]);

  return (
    <div className="relative mx-4 mt-4 mb-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl group hover:border-white/20 transition-all duration-500">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* UV Alert Badge - Left Corner */}
        {uvAlert && (uvAlert !== 'Low' && uvAlert !== 'null') && (
            <div className="absolute top-4 left-4 bg-orange-500/20 border border-orange-500/50 text-orange-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.4)] z-10">
                <AlertTriangle className="w-3 h-3" />
                UV HIGH
            </div>
        )}

        {/* Hair Waving Animation */}
        <div className="flex justify-center items-center py-2 relative z-0 h-32 overflow-hidden">
             <style>
                {`
                  @keyframes hairWave {
                    0% { transform: skewX(-15deg) rotate(-5deg); }
                    50% { transform: skewX(15deg) rotate(5deg); }
                    100% { transform: skewX(-15deg) rotate(-5deg); }
                  }
                `}
             </style>
             <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 drop-shadow-xl"
                style={{
                    animation: `hairWave ${Math.max(0.5, 30 / (parseInt(data.wind) || 5))}s ease-in-out infinite transform-origin-top`
                }}
             >
                <path
                    d="M50 10 C30 10 20 30 20 50 C20 80 40 90 50 90 C60 90 80 80 80 50 C80 30 70 10 50 10 Z M50 10 Q35 30 35 60 M50 10 Q65 30 65 60"
                    fill="url(#hairGradient)"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fcd34d" /> {/* Amber-300 */}
                        <stop offset="50%" stopColor="#f472b6" /> {/* Pink-400 */}
                        <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
                    </linearGradient>
                </defs>
             </svg>
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
