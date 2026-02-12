import React from 'react';

const FooterQuote = ({ quote }) => {
  return (
    <div className="relative max-w-md mx-auto p-8 mb-10 mt-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
      {/* Steamy Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>

      {/* Handwritten Text */}
      <p className="relative z-10 text-3xl font-dancing-script text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed italic text-center select-none">
        "{quote}"
      </p>
      <span className="block mt-4 text-center text-xs font-mono text-white/60 uppercase tracking-widest drop-shadow-md">~ Your Hair Bestie</span>
    </div>
  );
};

export default FooterQuote;
