import React from 'react';
import { motion } from 'framer-motion';
import { getProductIconKey, getProductLabel, getDoseLevel } from '../utils';
import { Droplet, Wind, Sparkles, Cloud, Shield, Star, Lightbulb, SprayCan as Spray, Shuffle, ShieldCheck, Ban } from 'lucide-react';

const icons = {
  droplet: Droplet,
  wind: Wind,
  sparkles: Sparkles,
  cloud: Cloud,
  shield: Shield,
  star: Star,
  lightbulb: Lightbulb,
  spray: Spray,
  shuffle: Shuffle,
  shield_check: ShieldCheck
};

const ProtocolStack = ({ routine }) => {
  // Define the order of keys to display
  const order = [
    'shampoo', 'conditioner', 'mask', 'leave_in', 'gel', 'oil', 'styling_tip',
    'water_refresh', 'product_mix', 'protection'
  ];

  // Filter keys that exist in the routine object
  const items = order.filter(key => routine[key]);

  return (
    <div className="flex flex-col gap-3 px-4 pb-12 w-full max-w-lg mx-auto">
      {items.map((key, index) => {
        const text = routine[key];
        const dose = getDoseLevel(text);
        const Icon = icons[getProductIconKey(key)] || Sparkles;
        const label = getProductLabel(key);

        // Determine bar color and width based on dose
        let barColor = 'bg-gray-500';
        let barWidth = '0%';
        let shadowColor = 'text-gray-500';

        if (dose === 'low') {
            barColor = 'bg-yellow-300';
            barWidth = '20%';
            shadowColor = 'text-yellow-300';
        } else if (dose === 'normal') {
            barColor = 'bg-blue-400';
            barWidth = '50%';
            shadowColor = 'text-blue-400';
        } else if (dose === 'high') {
            barColor = 'bg-pink-500';
            barWidth = '100%';
            shadowColor = 'text-pink-500';
        }

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors group"
          >
             {/* Header: Icon + Label */}
             <div className="flex items-center gap-2 mb-2 text-cyan-300 drop-shadow-sm">
                <Icon size={16} className="text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>
             </div>

             <div className="flex justify-between items-center gap-4">
                {/* Text (Right aligned by default in RTL) */}
                <p className="text-sm text-white/90 leading-relaxed flex-1 text-right font-light">
                    {text}
                </p>

                {/* Dose Meter (Left) */}
                <div className="w-[50px] flex-shrink-0 flex flex-col items-center justify-center h-full min-h-[24px]">
                    {/* Visual Bar or Ban Icon */}
                    {dose === 'none' ? (
                        <Ban size={20} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)] animate-pulse-slow" />
                    ) : (
                        <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full shadow-[0_0_8px_currentColor] transition-all duration-1000 ${barColor} ${shadowColor}`}
                                style={{ width: barWidth }}
                            ></div>
                        </div>
                    )}
                </div>
             </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProtocolStack;
