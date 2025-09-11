// Site configuration for avatar and voice settings
export const avatarConfig = {
  // Preset avatars
  avatars: {
    Brunette: {
      url: '/avatars/brunette.glb',
      body: 'F',
      avatarMood: 'neutral',
      fi: 'Brunetti',
    },
  },

  // Voice configurations
  voices: {
    microsoft: {
      'en-Jenny': { lang: 'en-US', id: 'en-US-JennyNeural' },
      'en-Tony': { lang: 'en-US', id: 'en-US-TonyNeural' },
      'fi-Selma': { lang: 'fi-FI', id: 'fi-FI-SelmaNeural' },
      'fi-Noora': { lang: 'fi-FI', id: 'fi-FI-NooraNeural' },
    },
    google: {
      'en-F': { id: 'en-GB-Standard-A' },
      'en-M': { id: 'en-GB-Standard-D' },
      'fi-F': { id: 'fi-FI-Standard-A' },
    },
    elevenlabs: {
      Bella: { id: 'EXAVITQu4vr4xnSDxMaL' },
      Rachel: { id: '21m00Tcm4TlvDq8ikWAM' },
      Adam: { id: 'pNInz6obpgDQGcFmaJgB' },
    },
  },

  // Default settings
  defaults: {
    avatar: 'Brunette',
    voice: 'en-Jenny',
    voiceType: 'microsoft',
    mood: 'neutral',
    cameraView: 'upper',
  },
};

export default avatarConfig;
