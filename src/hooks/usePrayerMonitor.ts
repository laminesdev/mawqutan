import { useEffect, useMemo, useState } from 'react';
import { Coordinates, PrayerTimes } from 'adhan';
import { useStore } from '../stores/useStore';
import { getCalcMethod, PRAYER_ORDER, PRAYER_NAMES_AR } from '../utils/prayerTimes';
import type { PrayerInfo } from '../types';

export function usePrayerMonitor() {
  const region = useStore((s) => s.region);
  const timer = useStore((s) => s.timer);
  const activateTimer = useStore((s) => s.activateTimer);
  const showToast = useStore((s) => s.showToast);
  const dismissToast = useStore((s) => s.dismissToast);

  // 1-minute tick for recalculating at midnight
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Calculate prayer times
  const prayers: PrayerInfo[] = useMemo(() => {
    if (!region) return [];
    try {
      const coords = new Coordinates(region.latitude, region.longitude);
      const params = getCalcMethod(region.calculationMethod);
      const pt = new PrayerTimes(coords, new Date(tick), params);
      const propMap: Record<string, keyof PrayerTimes> = {
        Fajr: 'fajr', Dhuhr: 'dhuhr', Asr: 'asr',
        Maghrib: 'maghrib', Isha: 'isha',
      };
      return PRAYER_ORDER.map((key) => ({
        key,
        nameAr: PRAYER_NAMES_AR[key],
        time: pt[propMap[key]] as Date,
      }));
    } catch {
      return [];
    }
  }, [region, tick]);

  // Monitor — activate timer + toast when within 5-min window
  useEffect(() => {
    if (prayers.length === 0) return;
    const check = () => {
      if (timer.active) return;
      const now = Date.now();
      for (const p of prayers) {
        const diff = now - p.time.getTime();
        if (diff >= 0 && diff <= 300000) {
          activateTimer(p.key, p.nameAr);
          showToast(p.nameAr);
          setTimeout(() => dismissToast(), 6000);
          return;
        }
      }
    };
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, [prayers, timer.active, activateTimer]);

  return prayers;
}
