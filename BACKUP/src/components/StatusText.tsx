import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StatusTextProps {
  status: string;
}

export function StatusText({ status }: StatusTextProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status Text with Smooth Transitions */}
      <div className="h-12 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-light text-white/90 tracking-[0.2em] uppercase text-center"
            style={{
                textShadow: "0 0 30px rgba(255, 60, 172, 0.2)"
            }}
          >
            {status}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
