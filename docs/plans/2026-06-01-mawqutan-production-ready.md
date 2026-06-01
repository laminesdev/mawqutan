# مَوْقُوتًا / Mawqūtan — Production Readiness Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan phase-by-phase.
>
> **Goal:** Turn the current Mawqutan MVP into a production-ready desktop prayer app — polished, packaged, and distributable.
>
> **Architecture:** Electron + React 18 + Vite + Zustand + adhan. Single-window app with 3 screens (RegionSelect → PrayerTimes → Timer). New additions: tray subsystem, audio playback via Electron's native APIs, self-hosted fonts, electron-builder packaging.
>
> **Tech Stack:** Electron 31, React 18, TypeScript 5, Vite 5, Zustand 4, adhan 4, electron-builder.

---

## Phase 1 — Core Fixes (Bugs & Reliability)

Straightforward bug fixes and crash protection. No new features.

### Task 1.1: Fix "غداً" Before Fajr Bug

**Objective:** When current time is before Fajr (currentIdx = -1), the next prayer (Fajr) is still today, not tomorrow. The label should say "الصلاة القادمة" not "الصلاة القادمة — غداً".

**Files:**
- Modify: `src/screens/PrayerTimes.tsx:56-62`

**Step 1: Read the current logic**

The bug is that `isNextToday` is `nextIdx !== 0`, but when `currentIdx === -1`, `nextIdx === 0` (Fajr), Fajr IS today, yet `isNextToday` is `false` because `nextIdx === 0`.

The correct logic: the next prayer is "today" if its time is still ahead of us today AND it's not the first prayer of the *next* day. Actually, if any prayer has already happened today (currentIdx >= 0) and the next prayer's index is 0 (Fajr wrapped around), it's tomorrow. But if NO prayer has happened yet (currentIdx === -1), everything is still today.

**Step 2: Replace the logic**

Change lines 56-62 from:
```ts
let currentIdx = -1;
for (let i = 0; i < prayers.length; i++) {
  if (prayers[i].time.getTime() <= now) currentIdx = i;
}
const nextIdx = currentIdx + 1 < prayers.length ? currentIdx + 1 : 0;
const isNextToday = nextIdx !== 0;
const nextPrayer = prayers[isNextToday ? nextIdx : 0];
```

To:
```ts
let currentIdx = -1;
for (let i = 0; i < prayers.length; i++) {
  if (prayers[i].time.getTime() <= now) currentIdx = i;
}
const nextIdx = currentIdx + 1 < prayers.length ? currentIdx + 1 : 0;
// next prayer is today IF:
// 1. No prayer has passed yet today (currentIdx === -1) → everything is ahead of us, OR
// 2. We haven't wrapped around to Fajr of the next day (nextIdx !== 0)
const isNextToday = currentIdx === -1 || nextIdx !== 0;
const nextPrayer = prayers[nextIdx];
```

**Step 3: Build to verify**

Run: `cd ~/Projects/mawqutan && npm run build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
cd ~/Projects/mawqutan
git add src/screens/PrayerTimes.tsx
git commit -m "fix: before-Fajr 'غداً' label when Fajr is still today"
```

---

### Task 1.2: Add React Error Boundary

**Objective:** Catch runtime crashes and show a fallback UI instead of a white screen.

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx:1` (add import), `src/App.tsx:82-89` (wrap content)

**Step 1: Create ErrorBoundary component**

Create `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mawqutan Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e27',
          color: '#e8e0d0',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'Noto Naskh Arabic, serif' }}>
            حدث خطأ
          </h1>
          <p style={{ color: '#8b83a0', marginBottom: '2rem' }}>
            {this.state.error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, #d4a843, #c49430)',
              color: '#0a0e27',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Noto Naskh Arabic, serif',
            }}
          >
            إعادة التشغيل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Step 2: Wrap App in ErrorBoundary**

In `src/App.tsx`, add the import and wrap:

```tsx
import ErrorBoundary from './components/ErrorBoundary';

// In return:
return (
  <ErrorBoundary>
    <TitleBar />
    {!region && <RegionSelect />}
    {region && timer.active && <TimerScreen />}
    {region && !timer.active && <PrayerTimesScreen prayers={prayers} />}
  </ErrorBoundary>
);
```

