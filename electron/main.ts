import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { IPC } from './ipc-channels';

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let isTimerActive = false;
let prevBounds: Electron.Rectangle | null = null;

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

  // Close button → hide to tray unless user explicitly quit
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

  // Restore window bounds after leaving fullscreen
  win.on('leave-full-screen', () => {
    if (prevBounds && !isTimerActive) {
      win?.setBounds(prevBounds);
      prevBounds = null;
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
      click: () => {
        if (!isTimerActive) win?.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'خروج / Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('مَوْقُوتًا — Mawqūtan');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    win?.show();
    win?.focus();
  });
}

function playAdhan(): void {
  const audioPath = path.join(__dirname, '../assets/adhan.mp3');
  if (!fs.existsSync(audioPath)) {
    win?.webContents.send(IPC.ADHAN_FAILED);
    return;
  }

  const players = [
    { cmd: `ffplay -nodisp -autoexit "${audioPath}"`, name: 'ffplay' },
    { cmd: `paplay "${audioPath}"`, name: 'paplay' },
    { cmd: `aplay "${audioPath}"`, name: 'aplay' },
  ];

  let tried = 0;

  function tryNext(): void {
    if (tried >= players.length) {
      // All players failed — notify renderer
      win?.webContents.send(IPC.ADHAN_FAILED);
      return;
    }

    const player = players[tried++];
    exec(player.cmd, (err) => {
      if (err) tryNext();
    });
  }

  tryNext();
}

function showPrayerNotification(prayerNameAr: string): void {
  const notification = new Notification({
    title: 'مَوْقُوتًا',
    body: `حان وقت صلاة ${prayerNameAr}`,
    silent: true, // We play adhan separately
  });
  notification.show();
}

// ── IPC Handlers ──

ipcMain.on(IPC.MINIMIZE, (event) => {
  if (!isTimerActive) {
    BrowserWindow.fromWebContents(event.sender)?.hide();
  }
});

ipcMain.on(IPC.CLOSE, (event) => {
  // During active timer, the window cannot be closed or hidden at all
  // The user must wait for the timer to finish
  if (!isTimerActive) {
    BrowserWindow.fromWebContents(event.sender)?.hide();
  }
});

ipcMain.on(IPC.QUIT, () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on(IPC.SET_TIMER_ACTIVE, (_event, active: boolean) => {
  isTimerActive = active;
  if (active && win) {
    prevBounds = win.getBounds();
    win.show();
    win.focus();
    // Layer 1: Fullscreen takeover
    win.setFullScreen(true);
    win.setKiosk(true);
    win.setResizable(false);
    win.setMovable(false);
    win.setAlwaysOnTop(true, 'screen-saver');

    // Layer 2: Global shortcut block (works on X11, best-effort on Wayland)
    try {
      const keys = ['Escape', 'F11', 'Alt+Tab', 'Alt+Escape', 'Super', 'Super+Tab', 'Super+Escape', 'Alt+F2', 'Alt+Space'];
      keys.forEach((key) => {
        globalShortcut.register(key, () => {});
      });
    } catch {
      // globalShortcut unavailable on Wayland — non-critical
    }

    // Layer 3: Inject keyboard trap into renderer
    win.webContents.executeJavaScript(`
      (function() {
        if (window.__timerInputBlocked) return;
        window.__timerInputBlocked = true;
        window.__timerBlockKeys = function(e) {
          const blocked = ['Escape', 'F11', 'F1', 'Tab', 'Meta', 'Alt'];
          if (blocked.includes(e.key) || e.altKey || e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        };
        document.addEventListener('keydown', window.__timerBlockKeys, true);
      })();
    `, false);
  } else if (!active && win) {
    // Remove all layers
    win.setKiosk(false);
    win.setFullScreen(false);
    win.setResizable(true);
    win.setMovable(true);
    win.setAlwaysOnTop(false);
    globalShortcut.unregisterAll();

    // Remove keyboard trap from renderer
    win.webContents.executeJavaScript(`
      if (window.__timerBlockKeys) {
        document.removeEventListener('keydown', window.__timerBlockKeys, true);
        window.__timerBlockKeys = null;
      }
      window.__timerInputBlocked = false;
    `, false);
  }
});

ipcMain.on(IPC.PLAY_ADHAN, () => playAdhan());

ipcMain.on(IPC.SET_AUTO_START, (_event, enabled: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
  });
});

ipcMain.handle(IPC.GET_AUTO_START, () => {
  return app.getLoginItemSettings().openAtLogin;
});

// ── App Lifecycle ──

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  // Don't quit — tray keeps running
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  win?.show();
});

// Prevent quit during active timer
app.on('before-quit', (event) => {
  if (isTimerActive) {
    event.preventDefault();
  }
});
