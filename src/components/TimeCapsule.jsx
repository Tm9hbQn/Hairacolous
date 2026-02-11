import React from 'react';
import { motion } from 'framer-motion';

const TimeCapsule = ({ periods, selectedPeriod, onSelect }) => {
  return (
    <div className="sticky top-[80px] z-40 flex justify-center w-full px-4 mb-6">
      <div className="relative flex items-center bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg ring-1 ring-white/5">
        {periods.map((period) => {
          const isSelected = selectedPeriod.period_name === period.period_name;
          const label = period.period_name.split(' ')[0]; // Extract Hebrew part

          return (
            <button
              key={period.period_name}
              onClick={() => onSelect(period)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 min-w-[80px] text-center outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                isSelected ? 'text-black font-bold' : 'text-white/60 hover:text-white/90'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 drop-shadow-sm">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeCapsule;