**Step 3: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/App.tsx
git commit -m "feat: add React error boundary with restart button"
```

---

### Task 1.3: Clean Up Dev Script (Remove Redundant Build)

**Objective:** The `dev` script runs vite build unnecessarily when vite dev server is already serving. Simplify it.

**Files:**
- Modify: `package.json:9`

**Step 1: Update dev script**

Change:
```
"dev": "MAWQUTAN_DEV=true vite & vite build && tsc -p tsconfig.electron.json && MAWQUTAN_DEV=true electron . --no-sandbox",
```
To:
```
"dev": "MAWQUTAN_DEV=true vite & tsc -p tsconfig.electron.json && MAWQUTAN_DEV=true electron . --no-sandbox",
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: remove redundant vite build from dev script"
```

---

## Phase 2 — Tray & Window Management

Core UX improvement: the app should live in the system tray, minimize to tray, and the close button should hide to tray (not quit). During prayer timer, the window cannot be closed or minimized.

### Task 2.1: Add Tray Icon Support to Electron Main Process

**Objective:** Create a tray icon with context menu (Show/Hide, Quit). Implement minimize-to-tray and close-to-tray behavior.

**Files:**
- Modify: `electron/main.ts`
- Create: `assets/tray-icon.png` (use a simple 16x16 or 22x22 icon)
- Add: tray icon asset

**Step 1: Generate a simple tray icon**

We'll create a minimal PNG. Since we don't have image editing tools, we'll use a terminal command to generate a simple icon:

```bash
mkdir -p ~/Projects/mawqutan/assets
# Create a 32x32 PNG with a moon-like symbol using ImageMagick or Python
python3 -c "
from struct import pack
def create_png(width, height, pixels):
    # PNG filter: all rows use filter 0 (None)
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter byte
        for x in range(width):
            raw += bytes(pixels[y * width + x])
    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr_data = pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    ihdr_crc = 0xde442c9e  # we'll just compute it
    import zlib
    ihdr = pack('>I', 13) + b'IHDR' + ihdr_data + pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    # IDAT
    compressed = zlib.compress(raw)
    idat = pack('>I', len(compressed)) + b'IDAT' + compressed + pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff)
    # IEND
    iend = pack('>I', 0) + b'IEND' + pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    return sig + ihdr + idat + iend

# Gold crescent on dark background
w, h = 32, 32
pixels = []
for y in range(h):
    for x in range(w):
        cx, cy = x - w//2, y - h//2
        dist = (cx*cx + cy*cy) ** 0.5
        inner_dist = ((cx+3)*(cx+3) + cy*cy) ** 0.5
        if 8 < dist < 14 and inner_dist > 9:
            pixels.append([212, 168, 67, 255])
        elif 6 < dist < 7:
            pixels.append([232, 224, 208, 60])  # faint glow
        else:
            pixels.append([10, 14, 39, 0])  # transparent

with open('assets/tray-icon.png', 'wb') as f:
    f.write(create_png(w, h, pixels))
print('Created assets/tray-icon.png')
"
```

**Step 2: Rewrite electron/main.ts with tray support**

Replace the entire `electron/main.ts`:

```ts
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';

let win: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 700,
    minWidth: 380,
    minHeight: 500,
    frame: false,
    backgroundColor: '#0a0e27',
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  win.once('ready-to-show', () => win?.show());

  const isDev = process.env.MAWQUTAN_DEV === 'true';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Close button → hide to tray instead of quitting
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'إظهار / Show',
      click: () => {
        win?.show();
        win?.focus();
      },
    },
    {
      label: 'تصغير / Hide',
      click: () => win?.hide(),
    },
    { type: 'separator' },
    {
      label: 'خروج / Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('مَوْقُوتًا — Mawqūtan');
  tray.setContextMenu(contextMenu);

  // Double-click tray → show window
  tray.on('double-click', () => {
    win?.show();
    win?.focus();
  });
}

// IPC handlers
ipcMain.on('minimize-window', (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  bw?.hide(); // minimize to tray, not just minimize
});

ipcMain.on('close-window', (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  bw?.hide(); // close button → hide to tray
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

// Extend app type for isQuitting flag
declare module 'electron' {
  interface App {
    isQuitting?: boolean;
  }
}

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  // On macOS, keep app running in dock. On other platforms... keep running in tray.
  // Don't quit — tray is still alive.
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  win?.show();
});
```

**Step 3: Update preload.ts to expose close-window and quit**

Modify `electron/preload.ts`:

```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  quit: () => ipcRenderer.send('quit-app'),
});
```

**Step 4: Update window.d.ts declaration in App.tsx**

Update the global declaration in `src/App.tsx`:

```tsx
declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      close: () => void;
      quit: () => void;
    };
  }
}
```

**Step 5: Update TitleBar close button**

In `src/App.tsx`, change the close button handler:
```tsx
<button className="title-btn close" title="إغلاق" onClick={() => window.electronAPI?.close()} />
```

**Step 6: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add electron/main.ts electron/preload.ts src/App.tsx assets/tray-icon.png
git commit -m "feat: add tray icon with minimize-to-tray and close-to-tray"
```

