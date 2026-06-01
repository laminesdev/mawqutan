<p align="center">
  <img src="assets/tray-icon.png" width="72" alt="Mawqutan icon" />
</p>

<h1 align="center">مَوْقُوتًا / Mawqūtan</h1>

<p align="center">
  <em>Prayer at its appointed time — desktop prayer timer</em><br />
  <em>الصلاة على وقتها — تطبيق سطح مكتب لمؤقت الصلاة</em>
</p>

<p align="center">
  ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾<br />
  <strong>النساء 4:103</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-31-blue?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-4-orange" alt="Zustand" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## 📖 Overview / نبذة

**English** — A desktop app that sits on your screen and shows the five prayer times. When it's time to pray, a 5-minute timer appears with a golden circle that drains as seconds pass. Built because most prayer apps are web wrappers stuffed with ads or try to do everything at once. This one does one thing.

**العربية** — تطبيق سطح مكتب يعرض أوقات الصلاة الخمس. عندما يحين وقت الصلاة، يظهر مؤقت 5 دقائق بدائرة ذهبية تتناقص كلما مرت الثواني. بُني لأن معظم تطبيقات الصلاة إما أغلفة ويب مليئة بالإعلانات، أو تحاول فعل كل شيء في آن واحد. هذا التطبيق يفعل شيئًا واحدًا فقط.

---

## ✨ Features / المميزات

| English | العربية |
|---------|---------|
| 🕌 58 Algerian wilayas + 20 international cities | 🕌 58 ولاية جزائرية + 20 مدينة دولية |
| 🎯 Adhan audio plays at prayer time (ffplay/paplay/aplay) | 🎯 تشغيل صوت الأذان عند وقت الصلاة |
| 🔔 OS-level notification when prayer starts | 🔔 إشعار نظام عند بدء الصلاة |
| ⏱️ 5-minute animated timer with golden progress ring | ⏱️ مؤقت 5 دقائق متحرك بحلقة ذهبية |
| 🌙 Hijri date displayed alongside Gregorian | 🌙 عرض التاريخ الهجري مع الميلادي |
| 🌈 Prayer-specific ambient colors (Fajr blue, Maghrib red, etc.) | 🌈 ألوان محيطة خاصة بكل صلاة |
| 🎨 Dark theme with warm gold accent | 🎨 ثيم داكن مع لمسات ذهبية دافئة |
| 📐 Three calculation methods (MWL, ISNA, Egyptian, Umm Al-Qura, Karachi) | 📐 5 طرق حسابية لمواقيت الصلاة |
| 🔄 Auto-start with system (optional) | 🔄 تشغيل تلقائي مع بدء النظام (اختياري) |
| 🖥️ Frameless window, minimize to tray | 🖥️ نافذة بدون إطار، تصغير للـ tray |
| ♿ Built with accessibility in mind | ♿ مدمجة مع دعم الوصولية |
| 📦 Code-split chunks for fast loading | 📦 تقسيم الكود لتحميل سريع |

---

## 🖼️ Screens / الشاشات

### 1. Region Select / اختيار المنطقة

Pick your city from **78 cities** (58 Algerian wilayas + 20 international) or enter custom coordinates. Choose your calculation method. Bilingual interface.

- Custom search + dropdown with keyboard navigation
- Coordinates mode for non-listed locations
- 5 calculation methods: MWL, ISNA, Egyptian, Umm Al-Qura, Karachi

### 2. Prayer Times / أوقات الصلاة

Today's five prayers in Eastern Arabic numerals (٤:٤٩ instead of 4:49). Current prayer highlighted, next prayer with countdown.

- Live digital clock with AM/PM indicator
- Hijri + Gregorian date display
- Auto-start toggle
- Settings button (return to region select)
- Loading skeleton state while calculating

### 3. Timer / المؤقت

When it's prayer time, the app switches to a full-screen 5-minute timer.

- Golden SVG circle that drains as time passes
- Ambient colors shift by prayer (Fajr: deep blue, Dhuhr: warm gold, Asr: deep orange, Maghrib: sunset red, Isha: night indigo)
- Floating particle animation
- "Skip" button to dismiss early
- Auto-dismiss when timer completes (600ms fade-out)

---

## 🛠️ Stack / التقنية

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Electron 31 | Cross-platform desktop |
| **UI** | React 18 + TypeScript (strict) | Type safety + component model |
| **Bundler** | Vite 5 | Fast HMR + code splitting |
| **Styling** | Tailwind CSS 3 | Utility-first, design tokens |
| **State** | Zustand 4 + persist | Lightweight, localStorage |
| **Prayer calc** | `adhan` v4 | Accurate astronomical calculations |
| **Fonts** | Noto Naskh Arabic + Inter | Arabic + Latin pair |
| **Build** | npm run build (vite + tsc) | One command |

---

## 📁 Project Structure / هيكل المشروع

