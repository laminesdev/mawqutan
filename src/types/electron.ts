export interface ElectronAPI {
  minimize: () => void;
  close: () => void;
  quit: () => void;
  setTimerActive: (active: boolean) => void;
  playAdhan: () => void;
  setAutoStart: (enabled: boolean) => void;
  getAutoStart: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
