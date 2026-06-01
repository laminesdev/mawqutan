interface ElectronAPI {
  minimize: () => void;
  close: () => void;
  quit: () => void;
  setTimerActive: (active: boolean) => void;
  playAdhan: () => void;
  onAdhanFailed: (cb: () => void) => void;
  setAutoStart: (enabled: boolean) => void;
  getAutoStart: () => Promise<boolean>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
