import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let win: BrowserWindow | null = null;
let tray: Tray | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _app = app as any;
_app.isQuitting = false;

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
    if (!_app.isQuitting) {
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
        _app.isQuitting = true;
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

// IPC handlers
ipcMain.on('minimize-window', (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  bw?.hide();
});

ipcMain.on('close-window', (event) => {
  const bw = BrowserWindow.fromWebContents(event.sender);
  bw?.hide();
});

ipcMain.on('quit-app', () => {
  _app.isQuitting = true;
  app.quit();
});

let isTimerActive = false;

ipcMain.on('set-timer-active', (_event, active: boolean) => {
  isTimerActive = active;
  if (active && win) {
    win.show();
    win.focus();
    win.setAlwaysOnTop(true, 'screen-saver');
  } else if (!active && win) {
    win.setAlwaysOnTop(false);
  }
});

function playAdhan() {
  const audioPath = path.join(__dirname, '../assets/adhan.mp3');
  if (!fs.existsSync(audioPath)) return;

  const players = [
    `ffplay -nodisp -autoexit "${audioPath}"`,
    `paplay "${audioPath}"`,
    `aplay "${audioPath}"`,
  ];

  for (const cmd of players) {
    try {
      exec(cmd, (err) => {
        if (err) {
          // try next player
          return;
        }
      });
      break; // first one that doesn't throw immediately
    } catch {
      continue;
    }
  }
}

ipcMain.on('play-adhan', () => playAdhan());

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
