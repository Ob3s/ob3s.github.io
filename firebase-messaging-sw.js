// firebase-messaging-sw.js – nur für FCM Token-Registrierung
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

// Messaging initialisieren damit Token-Generierung funktioniert
const messaging = firebase.messaging();
// Push-Handling übernimmt sw.js (gleicher Scope wie die App)
