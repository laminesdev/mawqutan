import { create } from 'zustand';
import { persist } from 'zustand/middleware';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      close: () => void;
      quit: () => void;
      setTimerActive: (active: boolean) => void;
      playAdhan: () => void;
      setAutoStart: (enabled: boolean) => void;
      getAutoStart: () => Promise<boolean>;
    };
  }
}

export interface RegionConfig {
  cityName: string;
  latitude: number;
  longitude: number;
  calculationMethod: string;
}

export interface TimerState {
  active: boolean;
  prayerName: string;
  prayerNameAr: string;
  endAt: number;
}

interface AppState {
  region: RegionConfig | null;
  setRegion: (r: RegionConfig) => void;
  timer: TimerState;
  activateTimer: (name: string, nameAr: string) => void;
  deactivateTimer: () => void;
}

const defaultTimer: TimerState = {
  active: false,
  prayerName: '',
  prayerNameAr: '',
  endAt: 0,
};

const defaultState = {
  region: null as RegionConfig | null,
  timer: { ...defaultTimer },
  setRegion: (_r: RegionConfig) => {},
  activateTimer: (_name: string, _nameAr: string) => {},
  deactivateTimer: () => {},
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      region: null,
      setRegion: (r) => set({ region: r }),
      timer: { ...defaultTimer },
      activateTimer: (name, nameAr) => {
        window.electronAPI?.setTimerActive(true);
        window.electronAPI?.playAdhan();
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
    }),
    {
      name: 'mawqutan-settings',
      partialize: (state) => ({
        region: state.region,
      }),
    }
  )
);
