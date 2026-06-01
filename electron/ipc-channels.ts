/** Shared IPC channel names for type-safe communication */
export const IPC = {
  MINIMIZE: 'minimize-window',
  CLOSE: 'close-window',
  QUIT: 'quit-app',
  SET_TIMER_ACTIVE: 'set-timer-active',
  PLAY_ADHAN: 'play-adhan',
  ADHAN_FAILED: 'adhan-failed',
  SET_AUTO_START: 'set-auto-start',
  GET_AUTO_START: 'get-auto-start',
  SHOW_NOTIFICATION: 'show-notification',
  SELECT_ADHAN: 'select-adhan',
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
