export type { ElectronAPI } from './electron';

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

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

export interface PrayerInfo {
  key: PrayerKey;
  nameAr: string;
  time: Date;
}
