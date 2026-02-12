import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-pink-500 border-r-pink-500 border-b-transparent border-l-transparent rounded-full mb-4"
      />
      <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text animate-pulse">
        Generating your hair forecast...
      </h2>
      <p className="text-gray-400 mt-2 text-sm text-center max-w-md">
        Analyzing weather patterns, checking dew points, and consulting the hair gods. Hang tight!
      </p>
    </div>
  );
};

export default LoadingSpinner;
