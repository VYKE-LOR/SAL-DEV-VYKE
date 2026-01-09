import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Container */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Progress Fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#6A00FF] rounded-full"
            style={{
              boxShadow: '0 0 20px rgba(255, 60, 172, 0.5), 0 0 40px rgba(106, 0, 255, 0.3)',
            }}
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                width: '50%',
              }}
            />
          </motion.div>

          {/* Progress Glow */}
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF3CAC]/40 to-[#6A00FF]/40 blur-xl"
          />
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between">
          {/* Synced Text */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm text-white/50 tracking-wide"
          >
            Synchronisiert mit deinem Ladefortschritt
          </motion.div>

          {/* Percentage */}
          <motion.div
            key={Math.floor(progress)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-white tracking-wider relative"
          >
            <span className="relative z-10">{Math.floor(progress)}%</span>
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 blur-lg bg-gradient-to-r from-[#FF3CAC] to-[#6A00FF] -z-10"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
