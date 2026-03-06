// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDwV6LJUnL660nQnnlQ47QZnBc_bXzIezU",
  authDomain: "ffw-oegeln-791ca.firebaseapp.com",
  projectId: "ffw-oegeln-791ca",
  storageBucket: "ffw-oegeln-791ca.firebasestorage.app",
  messagingSenderId: "170034438620",
  appId: "1:170034438620:web:f2e40bf21b6a9b6987ef19"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  const alarm    = payload.data?.alarm === 'true';
  const uebungId = payload.data?.uebungId || '';
  const url      = uebungId
    ? `https://ob3s.github.io/ortswehr/?uebung=${uebungId}`
    : 'https://ob3s.github.io/ortswehr/';

  self.registration.showNotification(title || '🚒 Ortswehr', {
    body: body || '',
    icon: '/ortswehr/icons/icon-192.png',
    badge: '/ortswehr/icons/icon-192.png',
    tag: alarm ? 'einsatz' : 'allgemein',
    vibrate: alarm ? [200,100,200,100,200,100,400] : [200,100,200],
    requireInteraction: alarm,
    data: { url }
  });
});

// ── Klick auf Benachrichtigung → App öffnen ───────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || 'https://ob3s.github.io/ortswehr/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      for (const win of wins) {
        if (win.url.includes('ob3s.github.io/ortswehr')) {
          win.location = url;
          return win.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
