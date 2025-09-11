/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect } from 'react';
import { connectToCorrectWebSocket } from '@/lib/websocket';

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
            expert: { area: 'health', voice: 'af_heart' },
            user_details: {
              name: 'Muaiad',
              gender: 'male',
              age: 25,
              country: 'Portugal',
              language_input: 'en-us',
              language_output: 'en-us',
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

  return (
    <>
      {/* Search Popup */}
      <div className="search_popup">
        <div className="search_close">
          <button type="button" className="search_close_btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 1L1 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 1L17 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="tj_search_wrapper">
                <div className="search_form">
                  <form action="#">
                    <div className="search_input">
                      <h4 className="title">Search Projects, Service or Blog.</h4>
                      <div className="search-box">
                        <input
                          className="search-input-field"
                          type="search"
                          placeholder="Search here..."
                          required
                        />
                        <button type="submit">
                          <i className="tji-search"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="search-popup-overlay"></div>

      {/* Hamburger Menu */}
      <div className="hamburger-area d-lg-none">
        <div className="hamburger_bg"></div>
        <div className="hamburger_wrapper">
          <div className="hamburger_inner">
            <div className="hamburger_top d-flex align-items-center justify-content-between">
              <div className="hamburger_logo">
                <a href="index.html" className="mobile_logo">
                  <img src="/assets/images/logos/logoA.webp" alt="Logo" />
                </a>
              </div>
              <div className="hamburger_close">
                <button className="hamburger_close_btn">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 1L1 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1 1L17 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hamburger_menu">
              <div className="mobile_menu"></div>
            </div>
            <div className="hamburger-infos">
              <h5 className="hamburger-title">Contact Info</h5>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="subtitle">Phone</span>
                  <a className="contact-link" href="tel:8089091313">
                    808-909-1313
                  </a>
                </div>
                <div className="contact-item">
                  <span className="subtitle">Email</span>
                  <a className="contact-link" href="mailto:info@Ainex.com">
                    info@ainex.com
                  </a>
                </div>
                <div className="contact-item">
                  <span className="subtitle">Location</span>
                  <span className="contact-link">993 Renner Burg, West Rond, MT 94251-030</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hamburger-socials">
            <h5 className="hamburger-title">Follow Us</h5>
            <div className="social-links style-2">
              <ul>
                <li>
                  <a href="https://www.facebook.com/" target="_blank">
                    <i className="tji-facebook"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/" target="_blank">
                    <i className="tji-linkedin"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/" target="_blank">
                    <i className="tji-instagram"></i>
                  </a>
                </li>
                <li>
                  <a href="https://x.com/" target="_blank">
                    <i className="tji-x-twitter"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header-area header-2">
        <div className="header-bottom">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="header-wrapper">
                  <div className="site_logo">
                    <a className="logo" href="index.html">
                      <img src="/assets/images/logos/logoA.webp" alt="Logo" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="primary" className="site-main">
        {/* Banner Section - Exactly as original */}
        <section className="tj-banner-section-2">
          <div className="banner-area">
            <div className="banner-left-box">
              <form
                id="contact-form"
                className="contact-form"
                style={{ backgroundColor: 'transparent' }}
              >
                <div
                  id="chat-transcript"
                  className="chat-transcript"
                  aria-live="polite"
                  aria-label="Chat transcript"
                ></div>
                <div className="col-sm-12">
                  <div
                    className="form-input message-input"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <textarea
                      name="cfMessage"
                      id="message"
                      rows={1}
                      aria-label="Message"
                      placeholder="Talk with me.."
                    ></textarea>
                    <button
                      className="tj-primary-btn submit-inside"
                      type="submit"
                      aria-label="Send message"
                    >
                      <span className="btn-inner">
                        <span className="btn-icon">
                          <i className="tji-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="banner-right-box">
              {/* Avatar Integration - Exactly as original */}
              <div className="avatar-container">
                <div id="avatar-display"></div>

                <div id="avatar-loading">
                  <div id="avatar-loading-back"></div>
                  <div id="avatar-loading-top"></div>
                  <div id="avatar-loading-value"></div>
                </div>
              </div>

              {/* Google Ad slot */}
              <div className="ad-slot">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="0000000000"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
                <noscript>
                  <div className="ad-placeholder">Google Ad (enable JavaScript to display)</div>
                </noscript>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Exactly as original */}
      <footer className="tj-footer-section footer-2 section-gap-x">
        <div className="footer-top-area">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-widget widget-subscribe-2">
                  <h2 className="title wow fadeInLeft" data-wow-delay=".3s">
                    Subscribe to Our Newsletter <img src="/assets/images/shape/bell.webp" alt="" />
                  </h2>
                  <div className="subscribe-form wow fadeInRight" data-wow-delay=".4s">
                    <form action="#">
                      <input type="email" name="email" placeholder="Enter email*" />
                      <button type="submit">
                        <i className="tji-plane"></i> Subscribe
                      </button>
                      <label htmlFor="agree">
                        <input id="agree" type="checkbox" />
                        Agree to our <a href="#">Terms & Condition?</a>
                      </label>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-main-area style-2">
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-xl-3 col-md-6">
                <div className="footer-widget footer-col-1">
                  <div className="footer-logo">
                    <a href="index.html">
                      <img src="/assets/images/logos/logoA.webp" alt="Logo" />
                    </a>
                  </div>
                  <div className="footer-text">
                    <p>
                      Understanding client needs, defining goals, and designing tailored AI crafting
                      solutions.
                    </p>
                  </div>
                  <div className="social-links style-2">
                    <ul>
                      <li>
                        <a href="https://www.facebook.com/" target="_blank">
                          <i className="tji-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkedin.com/" target="_blank">
                          <i className="tji-linkedin"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com/" target="_blank">
                          <i className="tji-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://x.com/" target="_blank">
                          <i className="tji-x-twitter"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-xxl-2 col-xl-3 col-md-6">
                <div className="footer-widget widget-nav-menu footer-col-2">
                  <h5 className="title">Quick Links</h5>
                  <ul>
                    <li>
                      <a href="index.html">Home</a>
                    </li>
                    <li>
                      <a href="about.html">About Us</a>
                    </li>
                    <li>
                      <a href="service.html">Services</a>
                    </li>
                    <li>
                      <a href="blog.html">Blog</a>
                    </li>
                    <li>
                      <a href="project.html">Portfolio</a>
                    </li>
                    <li>
                      <a href="contact.html">Contact Us</a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-xl-3 col-md-6">
                <div className="footer-widget widget-nav-menu footer-col-3">
                  <h5 className="title">Our Services</h5>
                  <ul>
                    <li>
                      <a href="service-details.html">AI-Powered Solutions</a>
                    </li>
                    <li>
                      <a href="service-details.html">Custom Technology</a>
                    </li>
                    <li>
                      <a href="service-details.html">Predictive Analytics</a>
                    </li>
                    <li>
                      <a href="service-details.html">Machine Learning</a>
                    </li>
                    <li>
                      <a href="service-details.html">Language Processing</a>
                    </li>
                    <li>
                      <a href="service-details.html">Computer Vision</a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-xl-3 col-md-6">
                <div className="footer-widget widget-contact foote-col-4">
                  <h5 className="title">Contact Info</h5>
                  <div className="footer-contact-info">
                    <div className="contact-item">
                      <span>993 Renner Burg, West Rond, MT 94251-030, USA.</span>
                    </div>
                    <div className="contact-item">
                      <a href="tel:10095447818">P: +1 (009) 544-7818</a>
                      <a href="mailto:support@ainex.com">E: support@ainex.com</a>
                    </div>
                    <div className="contact-item">
                      <span>
                        <i className="tji-clock"></i> Mon-Fri 10am-10pm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tj-copyright-area-2">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="copyright-content-area">
                  <div className="copyright-text">
                    <p>
                      &copy; 2025{' '}
                      <a
                        href="https://themeforest.net/user/theme-junction/portfolio"
                        target="_blank"
                      >
                        Ainex
                      </a>{' '}
                      All right reserved
                    </p>
                  </div>
                  <div className="copyright-menu">
                    <ul>
                      <li>
                        <a href="contact.html">Privacy Policy</a>
                      </li>
                      <li>
                        <a href="contact.html">Terms & Condition</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
