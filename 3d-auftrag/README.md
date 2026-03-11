# ⬡ 3D Print Manager PWA

Auftragsverwaltung für 3D-Druck – vollständige Progressive Web App mit Firebase Firestore und Offline-Support.

## 📁 Dateien

```
/
├── index.html        ← Komplette App (HTML + CSS + JS)
├── manifest.json     ← PWA-Manifest
├── sw.js             ← Service Worker (Offline-Cache)
├── icon-192.png      ← App-Icon
└── icon-512.png      ← App-Icon (groß)
```

## 🚀 Deployment auf GitHub Pages

1. **Neues Repository** anlegen auf GitHub (z.B. `print3d` oder direkt als `ob3s.github.io` Root)
2. Alle Dateien in den **Root** des Repos hochladen
3. Unter **Settings → Pages** → Source: `main` Branch, Root `/`
4. Die App ist erreichbar unter `https://ob3s.github.io/` (oder `/print3d`)

> ⚠️ Damit der Service Worker funktioniert, **muss** HTTPS aktiv sein – GitHub Pages macht das automatisch.

## 🔥 Firebase einrichten

### 1. Firebase-Projekt erstellen
1. [console.firebase.google.com](https://console.firebase.google.com/) öffnen
2. **„Projekt hinzufügen"** → Name vergeben (z.B. `print3d-manager`)
3. Google Analytics: optional

### 2. Firestore aktivieren
1. Im Projekt: **Build → Firestore Database**
2. **„Datenbank erstellen"**
3. Testmodus oder eigene Regeln wählen

**Empfohlene Sicherheitsregeln** (nur eingeloggte User – oder offen für erste Tests):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Offen (nur für Tests!):
    match /print_jobs/{id} {
      allow read, write: if true;
    }
  }
}
```

### 3. Web-App registrieren
1. **Projekteinstellungen** (Zahnrad) → **„App hinzufügen"** → Web (`</>`)
2. App-Nickname vergeben
3. **Firebase-Konfiguration** erscheint – diese Werte brauchst du in Schritt 4

### 4. App konfigurieren
Beim ersten Öffnen der PWA erscheint ein **Setup-Bildschirm**.  
Trage dort ein:

| Feld | Beispiel |
|------|---------|
| API Key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXX` |
| Auth Domain | `dein-projekt.firebaseapp.com` |
| Project ID | `dein-projekt-id` |
| App ID | `1:123456789:web:abcdefgh` |

Die Konfiguration wird **lokal** im Browser gespeichert (localStorage).

## 📱 Als PWA installieren

- **Android/Chrome**: Menü → „App installieren"
- **iOS/Safari**: Teilen → „Zum Home-Bildschirm"
- **Desktop/Chrome**: Adressleiste → Installations-Icon

## ✨ Features

- ✅ Aufträge anlegen, bearbeiten, löschen
- ✅ Status: **Offen** / **Laufend** / **Fertig**
- ✅ Makerworld-Link oder ID (automatisch erkannt)
- ✅ Notizfeld (Material, Farbe, Infill…)
- ✅ Filter- und Suchfunktion
- ✅ Vollständig offline-fähig (Firestore Offline-Persistenz + Service Worker)
- ✅ Echtzeit-Sync zwischen Geräten via Firestore

## 🔄 Firestore Datenstruktur

Collection: `print_jobs`

```
{
  name:      "Halterung Wohnzimmer",   // string
  mwId:      "123456",                 // string (Makerworld Model-ID)
  status:    "offen",                  // "offen" | "laufend" | "fertig"
  notes:     "PLA, schwarz, 20% Infill", // string
  createdAt: Timestamp                 // serverTimestamp
}
```
