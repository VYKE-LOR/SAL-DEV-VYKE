import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <LoadingScreen />
    </div>
  );
}
