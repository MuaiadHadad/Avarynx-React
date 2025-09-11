'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AvatarState {
  // Avatar settings
  currentAvatar: string;
  avatarMood: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
  cameraView: 'upper' | 'full';

  // Audio/Speech state
  isListening: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  currentVoice: string;
  voiceType: 'google' | 'elevenlabs' | 'microsoft';

  // Chat state
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
  isConnected: boolean;

  // UI state
  showControls: boolean;
  isLoading: boolean;
  loadingProgress: number;

  // Actions
  setCurrentAvatar: (avatar: string) => void;
  setAvatarMood: (mood: AvatarState['avatarMood']) => void;
  setCameraView: (view: AvatarState['cameraView']) => void;
  setIsListening: (listening: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setVolumeLevel: (level: number) => void;
  setCurrentVoice: (voice: string) => void;
  setVoiceType: (type: AvatarState['voiceType']) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  setIsConnected: (connected: boolean) => void;
  setShowControls: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;

  // Complex actions
  toggleListening: () => void;
  switchCameraView: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentAvatar: 'Brunette',
    avatarMood: 'neutral',
    cameraView: 'upper',

    isListening: false,
    isSpeaking: false,
    volumeLevel: 0,
    currentVoice: 'en-Jenny',
    voiceType: 'microsoft',

    messages: [],
    isConnected: false,

    showControls: true,
    isLoading: false,
    loadingProgress: 0,

    // Basic setters
    setCurrentAvatar: (avatar) => set({ currentAvatar: avatar }),
    setAvatarMood: (mood) => set({ avatarMood: mood }),
    setCameraView: (view) => set({ cameraView: view }),
    setIsListening: (listening) => set({ isListening: listening }),
    setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
    setVolumeLevel: (level) => set({ volumeLevel: Math.max(0, Math.min(1, level)) }),
    setCurrentVoice: (voice) => set({ currentVoice: voice }),
    setVoiceType: (type) => set({ voiceType: type }),
    setIsConnected: (connected) => set({ isConnected: connected }),
    setShowControls: (show) => set({ showControls: show }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setLoadingProgress: (progress) => set({ loadingProgress: progress }),

    // Message management
    addMessage: (role, content) =>
      set((state) => ({
        messages: [...state.messages, { role, content, timestamp: Date.now() }].slice(-50), // Keep only last 50 messages
      })),

    clearMessages: () => set({ messages: [] }),

    // Complex actions
    toggleListening: () => {
      const { isListening } = get();
      set({ isListening: !isListening });
    },

    switchCameraView: () => {
      const { cameraView } = get();
      set({ cameraView: cameraView === 'upper' ? 'full' : 'upper' });
    },
  })),
);

// Subscribe to volume level changes for avatar animation
useAvatarStore.subscribe(
  (state) => state.volumeLevel,
  (volumeLevel) => {
    // Dispatch custom event for avatar mouth movement
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('avatar:volume', {
          detail: volumeLevel,
        }),
      );
    }
  },
);
