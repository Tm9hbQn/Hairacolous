import React from 'react';

const FooterQuote = ({ quote }) => {
  return (
    <div className="py-12 px-6 text-center w-full max-w-md mx-auto relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-purple-500/10 to-transparent blur-xl pointer-events-none"></div>
      <p className="relative z-10 text-2xl font-dancing-script text-purple-300 -rotate-2 drop-shadow-[0_0_5px_rgba(192,132,252,0.6)] leading-relaxed italic animate-pulse-slow">
        "{quote}"
      </p>
      <span className="block mt-4 text-xs font-mono text-purple-200/50 uppercase tracking-widest">~ Your Hair Bestie</span>
    </div>
  );
};

export default FooterQuote;
