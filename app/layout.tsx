import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avarynx AI',
  description:
    'Understanding client needs, defining goals, and designing tailored AI crafting solutions.',
  icons: {
    icon: '/assets/images/fav.png',
    shortcut: '/assets/images/fav.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  <title>Avarynx AI</title>;
  return (
    <html lang="en" className="no-js">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />

        {/* Original CSS Dependencies */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.min.css" />
        <link rel="stylesheet" href="/assets/css/ainex-icons.css" />
        <link rel="stylesheet" href="/assets/css/nice-select.css" />
        <link rel="stylesheet" href="/assets/css/swiper.min.css" />
        <link rel="stylesheet" href="/assets/css/venobox.min.css" />
        <link rel="stylesheet" href="/assets/css/meanmenu.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/custom-overrides.css" />

        {/* Three.js Dependencies */}
        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script
          async
          src="https://cdn.jsdelivr.net/npm/es-module-shims@1.7.1/dist/es-module-shims.js"
        ></script>
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const importMap = {
                "imports": {
                  "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js/+esm",
                  "three/examples/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/",
                  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
                  "dompurify": "https://cdn.jsdelivr.net/npm/dompurify@3.1.7/+esm",
                  "marked": "https://cdn.jsdelivr.net/npm/marked@14.1.3/+esm"
                }
              };
              const script = document.createElement('script');
              script.type = 'importmap';
              script.textContent = JSON.stringify(importMap);
              document.head.appendChild(script);
            });
          `,
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js"></script>
      </head>
      <body suppressHydrationWarning={true}>
        <div className="body-overlay"></div>

        {/* Preloader */}
        <div className="preloader">
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon">
              <img src="/assets/images/logos/logo-icon.webp" alt="Loading" />
            </div>
          </div>
        </div>

        {/* Back to top */}
        <div className="back-to-top-wrapper">
          <button id="back_to_top" type="button" className="back-to-top-btn">
            <span>
              <i className="tji-rocket"></i>
            </span>
          </button>
        </div>

        {children}

        {/* Original JS Dependencies */}
        <script src="/assets/js/jquery.min.js"></script>
        <script src="/assets/js/bootstrap.bundle.min.js"></script>
        <script src="/assets/js/gsap.min.js"></script>
        <script src="/assets/js/gsap-scroll-to-plugin.min.js"></script>
        <script src="/assets/js/gsap-scroll-trigger.min.js"></script>
        <script src="/assets/js/gsap-split-text.min.js"></script>
        <script src="/assets/js/smooth-scroll.min.js"></script>
        <script src="/assets/js/jquery.nice-select.min.js"></script>
        <script src="/assets/js/swiper.min.js"></script>
        <script src="/assets/js/waypoints.min.js"></script>
        <script src="/assets/js/counterup.min.js"></script>
        <script src="/assets/js/venobox.min.js"></script>
        <script src="/assets/js/appear.min.js"></script>
        <script src="/assets/js/wow.min.js"></script>
        <script src="/assets/js/meanmenu.js"></script>
        <script src="/assets/js/main.js"></script>
      </body>
    </html>
  );
}
