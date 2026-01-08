import React from 'react';
import { motion } from 'motion/react';

export function NeonAccents() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Neon Line 1 - Top Right */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-32 right-24 w-96 h-0.5 bg-gradient-to-r from-transparent via-[#FF3CAC] to-transparent blur-sm"
      />

      {/* Neon Line 2 - Bottom Left */}
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-48 left-32 w-80 h-0.5 bg-gradient-to-r from-transparent via-[#6A00FF] to-transparent blur-sm"
      />

      {/* Blob 1 - Pink */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FF3CAC] blur-[120px]"
      />

      {/* Blob 2 - Purple */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute bottom-1/3 left-1/3 w-[32rem] h-[32rem] rounded-full bg-[#6A00FF] blur-[140px]"
      />

      {/* Subtle Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
          className="absolute w-1 h-1 rounded-full bg-[#FF3CAC]"
          style={{
            left: `${20 + i * 10}%`,
            bottom: '10%',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}