---

### Task 2.2: Block Window Close During Active Timer

**Objective:** When the timer is active, the window cannot be closed, minimized, or hidden. Force the user to stay in the app.

**Files:**
- Modify: `electron/main.ts` (pass timer state to main process)
- Modify: `src/stores/useStore.ts` (notify main process on timer state change)
- Modify: `electron/preload.ts` (expose timer lock)
- Modify: `src/App.tsx` (call lock on timer activate/deactivate)

**Note:** This is a soft lock. Alt+F4 can still kill the process. True prevention requires capturing the `before-quit` event. We'll implement best-effort:

**Step 1: Add IPC for timer state to main process**

In `electron/preload.ts`, add:
```ts
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  quit: () => ipcRenderer.send('quit-app'),
  setTimerActive: (active: boolean) => ipcRenderer.send('set-timer-active', active),
});
```

**Step 2: Add main process handler for timer lock**

In `electron/main.ts`, add:
```ts
let isTimerActive = false;

ipcMain.on('set-timer-active', (_event, active: boolean) => {
  isTimerActive = active;
  if (active && win) {
    // Force window to front and stay
    win.show();
    win.focus();
    win.setAlwaysOnTop(true, 'screen-saver');
  } else if (!active && win) {
    win.setAlwaysOnTop(false);
  }
});

// Prevent close during timer
app.on('before-quit', (event) => {
  if (isTimerActive) {
    event.preventDefault();
  }
});
```

**Step 3: Integrate into store**

In `src/stores/useStore.ts`, add side effect on `activateTimer` and `deactivateTimer`:

Inside the `(set) => ({ ... })` block, modify:
```ts
activateTimer: (name, nameAr) => {
  window.electronAPI?.setTimerActive(true);
  return set({
    timer: {
      active: true,
      prayerName: name,
      prayerNameAr: nameAr,
      endAt: Date.now() + 300000,
    },
  });
},
deactivateTimer: () => {
  window.electronAPI?.setTimerActive(false);
  return set({ timer: { ...defaultTimer } });
},
```

**Step 4: Update global declaration**

```tsx
declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      close: () => void;
      quit: () => void;
      setTimerActive: (active: boolean) => void;
    };
  }
}
```

**Step 5: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add electron/main.ts electron/preload.ts src/stores/useStore.ts src/App.tsx
git commit -m "feat: lock window during active prayer timer"
```

---

## Phase 3 — Audio & Notifications

### Task 3.1: Add Adhan Audio at Prayer Time

**Objective:** Play the Adhan audio when the timer activates (at prayer time). Use a bundled MP3 file in the app assets.

**Files:**
- Create: `assets/adhan.mp3` (download a free Adhan MP3)
- Modify: `electron/preload.ts` (expose playAdhan)
- Modify: `electron/main.ts` (audio playback via main process to avoid sandbox issues)
- Modify: `src/stores/useStore.ts` (trigger adhan on timer activate)

**Step 1: Download a free Adhan audio file**

```bash
cd ~/Projects/mawqutan
# Download from a public domain adhan audio source
# Using a small, free-to-use adhan mp3
curl -L -o assets/adhan.mp3 "https://github.com/laminesdev/mawqutan-assets/raw/main/adhan-makkah.mp3" 2>/dev/null || \
curl -L -o assets/adhan.mp3 "https://www.islamcan.com/audio/adhan/azan1.mp3" 2>/dev/null || \
echo "Placeholder: download an Adhan MP3 manually"
```

If downloads fail, note in README to add it manually. We'll make the app handle missing file gracefully.

**Step 2: Add IPC for adhan playback in main process**

In `electron/main.ts`, add:
```ts
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// ... inside app.whenReady() or as a standalone handler:

function playAdhan() {
  const audioPath = path.join(__dirname, '../assets/adhan.mp3');
  if (!fs.existsSync(audioPath)) return; // silently skip if no audio file
  
  // Use child_process to play audio via ffplay/paplay/aplay
  // Electron's main process can't natively play audio without a window
  // Best approach: send back to renderer to play via Web Audio API, OR
  // use ffplay/paplay as a subprocess
  
  const { exec } = require('child_process');
  // Try common players
  const players = [
    `ffplay -nodisp -autoexit "${audioPath}"`,
    `paplay "${audioPath}"`,
    `aplay "${audioPath}"`,
    `play "${audioPath}"`,  // SoX
  ];
  
  for (const cmd of players) {
    exec(cmd, (err) => {
      if (err) {
        // Try next player
        return;
      }
    });
    break; // Try first one only
  }
}

