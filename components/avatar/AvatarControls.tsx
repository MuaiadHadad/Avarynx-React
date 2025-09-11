'use client';

import { useState } from 'react';
import { Mic, MicOff, Camera, MessageSquare, Settings, Volume2 } from 'lucide-react';
import { useAvatarStore } from './store';
import type { AvatarState } from './store';
import { useLipsync } from './useLipsync';

export default function AvatarControls() {
  const {
    avatarMood,
    cameraView,
    isListening,
    isSpeaking,
    currentVoice,
    voiceType,
    messages,
    isConnected,
    setAvatarMood,
    switchCameraView,
    setCurrentVoice,
    setVoiceType,
    addMessage,
    clearMessages,
  } = useAvatarStore();

  const { toggleMicrophone, hasMicPermission } = useLipsync();
  const [showSettings, setShowSettings] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Handle TTS speech
  const handleSpeak = async (text: string) => {
    if (!text.trim()) return;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: currentVoice,
          voiceType,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onplay = () => useAvatarStore.getState().setIsSpeaking(true);
        audio.onended = () => {
          useAvatarStore.getState().setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        addMessage('assistant', text);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleSpeak(textInput);
      setTextInput('');
    }
  };

  const moods = [
    { key: 'neutral', label: 'Neutral', emoji: '😐' },
    { key: 'happy', label: 'Happy', emoji: '😊' },
    { key: 'sad', label: 'Sad', emoji: '😢' },
    { key: 'surprised', label: 'Surprised', emoji: '😮' },
    { key: 'angry', label: 'Angry', emoji: '😠' },
  ] as const;

  const voices = {
    microsoft: [
      { id: 'en-Jenny', label: 'Jenny (EN)' },
      { id: 'en-Tony', label: 'Tony (EN)' },
      { id: 'fi-Selma', label: 'Selma (FI)' },
      { id: 'fi-Noora', label: 'Noora (FI)' },
    ],
    google: [
      { id: 'en-F', label: 'Female (EN)' },
      { id: 'en-M', label: 'Male (EN)' },
      { id: 'fi-F', label: 'Female (FI)' },
    ],
    elevenlabs: [
      { id: 'Bella', label: 'Bella' },
      { id: 'Rachel', label: 'Rachel' },
      { id: 'Adam', label: 'Adam' },
    ],
  };

  return (
    <div className="avatar-control-panel">
      {/* Main Controls Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Microphone Toggle */}
        <button
          onClick={toggleMicrophone}
          className={`avatar-button ${isListening ? 'active' : ''}`}
          disabled={!hasMicPermission}
          title={isListening ? 'Stop Listening' : 'Start Listening'}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera View Toggle */}
        <button
          onClick={switchCameraView}
          className="avatar-button"
          title={`Switch to ${cameraView === 'upper' ? 'Full' : 'Upper'} View`}
        >
          <Camera className="w-5 h-5" />
          <span className="ml-2 text-sm">{cameraView}</span>
        </button>

        {/* Chat Toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`avatar-button ${showChat ? 'active' : ''}`}
          title="Toggle Chat"
        >
          <MessageSquare className="w-5 h-5" />
          {messages.length > 0 && (
            <span className="ml-1 text-xs bg-secondary-500 rounded-full px-1">
              {messages.length}
            </span>
          )}
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`avatar-button ${showSettings ? 'active' : ''}`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Text Input for TTS */}
      <form onSubmit={handleTextSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type something for the avatar to say..."
            className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-primary-500 placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            disabled={isSpeaking}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isSpeaking}
            className="avatar-button px-4"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-4 border-t border-dark-border pt-4">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Avatar Mood</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setAvatarMood(mood.key)}
                  className={`avatar-button p-2 text-center ${avatarMood === mood.key ? 'active' : ''}`}
                  title={mood.label}
                >
                  <div>{mood.emoji}</div>
                  <div className="text-xs">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Voice Settings</label>
            <div className="space-y-2">
              <select
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value as AvatarState['voiceType'])}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-primary-500"
              >
                <option value="microsoft">Microsoft</option>
                <option value="google">Google</option>
                <option value="elevenlabs">ElevenLabs</option>
              </select>

              <select
                value={currentVoice}
                onChange={(e) => setCurrentVoice(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-primary-500"
              >
                {voices[voiceType].map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="border-t border-dark-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Chat History</h4>
            <button
              onClick={clearMessages}
              className="text-xs text-gray-400 hover:text-primary-500"
            >
              Clear
            </button>
          </div>
          <div className="h-32 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500">No messages yet</p>
            ) : (
              messages.slice(-10).map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="text-xs opacity-70 mb-1">
                    {msg.role === 'user' ? 'You' : 'Avatar'}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
