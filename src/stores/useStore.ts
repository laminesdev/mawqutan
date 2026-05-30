import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      activateTimer: (name, nameAr) =>
        set({
          timer: {
            active: true,
            prayerName: name,
            prayerNameAr: nameAr,
            endAt: Date.now() + 300000,
          },
        }),
      deactivateTimer: () => set({ timer: { ...defaultTimer } }),
    }),
    {
      name: 'mawqutan-settings',
      partialize: (state) => ({
        region: state.region,
      }),
    }
  )
);