ipcMain.on('play-adhan', () => playAdhan());
```

**Step 3: Expose playAdhan in preload**

In `electron/preload.ts`:
```ts
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  quit: () => ipcRenderer.send('quit-app'),
  setTimerActive: (active: boolean) => ipcRenderer.send('set-timer-active', active),
  playAdhan: () => ipcRenderer.send('play-adhan'),
});
```

**Step 4: Trigger adhan on timer activate**

In `src/stores/useStore.ts`, in `activateTimer`:
```ts
activateTimer: (name, nameAr) => {
  window.electronAPI?.setTimerActive(true);
  window.electronAPI?.playAdhan(); // Play adhan!
  return set({
    timer: {
      active: true,
      prayerName: name,
      prayerNameAr: nameAr,
      endAt: Date.now() + 300000,
    },
  });
},
```

**Step 5: Update global declaration**

```tsx
declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      close: () => void;
      quit: () => void;
      setTimerActive: (active: boolean) => void;
      playAdhan: () => void;
    };
  }
}
```

**Step 6: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add electron/main.ts electron/preload.ts src/stores/useStore.ts src/App.tsx
git commit -m "feat: play adhan audio on prayer time activation"
```

---

## Phase 4 — Production Packaging

### Task 4.1: Configure electron-builder

**Objective:** Set up electron-builder with proper config, icons, and build scripts for Linux (and optionally Windows/MacOS).

**Files:**
- Create: `electron-builder.yml` (or add to package.json)
- Create: `assets/icon.png` (256x256 app icon)
- Modify: `package.json` (add build config, update pack script)

**Step 1: Generate app icons**

```bash
cd ~/Projects/mawqutan
mkdir -p assets/icons

# Generate a 256x256 icon with the crescent (Python)
python3 -c "
from struct import pack
import zlib

def create_png(width, height, pixels):
    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            raw += bytes(pixels[y * width + x])
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = pack('>I', 13) + b'IHDR' + ihdr_data + pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    compressed = zlib.compress(raw)
    idat = pack('>I', len(compressed)) + b'IDAT' + compressed + pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff)
    iend = pack('>I', 0) + b'IEND' + pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    return sig + ihdr + idat + iend

w, h = 256, 256
pixels = []
for y in range(h):
    for x in range(w):
        cx, cy = x - w//2, y - h//2
        dist = (cx*cx + cy*cy) ** 0.5
        inner_dist = ((cx+16)*(cx+16) + cy*cy) ** 0.5
        if 55 < dist < 100 and inner_dist > 65:
            pixels.append([212, 168, 67, 255])  # gold crescent
        elif 50 < dist < 105:
            pixels.append([232, 224, 208, 20])  # faint glow
        else:
            pixels.append([10, 14, 39, 0])  # transparent

with open('assets/icons/icon.png', 'wb') as f:
    f.write(create_png(w, h, pixels))

# Also create 256x256 for linux
import shutil
shutil.copy('assets/icons/icon.png', 'assets/icons/256x256.png')
print('Created icons')
"
```

**Step 2: Create electron-builder config**

Create `build-config.yml`:

```yaml
appId: com.laminesdev.mawqutan
productName: Mawqutan
copyright: Copyright © 2026 Mohamed Amine Boughaba

directories:
  output: release
  buildResources: assets

files:
  - dist/**/*
  - dist-electron/**/*
  - assets/**/*
  - package.json

linux:
  target:
    - AppImage
    - deb
  category: Utility
  icon: assets/icons
  synopsis: Prayer timer for desktop
  description: >-
    مَوْقُوتًا — A desktop app that shows prayer times and
    prevents you from skipping salah with a full-screen timer.

mac:
  target:
    - dmg
  icon: assets/icons/icon.png
  category: public.app-category.productivity

win:
  target:
    - portable
    - nsis
  icon: assets/icons/icon.png
```

**Step 3: Update package.json**

Update the `pack` script and add build config:
```json
{
  "scripts": {
    "build": "vite build && tsc -p tsconfig.electron.json",
    "start": "electron . --no-sandbox",
    "dev": "MAWQUTAN_DEV=true vite & tsc -p tsconfig.electron.json && MAWQUTAN_DEV=true electron . --no-sandbox",
    "pack": "electron-builder --linux AppImage",
    "pack:all": "electron-builder --linux AppImage --linux deb",
    "pack:mac": "electron-builder --mac",
    "pack:win": "electron-builder --win"
  }
}
```

