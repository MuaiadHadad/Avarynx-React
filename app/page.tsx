/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { connectToCorrectWebSocket } from '@/lib/websocket';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Main from '@/components/sections/Main';
import LoginModal from '@/components/auth/LoginModal';

declare global {
  interface Window {
    THREE?: any;
    TalkingHead?: any;
    avatarRenderer?: any;
    talkingHead?: () => TalkingHeadLike | null;
    avatarSample?: {
      greet: () => void;
      demo: () => void;
      goodbye: () => void;
    };
  }
  // Eventos custom do loader do TalkingHead
  interface WindowEventMap {
    'talkinghead-loaded': Event;
    'talkinghead-error': Event;
  }
}

type TalkingHeadLike = {
  audioCtx?: AudioContext & { state: 'running' | 'suspended'; resume: () => Promise<void> };
  speakAudio?: (args: {
    audio: AudioBuffer;
    words?: string[];
    wtimes?: number[];
    wdurations?: number[];
  }) => void;
  speakText?: (
    text: string,
    opts: { onStart?: () => void; onFinished?: () => void },
  ) => Promise<void>;
  showAvatar?: (opts: {
    url: string;
    body?: string;
    avatarMood?: string;
    lipsyncLang?: string;
  }) => Promise<void>;
  renderer?: {
    setClearColor?: (hex: number, alpha?: number) => void;
    setClearAlpha?: (alpha: number) => void;
  };
  three?: {
    renderer?: {
      setClearColor?: (hex: number, alpha?: number) => void;
      setClearAlpha?: (alpha: number) => void;
    };
  };
};

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        // Espera por THREE/importmap
        await new Promise((resolve) => {
          if (window.THREE || document.querySelector('script[type="importmap"]')) {
            resolve(true);
          } else {
            const checkReady = () => {
              if (window.THREE || document.querySelector('script[type="importmap"]')) {
                resolve(true);
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          }
        });

        // Carrega TalkingHead como módulo
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          (async () => {
            try {
              const { TalkingHead } = await import('/modules/talkinghead.mjs');
              window.TalkingHead = TalkingHead;
              window.dispatchEvent(new Event('talkinghead-loaded'));
            } catch (error) {
              window.dispatchEvent(new Event('talkinghead-error'));
            }
          })();
        `;
        document.head.appendChild(script);

        // Aguarda sucesso/falha
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error('TalkingHead module loading timeout')),
            10000,
          );

          window.addEventListener(
            'talkinghead-loaded',
            () => {
              clearTimeout(timeout);
              resolve(true);
            },
            { once: true },
          );

          window.addEventListener(
            'talkinghead-error',
            () => {
              clearTimeout(timeout);
              reject(new Error('TalkingHead module failed to load'));
            },
            { once: true },
          );
        });

        // ------- Estado & buffers -------
        let talkingHead: TalkingHeadLike | null = null;
        const currentMood = 'neutral';
        let avatarInitialized = false;

        const llmTextByRequestId: Record<string, string> = Object.create(null);
        const messageHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

        let socket: WebSocket | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        // ------- Helpers -------
        async function addChatMessage(role: 'user' | 'assistant', content: string) {
          try {
            const transcript = document.getElementById('chat-transcript');
            if (!transcript) return;

            const div = document.createElement('div');
            div.className = `chat-msg ${role}`;

            if (role === 'assistant') {
              try {
                const { marked } = await import('marked');
                const { default: DOMPurify } = await import('dompurify');
                marked.setOptions({ breaks: true, gfm: true } as any);
                const htmlContent = (await marked.parse(String(content ?? '').trim())) as string;
                const sanitizedHtml = DOMPurify.sanitize(htmlContent);
                div.innerHTML = sanitizedHtml;
              } catch {
                div.textContent = String(content ?? '').trim();
              }
            } else {
              div.textContent = String(content ?? '').trim();
            }

            transcript.appendChild(div);
            (transcript as HTMLElement).scrollTop = (transcript as HTMLElement).scrollHeight;
          } catch (e) {
            console.warn('addChatMessage failed', e);
          }
        }

        function setTranscriptVisible(visible: boolean) {
          const el = document.getElementById('chat-transcript') as HTMLElement | null;
          if (!el) return;
          el.style.display = visible ? 'flex' : 'none';
        }

        async function decodeBase64ToAudioBuffer(b64: string): Promise<AudioBuffer> {
          if (!talkingHead?.audioCtx) throw new Error('No AudioContext');
          const bstr = atob(b64);
          const bytes = new Uint8Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
          return await talkingHead.audioCtx.decodeAudioData(bytes.buffer);
        }

        function buildWordTimingsFromText(text: string, totalMs: number) {
          const words = (text || '').trim().split(/\s+/).filter(Boolean);
          if (!words.length) return { words: [], wtimes: [], wdurations: [] as number[] };

          const gaps = Math.max(0, words.length - 1);
          const GAP_MS = 60;
          const available = Math.max(100, totalMs - gaps * GAP_MS);
          const weights = words.map((w) => Math.max(1, w.replace(/[^\p{L}\p{N}]/gu, '').length));
          const sum = weights.reduce((a, b) => a + b, 0) || 1;
          const unit = available / sum;

          const wdurations = weights.map((w) => Math.max(80, Math.round(w * unit)));
          const durSum = wdurations.reduce((a, b) => a + b, 0) + gaps * GAP_MS;
          if (durSum > totalMs) {
            const scale = (totalMs - gaps * GAP_MS) / (durSum - gaps * GAP_MS);
            for (let i = 0; i < wdurations.length; i++)
              wdurations[i] = Math.max(60, Math.round(wdurations[i] * scale));
          }

          const wtimes: number[] = [];
          let t = 0;
          for (let i = 0; i < words.length; i++) {
            wtimes.push(t);
            t += wdurations[i];
            if (i < words.length - 1) t += GAP_MS;
          }
          return { words, wtimes, wdurations };
        }

        // ------- WebSocket -------
        async function initSocketConnection() {
          try {
            socket = await connectToCorrectWebSocket();

            socket.addEventListener('open', () => {
              reconnectAttempts = 0;
              const el = document.getElementById('avatar-loading-value');
              if (el) el.textContent = 'Connected to AI server';
            });

            socket.addEventListener('close', () => {
              const el = document.getElementById('avatar-loading-value');
              if (el) el.textContent = 'Disconnected from server';
              if (reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
                reconnectAttempts++;
                setTimeout(() => initSocketConnection(), delay);
              }
            });

            socket.addEventListener('error', (error) => {
              console.error('WebSocket error:', error);
              const el = document.getElementById('avatar-loading-value');
              if (el) el.textContent = 'Connection error';
            });

            socket.addEventListener('message', async (event) => {
              // Lida com string ou binário inesperado
              let data: unknown = null;
              try {
                data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              } catch {
                if (event.data) {
                  await addChatMessage('assistant', String(event.data));
                  messageHistory.push({ role: 'assistant', content: String(event.data) });
                }
                return;
              }

              try {
                const obj =
                  data && typeof data === 'object' ? (data as Record<string, unknown>) : null;

                // Mensagem “livre” sem step — mantém compat
                if (obj && !('step' in obj)) {
                  const text = typeof (obj as any).text === 'string' ? (obj as any).text : '';
                  const audio = (obj as any).audio;
                  if (text) {
                    await addChatMessage('assistant', text);
                    messageHistory.push({ role: 'assistant', content: text });
                  }
                  if (audio && talkingHead && avatarInitialized) {
                    try {
                      if (talkingHead.audioCtx && talkingHead.audioCtx.state === 'suspended') {
                        try {
                          await talkingHead.audioCtx.resume();
                        } catch {}
                      }
                      const audioBuffer = await decodeBase64ToAudioBuffer(String(audio));
                      setTranscriptVisible(true);
                      talkingHead.speakAudio?.({ audio: audioBuffer });
                    } catch (e) {
                      console.error('Error processing audio:', e);
                    }
                  }
                  return;
                }

                const step = (obj as any)?.step as string | undefined;
                const response = (obj as any)?.response;
                const audio = (obj as any)?.audio;
                const requestId = (obj as any)?.request_id as string | undefined;

                switch (step) {
                  case 'error': {
                    await addChatMessage('assistant', `Error: ${response}`);
                    const el = document.getElementById('avatar-loading-value');
                    if (el) el.textContent = 'Error: ' + response;
                    break;
                  }
                  case 'stt': {
                    const el = document.getElementById('avatar-loading-value');
                    if (el) el.textContent = 'Speech recognized';
                    break;
                  }

                  // NOVO: servidor envia ambos de uma vez
                  case 'llm/tts': {
                    const text = typeof response === 'string' ? response : response?.text || '';
                    if (requestId && typeof text === 'string') llmTextByRequestId[requestId] = text;

                    if (text) {
                      await addChatMessage('assistant', text);
                      messageHistory.push({ role: 'assistant', content: text });
                    }

                    if (audio && talkingHead && avatarInitialized) {
                      try {
                        if (talkingHead.audioCtx && talkingHead.audioCtx.state === 'suspended') {
                          try {
                            await talkingHead.audioCtx.resume();
                          } catch {}
                        }
                        const audioBuffer = await decodeBase64ToAudioBuffer(String(audio));
                        const totalMs = Math.max(200, Math.round(audioBuffer.duration * 1000));

                        // Usa o texto recebido (por requestId ou o próprio text)
                        const llmText = (requestId && llmTextByRequestId[requestId]) || text || '';

                        // Limpa cache por requestId
                        if (requestId) delete llmTextByRequestId[requestId];

                        const { words, wtimes, wdurations } = buildWordTimingsFromText(
                          llmText,
                          totalMs,
                        );

                        setTranscriptVisible(true);
                        if (words.length) {
                          talkingHead.speakAudio?.({
                            audio: audioBuffer,
                            words,
                            wtimes,
                            wdurations,
                          });
                        } else {
                          talkingHead.speakAudio?.({ audio: audioBuffer });
                        }

                        const el = document.getElementById('avatar-loading-value');
                        if (el) el.textContent = 'Ready';
                        setTimeout(() => setTranscriptVisible(false), totalMs + 300);
                      } catch (e) {
                        console.error('Error processing llm/tts audio:', e);
                        const el = document.getElementById('avatar-loading-value');
                        if (el) el.textContent = 'Error processing audio';
                      }
                    }
                    break;
                  }

                  // Mantém compat com servidores antigos que enviem em 2 passos
                  case 'llm': {
                    const text = typeof response === 'string' ? response : response?.text || '';
                    const el = document.getElementById('avatar-loading-value');
                    if (el) el.textContent = 'AI processing complete...';
                    if (requestId && typeof text === 'string') llmTextByRequestId[requestId] = text;
                    if (text) {
                      await addChatMessage('assistant', text);
                      messageHistory.push({ role: 'assistant', content: text });
                    }
                    break;
                  }
                  case 'tts': {
                    if (audio && talkingHead && avatarInitialized) {
                      try {
                        if (talkingHead.audioCtx && talkingHead.audioCtx.state === 'suspended') {
                          try {
                            await talkingHead.audioCtx.resume();
                          } catch {}
                        }
                        const audioBuffer = await decodeBase64ToAudioBuffer(String(audio));

                        const llmText = requestId ? llmTextByRequestId[requestId] : undefined;
                        if (requestId) delete llmTextByRequestId[requestId];

                        const totalMs = Math.max(200, Math.round(audioBuffer.duration * 1000));
                        const { words, wtimes, wdurations } = llmText
                          ? buildWordTimingsFromText(llmText, totalMs)
                          : { words: [], wtimes: [], wdurations: [] as number[] };

                        setTranscriptVisible(true);
                        if (words.length) {
                          talkingHead.speakAudio?.({
                            audio: audioBuffer,
                            words,
                            wtimes,
                            wdurations,
                          });
                        } else {
                          talkingHead.speakAudio?.({ audio: audioBuffer });
                        }

                        const el = document.getElementById('avatar-loading-value');
                        if (el) el.textContent = 'Ready';
                        setTimeout(() => setTranscriptVisible(false), totalMs + 300);
                      } catch (e) {
                        console.error('Error processing TTS audio:', e);
                        const el = document.getElementById('avatar-loading-value');
                        if (el) el.textContent = 'Error processing audio';
                      }
                    }
                    break;
                  }

                  default: {
                    if ((obj as any)?.text) {
                      await addChatMessage('assistant', (obj as any).text);
                      messageHistory.push({ role: 'assistant', content: (obj as any).text });
                    }
                    break;
                  }
                }
              } catch (e) {
                console.error('Error handling message:', e);
              }
            });
          } catch (error) {
            console.error('Error connecting to server:', error);
            addChatMessage('assistant', 'Connection failed');
            const el = document.getElementById('avatar-loading-value');
            if (el) el.textContent = 'Connection failed';
          }
        }

        // ------- Avatar -------
        async function initAvatar() {
          try {
            const avatarDisplay = document.getElementById('avatar-display') as HTMLElement | null;
            const avatarVideo = document.getElementById('avatar-video') as HTMLElement | null;
            const loadingValue = document.getElementById(
              'avatar-loading-value',
            ) as HTMLElement | null;

            if (!avatarDisplay) {
              console.error('Avatar display element not found');
              return;
            }

            if (loadingValue) loadingValue.textContent = 'Loading avatar...';

            if (!window.TalkingHead) {
              console.error('TalkingHead module not loaded');
              if (loadingValue) loadingValue.textContent = 'Avatar module not loaded';
              return;
            }

            const talkingHeadInstance = new window.TalkingHead(avatarDisplay, {
              ttsEndpoint: 'https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=',
              lipsyncModules: ['en'],
              cameraView: 'head',
              modelPixelRatio: window.devicePixelRatio || 1,
              modelFPS: 60,
              cameraRotateEnable: false,
              cameraPanEnable: false,
              audioContext: null,
              useStrictAudioContext: false,
            }) as TalkingHeadLike;
            talkingHead = talkingHeadInstance;

            await talkingHead.showAvatar?.({
              url: '/avatars/brunette.glb',
              body: 'F',
              avatarMood: currentMood,
              lipsyncLang: 'en',
            });

            try {
              const r =
                talkingHead?.renderer || talkingHead?.three?.renderer || window.avatarRenderer;
              (r as any)?.setClearColor?.(0x000000, 0);
              (r as any)?.setClearAlpha?.(0);
            } catch (e) {
              console.debug('clear alpha warn:', e);
            }

            const cvs = avatarDisplay.querySelector('canvas') as HTMLCanvasElement | null;
            if (cvs) cvs.style.background = 'transparent';
            if (avatarVideo) avatarVideo.style.display = 'none';

            if (loadingValue)
              loadingValue.textContent = 'Avatar ready! Click controls to interact.';
            avatarInitialized = true;

            setTimeout(() => {
              const bar = document.getElementById('avatar-loading') as HTMLElement | null;
              if (bar) bar.style.display = 'none';
            }, 2000);
          } catch (error) {
            console.error('Error initializing avatar:', error);
            const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
            if (lv) {
              lv.textContent = 'Error loading avatar';
              lv.style.color = 'red';
            }
          }
        }

        async function speakText(text: string) {
          if (!talkingHead || !avatarInitialized) return;
          try {
            if (talkingHead.audioCtx && talkingHead.audioCtx.state === 'suspended') {
              await talkingHead.audioCtx.resume();
            }
            await talkingHead.speakText?.(text, {
              onStart: () => {
                const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
                if (lv) lv.textContent = 'Speaking...';
              },
              onFinished: () => {
                const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
                if (lv) lv.textContent = 'Ready for next message...';
              },
            });
          } catch (error) {
            console.error('Speech error:', error);
            const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
            if (lv) lv.textContent = 'Speech error occurred';
          }
        }

        function setupUI() {
          const form = document.getElementById('contact-form') as HTMLFormElement | null;
          const textarea = document.getElementById('message') as HTMLTextAreaElement | null;
          if (form && textarea) {
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              const msg = textarea.value.trim();
              if (!msg) return;

              addChatMessage('user', msg);
              messageHistory.push({ role: 'user', content: msg });
              textarea.value = '';

              try {
                if (talkingHead?.audioCtx?.state === 'suspended') {
                  await talkingHead.audioCtx.resume();
                }
              } catch {}

              const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
              if (lv) lv.textContent = 'Processing with AI...';
              sendMessageToServer(msg);
            });

            textarea.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else form.submit();
              }
            });
          }
        }

        function sendMessageToServer(message: string) {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            alert('Not connected to server. Please check if the server is running.');
            return;
          }

          const requestData = {
            request_id: Date.now().toString(),
            expert: { area: 'job', voice: 'alloy' },
            user_details: {
              name: 'Muaiad',
              gender: 'male',
              age: 25,
              country: 'Portugal',
              language_input: 'pt-pt',
              language_output: 'pt-pt',
            },
            message_history: messageHistory.slice(-20),
            text: message,
            audio_bytes: null,
          };

          try {
            socket.send(JSON.stringify(requestData));
          } catch (e) {
            console.error('Failed to send message:', e);
          }
        }

        // Boot
        setupUI();
        initSocketConnection();
        setTimeout(initAvatar, 2000);

        // Helpers de debug no window
        window.avatarSample = {
          greet: () => speakText("Hello! I'm your AI avatar assistant. How can I help you today?"),
          demo: () =>
            speakText(
              'This is a demonstration of the AI avatar technology integrated into the website.',
            ),
          goodbye: () => speakText('Thank you for trying out the AI avatar. Have a great day!'),
        };
        window.talkingHead = () => talkingHead;
      } catch (error) {
        console.error('Failed to initialize avatar:', error);
      }
    };

    initializeAvatar();
  }, []);

  const handleAuthSubmit = async (payload: {
    mode: 'login' | 'register';
    email: string;
    password: string;
    username?: string;
  }) => {
    // TODO: trocar por API real
    console.log('Auth submit', payload);
    setLoginOpen(false);
  };

  const handleProvider = (provider: 'google' | 'microsoft' | 'linkedin') => {
    // TODO: iniciar fluxo OAuth
    console.log('Auth provider', provider);
    setLoginOpen(false);
  };

  return (
    <>
      <Header onLoginClickAction={() => setLoginOpen(true)} />
      <Main />
      <Footer />
      <LoginModal
        open={loginOpen}
        onCloseAction={() => setLoginOpen(false)}
        onSubmitAction={handleAuthSubmit}
        onProviderAction={handleProvider}
      />
    </>
  );
}
