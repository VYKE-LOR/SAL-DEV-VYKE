import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Music2, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from './ui/slider';

interface FooterProps {
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export function Footer({ volume, setVolume, isMuted, setIsMuted }: FooterProps) {
  const socials = [
    { icon: MessageCircle, label: 'Discord', handle: 'discord.gg/sa-legacy', url: 'https://discord.gg/sa-legacy' },
    { icon: Music2, label: 'TikTok', handle: '@sanandreas_legacy', url: 'https://www.tiktok.com/@sanandreas_legacy' },
  ];

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="flex items-end justify-between w-full"
    >
      {/* Social Icons */}
      <div className="flex items-center gap-6 w-1/3">
        {socials.map((social, index) => (
          <motion.a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            key={social.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              x: 5,
            }}
            className="group flex items-center gap-4 transition-all duration-300 cursor-pointer"
          >
            <div className="relative p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300 group-hover:bg-white/10 group-hover:border-[#FF3CAC]/30 overflow-hidden">
              <social.icon className="w-5 h-5 text-white/60 transition-colors duration-300 group-hover:text-[#FF3CAC] relative z-10" />
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3CAC]/20 to-[#6A00FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold group-hover:text-white/50 transition-colors">{social.label}</span>
                <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors duration-300 font-medium">
                {social.handle}
                </span>
            </div>
          </motion.a>
        ))}
      </div>
      
       {/* Version Info / Copyright - Center */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.8, delay: 0.9 }}
         className="text-xs text-white/20 tracking-[0.2em] uppercase font-light w-1/3 text-center mb-2"
       >
         San Andreas Legacy © 2026
       </motion.div>

       {/* Volume Control - Right */}
       <motion.div
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.8, delay: 0.9 }}
         className="w-1/3 flex justify-end"
       >
         <div className="flex items-center gap-5 bg-black/40 backdrop-blur-xl px-6 py-4 rounded-full border border-white/5 hover:border-[#FF3CAC]/30 transition-all duration-500 group shadow-lg shadow-black/20">
            <button 
                onClick={toggleMute}
                className="text-white/50 hover:text-[#FF3CAC] transition-colors focus:outline-none transform group-hover:scale-110 duration-300"
            >
                {getVolumeIcon()}
            </button>
            <div className="w-32 relative">
                <Slider
                    defaultValue={[volume]}
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                />
            </div>
            <div className="text-xs font-medium text-white/30 tabular-nums w-8 text-right group-hover:text-white/60 transition-colors">
                {isMuted ? 0 : Math.round(volume * 100)}%
            </div>
         </div>
       </motion.div>
    </motion.div>
  );
}
