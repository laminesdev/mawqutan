import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from './ipc-channels';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send(IPC.MINIMIZE),
  close: () => ipcRenderer.send(IPC.CLOSE),
  quit: () => ipcRenderer.send(IPC.QUIT),
  setTimerActive: (active: boolean) => ipcRenderer.send(IPC.SET_TIMER_ACTIVE, active),
  playAdhan: () => ipcRenderer.send(IPC.PLAY_ADHAN),
  onAdhanFailed: (cb: () => void) => ipcRenderer.on(IPC.ADHAN_FAILED, cb),
  setAutoStart: (enabled: boolean) => ipcRenderer.send(IPC.SET_AUTO_START, enabled),
  getAutoStart: () => ipcRenderer.invoke(IPC.GET_AUTO_START),
});
