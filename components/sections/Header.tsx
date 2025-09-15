/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

type HeaderProps = {
  onLoginClickAction?: () => void;
};

export default function Header({ onLoginClickAction }: HeaderProps) {
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
                    <Link className="logo" href="/">
                      <img
                        src="/assets/images/logos/logoA.webp"
                        alt="Logo"
                        style={{ height: '60px' }}
                      />
                    </Link>
                  </div>
                  <div className="header-right-item d-none d-lg-inline-flex">
                    <div className="header-button">
                      <button type="button" onClick={onLoginClickAction} className="tj-primary-btn">
                        <div className="btn-inner">
                          <span className="btn-icon h-icon">
                            <i className="tji-arrow-right"></i>
                          </span>
                          <span className="btn-text">Login</span>
                          <span className="btn-icon">
                            <i className="tji-arrow-right"></i>
                          </span>
                        </div>
                      </button>
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
