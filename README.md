# مَوْقُوتًا / Mawqūtan

> إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
>
> **(النساء 4:103)**

A desktop app that sits on your screen and shows the five prayer times.
When it's time to pray, the screen changes — a 5-minute timer appears with
a golden circle that drains as seconds pass. No notifications, no noise.
Just the app doing what it's supposed to do.

Built because most prayer apps are either web wrappers stuffed with ads,
or they try to do everything (Qibla, tasbih, Quran, weather, news).
This one only does the one thing it was made for.

---

## Screens

**1. Region select** — pick your city from a list (19 cities so far, mostly
Algeria + Makkah/Madinah/Cairo/Dubai) or type coordinates. Choose your
calculation method: MWL, ISNA, Egyptian, Umm Al-Qura, or Karachi.

**2. Prayer times** — shows today's five prayers in Eastern Arabic numerals
(٤:٤٩ instead of 4:49). The current prayer is highlighted, the next one
has a countdown. The verse from An-Nisa sits at the bottom.

**3. Timer** — at prayer time, the app switches to a full-screen timer.
5 minutes. Golden SVG circle that drains as time passes. Background color
shifts depending on the prayer (deep blue for Fajr, sunset red for Maghrib).
Floating particles. When the circle empties, it fades back to the prayer screen.

---

## Stack

| Thing | What |
|-------|------|
| Runtime | Electron |
| UI | React 18 + TypeScript |
| Bundler | Vite |
| State | Zustand (persisted to localStorage) |
| Prayer calc | adhan v4 |
| Fonts | Noto Naskh Arabic + Inter |
| Window | Frameless, 480×700, dark |

## Project structure

```
mawqutan/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Context bridge (minimize IPC)
├── src/
│   ├── main.tsx         # React entry
│   ├── App.tsx          # Root: routes between 3 screens, watches prayer times
│   ├── App.css          # All styling (dark theme, animations)
│   ├── screens/
│   │   ├── RegionSelect.tsx   # City / coordinates picker
│   │   ├── PrayerTimes.tsx    # 5 prayers + countdown
│   │   └── Timer.tsx          # 5-min animated countdown
│   ├── stores/
│   │   └── useStore.ts        # Zustand store
│   └── utils/
│       └── prayerTimes.ts     # adhan wrapper, calc methods
├── dist/                # Vite build output
├── dist-electron/       # Compiled Electron main
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.electron.json
```

---

## Run it

```bash
git clone https://github.com/laminesdev/mawqutan
cd mawqutan
bun install

# Build + launch
bun run build
bun run start

# Or dev mode (with hot-reload Vite server)
bun run dev
```

If `bun run start` gives you a sandbox error, add `--no-sandbox`:
```bash
electron . --no-sandbox
```

---

## Why the name

From Quran 4:103 — "كِتَابًا مَّوْقُوتًا" — prayer is a timed obligation.
The name is the word itself in its Quranic form: Mawqūtan (مَوْقُوتًا).

---

## What it doesn't do (and won't)

- No notifications (planned, but not yet)
- No adhan audio (planned)
- No Qibla direction
- No tasbih counter
- No Quran reader
- No weather
- No social features
- No cloud sync

It's a timer for salah. That's it.

---

## What needs work

- The prayer list only has 19 cities — add yours in `RegionSelect.tsx`
- Currently shows Gregorian date in Arabic, not Hijri
- Before Fajr, it says "غداً" (tomorrow) but Fajr is still today
- No tray icon — closing the app quits it
- Only tested on Linux (Arch-based)
- The sandbox helper needs root permissions to run without `--no-sandbox`
- No packaging script to generate .AppImage / .deb yet

---

Built by [Lamine](https://github.com/laminesdev). Algeria, 2026.
