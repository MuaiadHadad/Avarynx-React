'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAvatarStore } from './store';

interface LipsyncConfig {
  micPermission: boolean;
  audioContext?: AudioContext;
  analyser?: AnalyserNode;
  microphone?: MediaStreamAudioSourceNode;
  dataArray?: Uint8Array;
  isActive: boolean;
}

export function useLipsync() {
  const { setVolumeLevel, setIsListening } = useAvatarStore();
  const [config, setConfig] = useState<LipsyncConfig>({
    micPermission: false,
    isActive: false,
  });
  const animationFrameRef = useRef<number>();

  // Request microphone permission
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioContext = new AudioContext();
      const microphone = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      setConfig({
        micPermission: true,
        audioContext,
        analyser,
        microphone,
        dataArray,
        isActive: false,
      });

      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }, []);

  // Start listening and analyzing audio
  const startListening = useCallback(() => {
    if (!config.analyser || !config.dataArray) return;

    setConfig((prev) => ({ ...prev, isActive: true }));
    setIsListening(true);

    const analyzeAudio = () => {
      if (!config.analyser || !config.dataArray || !config.isActive) return;

      // Get frequency data - create a properly typed array to avoid buffer type issues
      const frequencyData = new Uint8Array(config.dataArray.length);
      config.analyser.getByteFrequencyData(frequencyData);

      // Calculate RMS (Root Mean Square) for volume level
      let sum = 0;
      for (let i = 0; i < frequencyData.length; i++) {
        const value = (frequencyData[i] - 128) / 128;
        sum += value * value;
      }

      const rms = Math.sqrt(sum / frequencyData.length);
      const volumeLevel = Math.min(1, rms * 3); // Amplify and clamp

      setVolumeLevel(volumeLevel);

      if (config.isActive) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      }
    };

    analyzeAudio();
  }, [config, setVolumeLevel, setIsListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    setConfig((prev) => ({ ...prev, isActive: false }));
    setIsListening(false);
    setVolumeLevel(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [setIsListening, setVolumeLevel]);

  // Toggle microphone listening
  const toggleMicrophone = useCallback(async () => {
    if (!config.micPermission) {
      const granted = await requestMicPermission();
      if (!granted) return false;
    }

    if (config.isActive) {
      stopListening();
    } else {
      startListening();
    }

    return true;
  }, [config, requestMicPermission, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (config.audioContext?.state !== 'closed') {
        config.audioContext?.close();
      }
    };
  }, [config.audioContext]);

  return {
    hasMicPermission: config.micPermission,
    isListening: config.isActive,
    toggleMicrophone,
    requestMicPermission,
  };
}
