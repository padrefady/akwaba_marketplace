'use client';

import { useEffect } from 'react';

export async function triggerPwaInstall(): Promise<void> {
  const deferredPrompt = (window as unknown as Record<string, unknown>).__pwaDeferredPrompt as
    | { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
    | undefined;

  if (!deferredPrompt) {
    return;
  }

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  // Clean up so the prompt cannot be shown again
  delete (window as unknown as Record<string, unknown>).__pwaDeferredPrompt;
}

export function PwaRegister() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, could notify user
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('SW registration failed:', error);
        });
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as unknown as Record<string, unknown>).__pwaDeferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      delete (window as unknown as Record<string, unknown>).__pwaDeferredPrompt;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
}