**Step 4: Add to .gitignore**

```
release/
out/
```

**Step 5: Build to verify**

Run: `npm run build && npm run pack`
Expected: Produces a `.AppImage` in `release/` directory.

**Step 6: Commit**

```bash
git add build-config.yml package.json assets/icons/ .gitignore
git commit -m "feat: add electron-builder packaging config with icons"
```

---

### Task 4.2: Self-Host Fonts (Bundle Locally)

**Objective:** Remove external font CDN dependency. Bundle Noto Naskh Arabic and Inter fonts locally so the app works fully offline.

**Files:**
- Modify: `src/App.css` (change @import to @font-face)
- Create: `assets/fonts/` directory

**Step 1: Download fonts**

```bash
cd ~/Projects/mawqutan
mkdir -p assets/fonts

# Download Noto Naskh Arabic (Regular, Bold)
curl -L -o assets/fonts/NotoNaskhArabic-Regular.ttf \
  "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf"

curl -L -o assets/fonts/NotoNaskhArabic-Bold.ttf \
  "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Bold.ttf"

# Download Inter (Light, Regular, Medium, SemiBold)
for weight in Light Regular Medium SemiBold; do
  curl -L -o "assets/fonts/Inter-${weight}.ttf" \
    "https://github.com/rsms/inter/raw/master/docs/font-files/Inter_${weight}.ttf"
done

echo "Fonts downloaded"
```

If downloads fail, use a fallback approach — the app still works with system fonts.

**Step 2: Update App.css**

Replace:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
```

With:
```css
@font-face {
  font-family: 'Noto Naskh Arabic';
  src: url('./assets/fonts/NotoNaskhArabic-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Noto Naskh Arabic';
  src: url('./assets/fonts/NotoNaskhArabic-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./assets/fonts/Inter-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./assets/fonts/Inter-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./assets/fonts/Inter-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('./assets/fonts/Inter-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

Note: Since Vite may not resolve assets/ paths from CSS directly, we need to make sure the fonts are in the right place for the build. The assets folder should be copied to dist. We can configure Vite to handle this:

In `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'assets/fonts/*', dest: 'fonts/' },
      ],
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
  },
});
```

Or simpler: put fonts in `public/fonts/` which Vite copies automatically:

```bash
mkdir -p public/fonts
mv assets/fonts/* public/fonts/
rmdir assets/fonts
```

Then in CSS:
```css
@font-face {
  src: url('./fonts/NotoNaskhArabic-Regular.ttf') format('truetype');
}
```

**Step 3: Build to verify**

Run: `npm run build`
Expected: Build succeeds with fonts bundled.

**Step 4: Commit**

```bash
git add public/fonts/ src/App.css package.json
git commit -m "feat: self-host fonts for offline support"
```

---

### Task 4.3: Add ESLint and Prettier Config

**Objective:** Set up code quality tooling for consistency.

**Files:**
- Create: `.eslintrc.json`
- Create: `.prettierrc`
- Modify: `package.json` (add lint script)

**Step 1: Create config files**

`.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "node": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "ignorePatterns": ["dist/", "dist-electron/", "node_modules/", "release/"]
}
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Step 2: Update package.json**

```json
"scripts": {
  "lint": "eslint src/ electron/",
  "lint:fix": "eslint src/ electron/ --fix",
  "format": "prettier --write 'src/**/*.{ts,tsx,css}' 'electron/**/*.ts'",
  "format:check": "prettier --check 'src/**/*.{ts,tsx,css}' 'electron/**/*.ts'"
}
```

**Step 3: Commit**

```bash
git add .eslintrc.json .prettierrc package.json
git commit -m "chore: add ESLint and Prettier config"
```

---

## Phase 5 — Polish & Features

### Task 5.1: Add Hijri Date Display

**Objective:** Show the current Hijri date next to the Gregorian date on the Prayer Times screen.

**Files:**
- Modify: `package.json` (add hijri date library)
- Modify: `src/screens/PrayerTimes.tsx` (display Hijri date)

**Step 1: Install a lightweight Hijri date library**

```bash
cd ~/Projects/mawqutan
npm install hijri-date
```

Or use a simpler approach with a small utility since we don't need a full library:

Create `src/utils/hijri.ts`:
```ts
// Simple Hijri date calculation based on Umm Al-Qura approximation
// This is a simplified version — for production use, consider a proper library

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export function getHijriDate(): { day: number; month: string; year: number } {
  const now = new Date();
  // Approximate Hijri date calculation
  // Based on: https://github.com/ds300/hijri-date/blob/master/src/index.ts
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100))) / 4 +
    day - 32075;
  
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - Math.min(1, Math.floor(Math.floor(l2 % 354 + 1) / 355) + Math.floor(l2 / 355) * Math.floor(l2 / 355))) / 5316) *
    Math.floor((l2 * 50) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - j;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = Math.floor(30 * n + j - 30);
  
  return {
    day: d,
    month: HIJRI_MONTHS[m - 1] || '',
    year: y,
  };
}
```

**Step 2: Add Hijri date to PrayerTimes**

In `src/screens/PrayerTimes.tsx`:
```tsx
import { getHijriDate } from '../utils/hijri';

