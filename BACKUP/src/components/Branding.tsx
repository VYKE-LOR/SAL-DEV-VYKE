import React from 'react';
import { motion } from 'motion/react';

export function Branding() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-6"
    >
      {/* Server Logo */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 60, 172, 0.1)',
            '0 0 35px rgba(255, 60, 172, 0.3)',
            '0 0 20px rgba(255, 60, 172, 0.1)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF3CAC] to-[#6A00FF] p-[1px]"
      >
        <div className="w-full h-full rounded-[11px] bg-[#0a0a0f] flex items-center justify-center backdrop-blur-3xl">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#FF3CAC] to-[#6A00FF]">
            SA
          </span>
        </div>
      </motion.div>

      {/* Server Name */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          San Andreas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3CAC] to-[#6A00FF]">Legacy</span>
        </h1>
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
            className="h-0.5 bg-gradient-to-r from-[#FF3CAC] via-[#6A00FF] to-transparent rounded-full mt-1 opacity-50" 
        />
      </div>
    </motion.div>
  );
}
