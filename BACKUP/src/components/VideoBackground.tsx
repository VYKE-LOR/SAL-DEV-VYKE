import React, { useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoBackgroundProps {
  volume: number;
  isMuted: boolean;
}

export function VideoBackground({ volume, isMuted }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterImage = "https://images.unsplash.com/photo-1561344640-2453889cde5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5JTIwbmlnaHQlMjBuZW9uJTIwYWVzdGhldGljJTIwcHVycGxlJTIwcGlua3xlbnwxfHx8fDE3NjczNzY3MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0a0f]">
      {/* Background Image (as video fallback/poster) */}
      <div className="absolute inset-0 z-0">
          <img 
            src={posterImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
          />
      </div>

      {/* Video element - replace with your actual .mp4 file path */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster={posterImage}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-0 transition-opacity duration-1000" // Hidden by default until user adds source
        onLoadedData={(e) => e.currentTarget.classList.remove('opacity-0')}
      >
        <source src="/your-video.mp4" type="video/mp4" />
      </video>
      
      {/* Fallback gradient if video/image doesn't load */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0525] via-[#0f0318] to-[#1a0525] -z-10" />
    </div>
  );
}
