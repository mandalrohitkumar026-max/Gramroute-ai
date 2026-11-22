export const registerServiceWorker = (): void => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // eslint-disable-next-line no-console
          console.log('[GramRoute PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[GramRoute PWA] Service Worker registration failed:', err);
        });
    });
  }
};
