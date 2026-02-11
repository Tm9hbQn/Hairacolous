import React from 'react';
import { motion } from 'framer-motion';

const RoutineToggle = ({ routineType, setRoutineType }) => {
  const isWash = routineType === 'wash';

  return (
    <div className="flex justify-center mb-10 px-6 w-full">
      <div className="relative w-full max-w-sm h-16 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 p-1.5 flex shadow-lg select-none group hover:border-white/20 transition-colors ring-1 ring-white/5 overflow-hidden">

        {/* Wash Day Button (Right) */}
        <button
          className="relative flex-1 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 z-10 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={() => setRoutineType('wash')}
        >
          {isWash && (
            <motion.div
              layoutId="toggle-highlight"
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className={isWash ? 'text-white drop-shadow-md' : 'text-white/60 hover:text-white/90'}>יום חפיפה 🚿</span>
        </button>

        {/* Refresh Day Button (Left) */}
        <button
          className="relative flex-1 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 z-10 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={() => setRoutineType('refresh')}
        >
          {!isWash && (
            <motion.div
              layoutId="toggle-highlight"
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className={!isWash ? 'text-white drop-shadow-md' : 'text-white/60 hover:text-white/90'}>רענון ✨</span>
        </button>

      </div>
    </div>
  );
};

export default RoutineToggle;
