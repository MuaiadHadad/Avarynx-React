/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, type ChangeEvent } from 'react';

export default function Main() {
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputFocus = () => {
    setIsInputActive(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setIsInputActive(true);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.length === 0) {
      setIsInputActive(false);
    }
  };

  return (
    <main id="primary" className="site-main">
      {/* Banner Section */}
      <section className="tj-banner-section-2">
        <div className="banner-area">
          {/*<div className="banner-left-box" style={{ padding: '12px' }}>*/}
          {/*  <form*/}
          {/*    id="contact-form"*/}
          {/*    className="contact-form"*/}
          {/*    style={{ backgroundColor: 'transparent' }}*/}
          {/*    onSubmit={(e) => e.preventDefault()}*/}
          {/*  >*/}
          {/*    <div*/}
          {/*      id="chat-transcript"*/}
          {/*      className="chat-transcript"*/}
          {/*      aria-live="polite"*/}
          {/*      aria-label="Chat transcript"*/}
          {/*    ></div>*/}
          {/*    <div className="col-sm-12">*/}
          {/*      <div*/}
          {/*        className="form-input message-input"*/}
          {/*        style={{*/}
          {/*          backgroundColor: isInputActive ? 'transparent' : '#f9f9f9',*/}
          {/*          borderRadius: '25px',*/}
          {/*          border: isInputActive ? '2px solid #ccc' : '1px solid #e0e0e0',*/}
          {/*          transition: 'all 0.3s ease',*/}
          {/*          boxShadow: isInputActive*/}
          {/*            ? '0 2px 8px rgba(0,0,0,0.1)'*/}
          {/*            : '0 1px 3px rgba(0,0,0,0.05)',*/}
          {/*          position: 'relative',*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        {!isInputActive && inputValue.length === 0 && (*/}
          {/*          <div*/}
          {/*            style={{*/}
          {/*              position: 'absolute',*/}
          {/*              top: '50%',*/}
          {/*              left: '20px',*/}
          {/*              transform: 'translateY(-50%)',*/}
          {/*              color: '#666',*/}
          {/*              fontSize: '14px',*/}
          {/*              pointerEvents: 'none',*/}
          {/*              zIndex: 1,*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            Olá! Como posso ajudar hoje?*/}
          {/*          </div>*/}
          {/*        )}*/}
          {/*        <textarea*/}
          {/*          name="cfMessage"*/}
          {/*          id="message"*/}
          {/*          rows={1}*/}
          {/*          aria-label="Message"*/}
          {/*          placeholder={isInputActive ? 'Talk with me..' : ''}*/}
          {/*          value={inputValue}*/}
          {/*          onChange={handleInputChange}*/}
          {/*          onFocus={handleInputFocus}*/}
          {/*          onBlur={handleInputBlur}*/}
          {/*          style={{*/}
          {/*            borderRadius: '25px',*/}
          {/*            border: 'none',*/}
          {/*            outline: 'none',*/}
          {/*            padding: '2px 60px 15px 20px',*/}
          {/*            backgroundColor: 'transparent',*/}
          {/*            position: 'relative',*/}
          {/*            zIndex: 2,*/}
          {/*            resize: 'none',*/}
          {/*          }}*/}
          {/*        ></textarea>*/}
          {/*        <button*/}
          {/*          className="tj-primary-btn submit-inside"*/}
          {/*          type="submit"*/}
          {/*          aria-label="Send message"*/}
          {/*          style={{*/}
          {/*            backgroundColor: 'transparent',*/}
          {/*            borderRadius: '100%',*/}
          {/*            transition: 'none',*/}
          {/*            animation: 'none',*/}
          {/*            opacity: isInputActive && inputValue.length > 0 ? 1 : 0.5,*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          <i className="tji-plane"></i>*/}
          {/*        </button>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </form>*/}
          {/*  <div className="banner-shape">*/}
          {/*    <img src="/assets/images/shape/pattern-bg.svg" alt="" />*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="banner-left-box" style={{ padding: '12px' }}>
            <div className="left-hero">
              <div
                id="chat-transcript"
                className="chat-transcript"
                role="log"
                aria-live="polite"
                aria-label="Chat transcript"
              />
              {/* Título */}
              <h1 className="hero-title">What’s on your mind today?</h1>
              {/* Barra de input */}
              <form
                id="contact-form"
                className="contact-form"
                onSubmit={(e) => e.preventDefault()}
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

            {/*/!* Google Ad slot *!/*/}
            {/*<div className="ad-slot">*/}
            {/*  <ins*/}
            {/*    className="adsbygoogle"*/}
            {/*    style={{ display: 'block' }}*/}
            {/*    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"*/}
            {/*    data-ad-slot="0000000000"*/}
            {/*    data-ad-format="auto"*/}
            {/*    data-full-width-responsive="true"*/}
            {/*  ></ins>*/}
            {/*  <noscript>*/}
            {/*    <div className="ad-placeholder">Google Ad (enable JavaScript to display)</div>*/}
            {/*  </noscript>*/}
            {/*</div>*/}
          </div>
        </div>
      </section>
    </main>
  );
}