// Inside the component:
const hijri = getHijriDate();
```

Add to the returned JSX:
```tsx
<div className="prayer-date">
  {dateStr}
  <div className="prayer-hijri">
    {hijri.day} {hijri.month} {hijri.year} هـ
  </div>
</div>
```

Add CSS in `src/App.css`:
```css
.prayer-hijri {
  font-size: 0.8rem;
  color: #5a5470;
  margin-top: 0.2rem;
  font-family: 'Noto Naskh Arabic', serif;
}
```

**Step 3: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/utils/hijri.ts src/screens/PrayerTimes.tsx src/App.css
git commit -m "feat: add Hijri date display"
```

---

### Task 5.2: Expand Cities List / Make Dynamic

**Objective:** Add more cities and make it easier to add them without editing source code. For now, expand the list significantly.

**Files:**
- Modify: `src/screens/RegionSelect.tsx` (add more cities)

**Step 1: Expand CITIES array**

Replace the CITIES array with a much larger one covering all Algerian wilayas (58) plus major world cities:

```tsx
const CITIES = [
  // Algeria — all 58 wilayas
  { name: 'أدرار (Adrar)', lat: 27.8742, lng: -0.2939 },
  { name: 'الشلف (Chlef)', lat: 36.1647, lng: 1.3317 },
  { name: 'الأغواط (Laghouat)', lat: 33.8, lng: 2.8833 },
  { name: 'أم البواقي (Oum El Bouaghi)', lat: 35.8756, lng: 7.1136 },
  { name: 'باتنة (Batna)', lat: 35.555, lng: 6.1741 },
  { name: 'بجاية (Béjaïa)', lat: 36.75, lng: 5.0667 },
  { name: 'بسكرة (Biskra)', lat: 34.85, lng: 5.7333 },
  { name: 'بشار (Béchar)', lat: 31.6167, lng: -2.2167 },
  { name: 'البليدة (Blida)', lat: 36.4722, lng: 2.8283 },
  { name: 'البويرة (Bouira)', lat: 36.3667, lng: 3.9 },
  { name: 'تمنراست (Tamanrasset)', lat: 22.785, lng: 5.5228 },
  { name: 'تبسة (Tébessa)', lat: 35.4, lng: 8.1167 },
  { name: 'تلمسان (Tlemcen)', lat: 34.8783, lng: -1.315 },
  { name: 'تيارت (Tiaret)', lat: 35.3667, lng: 1.3167 },
  { name: 'تيزي وزو (Tizi Ouzou)', lat: 36.7167, lng: 4.05 },
  { name: 'الجزائر (Algiers)', lat: 36.7538, lng: 3.0588 },
  { name: 'الجلفة (Djelfa)', lat: 34.6667, lng: 3.25 },
  { name: 'جيجل (Jijel)', lat: 36.8167, lng: 5.7667 },
  { name: 'سطيف (Sétif)', lat: 36.19, lng: 5.41 },
  { name: 'سعيدة (Saïda)', lat: 34.8333, lng: 0.15 },
  { name: 'سكيكدة (Skikda)', lat: 36.8667, lng: 6.9 },
  { name: 'سيدي بلعباس (Sidi Bel Abbès)', lat: 35.2, lng: -0.6333 },
  { name: 'عنابة (Annaba)', lat: 36.9, lng: 7.7667 },
  { name: 'قالمة (Guelma)', lat: 36.4667, lng: 7.4333 },
  { name: 'قسنطينة (Constantine)', lat: 36.365, lng: 6.6147 },
  { name: 'المدية (Médéa)', lat: 36.2667, lng: 2.75 },
  { name: 'مستغانم (Mostaganem)', lat: 35.9333, lng: 0.0833 },
  { name: 'مسيلة (M'Sila)', lat: 35.7, lng: 4.55 },
  { name: 'معسكر (Mascara)', lat: 35.4, lng: 0.1333 },
  { name: 'ورقلة (Ouargla)', lat: 31.95, lng: 5.3167 },
  { name: 'وهران (Oran)', lat: 35.699, lng: -0.633 },
  { name: 'البيض (El Bayadh)', lat: 33.6833, lng: 1.019 },
  { name: 'إليزي (Illizi)', lat: 26.5, lng: 8.4667 },
  { name: 'برج بوعريريج (Bordj Bou Arréridj)', lat: 36.0667, lng: 4.7667 },
  { name: 'بومرداس (Boumerdès)', lat: 36.7667, lng: 3.4667 },
  { name: 'الطارف (El Tarf)', lat: 36.7667, lng: 8.3167 },
  { name: 'تندوف (Tindouf)', lat: 27.6667, lng: -8.1333 },
  { name: 'تيسمسيلت (Tissemsilt)', lat: 35.6, lng: 1.8167 },
  { name: 'الوادي (El Oued)', lat: 33.3667, lng: 6.8667 },
  { name: 'خنشلة (Khenchela)', lat: 35.4333, lng: 7.1333 },
  { name: 'سوق أهراس (Souk Ahras)', lat: 36.2833, lng: 7.95 },
  { name: 'تيبازة (Tipaza)', lat: 36.6, lng: 2.45 },
  { name: 'ميلة (Mila)', lat: 36.45, lng: 6.2667 },
  { name: 'عين الدفلى (Aïn Defla)', lat: 36.2667, lng: 1.9667 },
  { name: 'النعامة (Naâma)', lat: 33.2667, lng: -0.3167 },
  { name: 'عين تموشنت (Aïn Témouchent)', lat: 35.3, lng: -1.1333 },
  { name: 'غرداية (Ghardaïa)', lat: 32.4833, lng: 3.6667 },
  { name: 'غليزان (Relizane)', lat: 35.7333, lng: 0.55 },
  { name: 'المغير (El M'Ghair)', lat: 33.95, lng: 5.9333 },
  { name: 'المنيعة (El Meniaa)', lat: 30.5833, lng: 2.8833 },
  { name: 'أولاد جلال (Ouled Djellal)', lat: 34.4333, lng: 5.0667 },
  { name: 'بني عباس (Béni Abbès)', lat: 30.0833, lng: -2.1 },
  { name: 'عين صالح (Aïn Salah)', lat: 27.2, lng: 2.4833 },
  { name: 'عين قزام (Aïn Guezzam)', lat: 19.5667, lng: 0.75 },
  { name: 'تقرت (Touggourt)', lat: 33.1, lng: 6.0667 },
  { name: 'جانت (Djanet)', lat: 24.55, lng: 9.4833 },
  { name: 'برج باجي مختار (Bordj Badji Mokhtar)', lat: 21.3333, lng: 0.95 },
  { name: 'تيميمون (Timimoun)', lat: 29.25, lng: 0.2333 },
  
  // Holy cities
  { name: 'مكة (Makkah)', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة (Madinah)', lat: 24.4672, lng: 39.6112 },
  
  // Major world cities
  { name: 'القاهرة (Cairo)', lat: 30.0444, lng: 31.2357 },
  { name: 'دبي (Dubai)', lat: 25.2048, lng: 55.2708 },
  { name: 'الرياض (Riyadh)', lat: 24.7136, lng: 46.6753 },
  { name: 'دمشق (Damascus)', lat: 33.5138, lng: 36.2765 },
  { name: 'بغداد (Baghdad)', lat: 33.3152, lng: 44.3661 },
  { name: 'عمان (Amman)', lat: 31.9454, lng: 35.9284 },
  { name: 'القدس (Jerusalem)', lat: 31.7683, lng: 35.2137 },
  { name: 'تونس (Tunis)', lat: 36.8065, lng: 10.1815 },
  { name: 'الرباط (Rabat)', lat: 34.0209, lng: -6.8416 },
  { name: 'نواكشوط (Nouakchott)', lat: 18.0735, lng: -15.9582 },
  { name: 'طرابلس (Tripoli)', lat: 32.8872, lng: 13.1913 },
  { name: 'الخرطوم (Khartoum)', lat: 15.5007, lng: 32.5599 },
  { name: 'إسطنبول (Istanbul)', lat: 41.0082, lng: 28.9784 },
  { name: 'كوالالمبور (Kuala Lumpur)', lat: 3.139, lng: 101.6869 },
  { name: 'جاكرتا (Jakarta)', lat: -6.2088, lng: 106.8456 },
  { name: 'باريس (Paris)', lat: 48.8566, lng: 2.3522 },
  { name: 'لندن (London)', lat: 51.5074, lng: -0.1278 },
  { name: 'نيويورك (New York)', lat: 40.7128, lng: -74.006 },
  { name: 'طوكيو (Tokyo)', lat: 35.6762, lng: 139.6503 },
];
```

