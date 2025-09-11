// Global type augmentations for browser window and modules

export {};

declare global {
  interface Window {
    TalkingHead?: any;
    avatarRenderer?: any;
    avatarSample?: {
      greet: () => void;
      demo: () => void;
      goodbye: () => void;
    };
    THREE?: unknown;
  }
}
