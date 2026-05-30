import { PrayerTimes, Coordinates, CalculationMethod, CalculationParameters } from 'adhan';

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_ORDER: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PRAYER_NAMES_AR: Record<string, string> = {
  'Fajr': 'الفجر',
  'Dhuhr': 'الظهر',
  'Asr': 'العصر',
  'Maghrib': 'المغرب',
  'Isha': 'العشاء',
};

export const CALC_METHODS: Record<string, CalculationParameters> = {
  'MWL': CalculationMethod.MuslimWorldLeague(),
  'ISNA': CalculationMethod.NorthAmerica(),
  'Egypt': CalculationMethod.Egyptian(),
  'UmmAlQura': CalculationMethod.UmmAlQura(),
  'Karachi': CalculationMethod.Karachi(),
};

export const CALC_METHOD_NAMES: Record<string, string> = {
  'MWL': 'رابطة العالم الإسلامي',
  'ISNA': 'الجمعية الإسلامية لأمريكا الشمالية',
  'Egypt': 'الهيئة المصرية العامة للمساحة',
  'UmmAlQura': 'أم القرى',
  'Karachi': 'جامعة العلوم الإسلامية، كراتشي',
};

export function getCalcMethod(key: string): CalculationParameters {
  return CALC_METHODS[key] || CalculationMethod.MuslimWorldLeague();
}

export interface PrayerInfo {
  key: PrayerKey;
  nameAr: string;
  time: Date;
}