**Step 2: Add search/filter to city select**

For UX, add a search input above the select since the list is now long:

```tsx
const [citySearch, setCitySearch] = useState('');

// Filter cities based on search
const filteredCities = CITIES.filter(c => 
  c.name.toLowerCase().includes(citySearch.toLowerCase())
);

// In the city mode UI:
{mode === 'city' ? (
  <div className="region-city-picker">
    <input
      className="region-input"
      placeholder="ابحث عن مدينة..."
      value={citySearch}
      onChange={(e) => setCitySearch(e.target.value)}
      type="text"
    />
    <select 
      className="region-select" 
      value={selectedIdx} 
      onChange={(e) => setSelectedIdx(e.target.value)}
      size={Math.min(filteredCities.length, 8)}
      style={{ height: 'auto' }}
    >
      {filteredCities.map((c, i) => (
        <option key={i} value={i}>
          {c.name}
        </option>
      ))}
    </select>
  </div>
) : (...)}
```

**Step 3: Build to verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/screens/RegionSelect.tsx
git commit -m "feat: expand to 75+ cities with search filter"
```

---

### Task 5.3: Add Auto-Start on Boot

**Objective:** Option to launch Mawqutan on system startup.

**Files:**
- Modify: `electron/main.ts` (register auto-start)
- Modify: `src/App.tsx` or create a settings screen (toggle)

**Step 1: Add auto-start in main process**

In `electron/main.ts`, add:
```ts
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';

