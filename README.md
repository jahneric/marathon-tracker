# Marathon 2027 Tracker

PWA zum Tracken der Marathon- und Beachvolleyball-Vorbereitung (52-Wochen-Plan).
Läuft komplett offline. Alle Daten bleiben im `localStorage` des Geräts (Schlüssel `mt27`, kompatibel mit v1).

## Stack

- React 19 + TypeScript (strict), Vite
- `vite-plugin-pwa` (Workbox): Offline-Cache, Update-Hinweis in der App, generierte Icons aus `public/icon.svg`
- Zustand: ein kleiner Store mit Immer + `useSyncExternalStore` (`src/store`)
- CSS Modules + Design-Tokens für hell/dunkel (`src/styles/global.css`)
- Vitest für die Planlogik, ESLint

## Befehle

```sh
npm install        # einmalig
npm run dev        # Entwicklung mit Hot Reload
npm test           # Tests
npm run lint
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

Zum Veröffentlichen den Inhalt von `dist/` auf einen beliebigen statischen Host mit HTTPS legen
(z. B. GitHub Pages, Netlify, Cloudflare Pages). Die Pfade sind relativ, ein Unterordner funktioniert auch.

## Struktur

```
src/
  data/       Trainingsplan, Übungen, Regeln (reine Daten)
  domain/     Datumslogik, Wochenplan-Generator, Auswertungen (ohne React, getestet)
  store/      Typen, Store, Aktionen
  ui/         wiederverwendbare Bausteine (Button, Card, Segmented, Dialog, Toast …)
  shell/      Kopfzeile, Navigation, Update-Hinweis
  features/   Ansichten: today, plan, stats, info, settings
  hooks/      Routing (Hash), aktuelles Datum, Theme
```
