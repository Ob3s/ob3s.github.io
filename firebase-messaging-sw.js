// firebase-messaging-sw.js – Push-Handler für FCM, gemeinsam genutzt von PROD (/ortswehr/) und
// DEV (/ortswehr-dev/), da beide unter demselben GitHub-Pages-Konto (ob3s.github.io) laufen und
// Service Worker nur root-relativ zuverlässig für beide Pfade registrierbar sind. Welche
// Firebase-Umgebung gilt, kommt über den Query-Parameter, mit dem die Seite diese Datei
// registriert (?env=dev bzw. ?env=prod, s. registerPush() in ortswehr/index.html) - ohne den
// Parameter (ältere/gecachte Registrierung) wird PROD als Default angenommen, das war bisher das
// einzige verwendete Verhalten.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const KONFIG = {
  prod: {
    apiKey: "AIzaSyDwV6LJUnL660nQnnlQ47QZnBc_bXzIezU",
    authDomain: "ffw-oegeln-791ca.firebaseapp.com",
    projectId: "ffw-oegeln-791ca",
    storageBucket: "ffw-oegeln-791ca.firebasestorage.app",
    messagingSenderId: "170034438620",
    appId: "1:170034438620:web:f2e40bf21b6a9b6987ef19",
    url: 'https://ob3s.github.io/ortswehr/',
    icon: '/ortswehr/icons/icon-192.png',
    reaktionUrl: 'https://europe-west3-ffw-oegeln-791ca.cloudfunctions.net/pushReaktion',
  },
  dev: {
    apiKey: "AIzaSyAiG5H2bMIRqhMXJcOhn_GWaEPVAPlKm8k",
    authDomain: "ffw-oegeln-dev.firebaseapp.com",
    projectId: "ffw-oegeln-dev",
    storageBucket: "ffw-oegeln-dev.firebasestorage.app",
    messagingSenderId: "1083789051573",
    appId: "1:1083789051573:web:90aea329bd0d903c51a0fc",
    url: 'https://ob3s.github.io/ortswehr-dev/',
    icon: '/ortswehr-dev/icons/icon-192.png',
    reaktionUrl: 'https://europe-west3-ffw-oegeln-dev.cloudfunctions.net/pushReaktion',
  },
};
const env = new URL(self.location.href).searchParams.get('env') === 'dev' ? 'dev' : 'prod';
const ziel = KONFIG[env];

firebase.initializeApp(ziel);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const alarm = payload.data?.alarm === 'true';
  // Empfänger hat sich als nicht verfügbar gemeldet: Meldung kommt trotzdem (inkl. Reaktions-
  // Buttons), nur ohne Ton/Vibration - s. benachrichtigeOrtswehr()/sendPushNotification.
  const stumm = payload.data?.stumm === 'true';
  const title = payload.notification?.title || payload.data?.title || '🚒 Ortswehr';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  // Ziel-URL kommt bevorzugt aus dem Payload selbst (von der Cloud Function pro Umgebung
  // mitgeschickt) - Fallback auf die zu diesem Registrierungs-env passende URL, falls eine ältere
  // Cloud-Function-Version das Feld noch nicht mitschickt.
  const zielUrl = payload.data?.url || ziel.url;
  const uebungId = payload.data?.uebungId || '';
  const userId   = payload.data?.userId || '';
  const sig      = payload.data?.sig || '';
  // Daumen-hoch/-runter direkt in der Benachrichtigung: nur möglich, wenn die Cloud Function beim
  // Versenden eine Signatur mitgegeben hat (s. reaktionSignatur() in ortswehr-functions/index.js -
  // ohne die kein Nachweis, dass die Reaktion wirklich von diesem Kameraden stammt).
  const mitReaktionsButtons = alarm && uebungId && userId && sig;
  // Nicht anzeigen wenn genau DIESE Umgebung (nicht die jeweils andere) schon im Vordergrund ist -
  // onMessage() dort übernimmt dann die Anzeige (Toast + Ton).
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const appOffen = clients.some(c => c.url.startsWith(zielUrl) && c.visibilityState === 'visible');
    if (appOffen) return;
    return self.registration.showNotification(title, {
      body,
      icon:    ziel.icon,
      badge:   ziel.icon,
      tag:     alarm ? 'einsatz' : 'allgemein',
      vibrate: stumm ? [] : (alarm ? [200,100,200,100,200,100,400] : [200,100,200]),
      silent:  stumm,
      requireInteraction: alarm,
      data:    { url: zielUrl, uebungId, userId, sig },
      actions: mitReaktionsButtons ? [
        { action: 'reagieren_ja',   title: '👍 Komme' },
        { action: 'reagieren_nein', title: '👎 Komme nicht' },
      ] : [],
    });
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const { url, uebungId, userId, sig } = e.notification.data || {};
  const zielUrl = url || ziel.url;

  // Reaktions-Button: direkt an die Cloud Function melden, App bleibt zu - kein Fensterwechsel
  // nötig, nur eine kurze Bestätigung als eigene (nicht-alarmierende) Benachrichtigung.
  if ((e.action === 'reagieren_ja' || e.action === 'reagieren_nein') && uebungId && userId && sig) {
    const status = e.action === 'reagieren_ja' ? 'bestaetigt' : 'kommt_nicht';
    e.waitUntil(
      fetch(ziel.reaktionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uebungId, userId, status, sig }),
      })
        .then(res => self.registration.showNotification(
          res.ok ? '✅ Reaktion gespeichert' : '⚠️ Reaktion fehlgeschlagen',
          { body: status === 'bestaetigt' ? '👍 Komme' : '👎 Komme nicht', tag: 'reaktion-bestaetigung', icon: ziel.icon }
        ))
        .catch(() => self.registration.showNotification('⚠️ Reaktion fehlgeschlagen', { body: 'Bitte in der App nachtragen.', tag: 'reaktion-bestaetigung', icon: ziel.icon }))
    );
    return;
  }

  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
    for (const win of wins) {
      if (win.url.startsWith(zielUrl)) { win.focus(); return; }
    }
    return clients.openWindow(zielUrl);
  }));
});
