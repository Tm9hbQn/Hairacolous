import React from 'react';

const WomanGraphic = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A3728" /> {/* Dark Brown */}
          <stop offset="40%" stopColor="#8B5E3C" /> {/* Medium Brown */}
          <stop offset="80%" stopColor="#D4AF37" /> {/* Golden Blonde */}
          <stop offset="100%" stopColor="#FFD700" /> {/* Gold */}
        </linearGradient>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5DEB3" /> {/* Wheat */}
          <stop offset="100%" stopColor="#E0C090" /> {/* Tan */}
        </linearGradient>
      </defs>

      {/* Background Hair Volume (Lots of curls/waves) */}
      <path d="M60 40 Q 20 60 10 110 Q 0 160 30 200 Q 50 230 80 210" fill="url(#hairGradient)" />
      <path d="M140 40 Q 180 60 190 110 Q 200 160 170 200 Q 150 230 120 210" fill="url(#hairGradient)" />
      <ellipse cx="100" cy="80" rx="65" ry="70" fill="url(#hairGradient)" />

      {/* Neck */}
      <rect x="88" y="100" width="24" height="25" fill="url(#skinGradient)" />

      {/* Torso/Thighs (Silhouette/Dress) */}
      <path d="M75 125 C 60 145 55 190 55 240 L 145 240 C 145 190 140 145 125 125" fill="#FFC0CB" />

      {/* Head */}
      <ellipse cx="100" cy="85" rx="32" ry="38" fill="url(#skinGradient)" />

      {/* Foreground Hair Strands (Wavy/Curly details) */}
      <path d="M100 50 Q 120 50 130 90 Q 140 140 135 190" fill="none" stroke="url(#hairGradient)" strokeWidth="8" strokeLinecap="round" />
      <path d="M100 50 Q 80 50 70 90 Q 60 140 65 190" fill="none" stroke="url(#hairGradient)" strokeWidth="8" strokeLinecap="round" />

      {/* Additional strands for volume */}
      <path d="M110 55 Q 150 60 160 120 Q 155 180 145 220" fill="none" stroke="url(#hairGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M90 55 Q 50 60 40 120 Q 45 180 55 220" fill="none" stroke="url(#hairGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

    </svg>
  );
};

export default WomanGraphic;
