# Avarynx Avatar - Next.js 15 + React Three Fiber

A cutting-edge AI avatar experience built with Next.js 15, React Three Fiber, and advanced lipsync technology.

## ✨ Features

- **🎭 Interactive 3D Avatars** - GLB/GLTF support with advanced rigging and blendshapes
- **🎤 Real-time Lipsync** - WebAudio API-powered mouth movement synchronized with speech
- **🗣️ Multi-Provider TTS** - Support for Microsoft Azure, Google Cloud, ElevenLabs, and StreamElements
- **💬 Live Chat Integration** - WebSocket-based real-time communication
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **⚡ High Performance** - Built with React Three Fiber and optimized rendering
- **🔒 Secure API Routes** - Protected endpoints for sensitive operations
- **🌐 Multi-language Support** - English and Finnish voice options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- pnpm, npm, or yarn
- Modern browser with WebGL 2.0 support

### Installation

```bash
# Navigate to project directory
cd avarynx-avatar-next

# Install dependencies
pnpm install
# or: npm install
# or: yarn install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
# or: npm run dev
# or: yarn dev
```

Open [https://frontend.avarynx.mywire.org](https://frontend.avarynx.mywire.org) in your browser.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file and configure your API keys:

```env
# Microsoft Azure Speech Services (recommended)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus

# Google Cloud Text-to-Speech
GOOGLE_TTS_KEY=your_google_tts_api_key_here

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# WebSocket Server (optional)
WEBSOCKET_URL=ws://your-websocket-server:port/api/chat/ws
```

### Avatar Models

Place your GLB/GLTF avatar models in the `public/avatars/` directory. Models should include:

- Proper rigging and bone structure
- Facial blendshapes for expressions:
  - `V_Open` or `jawOpen` or `mouthOpen` (for lipsync)
  - `Smile`, `Frown` (for mood expressions)
  - Standard ARKit or VRM blendshapes (recommended)

## 🏗️ Project Structure

```
avarynx-avatar-next/
├── app/                    # Next.js 15 App Router
│   ├── api/tts/           # TTS API route
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── avatar/            # Avatar-specific components
│   │   ├── AvatarCanvas.tsx    # Main 3D canvas
│   │   ├── AvatarControls.tsx  # UI controls
│   │   ├── store.ts            # Zustand state management
│   │   └── useLipsync.ts       # Lipsync hook
│   └── sections/          # Landing page sections
│       ├── Header.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Showcase.tsx
│       ├── FAQ.tsx
│       ├── CTA.tsx
│       └── Footer.tsx
├── lib/                   # Utility libraries
│   ├── config.ts          # Site configuration
│   └── websocket.ts       # WebSocket utilities
├── public/                # Static assets
│   ├── avatars/           # GLB/GLTF models
│   ├── fonts/             # Custom fonts
│   └── images/            # Static images
└── ...config files
```

## 🎮 Usage

### Basic Avatar Interaction

1. **Microphone Access**: Click the microphone button to enable voice input
2. **Camera Views**: Toggle between "upper" and "full" body views
3. **Text-to-Speech**: Type text in the input field and click speak
4. **Mood Control**: Change avatar expressions using the mood selector
5. **Voice Selection**: Choose from multiple TTS providers and voices

### Advanced Features

#### Custom Avatar Integration

```typescript
// Add your avatar to lib/config.ts
export const avatarConfig = {
  avatars: {
    MyAvatar: {
      url: '/avatars/my-avatar.glb',
      body: 'F', // or 'M'
      avatarMood: 'neutral',
    },
  },
};
```

#### WebSocket Integration

```typescript
// Real-time chat integration
import { useWebSocket } from '@/lib/websocket';

const { isConnected, sendMessage } = useWebSocket('ws://your-server:port');

// Send chat message
sendMessage({
  type: 'chat',
  data: { role: 'user', content: 'Hello!' },
});
```

## 🔍 API Routes

### TTS Endpoint

`POST /api/tts`

```json
{
  "text": "Hello, world!",
  "voice": "en-Jenny",
  "voiceType": "microsoft"
}
```

Returns audio/mpeg stream for playback.

## 🛠️ Development

### Build for Production

```bash
pnpm build
pnpm start
```

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## 📱 Browser Support

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 14+
- Edge 80+

### Required Browser Features

- WebGL 2.0
- WebAudio API
- getUserMedia API
- ES2020+ support

## 🎯 Performance Optimization

- **Dynamic Imports**: 3D components loaded on-demand
- **Asset Preloading**: GLB models preloaded for smooth experience
- **Efficient Rendering**: React Three Fiber with optimized frame loops
- **Memory Management**: Proper cleanup of audio contexts and 3D objects

## 🔒 Security Features

- **API Key Protection**: Sensitive keys kept server-side
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Text and audio input sanitization
- **Rate Limiting**: Built-in protection against abuse

## 🐛 Troubleshooting

### Common Issues

1. **Avatar not loading**: Check GLB file path and WebGL support
2. **Microphone not working**: Ensure HTTPS and user permissions
3. **TTS not working**: Verify API keys in `.env.local`
4. **Performance issues**: Check browser hardware acceleration

### Debug Mode

Enable detailed logging:

```typescript
// In browser console
localStorage.setItem('debug', 'avatar:*');
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Email: support@avarynx.com
- Documentation: [Link to full docs]

## 🎖️ Acknowledgments

- **TalkingHead Module**: Original avatar technology
- **React Three Fiber**: 3D rendering framework
- **Next.js Team**: App Router and optimization features
- **Three.js Community**: WebGL and 3D graphics support

---

Built with ❤️ and cutting-edge technology by the Avarynx team.
