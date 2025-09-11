'use client';

import { useState, useEffect } from 'react';
import { useAvatarStore } from './store';
import AvatarControls from './AvatarControls';

// Create a simple fallback avatar component
function FallbackAvatar() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
          <span className="text-white text-2xl font-bold">A</span>
        </div>
        <div className="text-primary-500 mb-2">Avatar Preview</div>
        <div className="text-sm text-gray-400">3D environment loading...</div>
      </div>
    </div>
  );
}

// Temporary placeholder while we fix the Three.js integration
function PlaceholderAvatar() {
  const { cameraView, avatarMood, isListening } = useAvatarStore();

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-dark-bg via-gray-800 to-dark-bg">
      <div className="text-center">
        <div
          className={`w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${
            isListening ? 'animate-pulse scale-110' : ''
          }`}
        >
          <span className="text-white text-4xl font-bold">A</span>
        </div>
        <div className="text-primary-500 text-xl mb-2">Avarynx Avatar</div>
        <div className="text-sm text-gray-400 mb-4">
          View: {cameraView} | Mood: {avatarMood}
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
          ></div>
          <span className="text-xs text-gray-400">{isListening ? 'Listening...' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}

export default function AvatarCanvas() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // For now, we'll show the placeholder instead of Three.js
    // This eliminates the React Three Fiber error completely
    const timer = setTimeout(() => {
      // We can implement Three.js loading later once the error is resolved
      console.log('Avatar canvas mounted successfully');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return <FallbackAvatar />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Show placeholder avatar that responds to controls */}
      <PlaceholderAvatar />

      {/* Overlay controls - these work immediately */}
      <div className="absolute bottom-4 left-4 right-4">
        <AvatarControls />
      </div>
    </div>
  );
}
