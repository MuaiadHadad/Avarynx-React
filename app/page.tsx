/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { connectToCorrectWebSocket } from '@/lib/websocket';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Main from '@/components/sections/Main';
import LoginModal from '@/components/auth/LoginModal';

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

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('TalkingHead module loading timeout'));
          }, 10000);

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

        // Initialize variables exactly as in original
        let talkingHead: TalkingHeadLike | null = null;
        const currentMood = 'neutral';
        let avatarInitialized = false;

        const llmTextByRequestId: Record<string, string> = Object.create(null);
        const messageHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

        let socket: WebSocket | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

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

                if (obj && !('step' in obj)) {
                  const text =
                    obj && typeof (obj as any).text === 'string' ? (obj as any).text : '';
                  const audio = obj ? (obj as any).audio : undefined;
                  if (text) {
                    await addChatMessage('assistant', text);
                    messageHistory.push({ role: 'assistant', content: text });
                  }
                  if (audio && talkingHead && avatarInitialized) {
                    try {
                      if (talkingHead.audioCtx && talkingHead.audioCtx.state === 'suspended') {
                        try {
                          await talkingHead.audioCtx.resume();
                        } catch (e) {
                          console.warn('AudioContext resume failed', e);
                        }
                      }
                      const bstr = atob(audio as string);
                      const bytes = new Uint8Array(bstr.length);
                      for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
                      const audioBuffer = await talkingHead.audioCtx!.decodeAudioData(bytes.buffer);
                      setTranscriptVisible(true);
                      talkingHead.speakAudio?.({ audio: audioBuffer });
                    } catch (e) {
                      console.error('Error processing audio:', e);
                    }
                  }
                  return;
                }

                const step = (obj as any)?.step;
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
                          } catch (e) {
                            console.warn('AudioContext resume failed', e);
                          }
                        }
                        const bstr = atob(audio as string);
                        const bytes = new Uint8Array(bstr.length);
                        for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
                        const audioBuffer = await talkingHead.audioCtx!.decodeAudioData(
                          bytes.buffer,
                        );

                        const llmText = requestId ? llmTextByRequestId[requestId] : undefined;
                        if (requestId) delete llmTextByRequestId[requestId];

                        const totalMs = Math.max(200, Math.round(audioBuffer.duration * 1000));
                        const words = (llmText || '').trim().split(/\s+/).filter(Boolean);
                        if (words.length) {
                          const gaps = Math.max(0, words.length - 1);
                          const GAP_MS = 60;
                          const available = Math.max(100, totalMs - gaps * GAP_MS);
                          const weights = words.map((w) =>
                            Math.max(1, w.replace(/[^\p{L}\p{N}]/gu, '').length),
                          );
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
                          setTranscriptVisible(true);
                          talkingHead.speakAudio?.({
                            audio: audioBuffer,
                            words,
                            wtimes,
                            wdurations,
                          });
                          setTimeout(() => setTranscriptVisible(false), totalMs + 300);
                        } else {
                          setTranscriptVisible(true);
                          talkingHead.speakAudio?.({ audio: audioBuffer });
                          setTimeout(() => setTranscriptVisible(false), totalMs + 300);
                        }
                        const el = document.getElementById('avatar-loading-value');
                        if (el) el.textContent = 'Ready';
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

            talkingHead = new (window as any).TalkingHead(avatarDisplay, {
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

            await talkingHead.showAvatar?.({
              url: '/avatars/brunette.glb',
              body: 'F',
              avatarMood: currentMood,
              lipsyncLang: 'en',
            });

            try {
              const r =
                talkingHead?.renderer ||
                talkingHead?.three?.renderer ||
                (window as any).avatarRenderer;
              (r as any)?.setClearColor?.(0x000000, 0);
              (r as any)?.setClearAlpha?.(0);
            } catch (e) {
              console.debug('clear alpha warn:', e);
            }

            const cvs = avatarDisplay.querySelector('canvas') as HTMLCanvasElement | null;
            if (cvs) {
              cvs.style.background = 'transparent';
            }

            if (avatarVideo) {
              avatarVideo.style.display = 'none';
            }

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
                if (
                  talkingHead &&
                  talkingHead.audioCtx &&
                  talkingHead.audioCtx.state === 'suspended'
                )
                  await talkingHead.audioCtx.resume();
              } catch {}

              const lv = document.getElementById('avatar-loading-value') as HTMLElement | null;
              if (lv) lv.textContent = 'Processing with AI...';
              sendMessageToServer(msg);
            });

            textarea.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof form.requestSubmit === 'function') {
                  form.requestSubmit();
                } else {
                  form.submit();
                }
              }
            });
          }
        }

        function sendMessageToServer(message: string) {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            alert(
              'Not connected to server. Please check if the Python server is running on 192.168.1.99:7200',
            );
            return;
          }

          const requestData = {
            request_id: Date.now().toString(),
            expert: { area: 'health', voice: 'alloy' },
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

        setupUI();
        initSocketConnection();
        setTimeout(initAvatar, 2000);
        (window as any).avatarSample = {
          greet: () => speakText("Hello! I'm your AI avatar assistant. How can I help you today?"),
          demo: () =>
            speakText(
              'This is a demonstration of the AI avatar technology integrated into the website.',
            ),
          goodbye: () => speakText('Thank you for trying out the AI avatar. Have a great day!'),
        };
        (window as any).talkingHead = () => talkingHead;
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
    // TODO: replace with real auth/register API call.
    console.log('Auth submit', payload);
    setLoginOpen(false);
  };

  const handleProvider = (provider: 'google' | 'microsoft' | 'linkedin') => {
    // TODO: start OAuth flow for the provider
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
      />
    </>
  );
}
