import { useEffect, useMemo, useState } from 'react';
import { Coordinates, PrayerTimes } from 'adhan';
import { useStore } from './stores/useStore';
import { getCalcMethod, PRAYER_ORDER, PRAYER_NAMES_AR, PrayerInfo, CALC_METHOD_NAMES } from './utils/prayerTimes';
import RegionSelect from './screens/RegionSelect';
import PrayerTimesScreen from './screens/PrayerTimes';
import TimerScreen from './screens/Timer';
import ErrorBoundary from './components/ErrorBoundary';
import TitleBar from './components/TitleBar';

export default function App() {
  const region = useStore((s) => s.region);
  const timer = useStore((s) => s.timer);
  const activateTimer = useStore((s) => s.activateTimer);
  const showSettings = useStore((s) => s.showSettings);
  const showToast = useStore((s) => s.showToast);
  const dismissToast = useStore((s) => s.dismissToast);
  const toast = useStore((s) => s.toast);

  // Tick to recalculate at midnight / every minute
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

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

  // Monitor prayer times — activate timer when within 5-min window
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

  return (
    <ErrorBoundary>
      <TitleBar />
      {(!region || showSettings) && <RegionSelect />}
      {region && timer.active && <TimerScreen />}
      {region && !timer.active && !showSettings && <PrayerTimesScreen prayers={prayers} />}
      {toast && (
        <div className="toast" onClick={dismissToast}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2"
            strokeLinecap="round">
            <path d="M12 2L12 8M12 16L12 22M2 12L8 12M16 12L22 12M4.5 4.5L8.5 8.5M15.5 15.5L19.5 19.5M4.5 19.5L8.5 15.5M15.5 8.5L19.5 4.5"/>
          </svg>
          <div className="toast-text">
            <span>حان وقت صلاة {toast.nameAr}</span>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
