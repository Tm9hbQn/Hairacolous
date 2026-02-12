import React, { useEffect, useState } from 'react';
import { Wind, Droplets, ThermometerSun, AlertTriangle } from 'lucide-react';
import { WEATHER_DATA } from '../data';

const MainStatusCard = ({ data, summaryText, uvAlert, conditionId }) => {
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
                  @keyframes threadFlutter {
                    0% { transform: scaleX(1) skewY(0deg); }
                    50% { transform: scaleX(0.9) skewY(15deg); }
                    100% { transform: scaleX(1) skewY(0deg); }
                  }
                  @keyframes threadFlutterReverse {
                    0% { transform: scaleX(1) skewY(0deg); }
                    50% { transform: scaleX(0.9) skewY(-15deg); }
                    100% { transform: scaleX(1) skewY(0deg); }
                  }
                `}
             </style>
             <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 drop-shadow-xl"
             >
                {/* Threads Group - Positioned at Nozzle */}
                <g transform="translate(55, 40)">
                     {/* Thread 1 (Top) */}
                     <g style={{
                            animation: `threadFlutter ${Math.max(0.2, 20 / (parseInt(data.wind) || 5))}s ease-in-out infinite`,
                            transformOrigin: "0 0"
                        }}>
                        <path
                            d="M 0 -5 C -15 -15, -30 -5, -45 -15"
                            stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"
                        />
                     </g>

                     {/* Thread 2 (Bottom) */}
                     <g style={{
                            animation: `threadFlutterReverse ${Math.max(0.2, 25 / (parseInt(data.wind) || 5))}s ease-in-out infinite`,
                            transformOrigin: "0 0"
                        }}>
                         <path
                            d="M 0 5 C -15 15, -30 5, -45 15"
                            stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"
                         />
                     </g>

                     {/* Thread 3 (Middle/Paper) */}
                     <g style={{
                            animation: `threadFlutter ${Math.max(0.2, 15 / (parseInt(data.wind) || 5))}s ease-in-out infinite`,
                            animationDelay: '0.1s',
                            transformOrigin: "0 0"
                        }}>
                         <rect x="-40" y="-2" width="40" height="4" fill="white" opacity="0.7" rx="1" />
                     </g>
                </g>

                {/* Dryer */}
                <g>
                  {/* Handle */}
                  <path d="M85 50 L80 85 A 5 5 0 0 0 90 85 L95 50 Z" fill="#be185d" />
                  {/* Body */}
                  <path d="M60 25 H 95 A 10 10 0 0 1 105 35 V 45 A 10 10 0 0 1 95 55 H 60 Z" fill="#f472b6" />
                  {/* Nozzle */}
                  <rect x="55" y="30" width="10" height="20" fill="#db2777" rx="2" />
                  {/* Highlight */}
                  <ellipse cx="95" cy="40" rx="3" ry="8" fill="rgba(255,255,255,0.3)" transform="rotate(-20 95 40)" />
                </g>
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
        <div className="relative z-10 bg-black/10 rounded-xl p-3 border border-white/5 text-center">
            {/* Invisible spacer to maintain height based on longest possible text */}
            <p className="text-sm md:text-base text-transparent font-medium leading-relaxed font-sans select-none pointer-events-none" aria-hidden="true">
                {WEATHER_DATA.periods.reduce((max, p) => p.summary_text.length > max.length ? p.summary_text : max, "")}
            </p>
            {/* Actual text overlay */}
            <p className="absolute top-3 left-3 right-3 text-sm md:text-base text-white font-medium leading-relaxed drop-shadow-sm font-sans">
                {displayedText}<span className="animate-blink">|</span>
            </p>
        </div>
    </div>
  );
};

export default MainStatusCard;
