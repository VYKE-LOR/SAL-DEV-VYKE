import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoBackground } from './VideoBackground';
import { Branding } from './Branding';
import { StatusText } from './StatusText';
import { ProgressBar } from './ProgressBar';
import { Footer } from './Footer';
import { NeonAccents } from './NeonAccents';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [volume, setVolume] = useState(0.15);
  const [isMuted, setIsMuted] = useState(false);

  const statuses = [
    'Lade Ressourcen...',
    'Synchronisiere Daten...',
    'Verbinde mit Server...',
    'Lädt Spielwelt...',
    'Fast fertig...'
  ];

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Cycle through status texts
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Video Background */}
      <VideoBackground volume={volume} isMuted={isMuted} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/70 z-10 pointer-events-none" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-20 opacity-[0.03] mix-blend-overlay pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
             backgroundRepeat: 'repeat'
           }} 
      />

      {/* Neon Accents */}
      <NeonAccents />
      
      {/* Main UI Container */}
      <div className="relative z-30 w-full h-full flex flex-col justify-between">
        {/* Branding - Top Left */}
        <div className="pt-16 pl-16">
          <Branding />
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-5xl mx-auto">
            <StatusText status={statuses[statusIndex]} />
            <div className="w-full px-16">
                <ProgressBar progress={Math.min(100, progress)} />
            </div>
        </div>

        {/* Footer */}
        <div className="pb-12 px-16 w-full">
          <Footer 
            volume={volume} 
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </div>
      </div>
    </div>
  );
}
