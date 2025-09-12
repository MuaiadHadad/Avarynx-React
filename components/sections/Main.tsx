/* eslint-disable @next/next/no-img-element */
'use client';

export default function Main() {
  return (
    <main id="primary" className="site-main">
      {/* Banner Section */}
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
            {/* Avatar Integration */}
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
  );
}
