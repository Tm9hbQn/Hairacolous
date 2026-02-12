import React from 'react';

const Header = () => {
  return (
    <header className="flex flex-col items-center justify-center py-6 px-4 relative z-50">
      <div className="flex items-center gap-3 drop-shadow-lg">
        {/* Lion's Mane Logo */}
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-pink-500 fill-current drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">
               {/* Abstract Mane / Hair Flowing */}
               <path d="M50 20 C 30 20, 10 35, 10 60 C 10 85, 30 95, 50 95 C 70 95, 90 85, 90 60 C 90 35, 70 20, 50 20 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
               <path d="M25 55 Q 15 35, 35 25 Q 50 10, 65 25 Q 85 35, 75 55" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               <path d="M20 65 Q 10 45, 30 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
               <path d="M80 65 Q 90 45, 70 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

               {/* Face Silhouette */}
               <path d="M40 50 Q 50 60, 60 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               <circle cx="38" cy="45" r="2" fill="currentColor" />
               <circle cx="62" cy="45" r="2" fill="currentColor" />

               {/* Wild Mane Strands */}
               <path d="M50 10 Q 30 0, 15 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               <path d="M50 10 Q 70 0, 85 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               <path d="M10 50 Q 0 40, 5 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               <path d="M90 50 Q 100 40, 95 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>

        {/* Text */}
        <h1 className="text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 font-dancing-script drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          Hairaculous
        </h1>
      </div>
      <p className="text-xs text-white/80 font-light tracking-[0.3em] uppercase mt-1">
        Strong & Beautiful
      </p>
    </header>
  );
};

export default Header;
