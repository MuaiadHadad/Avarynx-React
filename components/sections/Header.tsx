/* eslint-disable @next/next/no-img-element */
'use client';

export default function Header() {
  return (
    <>
      {/* Header */}
      <header className="header-area header-2" style={{ padding: '4px 0' }}>
        <div className="header-bottom">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="header-wrapper" style={{ padding: '5px 0' }}>
                  <div className="site_logo">
                    <a className="logo" href="index.html">
                      <img
                        src="/assets/images/logos/logoA.webp"
                        alt="Logo"
                        style={{ height: '60px' }}
                      />
                    </a>
                  </div>
                  <div className="header-right-item d-none d-lg-inline-flex">
                    <div className="header-button">
                      <a className="tj-primary-btn" href="contact.html">
                        <div className="btn-inner" >
                          <span className="btn-icon h-icon">
                            <i className="tji-arrow-right"></i>
                          </span>
                          <span className="btn-text">Login</span>
                          <span className="btn-icon">
                            <i className="tji-arrow-right"></i>
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