ipcMain.on('set-auto-start', (_event, enabled: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe'),
  });
});

ipcMain.handle('get-auto-start', () => {
  return app.getLoginItemSettings().openAtLogin;
});
```

**Step 2: Expose in preload**

In `electron/preload.ts`:
```ts
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods
  setAutoStart: (enabled: boolean) => ipcRenderer.send('set-auto-start', enabled),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
});
```

**Step 3: Add toggle in PrayerTimes screen (simple version)**

In `src/screens/PrayerTimes.tsx`, add a settings gear button that toggles auto-start:

```tsx
const [autoStart, setAutoStart] = useState(false);

useEffect(() => {
  window.electronAPI?.getAutoStart().then(setAutoStart);
}, []);

const toggleAutoStart = () => {
  const next = !autoStart;
  setAutoStart(next);
  window.electronAPI?.setAutoStart(next);
};
```

Add a small settings icon in the header.

**Step 4: Commit**

```bash
git add electron/main.ts electron/preload.ts src/screens/PrayerTimes.tsx
git commit -m "feat: add auto-start on boot option"
```

---

## Execution Summary

Ordered phases for implementation:

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| 1: Core Fixes | 1.1-1.3 | ~20 min | 🔴 Critical |
| 2: Tray & Window | 2.1-2.2 | ~40 min | 🔴 Critical |
| 3: Audio | 3.1 | ~25 min | 🟡 High |
| 4: Packaging | 4.1-4.3 | ~45 min | 🟡 High |
| 5: Polish | 5.1-5.3 | ~40 min | 🟢 Medium |

**Total estimated implementation time: ~3 hours**

---

## Verification Checklist

After all phases complete:

- [ ] `npm run build` — 0 errors
- [ ] `npm run pack` — produces .AppImage
- [ ] App launches with tray icon
- [ ] Minimize → hides to tray
- [ ] Close → hides to tray
- [ ] Double-click tray → shows window
- [ ] Prayer time → timer appears, window stays on top
- [ ] Adhan plays at prayer time
- [ ] Alt+F4 is blocked during timer
- [ ] Timer expires → returns to prayer times
- [ ] Fajr before Fajr time → shows "الصلاة القادمة" (not "غداً")
- [ ] After Isha → shows "غداً" for Fajr
- [ ] Hijri date visible on prayer screen
- [ ] City search works
- [ ] Fonts load without internet
- [ ] ErrorBoundary catches crashes
- [ ] Auto-start toggle works
