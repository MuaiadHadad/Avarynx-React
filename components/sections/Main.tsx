/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, type ChangeEvent } from 'react';

export default function Main() {
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [started, setStarted] = useState(false);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // aqui colocas a tua lógica de envio da mensagem...
    // sendMessage(inputValue);

    setStarted(true); // mostra transcript e esconde o título
    setInputValue(''); // opcional: limpar input
  }

  return (
    <main id="primary" className="site-main">
      {/* Banner Section */}
      <section className="tj-banner-section-2">
        <div className="banner-area">
          <div className="banner-left-box" style={{ padding: '12px' }}>
            <div
              id="chat-transcript"
              className={`chat-transcript ${started ? '' : 'is-hidden'}`}
              role="log"
              aria-live="polite"
              aria-label="Chat transcript"
              style={{ width: '100%', backgroundColor: 'transparent' }}
            />
            <div className="left-hero">
              {/* Título */}
              {/* Título — só visível antes do primeiro envio */}
              {!started && ( // NEW
                <h1 className="hero-title" aria-hidden={started}>
                  What’s on your mind today?
                </h1>
              )}
              {/* Barra de input */}
              <form
                id="contact-form"
                className="contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputValue.trim()) return;
                  setStarted(true);
                  // ... envia a mensagem
                }}
                style={{ backgroundColor: 'transparent' }}
              >
                <div className={`query-bar ${isInputActive ? 'active' : ''}`}>
                  {/* ícone “+” à esquerda */}
                  <button type="button" className="pill-icon" aria-label="Add">
                    <span className="icon-plus">＋</span>
                  </button>

                  {/* input */}
                  <input
                    id="message"
                    type="text"
                    aria-label="Ask anything"
                    placeholder="Ask anything"
                    value={inputValue}
                    onFocus={() => setIsInputActive(true)}
                    onBlur={() => inputValue.length === 0 && setIsInputActive(false)}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="query-input"
                    style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
                  />

                  {/* mic */}
                  <button type="button" className="pill-icon" aria-label="Voice">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M5 10v1a7 7 0 0 0 14 0v-1M12 21v-3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* enviar (seta) — só aparece quando há texto */}
                  {inputValue && (
                    <button className="pill-icon submit" type="submit" aria-label="Send">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="banner-shape">
              <img src="/assets/images/shape/pattern-bg.svg" alt="" />
            </div>
          </div>

          <div className="banner-right-box">
            {/* Avatar Integration */}
            <div className="avatar-container">
              <div id="avatar-display"></div>

              <div id="avatar-loading">
                <div id="avatar-loading-back"></div>
                <div id="avatar-loading-top"></div>
                <div id="avatar-loading-value"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
