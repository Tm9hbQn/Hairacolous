import React from 'react';
import WomanGraphic from './WomanGraphic';

const Header = () => {
  return (
    <header className="flex flex-col items-center justify-center py-6 px-4 relative z-50">
      <div className="flex items-center gap-3 drop-shadow-lg">
        {/* Woman Graphic Logo */}
        <div className="relative w-20 h-24 flex items-center justify-center">
            <WomanGraphic className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]" />
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
