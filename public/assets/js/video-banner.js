/**
 * Video Banner Overlay System
 * Shows a video advertisement after 5 user interactions
 * Automatically closes when video ends
 */

class VideoBannerSystem {
  constructor() {
    this.interactionCount = 0;
    this.maxInteractions = 5;
    this.hasShownBanner = false;
    this.isVideoPlaying = false;

    this.init();
  }

  init() {
    // Create the banner overlay HTML structure
    this.createBannerHTML();

    // Track user interactions
    this.trackInteractions();

    // Setup video event listeners
    this.setupVideoEventListeners();

    console.log('Video Banner System initialized');
  }

  createBannerHTML() {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'video-banner-overlay';
    overlay.innerHTML = `
            <div class="banner-video-area">
                <div class="banner-video wow fadeInDown" data-wow-delay=".2s">
                    <video id="banner-video" loop muted autoplay playsinline poster="assets/images/hero/hero-video-thumb-2.webp">
                        <source src="assets/video/hero.mp4" type="video/mp4">
                    </video>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);
    console.log('Video banner HTML structure created');
  }

  trackInteractions() {
    // Track clicks on interactive elements
    const interactiveSelectors = [
      '.command',
      'input[type="text"]',
      'input[type="range"]',
      'textarea',
      '.emoji',
      'button',
      '.screen',
      '[data-item]',
      '[data-show]',
      '[data-theme-lang]',
      '[data-avatar-name]',
      '[data-voice-type]',
      '#playtest',
      '#record',
      '.message',
    ];

    // Add click listeners for all interactive elements
    document.addEventListener('click', (e) => {
      if (this.hasShownBanner) return;

      // Check if clicked element matches any interactive selector
      const isInteractive = interactiveSelectors.some((selector) => {
        return e.target.matches(selector) || e.target.closest(selector);
      });

      if (isInteractive) {
        this.incrementInteraction();
      }
    });

    // Track form submissions and key presses in input fields
    document.addEventListener('keydown', (e) => {
      if (this.hasShownBanner) return;

      if (e.key === 'Enter' && (e.target.matches('input') || e.target.matches('textarea'))) {
        this.incrementInteraction();
      }
    });

    // Track when user sends messages (specific to talking head app)
    document.addEventListener('keydown', (e) => {
      if (this.hasShownBanner) return;

      if (e.keyCode === 13 && !e.shiftKey && e.target.id === 'input') {
        this.incrementInteraction();
      }
    });

    console.log('Interaction tracking enabled');
  }

  incrementInteraction() {
    if (this.hasShownBanner) return;

    this.interactionCount++;
    console.log(`User interaction ${this.interactionCount}/${this.maxInteractions}`);

    // Show visual feedback (optional)
    this.showInteractionFeedback();

    if (this.interactionCount >= this.maxInteractions) {
      setTimeout(() => {
        this.showBanner();
      }, 500); // Small delay for better UX
    }
  }

  showInteractionFeedback() {
    // Optional: Show a small indicator of interaction count
    const remaining = this.maxInteractions - this.interactionCount;
    if (remaining > 0 && remaining <= 3) {
      console.log(`${remaining} more interactions until video banner appears`);
    }
  }

  showBanner() {
    if (this.hasShownBanner) return;

    this.hasShownBanner = true;
    const overlay = document.getElementById('video-banner-overlay');
    const video = document.getElementById('banner-video');

    if (overlay && video) {
      overlay.style.display = 'flex';
      this.isVideoPlaying = true;

      // Ensure video plays
      video.play().catch((e) => {
        console.log('Video autoplay prevented, showing controls:', e);
        // If autoplay is blocked, show controls
        video.controls = true;
        video.muted = false;
      });

      console.log('Video banner shown after 5 interactions');

      // Optional: Pause the main app temporarily
      this.pauseMainApp();
    }
  }

  setupVideoEventListeners() {
    // Wait for video element to be created
    setTimeout(() => {
      const video = document.getElementById('banner-video');
      if (video) {
        // Close banner when video ends
        video.addEventListener('ended', () => {
          console.log('Video ended, closing banner automatically');
          this.closeBanner();
        });

        // Track video events
        video.addEventListener('play', () => {
          this.isVideoPlaying = true;
          console.log('Banner video started playing');
        });

        video.addEventListener('pause', () => {
          this.isVideoPlaying = false;
          console.log('Banner video paused');
        });

        // Handle video errors
        video.addEventListener('error', (e) => {
          console.error('Video error:', e);
          this.closeBanner();
        });

        // Handle video loading
        video.addEventListener('loadstart', () => {
          console.log('Video loading started');
        });

        video.addEventListener('canplay', () => {
          console.log('Video can start playing');
        });
      }
    }, 100);
  }

  pauseMainApp() {
    // Optional: Pause the talking head or other animations while video plays
    if (window.head && typeof window.head.stop === 'function') {
      window.head.stop();
    }
  }

  resumeMainApp() {
    // Optional: Resume the talking head or other animations after video
    if (window.head && typeof window.head.start === 'function') {
      window.head.start();
    }
  }

  closeBanner() {
    const overlay = document.getElementById('video-banner-overlay');
    const video = document.getElementById('banner-video');

    if (overlay) {
      // Stop video immediately
      if (video) {
        video.pause();
        video.currentTime = 0;
        this.isVideoPlaying = false;
      }

      // Hide overlay immediately - no animation
      overlay.style.display = 'none';

      // Reset interaction counter and hasShownBanner flag
      this.interactionCount = 0;
      this.hasShownBanner = false;

      console.log('Video banner closed immediately and interaction counter reset to 0');

      // Resume main app
      this.resumeMainApp();
    }
  }

  // Reset system (useful for testing)
  reset() {
    this.interactionCount = 0;
    this.hasShownBanner = false;
    this.isVideoPlaying = false;
    this.closeBanner();
    console.log('Video banner system reset');
  }

  // Manual trigger for testing
  triggerBanner() {
    this.hasShownBanner = false;
    this.showBanner();
  }

  // Get current status
  getStatus() {
    return {
      interactions: this.interactionCount,
      maxInteractions: this.maxInteractions,
      hasShown: this.hasShownBanner,
      isPlaying: this.isVideoPlaying,
    };
  }
}

// Initialize the video banner system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.videoBannerSystem = new VideoBannerSystem();
  console.log('Video Banner System ready!');
});

// For debugging - expose to global scope
window.VideoBannerSystem = VideoBannerSystem;

// Debug functions for testing
window.testVideoBanner = () => {
  if (window.videoBannerSystem) {
    window.videoBannerSystem.triggerBanner();
  }
};

window.resetVideoBanner = () => {
  if (window.videoBannerSystem) {
    window.videoBannerSystem.reset();
  }
};

window.getVideoBannerStatus = () => {
  if (window.videoBannerSystem) {
    return window.videoBannerSystem.getStatus();
  }
};
