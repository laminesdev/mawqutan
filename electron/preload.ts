import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  quit: () => ipcRenderer.send('quit-app'),
  setTimerActive: (active: boolean) => ipcRenderer.send('set-timer-active', active),
  playAdhan: () => ipcRenderer.send('play-adhan'),
  setAutoStart: (enabled: boolean) => ipcRenderer.send('set-auto-start', enabled),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
});