```
mawqutan/
├── electron/
│   ├── main.ts              # Main process: window, tray, IPC, notifications, adhan
│   ├── preload.ts           # Context bridge (secure IPC)
│   └── ipc-channels.ts      # Shared IPC channel constants
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Root: Lazy-loads screens, error boundaries, toast
│   ├── App.css              # (@font-face, CSS variables, keyframes, reset)
│   ├── index.css            # Tailwind directives
│   ├── components/
│   │   ├── TitleBar.tsx        # Frameless drag bar + macOS traffic lights
│   │   └── ErrorBoundary.tsx   # Per-screen error isolation
│   ├── screens/
│   │   ├── RegionSelect.tsx    # City/coordinate picker (lazy-loaded)
│   │   ├── PrayerTimes.tsx     # 5 prayers + countdown (lazy-loaded)
│   │   └── Timer.tsx           # 5-min animated timer (lazy-loaded)
│   ├── hooks/
│   │   └── usePrayerMonitor.ts # Prayer time calculation + auto-trigger
│   ├── stores/
│   │   └── useStore.ts         # Zustand store (region, timer, toast)
│   ├── types/
│   │   ├── electron.d.ts       # Global window.electronAPI declaration
│   │   └── index.ts            # Shared type definitions
│   └── utils/
│       ├── formatters.ts       # toEasternArabic, formatTime12, etc.
│       ├── hijri.ts            # Umm Al-Qura Hijri date conversion
│       └── prayerTimes.ts      # Adhan wrapper, calc methods
├── public/
│   └── fonts/                  # Noto Naskh Arabic + Inter (Vite static)
├── assets/                     # Tray icon, adhan.mp3
├── dist/                       # Vite build output
├── dist-electron/              # Compiled Electron main process
├── tailwind.config.js          # Design tokens (colors, fonts, spacing, type scale)
├── vite.config.ts              # React plugin + @/ alias + base: ./
├── tsconfig.json               # Strict TypeScript + path aliases
└── tsconfig.electron.json      # Electron main process compilation
```

---

## 🎨 Design System / نظام التصميم

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0a0e27` | Deep indigo background |
| `surface` | `rgba(232,224,208,0.05)` | Card/input backgrounds |
| `surface-raised` | `#111533` | Dropdown menus |
| `accent` | `#d4a843` | Gold accent (buttons, highlights) |
| `text-primary` | `#e8e0d0` | Primary text (warm) |
| `text-secondary` | `#8b83a0` | Secondary text |
| `text-verse` | `#6b6380` | Quran verse text (muted) |
| `border` | `rgba(232,224,208,0.1)` | Subtle borders |
| **Type scale** | `2xs` → `7xl` | 12 sizes from 10px to 72px |
| **Spacing** | `0.5` → `16` | 8-step spacing scale |
| **Radii** | `sm` → `2xl` | 4px to 22px |
| **Fonts** | Inter + Noto Naskh Arabic | Latin + Arabic pairing |

---

## 🚀 Getting Started / التشغيل

### Prerequisites / المتطلبات

- **Node.js** ≥ 18
- **npm** or **bun**
- **ffplay** / **paplay** / **aplay** (for adhan audio — at least one)

### Install / التثبيت

```bash
git clone https://github.com/laminesdev/mawqutan
cd mawqutan
npm install
```

### Run (development) / التطوير

```bash
MAWQUTAN_DEV=true npm run dev
```

### Build + launch / البناء والتشغيل

```bash
npm run build
npm run start
```

If you get a sandbox error:

```bash
electron . --no-sandbox
```

### Package for distribution / التوزيع

```bash
# Coming soon — electron-builder config
```

---

## 📦 Build Output / مخرجات البناء

```
dist/assets/
├── index.html               0.40 kB
├── index-*.css             21.49 kB (gzip: 5.19 kB)
├── formatters-*.js          0.62 kB (gzip: 0.48 kB)  # Shared utils
├── Timer-*.js               4.09 kB (gzip: 1.99 kB)  # Lazy-loaded
├── PrayerTimes-*.js         6.01 kB (gzip: 2.62 kB)  # Lazy-loaded
├── RegionSelect-*.js       10.76 kB (gzip: 4.44 kB)  # Lazy-loaded
└── index-*.js             170.31 kB (gzip: 55.93 kB) # Core bundle
```

---

## 🌍 Cities / المدن

**58 Algerian wilayas** (أدرار → المنيعة) + **20 international cities** (Makkah, Madinah, Cairo, Dubai, Amman, Riyadh, Casablanca, Tunis, Tripoli, Damascus, Baghdad, Jerusalem, Istanbul, Kuwait City, Muscat, Doha, Manama, Sanaa, Khartoum, Nouakchott).

Add yours in `src/screens/RegionSelect.tsx`.

---

## 🤝 Contributing / المساهمة

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

**Code style:**
- TypeScript strict mode
- Tailwind CSS utility classes (no raw CSS for styling)
- Arabic comments for UI logic, English comments for technical logic
- One concept per commit

---

## 📄 License / الترخيص

MIT © [Mohamed Amine Boughaba](https://github.com/laminesdev)

---

<p align="center">
  <strong>مَوْقُوتًا</strong> — Algeria, 2026
</p>
