import React from 'react';

const Header = () => {
  return (
    <header className="grid grid-cols-3 items-center px-4 py-3 sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
      {/* Right (RTL start) - Logo */}
      <div className="flex justify-start">
        <h1 className="text-2xl font-light tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-montserrat whitespace-nowrap">AURA</h1>
      </div>

      {/* Center - Indicator */}
      <div className="flex flex-col items-center justify-center">
         <div className="relative w-10 h-10 overflow-hidden rounded-full border border-green-400/30 bg-black/20 flex items-center justify-center shadow-[0_0_10px_rgba(74,222,128,0.2)]">
            {/* Abstract Lion/Curly Shape SVG */}
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-green-400 fill-current opacity-90 drop-shadow-[0_0_2px_rgba(74,222,128,0.8)]">
               <path d="M50 15 C35 15 20 25 20 50 C20 75 35 85 50 85 C65 85 80 75 80 50 C80 25 65 15 50 15 Z" fill="none" stroke="currentColor" strokeWidth="3" />
               <path d="M35 45 Q50 60 65 45" fill="none" stroke="currentColor" strokeWidth="2" />
               <circle cx="40" cy="40" r="2" fill="currentColor" />
               <circle cx="60" cy="40" r="2" fill="currentColor" />
               <path d="M15 50 Q10 40 15 30 M85 50 Q90 40 85 30 M50 10 Q55 5 50 0 M25 80 Q20 85 25 90 M75 80 Q80 85 75 90" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
            </svg>

            {/* Scanning Laser */}
            <div className="absolute top-[-20%] left-0 w-full h-[140%] bg-gradient-to-b from-transparent via-green-400/40 to-transparent animate-scan opacity-70"></div>
         </div>
         <span className="text-[9px] font-mono text-green-400 tracking-widest uppercase animate-pulse mt-1 whitespace-nowrap">System Online</span>
      </div>

      {/* Left (RTL end) - Empty */}
      <div></div>
    </header>
  );
};

export default Header;
